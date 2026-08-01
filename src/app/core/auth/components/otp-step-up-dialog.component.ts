import { ChangeDetectionStrategy, Component, OnDestroy, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OtpStepUpService } from '../services/otp-step-up.service';

@Component({
  selector: 'app-otp-step-up-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (stepUp.visible()) {
      <div class="backdrop" (click)="stepUp.cancel()"></div>
      <section class="dialog" dir="rtl" role="dialog" aria-modal="true" aria-labelledby="stepup-title">
        <span class="icon"><i class="pi pi-shield"></i></span>
        <p class="eyebrow">إعادة تحقق أمني</p>
        <h2 id="stepup-title">هذه عملية حساسة</h2>
        @if (stepUp.challenge(); as challenge) {
          <p>أدخل OTP المرسل إلى <b dir="ltr">{{ challenge.maskedPhoneNumber }}</b>. الصلاحية 5 دقائق فقط.</p>
          <form [formGroup]="form" (ngSubmit)="verify()">
            <input formControlName="code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" dir="ltr">
            <p class="timer">{{ seconds() ? 'ينتهي خلال ' + format(seconds()) : 'انتهت صلاحية الرمز' }}</p>
            @if (stepUp.developmentOtpHint) { <p class="dev">{{ stepUp.developmentOtpHint }}</p> }
            @if (stepUp.error()) { <p class="error">{{ stepUp.error() }}</p> }
            <button class="primary" [disabled]="form.invalid || stepUp.busy() || !seconds()">
              {{ stepUp.busy() ? 'جارٍ التحقق...' : 'تأكيد ومتابعة العملية' }}
            </button>
            <button class="secondary" type="button" (click)="stepUp.resend()" [disabled]="stepUp.busy() || resendSeconds() > 0">
              {{ resendSeconds() ? 'إعادة الإرسال خلال ' + format(resendSeconds()) : 'إعادة إرسال الرمز' }}
            </button>
            <button class="cancel" type="button" (click)="stepUp.cancel()">إلغاء العملية</button>
          </form>
        } @else {
          <p class="sending"><i class="pi pi-spin pi-spinner"></i> جارٍ إرسال رمز التحقق...</p>
          @if (stepUp.error()) { <p class="error">{{ stepUp.error() }}</p><button class="cancel" (click)="stepUp.cancel()">إغلاق</button> }
        }
      </section>
    }
  `,
  styles: [`
    .backdrop{position:fixed;inset:0;z-index:10000;background:rgba(2,6,23,.62);backdrop-filter:blur(3px)}.dialog{position:fixed;z-index:10001;top:50%;left:50%;transform:translate(-50%,-50%);width:min(calc(100% - 2rem),420px);box-sizing:border-box;padding:1.5rem;border-radius:18px;background:#fff;box-shadow:0 30px 90px rgba(2,6,23,.35);text-align:center}.icon{display:grid;place-items:center;width:48px;height:48px;margin:0 auto .6rem;border-radius:15px;background:#eff6ff;color:#2563eb;font-size:1.25rem}.eyebrow{margin:0;color:#2563eb;font-size:.72rem;font-weight:900}.dialog h2{margin:.3rem 0;color:#0f172a}.dialog>p:not(.eyebrow){color:#64748b;line-height:1.7;font-size:.84rem}form{display:grid;gap:.55rem}input{min-height:62px;border:1px solid #93c5fd;border-radius:12px;text-align:center;font-size:1.55rem;font-weight:900;letter-spacing:.5rem}.timer{margin:.1rem 0;color:#64748b;font-size:.76rem}.dev{padding:.55rem;border:1px dashed #f59e0b;border-radius:8px;background:#fffbeb;color:#92400e;font-size:.76rem}.error{padding:.6rem;border-radius:8px;background:#fff1f2;color:#be123c;font-size:.78rem}.primary,.secondary{min-height:46px;border-radius:9px;font:inherit;font-weight:800}.primary{border:0;background:#2563eb;color:#fff}.secondary{border:1px solid #93c5fd;background:#fff;color:#2563eb}.cancel{border:0;background:transparent;color:#64748b;font:inherit}.sending{display:flex;justify-content:center;gap:.5rem}
  `],
})
export class OtpStepUpDialogComponent implements OnDestroy {
  readonly stepUp = inject(OtpStepUpService);
  private readonly fb = inject(FormBuilder);
  private timerId?: ReturnType<typeof setInterval>;
  readonly seconds = signal(0);
  readonly resendSeconds = signal(0);
  readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{4,6}$/)]],
  });

  constructor() {
    effect(() => {
      const challenge = this.stepUp.challenge();
      this.form.reset();
      if (!challenge) { this.stop(); return; }
      this.stop();
      const update = () => {
        const now = Date.now();
        this.seconds.set(Math.max(0, Math.ceil((Date.parse(challenge.expiresAtUtc) - now) / 1000)));
        this.resendSeconds.set(Math.max(0, Math.ceil((Date.parse(challenge.resendAvailableAtUtc) - now) / 1000)));
      };
      update();
      this.timerId = setInterval(update, 1000);
    });
  }

  verify(): void {
    if (this.form.invalid) return;
    this.stepUp.verify(this.form.controls.code.value);
  }
  format(value: number): string {
    return `${Math.floor(value / 60).toString().padStart(2, '0')}:${(value % 60).toString().padStart(2, '0')}`;
  }
  ngOnDestroy(): void { this.stop(); }
  private stop(): void {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = undefined;
  }
}
