import json
import os
import secrets
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, jsonify, request, send_from_directory
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__, static_folder='dist')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'amanora-plaza-admin-secret-2026')

ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@amanoraplaza.com').lower().strip()
DEFAULT_ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Admin@2026')
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'admin_auth.json')
SESSION_HOURS = 12
RESET_TOKEN_HOURS = 1


def load_auth_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as handle:
            return json.load(handle)
    password_hash = generate_password_hash(DEFAULT_ADMIN_PASSWORD)
    data = {
        'email': ADMIN_EMAIL,
        'password_hash': password_hash,
        'sessions': {},
        'reset_tokens': {},
    }
    save_auth_data(data)
    return data


def save_auth_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as handle:
        json.dump(data, handle, indent=2)


def cleanup_expired(data):
    now = datetime.utcnow()
    sessions = data.get('sessions', {})
    data['sessions'] = {
        token: meta
        for token, meta in sessions.items()
        if datetime.fromisoformat(meta['expires_at']) > now
    }
    reset_tokens = data.get('reset_tokens', {})
    data['reset_tokens'] = {
        token: meta
        for token, meta in reset_tokens.items()
        if datetime.fromisoformat(meta['expires_at']) > now
    }


def get_bearer_token():
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header[7:].strip()
    return None


def require_admin_token(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = get_bearer_token()
        if not token:
            return jsonify({'success': False, 'message': 'Authentication required.'}), 401
        data = load_auth_data()
        cleanup_expired(data)
        session = data.get('sessions', {}).get(token)
        if not session:
            save_auth_data(data)
            return jsonify({'success': False, 'message': 'Session expired. Please login again.'}), 401
        if datetime.fromisoformat(session['expires_at']) <= datetime.utcnow():
            data['sessions'].pop(token, None)
            save_auth_data(data)
            return jsonify({'success': False, 'message': 'Session expired. Please login again.'}), 401
        save_auth_data(data)
        request.admin_email = session['email']
        request.admin_token = token
        return func(*args, **kwargs)

    return wrapper


@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    payload = request.get_json(silent=True) or {}
    email = str(payload.get('email', '')).lower().strip()
    password = str(payload.get('password', ''))

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    data = load_auth_data()
    cleanup_expired(data)

    if email != data.get('email', ADMIN_EMAIL):
        return jsonify({'success': False, 'message': 'Invalid admin credentials.'}), 401

    if not check_password_hash(data['password_hash'], password):
        return jsonify({'success': False, 'message': 'Invalid admin credentials.'}), 401

    token = secrets.token_urlsafe(32)
    expires_at = (datetime.utcnow() + timedelta(hours=SESSION_HOURS)).isoformat()
    data.setdefault('sessions', {})[token] = {
        'email': email,
        'created_at': datetime.utcnow().isoformat(),
        'expires_at': expires_at,
    }
    save_auth_data(data)

    return jsonify({
        'success': True,
        'message': 'Admin login successful.',
        'token': token,
        'email': email,
        'expires_at': expires_at,
    })


@app.route('/api/admin/verify', methods=['GET'])
@require_admin_token
def admin_verify():
    return jsonify({
        'success': True,
        'email': request.admin_email,
    })


@app.route('/api/admin/logout', methods=['POST'])
@require_admin_token
def admin_logout():
    data = load_auth_data()
    data.get('sessions', {}).pop(request.admin_token, None)
    save_auth_data(data)
    return jsonify({'success': True, 'message': 'Logged out successfully.'})


@app.route('/api/admin/forgot-password', methods=['POST'])
def admin_forgot_password():
    payload = request.get_json(silent=True) or {}
    email = str(payload.get('email', '')).lower().strip()

    if not email:
        return jsonify({'success': False, 'message': 'Email is required.'}), 400

    data = load_auth_data()
    cleanup_expired(data)

    if email != data.get('email', ADMIN_EMAIL):
        return jsonify({
            'success': True,
            'message': 'If this email is registered as admin, a reset link has been generated.',
        })

    token = secrets.token_urlsafe(32)
    expires_at = (datetime.utcnow() + timedelta(hours=RESET_TOKEN_HOURS)).isoformat()
    data.setdefault('reset_tokens', {})[token] = {
        'email': email,
        'created_at': datetime.utcnow().isoformat(),
        'expires_at': expires_at,
    }
    save_auth_data(data)

    reset_path = f'/admin/reset-password?token={token}'
    return jsonify({
        'success': True,
        'message': 'Password reset link generated successfully.',
        'reset_path': reset_path,
        'expires_in_minutes': RESET_TOKEN_HOURS * 60,
    })


@app.route('/api/admin/reset-password', methods=['POST'])
def admin_reset_password():
    payload = request.get_json(silent=True) or {}
    token = str(payload.get('token', '')).strip()
    new_password = str(payload.get('new_password', ''))
    confirm_password = str(payload.get('confirm_password', ''))

    if not token or not new_password or not confirm_password:
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400

    if new_password != confirm_password:
        return jsonify({'success': False, 'message': 'Passwords do not match.'}), 400

    if len(new_password) < 8:
        return jsonify({'success': False, 'message': 'Password must be at least 8 characters.'}), 400

    data = load_auth_data()
    cleanup_expired(data)
    reset_meta = data.get('reset_tokens', {}).get(token)

    if not reset_meta:
        return jsonify({'success': False, 'message': 'Invalid or expired reset token.'}), 400

    if datetime.fromisoformat(reset_meta['expires_at']) <= datetime.utcnow():
        data['reset_tokens'].pop(token, None)
        save_auth_data(data)
        return jsonify({'success': False, 'message': 'Reset token has expired. Request a new one.'}), 400

    data['password_hash'] = generate_password_hash(new_password)
    data['reset_tokens'].pop(token, None)
    data['sessions'] = {}
    save_auth_data(data)

    return jsonify({
        'success': True,
        'message': 'Password updated successfully. Please login with your new password.',
    })


@app.route('/api/admin/change-password', methods=['POST'])
@require_admin_token
def admin_change_password():
    payload = request.get_json(silent=True) or {}
    current_password = str(payload.get('current_password', ''))
    new_password = str(payload.get('new_password', ''))
    confirm_password = str(payload.get('confirm_password', ''))

    if not current_password or not new_password or not confirm_password:
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400

    if new_password != confirm_password:
        return jsonify({'success': False, 'message': 'New passwords do not match.'}), 400

    if len(new_password) < 8:
        return jsonify({'success': False, 'message': 'Password must be at least 8 characters.'}), 400

    data = load_auth_data()
    if not check_password_hash(data['password_hash'], current_password):
        return jsonify({'success': False, 'message': 'Current password is incorrect.'}), 401

    data['password_hash'] = generate_password_hash(new_password)
    save_auth_data(data)

    return jsonify({'success': True, 'message': 'Password changed successfully.'})


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path.startswith('api/'):
        return jsonify({'success': False, 'message': 'Not found.'}), 404

    if path != '' and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    load_auth_data()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)), debug=True)
