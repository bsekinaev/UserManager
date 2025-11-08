import sqlite3

from flask import Flask, jsonify, request, render_template
from database import init_db, get_all_users, get_user_by_id, create_user, update_user, delete_user

app = Flask(__name__)

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

        user_id = create_user(data['name'], data['email'])
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

        updated_count = update_user(user_id, data['name'], data['email'])
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