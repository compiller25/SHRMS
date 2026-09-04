from rest_framework import serializers
from .models import RentalAgreement
from users.serializers import UserSerializer, TenantSerializer
from properties.serializers import HouseUnitSerializer


class RentalAgreementSerializer(serializers.ModelSerializer):
    tenant = TenantSerializer(read_only=True)
    house_unit = HouseUnitSerializer(read_only=True)
    landlord = serializers.SerializerMethodField()

    class Meta:
        model = RentalAgreement
        fields = ['id', 'house_unit', 'tenant', 'landlord', 'start_date', 'end_date',
                  'monthly_rent', 'deposit_amount', 'status', 'terms_conditions',
                  'signed_by_tenant', 'signed_by_landlord', 'signed_at', 'rejection_reason',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'landlord', 'status', 'created_at', 'updated_at']

    def get_landlord(self, obj):
        # Expose the landlord's identity fields the frontend already reads.
        return UserSerializer(obj.landlord.user).data


class RentalApplicationSerializer(serializers.ModelSerializer):
    """Serializer for tenant rental applications"""

    class Meta:
        model = RentalAgreement
        fields = ['house_unit', 'start_date', 'end_date', 'terms_conditions']

    def validate_house_unit(self, value):
        """Validate that unit is available"""
        if value.status != 'AVAILABLE':
            raise serializers.ValidationError("This unit is not available for rent.")
        return value

    def validate(self, data):
        """Validate dates"""
        if data['end_date'] <= data['start_date']:
            raise serializers.ValidationError("End date must be after start date.")
        return data

    def create(self, validated_data):
        """Create application with calculated rent and deposit"""
        house_unit = validated_data['house_unit']
        validated_data['monthly_rent'] = house_unit.rent_amount
        validated_data['deposit_amount'] = house_unit.rent_amount  # 1 month deposit
        validated_data['status'] = RentalAgreement.AgreementStatus.APPLIED

        return super().create(validated_data)


class RentalAgreementListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing agreements"""
    tenant_name = serializers.SerializerMethodField()
    property_name = serializers.CharField(source='house_unit.property.name', read_only=True)
    unit_number = serializers.CharField(source='house_unit.unit_number', read_only=True)

    class Meta:
        model = RentalAgreement
        fields = ['id', 'tenant_name', 'property_name', 'unit_number', 'start_date',
                  'end_date', 'monthly_rent', 'status', 'created_at']

    def get_tenant_name(self, obj):
        return obj.tenant.user.get_full_name() or obj.tenant.user.email


class RentalApprovalSerializer(serializers.Serializer):
    """Serializer for landlord approval/rejection"""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if data['action'] == 'reject' and not data.get('rejection_reason'):
            raise serializers.ValidationError("Rejection reason is required when rejecting an application.")
        return data