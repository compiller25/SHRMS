from rest_framework import serializers
from .models import Property, HouseUnit
from users.serializers import LandlordSerializer


class HouseUnitSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source='property.name', read_only=True)
    property_address = serializers.CharField(source='property.address', read_only=True)
    landlord_email = serializers.CharField(source='property.landlord.user.email', read_only=True)

    class Meta:
        model = HouseUnit
        fields = ['id', 'property', 'property_name', 'property_address', 'landlord_email',
                  'unit_number', 'unit_type', 'bedrooms', 'bathrooms', 'square_feet', 'rent_amount',
                  'currency', 'status', 'description', 'amenities', 'floor_number',
                  'has_parking', 'has_balcony', 'image', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class HouseUnitCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HouseUnit
        fields = ['property', 'unit_number', 'unit_type', 'bedrooms', 'bathrooms', 'square_feet',
                  'rent_amount', 'currency', 'description', 'amenities', 'floor_number',
                  'has_parking', 'has_balcony', 'image']


class PropertySerializer(serializers.ModelSerializer):
    landlord = LandlordSerializer(read_only=True)
    units = HouseUnitSerializer(many=True, read_only=True)
    total_units = serializers.IntegerField(read_only=True)
    available_units = serializers.IntegerField(read_only=True)

    class Meta:
        model = Property
        fields = ['id', 'landlord', 'name', 'property_type', 'address', 'city', 'area',
                  'description', 'amenities', 'image', 'total_units', 'available_units',
                  'units', 'created_at', 'updated_at']
        read_only_fields = ['id', 'landlord', 'created_at', 'updated_at']


class PropertyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for property listings"""
    landlord_name = serializers.SerializerMethodField()
    total_units = serializers.IntegerField(read_only=True)
    available_units = serializers.IntegerField(read_only=True)
    min_rent = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = ['id', 'landlord_name', 'name', 'property_type', 'address', 'city', 'area',
                  'description', 'image', 'total_units', 'available_units', 'min_rent', 'created_at']

    def get_landlord_name(self, obj):
        return obj.landlord.user.get_full_name()

    def get_min_rent(self, obj):
        available_units = obj.units.filter(status='AVAILABLE')
        if available_units.exists():
            return available_units.order_by('rent_amount').first().rent_amount
        return None


class PropertyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ['name', 'property_type', 'address', 'city', 'area', 'description',
                  'amenities', 'image']