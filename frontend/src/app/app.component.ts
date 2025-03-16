// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
    template: `
        <div class="app-container">
            <header>
                <div class="logo">My App</div>
                <nav>
                    <ul>
                        <li><a routerLink="/public">Home</a></li>
                        <ng-container *ngIf="!authService.isAuthenticated()">
                            <li><a routerLink="/auth/login">Login</a></li>
                            <li><a routerLink="/auth/register">Register</a></li>
                        </ng-container>
                        <ng-container *ngIf="authService.isAuthenticated()">
                            <li *ngIf="authService.isAdmin()"><a routerLink="/admin">Admin Panel</a></li>
                            <li *ngIf="!authService.isAdmin()"><a routerLink="/user">User Dashboard</a></li>
                            <li><a href="#" (click)="logout($event)">Logout</a></li>
                        </ng-container>
                    </ul>
                </nav>
            </header>
            <main>
                <router-outlet></router-outlet>
            </main>
            <footer>
                <p>&copy; 2024 My App</p>
            </footer>
        </div>
    `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background-color: #333;
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
    }
    nav ul {
      list-style: none;
      display: flex;
      gap: 1.5rem;
      margin: 0;
      padding: 0;
    }
    nav a {
      color: white;
      text-decoration: none;
    }
    nav a:hover {
      text-decoration: underline;
    }
    main {
      flex: 1;
      padding: 1rem;
    }
    footer {
      background-color: #333;
      color: white;
      text-align: center;
      padding: 1rem;
    }
  `]
})
export class AppComponent {
  title = 'frontend';

  constructor(public authService: AuthService) {
      console.log("AppComponent initialized");
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
  }
}
