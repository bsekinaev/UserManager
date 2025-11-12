import requests
import random
from faker import Faker

def generate_test_users(count=50):
    fake = Faker()
    base_url = "http://localhost:5000"

    for i in range(count):
        try:
            name = fake.name()
            email = name.lower().replace(' ', '.').replace("'", "") + '@example.com'

            response = requests.post(f"{base_url}/users", json={
                "name": name,
                "email": email
            })

            if response.status_code == 201:
                print(f"✓ Добавлен пользователь {i+1}: {name} - {email}")
            else:
                print(f"✗ Ошибка при добавлении {name}: {response.json()}")

        except Exception as e:
            print(f"✗ Ошибка: {e}")

if __name__ == "__main__":
    print("Генерация тестовых данных...")
    generate_test_users(50)
    print("Генерация завершена!")