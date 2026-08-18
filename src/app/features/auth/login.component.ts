import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
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
    <main class="login-shell" dir="rtl">
      <section class="login-card" aria-labelledby="login-title">
        <div class="brand"><span>LF</span><div><b>LogicFit</b><small>منصة الإدارة المركزية</small></div></div>
        <header>
          <span class="shield"><i class="pi pi-shield"></i></span>
          <h1 id="login-title">دخول إدارة المنصة</h1>
          <p>أدخل بريدك وكلمة المرور للدخول الآمن إلى لوحة الإدارة.</p>
        </header>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label for="email">البريد الإلكتروني</label>
          <div class="field"><i class="pi pi-envelope"></i><input id="email" type="email" formControlName="email" autocomplete="username" placeholder="admin@example.com" dir="ltr"></div>
          @if (invalid('email')) { <p class="field-error">أدخل بريدًا إلكترونيًا صحيحًا.</p> }
          <label for="password">كلمة المرور</label>
          <div class="field"><i class="pi pi-lock"></i><input id="password" [type]="showPass() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" dir="ltr" (keyup)="detectCaps($event)"><button type="button" aria-label="إظهار كلمة المرور" (click)="showPass.set(!showPass())"><i class="pi" [class.pi-eye]="!showPass()" [class.pi-eye-slash]="showPass()"></i></button></div>
          @if (capsLock()) { <p class="warning"><i class="pi pi-info-circle"></i> Caps Lock مفعّل</p> }
          @if (error()) { <p class="error" role="alert"><i class="pi pi-exclamation-circle"></i>{{ error() }}</p> }
          <button class="primary" type="submit" [disabled]="loading() || form.invalid">
            @if (loading()) { <i class="pi pi-spin pi-spinner"></i> }
            {{ loading() ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول' }}
          </button>
        </form>
        <footer><i class="pi pi-lock"></i> تسجيل الدخول يتم بالبريد وكلمة المرور فقط.<small>© {{ currentYear }} LogicFit</small></footer>
      </section>
    </main>
  `,
  styles: [`
    :host{display:block;min-height:100vh;min-width:0}.login-shell{width:100%;min-width:0;min-height:100vh;display:grid;place-items:center;overflow-x:hidden;padding:1.25rem;background:radial-gradient(circle at 15% 15%,#1d4ed8 0,transparent 28%),linear-gradient(145deg,#020617,#172554 65%,#1e3a8a)}.login-card{box-sizing:border-box;width:100%;max-width:440px;min-width:0;overflow:hidden;padding:1.7rem 2rem;border:1px solid rgba(255,255,255,.7);border-radius:1.5rem;background:rgba(255,255,255,.98);box-shadow:0 30px 90px rgba(2,6,23,.38)}.brand,header,form,footer{min-width:0;max-width:100%}.brand{display:flex;align-items:center;justify-content:center;gap:.65rem;margin-bottom:1.35rem}.brand>span{display:grid;place-items:center;width:44px;height:44px;flex:none;border-radius:14px;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;font-weight:900}.brand div{display:grid;min-width:0}.brand b,.brand small,h1,header p,footer{overflow-wrap:anywhere}.brand b{color:#0f172a}.brand small{color:#64748b}.shield{display:grid;place-items:center;width:46px;height:46px;margin:0 auto .65rem;flex:none;border-radius:14px;background:#eff6ff;color:#2563eb;font-size:1.2rem}header{text-align:center}h1{margin:0;color:#0f172a;font-size:1.5rem;line-height:1.35}header p{margin:.45rem 0 0;color:#64748b;line-height:1.7;font-size:.82rem}form{display:grid;gap:.55rem;margin-top:1.35rem}label{font-size:.82rem;font-weight:800;color:#334155}.field{position:relative;display:flex;align-items:center;min-width:0}.field>i{position:absolute;right:.9rem;color:#64748b}.field input{width:100%;min-width:0;box-sizing:border-box;padding:.7rem 2.6rem;min-height:48px;border:1px solid #d8deea;border-radius:10px;color:#0f172a;font:inherit}.field button{position:absolute;left:.55rem;border:0;background:transparent;color:#64748b}.field-error,.warning{margin:0;color:#be123c;font-size:.72rem}.warning{color:#b45309}.primary{display:flex;align-items:center;justify-content:center;gap:.45rem;width:100%;min-width:0;min-height:48px;margin-top:.65rem;border:0;border-radius:10px;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;font:inherit;font-weight:800;box-shadow:0 10px 22px rgba(37,99,235,.24)}.primary:disabled{opacity:.55}.error{display:flex;gap:.4rem;min-width:0;padding:.7rem;border:1px solid #fecdd3;border-radius:9px;background:#fff1f2;color:#be123c;font-size:.78rem;overflow-wrap:anywhere}footer{display:grid;justify-items:center;gap:.3rem;margin-top:1.4rem;color:#64748b;font-size:.72rem}footer small{color:#94a3b8}@media(max-width:480px){.login-shell{width:100vw;max-width:100vw;align-items:start;padding:.75rem}.login-card{width:100%;max-width:100%;margin-top:2vh;padding:1.25rem 1rem;border-radius:1.25rem}h1{font-size:1.3rem}header p{font-size:.76rem}.brand{margin-bottom:1rem}}
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly currentYear = new Date().getFullYear();
  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPass = signal(false);
  readonly capsLock = signal(false);
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  invalid(control: string): boolean {
    const field = this.form.get(control);
    return !!field && field.invalid && (field.touched || field.dirty);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'CapsLock') this.updateCapsLock(event);
  }

  detectCaps(event: KeyboardEvent): void { this.updateCapsLock(event); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/dashboard']); },
      error: error => { this.loading.set(false); this.error.set(errMsg(error)); },
    });
  }

  private updateCapsLock(event: KeyboardEvent): void {
    this.capsLock.set(event.getModifierState?.('CapsLock') ?? false);
  }
}
