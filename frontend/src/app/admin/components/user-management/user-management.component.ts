// src/app/admin/components/user-management/user-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';

interface User {
  id: string;
  username: string;
  role: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="user-management-container">
      <h2>User Management</h2>

      <div *ngIf="loading" class="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      <div *ngIf="successMessage" class="success">{{ successMessage }}</div>


      <!-- User Form -->
      <div class="form-container">
        <h3>{{ editingUserId ? 'Edit User' : 'Create New User' }}</h3>
        <form [formGroup]="userForm" (ngSubmit)="saveUser()">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" formControlName="username">
            <div *ngIf="userForm.get('username')?.invalid && userForm.get('username')?.touched">
              <span class="error">El nombre de usuario es requerido</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password {{ editingUserId ? '(leave blank to keep current)' : '' }}</label>
            <input type="password" id="password" formControlName="password">
            <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched && !editingUserId">
              <span class="error">La contraseña es requerida</span>
            </div>
          </div>

          <div class="form-group">
            <label for="role">Role</label>
            <select id="role" formControlName="role">
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="userForm.invalid || saving">
              {{ editingUserId ? 'Update' : 'Create' }}
            </button>
            <button type="button" *ngIf="editingUserId" (click)="cancelEdit()">Cancelar</button>
          </div>
        </form>
      </div>

      <!-- User List -->
      <div class="user-list" *ngIf="!loading">
        <h3>Users</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.role }}</td>
              <td>
                <button (click)="editUser(user)">Editar</button>
                <button (click)="deleteUser(user.id)" class="delete-btn">Eliminar</button>
              </td>
            </tr>
            <tr *ngIf="users.length === 0">
              <td colspan="4" class="no-data">No users found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .user-management-container {
      padding: 20px;
    }

    .form-container {
      margin-bottom: 30px;
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 5px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
    }

    input, select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 3px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
    }

    button {
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;
    }

    button:disabled {
      background-color: #cccccc;
    }

    .delete-btn {
      background-color: #dc3545;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    th {
      background-color: #f5f5f5;
    }

    .no-data {
      text-align: center;
      padding: 20px;
    }

    .loading, .error {
      text-align: center;
      margin: 20px 0;
    }

    .error {
      color: red;
    }

    .success {
      text-align: center;
      margin: 20px 0;
      padding: 10px;
      background-color: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
      border-radius: 4px;
    }

  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  userForm: FormGroup;
  loading = true;
  saving = false;
  error = '';
  editingUserId: string | null = null;
  successMessage = '';

  private readonly GET_USERS = gql`
    query GetAllUsers {
      findAllUsers {
        id
        username
        role
      }
    }
  `;

  private readonly CREATE_USER = gql`
    mutation CreateUser($username: String!, $password: String!, $role: Role) {
      createUser(userRequest: {
        username: $username,
        password: $password,
        role: $role
      }) {
        id
        username
        role
      }
    }
  `;

  private readonly UPDATE_USER = gql`
    mutation UpdateUser($id: ID!, $username: String!, $password: String!, $role: Role) {
      createUser(userRequest: {
        id: $id,
        username: $username,
        password: $password,
        role: $role
      }) {
        id
        username
        role
      }
    }
  `;

  private readonly DELETE_USER = gql`
    mutation DeleteUser($id: ID!) {
      deleteUserById(id: $id)
    }
  `;

  constructor(
    private apollo: Apollo,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['USER', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.apollo.query<{findAllUsers: User[]}>({
      query: this.GET_USERS,
      fetchPolicy: 'network-only'
    }).subscribe({
      next: (result) => {
        this.users = result.data.findAllUsers;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error loading users';
        this.loading = false;
      }
    });
  }

  saveUser(): void {
    if (this.userForm.invalid) return;

    this.saving = true;

    if (this.editingUserId) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    const { username, password, role } = this.userForm.value;

    this.apollo.mutate<{createUser: User}>({
      mutation: this.CREATE_USER,
      variables: {
        username,
        password,
        role
      },
      refetchQueries: [{ query: this.GET_USERS }]
    }).subscribe({
      next: () => {
        this.showSuccessMessage("Usuario creado correctamente")
        this.resetForm();
        this.saving = false;
        this.loadUsers();
      },
      error: (err) => {
        this.error = err.message || 'Error al crear el usuario';
        this.saving = false;
      }
    });
  }

  updateUser(): void {
    const { username, password, role } = this.userForm.value;

    this.apollo.mutate<{createUser: User}>({
      mutation: this.UPDATE_USER,
      variables: {
        id: this.editingUserId,
        username,
        password,
        role
      },
      refetchQueries: [{ query: this.GET_USERS }]
    }).subscribe({
      next: () => {
        this.showSuccessMessage("Usuario actualizado correctamente")
        this.resetForm();
        this.saving = false;
        this.loadUsers();
      },
      error: (err) => {
        this.error = err.message || 'Error al actualizar el usuario';
        this.saving = false;
      }
    });
  }

  deleteUser(id: string): void {
    if (!confirm('Estás seguro que quieres eliminar al usuario?')) return;

    this.apollo.mutate<{deleteUserById: string}>({
      mutation: this.DELETE_USER,
      variables: { id },
      refetchQueries: [{ query: this.GET_USERS }]
    }).subscribe({
      next: () => {
        this.showSuccessMessage("Usuario eliminado correctamente");
        this.loadUsers();
      },
      error: (err) => {
        this.error = err.message || 'Error al eliminar al usuario';
      }
    });
  }

  editUser(user: User): void {
    this.editingUserId = user.id;

    this.userForm.patchValue({
      username: user.username,
      role: user.role
    });

    // Make password optional when editing
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.editingUserId = null;
    this.userForm.reset({ role: 'USER' });

    // Reset password validation
    this.userForm.get('password')?.setValidators(Validators.required);
    this.userForm.get('password')?.updateValueAndValidity();

    this.error = '';
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
}
