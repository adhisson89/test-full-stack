import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../../auth/services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  error = '';

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loading = false;

    if (!this.user) {
      this.error = 'Unable to load user profile';
    }
  }
}
