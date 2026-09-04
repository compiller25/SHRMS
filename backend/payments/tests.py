from datetime import timedelta
from unittest.mock import Mock, patch

from django.test import TestCase
from django.utils import timezone

from properties.models import HouseUnit, Property
from rentals.models import RentalAgreement
from users.models import User

from .models import Payment, PaymentGatewayLog
from .services import ClickPesaException, ClickPesaService, create_payload_checksum


class ClickPesaServiceUnitTests(TestCase):
    """Pure helper logic — no external calls / no DB fixture needed."""

    def test_normalize_phone(self):
        svc = ClickPesaService()
        self.assertEqual(svc._normalize_phone('+255712345678'), '255712345678')
        self.assertEqual(svc._normalize_phone('0712345678'), '255712345678')
        self.assertEqual(svc._normalize_phone('255 712 345 678'), '255712345678')
        self.assertEqual(svc._normalize_phone(''), '')

    def test_checksum_is_deterministic_and_stable(self):
        payload = {'amount': '350000', 'currency': 'TZS', 'orderReference': 'PAY1'}
        a = create_payload_checksum('secret', payload)
        b = create_payload_checksum('secret', payload)
        self.assertEqual(a, b)
        # key-invariant ordering: payload keys sorted recursively
        self.assertNotEqual(
            create_payload_checksum('secret', payload),
            create_payload_checksum('other', payload),
        )

    def test_verify_webhook_checksum_when_key_blank(self):
        svc = ClickPesaService()  # .env has CLICKPESA_CHECKSUM_KEY blank
        svc.checksum_key = ''
        self.assertTrue(svc.verify_webhook_checksum({'status': 'SUCCESS'}, 'whatever'))

    def test_verify_webhook_checksum_with_key(self):
        svc = ClickPesaService()
        svc.checksum_key = 'k'
        payload = {'status': 'SUCCESS', 'orderReference': 'PAY1'}
        to_sign = {k: v for k, v in payload.items() if k not in ('checksum', 'checksumMethod')}
        good = create_payload_checksum('k', to_sign)
        self.assertTrue(svc.verify_webhook_checksum(payload, good))
        self.assertFalse(svc.verify_webhook_checksum(payload, 'badsum'))

    def test_get_token_refreshes_once(self):
        svc = ClickPesaService()
        first, second = {'success': True, 'token': 'Bearer A'}, {'success': True, 'token': 'Bearer B'}
        with patch('requests.post', side_effect=[Mock(status_code=200, json=lambda: first),
                                                 Mock(status_code=200, json=lambda: second)]) as m:
            self.assertEqual(svc.get_token(), 'Bearer A')  # validates + caches
            self.assertEqual(svc.get_token(), 'Bearer A')  # cached, no second call
            m.assert_called_once()

    def test_get_token_error(self):
        svc = ClickPesaService()
        with patch('requests.post', return_value=Mock(status_code=401, json=lambda: {})):
            with self.assertRaises(ClickPesaException):
                svc.get_token()


class PaymentFixtureTest(TestCase):
    """End-to-end service behavior against a real (test) Payment row."""

    def _make_payment(self, due=None):
        landlord = User.objects.create_user(
            username='landowner', email='landlord@example.com', role=User.Role.LANDLORD, phone='+255700000000').landlord
        tenant = User.objects.create_user(
            username='renter', email='tenant@example.com', role=User.Role.TENANT, phone='+255712345678').tenant
        prop = Property.objects.create(
            landlord=landlord, name='Test House', property_type='APARTMENT',
            address='Plot 1', city='Dar es Salaam', area='Magomeni')
        unit = HouseUnit.objects.create(property=prop, unit_number='A1', bedrooms=2, bathrooms=1, rent_amount=350000)
        agreement = RentalAgreement.objects.create(
            house_unit=unit, tenant=tenant,
            start_date=timezone.now().date(), end_date=timezone.now().date() + timedelta(days=365),
            monthly_rent=350000, deposit_amount=350000, status='ACTIVE')
        return Payment.objects.create(
            rental_agreement=agreement, amount=350000,
            due_date=(timezone.now().date() + timedelta(days=30)), status='PENDING')

    def test_order_reference_and_phone(self):
        payment = self._make_payment()
        svc = ClickPesaService()
        self.assertEqual(svc._order_reference(payment), f'PAY{payment.id}')

    @patch('requests.post')
    def test_initiate_ussd_push_success(self, mock_post):
        payment = self._make_payment()
        svc = ClickPesaService()
        with patch.object(ClickPesaService, 'get_token', return_value='Bearer T'):
            # preview returns an available channel
            mock_post.side_effect = [
                Mock(status_code=200, json=lambda: {'activeMethods': [{'name': 'VODACOM', 'status': 'AVAILABLE'}]}),  # preview
                Mock(status_code=200, json=lambda: {'id': 'tx-uuid', 'status': 'PROCESSING'}),  # initiate
            ]
            result = svc.initiate_ussd_push(payment, '+255712345678')

        payment.refresh_from_db()
        self.assertTrue(result['success'])
        self.assertEqual(result['transaction_id'], 'tx-uuid')
        self.assertEqual(payment.transaction_reference, f'PAY{payment.id}')
        self.assertEqual(payment.gateway_transaction_id, 'tx-uuid')
        self.assertTrue(PaymentGatewayLog.objects.filter(payment=payment, gateway='CLICKPESA').exists())

    def test_initiate_rejects_missing_phone(self):
        payment = self._make_payment()
        svc = ClickPesaService()
        with self.assertRaises(ValueError):
            svc.initiate_ussd_push(payment, '')

    def test_initiate_no_available_channel(self):
        payment = self._make_payment()
        svc = ClickPesaService()
        with patch.object(ClickPesaService, 'get_token', return_value='Bearer T'):
            with patch('requests.post', return_value=Mock(status_code=200, json=lambda: {
                'activeMethods': [{'name': 'ePesa', 'status': 'UNSUPPORTED'}]})):
                with self.assertRaises(ClickPesaException):
                    svc.initiate_ussd_push(payment, '+255712345678')

    @patch('requests.get')
    def test_check_status_marks_paid(self, mock_get):
        payment = self._make_payment()
        payment.transaction_reference = f'PAY{payment.id}'
        payment.save(update_fields=['transaction_reference'])
        mock_get.return_value = Mock(status_code=200, json=lambda: [{'status': 'SUCCESS'}])
        svc = ClickPesaService()
        with patch.object(ClickPesaService, 'get_token', return_value='Bearer T'):
            res = svc.check_payment_status(payment)
        payment.refresh_from_db()
        self.assertTrue(res['success'])
        self.assertEqual(payment.status, 'COMPLETED')

    @patch('requests.get')
    def test_check_status_failed(self, mock_get):
        payment = self._make_payment()
        payment.transaction_reference = f'PAY{payment.id}'
        payment.save(update_fields=['transaction_reference'])
        mock_get.return_value = Mock(status_code=200, json=lambda: [{'status': 'FAILED'}])
        svc = ClickPesaService()
        with patch.object(ClickPesaService, 'get_token', return_value='Bearer T'):
            svc.check_payment_status(payment)
        payment.refresh_from_db()
        self.assertEqual(payment.status, 'FAILED')

    def test_process_webhook_completes_payment(self):
        payment = self._make_payment()
        payment.transaction_reference = f'PAY{payment.id}'
        payment.save(update_fields=['transaction_reference'])
        svc = ClickPesaService()
        res = svc.process_webhook({'data': {'status': 'SUCCESS', 'orderReference': f'PAY{payment.id}', 'id': 'wtx-1'}})
        payment.refresh_from_db()
        self.assertTrue(res['success'])
        self.assertEqual(payment.status, 'COMPLETED')
        self.assertEqual(payment.gateway_transaction_id, 'wtx-1')