import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <h2>My Profile</h2>

      <div *ngIf="loading" class="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="profile-info" *ngIf="!loading && user">
        <div class="info-item">
          <strong>Username:</strong>
          <span>{{ user.username }}</span>
        </div>
        <div class="info-item">
          <strong>Role:</strong>
          <span>{{ user.role }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
    }
    .profile-info {
      margin-top: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 20px;
    }
    .info-item {
      margin-bottom: 10px;
    }
    .loading, .error {
      text-align: center;
      margin: 20px 0;
    }
    .error {
      color: red;
    }
  `]
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  error = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loading = false;

    if (!this.user) {
      this.error = 'Unable to load user profile';
    }
  }
}
