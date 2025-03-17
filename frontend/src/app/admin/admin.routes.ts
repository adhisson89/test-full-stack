import {Routes} from '@angular/router';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {UserManagementComponent} from './components/user-management/user-management.component';
import {PostManagementComponent} from './components/post-management/post-management.component';

export const ADMIN_ROUTES: Routes = [
  {path: '', component: DashboardComponent},
  {path: 'users', component: UserManagementComponent},
  {path: 'posts', component: PostManagementComponent}
];
