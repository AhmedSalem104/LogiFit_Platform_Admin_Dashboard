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
    <main class="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      <section class="hidden lg:flex relative overflow-hidden flex-col justify-between p-12 text-white bg-[radial-gradient(circle_at_15%_15%,rgba(96,165,250,.38),transparent_28%),radial-gradient(circle_at_80%_85%,rgba(129,140,248,.35),transparent_32%),linear-gradient(145deg,#0f172a,#172554_56%,#1d4ed8)]">
        <div class="absolute inset-0 opacity-[.16] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:36px_36px]"></div>
        <div class="relative flex items-center gap-3"><div class="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20 font-extrabold text-xl backdrop-blur">LF</div><div><p class="font-extrabold text-lg leading-none">LogicFit</p><p class="mt-1 text-xs text-blue-100">منصة الإدارة المركزية</p></div></div>
        <div class="relative max-w-lg">
          <span class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-blue-50"><i class="pi pi-shield"></i> دخول آمن ومخصص للإدارة</span>
          <h1 class="mt-6 text-4xl font-extrabold leading-tight">كل ما تحتاجه لإدارة المنصة، في لوحة واحدة.</h1>
          <p class="mt-5 max-w-md text-base leading-8 text-blue-100">تابع المنشآت والاشتراكات والمدفوعات والنسخ الاحتياطية والعمليات الحساسة بوضوح كامل.</p>
          <div class="mt-9 grid grid-cols-3 gap-3 text-center"><div class="rounded-xl border border-white/10 bg-white/[.08] px-3 py-4"><i class="pi pi-building"></i><p class="mt-2 text-xs text-blue-100">المنشآت</p></div><div class="rounded-xl border border-white/10 bg-white/[.08] px-3 py-4"><i class="pi pi-wallet"></i><p class="mt-2 text-xs text-blue-100">المدفوعات</p></div><div class="rounded-xl border border-white/10 bg-white/[.08] px-3 py-4"><i class="pi pi-chart-line"></i><p class="mt-2 text-xs text-blue-100">المتابعة</p></div></div>
        </div>
        <p class="relative text-xs text-blue-100/70">© {{ currentYear }} LogicFit. جميع الحقوق محفوظة.</p>
      </section>

      <section class="flex items-center justify-center p-5 sm:p-8">
        <div class="w-full max-w-md">
          <div class="mb-7 text-center lg:hidden"><div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-extrabold text-white shadow-lg shadow-blue-600/25">LF</div><h1 class="mt-4 text-xl font-extrabold text-slate-900">LogicFit</h1><p class="mt-1 text-sm text-slate-500">لوحة تحكم المنصة</p></div>
          <div class="lf-login-card rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,.10)] sm:p-9">
            <div class="mb-7"><span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><i class="pi pi-lock"></i></span><h2 class="mt-4 text-2xl font-extrabold text-slate-900">مرحبًا بعودتك</h2><p class="mt-1.5 text-sm leading-6 text-slate-500">سجّل الدخول للوصول إلى مساحة إدارة LogicFit.</p></div>
            <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5" novalidate>
              <div><label class="lf-label" for="email">البريد الإلكتروني</label><div class="relative"><i class="pi pi-envelope absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i><input id="email" type="email" formControlName="email" dir="ltr" class="lf-input pr-10 text-left" placeholder="owner@platform.local" autocomplete="username" /></div>@if (invalid('email')) { <p class="mt-1.5 text-xs font-medium text-rose-600">أدخل بريدًا إلكترونيًا صحيحًا.</p> }</div>
              <div><label class="lf-label" for="password">كلمة المرور</label><div class="relative"><i class="pi pi-key absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i><input id="password" [type]="showPass() ? 'text' : 'password'" formControlName="password" dir="ltr" class="lf-input px-10 text-left" placeholder="••••••••" autocomplete="current-password" /><button type="button" (click)="showPass.set(!showPass())" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700" tabindex="-1" aria-label="إظهار أو إخفاء كلمة المرور"><i class="pi" [ngClass]="showPass() ? 'pi-eye-slash' : 'pi-eye'"></i></button></div>@if (invalid('password')) { <p class="mt-1.5 text-xs font-medium text-rose-600">كلمة المرور مطلوبة.</p> }</div>
              @if (error()) { <div role="alert" class="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-3 text-sm text-rose-700"><i class="pi pi-exclamation-circle mt-0.5"></i><span class="whitespace-pre-line">{{ error() }}</span></div> }
              <button type="submit" [disabled]="loading()" class="lf-login-submit"><i class="pi" [ngClass]="loading() ? 'pi-spin pi-spinner' : 'pi-sign-in'"></i>{{ loading() ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول' }}</button>
            </form>
          </div>
          <p class="mt-5 text-center text-xs text-slate-400">هذه المساحة مخصصة لمديري المنصة المصرح لهم.</p>
        </div>
      </section>
    </main>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly currentYear = new Date().getFullYear();
  loading = signal(false);
  error = signal<string>('');
  showPass = signal(false);
  form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required]] });

  invalid(control: string): boolean { const field = this.form.get(control); return !!field && field.invalid && (field.touched || field.dirty); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/dashboard']); },
      error: error => { this.loading.set(false); this.error.set(errMsg(error)); },
    });
  }
}
