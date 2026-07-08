import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { FeaturesService } from './features.service';
import { BadgeInfo, FeatureDto } from '../../core/models/platform.models';
import { errMsg, toastError } from '../../shared/ui/notify';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, TableModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header
      title="الميزات"
      subtitle="أكواد الميزات المتاحة — تُستخدم عند بناء الباقات"
      icon="pi pi-star"
    ></app-page-header>

    <div class="lf-card overflow-hidden">
      <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th>الكود</th>
            <th>الاسم</th>
            <th>الوصف</th>
            <th>الحالة</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-f>
          <tr>
            <td><code class="text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded text-sm" dir="ltr">{{ f.code }}</code></td>
            <td class="font-semibold text-slate-800">{{ f.name }}</td>
            <td class="text-slate-500 text-sm">{{ f.description || '—' }}</td>
            <td><app-status-badge [badge]="activeBadge(f.isActive)"></app-status-badge></td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="4" class="text-center text-slate-400 py-8">لا توجد ميزات</td></tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class FeaturesComponent implements OnInit {
  private service = inject(FeaturesService);

  rows = signal<FeatureDto[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        toastError(errMsg(err));
        this.loading.set(false);
      },
    });
  }

  activeBadge(active: boolean): BadgeInfo {
    return active ? { label: 'مفعّلة', color: 'green' } : { label: 'معطّلة', color: 'gray' };
  }
}
