import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { errMsg } from '../../shared/ui/notify';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900">
      <div class="w-full max-w-md">
        <div class="text-center mb-6">
          <div class="inline-flex w-14 h-14 rounded-2xl bg-primary-600 items-center justify-center font-extrabold text-white text-2xl mb-3">
            LF
          </div>
          <h1 class="text-2xl font-bold text-white">LogicFit — لوحة المنصة</h1>
          <p class="text-slate-400 text-sm mt-1">تسجيل دخول مشغّل المنصة</p>
        </div>

        <div class="lf-card p-6">
          <form [formGroup]="form" (ngSubmit)="submit()">
            <label class="block text-sm font-semibold text-slate-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              formControlName="email"
              dir="ltr"
              class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-left mb-1"
              placeholder="owner@platform.local"
              autocomplete="username"
            />
            @if (invalid('email')) {
              <p class="text-xs text-red-500 mb-2">أدخل بريدًا إلكترونيًا صحيحًا</p>
            } @else { <div class="mb-3"></div> }

            <label class="block text-sm font-semibold text-slate-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              formControlName="password"
              dir="ltr"
              class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-left mb-1"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            @if (invalid('password')) {
              <p class="text-xs text-red-500 mb-2">كلمة المرور مطلوبة</p>
            } @else { <div class="mb-3"></div> }

            @if (error()) {
              <div class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3 whitespace-pre-line">
                {{ error() }}
              </div>
            }

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              @if (loading()) { <i class="pi pi-spin pi-spinner"></i> }
              تسجيل الدخول
            </button>
          </form>
        </div>

        <p class="text-center text-xs text-slate-500 mt-4">
          © 2026 LogicFit Platform
        </p>
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
