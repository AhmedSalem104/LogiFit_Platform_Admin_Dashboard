import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { PaymentMethodsService } from './payment-methods.service';
import { BadgeInfo, PaymentMethodDto } from '../../core/models/platform.models';
import { confirmAction, errMsg, toastError, toastSuccess } from '../../shared/ui/notify';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    TooltipModule,
    InputSwitchModule,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  template: `
    <app-page-header title="طرق الدفع" subtitle="طرق الدفع اليدوية التي يدفع الجيمات من خلالها" icon="pi pi-credit-card">
      <button pButton label="طريقة جديدة" icon="pi pi-plus" (click)="openCreate()"></button>
    </app-page-header>

    <div class="lf-card overflow-hidden">
      <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th>الاسم</th>
            <th>النوع</th>
            <th>الحساب / المحفظة</th>
            <th>الترتيب</th>
            <th>الحالة</th>
            <th class="text-center">الإجراءات</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-m>
          <tr>
            <td class="font-semibold text-slate-800">{{ m.name }}</td>
            <td>{{ m.type }}</td>
            <td dir="ltr" class="text-left">{{ m.walletNumber || m.iban || m.accountNumber || '—' }}</td>
            <td>{{ m.displayOrder }}</td>
            <td><app-status-badge [badge]="activeBadge(m.isActive)"></app-status-badge></td>
            <td class="text-center whitespace-nowrap">
              <button pButton pTooltip="تعديل" icon="pi pi-pencil" class="p-button-sm p-button-text" (click)="openEdit(m)"></button>
              <button pButton pTooltip="حذف" icon="pi pi-trash" class="p-button-sm p-button-danger p-button-text" (click)="remove(m)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="6" class="text-center text-slate-400 py-8">لا توجد طرق دفع</td></tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [header]="editingId ? 'تعديل طريقة دفع' : 'طريقة دفع جديدة'" [(visible)]="showForm" [modal]="true"
      [style]="{ width: '600px' }" [dismissableMask]="true">
      <form [formGroup]="form" class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div>
          <label class="lbl">الاسم *</label>
          <input class="fld" formControlName="name" placeholder="InstaPay" />
        </div>
        <div>
          <label class="lbl">النوع *</label>
          <input class="fld" formControlName="type" placeholder="Wallet / Bank / InstaPay" />
        </div>
        <div>
          <label class="lbl">اسم الحساب</label>
          <input class="fld" formControlName="accountName" />
        </div>
        <div>
          <label class="lbl">رقم الحساب</label>
          <input class="fld" formControlName="accountNumber" dir="ltr" />
        </div>
        <div>
          <label class="lbl">IBAN</label>
          <input class="fld" formControlName="iban" dir="ltr" />
        </div>
        <div>
          <label class="lbl">رقم المحفظة</label>
          <input class="fld" formControlName="walletNumber" dir="ltr" />
        </div>
        <div class="sm:col-span-2">
          <label class="lbl">تعليمات الدفع</label>
          <textarea class="fld" rows="2" formControlName="instructions"></textarea>
        </div>
        <div class="sm:col-span-2">
          <label class="lbl">رابط صورة QR</label>
          <input class="fld" formControlName="qrImageUrl" dir="ltr" placeholder="https://.../qr.png" />
        </div>
        <div>
          <label class="lbl">الترتيب</label>
          <input class="fld" type="number" formControlName="displayOrder" dir="ltr" />
        </div>
        <div class="flex items-center gap-2 pt-6">
          <p-inputSwitch formControlName="isActive"></p-inputSwitch>
          <span class="text-sm text-slate-600">مفعّلة</span>
        </div>
      </form>
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" class="p-button-text" (click)="showForm = false"></button>
        <button pButton label="حفظ" icon="pi pi-check" [disabled]="form.invalid || saving()" (click)="save()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .lbl { display:block; font-size:.8rem; font-weight:600; color:#475569; margin-bottom:.25rem; }
    .fld { width:100%; padding:.5rem .65rem; border:1px solid #cbd5e1; border-radius:.5rem; outline:none; }
    .fld:focus { border-color:#3b82f6; box-shadow:0 0 0 3px #dbeafe; }
  `],
})
export class PaymentMethodsComponent implements OnInit {
  private service = inject(PaymentMethodsService);
  private fb = inject(FormBuilder);

  rows = signal<PaymentMethodDto[]>([]);
  loading = signal(false);
  saving = signal(false);
  showForm = false;
  editingId: string | null = null;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    type: ['', Validators.required],
    accountName: [''],
    accountNumber: [''],
    iban: [''],
    walletNumber: [''],
    instructions: [''],
    qrImageUrl: [''],
    isActive: [true],
    displayOrder: [1],
  });

  ngOnInit(): void {
    this.load();
  }

  activeBadge(active: boolean): BadgeInfo {
    return active ? { label: 'مفعّلة', color: 'green' } : { label: 'معطّلة', color: 'gray' };
  }

  load(): void {
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

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ isActive: true, displayOrder: 1 });
    this.showForm = true;
  }

  openEdit(m: PaymentMethodDto): void {
    this.editingId = m.id;
    this.form.reset({
      name: m.name,
      type: m.type,
      accountName: m.accountName ?? '',
      accountNumber: m.accountNumber ?? '',
      iban: m.iban ?? '',
      walletNumber: m.walletNumber ?? '',
      instructions: m.instructions ?? '',
      qrImageUrl: m.qrImageUrl ?? '',
      isActive: m.isActive,
      displayOrder: m.displayOrder,
    });
    this.showForm = true;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const cmd = {
      name: v.name,
      type: v.type,
      accountName: v.accountName || null,
      accountNumber: v.accountNumber || null,
      iban: v.iban || null,
      walletNumber: v.walletNumber || null,
      instructions: v.instructions || null,
      qrImageUrl: v.qrImageUrl || null,
      isActive: v.isActive,
      displayOrder: Number(v.displayOrder) || 0,
    };
    const req = this.editingId ? this.service.update(this.editingId, cmd) : this.service.create(cmd);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm = false;
        toastSuccess('تم الحفظ');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        toastError(errMsg(err));
      },
    });
  }

  async remove(m: PaymentMethodDto): Promise<void> {
    const ok = await confirmAction('حذف طريقة الدفع', `حذف "${m.name}"؟`, 'حذف', true);
    if (!ok) return;
    this.service.remove(m.id).subscribe({
      next: () => {
        toastSuccess('تم الحذف');
        this.load();
      },
      error: (err) => toastError(errMsg(err)),
    });
  }
}
