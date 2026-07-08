import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { TenantsService } from './tenants.service';
import {
  PlatformTenantDto,
  TENANT_STATUS_BADGE,
  TenantStatus,
} from '../../core/models/platform.models';
import { confirmAction, errMsg, toastError, toastSuccess } from '../../shared/ui/notify';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    <app-page-header title="الجيمات" subtitle="إدارة الجيمات ودورة حياتها" icon="pi pi-building">
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
      <button pButton label="جيم جديد" icon="pi pi-plus" (click)="openCreate()"></button>
    </app-page-header>

    <div class="lf-card overflow-hidden">
      <p-table [value]="rows()" [loading]="loading()" [paginator]="rows().length > 10" [rows]="10" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th>الاسم</th>
            <th>الـ Subdomain</th>
            <th>الحالة</th>
            <th>الأعضاء</th>
            <th>تاريخ الإنشاء</th>
            <th class="text-center">الإجراءات</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-t>
          <tr>
            <td>
              <div class="font-semibold text-slate-800">{{ t.name }}</div>
              <div class="text-xs text-slate-400" dir="ltr">{{ t.email }}</div>
            </td>
            <td dir="ltr" class="text-left">{{ t.subdomain }}</td>
            <td><app-status-badge [badge]="badge(t.status)"></app-status-badge></td>
            <td>{{ t.membersCount | number }}</td>
            <td dir="ltr" class="text-left">{{ t.createdAt | date: 'yyyy-MM-dd' }}</td>
            <td class="text-center whitespace-nowrap">
              @if (t.status === TS.PendingApproval) {
                <button pButton pTooltip="موافقة" icon="pi pi-check" class="p-button-sm p-button-success p-button-text"
                  (click)="act(t, 'approve')"></button>
              }
              @if (t.status === TS.Suspended || t.status === TS.PendingApproval) {
                <button pButton pTooltip="تفعيل" icon="pi pi-play" class="p-button-sm p-button-text"
                  (click)="act(t, 'activate')"></button>
              }
              @if (t.status === TS.Active || t.status === TS.Trial) {
                <button pButton pTooltip="إيقاف" icon="pi pi-pause" class="p-button-sm p-button-warning p-button-text"
                  (click)="act(t, 'suspend')"></button>
              }
              @if (t.status !== TS.Archived) {
                <button pButton pTooltip="أرشفة" icon="pi pi-inbox" class="p-button-sm p-button-secondary p-button-text"
                  (click)="act(t, 'archive')"></button>
              }
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="6" class="text-center text-slate-400 py-8">لا توجد جيمات</td></tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Create dialog -->
    <p-dialog header="إنشاء جيم جديد" [(visible)]="showCreate" [modal]="true" [style]="{ width: '640px' }" [dismissableMask]="true">
      <form [formGroup]="form" class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div class="sm:col-span-2 text-sm font-bold text-slate-500 border-b pb-1">بيانات الجيم</div>
        <div>
          <label class="lbl">اسم الجيم *</label>
          <input class="fld" formControlName="name" />
        </div>
        <div>
          <label class="lbl">Subdomain *</label>
          <input class="fld" formControlName="subdomain" dir="ltr" placeholder="powergym" />
        </div>
        <div>
          <label class="lbl">إيميل الجيم *</label>
          <input class="fld" formControlName="email" dir="ltr" />
        </div>
        <div>
          <label class="lbl">هاتف الجيم</label>
          <input class="fld" formControlName="phoneNumber" dir="ltr" />
        </div>

        <div class="sm:col-span-2 text-sm font-bold text-slate-500 border-b pb-1 mt-2">بيانات صاحب الجيم (Owner)</div>
        <div>
          <label class="lbl">اسم المالك *</label>
          <input class="fld" formControlName="ownerFullName" />
        </div>
        <div>
          <label class="lbl">إيميل المالك *</label>
          <input class="fld" formControlName="ownerEmail" dir="ltr" />
        </div>
        <div>
          <label class="lbl">هاتف المالك *</label>
          <input class="fld" formControlName="ownerPhoneNumber" dir="ltr" placeholder="01000000000" />
        </div>
        <div>
          <label class="lbl">كلمة مرور المالك *</label>
          <input class="fld" formControlName="ownerPassword" dir="ltr" />
        </div>
      </form>

      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" class="p-button-text" (click)="showCreate = false"></button>
        <button pButton label="إنشاء" icon="pi pi-check" [disabled]="form.invalid || saving()" (click)="create()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .lbl { display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:.25rem; }
    .fld { width:100%; padding:.5rem .65rem; border:1px solid #cbd5e1; border-radius:.5rem; outline:none; }
    .fld:focus { border-color:#3b82f6; box-shadow:0 0 0 3px #dbeafe; }
  `],
})
export class TenantsComponent implements OnInit {
  private service = inject(TenantsService);
  private fb = inject(FormBuilder);

  readonly TS = TenantStatus;
  rows = signal<PlatformTenantDto[]>([]);
  loading = signal(false);
  saving = signal(false);
  statusFilter: TenantStatus | null = null;
  showCreate = false;

  statusOptions = [
    { label: 'نشط', value: TenantStatus.Active },
    { label: 'بانتظار الموافقة', value: TenantStatus.PendingApproval },
    { label: 'موقوف', value: TenantStatus.Suspended },
    { label: 'تجريبي', value: TenantStatus.Trial },
    { label: 'مؤرشف', value: TenantStatus.Archived },
  ];

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    subdomain: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    ownerFullName: ['', Validators.required],
    ownerEmail: ['', [Validators.required, Validators.email]],
    ownerPhoneNumber: ['', Validators.required],
    ownerPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.load();
  }

  badge(status: TenantStatus) {
    return TENANT_STATUS_BADGE[status];
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

  openCreate(): void {
    this.form.reset();
    this.showCreate = true;
  }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const cmd = this.form.getRawValue();
    this.service.create(cmd).subscribe({
      next: () => {
        this.saving.set(false);
        this.showCreate = false;
        // Show owner credentials so the operator can pass them to the gym owner.
        Swal.fire({
          icon: 'success',
          title: 'تم إنشاء الجيم',
          html: `
            <div style="text-align:right;font-size:.9rem;line-height:1.9">
              الجيم أُنشئ بحالة <b>بانتظار الموافقة</b>.<br>
              بلّغ صاحب الجيم ببياناته للدخول لتطبيق الجيم:<br>
              <b>Subdomain:</b> <span dir="ltr">${cmd.subdomain}</span><br>
              <b>الهاتف:</b> <span dir="ltr">${cmd.ownerPhoneNumber}</span><br>
              <b>كلمة المرور:</b> <span dir="ltr">${cmd.ownerPassword}</span>
            </div>`,
          confirmButtonText: 'تمام',
          confirmButtonColor: '#2563eb',
        });
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        toastError(errMsg(err));
      },
    });
  }

  async act(t: PlatformTenantDto, action: 'approve' | 'activate' | 'suspend' | 'archive'): Promise<void> {
    const meta = {
      approve: { title: 'موافقة على الجيم', text: `تفعيل "${t.name}"؟`, danger: false },
      activate: { title: 'تفعيل الجيم', text: `إعادة تفعيل "${t.name}"؟`, danger: false },
      suspend: { title: 'إيقاف الجيم', text: `إيقاف "${t.name}"؟ لن يتمكن من استخدام النظام.`, danger: true },
      archive: { title: 'أرشفة الجيم', text: `أرشفة "${t.name}"؟`, danger: true },
    }[action];

    const ok = await confirmAction(meta.title, meta.text, meta.title, meta.danger);
    if (!ok) return;

    this.service[action](t.id).subscribe({
      next: (updated) => {
        this.rows.update((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
        toastSuccess('تم تنفيذ الإجراء');
      },
      error: (err) => toastError(errMsg(err)),
    });
  }
}
