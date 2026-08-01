import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OtpChallenge, OtpStepUp } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class OtpStepUpService {
  private readonly identityBase = `${environment.apiUrl.replace(/\/platform\/?$/, '')}/identity`;
  private readonly sessionBindingValue = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  private pending?: ReplaySubject<string>;
  private token?: { value: string; expiresAt: number };
  private readonly challengeSig = signal<OtpChallenge | null>(null);
  private readonly busySig = signal(false);
  private readonly errorSig = signal('');

  readonly challenge = this.challengeSig.asReadonly();
  readonly busy = this.busySig.asReadonly();
  readonly error = this.errorSig.asReadonly();
  readonly visible = computed(() => !!this.pending);
  readonly sessionBinding = this.sessionBindingValue;
  readonly developmentOtpHint = environment.otpDevelopmentHint;

  constructor(private readonly http: HttpClient) {}

  authorize(): Observable<string> {
    if (this.token && this.token.expiresAt > Date.now() + 5_000)
      return of(this.token.value);
    if (this.pending) return this.pending.asObservable();
    this.pending = new ReplaySubject<string>(1);
    this.requestChallenge();
    return this.pending.asObservable();
  }

  resend(): void { this.requestChallenge(); }

  verify(code: string): void {
    const challenge = this.challengeSig();
    if (!challenge || this.busySig()) return;
    this.busySig.set(true); this.errorSig.set('');
    this.http.post<OtpStepUp>(`${this.identityBase}/step-up/verify`, {
      challengeId: challenge.challengeId,
      code,
      sessionBinding: this.sessionBindingValue,
    }).subscribe({
      next: result => {
        this.token = { value: result.token, expiresAt: Date.parse(result.expiresAtUtc) };
        this.busySig.set(false);
        this.pending?.next(result.token);
        this.pending?.complete();
        this.resetDialog();
      },
      error: error => {
        this.busySig.set(false);
        const codeValue = error?.error?.message || error?.error?.code;
        this.errorSig.set(codeValue === 'OTP_EXPIRED' ? 'انتهت صلاحية الرمز. أعد الإرسال.'
          : codeValue === 'OTP_LOCKED' ? 'تم تجاوز عدد المحاولات. أعد الإرسال.'
          : 'الرمز غير صحيح أو لم يعد صالحًا.');
      },
    });
  }

  cancel(): void {
    this.pending?.error(new Error('OTP step-up was cancelled.'));
    this.resetDialog();
  }

  private requestChallenge(): void {
    this.busySig.set(true); this.errorSig.set('');
    this.http.post<OtpChallenge>(`${this.identityBase}/step-up/request`, {
      sessionBinding: this.sessionBindingValue,
    }).subscribe({
      next: challenge => { this.challengeSig.set(challenge); this.busySig.set(false); },
      error: error => {
        this.busySig.set(false);
        this.errorSig.set(error?.error?.message || 'تعذر إرسال رمز التحقق الإضافي.');
      },
    });
  }

  private resetDialog(): void {
    this.pending = undefined;
    this.challengeSig.set(null);
    this.errorSig.set('');
  }
}
