# Data-preserving migration: split User role-profile into real Landlord/Tenant entities.
# New Landlord.id/Tenant.id are set equal to the owning users.id so the FK retargets in
# properties/rentals need no value changes (old landlord_id/tenant_id columns already hold users.id).

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def backfill_landlords(apps, schema_editor):
    User = apps.get_model(settings.AUTH_USER_MODEL)
    Landlord = apps.get_model('users', 'Landlord')
    LandlordProfile = apps.get_model('users', 'LandlordProfile')
    prof_map = {p.user_id: p for p in LandlordProfile.objects.all()}
    for user in User.objects.filter(role='LANDLORD'):
        p = prof_map.get(user.id)
        Landlord.objects.create(
            id=user.id,  # keep mapping with existing properties.landlord_id (holds users.id)
            user_id=user.id,
            full_name=f"{user.first_name} {user.last_name}".strip(),
            email=user.email,
            phone=user.phone,
            business_name=getattr(p, 'business_name', '') if p else '',
            business_registration_number=getattr(p, 'business_registration_number', '') if p else '',
            address=getattr(p, 'address', '') if p else '',
            is_verified=getattr(p, 'is_verified', False) if p else False,
        )


def backfill_tenants(apps, schema_editor):
    User = apps.get_model(settings.AUTH_USER_MODEL)
    Tenant = apps.get_model('users', 'Tenant')
    TenantProfile = apps.get_model('users', 'TenantProfile')
    prof_map = {p.user_id: p for p in TenantProfile.objects.all()}
    for user in User.objects.filter(role='TENANT'):
        p = prof_map.get(user.id)
        Tenant.objects.create(
            id=user.id,  # keep with existing rental_agreements.tenant_id (holds users.id)
            user_id=user.id,
            full_name=f"{user.first_name} {user.last_name}".strip(),
            email=user.email,
            phone=user.phone,
            national_id=getattr(p, 'national_id', '') if p else '',
            date_of_birth=getattr(p, 'date_of_birth', None) if p else None,
            employment_status=getattr(p, 'employment_status', '') if p else '',
            employer_name=getattr(p, 'employer_name', '') if p else '',
            emergency_contact_name=getattr(p, 'emergency_contact_name', '') if p else '',
            emergency_contact_phone=getattr(p, 'emergency_contact_phone', '') if p else '',
        )


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Landlord',
            fields=[
                ('id', models.BigAutoField(db_column='landlord_id', primary_key=True, serialize=False)),
                ('full_name', models.CharField(blank=True, max_length=200)),
                ('gender', models.CharField(blank=True, max_length=20)),
                ('phone', models.CharField(blank=True, max_length=15)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('address', models.TextField(blank=True)),
                ('business_name', models.CharField(blank=True, max_length=200)),
                ('business_registration_number', models.CharField(blank=True, max_length=100)),
                ('is_verified', models.BooleanField(default=False)),
                ('verification_documents', models.FileField(blank=True, null=True, upload_to='landlord_docs/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(db_column='user_id', on_delete=django.db.models.deletion.CASCADE, related_name='landlord', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'landlords',
            },
        ),
        migrations.CreateModel(
            name='Tenant',
            fields=[
                ('id', models.BigAutoField(db_column='tenant_id', primary_key=True, serialize=False)),
                ('full_name', models.CharField(blank=True, max_length=200)),
                ('national_id', models.CharField(blank=True, max_length=50)),
                ('gender', models.CharField(blank=True, max_length=20)),
                ('phone', models.CharField(blank=True, max_length=15)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('address', models.TextField(blank=True)),
                ('date_of_birth', models.DateField(blank=True, null=True)),
                ('employment_status', models.CharField(blank=True, max_length=100)),
                ('employer_name', models.CharField(blank=True, max_length=200)),
                ('emergency_contact_name', models.CharField(blank=True, max_length=200)),
                ('emergency_contact_phone', models.CharField(blank=True, max_length=15)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(db_column='user_id', on_delete=django.db.models.deletion.CASCADE, related_name='tenant', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'tenants',
            },
        ),
        migrations.RunPython(backfill_landlords, migrations.RunPython.noop),
        migrations.RunPython(backfill_tenants, migrations.RunPython.noop),
        migrations.DeleteModel(
            name='LandlordProfile',
        ),
        migrations.DeleteModel(
            name='TenantProfile',
        ),
    ]