import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/services/auth.service';
import { OtpChallenge } from '../../core/auth/models/auth.models';
import { errMsg } from '../../shared/ui/notify.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="login-shell" dir="rtl">
      <section class="login-card" aria-labelledby="login-title">
        <div class="brand"><span>LF</span><div><b>LogicFit</b><small>منصة الإدارة المركزية</small></div></div>
        <div class="steps" aria-label="خطوات الدخول">
          <b class="active" [class.done]="challenge()"><i class="pi" [class.pi-check]="challenge()" [class.pi-user]="!challenge()"></i></b>
          <span [class.done]="challenge()"></span>
          <b [class.active]="challenge()"><i class="pi pi-mobile"></i></b>
        </div>

        @if (!challenge()) {
          <header>
            <span class="shield"><i class="pi pi-shield"></i></span>
            <h1 id="login-title">دخول إدارة المنصة</h1>
            <p>المرحلة الأولى: تحقق من البريد وكلمة المرور. لن تصدر جلسة الإدارة قبل OTP.</p>
          </header>
          <form [formGroup]="form" (ngSubmit)="submitCredentials()">
            <label>البريد الإلكتروني</label>
            <div class="field"><i class="pi pi-envelope"></i><input type="email" formControlName="email"
              autocomplete="username" placeholder="admin@example.com" dir="ltr"></div>
            @if (invalid('email')) { <p class="field-error">أدخل بريدًا إلكترونيًا صحيحًا.</p> }
            <label>كلمة المرور</label>
            <div class="field"><i class="pi pi-lock"></i><input [type]="showPass() ? 'text' : 'password'"
              formControlName="password" autocomplete="current-password" dir="ltr" (keyup)="detectCaps($event)">
              <button type="button" (click)="showPass.set(!showPass())"><i class="pi"
                [class.pi-eye]="!showPass()" [class.pi-eye-slash]="showPass()"></i></button></div>
            @if (capsLock()) { <p class="warning"><i class="pi pi-info-circle"></i> Caps Lock مفعّل</p> }
            @if (error()) { <p class="error" role="alert"><i class="pi pi-exclamation-circle"></i>{{ error() }}</p> }
            <button class="primary" [disabled]="loading() || form.invalid">
              @if (loading()) { <i class="pi pi-spin pi-spinner"></i> }
              {{ loading() ? 'جارٍ التحقق...' : 'متابعة وإرسال OTP' }}
            </button>
          </form>
        } @else {
          <header>
            <span class="shield"><i class="pi pi-mobile"></i></span>
            <p class="eyebrow">المرحلة الثانية</p>
            <h1>تحقق OTP إلزامي</h1>
            <p>أرسلنا رمزًا إلى الرقم الموثق <b dir="ltr">{{ challenge()!.maskedPhoneNumber }}</b></p>
          </header>
          <form [formGroup]="otpForm" (ngSubmit)="verifyOtp()">
            <input class="otp" formControlName="code" inputmode="numeric" maxlength="6"
              autocomplete="one-time-code" aria-label="رمز OTP" dir="ltr">
            <p class="timer" [class.expired]="otpSeconds() === 0">
              {{ otpSeconds() ? 'ينتهي خلال ' + formatTime(otpSeconds()) : 'انتهت صلاحية الرمز' }}
            </p>
            @if (developmentOtpHint) {
              <p class="dev"><i class="pi pi-code"></i> {{ developmentOtpHint }}</p>
            }
            @if (error()) { <p class="error" role="alert"><i class="pi pi-exclamation-circle"></i>{{ error() }}</p> }
            <button class="primary" [disabled]="loading() || otpForm.invalid || otpSeconds() === 0">
              @if (loading()) { <i class="pi pi-spin pi-spinner"></i> }
              {{ loading() ? 'جارٍ إنشاء الجلسة...' : 'تأكيد ودخول المنصة' }}
            </button>
            <button class="secondary" type="button" (click)="submitCredentials()"
              [disabled]="loading() || resendSeconds() > 0">
              {{ resendSeconds() ? 'إعادة الإرسال خلال ' + formatTime(resendSeconds()) : 'إعادة إرسال الرمز' }}
            </button>
            <button class="text" type="button" (click)="cancelOtp()">العودة وتغيير البريد</button>
          </form>
        }
        <footer><i class="pi pi-lock"></i> العمليات الحساسة تتطلب OTP جديدًا قصير العمر.<small>© {{ currentYear }} LogicFit</small></footer>
      </section>
    </main>
  `,
  styles: [`
    :host{display:block;min-height:100vh}.login-shell{min-height:100vh;display:grid;place-items:center;padding:1.25rem;background:radial-gradient(circle at 15% 15%,#1d4ed8 0,transparent 28%),linear-gradient(145deg,#020617,#172554 65%,#1e3a8a)}.login-card{width:min(100%,440px);padding:1.7rem 2rem;border:1px solid rgba(255,255,255,.7);border-radius:1.5rem;background:rgba(255,255,255,.98);box-shadow:0 30px 90px rgba(2,6,23,.38)}.brand{display:flex;align-items:center;justify-content:center;gap:.65rem}.brand>span{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;font-weight:900}.brand div{display:grid}.brand b{color:#0f172a}.brand small{color:#64748b}.steps{display:flex;align-items:center;justify-content:center;margin:1.4rem 0}.steps b{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#e2e8f0;color:#64748b}.steps b.active,.steps b.done{background:#2563eb;color:#fff}.steps span{width:80px;height:2px;background:#e2e8f0}.steps span.done{background:#2563eb}header{text-align:center}.shield{display:grid;place-items:center;width:46px;height:46px;margin:0 auto .65rem;border-radius:14px;background:#eff6ff;color:#2563eb;font-size:1.2rem}h1{margin:0;color:#0f172a;font-size:1.5rem}header p{margin:.45rem 0 0;color:#64748b;line-height:1.7;font-size:.82rem}.eyebrow{color:#2563eb!important;font-weight:900}form{display:grid;gap:.55rem;margin-top:1.35rem}label{font-size:.82rem;font-weight:800;color:#334155}.field{position:relative;display:flex;align-items:center}.field>i{position:absolute;right:.9rem;color:#64748b}.field input{width:100%;box-sizing:border-box;padding:.7rem 2.6rem;min-height:48px;border:1px solid #d8deea;border-radius:10px;color:#0f172a;font:inherit}.field button{position:absolute;left:.55rem;border:0;background:transparent;color:#64748b}.field-error,.warning{margin:0;color:#be123c;font-size:.72rem}.warning{color:#b45309}.primary,.secondary{display:flex;align-items:center;justify-content:center;gap:.45rem;min-height:48px;margin-top:.65rem;border-radius:10px;font:inherit;font-weight:800}.primary{border:0;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;box-shadow:0 10px 22px rgba(37,99,235,.24)}.secondary{border:1px solid #93c5fd;background:#fff;color:#2563eb}.primary:disabled,.secondary:disabled{opacity:.55}.error{display:flex;gap:.4rem;padding:.7rem;border:1px solid #fecdd3;border-radius:9px;background:#fff1f2;color:#be123c;font-size:.78rem}.otp{min-height:64px;border:1px solid #93c5fd;border-radius:12px;text-align:center;font-size:1.65rem;font-weight:900;letter-spacing:.55rem}.timer{text-align:center;color:#64748b;font-size:.78rem}.timer.expired{color:#be123c}.dev{padding:.65rem;border:1px dashed #f59e0b;border-radius:9px;background:#fffbeb;color:#92400e;text-align:center;font-size:.78rem}.text{border:0;background:transparent;color:#2563eb;font:inherit;cursor:pointer}footer{display:grid;justify-items:center;gap:.3rem;margin-top:1.4rem;color:#64748b;font-size:.72rem}footer small{color:#94a3b8}@media(max-width:480px){.login-shell{align-items:start;padding:1rem}.login-card{margin-top:3vh;padding:1.35rem}}
  `],
})
export class LoginComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private timerId?: ReturnType<typeof setInterval>;
  readonly currentYear = new Date().getFullYear();
  readonly developmentOtpHint = environment.otpDevelopmentHint;
  readonly sessionBinding = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPass = signal(false);
  readonly capsLock = signal(false);
  readonly challenge = signal<OtpChallenge | null>(null);
  readonly otpSeconds = signal(0);
  readonly resendSeconds = signal(0);
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  readonly otpForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{4,6}$/)]],
  });

  invalid(control: string): boolean {
    const field = this.form.get(control);
    return !!field && field.invalid && (field.touched || field.dirty);
  }
  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent | Event): void {
    if ('key' in event && event.key === 'CapsLock') this.updateCapsLock(event);
  }
  detectCaps(event: KeyboardEvent | Event): void { this.updateCapsLock(event); }

  submitCredentials(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set('');
    this.auth.requestLoginOtp({ ...this.form.getRawValue(), sessionBinding: this.sessionBinding }).subscribe({
      next: challenge => {
        this.challenge.set(challenge);
        this.otpForm.reset();
        this.startTimer(challenge);
        this.loading.set(false);
      },
      error: error => { this.loading.set(false); this.error.set(errMsg(error)); },
    });
  }

  verifyOtp(): void {
    const challenge = this.challenge();
    if (!challenge || this.otpForm.invalid) return;
    this.loading.set(true); this.error.set('');
    this.auth.verifyLoginOtp(challenge.challengeId, this.otpForm.controls.code.value, this.sessionBinding).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/dashboard']); },
      error: error => { this.loading.set(false); this.error.set(this.otpError(error)); },
    });
  }

  cancelOtp(): void {
    this.stopTimer(); this.challenge.set(null); this.otpForm.reset(); this.error.set('');
  }
  formatTime(seconds: number): string {
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
  ngOnDestroy(): void { this.stopTimer(); }

  private startTimer(challenge: OtpChallenge): void {
    this.stopTimer();
    const update = () => {
      const now = Date.now();
      this.otpSeconds.set(Math.max(0, Math.ceil((Date.parse(challenge.expiresAtUtc) - now) / 1000)));
      this.resendSeconds.set(Math.max(0, Math.ceil((Date.parse(challenge.resendAvailableAtUtc) - now) / 1000)));
    };
    update();
    this.timerId = setInterval(update, 1000);
  }
  private stopTimer(): void {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = undefined;
  }
  private updateCapsLock(event: KeyboardEvent | Event): void {
    const getModifierState = (event as Partial<KeyboardEvent>)?.getModifierState;
    if (typeof getModifierState !== 'function') return;
    this.capsLock.set(getModifierState.call(event, 'CapsLock'));
  }
  private otpError(error: any): string {
    const code = error?.error?.message || error?.error?.code;
    if (code === 'OTP_EXPIRED') return 'انتهت صلاحية الرمز. اطلب رمزًا جديدًا.';
    if (code === 'OTP_LOCKED') return 'تم تجاوز عدد المحاولات. اطلب رمزًا جديدًا.';
    if (code === 'OTP_ALREADY_USED') return 'تم استخدام هذا الرمز بالفعل.';
    return errMsg(error) || 'الرمز غير صحيح أو منتهي.';
  }
}
