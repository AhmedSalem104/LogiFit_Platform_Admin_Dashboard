import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { OtpStepUpService } from '../services/otp-step-up.service';

const protectedArea =
  /\/(tenants|plans|roles|workspace-applications|administrators|backups|features|payment-methods|payment-requests|subscriptions)(\/|$)/i;

export const otpStepUpInterceptor: HttpInterceptorFn = (req, next) => {
  const stepUp = inject(OtpStepUpService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const mutation = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
      const alreadyRetried = req.headers.has('X-LogicFit-OTP-Step-Up');
      const stepUpEndpoint = req.url.includes('/identity/step-up/');
      if (error.status !== 403 || !mutation || alreadyRetried || stepUpEndpoint || !protectedArea.test(req.url))
        return throwError(() => error);

      return stepUp.authorize().pipe(
        switchMap(token => next(req.clone({
          setHeaders: {
            'X-LogicFit-OTP-Step-Up': token,
            'X-Session-Id': stepUp.sessionBinding,
          },
        }))),
      );
    }),
  );
};
