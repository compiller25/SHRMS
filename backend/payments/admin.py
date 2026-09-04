from django.contrib import admin
from .models import Payment, PaymentGatewayLog


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'rental_agreement', 'amount', 'due_date', 'payment_date', 'status', 'payment_method']
    list_filter = ['status', 'payment_method', 'due_date']
    search_fields = ['rental_agreement__tenant__email', 'transaction_reference']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'due_date'
    actions = ['mark_as_overdue']
    
    def mark_as_overdue(self, request, queryset):
        for payment in queryset:
            payment.check_overdue()
    mark_as_overdue.short_description = "Mark selected payments as overdue"


@admin.register(PaymentGatewayLog)
class PaymentGatewayLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'gateway', 'transaction_id', 'status', 'created_at']
    list_filter = ['gateway', 'status']
    search_fields = ['transaction_id']
    readonly_fields = ['created_at']

