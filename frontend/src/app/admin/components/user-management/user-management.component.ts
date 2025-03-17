import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Apollo, gql} from 'apollo-angular';

interface User {
  id: string;
  username: string;
  role: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
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
    this.apollo.query<{ findAllUsers: User[] }>({
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
    const {username, password, role} = this.userForm.value;

    this.apollo.mutate<{ createUser: User }>({
      mutation: this.CREATE_USER,
      variables: {
        username,
        password,
        role
      },
      refetchQueries: [{query: this.GET_USERS}]
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
    const {username, password, role} = this.userForm.value;

    this.apollo.mutate<{ createUser: User }>({
      mutation: this.UPDATE_USER,
      variables: {
        id: this.editingUserId,
        username,
        password,
        role
      },
      refetchQueries: [{query: this.GET_USERS}]
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

    this.apollo.mutate<{ deleteUserById: string }>({
      mutation: this.DELETE_USER,
      variables: {id},
      refetchQueries: [{query: this.GET_USERS}]
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
    this.userForm.reset({role: 'USER'});

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
