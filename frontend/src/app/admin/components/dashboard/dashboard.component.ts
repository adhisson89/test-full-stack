import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-container">
      <h2>Admin Dashboard</h2>
      <div class="admin-menu">
        <a routerLink="/admin/users" class="menu-item">
          <h3>User Management</h3>
          <p>Manage users and roles</p>
        </a>
        <a routerLink="/admin/posts" class="menu-item">
          <h3>Post Management</h3>
          <p>Create, edit and delete posts</p>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 20px;
    }
    .admin-menu {
      display: flex;
      gap: 20px;
      margin-top: 20px;
    }
    .menu-item {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 20px;
      text-decoration: none;
      color: inherit;
      transition: background-color 0.3s;
    }
    .menu-item:hover {
      background-color: #f5f5f5;
    }
    h3 {
      margin-top: 0;
    }
  `]
})
export class DashboardComponent {}
