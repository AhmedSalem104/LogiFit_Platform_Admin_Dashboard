import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';
import { permissionGuard } from './core/auth/guards/permission.guard';

export const routes: Routes = [
  // Public login
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },

  // Authenticated shell
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [permissionGuard('ManagePlatformReports')],
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'tenants',
        canActivate: [permissionGuard('ManageTenants')],
        loadComponent: () =>
          import('./features/tenants/tenants.component').then((m) => m.TenantsComponent),
      },
      {
        path: 'subscriptions',
        canActivate: [permissionGuard('ManageTenants')],
        loadComponent: () =>
          import('./features/subscriptions/subscriptions.component').then((m) => m.SubscriptionsComponent),
      },
      {
        path: 'plans',
        canActivate: [permissionGuard('ManagePlans')],
        loadComponent: () =>
          import('./features/plans/plans.component').then((m) => m.PlansComponent),
      },
      {
        path: 'features',
        canActivate: [permissionGuard('ManagePlans')],
        loadComponent: () =>
          import('./features/features/features.component').then((m) => m.FeaturesComponent),
      },
      {
        path: 'payment-methods',
        canActivate: [permissionGuard('ManagePaymentRequests')],
        loadComponent: () =>
          import('./features/payment-methods/payment-methods.component').then((m) => m.PaymentMethodsComponent),
      },
      {
        path: 'payment-requests',
        canActivate: [permissionGuard('ManagePaymentRequests')],
        loadComponent: () =>
          import('./features/payment-requests/payment-requests.component').then((m) => m.PaymentRequestsComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];
