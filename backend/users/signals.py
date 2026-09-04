from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Landlord, Tenant


@receiver(post_save, sender=User)
def create_user_entity(sender, instance, created, **kwargs):
    """Auto-create the matching entity (landlord/tenant) after user creation."""
    if created:
        if instance.role == User.Role.LANDLORD:
            Landlord.objects.create(user=instance)
        elif instance.role == User.Role.TENANT:
            Tenant.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_entity(sender, instance, **kwargs):
    """Keep the matched entity in sync when the user is saved."""
    if instance.role == User.Role.LANDLORD and hasattr(instance, 'landlord'):
        instance.landlord.save()
    elif instance.role == User.Role.TENANT and hasattr(instance, 'tenant'):
        instance.tenant.save()