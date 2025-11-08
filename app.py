from flask import Flask, jsonify, request, render_template
from database import init_db, get_all_users, get_user_by_id, create_user

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

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)