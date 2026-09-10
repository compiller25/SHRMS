# Generated migration to remove Google OAuth fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_add_google_oauth_fields'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='auth_provider',
        ),
        migrations.RemoveField(
            model_name='user',
            name='google_access_token',
        ),
        migrations.RemoveField(
            model_name='user',
            name='google_id',
        ),
    ]