import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { SubscriptionsService } from './subscriptions.service';
import {
  PlatformSubscriptionDto,
  SUBSCRIPTION_STATUS_BADGE,
  TenantSubscriptionStatus,
} from '../../core/models/platform.models';
import { errMsg, toastError } from '../../shared/ui/notify';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, DropdownModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="الاشتراكات" subtitle="اشتراكات الجيمات في الباقات" icon="pi pi-sync">
      <p-dropdown
        [options]="statusOptions"
        [(ngModel)]="statusFilter"
        (onChange)="load()"
        optionLabel="label"
        optionValue="value"
        placeholder="كل الحالات"
        [showClear]="true"
        styleClass="w-52"
      ></p-dropdown>
    </app-page-header>

    <div class="lf-card overflow-hidden">
      <p-table [value]="rows()" [loading]="loading()" [paginator]="rows().length > 12" [rows]="12" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th>الجيم</th>
            <th>الباقة</th>
            <th>الحالة</th>
            <th>البداية</th>
            <th>النهاية</th>
            <th>المبلغ</th>
            <th>تجديد تلقائي</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-s>
          <tr [class.bg-red-50]="isOverdue(s.status)">
            <td class="font-semibold text-slate-800">{{ s.tenantName }}</td>
            <td>{{ s.planName }}</td>
            <td><app-status-badge [badge]="badge(s.status)"></app-status-badge></td>
            <td dir="ltr" class="text-left">{{ s.startDate | date: 'yyyy-MM-dd' }}</td>
            <td dir="ltr" class="text-left">{{ s.endDate | date: 'yyyy-MM-dd' }}</td>
            <td class="whitespace-nowrap">{{ s.amount | number }} {{ s.currency }}</td>
            <td>
              <i class="pi" [ngClass]="s.autoRenew ? 'pi-check text-green-600' : 'pi-times text-slate-300'"></i>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="7" class="text-center text-slate-400 py-8">لا توجد اشتراكات</td></tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class SubscriptionsComponent implements OnInit {
  private service = inject(SubscriptionsService);

  rows = signal<PlatformSubscriptionDto[]>([]);
  loading = signal(false);
  statusFilter: TenantSubscriptionStatus | null = null;

  statusOptions = [
    { label: 'بانتظار الدفع', value: TenantSubscriptionStatus.PendingPayment },
    { label: 'نشط', value: TenantSubscriptionStatus.Active },
    { label: 'تجريبي', value: TenantSubscriptionStatus.Trial },
    { label: 'متأخر السداد', value: TenantSubscriptionStatus.PastDue },
    { label: 'موقوف', value: TenantSubscriptionStatus.Suspended },
    { label: 'منتهٍ', value: TenantSubscriptionStatus.Expired },
    { label: 'ملغى', value: TenantSubscriptionStatus.Cancelled },
  ];

  ngOnInit(): void {
    this.load();
  }

  badge(status: TenantSubscriptionStatus) {
    return SUBSCRIPTION_STATUS_BADGE[status];
  }

  isOverdue(status: TenantSubscriptionStatus): boolean {
    return status === TenantSubscriptionStatus.PastDue || status === TenantSubscriptionStatus.Expired;
  }

  load(): void {
    this.loading.set(true);
    this.service.list(this.statusFilter ?? undefined).subscribe({
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
}
