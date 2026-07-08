import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { errMsg } from '../../shared/ui/notify.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen grid lg:grid-cols-2">
      <!-- Brand panel (desktop) -->
      <div class="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-800 text-white relative overflow-hidden">
        <div class="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-2xl"></div>
        <div class="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl"></div>
        <div class="relative flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center font-extrabold text-xl">LF</div>
          <span class="text-lg font-bold">LogicFit</span>
        </div>
        <div class="relative">
          <h2 class="text-3xl font-extrabold leading-snug">لوحة تحكم المنصة</h2>
          <p class="text-white/80 mt-3 max-w-sm leading-relaxed">
            إدارة الجيمات، الباقات، الاشتراكات، ومراجعة مدفوعات المنصة من مكان واحد.
          </p>
        </div>
        <div class="relative text-white/60 text-sm">© 2026 LogicFit Platform</div>
      </div>

      <!-- Form panel -->
      <div class="flex items-center justify-center p-6 bg-[var(--bg-page)]">
        <div class="w-full max-w-sm">
          <div class="lg:hidden text-center mb-6">
            <div class="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center font-extrabold text-white text-2xl mb-3 shadow-md">LF</div>
            <h1 class="text-xl font-extrabold text-slate-800">LogicFit — لوحة المنصة</h1>
          </div>

          <div class="mb-6 hidden lg:block">
            <h1 class="text-2xl font-extrabold text-slate-800">أهلاً بك 👋</h1>
            <p class="text-slate-500 text-sm mt-1">سجّل الدخول للمتابعة إلى لوحة المنصة</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <div>
              <label class="lf-label">البريد الإلكتروني</label>
              <div class="relative">
                <i class="pi pi-envelope absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 text-sm"></i>
                <input type="email" formControlName="email" dir="ltr"
                  class="lf-input pr-9 text-left" placeholder="owner@platform.local" autocomplete="username" />
              </div>
              @if (invalid('email')) { <p class="text-xs text-red-500 mt-1">أدخل بريدًا إلكترونيًا صحيحًا</p> }
            </div>

            <div>
              <label class="lf-label">كلمة المرور</label>
              <div class="relative">
                <i class="pi pi-lock absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 text-sm"></i>
                <input [type]="showPass() ? 'text' : 'password'" formControlName="password" dir="ltr"
                  class="lf-input pr-9 pl-9 text-left" placeholder="••••••••" autocomplete="current-password" />
                <button type="button" (click)="showPass.set(!showPass())"
                  class="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 hover:text-slate-600" tabindex="-1" aria-label="إظهار كلمة المرور">
                  <i class="pi" [ngClass]="showPass() ? 'pi-eye-slash' : 'pi-eye'"></i>
                </button>
              </div>
              @if (invalid('password')) { <p class="text-xs text-red-500 mt-1">كلمة المرور مطلوبة</p> }
            </div>

            @if (error()) {
              <div class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-start gap-2">
                <i class="pi pi-exclamation-circle mt-0.5"></i>
                <span class="whitespace-pre-line">{{ error() }}</span>
              </div>
            }

            <button type="submit" [disabled]="loading()"
              class="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm">
              @if (loading()) { <i class="pi pi-spin pi-spinner"></i> }
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string>('');
  showPass = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(errMsg(err));
      },
    });
  }
}
