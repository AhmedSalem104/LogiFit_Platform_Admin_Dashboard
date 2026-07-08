import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Permission } from '../models/auth.models';

/**
 * Route guard factory — requires ANY of the given permissions.
 * Usage: canActivate: [permissionGuard('ManageTenants')]
 */
export function permissionGuard(...permissions: Permission[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasAnyPermission(...permissions)) return true;
    // No access → send to the first screen they can see.
    router.navigate(['/dashboard']);
    return false;
  };
}
