from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from .models import RentalAgreement
from .serializers import (RentalAgreementSerializer, RentalApplicationSerializer,
                          RentalAgreementListSerializer, RentalApprovalSerializer)
from payments.models import Payment


class RentalAgreementViewSet(viewsets.ModelViewSet):
    """Rental Agreement CRUD operations"""
    queryset = RentalAgreement.objects.select_related('house_unit', 'tenant', 'house_unit__property')
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'apply':
            return RentalApplicationSerializer
        elif self.action == 'list':
            return RentalAgreementListSerializer
        return RentalAgreementSerializer
    
    def get_queryset(self):
        """Filter agreements based on user role"""
        queryset = super().get_queryset()
        user = self.request.user

        if user.role == 'LANDLORD':
            # Landlords see agreements for their properties
            return queryset.filter(house_unit__property__landlord__user=user)
        elif user.role == 'TENANT':
            # Tenants see only their agreements
            return queryset.filter(tenant__user=user)

        # Admins see all
        return queryset
    
    @action(detail=False, methods=['post'])
    def apply(self, request):
        """Tenant applies for a rental unit"""
        if request.user.role != 'TENANT':
            return Response({'error': 'Only tenants can apply for rentals'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = RentalApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        agreement = serializer.save(tenant=request.user.tenant)
        
        return Response(
            RentalAgreementSerializer(agreement).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def process_application(self, request, pk=None):
        """Landlord approves or rejects application"""
        agreement = self.get_object()
        
        # Check if user is the landlord
        if agreement.landlord.user != request.user:
            return Response({'error': 'Only landlord can process applications'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Check if agreement is in APPLIED status
        if agreement.status != RentalAgreement.AgreementStatus.APPLIED:
            return Response({'error': 'Application has already been processed'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RentalApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        action_type = serializer.validated_data['action']
        
        if action_type == 'approve':
            agreement.status = RentalAgreement.AgreementStatus.ACTIVE
            agreement.signed_by_landlord = True
            agreement.signed_at = timezone.now()
            agreement.save()
            
            # Generate payment schedule
            self._generate_payment_schedule(agreement)
            
            return Response({
                'message': 'Application approved successfully',
                'agreement': RentalAgreementSerializer(agreement).data
            })
        else:
            agreement.status = RentalAgreement.AgreementStatus.REJECTED
            agreement.rejection_reason = serializer.validated_data.get('rejection_reason', '')
            agreement.save()
            
            return Response({
                'message': 'Application rejected',
                'agreement': RentalAgreementSerializer(agreement).data
            })
    
    @action(detail=True, methods=['post'])
    def terminate(self, request, pk=None):
        """Terminate an active agreement"""
        agreement = self.get_object()
        
        # Only landlord or tenant can terminate
        if agreement.landlord.user != request.user and agreement.tenant.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if agreement.status != RentalAgreement.AgreementStatus.ACTIVE:
            return Response({'error': 'Only active agreements can be terminated'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        agreement.status = RentalAgreement.AgreementStatus.TERMINATED
        agreement.save()
        
        return Response({
            'message': 'Agreement terminated successfully',
            'agreement': RentalAgreementSerializer(agreement).data
        })
    
    @action(detail=False, methods=['get'])
    def my_applications(self, request):
        """Get tenant's applications"""
        if request.user.role != 'TENANT':
            return Response({'error': 'Only tenants can view applications'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        applications = self.get_queryset().filter(
            tenant__user=request.user,
            status__in=['APPLIED', 'APPROVED', 'REJECTED']
        )
        serializer = self.get_serializer(applications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_applications(self, request):
        """Get landlord's pending applications"""
        if request.user.role != 'LANDLORD':
            return Response({'error': 'Only landlords can view pending applications'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        applications = self.get_queryset().filter(status='APPLIED')
        serializer = self.get_serializer(applications, many=True)
        return Response(serializer.data)
    
    def _generate_payment_schedule(self, agreement):
        """Generate monthly payment schedule for the agreement"""
        current_date = agreement.start_date
        
        while current_date <= agreement.end_date:
            Payment.objects.create(
                rental_agreement=agreement,
                amount=agreement.monthly_rent,
                due_date=current_date,
                status=Payment.PaymentStatus.PENDING
            )
            # Move to next month
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year + 1, month=1)
            else:
                current_date = current_date.replace(month=current_date.month + 1)

