from django.contrib import admin
from .models import Property, HouseUnit


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['name', 'landlord', 'property_type', 'area', 'city', 'total_units', 'available_units', 'created_at']
    list_filter = ['property_type', 'city', 'area']
    search_fields = ['name', 'address', 'landlord__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(HouseUnit)
class HouseUnitAdmin(admin.ModelAdmin):
    list_display = ['unit_number', 'property', 'bedrooms', 'bathrooms', 'rent_amount', 'status', 'created_at']
    list_filter = ['status', 'bedrooms', 'bathrooms']
    search_fields = ['unit_number', 'property__name']
    readonly_fields = ['created_at', 'updated_at']

