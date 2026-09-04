# Smart Land & House Rental Management System (SMRS)
## Complete System Workflow Documentation

---

## 1. PROJECT OVERVIEW

### 1.1 System Architecture
The SMRS is a full-stack web application for managing rental properties in Tanzania:

**Backend:**
- Framework: Django 5.0.7 + Django REST Framework
- Database: SQLite (development) / PostgreSQL (production capable)
- Authentication: JWT (JSON Web Tokens) via djangorestframework-simplejwt
- Payment Integration: ClickPesa (Mobile Money USSD-PUSH)

**Frontend:**
- Framework: React 18.3.1
- Build Tool: Vite 5.4.0
- Styling: Tailwind CSS 3.4.7
- Routing: React Router DOM 6.26.0
- HTTP Client: Axios 1.7.2
- Icons: Lucide React 1.23.0

**API Style:**
- RESTful API with JWT authentication
- Base URL: `http://localhost:8000/api/`

---

## 2. DATABASE DESIGN (REVIEWED ERD)

### 2.1 User Entity
**Table:** `users`  
**Purpose:** Central authentication and identity layer for Django's auth system

**Attributes:**
- `id` (PK, BigAutoField) - Primary Key (auto-generated)
- `username` (CharField, unique) - Login username
- `email` (EmailField, unique) - User email for login
- `password` (CharField) - Hashed password
- `first_name` (CharField) - User's first name
- `last_name` (CharField) - User's last name
- `role` (CharField) - User role: LANDLORD, TENANT, or ADMIN
- `phone` (CharField) - Contact phone number
- `gender` (CharField) - User gender
- `address` (TextField) - Physical address
- `is_active` (BooleanField) - Account active status
- `is_staff` (BooleanField) - Staff access flag
- `is_superuser` (BooleanField) - Superuser access flag
- `date_joined` (DateTimeField) - Registration timestamp
- `created_at` (DateTimeField) - Record creation timestamp
- `updated_at` (DateTimeField) - Last update timestamp

**Relationships:**
- One-to-One with Landlord entity
- One-to-One with Tenant entity

---

### 2.2 Landlord Entity
**Table:** `landlords`  
**Purpose:** Stores property owner information

**Attributes:**
- `landlord_id` (PK, BigAutoField) - Primary Key
- `user_id` (FK → users.id, One-to-One) - Link to User account
- `business_name` (CharField) - Business/company name (optional)
- `is_verified` (BooleanField) - Verification status

**Relationships:**
- One-to-One with User (credentials)
- One-to-Many with Property (owns multiple properties)

**Access via:**
- `user.landlord` (from User)
- `landlord.properties.all()` (get all properties)

---

### 2.3 Tenant Entity
**Table:** `tenants`  
**Purpose:** Stores rental customer information

**Attributes:**
- `tenant_id` (PK, BigAutoField) - Primary Key
- `user_id` (FK → users.id, One-to-One) - Link to User account
- `national_id` (CharField) - National ID number (optional)

**Relationships:**
- One-to-One with User (credentials)
- One-to-Many with RentalAgreement (can have multiple agreements)

**Access via:**
- `user.tenant` (from User)
- `tenant.rental_agreements.all()` (get all agreements)

---

### 2.4 Property Entity
**Table:** `properties`  
**Purpose:** Stores information about rental properties (buildings/complexes)

**Attributes:**
- `property_id` (PK, BigAutoField) - Primary Key
- `landlord_id` (FK → landlords.landlord_id) - Property owner
- `property_name` (CharField) - Property name
- `property_type` (CharField) - APARTMENT, HOUSE, COMMERCIAL, LAND
- `location` (CharField) - General location description
- `address` (TextField) - Full address
- `city` (CharField) - City name (default: Dar es Salaam)
- `area` (CharField) - Area/neighborhood (default: Magomeni)
- `price` (DecimalField) - Base/reference price (optional)
- `status` (CharField) - AVAILABLE, OCCUPIED, INACTIVE
- `description` (TextField) - Property description
- `amenities` (TextField) - Comma-separated amenities
- `image` (ImageField) - Property photo
- `created_at` (DateTimeField) - Creation timestamp
- `updated_at` (DateTimeField) - Last update timestamp

**Relationships:**
- Many-to-One with Landlord (property.landlord)
- One-to-Many with HouseUnit (property.units.all())

**Computed Properties:**
- `total_units` - Count of all units
- `available_units` - Count of available units

---

### 2.5 House Unit Entity
**Table:** `house_units`  
**Purpose:** Individual rental units within a property

**Attributes:**
- `unit_id` (PK, BigAutoField) - Primary Key
- `property_id` (FK → properties.property_id) - Parent property
- `unit_number` (CharField) - Unit identifier (e.g., "A101", "B205")
- `unit_type` (CharField) - Unit type description
- `bedrooms` (IntegerField) - Number of bedrooms
- `bathrooms` (IntegerField) - Number of bathrooms
- `square_feet` (DecimalField) - Unit size (optional)
- `rent_amount` (DecimalField) - Monthly rent amount
- `currency` (CharField) - Currency code (default: TZS)
- `status` (CharField) - AVAILABLE, OCCUPIED, MAINTENANCE
- `description` (TextField) - Unit description
- `amenities` (TextField) - Comma-separated amenities
- `floor_number` (IntegerField) - Floor level (optional)
- `has_parking` (BooleanField) - Parking available
- `has_balcony` (BooleanField) - Balcony available
- `image` (ImageField) - Unit photo
- `created_at` (DateTimeField) - Creation timestamp
- `updated_at` (DateTimeField) - Last update timestamp

**Relationships:**
- Many-to-One with Property (unit.property)
- One-to-Many with RentalAgreement (unit.rental_agreements.all())

**Constraints:**
- Unique together: (property, unit_number)

---

### 2.6 Rental Agreement Entity
**Table:** `rental_agreements`  
**Purpose:** Rental contracts between tenants and landlords

**Attributes:**
- `agreement_id` (PK, BigAutoField) - Primary Key
- `tenant_id` (FK → tenants.tenant_id) - Tenant in agreement
- `unit_id` (FK → house_units.unit_id) - Rented unit
- `start_date` (DateField) - Agreement start date
- `end_date` (DateField) - Agreement end date
- `monthly_rent` (DecimalField) - Monthly rent amount
- `deposit_amount` (DecimalField) - Security deposit amount
- `status` (CharField) - APPLIED, APPROVED, REJECTED, ACTIVE, EXPIRED, TERMINATED
- `terms_conditions` (TextField) - Agreement terms
- `signed_by_tenant` (BooleanField) - Tenant signature flag
- `signed_by_landlord` (BooleanField) - Landlord signature flag
- `signed_at` (DateTimeField) - Signing timestamp
- `rejection_reason` (TextField) - Reason for rejection (if applicable)
- `created_at` (DateTimeField) - Creation timestamp
- `updated_at` (DateTimeField) - Last update timestamp

**Relationships:**
- Many-to-One with Tenant (agreement.tenant)
- Many-to-One with HouseUnit (agreement.house_unit)
- One-to-Many with Payment (agreement.payments.all())

**Computed Properties:**
- `landlord` - Returns the landlord via unit.property.landlord

**Business Logic:**
- When status → ACTIVE: unit.status → OCCUPIED
- When status → EXPIRED/TERMINATED: unit.status → AVAILABLE (if no other active agreements)
- Prevents overlapping active agreements for the same unit

---

### 2.7 Payment Entity
**Table:** `payments`  
**Purpose:** Rent payment tracking and records

**Attributes:**
- `payment_id` (PK, BigAutoField) - Primary Key
- `agreement_id` (FK → rental_agreements.agreement_id) - Related agreement
- `amount` (DecimalField) - Payment amount
- `due_date` (DateField) - Payment due date
- `payment_date` (DateTimeField) - Actual payment timestamp
- `status` (CharField) - PENDING, COMPLETED, FAILED, OVERDUE
- `payment_method` (CharField) - CASH, BANK_TRANSFER, MOBILE_MONEY, CLICKPESA
- `transaction_reference` (CharField) - Transaction reference number
- `gateway_transaction_id` (CharField) - Payment gateway transaction ID
- `notes` (TextField) - Additional notes
- `receipt_url` (URLField) - Receipt/invoice URL
- `created_at` (DateTimeField) - Creation timestamp
- `updated_at` (DateTimeField) - Last update timestamp

**Relationships:**
- Many-to-One with RentalAgreement (payment.rental_agreement)
- One-to-Many with PaymentGatewayLog (payment.gateway_logs.all())

**Business Logic:**
- Auto-marks as OVERDUE when due_date < current_date and status = PENDING
- `mark_as_paid()` method updates status and timestamp
- `is_overdue` property checks overdue status

---

### 2.8 Payment Gateway Log Entity
**Table:** `payment_gateway_logs`  
**Purpose:** Audit trail for payment gateway interactions

**Attributes:**
- `id` (PK, BigAutoField) - Primary Key
- `payment_id` (FK → payments.payment_id, optional) - Related payment
- `gateway` (CharField) - Gateway name (e.g., "clickpesa")
- `transaction_id` (CharField) - Gateway transaction ID
- `request_data` (JSONField) - Request payload
- `response_data` (JSONField) - Response payload
- `status` (CharField) - Transaction status
- `created_at` (DateTimeField) - Log timestamp

**Relationships:**
- Many-to-One with Payment (optional)

---

## 3. SYSTEM WORKFLOW

### 3.1 User Registration & Authentication Flow

#### Registration Flow:
```
1. User visits frontend registration page
2. Selects role: LANDLORD or TENANT
3. Fills registration form:
   - username, email, password, password2
   - first_name, last_name, phone
   - role (LANDLORD/TENANT)
4. Frontend → POST /api/auth/register/
5. Backend creates:
   - User record in users table
   - Landlord record (if role=LANDLORD) in landlords table
   - Tenant record (if role=TENANT) in tenants table
6. Returns JWT tokens (access + refresh)
7. Frontend stores tokens in localStorage
8. Auto-redirects to appropriate dashboard
```

#### Login Flow:
```
1. User enters email + password
2. Frontend → POST /api/auth/login/
3. Backend validates credentials
4. Returns JWT tokens + user profile
5. Frontend stores tokens
6. Redirects based on role:
   - LANDLORD → /landlord/dashboard
   - TENANT → /tenant/dashboard
   - ADMIN → /admin/dashboard
```

#### Token Refresh:
```
1. Frontend detects expired access token
2. Sends refresh token → POST /api/auth/token/refresh/
3. Receives new access token
4. Updates localStorage
5. Retries original request
```

---

### 3.2 Landlord Workflow

#### A. Property Management Flow:

**Create Property:**
```
1. Landlord logs in
2. Navigates to "Add Property"
3. Fills property form:
   - name, property_type, address, city, area
   - description, amenities, image
4. Frontend → POST /api/properties/
5. Backend creates Property with landlord_id from JWT
6. Returns property object
7. Frontend redirects to property details
```

**View Properties:**
```
1. Landlord navigates to "My Properties"
2. Frontend → GET /api/properties/
3. Backend filters: Property.objects.filter(landlord=request.user.landlord)
4. Returns landlord's properties
5. Frontend displays property cards with:
   - Name, location, type, total_units, available_units
```

**Update/Delete Property:**
```
1. Landlord clicks property → Edit/Delete
2. Frontend → PUT/PATCH /api/properties/{id}/ or DELETE
3. Backend verifies ownership via landlord_id
4. Updates/deletes record
5. Frontend refreshes list
```

#### B. Unit Management Flow:

**Create Unit:**
```
1. Landlord selects property → "Add Unit"
2. Fills unit form:
   - unit_number, unit_type, bedrooms, bathrooms
   - rent_amount, description, amenities
   - floor_number, has_parking, has_balcony
3. Frontend → POST /api/units/
4. Backend creates HouseUnit with property_id
5. Returns unit object
6. Unit status defaults to AVAILABLE
```

**View Available Units:**
```
Frontend → GET /api/properties/{id}/available_units/
Returns: units.filter(status='AVAILABLE')
```

**Update Unit Status:**
```
1. Landlord selects unit → "Update Status"
2. Chooses: AVAILABLE, OCCUPIED, MAINTENANCE
3. Frontend → POST /api/units/{id}/update_status/
   Body: {"status": "MAINTENANCE"}
4. Backend updates unit.status
5. Frontend refreshes unit list
```

#### C. Application Processing Flow:

**View Applications:**
```
1. Landlord → "Pending Applications"
2. Frontend → GET /api/rentals/agreements/pending_applications/
3. Backend returns:
   RentalAgreement.objects.filter(
     house_unit__property__landlord=request.user.landlord,
     status='APPLIED'
   )
4. Displays tenant info, unit, requested dates
```

**Approve Application:**
```
1. Landlord reviews application → "Approve"
2. Frontend → POST /api/rentals/agreements/{id}/process_application/
   Body: {"action": "approve"}
3. Backend:
   - Sets agreement.status = ACTIVE
   - Sets house_unit.status = OCCUPIED
   - Creates payment schedule (monthly payments)
4. Returns updated agreement
5. Tenant receives notification (if implemented)
```

**Reject Application:**
```
1. Landlord → "Reject" + reason
2. Frontend → POST /api/rentals/agreements/{id}/process_application/
   Body: {"action": "reject", "rejection_reason": "..."}
3. Backend sets agreement.status = REJECTED
4. Unit remains AVAILABLE
```

#### D. Payment Management Flow:

**View Payments:**
```
1. Landlord → "Payments"
2. Frontend → GET /api/payments/
3. Backend filters:
   Payment.objects.filter(
     rental_agreement__house_unit__property__landlord=request.user.landlord
   )
4. Displays payment list with status
```

**Record Manual Payment:**
```
1. Tenant pays cash/bank transfer
2. Landlord → payment → "Record Payment"
3. Frontend → POST /api/payments/{id}/record_payment/
   Body: {
     "payment_method": "CASH",
     "transaction_reference": "TXN123",
     "notes": "Cash received"
   }
4. Backend:
   - Sets payment.status = COMPLETED
   - Sets payment.payment_date = now()
5. Updates payment list
```

**Payment Statistics:**
```
Frontend → GET /api/payments/statistics/
Returns:
- total_payments, completed_payments, pending_payments
- overdue_payments, total_revenue, pending_amount
```

---

### 3.3 Tenant Workflow

#### A. Property Discovery Flow:

**Browse Marketplace:**
```
1. Tenant visits marketplace (public access)
2. Frontend → GET /api/marketplace/
3. Query params: property_type, city, area, search
4. Backend returns properties with available units
5. Frontend displays property cards
```

**View Property Details:**
```
1. Tenant clicks property card
2. Frontend → GET /api/marketplace/{id}/
3. Backend returns:
   - Property details
   - Available units with rent_amount, amenities
4. Frontend displays property + unit list
```

**Filter & Search:**
```
Query params supported:
- property_type: APARTMENT, HOUSE, COMMERCIAL, LAND
- city: "Dar es Salaam"
- area: "Magomeni"
- search: keyword search
- has_available: true (only properties with available units)
```

#### B. Rental Application Flow:

**Apply for Unit:**
```
1. Tenant selects unit → "Apply"
2. Fills application form:
   - start_date (desired move-in)
   - end_date (lease end)
   - terms_conditions (optional notes)
3. Frontend → POST /api/rentals/agreements/apply/
   Body: {
     "house_unit": 5,
     "start_date": "2026-09-01",
     "end_date": "2027-08-31",
     "terms_conditions": "..."
   }
4. Backend:
   - Creates RentalAgreement with status=APPLIED
   - Sets monthly_rent from unit.rent_amount
   - Calculates deposit_amount
5. Returns agreement object
6. Frontend shows success + "Application Pending"
```

**View Applications:**
```
Frontend → GET /api/rentals/agreements/my_applications/
Returns: tenant's agreements with status=APPLIED
```

#### C. Active Lease Management:

**View Agreements:**
```
Frontend → GET /api/rentals/agreements/
Filters: agreements where user.tenant = logged-in tenant
Shows: ACTIVE, APPROVED, EXPIRED agreements
```

**View Agreement Details:**
```
Frontend → GET /api/rentals/agreements/{id}/
Returns:
- Agreement info (dates, rent, deposit)
- Unit details
- Landlord contact
- Payment schedule
```

#### D. Payment Flow:

**View Payments:**
```
Frontend → GET /api/payments/my_payments/
Returns: Payment.objects.filter(rental_agreement__tenant=user.tenant)
Displays: amount, due_date, status, payment_method
```

**Initiate Online Payment (ClickPesa):**
```
1. Tenant selects PENDING payment → "Pay Now"
2. Frontend → POST /api/payments/{id}/initiate_payment/
   Body: {"payment_gateway": "CLICKPESA"}
3. Backend:
   - Calls ClickPesa API with:
     * amount, msisdn (from user.phone)
     * callback_url
   - Creates PaymentGatewayLog
   - Sets payment.status = PROCESSING
4. ClickPesa sends USSD-PUSH to tenant's phone
5. Tenant enters mobile wallet PIN
6. ClickPesa sends webhook → POST /api/webhook/clickpesa/
7. Backend:
   - Validates callback
   - Updates payment.status = COMPLETED
   - Logs transaction
8. Frontend polls or receives update
9. Shows "Payment Successful"
```

**View Overdue Payments:**
```
Frontend → GET /api/payments/overdue/
Returns: payments where status=PENDING and due_date < today
```

---

## 4. API ENDPOINT REFERENCE

### 4.1 Authentication Endpoints
```
POST   /api/auth/register/           - User registration
POST   /api/auth/login/              - User login
POST   /api/auth/logout/             - User logout
GET    /api/auth/profile/            - Get user profile
PUT    /api/auth/profile/            - Update profile
POST   /api/auth/token/refresh/      - Refresh JWT token
```

### 4.2 Property Endpoints (Landlord)
```
GET    /api/properties/              - List landlord's properties
POST   /api/properties/              - Create property
GET    /api/properties/{id}/         - Property details
PUT    /api/properties/{id}/         - Update property
DELETE /api/properties/{id}/         - Delete property
GET    /api/properties/{id}/available_units/ - Available units
```

### 4.3 Unit Endpoints (Landlord)
```
GET    /api/units/                   - List units
POST   /api/units/                   - Create unit
GET    /api/units/{id}/              - Unit details
PUT    /api/units/{id}/              - Update unit
POST   /api/units/{id}/update_status/ - Update status
```

### 4.4 Marketplace Endpoints (Tenant - Public)
```
GET    /api/marketplace/             - Browse properties
GET    /api/marketplace/{id}/        - Property details
```

### 4.5 Rental Agreement Endpoints
```
GET    /api/rentals/agreements/      - List agreements
POST   /api/rentals/agreements/apply/ - Apply for rental
GET    /api/rentals/agreements/{id}/ - Agreement details
POST   /api/rentals/agreements/{id}/process_application/ - Approve/Reject
POST   /api/rentals/agreements/{id}/terminate/ - Terminate agreement
GET    /api/rentals/agreements/my_applications/ - Tenant applications
GET    /api/rentals/agreements/pending_applications/ - Landlord pending
```

### 4.6 Payment Endpoints
```
GET    /api/payments/                - List payments
GET    /api/payments/{id}/           - Payment details
POST   /api/payments/{id}/record_payment/ - Record manual payment (Landlord)
POST   /api/payments/{id}/initiate_payment/ - Online payment (Tenant)
GET    /api/payments/my_payments/    - Tenant payments
GET    /api/payments/overdue/        - Overdue payments
GET    /api/payments/statistics/     - Payment stats (Landlord)
POST   /api/webhook/clickpesa/       - Payment gateway webhook
```

---

## 5. SECURITY & PERMISSIONS

### 5.1 Authentication Requirements
- All endpoints require JWT authentication EXCEPT:
  - `/api/auth/register/`
  - `/api/auth/login/`
  - `/api/marketplace/` (public browsing)

### 5.2 Role-Based Access Control

**LANDLORD can:**
- Create/edit/delete own properties and units
- View applications for own properties
- Approve/reject applications
- View payments for own properties
- Record manual payments
- View payment statistics

**TENANT can:**
- Browse marketplace
- Apply for units
- View own applications and agreements
- View own payment schedule
- Initiate online payments

**ADMIN can:**
- Full access to all resources
- User management via Django admin

### 5.3 Ownership Verification
Backend filters ensure:
- Landlords only see/modify their properties
- Tenants only see their agreements/payments
- Cross-user data access is prevented

---

## 6. PAYMENT INTEGRATION

### 6.1 ClickPesa Integration (Tanzania Mobile Money)

**Supported Currency:** TZS (Tanzanian Shillings)

**Payment Flow:**
1. Tenant initiates payment
2. System calls ClickPesa API with USSD-PUSH
3. ClickPesa sends prompt to tenant's phone
4. Tenant enters PIN to authorize
5. ClickPesa sends webhook callback
6. System updates payment status
7. Receipt generated

**Environment Variables (.env):**
```
CLICKPESA_API_KEY=your_api_key
CLICKPESA_API_SECRET=your_api_secret
CLICKPESA_MERCHANT_ID=your_merchant_id
CLICKPESA_CALLBACK_URL=http://yourdomain.com/api/webhook/clickpesa/
```

---

## 7. FRONTEND STRUCTURE

### 7.1 Directory Layout
```
frontend/
├── src/
│   ├── App.jsx                 - Main app component
│   ├── main.jsx                - Entry point
│   ├── index.css               - Global styles
│   ├── components/             - Reusable UI components
│   ├── pages/                  - Page components
│   │   ├── auth/               - Login, Register
│   │   ├── landlord/           - Landlord dashboard, properties, units
│   │   ├── tenant/             - Tenant dashboard, marketplace
│   │   └── shared/             - Shared pages
│   ├── context/                - React Context (AuthContext, etc.)
│   └── services/               - API service layer (axios)
├── public/                     - Static assets
└── index.html                  - HTML template
```

### 7.2 Key Frontend Features
- JWT token management (localStorage)
- Protected routes based on role
- Axios interceptors for token refresh
- Responsive design with Tailwind CSS
- Form validation and error handling
- Loading states and notifications

---

## 8. DEPLOYMENT

### 8.1 Backend Deployment (Render/Railway)
```bash
# Build command (in backend/)
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate

# Start command
gunicorn core.wsgi:application
```

### 8.2 Frontend Deployment (Vercel/Netlify)
```bash
# Build command (in frontend/)
npm run build

# Output directory
dist/
```

### 8.3 Environment Variables (Production)
Backend:
- SECRET_KEY
- DEBUG=False
- ALLOWED_HOSTS
- DATABASE_URL (PostgreSQL)
- CLICKPESA_API_KEY
- CLICKPESA_API_SECRET

Frontend:
- VITE_API_BASE_URL=https://api.yourdomain.com

---

## 9. DEVELOPMENT SETUP

### 9.1 Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 9.2 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 9.3 Access Points
- Backend API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/
- Frontend: http://localhost:3000/

---

## 10. KEY BUSINESS RULES

1. **Unit Availability:**
   - Unit must be AVAILABLE for tenant application
   - No overlapping ACTIVE agreements on same unit

2. **Agreement Lifecycle:**
   - APPLIED → (landlord reviews) → APPROVED/REJECTED
   - APPROVED → ACTIVE (when tenant moves in)
   - ACTIVE → EXPIRED (end_date reached) or TERMINATED (early termination)

3. **Payment Generation:**
   - Payments auto-created when agreement becomes ACTIVE
   - Monthly payments from start_date to end_date
   - First payment includes deposit_amount

4. **Unit Status Updates:**
   - Agreement ACTIVE → Unit OCCUPIED
   - Agreement EXPIRED/TERMINATED → Unit AVAILABLE (if no other active)
   - Manual override via update_status endpoint

5. **Overdue Detection:**
   - Payments auto-marked OVERDUE when due_date < today
   - Periodic task recommended for checking

---

## 11. FUTURE ENHANCEMENTS

Potential features to add:
- Email/SMS notifications
- Document upload (ID, contracts)
- Maintenance request system
- Expense tracking for landlords
- Review/rating system
- Multi-language support
- Mobile app (React Native)
- Advanced analytics dashboard
- Automated rent reminders
- Late payment penalties
- Contract e-signing

---

## 12. SUMMARY

This SMRS system provides a complete digital solution for managing rental properties in Tanzania. The workflow enables:

**For Landlords:**
- Centralized property & unit management
- Efficient tenant application processing
- Automated payment tracking
- Financial reporting

**For Tenants:**
- Easy property discovery
- Online application process
- Digital payment via mobile money
- Transparent payment history

**Technology Stack:**
- Modern, scalable architecture
- Secure JWT authentication
- Mobile-first responsive design
- Integrated payment gateway
- RESTful API design

The system follows the reviewed ERD structure with accurate primary and foreign key relationships across all entities.
