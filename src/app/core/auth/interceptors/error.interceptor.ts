import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// ---- Single-flight refresh state (module scope) ----
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

/** On 401: refresh once, then retry. Concurrent 401s queue behind the in-flight refresh. */
function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return auth.refreshToken().pipe(
      switchMap((newToken) => {
        isRefreshing = false;
        refreshTokenSubject.next(newToken);
        return next(addToken(req, newToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        auth.logout();
        return throwError(() => ({ ...err, translatedMessage: 'انتهت صلاحية الجلسة، سجّل الدخول مرة أخرى' }));
      }),
    );
  }

  return refreshTokenSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((token) => next(addToken(req, token as string))),
  );
}

/** Global HTTP error handler: 401 refresh + translated messages for the rest. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return handle401(req, next, auth);
      }

      let errorMessage = 'حدث خطأ غير متوقع';
      switch (error.status) {
        case 0:
          errorMessage = 'خطأ في الاتصال بالشبكة';
          break;
        case 400:
          if (error.error?.errors) {
            errorMessage = Object.values(error.error.errors).flat().join('\n');
          } else {
            errorMessage = error.error?.message || 'خطأ في البيانات المدخلة';
          }
          break;
        case 401:
          errorMessage = error.error?.message || 'بيانات الدخول غير صحيحة';
          break;
        case 403:
          errorMessage = 'ليس لديك صلاحية لهذا الإجراء';
          break;
        case 404:
          errorMessage = error.error?.message || 'العنصر المطلوب غير موجود';
          break;
        case 409:
          errorMessage = error.error?.message || 'تعارض في البيانات';
          break;
        case 500:
          errorMessage = 'حدث خطأ في الخادم، حاول لاحقاً';
          break;
        default:
          if (error.error?.message) errorMessage = error.error.message;
      }

      return throwError(() => ({ ...error, translatedMessage: errorMessage }));
    }),
  );
};
