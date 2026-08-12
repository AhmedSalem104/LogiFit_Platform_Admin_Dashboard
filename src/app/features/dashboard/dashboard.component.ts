import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { DashboardFilters, DashboardService, DashboardTenantSummary } from './dashboard.service';
import { PlatformDashboardDto, PlatformOperationsSummaryDto, TenantStatus, TenantSubscriptionStatus } from '../../core/models/platform.models';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';

type KpiFormat = 'number' | 'currency';
type PeriodKey = 'all' | '30' | '90';

interface DashboardKpi {
  label: string;
  value: number;
  icon: string;
  tone: string;
  helper: string;
  format: KpiFormat;
}

interface StatusSegment {
  label: string;
  value: number;
  percent: number;
  color: string;
  tone: string;
}

interface PipelineBar {
  label: string;
  shortLabel: string;
  value: number;
  percent: number;
  tone: string;
}

interface PipelinePoint extends PipelineBar {
  x: number;
  y: number;
}

interface DatabaseSegment {
  label: string;
  value: number;
  percent: number;
  color: string;
}

interface OperationCard {
  label: string;
  value: number;
  caption: string;
  icon: string;
  tone: string;
  route: string;
}

const EMPTY_OPERATIONS: PlatformOperationsSummaryDto = {
  applications: { draft: 0, submitted: 0, underReview: 0, needsMoreInformation: 0, approved: 0, rejected: 0, gymWorkspaceCreation: 0, freelanceWorkspaceCreation: 0, membership: 0 },
  payments: { pendingReview: 0, approved: 0, rejected: 0, pendingAmount: 0 },
  databasePool: { total: 0, available: 0, reserved: 0, provisioning: 0, assigned: 0, maintenance: 0, restorePending: 0, faulted: 0, retired: 0, activeMappings: 0 },
  provisioning: { pending: 0, awaitingDatabaseCapacity: 0, provisioning: 0, completed: 0, failed: 0 },
  backups: { totalBatches: 0, runningBatches: 0, completedBatches: 0, failedBatches: 0, failedArtifacts: 0, lastCompletedAtUtc: null },
  restores: { totalJobs: 0, pendingJobs: 0, runningJobs: 0, completedJobs: 0, failedJobs: 0, capabilities: { enabled: false, mode: '', supportsBacpacImport: false, supportsMappingSwitch: false, unavailableReason: null } },
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent],
  template: `
    <div class="lf-page lf-executive-dashboard" dir="rtl">
      <section class="lf-dashboard-hero">
        <div class="lf-dashboard-hero-top">
          <div class="flex flex-wrap items-center gap-2">
            <span class="lf-live-status" [class.lf-live-status-paused]="!autoRefreshEnabled">
              <span class="lf-live-dot"></span>
              {{ autoRefreshEnabled ? 'بيانات حية' : 'التحديث التلقائي متوقف' }}
            </span>
            @if (refreshing()) { <span class="lf-refreshing-label"><i class="pi pi-spin pi-spinner"></i> جارٍ تحديث المؤشرات</span> }
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <label class="lf-auto-refresh-control">
              <input type="checkbox" [(ngModel)]="autoRefreshEnabled" aria-label="تفعيل التحديث التلقائي">
              <span>تحديث تلقائي كل 60 ثانية</span>
            </label>
            <button type="button" class="lf-btn lf-btn-primary" (click)="load()" [disabled]="loading() || refreshing()">
              <i class="pi pi-refresh" [class.pi-spin]="refreshing()"></i>
              تحديث الآن
            </button>
          </div>
        </div>
        <div class="lf-dashboard-hero-content">
          <app-page-header title="لوحة قيادة المنصة" subtitle="رؤية تنفيذية فورية لصحة الجيمات والاشتراكات والمدفوعات والتشغيل" icon="pi pi-chart-line"></app-page-header>
          <div class="lf-last-updated">
            <span>آخر تحديث ناجح</span>
            <strong dir="ltr">{{ lastUpdated() ? (lastUpdated() | date:'mediumTime') : '—' }}</strong>
            @if (data()) { <span class="lf-data-source"><i class="pi pi-check-circle"></i> من Platform API</span> }
          </div>
        </div>
      </section>

      <section class="lf-card lf-dashboard-filters p-4 sm:p-5">
        <div class="flex flex-wrap items-end gap-3">
          <div class="min-w-44 flex-1">
            <label class="lf-label" for="dashboard-period">نطاق بيانات الاشتراكات</label>
            <select id="dashboard-period" class="lf-input" [(ngModel)]="period" (ngModelChange)="onFilterChange()">
              <option [ngValue]="'all'">كل البيانات</option>
              <option [ngValue]="'90'">آخر 90 يومًا</option>
              <option [ngValue]="'30'">آخر 30 يومًا</option>
            </select>
          </div>
          <div class="min-w-52 flex-1">
            <label class="lf-label" for="dashboard-subscription-status">حالة الاشتراك</label>
            <select id="dashboard-subscription-status" class="lf-input" [(ngModel)]="subscriptionStatus" (ngModelChange)="onFilterChange()">
              <option [ngValue]="null">كل حالات الاشتراك</option>
              <option [ngValue]="TenantSubscriptionStatus.Active">نشط</option>
              <option [ngValue]="TenantSubscriptionStatus.Trial">تجريبي</option>
              <option [ngValue]="TenantSubscriptionStatus.PastDue">متأخر السداد</option>
              <option [ngValue]="TenantSubscriptionStatus.Suspended">موقوف</option>
              <option [ngValue]="TenantSubscriptionStatus.Expired">منتهٍ</option>
            </select>
          </div>
          <div class="flex items-center gap-2 pb-0.5 text-xs text-slate-500">
            <i class="pi pi-shield text-emerald-600"></i>
            <span>الفلاتر تخص الاشتراكات؛ التشغيل الحالي دائمًا محدث</span>
          </div>
          @if (period !== 'all' || subscriptionStatus !== null) {
            <button type="button" class="lf-btn lf-btn-secondary" (click)="clearFilters()"><i class="pi pi-filter-slash"></i> مسح الفلاتر</button>
          }
        </div>
      </section>

      @if (loading() && !data()) {
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          @for (item of skeleton; track item) { <div class="lf-card lf-dashboard-skeleton h-32"></div> }
        </div>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2"><div class="lf-card lf-dashboard-skeleton h-80"></div><div class="lf-card lf-dashboard-skeleton h-80"></div></div>
      } @else if (error() && !data()) {
        <div class="lf-empty-state"><i class="pi pi-exclamation-triangle"></i><h3>تعذر تحميل لوحة القيادة</h3><p>{{ error() }}</p><button type="button" class="lf-btn lf-btn-primary mt-3" (click)="load()">إعادة المحاولة</button></div>
      } @else {
        @if (data(); as dashboard) {
          @if (error()) { <div class="lf-inline-error"><i class="pi pi-exclamation-circle"></i><span>{{ error() }}</span><button type="button" class="mr-auto underline" (click)="load()">إعادة المحاولة</button></div> }

        <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          @for (item of kpis(dashboard); track item.label) {
            <article class="lf-card lf-executive-kpi">
              <div class="lf-kpi-icon" [ngClass]="item.tone"><i [class]="item.icon"></i></div>
              <div class="min-w-0">
                @if (item.format === 'currency') { <div class="lf-kpi-value" dir="ltr">{{ item.value | number:'1.0-0' }} <small>EGP</small></div> }
                @else { <div class="lf-kpi-value">{{ item.value | number }}</div> }
                <div class="lf-kpi-label">{{ item.label }}</div>
                <div class="lf-kpi-helper">{{ item.helper }}</div>
              </div>
            </article>
          }
        </section>

        <section class="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <article class="lf-card p-5 sm:p-6 xl:col-span-5">
            <div class="lf-section-heading"><div><h2>توزيع الجيمات</h2><p>الحالة الحالية من إجمالي الجيمات المسجلة</p></div><span class="lf-chip">Live</span></div>
            <div class="lf-donut-layout mt-6">
              <div class="lf-donut" [style.background]="donutGradient(dashboard)" role="img" aria-label="مخطط توزيع حالات الجيمات"><div class="lf-donut-hole"><strong>{{ dashboard.totalGyms | number }}</strong><span>جيم</span></div></div>
              <div class="space-y-3">
                @for (segment of workspaceSegments(dashboard); track segment.label) {
                  <div class="flex items-center justify-between gap-3 text-sm"><span class="flex items-center gap-2 font-semibold text-slate-700"><i class="lf-legend-dot" [style.background]="segment.color"></i>{{ segment.label }}</span><span class="font-extrabold text-slate-900">{{ segment.value | number }} <small class="font-normal text-slate-400">({{ segment.percent }}%)</small></span></div>
                }
              </div>
            </div>
            <div class="mt-6 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center"><div><strong class="block text-lg text-emerald-600">{{ activeRate(dashboard) }}%</strong><span class="text-xs text-slate-500">معدل النشاط</span></div><div><strong class="block text-lg text-amber-600">{{ dashboard.pendingApprovalGyms | number }}</strong><span class="text-xs text-slate-500">بانتظار مراجعة</span></div><div><strong class="block text-lg text-rose-600">{{ dashboard.suspendedGyms | number }}</strong><span class="text-xs text-slate-500">موقوفة</span></div></div>
          </article>

          <article class="lf-card p-5 sm:p-6 xl:col-span-7">
            <div class="lf-section-heading"><div><h2>ضغط التشغيل حسب المرحلة</h2><p>مقارنة مباشرة للأعمال التي تحتاج متابعة الآن</p></div><span class="lf-chart-meta">بيانات لحظية</span></div>
            <div class="lf-line-chart mt-4">
              <svg viewBox="0 0 560 220" role="img" aria-label="منحنى ضغط التشغيل" preserveAspectRatio="none">
                <line x1="24" y1="180" x2="540" y2="180" class="lf-chart-axis"></line><line x1="24" y1="105" x2="540" y2="105" class="lf-chart-grid-line"></line><line x1="24" y1="30" x2="540" y2="30" class="lf-chart-grid-line"></line>
                <polyline [attr.points]="pipelinePoints(dashboard)" class="lf-chart-line"></polyline>
                @for (point of pipelinePointList(dashboard); track point.shortLabel) { <circle [attr.cx]="point.x" [attr.cy]="point.y" r="5" class="lf-chart-point"></circle> }
              </svg>
              <div class="lf-line-labels">@for (bar of pipelineBars(dashboard); track bar.shortLabel) { <span>{{ bar.shortLabel }}</span> }</div>
            </div>
            <div class="mt-5 space-y-3">@for (bar of pipelineBars(dashboard); track bar.label) { <div><div class="mb-1.5 flex items-center justify-between text-xs"><span class="font-semibold text-slate-600">{{ bar.label }}</span><strong>{{ bar.value | number }}</strong></div><div class="lf-chart-bar-track"><span [ngClass]="bar.tone" [style.width.%]="bar.percent"></span></div></div> }</div>
          </article>
        </section>

        <section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <article class="lf-card p-5 sm:p-6"><div class="lf-section-heading"><div><h2>حالة موارد قواعد البيانات</h2><p>السعة والتخصيص من الملخص التشغيلي</p></div><a routerLink="/database-resources" class="lf-text-link">التفاصيل <i class="pi pi-arrow-left"></i></a></div>
            <div class="mt-6"><div class="lf-stacked-bar" aria-label="توزيع موارد قواعد البيانات">@for (segment of databaseSegments(dashboard); track segment.label) { @if (segment.percent > 0) { <span [style.width.%]="segment.percent" [style.background]="segment.color" [attr.title]="segment.label + ': ' + segment.value"></span> } }</div><div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">@for (segment of databaseSegments(dashboard); track segment.label) { <div class="flex items-center gap-2 text-xs"><i class="lf-legend-dot" [style.background]="segment.color"></i><span class="text-slate-500">{{ segment.label }}</span><strong class="mr-auto">{{ segment.value | number }}</strong></div> }</div></div>
            <div class="mt-5 grid grid-cols-2 gap-3"><div class="lf-mini-stat"><span>إجمالي الموارد</span><strong>{{ operations(dashboard).databasePool.total | number }}</strong></div><div class="lf-mini-stat"><span>Mappings نشطة</span><strong>{{ operations(dashboard).databasePool.activeMappings | number }}</strong></div></div>
          </article>

          <article class="lf-card p-5 sm:p-6"><div class="lf-section-heading"><div><h2>مؤشر الاعتمادية</h2><p>نسب مشتقة من أرقام التشغيل الحالية</p></div><span class="lf-chart-meta">مشتق من API</span></div><div class="mt-5 space-y-4">@for (item of reliability(dashboard); track item.label) { <div><div class="mb-1.5 flex justify-between text-sm"><span class="font-semibold text-slate-600">{{ item.label }}</span><strong [ngClass]="item.tone">{{ item.value }}%</strong></div><div class="lf-progress"><span [ngClass]="item.barTone" [style.width.%]="item.value"></span></div></div> }</div><div class="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500"><i class="pi pi-info-circle ml-1"></i> الاستعادات: {{ restoreCapabilityLabel(dashboard) }}</div></article>
        </section>

        <section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <article class="lf-card p-5 sm:p-6"><div class="lf-section-heading"><div><h2>مركز العمليات</h2><p>انتقل مباشرة إلى الشاشات التي تحتاج قرارًا</p></div></div><div class="mt-5 grid gap-2 sm:grid-cols-2">@for (item of operationCards(dashboard); track item.label) { <a [routerLink]="item.route" class="lf-operation-card"><span class="lf-operation-icon" [ngClass]="item.tone"><i [class]="item.icon"></i></span><span class="min-w-0"><strong class="block truncate">{{ item.label }}</strong><small>{{ item.caption }}</small></span><b class="mr-auto text-lg">{{ item.value | number }}</b><i class="pi pi-angle-left text-slate-300"></i></a> }</div></article>

          <article class="lf-card p-5 sm:p-6"><div class="lf-section-heading"><div><h2>النسخ والاستعادة</h2><p>سلامة البيانات التشغيلية بدون عرض أي مادة حساسة</p></div><a routerLink="/backups" class="lf-text-link">مركز النسخ <i class="pi pi-arrow-left"></i></a></div><div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">@for (item of backupStats(dashboard); track item.label) { <div class="lf-mini-stat" [ngClass]="item.tone"><span>{{ item.label }}</span><strong>{{ item.value | number }}</strong></div> }</div><div class="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-xs"><span class="text-slate-500">آخر نسخة مكتملة</span><strong dir="ltr">{{ operations(dashboard).backups.lastCompletedAtUtc ? (operations(dashboard).backups.lastCompletedAtUtc | date:'medium') : 'لا توجد نسخة مكتملة' }}</strong></div></article>
        </section>

        <section class="lf-card overflow-hidden p-5 sm:p-6">
          <div class="lf-section-heading"><div><h2>الجيمات الحالية</h2><p>بيانات حقيقية من قائمة الجيمات مع بحث سريع</p></div><a routerLink="/tenants" class="lf-btn lf-btn-secondary">إدارة الجيمات <i class="pi pi-arrow-left"></i></a></div>
          <div class="mt-5 flex max-w-md items-center gap-2"><i class="pi pi-search text-slate-400"></i><input class="lf-input" type="search" placeholder="ابحث بالاسم أو النطاق" [(ngModel)]="tenantSearch" (ngModelChange)="onTenantSearchChange($event)" aria-label="البحث في الجيمات"></div>
          @if (tenantsLoading()) { <div class="mt-5 space-y-3">@for (item of [1,2,3,4]; track item) { <div class="h-12 animate-pulse rounded-lg bg-slate-100"></div> }</div> }
          @else if (tenantsError()) { <div class="lf-empty-state mt-5" role="alert"><i class="pi pi-exclamation-triangle"></i><h3>تعذر تحميل قائمة الجيمات</h3><p>{{ tenantsError() }}</p><button type="button" class="lf-btn lf-btn-primary mt-3" (click)="retryTenants()">إعادة المحاولة</button></div> }
          @else { <div class="lf-table-shell mt-5 overflow-x-auto"><table class="min-w-full text-right text-sm"><thead><tr><th>الجيم</th><th>الحالة</th><th>الخطة</th><th>الأعضاء</th><th>انتهاء الاشتراك</th></tr></thead><tbody>@for (tenant of tenants(); track tenant.id) { <tr><td><strong>{{ tenant.name }}</strong><span class="block text-xs text-slate-400" dir="ltr">{{ tenant.subdomain || 'بدون نطاق' }}</span></td><td><span class="lf-badge" [ngClass]="tenantStatusClass(tenant.status)">{{ tenantStatusLabel(tenant.status) }}</span></td><td>{{ tenant.subscription?.planName || 'غير مشترك' }}</td><td>{{ tenant.membersCount | number }}</td><td dir="ltr">{{ tenant.subscription?.endDate ? (tenant.subscription?.endDate | date:'mediumDate') : '—' }}</td></tr> } @empty { <tr><td colspan="5" class="p-8 text-center text-slate-400"><i class="pi pi-inbox mb-2 block text-2xl"></i>لا توجد جيمات مطابقة</td></tr> }</tbody></table></div> }
        </section>

        <footer class="lf-dashboard-footnote"><i class="pi pi-lock"></i><span>المصدر: <code>GET /api/platform/dashboard</code> — البيانات مجمّعة حسب صلاحية Platform Reports ولا تحتوي Connection Strings أو Tokens.</span></footer>
        }
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly service = inject(DashboardService);
  private readonly notify = inject(NotifyService);
  private refreshSubscription?: Subscription;
  private tenantSearchTimer?: ReturnType<typeof setTimeout>;

  readonly skeleton = [1, 2, 3, 4, 5, 6, 7, 8];
  readonly loading = signal(true);
  readonly refreshing = signal(false);
  readonly tenantsLoading = signal(true);
  readonly tenantsError = signal('');
  readonly error = signal('');
  readonly data = signal<PlatformDashboardDto | null>(null);
  readonly tenants = signal<DashboardTenantSummary[]>([]);
  readonly lastUpdated = signal<Date | null>(null);

  readonly TenantSubscriptionStatus = TenantSubscriptionStatus;
  period: PeriodKey = 'all';
  subscriptionStatus: TenantSubscriptionStatus | null = null;
  autoRefreshEnabled = true;
  tenantSearch = '';

  ngOnInit(): void {
    this.load();
    this.loadTenants();
    this.refreshSubscription = interval(60_000).subscribe(() => {
      if (this.autoRefreshEnabled && !this.refreshing()) this.load(false);
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    if (this.tenantSearchTimer) clearTimeout(this.tenantSearchTimer);
  }

  load(showLoading = true): void {
    if (this.refreshing() || (showLoading && this.loading() && this.data())) return;
    if (showLoading) this.loading.set(true);
    else this.refreshing.set(true);
    this.error.set('');
    this.service.get(this.filters()).subscribe({
      next: value => {
        this.data.set(value);
        this.lastUpdated.set(new Date());
        this.loading.set(false);
        this.refreshing.set(false);
      },
      error: error => {
        const message = errMsg(error);
        this.error.set(message);
        this.loading.set(false);
        this.refreshing.set(false);
        this.notify.error(message);
      },
    });
  }

  onFilterChange(): void { this.load(); }

  clearFilters(): void {
    this.period = 'all';
    this.subscriptionStatus = null;
    this.load();
  }

  onTenantSearchChange(value: string): void {
    this.tenantSearch = value;
    if (this.tenantSearchTimer) clearTimeout(this.tenantSearchTimer);
    this.tenantSearchTimer = setTimeout(() => this.loadTenants(), 250);
  }

  kpis(value: PlatformDashboardDto): DashboardKpi[] {
    const operations = this.operations(value);
    const failedOperations = value.failedJobs + value.failedOutbox + operations.provisioning.failed + operations.backups.failedBatches + operations.restores.failedJobs;
    return [
      { label: 'إجمالي الجيمات', value: value.totalGyms, icon: 'pi pi-building', tone: 'lf-tone-indigo', helper: `${value.activeGyms.toLocaleString()} نشطة الآن`, format: 'number' },
      { label: 'معدل النشاط', value: this.activeRate(value), icon: 'pi pi-chart-line', tone: 'lf-tone-emerald', helper: 'من إجمالي الجيمات', format: 'number' },
      { label: 'إجمالي الأعضاء', value: value.totalMembers, icon: 'pi pi-users', tone: 'lf-tone-violet', helper: 'أعضاء العملاء', format: 'number' },
      { label: 'اشتراكات نشطة', value: value.activeSubscriptions, icon: 'pi pi-sync', tone: 'lf-tone-sky', helper: `${value.expiredSubscriptions.toLocaleString()} منتهية`, format: 'number' },
      { label: 'إجمالي التحصيل', value: value.collectedAmount, icon: 'pi pi-wallet', tone: 'lf-tone-emerald', helper: `${value.invoiceCount.toLocaleString()} فاتورة`, format: 'currency' },
      { label: 'مدفوعات بانتظار المراجعة', value: operations.payments.pendingReview || value.pendingPayments, icon: 'pi pi-clock', tone: 'lf-tone-amber', helper: `${operations.payments.pendingAmount.toLocaleString()} EGP معلقة`, format: 'number' },
      { label: 'موارد Database مخصصة', value: operations.databasePool.assigned, icon: 'pi pi-server', tone: 'lf-tone-indigo', helper: `${operations.databasePool.activeMappings.toLocaleString()} mappings نشطة`, format: 'number' },
      { label: 'عناصر تحتاج متابعة', value: failedOperations, icon: 'pi pi-exclamation-triangle', tone: 'lf-tone-rose', helper: `${value.failedJobs.toLocaleString()} jobs فاشلة`, format: 'number' },
    ];
  }

  workspaceSegments(value: PlatformDashboardDto): StatusSegment[] {
    const total = value.totalGyms;
    return [
      this.segment('نشطة', value.activeGyms, total, '#10b981', 'text-emerald-600'),
      this.segment('تجريبية', value.trialGyms, total, '#0ea5e9', 'text-sky-600'),
      this.segment('بانتظار الموافقة', value.pendingApprovalGyms, total, '#f59e0b', 'text-amber-600'),
      this.segment('موقوفة', value.suspendedGyms, total, '#f43f5e', 'text-rose-600'),
    ];
  }

  donutGradient(value: PlatformDashboardDto): string {
    const segments = this.workspaceSegments(value).filter(item => item.percent > 0);
    if (!segments.length) return 'conic-gradient(#e2e8f0 0 100%)';
    let start = 0;
    const stops = segments.map(item => {
      const end = start + item.percent;
      const stop = `${item.color} ${start}% ${end}%`;
      start = end;
      return stop;
    });
    if (start < 100) stops.push(`#e2e8f0 ${start}% 100%`);
    return `conic-gradient(${stops.join(', ')})`;
  }

  pipelineBars(value: PlatformDashboardDto): PipelineBar[] {
    const operations = this.operations(value);
    const pendingApplications = operations.applications.submitted + operations.applications.underReview + operations.applications.needsMoreInformation;
    const bars = [
      { label: 'طلبات تحتاج مراجعة', shortLabel: 'طلبات', value: pendingApplications, tone: 'bg-indigo-500' },
      { label: 'مدفوعات معلقة', shortLabel: 'دفع', value: operations.payments.pendingReview, tone: 'bg-amber-500' },
      { label: 'Provisioning نشط', shortLabel: 'تهيئة', value: operations.provisioning.pending + operations.provisioning.awaitingDatabaseCapacity + operations.provisioning.provisioning, tone: 'bg-sky-500' },
      { label: 'نسخ قيد التنفيذ أو فاشلة', shortLabel: 'نسخ', value: operations.backups.runningBatches + operations.backups.failedBatches, tone: 'bg-violet-500' },
      { label: 'استعادات تحتاج متابعة', shortLabel: 'استعادة', value: operations.restores.pendingJobs + operations.restores.runningJobs + operations.restores.failedJobs, tone: 'bg-rose-500' },
    ];
    const max = Math.max(...bars.map(item => item.value), 1);
    return bars.map(item => ({ ...item, percent: item.value ? Math.max(5, Math.round(item.value * 100 / max)) : 0 }));
  }

  pipelinePointList(value: PlatformDashboardDto): PipelinePoint[] {
    const bars = this.pipelineBars(value);
    const max = Math.max(...bars.map(item => item.value), 1);
    return bars.map((item, index) => ({ ...item, x: 30 + index * 125, y: 180 - Math.round(item.value * 145 / max) }));
  }

  pipelinePoints(value: PlatformDashboardDto): string {
    return this.pipelinePointList(value).map(point => `${point.x},${point.y}`).join(' ');
  }

  databaseSegments(value: PlatformDashboardDto): DatabaseSegment[] {
    const pool = this.operations(value).databasePool;
    const colors: Array<[string, number, string]> = [
      ['متاحة', pool.available, '#10b981'], ['مخصصة', pool.assigned, '#4f46e5'], ['قيد التهيئة', pool.provisioning, '#0ea5e9'],
      ['محجوزة', pool.reserved, '#f59e0b'], ['صيانة', pool.maintenance, '#a855f7'], ['استعادة معلقة', pool.restorePending, '#f97316'],
      ['Faulted', pool.faulted, '#f43f5e'], ['متقاعدة', pool.retired, '#94a3b8'],
    ];
    return colors.map(([label, value, color]) => ({ label, value, color, percent: this.percent(value, pool.total) }));
  }

  reliability(value: PlatformDashboardDto): Array<{ label: string; value: number; tone: string; barTone: string }> {
    const operations = this.operations(value);
    return [
      { label: 'الجيمات النشطة', value: this.activeRate(value), tone: 'text-emerald-600', barTone: 'bg-emerald-500' },
      { label: 'موارد Database المخصصة', value: this.percent(operations.databasePool.assigned, operations.databasePool.total), tone: 'text-indigo-600', barTone: 'bg-indigo-500' },
      { label: 'Provisioning المكتمل', value: this.percent(operations.provisioning.completed, operations.provisioning.completed + operations.provisioning.failed + operations.provisioning.provisioning + operations.provisioning.pending), tone: 'text-sky-600', barTone: 'bg-sky-500' },
      { label: 'دفعات النسخ المكتملة', value: this.percent(operations.backups.completedBatches, operations.backups.totalBatches), tone: 'text-violet-600', barTone: 'bg-violet-500' },
    ];
  }

  operationCards(value: PlatformDashboardDto): OperationCard[] {
    const operations = this.operations(value);
    return [
      { label: 'طلبات مساحات العمل', value: operations.applications.submitted + operations.applications.underReview + operations.applications.needsMoreInformation, caption: 'بانتظار المراجعة', icon: 'pi pi-verified', tone: 'lf-tone-indigo', route: '/workspace-applications' },
      { label: 'طلبات الدفع', value: operations.payments.pendingReview, caption: 'تحتاج تدقيقًا', icon: 'pi pi-wallet', tone: 'lf-tone-amber', route: '/payment-requests' },
      { label: 'Provisioning', value: operations.provisioning.pending + operations.provisioning.awaitingDatabaseCapacity + operations.provisioning.provisioning, caption: 'قيد التنفيذ', icon: 'pi pi-send', tone: 'lf-tone-sky', route: '/operations' },
      { label: 'Database mappings', value: operations.databasePool.activeMappings, caption: 'Mappings نشطة', icon: 'pi pi-server', tone: 'lf-tone-emerald', route: '/database-resources' },
      { label: 'دفعات النسخ', value: operations.backups.runningBatches, caption: 'قيد التشغيل', icon: 'pi pi-database', tone: 'lf-tone-violet', route: '/backups' },
      { label: 'وظائف الاستعادة', value: operations.restores.pendingJobs + operations.restores.runningJobs, caption: operations.restores.capabilities.enabled ? 'متاحة' : 'غير مفعلة', icon: 'pi pi-history', tone: 'lf-tone-rose', route: '/backups' },
    ];
  }

  backupStats(value: PlatformDashboardDto): Array<{ label: string; value: number; tone: string }> {
    const backups = this.operations(value).backups;
    return [
      { label: 'كل الدفعات', value: backups.totalBatches, tone: '' },
      { label: 'مكتملة', value: backups.completedBatches, tone: 'text-emerald-700' },
      { label: 'قيد التشغيل', value: backups.runningBatches, tone: 'text-amber-700' },
      { label: 'فاشلة', value: backups.failedBatches + backups.failedArtifacts, tone: 'text-rose-700' },
    ];
  }

  activeRate(value: PlatformDashboardDto): number { return this.percent(value.activeGyms, value.totalGyms); }

  restoreCapabilityLabel(value: PlatformDashboardDto): string {
    const capabilities = this.operations(value).restores.capabilities;
    return capabilities.enabled ? `${capabilities.mode || 'متاحة'} — ${this.operations(value).restores.totalJobs.toLocaleString()} وظائف` : (capabilities.unavailableReason || 'غير مفعلة على الخادم');
  }

  tenantStatusLabel(status: number): string {
    return ({ [TenantStatus.Active]: 'نشط', [TenantStatus.Suspended]: 'موقوف', [TenantStatus.Trial]: 'تجريبي', [TenantStatus.PastDue]: 'متأخر السداد', [TenantStatus.Cancelled]: 'ملغى', [TenantStatus.PendingApproval]: 'بانتظار الموافقة', [TenantStatus.Archived]: 'مؤرشف', [TenantStatus.Deleted]: 'محذوف' } as Record<number, string>)[status] || 'غير معروف';
  }

  tenantStatusClass(status: number): string {
    return ({ [TenantStatus.Active]: 'lf-badge-green', [TenantStatus.Suspended]: 'lf-badge-red', [TenantStatus.Trial]: 'lf-badge-blue', [TenantStatus.PastDue]: 'lf-badge-yellow', [TenantStatus.PendingApproval]: 'lf-badge-yellow', [TenantStatus.Cancelled]: 'lf-badge-gray', [TenantStatus.Archived]: 'lf-badge-gray', [TenantStatus.Deleted]: 'lf-badge-gray' } as Record<number, string>)[status] || 'lf-badge-gray';
  }

  operations(value: PlatformDashboardDto): PlatformOperationsSummaryDto { return value.operations ?? EMPTY_OPERATIONS; }

  private filters(): DashboardFilters {
    const filters: DashboardFilters = {};
    if (this.period !== 'all') filters.fromUtc = new Date(Date.now() - Number(this.period) * 86_400_000).toISOString();
    if (this.subscriptionStatus !== null) filters.subscriptionStatus = this.subscriptionStatus;
    return filters;
  }

  retryTenants(): void { this.loadTenants(); }

  private loadTenants(): void {
    this.tenantsLoading.set(true);
    this.tenantsError.set('');
    this.service.getTenants(1, 8, this.tenantSearch).subscribe({
      next: response => { this.tenants.set(response.items ?? []); this.tenantsLoading.set(false); },
      error: error => { const message = errMsg(error); this.tenants.set([]); this.tenantsError.set(message); this.tenantsLoading.set(false); },
    });
  }

  private segment(label: string, value: number, total: number, color: string, tone: string): StatusSegment { return { label, value, color, tone, percent: this.percent(value, total) }; }
  private percent(value: number, total: number): number { return total > 0 ? Math.min(100, Math.round(value * 100 / total)) : 0; }
}
