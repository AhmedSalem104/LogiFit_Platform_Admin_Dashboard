import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
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
import { NotifyService, errMsg } from '../../shared/ui/notify.service';

@Component({
  selector: 'app-payment-requests',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
        styleClass="w-full sm:w-48"
      ></p-dropdown>
    </app-page-header>

    <div class="lf-card overflow-hidden">
      <p-table [value]="rows()" [loading]="loading()" [paginator]="rows().length > 10" [rows]="10"
        styleClass="p-datatable-sm" [scrollable]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>الجيم</th>
            <th class="hidden sm:table-cell">الباقة</th>
            <th>المبلغ</th>
            <th class="hidden md:table-cell">رقم العملية</th>
            <th class="hidden lg:table-cell">تاريخ الدفع</th>
            <th>الإيصال</th>
            <th>الحالة</th>
            <th class="text-center">مراجعة</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-r>
          <tr>
            <td class="font-semibold text-slate-800">{{ r.tenantName }}</td>
            <td class="hidden sm:table-cell">{{ r.planName }}</td>
            <td class="whitespace-nowrap font-semibold tabular-nums">{{ r.amount | number }} {{ r.currency }}</td>
            <td dir="ltr" class="text-left hidden md:table-cell">{{ r.transactionNumber || '—' }}</td>
            <td dir="ltr" class="text-left hidden lg:table-cell">{{ r.paymentDate | date: 'yyyy-MM-dd' }}</td>
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
                  [disabled]="busyId() === r.id" (click)="openReject(r)"></button>
              } @else {
                <span class="text-xs text-slate-400">تمت المراجعة</span>
              }
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="8" class="text-center text-slate-400 py-10"><i class="pi pi-inbox text-2xl block mb-2 opacity-40"></i>لا توجد طلبات دفع</td></tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Proof preview -->
    <p-dialog header="معاينة الإيصال" [(visible)]="showPreview" [modal]="true" [style]="{ width: '560px', maxWidth: '94vw' }"
      [dismissableMask]="true" [draggable]="false">
      @if (selected(); as r) {
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="bg-slate-50 rounded-lg px-3 py-2"><span class="text-slate-400 block text-xs">الجيم</span><b>{{ r.tenantName }}</b></div>
            <div class="bg-slate-50 rounded-lg px-3 py-2"><span class="text-slate-400 block text-xs">الباقة</span><b>{{ r.planName }}</b></div>
            <div class="bg-slate-50 rounded-lg px-3 py-2"><span class="text-slate-400 block text-xs">المبلغ</span><b>{{ r.amount | number }} {{ r.currency }}</b></div>
            <div class="bg-slate-50 rounded-lg px-3 py-2"><span class="text-slate-400 block text-xs">رقم العملية</span><b dir="ltr">{{ r.transactionNumber || '—' }}</b></div>
          </div>
          <a [href]="r.proofFileUrl" target="_blank" rel="noopener">
            <img [src]="r.proofFileUrl" alt="إثبات الدفع" loading="lazy" decoding="async"
              class="w-full rounded-lg border border-slate-200 max-h-[60vh] object-contain bg-slate-50" />
          </a>
          @if (r.notes) { <p class="text-sm text-slate-500">ملاحظات: {{ r.notes }}</p> }
        </div>
      }
      <ng-template pTemplate="footer">
        @if (selected()?.status === PRS.Pending) {
          <button pButton label="رفض" icon="pi pi-times" class="p-button-danger p-button-text" (click)="openReject(selected()!)"></button>
          <button pButton label="موافقة" icon="pi pi-check" class="p-button-success" (click)="approve(selected()!)"></button>
        } @else {
          <button pButton label="إغلاق" class="p-button-text" (click)="showPreview = false"></button>
        }
      </ng-template>
    </p-dialog>

    <!-- Reject reason -->
    <p-dialog header="رفض الدفعة" [(visible)]="showReject" [modal]="true" [style]="{ width: '440px', maxWidth: '94vw' }" [draggable]="false">
      <label class="lf-label">سبب الرفض *</label>
      <textarea class="lf-input" rows="3" [(ngModel)]="rejectReason" placeholder="مثال: الصورة غير واضحة / المبلغ غير صحيح"></textarea>
      @if (rejectError()) { <p class="text-xs text-red-500 mt-1">يجب إدخال سبب الرفض</p> }
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showReject = false"></button>
        <button pButton label="رفض" icon="pi pi-times" class="p-button-danger" [disabled]="busyId() === rejectTarget()?.id" (click)="confirmReject()"></button>
      </ng-template>
    </p-dialog>
  `,
})
export class PaymentRequestsComponent implements OnInit {
  private service = inject(PaymentRequestsService);
  private notify = inject(NotifyService);

  readonly PRS = PaymentRequestStatus;
  rows = signal<PaymentRequestDto[]>([]);
  loading = signal(false);
  busyId = signal<string | null>(null);
  selected = signal<PaymentRequestDto | null>(null);
  showPreview = false;

  // Reject dialog state
  showReject = false;
  rejectReason = '';
  rejectError = signal(false);
  rejectTarget = signal<PaymentRequestDto | null>(null);

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
        this.notify.error(errMsg(err));
        this.loading.set(false);
      },
    });
  }

  preview(r: PaymentRequestDto): void {
    this.selected.set(r);
    this.showPreview = true;
  }

  async approve(r: PaymentRequestDto): Promise<void> {
    const ok = await this.notify.confirm({
      header: 'الموافقة على الدفعة',
      message: `الموافقة ستفعّل اشتراك "${r.tenantName}" تلقائياً. متابعة؟`,
      acceptLabel: 'موافقة وتفعيل',
      icon: 'pi pi-check-circle',
    });
    if (!ok) return;

    this.busyId.set(r.id);
    this.service.approve(r.id).subscribe({
      next: (updated) => {
        this.busyId.set(null);
        this.showPreview = false;
        this.notify.success('تمت الموافقة وتفعيل الاشتراك');
        this.applyUpdate(updated);
      },
      error: (err) => {
        this.busyId.set(null);
        this.notify.error(errMsg(err));
      },
    });
  }

  openReject(r: PaymentRequestDto): void {
    this.rejectTarget.set(r);
    this.rejectReason = '';
    this.rejectError.set(false);
    this.showReject = true;
  }

  confirmReject(): void {
    const r = this.rejectTarget();
    if (!r) return;
    if (!this.rejectReason.trim()) {
      this.rejectError.set(true);
      return;
    }
    this.busyId.set(r.id);
    this.service.reject(r.id, { rejectReason: this.rejectReason.trim() }).subscribe({
      next: (updated) => {
        this.busyId.set(null);
        this.showReject = false;
        this.showPreview = false;
        this.notify.success('تم رفض الطلب');
        this.applyUpdate(updated);
      },
      error: (err) => {
        this.busyId.set(null);
        this.notify.error(errMsg(err));
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
