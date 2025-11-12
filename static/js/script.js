class UserManager {
    constructor() {
        // Кэширование DOM элементов для производительности
        this.users = [];
        this.filteredUsers = [];
        this.filters = {
            searchTerm: '',
            sort: 'newest'
        };

        this.elements = {};
        this.cacheElements();
        this.init();
    }

    cacheElements() {
        // Основные элементы
        this.elements.userForm = document.getElementById('userForm');
        this.elements.userTable = document.getElementById('userTable');
        this.elements.message = document.getElementById('message');

        // Форма добавления
        this.elements.name = document.getElementById('name');
        this.elements.email = document.getElementById('email');
        this.elements.nameError = document.getElementById('nameError');
        this.elements.emailError = document.getElementById('emailError');

        // Форма редактирования
        this.elements.editUserId = document.getElementById('editUserId');
        this.elements.editName = document.getElementById('editName');
        this.elements.editEmail = document.getElementById('editEmail');
        this.elements.editNameError = document.getElementById('editNameError');
        this.elements.editEmailError = document.getElementById('editEmailError');

        // Модальные окна
        this.elements.userModal = document.getElementById('userModal');
        this.elements.editUserModal = document.getElementById('editUserModal');
        this.elements.userDetails = document.getElementById('userDetails');

        // Фильтры и сортировка
        this.elements.searchInput = document.getElementById('searchInput');
        this.elements.sortSelect = document.getElementById('sortSelect');
        this.elements.filterInfo = document.getElementById('filterInfo');
        this.elements.totalUsers = document.getElementById('totalUsers');
    }

    init() {
        this.loadUsers();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.elements.userForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addUser();
        });
        this.elements.searchInput.addEventListener('input', () => {this.handleSearch()});
        this.elements.sortSelect.addEventListener('change', () => {this.handelSort()});
    }

    async loadUsers() {
        try {
            this.showLoading();
            const response = await fetch('/users');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.users = await response.json();
            this.applyFilters();
        } catch (error) {
            console.error('Error loading users:', error);
            this.showMessage('Ошибка загрузки пользователей', 'danger');
        }
    }

    showLoading() {
        this.elements.userTable.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Загрузка...</span>
                    </div>
                    Загрузка...
                </td>
            </tr>
        `;
    }

    renderUsers(users) {
        if (users.length === 0) {
            const noResultsMessage = this.filters.searchTerm
            ? 'Пользователи по вашему запросу не найдены'
            : 'Нет пользователей';

            this.elements.userTable.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    <div>${noResultsMessage}</div>
                    ${this.filters.searchTerm ?
                        '<small>Попробуйте изменить поисковый запрос</small>' : ''}
                </td>
            </tr>
        `;
            return;
        }

        this.elements.userTable.innerHTML = users.map(user => `
        <tr>
            <td>${this.escapeHtml(user.id)}</td>
            <td>${this.escapeHtml(user.name)}</td>
            <td>${this.escapeHtml(user.email)}</td>
            <td>
                <button class="btn btn-sm btn-info me-1" onclick="userManager.showUserDetails(${user.id})">
                    Подробнее
                </button>
                <button class="btn btn-sm btn-warning me-1" onclick="userManager.showEditForm(${user.id})">
                    Изменить
                </button>
                <button class="btn btn-sm btn-danger" onclick="userManager.deleteUser(${user.id})">
                    Удалить
                </button>
            </td>
        </tr>
    `).join('');
    }

    // Защита от XSS
    escapeHtml(unsafe) {
        return unsafe
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    async addUser() {
        const name = this.elements.name.value.trim();
        const email = this.elements.email.value.trim();

        this.clearErrors();

        if (!this.validateForm(name, email)) {
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
                this.elements.userForm.reset();
                await this.loadUsers();
            } else {
                this.showMessage(result.error, 'danger');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            this.showMessage('Ошибка при добавлении пользователя', 'danger');
        }
    }

    async showUserDetails(userId) {
        try {
            const response = await fetch(`/users/${userId}`);
            const user = await response.json();

            if (response.ok) {
                const createdAt = user.created_at ? new Date(user.created_at).toLocaleString() : 'Не указано';
                this.elements.userDetails.innerHTML = `
                    <p><strong>ID:</strong> ${this.escapeHtml(user.id)}</p>
                    <p><strong>Имя:</strong> ${this.escapeHtml(user.name)}</p>
                    <p><strong>Email:</strong> ${this.escapeHtml(user.email)}</p>
                    <p><strong>Создан:</strong> ${this.escapeHtml(createdAt)}</p>
                `;

                const modal = new bootstrap.Modal(this.elements.userModal);
                modal.show();
            } else {
                this.showMessage('Пользователь не найден', 'danger');
            }
        } catch (error) {
            console.error('Error loading user details:', error);
            this.showMessage('Ошибка загрузки данных', 'danger');
        }
    }

    async showEditForm(userId) {
        try {
            const response = await fetch(`/users/${userId}`);
            const user = await response.json();

            if (response.ok) {
                this.elements.editUserId.value = user.id;
                this.elements.editName.value = user.name;
                this.elements.editEmail.value = user.email;

                const modal = new bootstrap.Modal(this.elements.editUserModal);
                modal.show();
            } else {
                this.showMessage('Пользователь не найден', 'danger');
            }
        } catch (error) {
            console.error('Error loading user for edit:', error);
            this.showMessage('Ошибка загрузки данных для редактирования', 'danger');
        }
    }

    async updateUser() {
        const userId = this.elements.editUserId.value;
        const name = this.elements.editName.value.trim();
        const email = this.elements.editEmail.value.trim();

        this.clearErrors();

        if (!this.validateForm(name, email, true)) {
            return;
        }

        try {
            const response = await fetch(`/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email })
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Пользователь успешно обновлен', 'success');
                const modal = bootstrap.Modal.getInstance(this.elements.editUserModal);
                modal.hide();
                await this.loadUsers();
            } else {
                this.showMessage(result.error, 'danger');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            this.showMessage('Ошибка при обновлении пользователя', 'danger');
        }
    }

    async deleteUser(userId) {
        if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            return;
        }

        try {
            const response = await fetch(`/users/${userId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Пользователь успешно удален', 'success');
                await this.loadUsers();
            } else {
                this.showMessage(result.error, 'danger');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showMessage('Ошибка при удалении пользователя', 'danger');
        }
    }

    showMessage(message, type) {
        this.elements.message.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show">
                ${this.escapeHtml(message)}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidName(name) {
        const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-]{2,50}$/;
        return nameRegex.test(name);
    }

    clearErrors() {
        // Очистка ошибок в форме добавления
        [this.elements.name, this.elements.email].forEach(el => el.classList.remove('is-invalid'));
        [this.elements.nameError, this.elements.emailError].forEach(el => el.textContent = '');

        // Очистка ошибок в форме редактирования
        [this.elements.editName, this.elements.editEmail].forEach(el => el.classList.remove('is-invalid'));
        [this.elements.editNameError, this.elements.editEmailError].forEach(el => el.textContent = '');
    }

    validateForm(name, email, isEditForm = false) {
        let isValid = true;
        const nameField = isEditForm ? this.elements.editName : this.elements.name;
        const emailField = isEditForm ? this.elements.editEmail : this.elements.email;
        const nameErrorField = isEditForm ? this.elements.editNameError : this.elements.nameError;
        const emailErrorField = isEditForm ? this.elements.editEmailError : this.elements.emailError;

        // Валидация имени
        if (!name.trim()) {
            nameField.classList.add('is-invalid');
            nameErrorField.textContent = 'Имя обязательно для заполнения';
            isValid = false;
        } else if (!this.isValidName(name)) {
            nameField.classList.add('is-invalid');
            nameErrorField.textContent = 'Имя должно содержать только буквы и пробелы (от 2 до 50 символов)';
            isValid = false;
        } else {
            nameField.classList.remove('is-invalid');
            nameErrorField.textContent = '';
        }

        // Валидация Email
        if (!email.trim()) {
            emailField.classList.add('is-invalid');
            emailErrorField.textContent = 'Email обязателен для заполнения';
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            emailField.classList.add('is-invalid');
            emailErrorField.textContent = 'Введите корректный Email адрес';
            isValid = false;
        } else {
            emailField.classList.remove('is-invalid');
            emailErrorField.textContent = '';
        }

        return isValid;
    }
    applyFilters() {
        let filtered = [...this.users];

        // Поиск по имени и email
        if (this.filters.searchTerm) {
            const searchTerm = this.filters.searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
            );
        }
        // Сортировка
        filtered.sort((a, b) => {
                switch (this.filters.sortBy) {
                    case 'name_asc':
                        return a.name.localeCompare(b.name);
                    case 'name_desc':
                        return b.name.localeCompare(a.name);
                    case 'email_asc':
                        return a.email.localeCompare(b.email);
                    case 'oldest':
                        return new Date(a.created_at) - new Date(b.created_at);
                    case 'newest':
                    default:
                        return new Date(b.created_at) - new Date(a.created_at);
                }
    });
        this.filteredUsers = filtered;
        this.renderUsers(this.filteredUsers);
        this.updateFilterInfo();
    }
    handleSearch() {
        this.filters.searchTerm = this.elements.searchInput.value.trim();
        this.applyFilters();
    }
    handleSort() {
        this.filters.sortBy = this.elements.sortSelect.value;
        this.applyFilters();
    }
    resetFilters() {
        this.elements.searchInput.value = '';
        this.elements.sortSelect.value = 'newest';
        this.filters.searchTerm = '';
        this.filters.sortBy = 'newest';
        this.applyFilters();
    }

    updateFilterInfo() {
        const total = this.users.length;
        const showing = this.filteredUsers.length;

        if (total === showing) {
            this.elements.filterInfo.innerHTML = `Всего пользователей: <strong>${total}</strong>`;
        } else {
            this.elements.filterInfo.innerHTML = `
            Показано пользователей: <strong>${showing}</strong> из <strong>${total}</strong>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.userManager = new UserManager();
});