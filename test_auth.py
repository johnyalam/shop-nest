import json
import urllib.request
import urllib.error

BASE = 'http://127.0.0.1:8000/api/users/'


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


def show(label, result):
    status, data = result
    short = {k: (v[:25] + '...' if k in ('token', 'access', 'refresh') else v)
             for k, v in data.items()} if isinstance(data, dict) else data
    print(f'\n{label}  ->  {status}')
    print(json.dumps(short, indent=2))
    return data


EMAIL = 'test@shopnest.fi'
PASSWORD = 'Sh0pNest!2026'

show('1. Register (expect 201)',
     call('POST', 'register/', {'name': 'Test User', 'email': EMAIL, 'password': PASSWORD}))
show('2. Register same email again (expect 400)',
     call('POST', 'register/', {'name': 'Test User', 'email': EMAIL, 'password': PASSWORD}))
show('3. Weak password (expect 400)',
     call('POST', 'register/', {'name': 'Weak', 'email': 'weak@shopnest.fi', 'password': '123'}))

login = show('4. Login with UPPERCASE email (expect 200)',
             call('POST', 'login/', {'username': EMAIL.upper(), 'password': PASSWORD}))
token = login.get('token')

show('5. Wrong password (expect 401)',
     call('POST', 'login/', {'username': EMAIL, 'password': 'wrong-password'}))
show('6. Profile with token (expect 200)', call('GET', 'profile/', token=token))
show('7. Profile without token (expect 401)', call('GET', 'profile/'))
show('8. Update name (expect 200, new name)',
     call('PUT', 'profile/update/', {'name': 'Tester Updated'}, token=token))