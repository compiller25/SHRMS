from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django.http import HttpResponse
from .models import Payment, PaymentGatewayLog
from .serializers import (PaymentSerializer, PaymentListSerializer, RecordPaymentSerializer,
                          InitiatePaymentSerializer, PaymentGatewayLogSerializer)
from .services import ClickPesaService, ClickPesaException
from .invoice import generate_payment_invoice
from .report import generate_payment_report


class PaymentViewSet(viewsets.ModelViewSet):
    """Payment CRUD operations"""
    queryset = Payment.objects.select_related('rental_agreement', 'rental_agreement__tenant',
                                               'rental_agreement__house_unit__property')
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PaymentListSerializer
        return PaymentSerializer
    
    def get_queryset(self):
        """Filter payments based on user role"""
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'LANDLORD':
            # Landlords see payments for their properties
            return queryset.filter(rental_agreement__house_unit__property__landlord__user=user)
        elif user.role == 'TENANT':
            # Tenants see only their payments
            return queryset.filter(rental_agreement__tenant__user=user)
        
        # Admins see all
        return queryset
    
    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        """Manually record a payment (landlord only)"""
        payment = self.get_object()
        
        # Check if user is the landlord
        if payment.rental_agreement.landlord.user != request.user:
            return Response({'error': 'Only landlord can record payments'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if payment.status == Payment.PaymentStatus.COMPLETED:
            return Response({'error': 'Payment already recorded'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RecordPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        payment.mark_as_paid(
            payment_method=serializer.validated_data['payment_method'],
            transaction_ref=serializer.validated_data.get('transaction_reference', '')
        )
        payment.notes = serializer.validated_data.get('notes', '')
        payment.save()
        
        return Response({
            'message': 'Payment recorded successfully',
            'payment': PaymentSerializer(payment).data
        })
    
    @action(detail=True, methods=['post'])
    def initiate_payment(self, request, pk=None):
        """Initiate online payment (tenant only)"""
        payment = self.get_object()
        
        # Check if user is the tenant
        if payment.rental_agreement.tenant.user != request.user:
            return Response({'error': 'You can only pay your own bills'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if payment.status == Payment.PaymentStatus.COMPLETED:
            return Response({'error': 'Payment already completed'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone_number = payment.rental_agreement.tenant.user.phone or ''

        service = ClickPesaService()
        try:
            result = service.initiate_ussd_push(payment, phone_number)
        except ClickPesaException as e:
            return Response({
                'error': e.data.get('message', str(e))
            }, status=e.status_code or status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': 'USSD-PUSH sent. Check your phone and enter your PIN.',
            'status': result['status'],
            'transaction_id': result['transaction_id']
        })

    @action(detail=True, methods=['get'])
    def check_status(self, request, pk=None):
        """Query ClickPesa for the latest status of a payment (polling fallback)."""
        payment = self.get_object()

        if not payment.transaction_reference:
            return Response({
                'status': payment.status,
                'paid': payment.status == Payment.PaymentStatus.COMPLETED,
            })

        try:
            result = ClickPesaService().check_payment_status(payment)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(result)

    @action(detail=False, methods=['get'])
    def my_payments(self, request):
        """Get tenant's payment history"""
        if request.user.role != 'TENANT':
            raise PermissionDenied('Only tenants can view their payments')
        
        payments = self.get_queryset().filter(rental_agreement__tenant__user=request.user)
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def report(self, request):
        """Landlord-only PDF report of all payments for their properties.

        Optional query params: ?status=PENDING&from=YYYY-MM-DD&to=YYYY-MM-DD
        """
        if request.user.role != 'LANDLORD':
            raise PermissionDenied('Only landlords can generate reports')

        queryset = self.get_queryset()

        status_f = (request.query_params.get('status') or '').upper()
        from_d = request.query_params.get('from')
        to_d = request.query_params.get('to')
        if status_f:
            if status_f not in dict(Payment.PaymentStatus.choices):
                raise ValidationError('Invalid status filter')
            queryset = queryset.filter(status=status_f)
        if from_d:
            queryset = queryset.filter(due_date__gte=from_d)
        if to_d:
            queryset = queryset.filter(due_date__lte=to_d)

        pdf = generate_payment_report(queryset.select_related(
            'rental_agreement__tenant__user', 'rental_agreement__house_unit__property'), request.user)
        response = HttpResponse(pdf.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="payment-report.pdf"'
        return response

    @action(detail=True, methods=['get'])
    def invoice(self, request, pk=None):
        """Download a PDF invoice/receipt for a payment (owner or landlord)."""
        payment = self.get_object()
        pdf = generate_payment_invoice(payment)
        response = HttpResponse(pdf.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice-{payment.id}.pdf"'
        return response

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue payments"""
        overdue_payments = self.get_queryset().filter(
            status=Payment.PaymentStatus.PENDING,
            due_date__lt=timezone.now().date()
        )
        
        # Update status to overdue
        for payment in overdue_payments:
            payment.check_overdue()
        
        serializer = self.get_serializer(overdue_payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get payment statistics (landlord only)"""
        if request.user.role != 'LANDLORD':
            raise PermissionDenied('Only landlords can view statistics')
        
        queryset = self.get_queryset()
        
        total_revenue = queryset.filter(status='COMPLETED').aggregate(Sum('amount'))['amount__sum']
        pending_amount = queryset.filter(status__in=['PENDING', 'OVERDUE']).aggregate(Sum('amount'))['amount__sum']

        stats = {
            'total_payments': queryset.count(),
            'completed_payments': queryset.filter(status='COMPLETED').count(),
            'pending_payments': queryset.filter(status='PENDING').count(),
            'overdue_payments': queryset.filter(status='OVERDUE').count(),
            'total_revenue': float(total_revenue) if total_revenue is not None else 0,
            'pending_amount': float(pending_amount) if pending_amount is not None else 0,
        }

        return Response(stats)


@api_view(['POST'])
@permission_classes([AllowAny])
def payment_webhook(request, gateway):
    """Webhook endpoint for payment gateway callbacks"""
    # Extract transaction ID from nested data if available, fallback to top level or N/A
    data_payload = request.data.get('data', {}) if isinstance(request.data, dict) else {}
    tx_id = data_payload.get('id') or request.data.get('transaction_id', 'N/A')

    # Log the webhook request
    log = PaymentGatewayLog.objects.create(
        gateway=gateway.upper(),
        transaction_id=tx_id,
        request_data=request.data,
        status='RECEIVED'
    )
    
    try:
        if gateway.lower() != 'clickpesa':
            return Response({'status': 'failed', 'error': 'Unsupported gateway'},
                          status=status.HTTP_400_BAD_REQUEST)

        service = ClickPesaService()
        result = service.process_webhook(request.data)

        log.response_data = result
        log.status = 'PROCESSED' if result['success'] else 'FAILED'
        log.save()

        if result['success']:
            return Response({'status': 'success'})
        else:
            return Response({'status': 'failed', 'error': result.get('error')},
                          status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        log.status = 'ERROR'
        log.response_data = {'error': str(e)}
        log.save()
        return Response({'status': 'error', 'message': str(e)}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

