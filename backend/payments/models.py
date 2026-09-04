from django.db import models
from django.utils import timezone
from rentals.models import RentalAgreement


class Payment(models.Model):
    """Payment tracking for rental agreements (reviewed ERD).

    PK db column `payment_id`; FK `agreement_id` -> rental_agreements.agreement_id.
    """

    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'
        OVERDUE = 'OVERDUE', 'Overdue'

    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', 'Cash'
        BANK_TRANSFER = 'BANK_TRANSFER', 'Bank Transfer'
        MOBILE_MONEY = 'MOBILE_MONEY', 'Mobile Money'
        CLICKPESA = 'CLICKPESA', 'ClickPesa Mobile Money'

    id = models.BigAutoField(primary_key=True, db_column='payment_id')
    rental_agreement = models.ForeignKey(
        RentalAgreement, on_delete=models.CASCADE, related_name='payments',
        db_column='agreement_id',
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    payment_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, blank=True)
    transaction_reference = models.CharField(max_length=200, blank=True)
    gateway_transaction_id = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    receipt_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-due_date']

    def __str__(self):
        return f"Payment {self.id} - {self.rental_agreement.tenant} - {self.amount} ({self.status})"

    def mark_as_paid(self, payment_method, transaction_ref=None):
        """Mark payment as completed"""
        self.status = self.PaymentStatus.COMPLETED
        self.payment_date = timezone.now()
        self.payment_method = payment_method
        if transaction_ref:
            self.transaction_reference = transaction_ref
        self.save()

    def check_overdue(self):
        """Check if payment is overdue"""
        if self.status == self.PaymentStatus.PENDING and self.due_date < timezone.now().date():
            self.status = self.PaymentStatus.OVERDUE
            self.save()
            return True
        return False

    @property
    def is_overdue(self):
        """Check if payment is currently overdue"""
        return self.status == self.PaymentStatus.PENDING and self.due_date < timezone.now().date()


class PaymentGatewayLog(models.Model):
    """Log payment gateway webhook callbacks"""
    payment = models.ForeignKey(
        Payment, on_delete=models.CASCADE, related_name='gateway_logs',
        null=True, blank=True, db_column='payment_id',
    )
    gateway = models.CharField(max_length=50)  # clickpesa
    transaction_id = models.CharField(max_length=200)
    request_data = models.JSONField()
    response_data = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payment_gateway_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.gateway} - {self.transaction_id} - {self.status}"