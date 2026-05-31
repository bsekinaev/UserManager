def test_get_users_empty(client):
    """GET /users - пустой список"""
    response = client.get('/users')
    assert response.status_code == 200
    assert response.json == []


def test_create_user_success(client):
    """POST /users - успешное создание"""
    response = client.post('/users', json={
        'name': 'John Doe',
        'email': 'john@example.com'
    })
    assert response.status_code == 201
    assert 'user_id' in response.json
    assert response.json['message'] == 'Пользователь добавлен успешно!'


def test_create_user_missing_fields(client):
    """POST /users - отсутствие обязательных полей"""
    response = client.post('/users', json={'name': 'John'})
    assert response.status_code == 400
    assert 'error' in response.json


def test_create_user_invalid_email(client):
    """POST /users - некорректный email"""
    response = client.post('/users', json={
        'name': 'John Doe',
        'email': 'not-an-email'
    })
    assert response.status_code == 400
    assert 'Некорректный email' in response.json['error']


def test_create_user_invalid_name(client):
    """POST /users - имя слишком короткое"""
    response = client.post('/users', json={
        'name': 'J',
        'email': 'j@example.com'
    })
    assert response.status_code == 400


def test_get_user_by_id(client):
    """GET /users/<id> - получение пользователя"""
    create = client.post('/users', json={
        'name': 'Jane Doe',
        'email': 'jane@example.com'
    })
    user_id = create.json['user_id']

    response = client.get(f'/users/{user_id}')
    assert response.status_code == 200
    assert response.json['name'] == 'Jane Doe'


def test_get_nonexistent_user(client):
    """GET /users/<id> - пользователь не найден"""
    response = client.get('/users/99999')
    assert response.status_code == 404
    assert 'не найден' in response.json['error']


def test_update_user(client):
    """PUT /users/<id> - обновление"""
    create = client.post('/users', json={
        'name': 'Bob',
        'email': 'bob@example.com'
    })
    user_id = create.json['user_id']

    response = client.put(f'/users/{user_id}', json={
        'name': 'Robert',
        'email': 'robert@example.com'
    })
    assert response.status_code == 200

    get_resp = client.get(f'/users/{user_id}')
    assert get_resp.json['name'] == 'Robert'


def test_delete_user(client):
    """DELETE /users/<id> - удаление"""
    create = client.post('/users', json={
        'name': 'ToDelete',
        'email': 'delete@example.com'
    })
    user_id = create.json['user_id']

    response = client.delete(f'/users/{user_id}')
    assert response.status_code == 200
    assert client.get(f'/users/{user_id}').status_code == 404


def test_duplicate_email(client):
    """POST /users - дубликат email"""
    client.post('/users', json={
        'name': 'User One',
        'email': 'dup@example.com'
    })
    response = client.post('/users', json={
        'name': 'User Two',
        'email': 'dup@example.com'
    })
    assert response.status_code == 400
    assert 'уже существует' in response.json['error']