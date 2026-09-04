from rest_framework import serializers
from .models import Payment, PaymentGatewayLog


class PaymentSerializer(serializers.ModelSerializer):
    tenant_name = serializers.SerializerMethodField()
    property_name = serializers.CharField(source='rental_agreement.house_unit.property.name', read_only=True)
    unit_number = serializers.CharField(source='rental_agreement.house_unit.unit_number', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'rental_agreement', 'tenant_name', 'property_name', 'unit_number',
                  'amount', 'due_date', 'payment_date', 'status', 'payment_method', 
                  'transaction_reference', 'gateway_transaction_id', 'notes', 'receipt_url',
                  'is_overdue', 'created_at', 'updated_at']
        read_only_fields = ['id', 'payment_date', 'created_at', 'updated_at']
    
    def get_tenant_name(self, obj):
        tenant = obj.rental_agreement.tenant
        return tenant.user.get_full_name()


class PaymentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for payment lists"""
    tenant_email = serializers.CharField(source='rental_agreement.tenant.user.email', read_only=True)
    property_name = serializers.CharField(source='rental_agreement.house_unit.property.name', read_only=True)
    unit_number = serializers.CharField(source='rental_agreement.house_unit.unit_number', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'tenant_email', 'property_name', 'unit_number', 'amount', 'due_date', 
                  'payment_date', 'status', 'payment_method', 'is_overdue']


class RecordPaymentSerializer(serializers.Serializer):
    """Serializer for manually recording a payment"""
    payment_method = serializers.ChoiceField(choices=Payment.PaymentMethod.choices)
    transaction_reference = serializers.CharField(max_length=200, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)


class InitiatePaymentSerializer(serializers.Serializer):
    """Serializer for initiating a ClickPesa USSD-Push payment"""
    payment_gateway = serializers.ChoiceField(choices=['CLICKPESA'], default='CLICKPESA')
    callback_url = serializers.URLField(required=False)


class PaymentGatewayLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentGatewayLog
        fields = ['id', 'payment', 'gateway', 'transaction_id', 'request_data', 
                  'response_data', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']
