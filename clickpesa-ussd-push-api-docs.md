# ClickPesa Mobile USSD-PUSH Payment API — Full Implementation Guide

> Source: [docs.clickpesa.com](https://docs.clickpesa.com/payment-api/mobile-money-payment-api/mobile-money-payment-api-overview)

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites & Setup](#prerequisites--setup)
3. [Authentication](#authentication)
4. [The 3-Step Payment Flow](#the-3-step-payment-flow)
   - [Step 1: Preview USSD-PUSH Request](#step-1-preview-ussd-push-request)
   - [Step 2: Initiate USSD-PUSH Request](#step-2-initiate-ussd-push-request)
   - [Step 3: Query Payment Status](#step-3-query-payment-status)
5. [Payment Statuses Reference](#payment-statuses-reference)
6. [Webhooks (Real-time Callbacks)](#webhooks-real-time-callbacks)
7. [Checksum / Payload Security](#checksum--payload-security)
8. [Error Reference](#error-reference)
9. [Rate Limits](#rate-limits)
10. [End-to-End Code Example (JavaScript)](#end-to-end-code-example-javascript)

---

## Overview

The **Mobile USSD-PUSH API** allows you to collect payments directly from a customer's mobile money wallet (e.g. Tigo-Pesa, M-Pesa, Airtel-Money) by sending a USSD prompt to their phone. The customer receives a popup on their phone and enters their wallet PIN to authorise the payment — no redirect or checkout page required.

**Base URL:**
```
https://api.clickpesa.com/third-parties
```

**Supported Currency:** `TZS` (Tanzanian Shilling)

**Supported Channels:** TIGO-PESA, M-PESA, AIRTEL-MONEY (availability depends on your merchant account configuration)

---

## Prerequisites & Setup

### 1. Create a ClickPesa Merchant Account

Register at [merchant.clickpesa.com](https://merchant.clickpesa.com) and complete KYC (required to lift API daily limits).

### 2. Create an API Application

1. Log in to the **ClickPesa Dashboard**.
2. Go to **Settings → Developers**.
3. Click **Create Application**.
4. Fill in:
   - **Application Name** — any descriptive name.
   - **Integration Type** — select **API**.
   - **Features** — enable **Payment API** (Collection).
5. Click **Create**.

### 3. Generate an API Key

1. In **Settings → Developers**, open your application.
2. Click **Manage API Keys → Add API Key**.
3. Enter a **Name** and **Expiry Date**.
4. Confirm with your dashboard password.
5. **Copy both the `Client ID` and `API Key` immediately** — the API Key is shown only once.

> ⚠️ Never expose your `Client ID`, `API Key`, or JWT token in client-side code or public repositories. Always use HTTPS.

---

## Authentication

All API calls (except token generation) require a **JWT Bearer Token** in the `Authorization` header. Tokens expire after **60 minutes** and must be refreshed.

### Generate Token

**Endpoint:** `POST /generate-token`

**Headers:**

| Header      | Required | Description                    |
|-------------|----------|--------------------------------|
| `client-id` | ✅       | Your Application Client ID     |
| `api-key`   | ✅       | Your Application API Key       |

**Request (no body required):**

```http
POST https://api.clickpesa.com/third-parties/generate-token
client-id: YOUR_CLIENT_ID
api-key: YOUR_API_KEY
```

**Success Response (200):**

```json
{
  "success": true,
  "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> The `token` field already includes the `Bearer ` prefix. Use the full value as-is in the `Authorization` header on subsequent requests.

**Error Responses:**

| Status | Message                          | Cause                        |
|--------|----------------------------------|------------------------------|
| 401    | `Unauthorized`                   | Missing credentials          |
| 403    | `Invalid client details`         | Wrong Client ID              |
| 403    | `Invalid or Expired API-Key`     | Wrong or expired API Key     |
| 403    | `Unauthorized API-Key`           | API Key not authorised       |

**Token Refresh Strategy (JavaScript example):**

```javascript
let cachedToken = null;
let tokenExpiry = null;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch("https://api.clickpesa.com/third-parties/generate-token", {
    method: "POST",
    headers: {
      "client-id": process.env.CLICKPESA_CLIENT_ID,
      "api-key": process.env.CLICKPESA_API_KEY,
    },
  });

  const data = await res.json();
  if (!data.success) throw new Error("Token generation failed");

  cachedToken = data.token;
  tokenExpiry = Date.now() + 55 * 60 * 1000; // refresh 5 min before expiry
  return cachedToken;
}
```

---

## The 3-Step Payment Flow

```
Your Server                        ClickPesa API               Customer's Phone
     |                                   |                             |
     |-- 1. Preview (validate) --------->|                             |
     |<-- activeMethods, fees -----------|                             |
     |                                   |                             |
     |-- 2. Initiate USSD-PUSH --------->|-- USSD prompt ------------->|
     |<-- PROCESSING status -------------|                             |
     |                                   |       (customer enters PIN) |
     |-- 3. Query status (poll/webhook)->|                             |
     |<-- SUCCESS / FAILED status -------|                             |
```

---

## Step 1: Preview USSD-PUSH Request

**Purpose:** Validates payment details (amount, phone number, order reference) and returns which payment channels (e.g. Tigo-Pesa, M-Pesa) are available and their fees. **Call this before initiating** to catch errors early and display fees to your user.

**Endpoint:** `POST /payments/preview-ussd-push-request`

**Headers:**

| Header          | Value                          |
|-----------------|--------------------------------|
| `Authorization` | `Bearer <your_jwt_token>`      |
| `Content-Type`  | `application/json`             |

**Request Body:**

| Field                | Type    | Required | Description                                                             |
|----------------------|---------|----------|-------------------------------------------------------------------------|
| `amount`             | string  | ✅       | Payment amount (e.g. `"5000"`)                                          |
| `currency`           | string  | ✅       | Must be `"TZS"`                                                         |
| `orderReference`     | string  | ✅       | Your unique order ID — alphanumeric only, no spaces or special chars    |
| `phoneNumber`        | string  | ❌       | Customer phone with country code, no `+` (e.g. `"255712345678"`)       |
| `fetchSenderDetails` | boolean | ❌       | Set `true` to retrieve the sender's name and provider. Default: `false` |
| `checksum`           | string  | ❌       | HMAC-SHA256 checksum if enabled on your account (see Checksum section) |

**Example Request:**

```json
{
  "amount": "10000",
  "currency": "TZS",
  "orderReference": "ORDER20240810001",
  "phoneNumber": "255712345678",
  "fetchSenderDetails": true
}
```

**Success Response (200):**

```json
{
  "activeMethods": [
    {
      "name": "TIGO-PESA",
      "status": "AVAILABLE",
      "fee": 150
    },
    {
      "name": "M-PESA",
      "status": "UNAVAILABLE",
      "message": "Service temporarily unavailable"
    },
    {
      "name": "AIRTEL-MONEY",
      "status": "AVAILABLE",
      "fee": 200
    }
  ],
  "sender": {
    "accountName": "Mathayo John",
    "accountNumber": "255712345678",
    "accountProvider": "TIGO-PESA"
  }
}
```

> The `sender` object is only present if `fetchSenderDetails: true` and the number was found. Use it to confirm the customer's name before charging.

**Error Responses:**

| Status | Message / Cause                                               |
|--------|---------------------------------------------------------------|
| 400    | `Invalid Order Reference` — contains special chars or blank  |
| 400    | `Application has no access to COLLECTION API feature`        |
| 400    | `Valid Client ID is required`                                |
| 401    | `Unauthorized` — token missing, expired, or invalid          |
| 404    | `Account has no payment collection methods`                  |
| 404    | `Account has no valid payment method`                        |
| 409    | `Order reference {ref} already used` — must use a new ref    |

---

## Step 2: Initiate USSD-PUSH Request

**Purpose:** Sends the actual USSD push to the customer's phone. The customer will see a popup asking them to enter their mobile money PIN to complete the payment.

**Endpoint:** `POST /payments/initiate-ussd-push-request`

**Headers:**

| Header          | Value                     |
|-----------------|---------------------------|
| `Authorization` | `Bearer <your_jwt_token>` |
| `Content-Type`  | `application/json`        |

**Request Body:**

| Field            | Type   | Required | Description                                                        |
|------------------|--------|----------|--------------------------------------------------------------------|
| `amount`         | string | ✅       | Payment amount (e.g. `"10000"`)                                    |
| `currency`       | string | ✅       | Must be `"TZS"`                                                    |
| `orderReference` | string | ✅       | Same unique order ID used in the Preview step                      |
| `phoneNumber`    | string | ✅       | Customer phone with country code, no `+` (e.g. `"255712345678"`)  |
| `checksum`       | string | ❌       | HMAC-SHA256 checksum if enabled on your account                    |

**Example Request:**

```json
{
  "amount": "10000",
  "currency": "TZS",
  "orderReference": "ORDER20240810001",
  "phoneNumber": "255712345678"
}
```

**Success Response (200):**

```json
{
  "id": "TXN7890ABCDEF",
  "status": "PROCESSING",
  "channel": "TIGO-PESA",
  "orderReference": "ORDER20240810001",
  "collectedAmount": "10000",
  "collectedCurrency": "TZS",
  "createdAt": "2024-08-10T10:30:00.000Z",
  "clientId": "YOUR_CLIENT_ID"
}
```

> After receiving `PROCESSING`, do **not** re-send the request. Instead, poll the status endpoint or wait for a webhook callback.

**Error Responses:**

| Status | Message / Cause                                           |
|--------|-----------------------------------------------------------|
| 400    | `Invalid / unsupported phone number`                      |
| 400    | `Invalid Order Reference`                                 |
| 400    | `Application has no access to COLLECTION API feature`     |
| 401    | `Unauthorized`                                            |
| 404    | `Account has no payment collection methods`               |
| 409    | `Order reference {ref} already used`                      |
| 500    | `Error validating fee, try again later` — retry with backoff |

---

## Step 3: Query Payment Status

**Purpose:** Check the final outcome of a payment using the `orderReference`. Use this for polling or for verifying a webhook callback.

**Endpoint:** `GET /payments/{orderReference}`

**Headers:**

| Header          | Value                     |
|-----------------|---------------------------|
| `Authorization` | `Bearer <your_jwt_token>` |

**Example Request:**

```http
GET https://api.clickpesa.com/third-parties/payments/ORDER20240810001
Authorization: Bearer eyJhbGciOi...
```

**Success Response (200) — returns an array:**

```json
[
  {
    "id": "TXN7890ABCDEF",
    "status": "SUCCESS",
    "paymentReference": "abc123def456ghi789",
    "paymentPhoneNumber": "255712345678",
    "orderReference": "ORDER20240810001",
    "collectedAmount": 10000,
    "collectedCurrency": "TZS",
    "message": "success",
    "updatedAt": "2024-08-10T10:31:45.000Z",
    "createdAt": "2024-08-10T10:30:00.000Z",
    "customer": {
      "customerName": "Mathayo John",
      "customerPhoneNumber": "255712345678",
      "customerEmail": null
    },
    "clientId": "YOUR_CLIENT_ID"
  }
]
```

**Error Responses:**

| Status | Message                                        |
|--------|------------------------------------------------|
| 401    | `Unauthorized`                                 |
| 404    | `Invalid or missing payment: {orderReference}` |

**Polling Strategy:**

```javascript
async function pollPaymentStatus(orderReference, maxAttempts = 12, intervalMs = 5000) {
  const token = await getToken();

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs));

    const res = await fetch(
      `https://api.clickpesa.com/third-parties/payments/${orderReference}`,
      { headers: { Authorization: token } }
    );

    const payments = await res.json();
    const payment = payments[0];

    if (!payment) continue;

    if (payment.status === "SUCCESS" || payment.status === "SETTLED") {
      return { success: true, payment };
    }

    if (payment.status === "FAILED") {
      return { success: false, payment };
    }

    // PROCESSING or PENDING — keep polling
  }

  return { success: false, error: "Timeout: payment still PROCESSING" };
}
```

---

## Payment Statuses Reference

| Status       | Meaning                                                                    | Action                                |
|--------------|----------------------------------------------------------------------------|---------------------------------------|
| `PROCESSING` | USSD push sent; awaiting customer PIN entry                                | Keep polling or wait for webhook      |
| `PENDING`    | Awaiting further customer action                                           | Keep polling or wait for webhook      |
| `SUCCESS`    | Payment received and confirmed (not yet settled to merchant account)       | Fulfil the order                      |
| `SETTLED`    | Funds settled to your merchant account balance                             | No action needed                      |
| `FAILED`     | Payment failed (wrong PIN, insufficient balance, timeout, etc.)            | Notify customer; allow retry          |
| `ON-HOLD`    | Payment on hold; requires merchant action                                  | Check dashboard                       |
| `REFUNDED`   | Payment not settled; funds returned to customer                            | No action needed                      |
| `REVERSED`   | Payment was settled then reversed back to customer                         | Investigate in dashboard              |

---

## Webhooks (Real-time Callbacks)

Instead of polling, configure webhooks to receive instant push notifications when payment status changes.

### Event Types for USSD Payments

| Event             | Triggered When                              |
|-------------------|---------------------------------------------|
| `PAYMENT RECEIVED`| Customer successfully authorised payment    |
| `PAYMENT FAILED`  | Payment attempt failed                      |

### Webhook Setup

**Application-level** (recommended for API integrations):

1. Go to **Dashboard → Settings → Developers**.
2. Click your application.
3. Under **Application Webhooks**, add your endpoint URL for each event.

**Merchant-level** (fallback for non-app transactions):

1. Go to **Settings → Developers → Webhooks**.
2. Select events and set URLs.

> Application webhooks take priority: if your application has a webhook configured, the merchant webhook is **not** triggered for that application's payments.

### Sample `PAYMENT RECEIVED` Webhook Payload

```json
{
  "event": "PAYMENT RECEIVED",
  "data": {
    "id": "ORDER20240810001LCPXYZ",
    "status": "SUCCESS",
    "paymentReference": "abc123def456ghi789",
    "orderReference": "ORDER20240810001",
    "collectedAmount": "10000",
    "collectedCurrency": "TZS",
    "message": "success",
    "channel": "TIGO-PESA",
    "updatedAt": "2024-08-10T10:31:45.153Z",
    "createdAt": "2024-08-10T10:30:00.000Z",
    "customer": {
      "customerName": "Mathayo John",
      "customerEmail": null,
      "customerPhoneNumber": "255712345678"
    }
  }
}
```

### Sample `PAYMENT FAILED` Webhook Payload

```json
{
  "event": "PAYMENT FAILED",
  "data": {
    "id": "ORDER20240810001LCPXYZ",
    "status": "FAILED",
    "channel": "TIGO-PESA",
    "orderReference": "ORDER20240810001",
    "message": "Insufficient balance",
    "updatedAt": "2024-08-10T10:31:00.000Z",
    "createdAt": "2024-08-10T10:30:00.000Z",
    "clientId": "YOUR_CLIENT_ID"
  }
}
```

### Receiving Webhooks — Server Requirements

- Your endpoint must respond with an **HTTP 2xx** status code to acknowledge receipt.
- ClickPesa sends payloads via **HTTP POST**.
- Optionally verify the `checksum` in the webhook payload (see below) to ensure authenticity.

---

## Checksum / Payload Security

Checksums provide end-to-end tamper protection. When enabled on your account:

- You must include a `checksum` field in your API requests.
- Webhook payloads from ClickPesa will include a `checksum` you can verify.

> ⚠️ If you change checksum settings (on/off), you **must regenerate** your API tokens — existing tokens become invalid.

### Algorithm: HMAC-SHA256 on Canonicalized JSON

**Steps to generate:**

1. **Sort** all object keys alphabetically, recursively at every nesting level.
2. **Serialize** to a compact JSON string (no whitespace).
3. **Hash** using HMAC-SHA256 with your checksum secret key.
4. **Return** as a lowercase 64-character hex string.

> Do **not** include `checksum` or `checksumMethod` fields in the payload when computing the checksum.

### JavaScript Implementation

```javascript
const crypto = require("crypto");

function canonicalize(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(canonicalize);
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = canonicalize(obj[key]);
      return acc;
    }, {});
}

function createPayloadChecksum(checksumKey, payload) {
  const canonical = canonicalize(payload);
  const payloadString = JSON.stringify(canonical);
  const hmac = crypto.createHmac("sha256", checksumKey);
  hmac.update(payloadString);
  return hmac.digest("hex");
}

// Usage
const checksum = createPayloadChecksum("your-secret-key", {
  amount: "10000",
  currency: "TZS",
  orderReference: "ORDER20240810001",
  phoneNumber: "255712345678",
});
```

### Python Implementation

```python
import json, hmac, hashlib

def canonicalize(obj):
    if not isinstance(obj, (dict, list)):
        return obj
    if isinstance(obj, list):
        return [canonicalize(i) for i in obj]
    return {k: canonicalize(obj[k]) for k in sorted(obj.keys())}

def create_payload_checksum(checksum_key, payload):
    canonical = canonicalize(payload)
    payload_str = json.dumps(canonical, separators=(',', ':'), sort_keys=False)
    return hmac.new(
        checksum_key.encode('utf-8'),
        payload_str.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
```

### Validating Webhook Checksums (JavaScript)

```javascript
function validateChecksum(checksumKey, payload, receivedChecksum) {
  const { checksum, checksumMethod, ...payloadForValidation } = payload;
  const computed = createPayloadChecksum(checksumKey, payloadForValidation);
  return computed === receivedChecksum;
}

// In your webhook handler:
app.post("/webhooks/clickpesa", (req, res) => {
  const payload = req.body;
  const isValid = validateChecksum(
    process.env.CHECKSUM_SECRET,
    payload,
    payload.checksum
  );

  if (!isValid) return res.status(400).send("Invalid checksum");

  // Handle the event
  if (payload.event === "PAYMENT RECEIVED") {
    // fulfil order
  }

  res.sendStatus(200);
});
```

---

## Error Reference

### Common Error Codes

| HTTP Status | Error Message                                         | Resolution                                                    |
|-------------|-------------------------------------------------------|---------------------------------------------------------------|
| 400         | `Invalid / unsupported phone number`                  | Use format `255XXXXXXXXX` (9 digits after country code)       |
| 400         | `Invalid Order Reference`                             | Use only alphanumeric characters; no spaces or symbols        |
| 400         | `Application has no access to COLLECTION API feature` | Enable Payment API on your application in the dashboard       |
| 401         | `Unauthorized`                                        | Token expired or missing — regenerate with `generate-token`   |
| 404         | `Account has no payment collection methods`           | Contact ClickPesa support to enable mobile money channels     |
| 404         | `Account has no valid payment method`                 | No active channels for the customer's phone network           |
| 409         | `Order reference {ref} already used`                  | Use a fresh unique `orderReference` for every transaction     |
| 500         | `Error validating fee, try again later`               | Retry after a short delay with exponential backoff            |

---

## Rate Limits

| Limit Type              | Limit                   | Notes                                         |
|-------------------------|-------------------------|-----------------------------------------------|
| Per-IP rate limit       | 120 requests/minute     | Applies to all endpoints                      |
| Pre-KYC daily limit     | 100 API calls/day       | Resets at midnight EAT; removed after KYC    |

Implement **exponential backoff** when you receive HTTP 429 (Too Many Requests) responses.

---

## End-to-End Code Example (JavaScript / Node.js)

This complete example covers token generation, preview, initiation, and polling:

```javascript
const fetch = require("node-fetch");
const crypto = require("crypto");

const BASE_URL = "https://api.clickpesa.com/third-parties";
const CLIENT_ID = process.env.CLICKPESA_CLIENT_ID;
const API_KEY = process.env.CLICKPESA_API_KEY;
const CHECKSUM_KEY = process.env.CLICKPESA_CHECKSUM_KEY; // optional

// ─── Token Management ───────────────────────────────────────────────────────

let cachedToken = null;
let tokenExpiry = null;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(`${BASE_URL}/generate-token`, {
    method: "POST",
    headers: { "client-id": CLIENT_ID, "api-key": API_KEY },
  });

  const data = await res.json();
  if (!data.success) throw new Error("Failed to generate token: " + JSON.stringify(data));

  cachedToken = data.token;
  tokenExpiry = Date.now() + 55 * 60 * 1000;
  return cachedToken;
}

// ─── Checksum (Optional) ─────────────────────────────────────────────────────

function canonicalize(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(canonicalize);
  return Object.keys(obj).sort().reduce((acc, k) => { acc[k] = canonicalize(obj[k]); return acc; }, {});
}

function makeChecksum(payload) {
  if (!CHECKSUM_KEY) return undefined;
  const hmac = crypto.createHmac("sha256", CHECKSUM_KEY);
  hmac.update(JSON.stringify(canonicalize(payload)));
  return hmac.digest("hex");
}

// ─── Step 1: Preview ────────────────────────────────────────────────────────

async function previewPayment({ amount, orderReference, phoneNumber }) {
  const token = await getToken();
  const body = { amount, currency: "TZS", orderReference, phoneNumber, fetchSenderDetails: true };
  const checksum = makeChecksum(body);
  if (checksum) body.checksum = checksum;

  const res = await fetch(`${BASE_URL}/payments/preview-ussd-push-request`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Preview failed (${res.status}): ${err.message}`);
  }

  return res.json();
}

// ─── Step 2: Initiate ───────────────────────────────────────────────────────

async function initiatePayment({ amount, orderReference, phoneNumber }) {
  const token = await getToken();
  const body = { amount, currency: "TZS", orderReference, phoneNumber };
  const checksum = makeChecksum(body);
  if (checksum) body.checksum = checksum;

  const res = await fetch(`${BASE_URL}/payments/initiate-ussd-push-request`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Initiate failed (${res.status}): ${err.message}`);
  }

  return res.json();
}

// ─── Step 3: Poll Status ────────────────────────────────────────────────────

async function pollStatus(orderReference, { maxAttempts = 12, intervalMs = 5000 } = {}) {
  const token = await getToken();

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs));

    const res = await fetch(`${BASE_URL}/payments/${orderReference}`, {
      headers: { Authorization: token },
    });

    if (res.status === 404) continue; // not yet indexed

    const payments = await res.json();
    const payment = Array.isArray(payments) ? payments[0] : null;
    if (!payment) continue;

    if (["SUCCESS", "SETTLED"].includes(payment.status)) return { success: true, payment };
    if (payment.status === "FAILED") return { success: false, payment };
    // PROCESSING / PENDING → keep polling
  }

  return { success: false, error: "Timed out waiting for payment confirmation" };
}

// ─── Full Flow ───────────────────────────────────────────────────────────────

async function collectPayment({ amount, phoneNumber, orderReference }) {
  console.log("1. Previewing payment...");
  const preview = await previewPayment({ amount, orderReference, phoneNumber });

  const available = preview.activeMethods.filter(m => m.status === "AVAILABLE");
  if (available.length === 0) throw new Error("No available payment channels for this number.");

  console.log("Available channels:", available.map(m => `${m.name} (fee: ${m.fee} TZS)`).join(", "));
  if (preview.sender) console.log(`Sender: ${preview.sender.accountName} (${preview.sender.accountProvider})`);

  console.log("\n2. Initiating USSD push...");
  const initiated = await initiatePayment({ amount, orderReference, phoneNumber });
  console.log("Transaction ID:", initiated.id, "| Status:", initiated.status);

  console.log("\n3. Polling for confirmation (customer must enter PIN on their phone)...");
  const result = await pollStatus(orderReference);

  if (result.success) {
    console.log("✅ Payment SUCCESS:", result.payment);
  } else {
    console.log("❌ Payment FAILED:", result.payment?.message || result.error);
  }

  return result;
}

// ─── Run ──────────────────────────────────────────────────────────────────────

collectPayment({
  amount: "10000",
  phoneNumber: "255712345678",
  orderReference: `ORD${Date.now()}`,
}).catch(console.error);
```

---

## Additional Resources

| Resource                        | URL                                                                          |
|---------------------------------|------------------------------------------------------------------------------|
| ClickPesa API Reference         | https://docs.clickpesa.com/api-reference/authorization/generate-token        |
| Payment Statuses                | https://docs.clickpesa.com/home/payment-status                               |
| Webhooks Guide                  | https://docs.clickpesa.com/home/webhooks                                     |
| Checksum Demo Repository        | https://github.com/ClickPesa/clickpesa-api-checksum-demo                    |
| Merchant Dashboard              | https://merchant.clickpesa.com                                               |
| API Application Setup Guide     | https://docs.clickpesa.com/application/api-application-setup                |
