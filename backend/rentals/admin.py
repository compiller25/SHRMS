from django.contrib import admin
from .models import RentalAgreement


@admin.register(RentalAgreement)
class RentalAgreementAdmin(admin.ModelAdmin):
    list_display = ['id', 'house_unit', 'tenant', 'start_date', 'end_date', 'monthly_rent', 'status', 'created_at']
    list_filter = ['status', 'start_date', 'end_date']
    search_fields = ['tenant__email', 'house_unit__property__name', 'house_unit__unit_number']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'start_date'

