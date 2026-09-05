# Generated migration to add Google OAuth fields

from django.db import migrations, models


def add_google_fields_if_needed(apps, schema_editor):
    """Only add fields if they don't already exist"""
    from django.db import connection
    
    # Check if columns exist
    with connection.cursor() as cursor:
        try:
            cursor.execute("PRAGMA table_info(users);")
            columns = {row[1] for row in cursor.fetchall()}
            
            # Add columns only if they don't exist
            if 'google_id' not in columns:
                cursor.execute('ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;')
            if 'google_access_token' not in columns:
                cursor.execute('ALTER TABLE users ADD COLUMN google_access_token TEXT;')
            if 'auth_provider' not in columns:
                cursor.execute("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'LOCAL';")
        except Exception as e:
            print(f"Warning: Could not add columns: {e}")


def remove_google_fields(apps, schema_editor):
    """Reverse: Remove Google OAuth fields"""
    from django.db import connection
    
    with connection.cursor() as cursor:
        try:
            cursor.execute("PRAGMA table_info(users);")
            columns = {row[1] for row in cursor.fetchall()}
            
            # SQLite doesn't support DROP COLUMN easily, so we skip
            pass
        except Exception:
            pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_remove_landlord_address_remove_landlord_created_at_and_more'),
    ]

    operations = [
        migrations.RunPython(add_google_fields_if_needed, remove_google_fields),
    ]
