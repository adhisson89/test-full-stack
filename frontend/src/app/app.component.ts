// src/app/app.component.ts
import {Component} from '@angular/core';
import {RouterOutlet, RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {AuthService} from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
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
