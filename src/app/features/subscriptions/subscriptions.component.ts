import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
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
import { NotifyService, errMsg } from '../../shared/ui/notify.service';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
        styleClass="w-full sm:w-52"
      ></p-dropdown>
    </app-page-header>

    <div class="lf-card overflow-hidden">
      <p-table [value]="rows()" [loading]="loading()" [paginator]="rows().length > 12" [rows]="12"
        styleClass="p-datatable-sm" [scrollable]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>الجيم</th>
            <th>الباقة</th>
            <th>الحالة</th>
            <th class="hidden md:table-cell">البداية</th>
            <th>النهاية</th>
            <th>المبلغ</th>
            <th class="hidden sm:table-cell text-center">تجديد تلقائي</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-s>
          <tr [class.bg-red-50]="isOverdue(s.status)">
            <td class="font-semibold text-slate-800">{{ s.tenantName }}</td>
            <td>{{ s.planName }}</td>
            <td><app-status-badge [badge]="badge(s.status)"></app-status-badge></td>
            <td dir="ltr" class="text-left hidden md:table-cell">{{ s.startDate | date: 'yyyy-MM-dd' }}</td>
            <td dir="ltr" class="text-left">{{ s.endDate | date: 'yyyy-MM-dd' }}</td>
            <td class="whitespace-nowrap font-semibold tabular-nums">{{ s.amount | number }} {{ s.currency }}</td>
            <td class="hidden sm:table-cell text-center">
              <i class="pi" [ngClass]="s.autoRenew ? 'pi-check-circle text-green-500' : 'pi-times-circle text-slate-300'"></i>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="7" class="text-center text-slate-400 py-10"><i class="pi pi-inbox text-2xl block mb-2 opacity-40"></i>لا توجد اشتراكات</td></tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class SubscriptionsComponent implements OnInit {
  private service = inject(SubscriptionsService);
  private notify = inject(NotifyService);

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
        this.notify.error(errMsg(err));
        this.loading.set(false);
      },
    });
  }
}
