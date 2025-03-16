import { Routes } from '@angular/router';
import { UserDashboardComponent } from './components/dashboard/user-dashboard.component';
import { UserPostManagementComponent } from './components/post-management/post-management.component';
import { UserProfileComponent } from './components/profile/user-profile.component';

export const USER_ROUTES: Routes = [
  { path: '', component: UserDashboardComponent },
  { path: 'posts', component: UserPostManagementComponent },
  { path: 'profile', component: UserProfileComponent }
];
