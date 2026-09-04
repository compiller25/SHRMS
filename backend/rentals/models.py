from django.db import models
from django.core.exceptions import ValidationError
from users.models import Tenant
from properties.models import HouseUnit


class RentalAgreement(models.Model):
    """Tenancy contract between a tenant and a landlord (reviewed ERD).

    PK db column `agreement_id`; FK `tenant_id` -> tenants.tenant_id and
    FK `unit_id` -> house_units.unit_id.
    """

    class AgreementStatus(models.TextChoices):
        APPLIED = 'APPLIED', 'Applied'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        ACTIVE = 'ACTIVE', 'Active'
        EXPIRED = 'EXPIRED', 'Expired'
        TERMINATED = 'TERMINATED', 'Terminated'

    id = models.BigAutoField(primary_key=True, db_column='agreement_id')
    house_unit = models.ForeignKey(
        HouseUnit, on_delete=models.CASCADE, related_name='rental_agreements',
        db_column='unit_id',
    )
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name='rental_agreements',
        db_column='tenant_id',
    )
    start_date = models.DateField()
    end_date = models.DateField()
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=AgreementStatus.choices, default=AgreementStatus.APPLIED)
    terms_conditions = models.TextField(blank=True)
    signed_by_tenant = models.BooleanField(default=False)
    signed_by_landlord = models.BooleanField(default=False)
    signed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rental_agreements'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.house_unit} - {self.tenant} ({self.status})"

    def clean(self):
        """Validate rental agreement data"""
        # Check if unit is available
        if self.house_unit.status != 'AVAILABLE' and not self.pk:
            raise ValidationError('This unit is not available for rent')

        # Check for overlapping active agreements
        overlapping = RentalAgreement.objects.filter(
            house_unit=self.house_unit,
            status__in=['ACTIVE', 'APPROVED']
        ).exclude(pk=self.pk)

        if overlapping.exists():
            raise ValidationError('This unit already has an active rental agreement')

    def save(self, *args, **kwargs):
        self.full_clean()

        # Update unit status based on agreement status
        if self.status == 'ACTIVE':
            self.house_unit.status = 'OCCUPIED'
            self.house_unit.save()
        elif self.status in ['EXPIRED', 'TERMINATED'] and self.house_unit.status == 'OCCUPIED':
            # Check if there are other active agreements
            other_active = RentalAgreement.objects.filter(
                house_unit=self.house_unit,
                status='ACTIVE'
            ).exclude(pk=self.pk).exists()

            if not other_active:
                self.house_unit.status = 'AVAILABLE'
                self.house_unit.save()

        super().save(*args, **kwargs)

    @property
    def landlord(self):
        return self.house_unit.property.landlord