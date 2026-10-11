import requests
from django.conf import settings


class PayPalError(Exception):
    """Something went wrong talking to PayPal."""


def _request(method, path, token=None, **kwargs):
    headers = kwargs.pop('headers', {})
    if token:
        headers['Authorization'] = f'Bearer {token}'
    try:
        response = requests.request(
            method, f'{settings.PAYPAL_API_BASE}{path}',
            headers=headers, timeout=15, **kwargs)
    except requests.RequestException:
        raise PayPalError('Could not reach PayPal. Please try again.')
    if response.status_code not in (200, 201):
        raise PayPalError('PayPal rejected the request. Please try again.')
    return response.json()


def get_access_token():
    if not settings.PAYPAL_CLIENT_ID or not settings.PAYPAL_CLIENT_SECRET:
        raise PayPalError('PayPal is not configured on the server.')
    data = _request(
        'POST', '/v1/oauth2/token',
        auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
        data={'grant_type': 'client_credentials'})
    return data['access_token']


def create_paypal_order(order):
    """Ask PayPal to create a payment for this order's total. Returns the PayPal order ID."""
    token = get_access_token()
    data = _request('POST', '/v2/checkout/orders', token=token, json={
        'intent': 'CAPTURE',
        'purchase_units': [{
            'reference_id': str(order._id),
            'description': f'ShopNest order #{order._id}',
            'amount': {
                'currency_code': settings.SHOP_CURRENCY,
                'value': str(order.totalPrice),
            },
        }],
    })
    return data['id']


def capture_paypal_order(paypal_order_id):
    """Collect the money for an approved PayPal order. Returns PayPal's full response."""
    token = get_access_token()
    return _request(
        'POST', f'/v2/checkout/orders/{paypal_order_id}/capture', token=token,
        headers={'Content-Type': 'application/json'})