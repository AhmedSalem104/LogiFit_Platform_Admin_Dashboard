import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { DashboardService } from './dashboard.service';
import { PlatformDashboardDto } from '../../core/models/platform.models';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';

type Kpi = { label: string; value: number; icon: string; tone: string };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, PageHeaderComponent],
  template: `
    <div class="lf-page">
      <div class="lf-toolbar">
        <app-page-header title="لوحة قيادة المنصة" subtitle="متابعة صحة المنصة وأهم العمليات من مكان واحد" icon="pi pi-sparkles"></app-page-header>
        <button class="lf-btn lf-btn-secondary" (click)="load()"><i class="pi pi-refresh"></i> تحديث البيانات</button>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (item of skeleton; track item) { <div class="lf-card h-32 animate-pulse bg-slate-50"></div> }
        </div>
      } @else if (error()) {
        <div class="lf-empty-state"><i class="pi pi-exclamation-triangle"></i><h3>تعذّر تحميل بيانات المنصة</h3><p>{{ error() }}</p><button class="lf-btn lf-btn-primary mt-3" (click)="load()">إعادة المحاولة</button></div>
      } @else {
        @if (data(); as dashboard) {
          @if (dashboard.pendingApprovalGyms > 0 || dashboard.suspendedGyms > 0) {
            <a routerLink="/tenants" class="lf-alert-banner">
              <span class="lf-alert-icon"><i class="pi pi-bell"></i></span>
              <span><b>توجد عناصر تحتاج متابعة.</b> {{ dashboard.pendingApprovalGyms }} منشأة بانتظار الموافقة و{{ dashboard.suspendedGyms }} منشأة موقوفة.</span>
              <i class="pi pi-arrow-left mr-auto"></i>
            </a>
          }

          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            @for (item of kpis(dashboard); track item.label) {
              <article class="lf-card lf-kpi-card">
                <div class="lf-kpi-icon" [ngClass]="item.tone"><i [class]="item.icon"></i></div>
                <div><div class="lf-kpi-value">{{ item.value | number }}</div><div class="lf-kpi-label">{{ item.label }}</div></div>
              </article>
            }
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <section class="lf-card p-6 xl:col-span-2">
              <div class="lf-section-heading"><div><h2>صحة المنصة</h2><p>نسب المنشآت الرياضية بحسب حالتها الحالية</p></div><span class="lf-chip">مباشر</span></div>
              <div class="mt-7 space-y-5">
                @for (row of health(dashboard); track row.label) {
                  <div><div class="flex items-center justify-between text-sm mb-2"><span class="font-semibold text-slate-700">{{ row.label }}</span><span class="font-bold text-slate-900">{{ row.value }}%</span></div><div class="lf-progress"><span [ngClass]="row.tone" [style.width.%]="row.value"></span></div></div>
                }
              </div>
            </section>
            <section class="lf-card p-6">
              <div class="lf-section-heading"><div><h2>إجراءات سريعة</h2><p>الوصول المباشر لأكثر المهام استخدامًا</p></div></div>
              <div class="mt-5 grid gap-2">
                <a routerLink="/tenants" class="lf-quick-link"><i class="pi pi-building"></i> إدارة المنشآت <i class="pi pi-angle-left mr-auto"></i></a>
                <a routerLink="/payment-requests" class="lf-quick-link"><i class="pi pi-wallet"></i> مراجعة المدفوعات <i class="pi pi-angle-left mr-auto"></i></a>
                <a routerLink="/alerts" class="lf-quick-link"><i class="pi pi-bell"></i> مركز التنبيهات <i class="pi pi-angle-left mr-auto"></i></a>
                <a routerLink="/operations" class="lf-quick-link"><i class="pi pi-cog"></i> مراقبة العمليات <i class="pi pi-angle-left mr-auto"></i></a>
              </div>
            </section>
          </div>
        } @else {
          <div class="lf-empty-state"><i class="pi pi-chart-bar"></i><h3>لا تتوفر بيانات للعرض حاليًا</h3><p>حدّث الصفحة أو أعد المحاولة لاحقًا.</p></div>
        }
      }
    </div>`,
})
export class DashboardComponent implements OnInit {
  private service = inject(DashboardService);
  private notify = inject(NotifyService);

  readonly skeleton = [1, 2, 3, 4, 5, 6];
  loading = signal(true);
  error = signal('');
  data = signal<PlatformDashboardDto | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.service.get().subscribe({
      next: value => { this.data.set(value); this.loading.set(false); },
      error: error => { const message = errMsg(error); this.error.set(message); this.notify.error(message); this.loading.set(false); },
    });
  }

  kpis(value: PlatformDashboardDto): Kpi[] {
    return [
      { label: 'إجمالي المنشآت', value: value.totalGyms, icon: 'pi pi-building', tone: 'lf-tone-indigo' },
      { label: 'منشآت نشطة', value: value.activeGyms, icon: 'pi pi-check-circle', tone: 'lf-tone-emerald' },
      { label: 'فترة تجريبية', value: value.trialGyms, icon: 'pi pi-clock', tone: 'lf-tone-sky' },
      { label: 'بانتظار الموافقة', value: value.pendingApprovalGyms, icon: 'pi pi-hourglass', tone: 'lf-tone-amber' },
      { label: 'منشآت موقوفة', value: value.suspendedGyms, icon: 'pi pi-ban', tone: 'lf-tone-rose' },
      { label: 'إجمالي الأعضاء', value: value.totalMembers, icon: 'pi pi-users', tone: 'lf-tone-violet' },
    ];
  }

  health(value: PlatformDashboardDto) {
    const total = Math.max(value.totalGyms, 1);
    return [
      { label: 'النشاط', value: Math.round(value.activeGyms * 100 / total), tone: 'bg-emerald-500' },
      { label: 'الفترة التجريبية', value: Math.round(value.trialGyms * 100 / total), tone: 'bg-sky-500' },
      { label: 'تحتاج متابعة', value: Math.round((value.pendingApprovalGyms + value.suspendedGyms) * 100 / total), tone: 'bg-amber-500' },
    ];
  }
}
