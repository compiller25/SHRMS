import json
import time
import hmac
import hashlib

import requests
from decouple import config
from .models import Payment, PaymentGatewayLog


def canonicalize(obj):
    """Sort keys recursively so a payload has a stable serialization."""
    if isinstance(obj, list):
        return [canonicalize(i) for i in obj]
    if isinstance(obj, dict):
        return {k: canonicalize(obj[k]) for k in sorted(obj.keys())}
    return obj


def create_payload_checksum(checksum_key, payload):
    """HMAC-SHA256 over the canonicalized compact JSON of the payload."""
    canonical = canonicalize(payload)
    payload_str = json.dumps(canonical, separators=(',', ':'))
    return hmac.new(
        checksum_key.encode('utf-8'),
        payload_str.encode('utf-8'),
        hashlib.sha256,
    ).hexdigest()


class ClickPesaService:
    """ClickPesa Mobile Money USSD-PUSH gateway (the only payment gateway)."""

    BASE_URL = config('CLICKPESA_BASE_URL', default='https://api.clickpesa.com/third-parties')
    TOKEN_TTL_SECONDS = 55 * 60  # refresh 5 min before the 60-min expiry

    def __init__(self):
        self.client_id = config('CLICKPESA_CLIENT_ID', default='')
        self.api_key = config('CLICKPESA_API_KEY', default='')
        self.checksum_key = config('CLICKPESA_CHECKSUM_KEY', default='')
        self._token = None
        self._token_expires_at = 0

    # -- token -----------------------------------------------------------
    def get_token(self):
        """Return a valid JWT, refreshing it when near/at expiry."""
        if self._token and time.time() < self._token_expires_at:
            return self._token

        response = requests.post(
            f'{self.BASE_URL}/generate-token',
            headers={
                'client-id': self.client_id,
                'api-key': self.api_key,
            },
            timeout=30,
        )
        data = response.json()
        if response.status_code != 200 or not data.get('success'):
            raise ClickPesaException(response.status_code, data)

        # Token already carries the "Bearer " prefix — use it verbatim.
        self._token = data['token']
        self._token_expires_at = time.time() + self.TOKEN_TTL_SECONDS
        return self._token

    def _headers(self):
        return {
            'Authorization': self.get_token(),
            'Content-Type': 'application/json',
        }

    def _maybe_checksum(self, payload):
        if not self.checksum_key:
            return payload
        payload['checksum'] = create_payload_checksum(self.checksum_key, payload)
        return payload

    # -- helpers ---------------------------------------------------------
    def _order_reference(self, payment):
        # Alphanumeric only (no hyphens/symbols allowed by ClickPesa).
        return f'PAY{payment.id}'

    @staticmethod
    def _normalize_phone(phone):
        """Normalize to international format 255XXXXXXXXX (no +, no leading 0)."""
        if not phone:
            return phone
        phone = phone.replace(' ', '').replace('-', '')
        if phone.startswith('+'):
            phone = phone[1:]
        if phone.startswith('0'):
            phone = '255' + phone[1:]
        return phone

    # -- Step 1: Preview ------------------------------------------------
    def preview_order(self, payment, phone_number):
        """Validate details and return available mobile money channels + fees."""
        payload = {
            'amount': str(payment.amount),
            'currency': 'TZS',
            'orderReference': self._order_reference(payment),
            'phoneNumber': phone_number,
            'fetchSenderDetails': True,
        }
        self._maybe_checksum(payload)
        response = requests.post(
            f'{self.BASE_URL}/payments/preview-ussd-push-request',
            json=payload,
            headers=self._headers(),
            timeout=30,
        )
        data = response.json()
        if response.status_code != 200:
            raise ClickPesaException(response.status_code, data)
        return data

    # -- Step 2: Initiate USSD-PUSH --------------------------------------
    def initiate_ussd_push(self, payment, phone_number):
        """Validate, then send the USSD-PUSH to the customer's phone."""
        phone_number = self._normalize_phone(phone_number or '')
        if not phone_number:
            raise ValueError('Tenant has no phone number on file')

        # Preview first: catch invalid details / missing channels early.
        preview = self.preview_order(payment, phone_number)
        available = [m for m in preview.get('activeMethods', []) if m.get('status') == 'AVAILABLE']
        if not available:
            raise ClickPesaException(404, {'message': 'No available payment channels for this number'})

        order_reference = self._order_reference(payment)
        payload = {
            'amount': str(payment.amount),
            'currency': 'TZS',
            'orderReference': order_reference,
            'phoneNumber': phone_number,
        }
        self._maybe_checksum(payload)
        response = requests.post(
            f'{self.BASE_URL}/payments/initiate-ussd-push-request',
            json=payload,
            headers=self._headers(),
            timeout=30,
        )
        data = response.json()
        if response.status_code != 200:
            raise ClickPesaException(response.status_code, data)

        payment.transaction_reference = order_reference
        payment.gateway_transaction_id = data.get('id', '')
        payment.save()

        PaymentGatewayLog.objects.create(
            payment=payment,
            gateway='CLICKPESA',
            transaction_id=data.get('id', ''),
            request_data=payload,
            response_data=data,
            status=data.get('status', 'PROCESSING'),
        )

        return {
            'success': True,
            'transaction_id': data.get('id', ''),
            'status': data.get('status'),
            'order_reference': order_reference,
        }

    # -- Step 3: Query status --------------------------------------------
    def check_payment_status(self, payment):
        """Poll ClickPesa for the latest status; persist terminal outcomes."""
        if not payment.transaction_reference:
            raise ClickPesaException(400, {'error': 'Payment has no ClickPesa order reference'})

        response = requests.get(
            f'{self.BASE_URL}/payments/{payment.transaction_reference}',
            headers={'Authorization': self.get_token()},
            timeout=30,
        )
        if response.status_code != 200:
            return {'success': False, 'status': 'UNKNOWN', 'detail': response.text}

        payments = response.json()
        data = payments[0] if isinstance(payments, list) and payments else payments
        status = (data or {}).get('status')

        self._apply_status(payment, status)
        return {
            'success': status in ('SUCCESS', 'SETTLED'),
            'status': status,
        }

    # -- Webhook ---------------------------------------------------------
    def process_webhook(self, raw_payload):
        """Process a ClickPesa status callback sent by webhook."""
        if not isinstance(raw_payload, dict):
            raw_payload = {'data': raw_payload}

        checksum = raw_payload.get('checksum')
        if checksum and not self.verify_webhook_checksum(raw_payload, checksum):
            return {'success': False, 'error': 'Invalid checksum'}

        data = raw_payload.get('data', raw_payload)
        status = (data.get('status') or '').upper()
        order_reference = data.get('orderReference', '')
        transaction_id = data.get('id', '')

        payment = Payment.objects.filter(transaction_reference=order_reference).first()
        if payment:
            if transaction_id:
                payment.gateway_transaction_id = transaction_id
            self._apply_status(payment, status)
            return {'success': True, 'payment_id': payment.id, 'status': status}
        return {'success': True, 'payment_id': None, 'status': status}

    def verify_webhook_checksum(self, payload, received_checksum):
        if not self.checksum_key:
            return True
        to_sign = {k: v for k, v in payload.items() if k not in ('checksum', 'checksumMethod')}
        expected = create_payload_checksum(self.checksum_key, to_sign)
        return hmac.compare_digest(expected, received_checksum)

    @staticmethod
    def _apply_status(payment, status):
        status = (status or '').upper()
        if status in ('SUCCESS', 'SETTLED'):
            payment.mark_as_paid(payment_method='CLICKPESA')
        elif status == 'FAILED':
            payment.status = Payment.PaymentStatus.FAILED
            payment.save()


class ClickPesaException(Exception):
    """Raised on ClickPesa API errors. Accepts (status_code, data) or a message."""

    def __init__(self, *args):
        super().__init__(args)
        if len(args) == 2 and isinstance(args[0], int):
            self.status_code, self.data = args
        else:
            self.status_code = None
            self.data = {'message': str(args[0]) if args else 'ClickPesa error'}

    def __str__(self):
        if self.data and isinstance(self.data, dict):
            return json.dumps(self.data)
        return str(self.data)