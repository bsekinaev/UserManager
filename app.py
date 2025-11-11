import sqlite3
import re
from flask import Flask, jsonify, request, render_template
from database import init_db, get_all_users, get_user_by_id, create_user, update_user, delete_user

app = Flask(__name__)

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_name(name):
    return 2 <= len(name) <= 50 and re.match(r'^[a-zA-Zа-яА-ЯёЁ\s\-]+$', name)

@app.before_request
def initialize_database():
    init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/users', methods=['GET'])
def get_users():
    try:
        users = get_all_users()
        return jsonify(users)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = get_user_by_id(user_id)
        if user:
            return jsonify(user)
        return jsonify({'error': 'Пользователь не найден'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users', methods=['POST'])
def add_user():
    try:
        data = request.get_json()

        if not data or not data.get('name') or not data.get('email'):
            return jsonify({'error': 'Необходимо указать имя и email'}), 400

        name = data['name'].strip()
        email = data['email'].strip().lower()

        if not is_valid_name(name):
            return jsonify({
                'error': 'Имя должно быть от 2 до 50 символов и содержать только буквы, пробелы и дефисы'
            }), 400
        elif not is_valid_email(email):
            return jsonify({
                'error': 'Некорректный email адрес'}), 400

        user_id = create_user(name, email)
        return jsonify({
            'message': 'Пользователь добавлен успешно!',
            'user_id': user_id
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Пользователь с таким email уже существует'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user_route(user_id):
    # Обновление пользователя
    try:
        data =request.get_json()

        if not data or not data.get('name') or not data.get('email'):
            return jsonify({'error': 'Необходимо указать имя и email'}), 400

        name = data['name'].strip()
        email = data['email'].strip().lower()

        if not is_valid_name(name):
            return jsonify({
                'error': 'Имя должно быть от 2 до 50 символов и содержать только буквы, пробелы и дефисы'
            }), 400
        elif not is_valid_email(email):
            return jsonify({
                'error': 'Некорректный email адрес'}), 400

        updated_count = update_user(user_id, name, email)
        if updated_count == 0:
            return jsonify({'error': 'Пользователь не найден'}), 404
        return jsonify({'message': 'Пользователь обновлен успешно!'}), 200
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Пользователь с таким email уже существует'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user_route(user_id):
    # Удаление пользователя
    try:
        delete_count = delete_user(user_id)
        if delete_count == 0:
            return jsonify({'error': 'Пользователь не найден'}), 404
        return jsonify({'message': 'Пользователь удален успешно!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)