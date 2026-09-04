# SMRS Database Rewrite — Design Spec

> Date: 2026-08-07
> Status: Approved in principle (final approvals gathered via Q&A)
> Scope: Full app rewrite of the data layer to match the reviewed ERD, keeping all existing features

## Background / Motivation

The current SMRS app (Django 5 + DRF backend, React/Vite frontend, live **Postgres `smrs_db`**) models a single
`User` table with a `role` column (LANDLORD/TENANT/ADMIN), and hangs properties, units, agreements, and payments
off that one table.

The reviewed project assignment (`DATABASE.txt`, §4.8) specifies **six distinct entities** — landlord, property,
house unit, tenant, rental agreement, payment — each with its own reviewed Primary Key and its own foreign keys.
The assignment states the PK/FK keys are authoritative and must not be altered (names may differ, meaning not).

Because the app must keep **all existing features** (login/register, JWT auth, ClickPesa mobile-money payments,
webhooks, occupancy tracking, amenities, pricing), the principal reconciliation is: keep a thin `users` identity
table for Django authentication, and model landlord/tenant as **separate entities** 1:1-linked to it.

Design decisions confirmed with the user:

| Question | Decision |
|----------|----------|
| Maintenance entity (intro text) | **Skip** — no Maintenance section in assignment |
| Feature fidelity | **Keep all existing features** (auth, payments, occupancy, amenities) |
| Target DB | **Live Postgres `smrs_db`** |
| FK interpretation | **Ownership direction** (FKs on the "many" side of each 1:N) |
| Auth layer | **Keep a `users` identity table** for Django auth; landlord/tenant as separate entities |

---

## Entity set (final)

```
users  1:1⟶ landlord  ──1:N── property ──1:N── house_unit
  │                       │
  └─1:1⟶ tenant ──────────┼──────1:N── rental_agreement ──1:N── payment ──1:N── gateway_log
                          │                                    │                  (user owns many)
```

### Normalization note
The assignment text ("landlord owns many properties", "property contains many units", "unit has many
agreements", "agreement has many payments") governs — so each foreign key lives on the **child (many) side**.

---

## Tables & attributes

### `users` (identity / auth layer — for Django login)
| Column | Type | Key |
|--------|------|-----|
| id | PK (autoincrement Integer) | PK |
| email | varchar(254), unique | — |
| username | varchar(150), unique | — |
| password | varchar(128) (hashed) | — |
| first_name / last_name | varchar(150) | — |
| is_active, is_staff, is_superuser | bool | — |
| last_login | datetime | — |
| date_joined, created_at, updated_at | datetime | — |

> This table exists solely to keep Django `AUTH_USER_MODEL` / login/register working. It is the identity layer;
> role affiliation is derived from whether a `landlord` or `tenant` row points at the user.

### `landlords`  (entity: Landlord)
| Column | Type | Key |
|--------|------|-----|
| landlord_id | PK | PK |
| user_id | FK → users.id | FK, 1:1, unique |
| full_name | varchar(200) |
| gender | varchar(20) |
| phone | varchar(15) |
| email | varchar(254), unique |
| address | text |
| business_name | varchar(200) |
| is_verified | bool |
| verification_documents | file ref |
| created_at / updated_at | datetime |

Relationships: owns many `property`. The old `property_id`/`unit_id` FKs from the literal listing are **not**
columns here — ownership is represented by `property.landlord_id` (ownership direction, per decision).

### `properties`  (entity: Property)
| Column | Type | Key |
|--------|------|-----|
| id | PK | PK |
| landlord_id | FK → landlords.id | FK |
| property_name | varchar(200) |
| property_type | varchar(20) (APARTMENT/HOUSE/COMMERCIAL/LAND) |
| location / city / area | varchar |
| price (avg/listing) | decimal(10,2) |
| status | varchar(20) |
| address | text |
| description | text |
| amenities | text (CSV) |
| image | file ref |
| created_at / updated_at | datetime |

Relationships: belongs to one `landlord`; contains many `house_unit`.

### `house_units`  (entity: House Unit)
| Column | Type | Key |
|--------|------|-----|
| id | PK | PK |
| property_id | FK → properties.id | FK |
| unit_number | varchar(50) |
| unit_type | varchar(50) (e.g. Studio/1BR/2BR) |
| bedrooms / bathrooms | int |
| square_feet | decimal(10,2), null |
| rent_amount | decimal(10,2) |
| currency | varchar(10) default TZS |
| availability_status | varchar(20) (AVAILABLE/OCCUPIED/MAINTENANCE) |
| floor_number | int, null |
| has_parking / has_balcony | bool |
| description / amenities / image | text |
| created_at / updated_at | datetime |

**unique_together** (`property`, `unit_number`).
Relationships: belongs to property; can have many rental agreements over time (via agreement.unit_id).

### `tenants`  (entity: Tenant)
| Column | Type | Key |
|--------|------|-----|
| id | PK | PK |
| user_id | FK → users.id | UNIQUE (1:1) |
| full_name | varchar(200) |
| national_id | varchar(50) |
| gender | varchar(20) |
| phone | varchar(15) |
| email | varchar(254), unique |
| address | text |
| date_of_birth | date, null |
| employment_status / employer_name | varchar |
| emergency_contact_name / phone | varchar |
| created_at / updated_at | datetime |

Relationships: can have one or more rental agreements.

### `rental_agreements` (entity: Rental Agreement)
| Column | Type | Key |
|--------|------|-----|
| id | PK | PK |
| tenant_id | FK → tenants.id | FK |
| unit_id | FK → house_units.id | FK |
| start_date / end_date | date |
| monthly_rent | decimal(10,2) |
| deposit_amount | decimal(10,2) |
| status | varchar(20) (APPLIED/APPROVED/REJECTED/ACTIVE/EXPIRED/TERMINATED) |
| signed_by_tenant / signed_by_landlord | bool |
| signed_at | datetime, null |
| terms_conditions | text |
| rejection_reason | text |
| created_at / updated_at | datetime |

Relationships: belongs to one `tenant` and one `house_unit`; can have many `payment` records.
(`payment_id` FK listed in assignment is not a column here — payments point back via `payment.agreement_id`.)

### `payments` (entity: Payment)
| Column | Type | Key |
|--------|------|-----|
| id | PK | PK |
| agreement_id | FK → rental_agreements.id | FK |
| amount | decimal(10,2) |
| due_date | date |
| payment_date | datetime, null |
| status | varchar(20) (PENDING/COMPLETED/FAILED/OVERDUE) |
| payment_method | varchar(20) (CASH/BANK_TRANSFER/MOBILE_MONEY/CLICKPESA) |
| transaction_reference | varchar(200) |
| gateway_transaction_id | varchar(200) |
| notes / receipt_url | text |
| created_at / updated_at | datetime |

Relationships: belongs to one `rental_agreement`; can have many gateway log rows.

### `payment_gateway_logs` (support table — kept for ClickPesa webhook parity)
| Column | Type | Key |
|--------|------|-----|
| id | PK | PK |
| payment_id | FK → payments.id, null | FK |
| gateway | varchar(50) |
| transaction_id | varchar(200) |
| request_data / response_data | json |
| status | varchar(50) |
| created_at | datetime |

---

## Relationship summary

| Child | FK | Parent | Cardinality |
|-------|----|--------|-------------|
| landlord | user_id | users | 1:1 |
| tenant | user_id | users | 1:1 |
| property | landlord_id | landlords | N:1 |
| house_unit | property_id | properties | N:1 |
| rental_agreement | tenant_id | tenants | N:1 |
| rental_agreement | unit_id | house_units | N:1 |
| payment | agreement_id | rental_agreements | N:1 |
| payment_gateway_log | payment_id | payments | N:1 |

---

## Impact on existing code (rewrite scope)

- `users/models.py` — keep `User` as auth identity; model `LandlordProfile`/`TenantProfile` → real top-level
  `Landlord` / `Tenant` models with `db_table='landlords'` / `'tenants'`.
- `properties/`, `rentals/`, `payments/` models — keep entity structure, rename fields to align with
  assignment attribute names where they differ (e.g. `name`→`property_name`, `full_name` on landlord/tenant),
  keep all service/view/serializer/middleware behavior.
- Serializers/views/permissions — update references (`.landlord`, `.tenant`, role lookups) to navigate via
  new related names while preserving the same API responses.
- **ClickPesa `services.py`, webhooks, `API_DOCUMENTATION.md`, frontend pages** — remain compatible; only
  serializer/model plumbing changes.
- Backend test suite (`tests.py` per app) updated to new model names.
- Database: new Django migrations applied to live **Postgres `smrs_db`** (backup first).

## Migration safety
- A PostgreSQL dump backup (`pg_dump`) of `smrs_db` is taken before applying rewrite migrations.
- Django auth/TDB tables retained (`django_migrations`, `auth_permission`, …) per the earlier plan.
- Because the schema shape changes materially, we go with a controlled rebuild via fresh models + migration
  (drop/recreate app tables) rather than incremental ALTERs, after backup.

---

## Out of scope
- Production hosting / deployment.
- New Maintenance feature (explicitly skipped).
- Changing the frontend UI/UX.

## Verification (done)
- `cd backend && python manage.py migrate` applies cleanly to Postgres.
- All app test suites pass (`users`, `properties`, `rentals`, `payments`).
- Login/register flows work; a landlord can register a property/units; a tenant can apply/sign an agreement;
  a payment can be recorded and a ClickPesa gateway log written.