import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { PaymentRequestsService } from './payment-requests.service';
import {
  PAYMENT_REQUEST_STATUS_BADGE,
  PaymentRequestDto,
  PaymentRequestStatus,
} from '../../core/models/platform.models';
import { errMsg, toastError, toastSuccess } from '../../shared/ui/notify';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-requests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    DropdownModule,
    ButtonModule,
    TooltipModule,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  template: `
    <app-page-header title="طلبات الدفع" subtitle="مراجعة إثباتات الدفع والموافقة أو الرفض" icon="pi pi-inbox">
      <p-dropdown
        [options]="statusOptions"
        [(ngModel)]="statusFilter"
        (onChange)="load()"
        optionLabel="label"
        optionValue="value"
        placeholder="كل الحالات"
        [showClear]="true"
        styleClass="w-48"
      ></p-dropdown>
    </app-page-header>

    <div class="lf-card overflow-hidden">
      <p-table [value]="rows()" [loading]="loading()" [paginator]="rows().length > 10" [rows]="10" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th>الجيم</th>
            <th>الباقة</th>
            <th>المبلغ</th>
            <th>رقم العملية</th>
            <th>تاريخ الدفع</th>
            <th>الإيصال</th>
            <th>الحالة</th>
            <th class="text-center">مراجعة</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-r>
          <tr>
            <td class="font-semibold text-slate-800">{{ r.tenantName }}</td>
            <td>{{ r.planName }}</td>
            <td class="whitespace-nowrap font-semibold">{{ r.amount | number }} {{ r.currency }}</td>
            <td dir="ltr" class="text-left">{{ r.transactionNumber || '—' }}</td>
            <td dir="ltr" class="text-left">{{ r.paymentDate | date: 'yyyy-MM-dd' }}</td>
            <td>
              @if (r.proofFileUrl) {
                <button pButton icon="pi pi-image" label="معاينة" class="p-button-sm p-button-text" (click)="preview(r)"></button>
              } @else { <span class="text-slate-300">—</span> }
            </td>
            <td><app-status-badge [badge]="badge(r.status)"></app-status-badge></td>
            <td class="text-center whitespace-nowrap">
              @if (r.status === PRS.Pending) {
                <button pButton pTooltip="موافقة" icon="pi pi-check" class="p-button-sm p-button-success p-button-text"
                  [disabled]="busyId() === r.id" (click)="approve(r)"></button>
                <button pButton pTooltip="رفض" icon="pi pi-times" class="p-button-sm p-button-danger p-button-text"
                  [disabled]="busyId() === r.id" (click)="reject(r)"></button>
              } @else {
                <span class="text-xs text-slate-400">تمت المراجعة</span>
              }
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="8" class="text-center text-slate-400 py-8">لا توجد طلبات دفع</td></tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Proof preview -->
    <p-dialog header="معاينة الإيصال" [(visible)]="showPreview" [modal]="true" [style]="{ width: '560px' }" [dismissableMask]="true">
      @if (selected(); as r) {
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><span class="text-slate-400">الجيم:</span> <b>{{ r.tenantName }}</b></div>
            <div><span class="text-slate-400">الباقة:</span> <b>{{ r.planName }}</b></div>
            <div><span class="text-slate-400">المبلغ:</span> <b>{{ r.amount | number }} {{ r.currency }}</b></div>
            <div><span class="text-slate-400">رقم العملية:</span> <b dir="ltr">{{ r.transactionNumber || '—' }}</b></div>
          </div>
          <a [href]="r.proofFileUrl" target="_blank" rel="noopener">
            <img [src]="r.proofFileUrl" alt="إثبات الدفع" class="w-full rounded-lg border border-slate-200" />
          </a>
          @if (r.notes) { <p class="text-sm text-slate-500">ملاحظات: {{ r.notes }}</p> }
        </div>
      }
      <ng-template pTemplate="footer">
        @if (selected()?.status === PRS.Pending) {
          <button pButton label="رفض" icon="pi pi-times" class="p-button-danger p-button-text" (click)="reject(selected()!)"></button>
          <button pButton label="موافقة" icon="pi pi-check" class="p-button-success" (click)="approve(selected()!)"></button>
        } @else {
          <button pButton label="إغلاق" class="p-button-text" (click)="showPreview = false"></button>
        }
      </ng-template>
    </p-dialog>
  `,
})
export class PaymentRequestsComponent implements OnInit {
  private service = inject(PaymentRequestsService);

  readonly PRS = PaymentRequestStatus;
  rows = signal<PaymentRequestDto[]>([]);
  loading = signal(false);
  busyId = signal<string | null>(null);
  selected = signal<PaymentRequestDto | null>(null);
  showPreview = false;

  // Default filter to Pending — the operator's main queue.
  statusFilter: PaymentRequestStatus | null = PaymentRequestStatus.Pending;

  statusOptions = [
    { label: 'قيد المراجعة', value: PaymentRequestStatus.Pending },
    { label: 'مقبول', value: PaymentRequestStatus.Approved },
    { label: 'مرفوض', value: PaymentRequestStatus.Rejected },
    { label: 'ملغى', value: PaymentRequestStatus.Cancelled },
    { label: 'منتهٍ', value: PaymentRequestStatus.Expired },
  ];

  ngOnInit(): void {
    this.load();
  }

  badge(status: PaymentRequestStatus) {
    return PAYMENT_REQUEST_STATUS_BADGE[status];
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

  preview(r: PaymentRequestDto): void {
    this.selected.set(r);
    this.showPreview = true;
  }

  async approve(r: PaymentRequestDto): Promise<void> {
    const res = await Swal.fire({
      title: 'الموافقة على الدفعة',
      html: `الموافقة ستفعّل اشتراك <b>${r.tenantName}</b> تلقائياً.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'موافقة وتفعيل',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#16a34a',
      reverseButtons: true,
    });
    if (!res.isConfirmed) return;

    this.busyId.set(r.id);
    this.service.approve(r.id).subscribe({
      next: (updated) => {
        this.busyId.set(null);
        this.showPreview = false;
        toastSuccess('تمت الموافقة وتفعيل الاشتراك');
        this.applyUpdate(updated);
      },
      error: (err) => {
        this.busyId.set(null);
        toastError(errMsg(err));
      },
    });
  }

  async reject(r: PaymentRequestDto): Promise<void> {
    const res = await Swal.fire({
      title: 'رفض الدفعة',
      input: 'textarea',
      inputLabel: 'سبب الرفض',
      inputPlaceholder: 'مثال: الصورة غير واضحة / المبلغ غير صحيح',
      inputValidator: (v) => (!v?.trim() ? 'يجب إدخال سبب الرفض' : undefined),
      showCancelButton: true,
      confirmButtonText: 'رفض',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#dc2626',
      reverseButtons: true,
    });
    if (!res.isConfirmed) return;

    this.busyId.set(r.id);
    this.service.reject(r.id, { rejectReason: res.value }).subscribe({
      next: (updated) => {
        this.busyId.set(null);
        this.showPreview = false;
        toastSuccess('تم رفض الطلب');
        this.applyUpdate(updated);
      },
      error: (err) => {
        this.busyId.set(null);
        toastError(errMsg(err));
      },
    });
  }

  /** Reflect the reviewed row: drop it when a status filter no longer matches. */
  private applyUpdate(updated: PaymentRequestDto): void {
    if (this.statusFilter != null && updated.status !== this.statusFilter) {
      this.rows.update((rows) => rows.filter((r) => r.id !== updated.id));
    } else {
      this.rows.update((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
    }
  }
}
