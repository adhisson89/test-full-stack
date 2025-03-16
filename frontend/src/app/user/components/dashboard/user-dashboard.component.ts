import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="user-container">
      <h2>User Dashboard</h2>
      <div class="user-menu">
        <a routerLink="/user/posts" class="menu-item">
          <h3>My Posts</h3>
          <p>Manage your personal posts</p>
        </a>
        <a routerLink="/user/profile" class="menu-item">
          <h3>My Profile</h3>
          <p>View and update your profile</p>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .user-container {
      padding: 20px;
    }
    .user-menu {
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
export class UserDashboardComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {}
}
