import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Attach a valid Bearer token to every protected request. An expired access
 * token is refreshed before the request leaves the browser, preventing a
 * startup burst of 401 responses after reopening the dashboard.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const credentialed = req.clone({ withCredentials: true });
  if (req.url.includes('/auth/')) {
    return next(credentialed);
  }

  return auth.getValidAccessToken().pipe(
    switchMap((token) => {
      if (!token) {
        return next(credentialed);
      }

      return next(credentialed.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
    }),
  );
};
