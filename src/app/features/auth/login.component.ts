import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { errMsg } from '../../shared/ui/notify.service';

@Component({
  selector: 'app-login', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="login-shell" dir="rtl">
      <section class="login-card" aria-labelledby="login-title">
        <div class="login-brand"><span class="login-logo">LF</span><div><b>LogicFit</b><span>منصة الإدارة المركزية</span></div></div>
        <div class="login-heading"><span class="login-lock"><i class="pi pi-shield"></i></span><h1 id="login-title">تسجيل الدخول</h1><p>مرحبًا بعودتك. سجّل الدخول لإدارة منصة LogicFit بأمان.</p></div>
        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form" novalidate>
          <div class="field-group"><label for="email">البريد الإلكتروني <span class="required-mark" aria-hidden="true">*</span></label><div class="field-wrap" [class.field-invalid]="invalid('email')" [class.field-valid]="valid('email')"><i class="pi pi-envelope field-icon"></i><input id="email" type="email" formControlName="email" dir="ltr" autocomplete="username" placeholder="owner@platform.local" aria-describedby="email-error"></div>@if (invalid('email')) {<p id="email-error" class="field-error" role="alert">أدخل بريدًا إلكترونيًا صحيحًا.</p>}@else if (valid('email')) {<p class="field-success"><i class="pi pi-check"></i> البريد الإلكتروني صحيح</p>}</div>
          <div class="field-group"><label for="password">كلمة المرور <span class="required-mark" aria-hidden="true">*</span></label><div class="field-wrap" [class.field-invalid]="invalid('password')"><i class="pi pi-key field-icon"></i><input id="password" [type]="showPass() ? 'text' : 'password'" formControlName="password" dir="ltr" autocomplete="current-password" placeholder="••••••••" (keyup)="detectCaps($event)" aria-describedby="password-error caps-warning"><button type="button" class="password-toggle" (click)="togglePass()" [attr.aria-label]="showPass() ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"><i class="pi" [ngClass]="showPass() ? 'pi-eye-slash' : 'pi-eye'"></i></button></div>@if (capsLock()) {<p id="caps-warning" class="caps-warning"><i class="pi pi-info-circle"></i> Caps Lock مفعّل</p>}@if (invalid('password')) {<p id="password-error" class="field-error" role="alert">كلمة المرور مطلوبة.</p>}</div>
          <div class="login-options"><label class="remember-option"><input type="checkbox" [checked]="rememberMe()" (change)="rememberMe.set($any($event.target).checked)"><span>تذكرني على هذا الجهاز</span></label><button type="button" class="forgot-link" (click)="forgotPassword()">نسيت كلمة المرور؟</button></div>
          @if (error()) {<div class="login-error" role="alert"><i class="pi pi-exclamation-circle"></i><span>{{ error() }}</span></div>}
          <button type="submit" class="login-submit" [disabled]="loading() || form.invalid"><i class="pi" [ngClass]="loading() ? 'pi-spinner pi-spin' : 'pi-sign-in'"></i>{{ loading() ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول' }}</button>
        </form>
        <div class="login-footer"><span>هذه المساحة مخصصة لمديري المنصة المصرح لهم.</span><small>© {{ currentYear }} LogicFit</small></div>
      </section>
    </main>
  `,
  styles: [`
    :host { display:block; min-height:100vh; }
    .login-shell { min-height:100vh; display:grid; place-items:center; padding:1.25rem; background:linear-gradient(145deg,#0f172a,#172554 56%,#1d4ed8); }
    .login-card { width:min(100%,440px); padding:1.75rem 2rem 1.5rem; border:1px solid rgba(255,255,255,.7); border-radius:1.5rem; background:rgba(255,255,255,.98); box-shadow:0 28px 80px rgba(2,6,23,.32); animation:login-enter .5s cubic-bezier(.2,.8,.2,1) both; }
    .login-brand { display:flex; align-items:center; justify-content:center; gap:.75rem; margin-bottom:1.35rem; }.login-logo { display:grid; place-items:center; width:2.8rem; height:2.8rem; border-radius:.9rem; color:#fff; background:linear-gradient(135deg,#2563eb,#4f46e5); font-weight:800; box-shadow:0 9px 20px rgba(37,99,235,.25); }.login-brand b,.login-brand span { display:block; }.login-brand b { color:#172033; font-size:1rem; }.login-brand span { margin-top:.15rem; color:#64748b; font-size:.7rem; }
    .login-heading { text-align:center; }.login-lock { display:grid; place-items:center; width:2.7rem; height:2.7rem; margin:0 auto; border-radius:.85rem; color:#2563eb; background:#eff6ff; }.login-heading h1 { margin:.8rem 0 .35rem; color:#0f172a; font-size:1.45rem; font-weight:800; }.login-heading p { margin:0 auto; max-width:20rem; color:#64748b; font-size:.82rem; line-height:1.8; }
    .login-form { display:grid; gap:1rem; margin-top:1.45rem; }.field-group label { display:block; margin-bottom:.4rem; color:#334155; font-size:.8rem; font-weight:700; }.required-mark { color:#e11d48; }.field-label-row { display:flex; align-items:center; justify-content:space-between; }.forgot-link { color:#2563eb; border:0; background:transparent; font:700 .72rem inherit; cursor:pointer; }.forgot-link:hover { color:#1d4ed8; text-decoration:underline; }
    .field-wrap { position:relative; display:flex; align-items:center; border:1px solid #d8deea; border-radius:.75rem; background:#fff; transition:border-color .18s,box-shadow .18s,background .18s; }.field-wrap:focus-within { border-color:#2563eb; box-shadow:0 0 0 4px rgba(37,99,235,.12); }.field-wrap.field-invalid { border-color:#e11d48; background:#fff8f8; }.field-wrap.field-invalid:focus-within { box-shadow:0 0 0 4px rgba(225,29,72,.1); }.field-wrap.field-valid { border-color:#10b981; }.field-wrap input { width:100%; min-height:3rem; padding:.65rem 2.65rem .65rem .85rem; border:0; outline:0; color:#0f172a; background:transparent; font:500 .88rem inherit; }.field-icon { position:absolute; right:.9rem; color:#64748b; font-size:.9rem; pointer-events:none; }.password-toggle { position:absolute; left:.75rem; display:grid; place-items:center; width:2rem; height:2rem; color:#64748b; border:0; border-radius:.5rem; background:transparent; cursor:pointer; }.password-toggle:hover { color:#1d4ed8; background:#eff6ff; }.field-error,.field-success,.caps-warning { display:flex; align-items:center; gap:.3rem; margin:.35rem 0 0; font-size:.72rem; font-weight:700; }.field-error { color:#e11d48; }.field-success { color:#059669; }.caps-warning { color:#b45309; }.login-options { display:flex; align-items:center; justify-content:space-between; gap:.75rem; }.remember-option { display:flex; align-items:center; gap:.45rem; color:#64748b; font-size:.75rem; cursor:pointer; }.remember-option input { width:1rem; height:1rem; accent-color:#2563eb; }
    .login-error { display:flex; align-items:flex-start; gap:.5rem; padding:.75rem .85rem; border:1px solid #fecdd3; border-radius:.75rem; color:#be123c; background:#fff1f2; font-size:.78rem; line-height:1.7; }.login-submit { display:flex; align-items:center; justify-content:center; gap:.55rem; width:100%; min-height:3rem; margin-top:.2rem; color:#fff; border:0; border-radius:.8rem; background:linear-gradient(135deg,#2563eb,#4f46e5); box-shadow:0 11px 22px rgba(37,99,235,.24); font:800 .88rem inherit; cursor:pointer; transition:transform .18s,box-shadow .18s,opacity .18s; }.login-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 15px 28px rgba(37,99,235,.3); }.login-submit:active:not(:disabled) { transform:translateY(0); }.login-submit:focus-visible,.forgot-link:focus-visible,.password-toggle:focus-visible { outline:3px solid rgba(37,99,235,.28); outline-offset:2px; }.login-submit:disabled { cursor:not-allowed; opacity:.58; box-shadow:none; }.login-footer { display:flex; flex-direction:column; gap:.3rem; margin-top:1.5rem; color:#94a3b8; text-align:center; font-size:.68rem; }.login-footer small { color:#cbd5e1; }
    @keyframes login-enter { from { opacity:0; transform:translateY(14px) scale(.985); } to { opacity:1; transform:translateY(0) scale(1); } }
    @media (max-width:480px) { .login-shell { align-items:start; padding:1rem; padding-top:max(1rem,env(safe-area-inset-top)); }.login-card { margin-top:4vh; padding:1.35rem; border-radius:1.25rem; }.login-brand { margin-bottom:1.35rem; }.login-heading h1 { font-size:1.35rem; } }
    @media (prefers-reduced-motion:reduce) { .login-card { animation:none; } }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder); private auth = inject(AuthService); private router = inject(Router);
  readonly currentYear = new Date().getFullYear(); loading = signal(false); error = signal(''); showPass = signal(false); capsLock = signal(false); rememberMe = signal(localStorage.getItem('lf-remember-login') === '1');
  form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required]] });
  invalid(control: string): boolean { const field = this.form.get(control); return !!field && field.invalid && (field.touched || field.dirty); }
  valid(control: string): boolean { const field = this.form.get(control); return !!field && field.valid && (field.touched || field.dirty); }
  @HostListener('window:keydown', ['$event']) onKeydown(event: KeyboardEvent): void { if (event.key === 'CapsLock') this.capsLock.set(event.getModifierState('CapsLock')); }
  detectCaps(event: KeyboardEvent): void { this.capsLock.set(event.getModifierState('CapsLock')); }
  togglePass(): void { this.showPass.update(value => !value); }
  forgotPassword(): void { this.error.set('لإعادة ضبط كلمة المرور، يرجى التواصل مع مالك المنصة أو مسؤول النظام.'); }
  submit(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.loading.set(true); this.error.set(''); localStorage.setItem('lf-remember-login', this.rememberMe() ? '1' : '0'); this.auth.login(this.form.getRawValue()).subscribe({ next: () => { this.loading.set(false); this.router.navigate(['/dashboard']); }, error: error => { this.loading.set(false); this.error.set(errMsg(error)); } }); }
}
