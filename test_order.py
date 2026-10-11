import json
import urllib.request
import urllib.error

BASE = 'http://127.0.0.1:8000/api/'
EMAIL = 'test@shopnest.fi'      # <- your test user
PASSWORD = 'Sh0pNest!2026'      # <- its password


def call(method, path, data=None, token=None):
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(BASE + path, data=body, method=method)
    req.add_header('Content-Type', 'application/json')
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


_, login = call('POST', 'users/login/', {'username': EMAIL, 'password': PASSWORD})
token = login['token']

# Try to cheat: claim the Airpods cost €0.01 and the total is €0.01
status, order = call('POST', 'orders/add/', {
    'orderItems': [{'product': 1, 'qty': 1, 'price': 0.01}],
    'shippingAddress': {'address': 'Testikatu 1', 'city': 'Helsinki',
                        'postalCode': '00100', 'country': 'Finland'},
    'paymentMethod': 'PayPal',
    'totalPrice': 0.01,
}, token)

print('Status:', status)
print('Total charged:', order.get('totalPrice'), '(should be the REAL price, not 0.01)')
print('VAT included:', order.get('taxPrice'))

status, _ = call('GET', f"orders/{order.get('_id')}/")
print('View order without token:', status, '(should be 401)')

status, data = call('PUT', f"orders/{order.get('_id')}/pay/", {}, token)
print('Old /pay/ endpoint:', status, '(should be 404 or 405, not 200)')