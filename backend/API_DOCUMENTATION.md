# Smart Land & House Rental Management System - API Documentation

## Base URL
```
http://localhost:8000/api/
```

## Authentication
All endpoints (except registration, login, and marketplace) require JWT authentication.

### Headers
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### 1. Register
**POST** `/api/auth/register/`

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "password2": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+255712345678",
  "role": "TENANT"  // or "LANDLORD"
}
```

**Response:**
```json
{
  "user": {...},
  "tokens": {
    "refresh": "refresh_token_here",
    "access": "access_token_here"
  },
  "message": "Registration successful"
}
```

### 2. Login
**POST** `/api/auth/login/`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### 3. Logout
**POST** `/api/auth/logout/`

**Body:**
```json
{
  "refresh_token": "your_refresh_token"
}
```

### 4. Get Profile
**GET** `/api/auth/profile/`

### 5. Update Profile
**PUT/PATCH** `/api/auth/profile/`

### 6. Refresh Token
**POST** `/api/auth/token/refresh/`

---

## Property Endpoints

### 1. List Properties (Landlord's own properties)
**GET** `/api/properties/`

**Query Params:**
- `property_type`: APARTMENT, HOUSE, COMMERCIAL, LAND
- `city`: City name
- `area`: Area name
- `search`: Search by name, address, description

### 2. Create Property (Landlord only)
**POST** `/api/properties/`

**Body:**
```json
{
  "name": "Magomeni Apartments",
  "property_type": "APARTMENT",
  "address": "Plot 123, Magomeni Mapipa",
  "city": "Dar es Salaam",
  "area": "Magomeni",
  "description": "Modern apartments in Magomeni",
  "amenities": "parking, security, water"
}
```

### 3. Get Property Details
**GET** `/api/properties/{id}/`

### 4. Update Property
**PUT/PATCH** `/api/properties/{id}/`

### 5. Delete Property
**DELETE** `/api/properties/{id}/`

### 6. Get Available Units for Property
**GET** `/api/properties/{id}/available_units/`

---

## House Unit Endpoints

### 1. List Units
**GET** `/api/units/`

**Query Params:**
- `property`: Property ID
- `status`: AVAILABLE, OCCUPIED, MAINTENANCE
- `bedrooms`: Number of bedrooms
- `bathrooms`: Number of bathrooms
- `min_rent`: Minimum rent amount
- `max_rent`: Maximum rent amount
- `available`: true/false (for tenants)

### 2. Create Unit (Landlord only)
**POST** `/api/units/`

**Body:**
```json
{
  "property": 1,
  "unit_number": "A101",
  "bedrooms": 2,
  "bathrooms": 1,
  "rent_amount": 350000,
  "currency": "TZS",
  "description": "2-bedroom unit on 1st floor",
  "amenities": "balcony, parking",
  "floor_number": 1,
  "has_parking": true,
  "has_balcony": true
}
```

### 3. Get Unit Details
**GET** `/api/units/{id}/`

### 4. Update Unit
**PUT/PATCH** `/api/units/{id}/`

### 5. Update Unit Status (Landlord only)
**POST** `/api/units/{id}/update_status/`

**Body:**
```json
{
  "status": "MAINTENANCE"
}
```

---

## Marketplace Endpoints (Public - for Tenants)

### 1. Browse Marketplace
**GET** `/api/marketplace/`

**Query Params:**
- `property_type`: Filter by type
- `city`: Filter by city
- `area`: Filter by area
- `search`: Search properties
- `has_available`: true (show only properties with available units)

### 2. Get Property from Marketplace
**GET** `/api/marketplace/{id}/`

---

## Rental Agreement Endpoints

### 1. List Agreements
**GET** `/api/rentals/agreements/`

- Landlords see agreements for their properties
- Tenants see their own agreements

### 2. Apply for Rental (Tenant only)
**POST** `/api/rentals/agreements/apply/`

**Body:**
```json
{
  "house_unit": 1,
  "start_date": "2026-08-01",
  "end_date": "2027-07-31",
  "terms_conditions": "Standard rental terms"
}
```

### 3. Get Agreement Details
**GET** `/api/rentals/agreements/{id}/`

### 4. Process Application (Landlord only)
**POST** `/api/rentals/agreements/{id}/process_application/`

**Body:**
```json
{
  "action": "approve"  // or "reject"
  // If rejecting:
  // "rejection_reason": "Unit no longer available"
}
```

### 5. Terminate Agreement
**POST** `/api/rentals/agreements/{id}/terminate/`

### 6. My Applications (Tenant)
**GET** `/api/rentals/agreements/my_applications/`

### 7. Pending Applications (Landlord)
**GET** `/api/rentals/agreements/pending_applications/`

---

## Payment Endpoints

### 1. List Payments
**GET** `/api/payments/`

- Landlords see payments for their properties
- Tenants see their own payments

### 2. Get Payment Details
**GET** `/api/payments/{id}/`

### 3. Record Payment (Landlord only - manual)
**POST** `/api/payments/{id}/record_payment/`

**Body:**
```json
{
  "payment_method": "CASH",
  "transaction_reference": "TXN123456",
  "notes": "Payment received in cash"
}
```

### 4. Initiate Online Payment (Tenant only)
**POST** `/api/payments/{id}/initiate_payment/`

**Body:**
```json
{
  "payment_gateway": "CLICKPESA"
}
```

**Response:**
```json
{
  "message": "USSD-PUSH sent. Check your phone and enter your PIN.",
  "status": "PROCESSING",
  "transaction_id": "uuid-transaction-id"
}
```

### 5. My Payments (Tenant)
**GET** `/api/payments/my_payments/`

### 6. Overdue Payments
**GET** `/api/payments/overdue/`

### 7. Payment Statistics (Landlord only)
**GET** `/api/payments/statistics/`

**Response:**
```json
{
  "total_payments": 120,
  "completed_payments": 100,
  "pending_payments": 15,
  "overdue_payments": 5,
  "total_revenue": 42000000,
  "pending_amount": 5250000
}
```

### 8. Payment Webhook (Public - for gateway callbacks)
**POST** `/api/webhook/clickpesa/`  
(gateway: clickpesa)

---

## User Roles & Permissions

### LANDLORD
- Create, edit, delete properties and units
- View applications for their properties
- Approve/reject rental applications
- View payments for their properties
- Record manual payments
- View payment statistics

### TENANT
- Browse marketplace
- Apply for rental units
- View their applications and agreements
- View their payment schedule
- Initiate online payments
- View payment history

### ADMIN
- Full access to all endpoints
- Manage users via Django admin
- Monitor system activity

---

## Payment Gateway Integration

### Supported Gateway
1. **ClickPesa** - Mobile Money USSD-PUSH (Tanzania, TZS)

### Payment Flow
1. Tenant initiates payment via `/api/payments/{id}/initiate_payment/`
2. ClickPesa sends a USSD-PUSH to the tenant's phone
3. Tenant enters their mobile wallet PIN to complete payment
4. ClickPesa sends status callback to `/api/webhook/clickpesa/` (or system polls status)
5. System updates payment status
6. Tenant can view updated payment status

---

## Development Setup

### Create Superuser
```bash
cd backend
python manage.py createsuperuser
```

### Run Server
```bash
python manage.py runserver
```

### Access Admin Panel
```
http://localhost:8000/admin/
```

---

## Status Codes

- `200 OK` - Successful GET/PUT/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
