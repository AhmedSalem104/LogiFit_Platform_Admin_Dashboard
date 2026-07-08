import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { DashboardService } from './dashboard.service';
import { PlatformDashboardDto } from '../../core/models/platform.models';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';

interface Kpi {
  label: string;
  value: number;
  icon: string;
  ring: string;
  accent: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, PageHeaderComponent],
  template: `
    <app-page-header title="نظرة عامة" subtitle="ملخّص أداء المنصة" icon="pi pi-chart-bar"></app-page-header>

    @if (loading()) {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (i of skeleton; track i) {
          <div class="lf-card p-5 h-[104px] animate-pulse">
            <div class="w-12 h-12 rounded-xl bg-slate-100"></div>
            <div class="h-3 w-24 bg-slate-100 rounded mt-3"></div>
          </div>
        }
      </div>
    } @else if (error()) {
      <div class="lf-card p-8 text-center">
        <i class="pi pi-exclamation-circle text-3xl text-red-400"></i>
        <p class="text-red-600 mt-2">{{ error() }}</p>
        <button class="mt-4 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold" (click)="load()">إعادة المحاولة</button>
      </div>
    } @else {
      @if (data() && data()!.pendingApprovalGyms > 0) {
        <a routerLink="/tenants"
          class="lf-card flex items-center gap-3 p-4 mb-5 border-r-4 border-r-amber-400 hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] transition-shadow">
          <span class="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <i class="pi pi-exclamation-triangle"></i>
          </span>
          <span class="text-sm text-slate-700">
            يوجد <b class="text-amber-600">{{ data()!.pendingApprovalGyms }}</b> جيم بانتظار الموافقة — راجعها الآن.
          </span>
          <i class="pi pi-arrow-left text-slate-300 mr-auto"></i>
        </a>
      }

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (kpi of kpis(); track kpi.label) {
          <div class="lf-card p-5 flex items-center gap-4 hover:shadow-[0_4px_12px_rgba(15,23,42,0.07)] transition-shadow">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0" [ngClass]="kpi.ring">
              <i [class]="kpi.icon"></i>
            </div>
            <div class="min-w-0">
              <div class="text-2xl font-extrabold text-slate-800 tabular-nums">{{ kpi.value | number }}</div>
              <div class="text-[13px] text-slate-500 truncate">{{ kpi.label }}</div>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private service = inject(DashboardService);
  private notify = inject(NotifyService);

  readonly skeleton = [1, 2, 3, 4, 5, 6];
  loading = signal(true);
  error = signal<string>('');
  data = signal<PlatformDashboardDto | null>(null);
  kpis = signal<Kpi[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.service.get().subscribe({
      next: (d) => {
        this.data.set(d);
        this.kpis.set([
          { label: 'إجمالي الجيمات', value: d.totalGyms, icon: 'pi pi-building', ring: 'bg-indigo-50 text-indigo-600', accent: '' },
          { label: 'جيمات نشطة', value: d.activeGyms, icon: 'pi pi-check-circle', ring: 'bg-green-50 text-green-600', accent: '' },
          { label: 'جيمات تجريبية', value: d.trialGyms, icon: 'pi pi-clock', ring: 'bg-sky-50 text-sky-600', accent: '' },
          { label: 'بانتظار الموافقة', value: d.pendingApprovalGyms, icon: 'pi pi-hourglass', ring: 'bg-amber-50 text-amber-600', accent: '' },
          { label: 'جيمات موقوفة', value: d.suspendedGyms, icon: 'pi pi-ban', ring: 'bg-red-50 text-red-600', accent: '' },
          { label: 'إجمالي الأعضاء', value: d.totalMembers, icon: 'pi pi-users', ring: 'bg-violet-50 text-violet-600', accent: '' },
        ]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errMsg(err));
        this.notify.error(errMsg(err));
        this.loading.set(false);
      },
    });
  }
}
