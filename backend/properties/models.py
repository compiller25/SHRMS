from django.db import models
from users.models import Landlord


class Property(models.Model):
    """Property owned by landlord (reviewed ERD).

    PK db column `property_id`; FK `landlord_id` -> landlords.landlord_id.
    """

    class PropertyType(models.TextChoices):
        APARTMENT = 'APARTMENT', 'Apartment'
        HOUSE = 'HOUSE', 'House'
        ROOM = 'ROOM', 'Room'

    id = models.BigAutoField(primary_key=True, db_column='property_id')
    landlord = models.ForeignKey(
        Landlord, on_delete=models.CASCADE, related_name='properties',
        db_column='landlord_id',
    )
    name = models.CharField(max_length=200, db_column='property_name')
    property_type = models.CharField(max_length=20, choices=PropertyType.choices)
    location = models.CharField(max_length=200, blank=True, db_column='location')
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[('AVAILABLE', 'Available'), ('OCCUPIED', 'Occupied'), ('INACTIVE', 'Inactive')],
        default='AVAILABLE',
    )
    address = models.TextField()
    city = models.CharField(max_length=100, default='Dar es Salaam')
    area = models.CharField(max_length=100, default='Magomeni')
    description = models.TextField(blank=True)
    amenities = models.TextField(blank=True, help_text='Comma-separated amenities')
    image = models.ImageField(upload_to='properties/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'properties'
        ordering = ['-created_at']
        verbose_name_plural = 'Properties'

    def __str__(self):
        return f"{self.name} - {self.area}"

    @property
    def total_units(self):
        return self.units.count()

    @property
    def available_units(self):
        return self.units.filter(status='AVAILABLE').count()


class HouseUnit(models.Model):
    """Individual rental unit within a property (reviewed ERD).

    PK db column `unit_id`; FK `property_id` -> properties.property_id.
    """

    class UnitStatus(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        OCCUPIED = 'OCCUPIED', 'Occupied'
        MAINTENANCE = 'MAINTENANCE', 'Under Maintenance'

    id = models.BigAutoField(primary_key=True, db_column='unit_id')
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name='units',
        db_column='property_id',
    )
    unit_number = models.CharField(max_length=50)
    unit_type = models.CharField(max_length=50, blank=True)
    bedrooms = models.IntegerField(default=1)
    bathrooms = models.IntegerField(default=1)
    square_feet = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='TZS')
    status = models.CharField(max_length=20, choices=UnitStatus.choices, default=UnitStatus.AVAILABLE)
    description = models.TextField(blank=True)
    amenities = models.TextField(blank=True, help_text='Comma-separated amenities')
    floor_number = models.IntegerField(null=True, blank=True)
    has_parking = models.BooleanField(default=False)
    has_balcony = models.BooleanField(default=False)
    image = models.ImageField(upload_to='units/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'house_units'
        ordering = ['property', 'unit_number']
        unique_together = ['property', 'unit_number']
        verbose_name = 'House Unit'

    def __str__(self):
        return f"{self.property.name} - Unit {self.unit_number}"