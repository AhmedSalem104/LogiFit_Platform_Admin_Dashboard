import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { NAV_GROUPS, NAV_ITEMS, NavGroup } from './nav-items';
import { NotifyService } from '../../shared/ui/notify.service';
import { AdminAssistantComponent } from '../../shared/assistant/admin-assistant.component';
import { AdminAssistantService } from '../../shared/assistant/admin-assistant.service';
import { NotificationService } from '../../shared/ui/notification.service';

@Component({
  selector: 'app-main-layout', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet, AdminAssistantComponent],
  template: `
    <div class="min-h-screen bg-[var(--bg-page)]">
      @if (mobileOpen()) { <div class="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden" (click)="mobileOpen.set(false)"></div> }
      <aside class="lf-sidebar" [style.width.px]="railWidth()" [class.lf-sidebar-collapsed]="effectiveCollapsed()" [class.lf-mobile-open]="mobileOpen()" (mouseenter)="sidebarHover.set(true)" (mouseleave)="sidebarHover.set(false)">
        <div class="lf-brand"><div class="lf-brand-mark"><i class="pi pi-bolt"></i></div>@if (!effectiveCollapsed()) { <div><b>LogicFit</b><span>إدارة المنصة</span></div> }</div>
        @if (!effectiveCollapsed()) { <div class="lf-nav-search"><i class="pi pi-search"></i><input [(ngModel)]="navQuery" placeholder="ابحث في القائمة" aria-label="البحث في القائمة"><kbd>Ctrl /</kbd></div> }
        <nav class="flex-1 overflow-y-auto px-3 py-4">
          @for (group of visibleGroups(); track group) {
            @if (!effectiveCollapsed()) { <div class="lf-nav-group-heading"><span>{{ groupLabel(group) }}</span><span class="lf-nav-group-count">{{ groupedNav()[group].length }}</span></div> }
            <div class="lf-nav-grid">
              @for (item of groupedNav()[group]; track item.route) {
                <a [routerLink]="item.route" routerLinkActive="lf-nav-active" (click)="mobileOpen.set(false)" class="lf-nav-item" [title]="item.label">
                  <i [class]="item.icon"></i>
                  @if (!effectiveCollapsed()) { <span>{{ item.label }}</span> }
                </a>
              }
            </div>
          }
          @if (!visibleNav().length) { <div class="px-3 py-8 text-center text-xs text-slate-500">لا توجد نتائج</div> }
        </nav>
        <div class="lf-sidebar-footer" [class.justify-center]="effectiveCollapsed()"><i class="pi pi-shield"></i>@if (!effectiveCollapsed()) { <span>نظام آمن ومراقب</span> }</div>
      </aside>

      <div class="transition-[margin] duration-300" [style.margin-inline-start.px]="contentMargin()">
        <header class="lf-topbar">
          <div class="flex items-center gap-2"><button class="lf-icon-btn lg:hidden" (click)="mobileOpen.set(true)" aria-label="فتح القائمة"><i class="pi pi-bars"></i></button><button class="lf-icon-btn hidden lg:grid" (click)="toggleCollapsed()" [attr.aria-label]="collapsed() ? 'توسيع القائمة' : 'طي القائمة'"><i class="pi" [ngClass]="collapsed() ? 'pi-angle-double-left' : 'pi-angle-double-right'"></i></button><div><span class="text-xs text-slate-400">لوحة التحكم</span><h2>{{ pageTitle() }}</h2></div></div>
          <div class="flex items-center gap-3"><button type="button" class="lf-icon-btn hidden sm:grid" (click)="assistant.openSearch()" title="المساعد الذكي (Ctrl+K)" aria-label="فتح المساعد الذكي"><i class="pi pi-sparkles"></i></button><a routerLink="/alerts" class="lf-icon-btn relative" title="مركز التنبيهات"><i class="pi pi-bell"></i>@if (notifications.unreadCount() > 0) {<span class="notification-count">{{ notifications.unreadCount() > 99 ? '99+' : notifications.unreadCount() }}</span>}</a><div class="lf-user"><div class="hidden sm:block"><b>{{ user()?.fullName || 'مستخدم المنصة' }}</b><span>{{ roleLabel() }}</span></div><span class="lf-avatar">{{ initials() }}</span></div><button class="lf-icon-btn text-rose-500 hover:bg-rose-50" (click)="logout()" title="تسجيل الخروج"><i class="pi pi-sign-out"></i></button></div>
        </header>
        <main class="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8"><div class="mb-3 flex justify-end print-hide"><button type="button" class="lf-btn lf-btn-secondary" (click)="printPage()"><i class="pi pi-print"></i> طباعة الشاشة</button></div><router-outlet></router-outlet></main>
      </div>
    </div>
    <app-admin-assistant></app-admin-assistant>
  `,
  styles: [`
    :host { display:block; }
    .lf-sidebar { position:fixed; inset:0 0 0 auto; z-index:40; display:flex; flex-direction:column; color:#cbd5e1; background:linear-gradient(180deg,#0f172a 0%,#172554 100%); box-shadow:0 0 28px rgba(15,23,42,.18); transition:transform .3s ease,width .3s ease; }
    .lf-brand { height:5rem; display:flex; align-items:center; gap:.8rem; padding:0 1.15rem; border-bottom:1px solid rgba(255,255,255,.08); overflow:hidden; }
    .lf-brand-mark { width:2.6rem; height:2.6rem; display:grid; place-items:center; flex:none; border-radius:.85rem; color:#fff; background:linear-gradient(135deg,#38bdf8,#6366f1); box-shadow:0 8px 18px rgba(56,189,248,.2); }
    .lf-brand b { display:block; color:#fff; font-size:1rem; }.lf-brand span { display:block; margin-top:.1rem; color:#94a3b8; font-size:.7rem; }
    .lf-nav-search { display:flex; align-items:center; gap:.5rem; margin:.85rem .75rem .25rem; padding:.5rem .65rem; color:#94a3b8; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.08); border-radius:.7rem; }.lf-nav-search input { min-width:0; flex:1; outline:0; color:#fff; background:transparent; font:600 .75rem inherit; }.lf-nav-search input::placeholder { color:#64748b; }.lf-nav-search kbd { color:#64748b; font-size:.6rem; }
    .lf-nav-group-heading { display:flex; align-items:center; justify-content:space-between; gap:.5rem; margin:.95rem .35rem .45rem; padding:0 .25rem; color:#94a3b8; font-size:.62rem; font-weight:800; letter-spacing:.02em; }
    .lf-nav-group-heading::before { content:''; width:.35rem; height:.35rem; flex:none; border-radius:999px; background:#38bdf8; box-shadow:0 0 0 3px rgba(56,189,248,.12); }
    .lf-nav-group-heading > span:first-of-type { flex:1; }
    .lf-nav-group-count { min-width:1.25rem; padding:.12rem .3rem; border:1px solid rgba(148,163,184,.18); border-radius:999px; color:#64748b; text-align:center; font-size:.58rem; }
    .lf-nav-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.55rem; margin-bottom:.35rem; }
    .lf-nav-item { min-height:5.1rem; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.42rem; padding:.65rem .35rem; border:1px solid transparent; border-radius:1rem; color:#cbd5e1; text-align:center; font-size:.68rem; line-height:1.2; font-weight:700; transition:transform .18s, background .18s, border-color .18s, color .18s; }
    .lf-nav-item i { width:auto; text-align:center; font-size:1.45rem; line-height:1; }
    .lf-nav-item:hover { color:#fff; background:rgba(255,255,255,.1); border-color:rgba(147,197,253,.18); transform:translateY(-2px); }
    .lf-nav-active { color:#fff!important; background:linear-gradient(145deg,rgba(59,130,246,.42),rgba(99,102,241,.28))!important; border-color:rgba(147,197,253,.42)!important; box-shadow:0 8px 18px rgba(15,23,42,.2), inset 0 0 0 1px rgba(96,165,250,.16); }
    .lf-sidebar-collapsed .lf-nav-grid { grid-template-columns:1fr; }
    .lf-sidebar-collapsed .lf-nav-item { min-height:3.2rem; padding:.5rem 0; }
    .lf-sidebar-collapsed .lf-nav-item i { font-size:1.2rem; }
    .lf-sidebar-footer { display:flex; align-items:center; gap:.55rem; padding:1rem; border-top:1px solid rgba(255,255,255,.08); color:#94a3b8; font-size:.7rem; }
    .lf-topbar { height:5rem; position:sticky; top:0; z-index:20; display:flex; align-items:center; justify-content:space-between; padding:0 1.25rem; background:rgba(255,255,255,.88); backdrop-filter:blur(16px); border-bottom:1px solid #e8edf5; }.lf-topbar h2 { margin:.1rem 0 0; color:#172033; font-size:.95rem; font-weight:800; }
    .lf-icon-btn { width:2.5rem; height:2.5rem; display:grid; place-items:center; border-radius:.75rem; color:#475569; transition:.16s; }.lf-icon-btn:hover { background:#eff6ff; color:#2563eb; }.lf-user { display:flex; align-items:center; gap:.6rem; }.lf-user b { display:block; color:#334155; font-size:.78rem; }.lf-user span:not(.lf-avatar) { display:block; color:#94a3b8; font-size:.67rem; }.lf-avatar { width:2.35rem; height:2.35rem; display:grid; place-items:center; border-radius:.8rem; color:#1d4ed8; background:#dbeafe; font-weight:800; font-size:.75rem; }
    @media (max-width:1023px) { .lf-sidebar { transform:translateX(100%); }.lf-sidebar.lf-mobile-open { transform:translateX(0); } }
    @media (min-width:1024px) { .lf-sidebar { transform:translateX(0); } }
  `],
})
export class MainLayoutComponent {
  private auth = inject(AuthService); private router = inject(Router); private notify = inject(NotifyService); readonly notifications = inject(NotificationService);
  readonly assistant = inject(AdminAssistantService);
  collapsed = signal(localStorage.getItem('lf-sidebar-collapsed') === '1'); sidebarHover = signal(false); mobileOpen = signal(false); navQuery = '';
  private isDesktop = signal(window.matchMedia('(min-width:1024px)').matches); user = this.auth.user; pageTitle = signal(this.titleForUrl(this.router.url));
  constructor() { this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(event => { this.pageTitle.set(this.titleForUrl(event.urlAfterRedirects)); this.notifications.refresh(); }); this.notifications.refresh(); }
  effectiveCollapsed = computed(() => this.collapsed() && !this.sidebarHover() && this.isDesktop()); railWidth = computed(() => this.effectiveCollapsed() ? 78 : 272); contentMargin = computed(() => this.isDesktop() ? this.railWidth() : 0);
  visibleNav = computed(() => {
    const query = this.navQuery.trim().toLocaleLowerCase();
    return NAV_ITEMS.filter(item => {
      const searchableText = `${item.label} ${item.searchTerms ?? ''}`.toLocaleLowerCase();
      const isSearchMode = query.length > 0;
      return this.auth.hasAnyPermission(...item.permissions)
        && (item.visible !== false || isSearchMode)
        && (!query || searchableText.includes(query));
    });
  });
  groupedNav = computed(() => this.visibleNav().reduce((groups, item) => { (groups[item.group] ??= []).push(item); return groups; }, {} as Record<NavGroup, typeof NAV_ITEMS>));
  visibleGroups = computed(() => (Object.keys(NAV_GROUPS) as NavGroup[]).filter(group => (this.groupedNav()[group]?.length ?? 0) > 0));
  roleLabel = computed(() => this.user()?.role === 'PlatformOwner' ? 'مالك المنصة' : this.user()?.role === 'PlatformAdmin' ? 'مشرف المنصة' : this.user()?.role || '');
  initials = computed(() => { const name = this.user()?.fullName?.trim() || this.user()?.email || 'LF'; return name.slice(0, 2).toUpperCase(); });
  @HostListener('window:resize') onResize() { this.isDesktop.set(window.matchMedia('(min-width:1024px)').matches); }
  @HostListener('document:keydown', ['$event']) onKeydown(event: KeyboardEvent) { if (event.ctrlKey && event.key === '/') { event.preventDefault(); document.querySelector<HTMLInputElement>('.lf-nav-search input')?.focus(); } }
  groupLabel(group: NavGroup): string { return NAV_GROUPS[group]; }
  toggleCollapsed(): void { const value = !this.collapsed(); this.collapsed.set(value); localStorage.setItem('lf-sidebar-collapsed', value ? '1' : '0'); }
  printPage(): void { document.title = `${this.pageTitle()} - LogicFit`; window.print(); }
  async logout() { if (await this.notify.confirm({ header: 'تسجيل الخروج', message: 'هل تريد إنهاء الجلسة الحالية؟', acceptLabel: 'خروج', danger: true })) this.auth.logout(); }
  private titleForUrl(url: string) { const match = NAV_ITEMS.find(item => url.split('?')[0].startsWith(item.route)); return match?.label ?? 'لوحة التحكم'; }
}
