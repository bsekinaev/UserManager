class UserManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadUsers();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addUser();
        });
    }

    async loadUsers() {
        try {
            const response = await fetch('/users');
            const users = await response.json();
            this.renderUsers(users);
        } catch (error) {
            this.showMessage('Ошибка загрузки пользователей', 'danger');
        }
    }

    renderUsers(users) {
        const tbody = document.getElementById('userTable');

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Нет пользователей</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="userManager.showUserDetails(${user.id})">
                        Подробнее
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async addUser() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();

        if (!name || !email) {
            this.showMessage('Заполните все поля', 'warning');
            return;
        }

        try {
            const response = await fetch('/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email })
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Пользователь успешно добавлен', 'success');
                document.getElementById('userForm').reset();
                this.loadUsers();
            } else {
                this.showMessage(result.error, 'danger');
            }
        } catch (error) {
            this.showMessage('Ошибка при добавлении пользователя', 'danger');
        }
    }

    async showUserDetails(userId) {
        try {
            const response = await fetch(`/users/${userId}`);
            const user = await response.json();

            if (response.ok) {
                const modalBody = document.getElementById('userDetails');
                modalBody.innerHTML = `
                    <p><strong>ID:</strong> ${user.id}</p>
                    <p><strong>Имя:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                `;

                // Показываем модальное окно
                const modal = new bootstrap.Modal(document.getElementById('userModal'));
                modal.show();
            } else {
                this.showMessage('Пользователь не найден', 'danger');
            }
        } catch (error) {
            this.showMessage('Ошибка загрузки данных', 'danger');
        }
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('message');
        messageDiv.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.userManager = new UserManager();
});