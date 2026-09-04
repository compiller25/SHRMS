from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from properties.models import Property, HouseUnit
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate database with sample properties from Dar es Salaam areas'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting to populate Dar es Salaam properties...')
        
        # Get or create a landlord user
        landlord, created = User.objects.get_or_create(
            email='landlord@smrs.com',
            defaults={
                'username': 'landlord_dar',
                'first_name': 'John',
                'last_name': 'Mwangi',
                'phone': '+255712345678',
                'role': 'LANDLORD',
                'is_active': True
            }
        )
        if created:
            landlord.set_password('landlord123')
            landlord.save()
            self.stdout.write(self.style.SUCCESS(f'Created landlord user: {landlord.email}'))
        
        # Clear existing properties (optional - remove if you want to keep existing data)
        Property.objects.all().delete()
        self.stdout.write(self.style.WARNING('Cleared existing properties'))
        
        # Dar es Salaam properties data
        properties_data = [
            {
                'name': 'Magomeni Modern Apartments',
                'property_type': 'APARTMENT',
                'area': 'Magomeni',
                'address': 'Magomeni Mapipa, Near Magomeni Bus Stand',
                'description': 'Modern apartments in the heart of Magomeni with easy access to public transport and local markets. Perfect for families and young professionals.',
                'amenities': 'Water supply, Electricity, Security guard, Parking',
                'units': [
                    {'unit_number': 'A1', 'bedrooms': 2, 'bathrooms': 1, 'rent_amount': 350000, 'square_feet': 750},
                    {'unit_number': 'A2', 'bedrooms': 3, 'bathrooms': 2, 'rent_amount': 450000, 'square_feet': 950},
                    {'unit_number': 'A3', 'bedrooms': 1, 'bathrooms': 1, 'rent_amount': 250000, 'square_feet': 550},
                    {'unit_number': 'A4', 'bedrooms': 2, 'bathrooms': 1, 'rent_amount': 350000, 'square_feet': 750},
                ]
            },
            {
                'name': 'Kinondoni Family Homes',
                'property_type': 'HOUSE',
                'area': 'Kinondoni',
                'address': 'Kinondoni Road, Near Mwenge',
                'description': 'Spacious family houses in peaceful Kinondoni neighborhood. Close to schools, hospitals, and shopping centers.',
                'amenities': 'Compound, Garden, Borehole water, 24/7 electricity, Gate',
                'units': [
                    {'unit_number': 'H1', 'bedrooms': 3, 'bathrooms': 2, 'rent_amount': 600000, 'square_feet': 1200, 'has_parking': True},
                    {'unit_number': 'H2', 'bedrooms': 4, 'bathrooms': 3, 'rent_amount': 800000, 'square_feet': 1500, 'has_parking': True},
                    {'unit_number': 'H3', 'bedrooms': 3, 'bathrooms': 2, 'rent_amount': 600000, 'square_feet': 1200, 'has_parking': True},
                ]
            },
            {
                'name': 'Mikocheni Business Suites',
                'property_type': 'APARTMENT',
                'area': 'Mikocheni',
                'address': 'Mikocheni A, Off Sam Nujoma Road',
                'description': 'Premium apartments in upscale Mikocheni area. Ideal for expats and business professionals. Walking distance to restaurants and embassies.',
                'amenities': 'Swimming pool, Gym, Generator backup, Internet, Security, Elevator',
                'units': [
                    {'unit_number': 'B101', 'bedrooms': 2, 'bathrooms': 2, 'rent_amount': 1200000, 'square_feet': 900, 'floor_number': 1, 'has_balcony': True},
                    {'unit_number': 'B102', 'bedrooms': 3, 'bathrooms': 2, 'rent_amount': 1500000, 'square_feet': 1100, 'floor_number': 1, 'has_balcony': True},
                    {'unit_number': 'B201', 'bedrooms': 2, 'bathrooms': 2, 'rent_amount': 1200000, 'square_feet': 900, 'floor_number': 2, 'has_balcony': True},
                ]
            },
            {
                'name': 'Masaki Luxury Residences',
                'property_type': 'APARTMENT',
                'area': 'Masaki',
                'address': 'Masaki Peninsula, Near Slipway',
                'description': 'Luxury waterfront apartments with stunning ocean views. Premium location close to Slipway shopping center and Coco Beach.',
                'amenities': 'Ocean view, Swimming pool, Gym, 24/7 security, Backup power, High-speed internet, Parking',
                'units': [
                    {'unit_number': 'L301', 'bedrooms': 3, 'bathrooms': 3, 'rent_amount': 2500000, 'square_feet': 1400, 'floor_number': 3, 'has_balcony': True, 'has_parking': True},
                    {'unit_number': 'L302', 'bedrooms': 4, 'bathrooms': 3, 'rent_amount': 3000000, 'square_feet': 1600, 'floor_number': 3, 'has_balcony': True, 'has_parking': True},
                ]
            },
            {
                'name': 'Temeke Affordable Housing',
                'property_type': 'APARTMENT',
                'area': 'Temeke',
                'address': 'Temeke Kijichi, Near Temeke Hospital',
                'description': 'Affordable apartments for low to middle-income families. Good transport links and close to amenities.',
                'amenities': 'Water, Electricity, Security',
                'units': [
                    {'unit_number': 'T1', 'bedrooms': 1, 'bathrooms': 1, 'rent_amount': 200000, 'square_feet': 500},
                    {'unit_number': 'T2', 'bedrooms': 2, 'bathrooms': 1, 'rent_amount': 300000, 'square_feet': 700},
                    {'unit_number': 'T3', 'bedrooms': 2, 'bathrooms': 1, 'rent_amount': 300000, 'square_feet': 700},
                    {'unit_number': 'T4', 'bedrooms': 3, 'bathrooms': 2, 'rent_amount': 400000, 'square_feet': 900},
                ]
            },
            {
                'name': 'Ilala Central Flats',
                'property_type': 'APARTMENT',
                'area': 'Ilala',
                'address': 'Ilala, Near Uhuru Monument',
                'description': 'Conveniently located flats in central Ilala. Easy access to city center and public transport.',
                'amenities': 'Water, Electricity, Security guard, Parking',
                'units': [
                    {'unit_number': '1A', 'bedrooms': 1, 'bathrooms': 1, 'rent_amount': 280000, 'square_feet': 600},
                    {'unit_number': '1B', 'bedrooms': 2, 'bathrooms': 1, 'rent_amount': 380000, 'square_feet': 800},
                    {'unit_number': '2A', 'bedrooms': 2, 'bathrooms': 2, 'rent_amount': 420000, 'square_feet': 850},
                ]
            },
            {
                'name': 'Sinza Residency',
                'property_type': 'APARTMENT',
                'area': 'Sinza',
                'address': 'Sinza Mori, Near Mlimani City',
                'description': 'Modern apartments near Mlimani City Mall. Great for shopping enthusiasts and families.',
                'amenities': 'Water, Electricity, Security, Parking, Near shopping mall',
                'units': [
                    {'unit_number': 'S101', 'bedrooms': 2, 'bathrooms': 1, 'rent_amount': 450000, 'square_feet': 800},
                    {'unit_number': 'S102', 'bedrooms': 3, 'bathrooms': 2, 'rent_amount': 550000, 'square_feet': 1000},
                    {'unit_number': 'S201', 'bedrooms': 2, 'bathrooms': 1, 'rent_amount': 450000, 'square_feet': 800},
                ]
            },
        ]
        
        # Create properties and units
        created_properties = 0
        created_units = 0
        
        for prop_data in properties_data:
            units_data = prop_data.pop('units')
            
            property_obj = Property.objects.create(
                landlord=landlord,
                city='Dar es Salaam',
                **prop_data
            )
            created_properties += 1
            
            for unit_data in units_data:
                HouseUnit.objects.create(
                    property=property_obj,
                    currency='TZS',
                    status='AVAILABLE',
                    **unit_data
                )
                created_units += 1
            
            self.stdout.write(self.style.SUCCESS(f'Created {property_obj.name} with {len(units_data)} units'))
        
        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully created {created_properties} properties with {created_units} total units'))
        self.stdout.write(self.style.SUCCESS('All properties are in Dar es Salaam areas'))
        self.stdout.write(self.style.WARNING(f'\nLandlord credentials:\nEmail: {landlord.email}\nPassword: landlord123'))
