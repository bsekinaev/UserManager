import sqlite3
from contextlib import contextmanager

DATABASE = 'users.db'

@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()

def get_all_users():
    with get_db() as conn:
        users = conn.execute('SELECT * FROM users').fetchall()
        return [dict(user) for user in users]

def get_user_by_id(user_id):
    with get_db() as conn:
        user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
        return dict(user) if user else None

def create_user(name, email):
    with get_db() as conn:
        cursor = conn.execute(
            'INSERT INTO users (name, email) VALUES (?, ?)',
            (name, email)
        )
        conn.commit()
        return cursor.lastrowid

def update_user(user_id, name, email):
    # Обновление пользователя
    with get_db() as conn:
        cursor = conn.execute(
            'UPDATE users SET name = ?, email = ? WHERE id = ?', (name, email, user_id))
        conn.commit()
        return cursor.rowcount

def delete_user(user_id):
    # Удаление пользователя
    with get_db() as conn:
        cursor = conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
        conn.commit()
        return cursor.rowcount