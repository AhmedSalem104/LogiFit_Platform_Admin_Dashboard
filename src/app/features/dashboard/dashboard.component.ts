import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { DashboardService } from './dashboard.service';
import { PlatformDashboardDto } from '../../core/models/platform.models';
import { errMsg } from '../../shared/ui/notify';

interface Kpi {
  label: string;
  value: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent],
  template: `
    <app-page-header title="نظرة عامة" subtitle="إحصائيات المنصة" icon="pi pi-chart-bar"></app-page-header>

    @if (loading()) {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (i of [1,2,3,4,5,6]; track i) {
          <div class="lf-card p-5 h-28 animate-pulse bg-slate-50"></div>
        }
      </div>
    } @else if (error()) {
      <div class="lf-card p-6 text-center text-red-600">{{ error() }}</div>
    } @else {
      <!-- Pending approval alert -->
      @if (data() && data()!.pendingApprovalGyms > 0) {
        <a
          routerLink="/tenants"
          class="lf-card flex items-center gap-3 p-4 mb-4 border-r-4 border-r-amber-400 hover:bg-amber-50 transition-colors"
        >
          <i class="pi pi-exclamation-triangle text-amber-500 text-xl"></i>
          <span class="text-sm text-slate-700">
            يوجد <b class="text-amber-600">{{ data()!.pendingApprovalGyms }}</b> جيم بانتظار الموافقة — راجعها الآن.
          </span>
          <i class="pi pi-arrow-left text-slate-400 mr-auto"></i>
        </a>
      }

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (kpi of kpis(); track kpi.label) {
          <div class="lf-card p-5 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl" [ngClass]="kpi.color">
              <i [class]="kpi.icon"></i>
            </div>
            <div>
              <div class="text-2xl font-extrabold text-slate-800">{{ kpi.value | number }}</div>
              <div class="text-sm text-slate-500">{{ kpi.label }}</div>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private service = inject(DashboardService);

  loading = signal(true);
  error = signal<string>('');
  data = signal<PlatformDashboardDto | null>(null);
  kpis = signal<Kpi[]>([]);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.service.get().subscribe({
      next: (d) => {
        this.data.set(d);
        this.kpis.set([
          { label: 'إجمالي الجيمات', value: d.totalGyms, icon: 'pi pi-building', color: 'bg-blue-100 text-blue-600' },
          { label: 'جيمات نشطة', value: d.activeGyms, icon: 'pi pi-check-circle', color: 'bg-green-100 text-green-600' },
          { label: 'جيمات تجريبية', value: d.trialGyms, icon: 'pi pi-clock', color: 'bg-sky-100 text-sky-600' },
          { label: 'بانتظار الموافقة', value: d.pendingApprovalGyms, icon: 'pi pi-hourglass', color: 'bg-amber-100 text-amber-600' },
          { label: 'جيمات موقوفة', value: d.suspendedGyms, icon: 'pi pi-ban', color: 'bg-red-100 text-red-600' },
          { label: 'إجمالي الأعضاء', value: d.totalMembers, icon: 'pi pi-users', color: 'bg-violet-100 text-violet-600' },
        ]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errMsg(err));
        this.loading.set(false);
      },
    });
  }
}
