import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { NAV_ITEMS } from './nav-items';
import { confirmAction } from '../../shared/ui/notify';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-100" [class.collapsed]="collapsed()">
      <!-- Sidebar -->
      <aside
        class="fixed top-0 bottom-0 z-30 bg-slate-900 text-slate-200 flex flex-col transition-all duration-300"
        [style.width.px]="collapsed() ? 76 : 264"
        style="inset-inline-start: 0;"
      >
        <div class="h-16 flex items-center gap-3 px-4 border-b border-white/10">
          <div class="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center font-extrabold text-white shrink-0">
            LF
          </div>
          @if (!collapsed()) {
            <div class="leading-tight">
              <div class="font-bold text-white">LogicFit</div>
              <div class="text-[11px] text-slate-400">لوحة المنصة</div>
            </div>
          }
        </div>

        <nav class="flex-1 overflow-y-auto py-3">
          @for (item of visibleNav(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-primary-600 text-white"
              class="flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors"
              [title]="item.label"
            >
              <i [class]="item.icon" class="text-lg w-5 text-center shrink-0"></i>
              @if (!collapsed()) { <span>{{ item.label }}</span> }
            </a>
          }
        </nav>

        <div class="p-3 border-t border-white/10 text-[11px] text-slate-500">
          @if (!collapsed()) { <span>الإصدار 1.0</span> }
        </div>
      </aside>

      <!-- Content -->
      <div class="transition-all duration-300" [style.margin-inline-start.px]="collapsed() ? 76 : 264">
        <!-- Topbar -->
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-5 sticky top-0 z-20">
          <button
            (click)="toggle()"
            class="w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center"
            aria-label="طيّ القائمة"
          >
            <i class="pi pi-bars"></i>
          </button>

          <div class="flex items-center gap-3">
            <div class="text-right leading-tight">
              <div class="text-sm font-semibold text-slate-800">{{ user()?.fullName || 'مستخدم المنصة' }}</div>
              <div class="text-[11px] text-slate-400">{{ roleLabel() }}</div>
            </div>
            <div class="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              {{ initials() }}
            </div>
            <button
              (click)="logout()"
              class="w-9 h-9 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center"
              title="تسجيل الخروج"
              aria-label="تسجيل الخروج"
            >
              <i class="pi pi-sign-out"></i>
            </button>
          </div>
        </header>

        <main class="p-5 max-w-[1500px] mx-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  private auth = inject(AuthService);

  collapsed = signal(false);
  user = this.auth.user;

  visibleNav = computed(() =>
    NAV_ITEMS.filter((item) => this.auth.hasAnyPermission(...item.permissions)),
  );

  roleLabel = computed(() => {
    const role = this.user()?.role;
    if (role === 'PlatformOwner') return 'مالك المنصة';
    if (role === 'PlatformAdmin') return 'مشرف المنصة';
    return role || '';
  });

  initials = computed(() => {
    const name = this.user()?.fullName?.trim() || this.user()?.email || 'LF';
    return name.slice(0, 2).toUpperCase();
  });

  toggle(): void {
    this.collapsed.update((v) => !v);
  }

  async logout(): Promise<void> {
    const ok = await confirmAction('تسجيل الخروج', 'هل تريد إنهاء الجلسة الحالية؟', 'خروج', true);
    if (ok) this.auth.logout();
  }
}
