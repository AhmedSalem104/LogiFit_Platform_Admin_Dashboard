import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from '../auth/services/auth.service';
import { NAV_ITEMS } from './nav-items';
import { NotifyService } from '../../shared/ui/notify.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ToastModule, ConfirmDialogModule],
  template: `
    <div class="min-h-screen bg-[var(--bg-page)]">
      <!-- Mobile overlay -->
      @if (mobileOpen()) {
        <div class="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" (click)="mobileOpen.set(false)"></div>
      }

      <!-- Sidebar -->
      <aside
        class="fixed top-0 bottom-0 z-40 flex flex-col bg-white border-l border-[var(--border)] transition-transform duration-300 lg:translate-x-0"
        style="inset-inline-start: 0;"
        [style.width.px]="railWidth()"
        [class.translate-x-full]="!mobileOpen()"
      >
        <div class="h-16 flex items-center gap-3 px-4 border-b border-[var(--border)]">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-extrabold text-white shrink-0 shadow-sm">
            LF
          </div>
          @if (!collapsed()) {
            <div class="leading-tight overflow-hidden">
              <div class="font-bold text-slate-800 truncate">LogicFit</div>
              <div class="text-[11px] text-slate-400 truncate">لوحة المنصة</div>
            </div>
          }
        </div>

        <nav class="flex-1 overflow-y-auto py-3 px-2">
          @for (item of visibleNav(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="!bg-primary-50 !text-primary-700 font-semibold"
              (click)="mobileOpen.set(false)"
              class="group flex items-center gap-3 my-0.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors relative"
              [class.justify-center]="collapsed()"
              [title]="collapsed() ? item.label : ''"
            >
              <i [class]="item.icon" class="text-lg w-5 text-center shrink-0"></i>
              @if (!collapsed()) { <span class="truncate">{{ item.label }}</span> }
            </a>
          }
        </nav>

        <div class="p-3 border-t border-[var(--border)] text-[11px] text-slate-400 text-center">
          @if (!collapsed()) { <span>الإصدار 1.0</span> } @else { <i class="pi pi-bolt"></i> }
        </div>
      </aside>

      <!-- Content -->
      <div class="transition-[margin] duration-300" [style.margin-inline-start.px]="contentMargin()">
        <header class="h-16 bg-white/90 backdrop-blur-sm border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-5 sticky top-0 z-20">
          <div class="flex items-center gap-2">
            <!-- Mobile: open drawer -->
            <button (click)="mobileOpen.set(true)" class="btn-icon lg:hidden" aria-label="فتح القائمة">
              <i class="pi pi-bars"></i>
            </button>
            <!-- Desktop: collapse rail -->
            <button (click)="collapsed.set(!collapsed())" class="btn-icon hidden lg:flex" aria-label="طيّ القائمة">
              <i class="pi" [ngClass]="collapsed() ? 'pi-angle-double-left' : 'pi-angle-double-right'"></i>
            </button>
            <h2 class="text-sm sm:text-base font-bold text-slate-700 mr-1">{{ pageTitle() }}</h2>
          </div>

          <div class="flex items-center gap-2 sm:gap-3">
            <div class="text-right leading-tight hidden xs:block sm:block">
              <div class="text-[13px] font-semibold text-slate-800">{{ user()?.fullName || 'مستخدم المنصة' }}</div>
              <div class="text-[11px] text-slate-400">{{ roleLabel() }}</div>
            </div>
            <div class="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
              {{ initials() }}
            </div>
            <button (click)="logout()" class="btn-icon hover:!bg-red-50 hover:!text-red-500" title="تسجيل الخروج" aria-label="تسجيل الخروج">
              <i class="pi pi-sign-out"></i>
            </button>
          </div>
        </header>

        <main class="p-4 sm:p-6 max-w-[1500px] mx-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <p-toast position="top-left" [breakpoints]="{ '640px': { width: '90vw' } }"></p-toast>
    <p-confirmDialog [style]="{ width: '440px', maxWidth: '92vw' }" rejectButtonStyleClass="p-button-text"></p-confirmDialog>
  `,
  styles: [`
    :host { display: block; }
    .btn-icon {
      display: flex; align-items: center; justify-content: center;
      width: 2.25rem; height: 2.25rem; border-radius: 0.6rem;
      color: #475569; background: transparent; border: none; cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .btn-icon:hover { background: #f1f5f9; }
    @media (min-width: 400px) { .xs\\:block { display: block; } }
  `],
})
export class MainLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotifyService);

  collapsed = signal(false);
  mobileOpen = signal(false);
  private isDesktop = signal(window.matchMedia('(min-width: 1024px)').matches);
  user = this.auth.user;
  pageTitle = signal(this.titleForUrl(this.router.url));

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.pageTitle.set(this.titleForUrl(e.urlAfterRedirects)));
  }

  /** Rail width in px. */
  railWidth = computed(() => (this.collapsed() ? 76 : 264));
  /** Desktop pushes content by the rail; mobile drawer overlays (no push). */
  contentMargin = computed(() => (this.isDesktop() ? this.railWidth() : 0));

  visibleNav = computed(() => NAV_ITEMS.filter((item) => this.auth.hasAnyPermission(...item.permissions)));

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

  @HostListener('window:resize')
  onResize(): void {
    this.isDesktop.set(window.matchMedia('(min-width: 1024px)').matches);
  }

  async logout(): Promise<void> {
    const ok = await this.notify.confirm({
      header: 'تسجيل الخروج',
      message: 'هل تريد إنهاء الجلسة الحالية؟',
      acceptLabel: 'خروج',
      danger: true,
    });
    if (ok) this.auth.logout();
  }

  private titleForUrl(url: string): string {
    const clean = url.split('?')[0];
    const match = NAV_ITEMS.find((i) => clean.startsWith(i.route));
    return match?.label ?? 'لوحة المنصة';
  }
}
