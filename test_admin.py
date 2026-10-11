import json
import urllib.request
import urllib.error

BASE = 'http://127.0.0.1:8000/api/'
EMAIL = 'test@shopnest.fi'      # <- a NON-admin user
PASSWORD = 'Sh0pNest!2026'


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
my_id = login['_id']

status, _ = call('GET', 'users/', token=token)
print('List all users:', status, '(expect 403)')

status, _ = call('PUT', f'users/{my_id}/update/', {'isAdmin': True}, token)
print('Make myself admin:', status, '(expect 403 - this was the original bug)')

status, _ = call('DELETE', f'users/{my_id}/delete/', token=token)
print('Delete a user:', status, '(expect 403)')