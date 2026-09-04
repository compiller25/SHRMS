from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Identity + credentials layer for Django auth (login/register).

    Per the reviewed ERD, Landlord and Tenant are separate entities. This table
    exists purely to keep Django's AUTH_USER_MODEL and the login/register flow
    working; `role` drives the frontend routing and which entity a user has.
    """

    class Role(models.TextChoices):
        LANDLORD = 'LANDLORD', 'Landlord'
        TENANT = 'TENANT', 'Tenant'
        ADMIN = 'ADMIN', 'Admin'

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.TENANT)
    phone = models.CharField(max_length=15, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    
    # Google OAuth fields
    google_id = models.CharField(max_length=500, unique=True, null=True, blank=True, db_column='google_id')
    google_access_token = models.TextField(blank=True, null=True, db_column='google_access_token')
    auth_provider = models.CharField(
        max_length=20,
        choices=[('LOCAL', 'Local'), ('GOOGLE', 'Google')],
        default='LOCAL',
        db_column='auth_provider'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"


class Landlord(models.Model):
    """Landlord entity (reviewed ERD).

    PK column `landlord_id` (ORM field `landlord` is the PK via Django convention
    `id`, db_column set to `landlord_id`), 1:1 linked to a credentials row in
    `users`. A landlord owns many properties.
    """

    id = models.BigAutoField(primary_key=True, db_column='landlord_id')
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='landlord',
        db_column='user_id',
    )
    business_name = models.CharField(max_length=200, blank=True)
    is_verified = models.BooleanField(default=False)

    class Meta:
        db_table = 'landlords'

    def __str__(self):
        return f"Landlord: {self.user.get_full_name() or self.user.email}"


class Tenant(models.Model):
    """Tenant entity (reviewed ERD).

    PK column `tenant_id`, 1:1 linked to a User identity in `users`. A tenant can
    have one or more rental agreements.
    """

    id = models.BigAutoField(primary_key=True, db_column='tenant_id')
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='tenant',
        db_column='user_id',
    )
    national_id = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'tenants'

    def __str__(self):
        return f"Tenant: {self.user.get_full_name() or self.user.email}"