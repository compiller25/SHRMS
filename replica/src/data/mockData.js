// Sample dataset for the standalone House Rental System.
// Mirrors the Dar es Salaam sample properties from the real backend.
// No API calls — everything renders from this file.

const img = (id) => `https://images.unsplash.com/${id}?w=800&q=80`;

export const PROPERTIES = [
  {
    id: 1,
    name: 'Magomeni Modern Apartments',
    property_type: 'apartment',
    area: 'Magomeni',
    city: 'Dar es Salaam',
    address: 'Magomeni Mapipa, Near Magomeni Bus Stand',
    description:
      'Modern apartments in the heart of Magomeni with easy access to public transport and local markets. Perfect for families and young professionals.',
    amenities: 'Water supply, Electricity, Security guard, Parking',
    image: img('photo-1545324418-cc1a3fa10c00'),
    available_units: 4,
    total_units: 4,
    min_rent: 250000,
    units: [
      { id: 101, unit_number: 'A1', bedrooms: 2, bathrooms: 1, rent_amount: 350000, status: 'AVAILABLE' },
      { id: 102, unit_number: 'A2', bedrooms: 3, bathrooms: 2, rent_amount: 450000, status: 'AVAILABLE' },
      { id: 103, unit_number: 'A3', bedrooms: 1, bathrooms: 1, rent_amount: 250000, status: 'AVAILABLE' },
      { id: 104, unit_number: 'A4', bedrooms: 2, bathrooms: 1, rent_amount: 350000, status: 'OCCUPIED' },
    ],
  },
  {
    id: 2,
    name: 'Kinondoni Family Homes',
    property_type: 'house',
    area: 'Kinondoni',
    city: 'Dar es Salaam',
    address: 'Kinondoni Road, Near Mwenge',
    description:
      'Spacious family houses in peaceful Kinondoni neighborhood. Close to schools, hospitals, and shopping centers.',
    amenities: 'Compound, Garden, Borehole water, 24/7 electricity, Gate',
    image: img('photo-1568605114967-8130f3a36994'),
    available_units: 3,
    total_units: 3,
    min_rent: 600000,
    units: [
      { id: 201, unit_number: 'H1', bedrooms: 3, bathrooms: 2, rent_amount: 600000, status: 'AVAILABLE' },
      { id: 202, unit_number: 'H2', bedrooms: 4, bathrooms: 3, rent_amount: 800000, status: 'AVAILABLE' },
      { id: 203, unit_number: 'H3', bedrooms: 3, bathrooms: 2, rent_amount: 600000, status: 'AVAILABLE' },
    ],
  },
  {
    id: 3,
    name: 'Mikocheni Business Suites',
    property_type: 'apartment',
    area: 'Mikocheni',
    city: 'Dar es Salaam',
    address: 'Mikocheni A, Off Sam Nujoma Road',
    description:
      'Premium apartments in upscale Mikocheni area. Ideal for expats and business professionals. Walking distance to restaurants and embassies.',
    amenities: 'Swimming pool, Gym, Generator backup, Internet, Security, Elevator',
    image: img('photo-1502672260066-6bc35f0a1bb2'),
    available_units: 2,
    total_units: 3,
    min_rent: 1200000,
    units: [
      { id: 301, unit_number: 'B101', bedrooms: 2, bathrooms: 2, rent_amount: 1200000, status: 'AVAILABLE' },
      { id: 302, unit_number: 'B102', bedrooms: 3, bathrooms: 2, rent_amount: 1500000, status: 'AVAILABLE' },
      { id: 303, unit_number: 'B201', bedrooms: 2, bathrooms: 2, rent_amount: 1200000, status: 'OCCUPIED' },
    ],
  },
  {
    id: 4,
    name: 'Masaki Luxury Residences',
    property_type: 'apartment',
    area: 'Masaki',
    city: 'Dar es Salaam',
    address: 'Masaki Peninsula, Near Slipway',
    description:
      'Luxury waterfront apartments with stunning ocean views. Premium location close to Slipway shopping center and Coco Beach.',
    amenities: 'Ocean view, Swimming pool, Gym, 24/7 security, Backup power, High-speed internet, Parking',
    image: img('photo-1512917774080-9991f1c4c750'),
    available_units: 2,
    total_units: 2,
    min_rent: 2500000,
    units: [
      { id: 401, unit_number: 'L301', bedrooms: 3, bathrooms: 3, rent_amount: 2500000, status: 'AVAILABLE' },
      { id: 402, unit_number: 'L302', bedrooms: 4, bathrooms: 3, rent_amount: 3000000, status: 'AVAILABLE' },
    ],
  },
  {
    id: 5,
    name: 'Temeke Affordable Housing',
    property_type: 'apartment',
    area: 'Temeke',
    city: 'Dar es Salaam',
    address: 'Temeke Kijichi, Near Temeke Hospital',
    description:
      'Affordable apartments for low to middle-income families. Good transport links and close to amenities.',
    amenities: 'Water, Electricity, Security',
    image: img('photo-1522708323590-d24dbb6b0267'),
    available_units: 4,
    total_units: 4,
    min_rent: 200000,
    units: [
      { id: 501, unit_number: 'T1', bedrooms: 1, bathrooms: 1, rent_amount: 200000, status: 'AVAILABLE' },
      { id: 502, unit_number: 'T2', bedrooms: 2, bathrooms: 1, rent_amount: 300000, status: 'AVAILABLE' },
      { id: 503, unit_number: 'T3', bedrooms: 2, bathrooms: 1, rent_amount: 300000, status: 'AVAILABLE' },
      { id: 504, unit_number: 'T4', bedrooms: 3, bathrooms: 2, rent_amount: 400000, status: 'AVAILABLE' },
    ],
  },
  {
    id: 6,
    name: 'Ilala Central Flats',
    property_type: 'apartment',
    area: 'Ilala',
    city: 'Dar es Salaam',
    address: 'Ilala, Near Uhuru Monument',
    description:
      'Conveniently located flats in central Ilala. Easy access to city center and public transport.',
    amenities: 'Water, Electricity, Security guard, Parking',
    image: img('photo-1560448204-e02f11c3d0e2'),
    available_units: 3,
    total_units: 3,
    min_rent: 280000,
    units: [
      { id: 601, unit_number: '1A', bedrooms: 1, bathrooms: 1, rent_amount: 280000, status: 'AVAILABLE' },
      { id: 602, unit_number: '1B', bedrooms: 2, bathrooms: 1, rent_amount: 380000, status: 'AVAILABLE' },
      { id: 603, unit_number: '2A', bedrooms: 2, bathrooms: 2, rent_amount: 420000, status: 'AVAILABLE' },
    ],
  },
  {
    id: 7,
    name: 'Sinza Residency',
    property_type: 'house',
    area: 'Sinza',
    city: 'Dar es Salaam',
    address: 'Sinza Mori, Near Mlimani City',
    description:
      'Modern apartments near Mlimani City Mall. Great for shopping enthusiasts and families.',
    amenities: 'Water, Electricity, Security, Parking, Near shopping mall',
    image: img('photo-1600596542815-ffad4c1539a9'),
    available_units: 2,
    total_units: 3,
    min_rent: 450000,
    units: [
      { id: 701, unit_number: 'S101', bedrooms: 2, bathrooms: 1, rent_amount: 450000, status: 'AVAILABLE' },
      { id: 702, unit_number: 'S102', bedrooms: 3, bathrooms: 2, rent_amount: 550000, status: 'AVAILABLE' },
      { id: 703, unit_number: 'S201', bedrooms: 2, bathrooms: 1, rent_amount: 450000, status: 'OCCUPIED' },
    ],
  },
];

export const AREAS = [
  'Magomeni', 'Kinondoni', 'Mikocheni', 'Masaki', 'Mbezi Beach',
  'Temeke', 'Ilala', 'Kariakoo', 'Oysterbay', 'Sinza', 'Kawe',
  'Msasani', 'Kijitonyama', 'Upanga', 'Posta',
];

export const APPLICATIONS = [
  { id: 1, applicant: 'Amina Juma', property: 'Magomeni Modern Apartments', unit: 'A1', status: 'APPLIED', date: '2026-09-02', rent: 350000 },
  { id: 2, applicant: 'Peter Mushi', property: 'Sinza Residency', unit: 'S102', status: 'APPLIED', date: '2026-09-05', rent: 550000 },
  { id: 3, applicant: 'Grace Lyimo', property: 'Kinondoni Family Homes', unit: 'H2', status: 'APPROVED', date: '2026-08-28', rent: 800000 },
  { id: 4, applicant: 'David Mwansa', property: 'Temeke Affordable Housing', unit: 'T2', status: 'ACTIVE', date: '2026-08-15', rent: 300000 },
  { id: 5, applicant: 'Neema Shayo', property: 'Mikocheni Business Suites', unit: 'B101', status: 'ACTIVE', date: '2026-08-10', rent: 1200000 },
];

export const PAYMENTS = [
  { id: 1, tenant: 'David Mwansa', property: 'Temeke Affordable Housing', amount: 300000, status: 'PAID', date: '2026-09-01', method: 'M-Pesa' },
  { id: 2, tenant: 'Neema Shayo', property: 'Mikocheni Business Suites', amount: 1200000, status: 'PAID', date: '2026-09-01', method: 'Bank Transfer' },
  { id: 3, tenant: 'Grace Lyimo', property: 'Kinondoni Family Homes', amount: 800000, status: 'PENDING', date: '2026-09-05', method: 'M-Pesa' },
  { id: 4, tenant: 'David Mwansa', property: 'Temeke Affordable Housing', amount: 300000, status: 'OVERDUE', date: '2026-08-01', method: 'M-Pesa' },
];

export const formatTZS = (n) => `${Number(n).toLocaleString()} TZS`;

export const USERS = [
  { id: 1, name: 'John Mwangi', email: 'landlord@smrs.com', phone: '+255712345678', role: 'LANDLORD', joined: '2026-06-12' },
  { id: 2, name: 'Amina Juma', email: 'amina@example.com', phone: '+255713000111', role: 'TENANT', joined: '2026-08-20' },
  { id: 3, name: 'Peter Mushi', email: 'peter@example.com', phone: '+255713000222', role: 'TENANT', joined: '2026-08-25' },
  { id: 4, name: 'Grace Lyimo', email: 'grace@example.com', phone: '+255713000333', role: 'TENANT', joined: '2026-08-18' },
  { id: 5, name: 'David Mwansa', email: 'david@example.com', phone: '+255713000444', role: 'TENANT', joined: '2026-08-02' },
  { id: 6, name: 'Neema Shayo', email: 'neema@example.com', phone: '+255713000555', role: 'TENANT', joined: '2026-07-30' },
  { id: 7, name: 'System Admin', email: 'admin@smrs.com', phone: '+255713000000', role: 'ADMIN', joined: '2026-06-01' },
];

export const PROPERTY_IMAGE_POOL = {
  apartment: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    'https://images.unsplash.com/photo-1502672260066-6bc35f0a1bb2?w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  ],
  house: [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  ],
  room: [
    'https://images.unsplash.com/photo-1631679706909-1844bbd93d3d?w=800&q=80',
    'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=800&q=80',
    'https://images.unsplash.com/photo-1595521624512-dfe6e288a5a9?w=800&q=80',
  ],
};
