// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
import { adminGuard } from './auth/guards/admin.guard';
import { userGuard } from './auth/guards/user.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'public', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.routes').then(m => m.USER_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'public',
    loadChildren: () => import('./public/public.routes').then(m => m.PUBLIC_ROUTES)
  },
  { path: '**', redirectTo: 'public' }
];
