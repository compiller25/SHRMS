# SMRS — Where We Ended Today & Tomorrow's Start (Plan / Handoff)

> Session date: 2026-08-06 (written 2026-08-07). This is the plan.md the user asked for — it captures where the project ends today and where tomorrow begins to wind it up.

## Context

SMRS is a Smart Rental Management System — a Django 5 + DRF backend and a React/Vite/Tailwind frontend for managing Tanzanian rental properties, tenants, agreements, and **ClickPesa USSD-Mobile-Money payments**. This plan captures (1) where the project stands at end of today (2026-08-06), and (2) the prioritized checklist to **wind up** the project, focused on **making ClickPesa payments live end-to-end** plus **cleanup and automated tests** (the user's chosen scope, confirmed in the session).

- Working dir: `C:\Users\Kilimanimedia\Desktop\SMRS`
- Stack: `backend/` Django 5 DRF + JWT (SQLite locally, Postgres in `.env`), `frontend/` Vite React + Tailwind + axios + react-router.
- Run there: `start-backend.bat` (port 8000, `manage.py runserver`), `start-frontend.bat` (port 3000, `npm run dev`). A production frontend build already exists at `frontend/dist` (built today 20:53).
- **Not yet a git repo** (no `.git`). Git init is prerequisite for the cleanup/webhook work.

## Where we ended today (end-of-day state)

Payment system fully built:

Backend (`backend/payments/`):
- `services.py` — `ClickPesaService` for USSD-PUSH: `get_token()` (JWT w/ 55-min refresh), `preview_order()` (channels + fees), `initiate_ussd_push()` (normalizes phone to `255<...>`, previews first, persists `transaction_reference`/`gateway_transaction_id`, writes `PaymentGatewayLog`), `check_payment_status()` (polling fallback), `process_webhook()` (checksum + status apply), `verify_webhook_checksum()`, HMAC-SHA256 `create_payload_checksum()`. Order ref is `PAY{payment.id}` (alphanumeric only).
- `views.py` — `initiate_payment` (tenant-only, triggers USSD push over tenant's phone), `check_status` (polling fallback → `mark_as_paid`/FAILED), `payment_webhook` (AllowAny `POST /api/webhook/clickpesa/`), plus existing `record_payment`, `my_payments`, `overdue`, `statistics`.
- `models.py` — `Payment.payment_method` supports `CLICKPESA`; `PaymentGatewayLog` added; store order ref + gateway tx id.
- `urls.py` — router at `/api/payments/...`, webhook at `/api/webhook/<gateway>/`.
- `.env` — ClickPesa `CLICKPESA_CLIENT_ID`, `CLICKPESA_API_KEY`, `CLICKPESA_BASE_URL=https://api.clickpesa.com/third-parties`. `CLICKPESA_CHECKSUM_KEY` is **blank** (checksums not enabled on the app).
- `API_DOCUMENTATION.md` updated with the live payment flow + webhook.

### Frontend:
- `services/api.js` → `initiatePayment`, `checkPaymentStatus`; `paymentsAPI` wired.
- `pages/Tenant/Payments.jsx` (420 lines) updated for the init/status flow; `pages/Admin/Dashboard.jsx` updated.
- `frontend/dist` built successfully (compiles clean).

### Known gap / the thing holding up "live"
The ClickPesa **webhook endpoint is not configured in the ClickPesa dashboard**, and **no real end-to-end** (real USSD push → completed) has been run against live/credentialed data yet. Polling via `check_status` is the safe fallback.

## Punch list (TODO) — Tomorrow begins here

### Phase A — Cleanup + tests (do this first; it de-risks the live test)
1. **Git init** the repo (`.gitignore` already exists); add a `backend/.env.example` listing every var (`SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DB_*`, `CLICKPESA_CLIENT_ID/API_KEY/BASE_URL/CHECKSUM_KEY`) with **placeholders, no secrets**. Confirm `backend/.env` is gitignored.
2. **Automated tests for the gateway** (`backend/payments/tests.py`) using `unittest.mock` to stub `requests`:
   - token fetch success / non-200.
   - `initiate_ussd_push`: valid channels → order flow; no available channel → `ClickPesaException`; missing phone → `ValueError`; phone normalization (`+255...`, `0...`, spaces).
   - `check_payment_status`: `SUCCESS`/`FAILED` → payment marked paid/failed.
   - `process_webhook`: real-shaped payload applies status; checksum tolerated when key blank; bad checksum rejected when key set.
3. **Run the full existing suite** (Django TestRunner) and get it green.
4. **Stale files** to tidy from root (`a.txt`, `clickpesa-ussd-push-api-docs.md`, `image.png`, `test_backend.py`) — keep-in-docs vs delete vs move.

### 2 — Make payments live (end-to-end)
1. **Run migrations** so `Payment`/`PaymentGatewayLog` fields are applied.
2. **Start backend + frontend**, create/verify demo data: landlord, property, unit (`AVAILABLE`), tenant with a valid MoWallet phone (`+255...`), agreement, then a `PENDING` `Payment` row.
3. **Live USSD test path**: `POST /api/payments/{id}/initiate_payment/` (`{ "payment_gateway": "CLICKPESA" }`) → USSD push on tenant's phone → PIN entry → `PROCESSING`, then final status.
4. **Wire the webhook** (instant status; recommended): tunnel the backend (e.g. `ngrok http 8000`) → ClickPesa dashboard → Settings → Developers → Webhooks (app webhooks take priority over merchant webhooks per docs) → add `PAYMENT RECEIVED`/`PAYMENT FAILED` events, URL `https://<tunnel>/api/webhook/clickpesa/`. Cross-check the actual payload shape against `process_webhook` parsing using the samples in `clickpesa-ussd-push-api-docs.md` lines ~431/456; adjust parsing if the live payload differs.
5. **Polling fallback** — confirm `GET /api/payments/{id}/check_status/` returns `SUCCESS` → auto-completes.
6. **Checksum decision**: enable checksums on the app and fill `CLICKPESA_CHECKSUM_KEY` (recommended for prod hardening) or leave blank for now.
7. Re-confirm end state on the tenant Payments page (paid status, gateway tx id, receipt).

### Out of scope (per your choice)
Production hosting/deploy + the Admin "Reports coming soon" feature.

---

## Verification (end of tomorrow)
- `cd backend && python manage.py test` → all green (incl. new gateway tests).
- Real USSD push goes out on a tenant phone; Payments UI flips to COMPLETED via webhook and/or `check_status` polling.
- `backend/.env.example` exists (placeholders only); no secrets in git; working tree committed.
- Stale scratch files removed or moved out of the repo root.

## Files to touch
- `backend/payments/tests.py` (new gateway tests)
- `backend/payments/services.py`, `views.py`, `models.py` (only if live payload parsing mismatch found)
- `backend/.env.example` (new)
- `frontend/src/pages/Tenant/Payments.jsx`, `src/services/api.js` (only if response shape adjustments needed)
- Repo-root cleanup (`a.txt`, `image.png`, `clickpesa-ussd-push-api-docs.md`, `test_backend.py`)
- `.gitignore` (verify it covers `backend/.env`, `frontend/dist`, `node_modules`, `db.sqlite3`) — this plan file `plan.md` is meant to stay in the repo root.

---

## DB state — resolved (2026-08-07)

**The live database is Postgres `smrs_db`** (per `backend/.env`), and it is complete/intact with all Django framework + app tables and your data. Do NOT strip Django tables from it — Django requires them (`django_migrations`, `django_content_type`, `auth_permission`, `django_session`, …); removing them breaks `migrate`/admin/auth.

- Live DB used by the app: **Postgres `smrs_db`** (all 17 tables; 4 users, 10 properties, 29 units, 2 agreements, 13 payments).
- **Clean app-tables-only artifact** (what was asked): the SQLite files `backend/db.sqlite3` & `db.sqlite3` were reduced to the 8 project tables (`users`, `landlord_profiles`, `tenant_profiles`, `properties`, `house_units`, `rental_agreements`, `payments`, `payment_gateway_logs`). Djangoreserved/framework+M2M tables were parked in **`django_framework_tables.sqlite3`**.
- **Full backups** (everything, pre-surgery): `backend/db.sqlite3.bak_20260807_004822` and `db.sqlite3.bak_20260807_004822`.
- Restore any DB: copy the `.bak_…` file back over its target.

### Verified working (no errors)
- `python manage.py check` → 0 issues; `python manage.py migrate --check` → no pending migrations.
- Backend boots and serves: `GET /api/marketplace/` → 200, `GET /api/payments/` → 401 (auth enforced).
- **13 new ClickPesa gateway tests** in `backend/payments/tests.py` (phone normalization, checksum, USSD initiate, status polling, webhook) — all pass.
- Frontend `npm run build` → production build succeeds (1861 modules).

### Running tests (note)
Postgres user `smrs_user` lacks `CREATEDB`, so `manage.py test` can't create the Postgres test DB. Run tests against a throwaway SQLite test DB instead:
```bash
cd backend
DB_ENGINE=django.db.backends.sqlite3 DB_NAME=$PWD/_test_tmp.sqlite3 python manage.py test
```
(Delete `_test_tmp.sqlite3` after.) Optionally grant Postgres CREATEDB to `smrs_user` if you want default `manage.py test`.

### Optional cleanup (not yet done — destructive, needs your OK)
Stale root files: `a.txt`, `image.png`, `clickpesa-ussd-push-api-docs.md`, `test_backend.py`, `db.sqlite3` (root copy). Recommend keeping `clickpesa-ussd-push-api-docs.md` (used for webhook payload reference) and removing the rest if unneeded.