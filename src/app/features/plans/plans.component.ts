import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { PlansService } from './plans.service';
import { FeaturesService } from '../features/features.service';
import {
  BILLING_CYCLE_LABEL,
  BadgeInfo,
  BillingCycle,
  FeatureDto,
  PlanDto,
} from '../../core/models/platform.models';
import { confirmAction, errMsg, toastError, toastSuccess } from '../../shared/ui/notify';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    MultiSelectModule,
    InputSwitchModule,
    TooltipModule,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  template: `
    <app-page-header title="الباقات" subtitle="باقات الاشتراك وحدودها ومميزاتها" icon="pi pi-box">
      <button pButton label="باقة جديدة" icon="pi pi-plus" (click)="openCreate()"></button>
    </app-page-header>

    <div class="lf-card overflow-hidden">
      <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th>الاسم</th>
            <th>السعر</th>
            <th>الدورة</th>
            <th>الحدود</th>
            <th>الميزات</th>
            <th>الحالة</th>
            <th class="text-center">الإجراءات</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-p>
          <tr>
            <td>
              <div class="font-semibold text-slate-800">{{ p.name }}</div>
              <div class="text-xs text-slate-400">{{ p.description }}</div>
            </td>
            <td class="whitespace-nowrap font-semibold">{{ p.price | number }} {{ p.currency }}</td>
            <td>{{ cycleLabel(p.billingCycle) }}</td>
            <td class="text-xs text-slate-500">
              أعضاء: {{ lim(p.maxMembers) }} · مدربين: {{ lim(p.maxCoaches) }} · فروع: {{ lim(p.maxBranches) }}
            </td>
            <td>
              <span class="lf-badge lf-badge-blue">{{ p.features.length }} ميزة</span>
            </td>
            <td><app-status-badge [badge]="activeBadge(p.isActive)"></app-status-badge></td>
            <td class="text-center whitespace-nowrap">
              <button pButton pTooltip="تعديل" icon="pi pi-pencil" class="p-button-sm p-button-text" (click)="openEdit(p)"></button>
              <button pButton pTooltip="حذف" icon="pi pi-trash" class="p-button-sm p-button-danger p-button-text" (click)="remove(p)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="7" class="text-center text-slate-400 py-8">لا توجد باقات</td></tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [header]="editingId ? 'تعديل باقة' : 'باقة جديدة'" [(visible)]="showForm" [modal]="true"
      [style]="{ width: '720px' }" [dismissableMask]="true">
      <form [formGroup]="form" class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div class="sm:col-span-2">
          <label class="lbl">اسم الباقة *</label>
          <input class="fld" formControlName="name" />
        </div>
        <div>
          <label class="lbl">الترتيب</label>
          <input class="fld" type="number" formControlName="displayOrder" dir="ltr" />
        </div>
        <div class="sm:col-span-3">
          <label class="lbl">الوصف</label>
          <input class="fld" formControlName="description" />
        </div>

        <div>
          <label class="lbl">السعر *</label>
          <input class="fld" type="number" formControlName="price" dir="ltr" />
        </div>
        <div>
          <label class="lbl">العملة *</label>
          <input class="fld" formControlName="currency" dir="ltr" placeholder="EGP" />
        </div>
        <div>
          <label class="lbl">دورة الفوترة *</label>
          <p-dropdown [options]="cycleOptions" formControlName="billingCycle" optionLabel="label" optionValue="value" styleClass="w-full"></p-dropdown>
        </div>

        <div>
          <label class="lbl">المدة (أيام) *</label>
          <input class="fld" type="number" formControlName="durationInDays" dir="ltr" />
        </div>

        <div class="sm:col-span-3 text-xs text-slate-400 -mb-2">اترك الحقل فارغاً = غير محدود</div>
        <div>
          <label class="lbl">حد الأعضاء</label>
          <input class="fld" type="number" formControlName="maxMembers" dir="ltr" placeholder="غير محدود" />
        </div>
        <div>
          <label class="lbl">حد المدربين</label>
          <input class="fld" type="number" formControlName="maxCoaches" dir="ltr" placeholder="غير محدود" />
        </div>
        <div>
          <label class="lbl">حد الفروع</label>
          <input class="fld" type="number" formControlName="maxBranches" dir="ltr" placeholder="غير محدود" />
        </div>
        <div>
          <label class="lbl">حد الموظفين</label>
          <input class="fld" type="number" formControlName="maxEmployees" dir="ltr" placeholder="غير محدود" />
        </div>
        <div>
          <label class="lbl">التخزين (MB)</label>
          <input class="fld" type="number" formControlName="maxStorageMB" dir="ltr" placeholder="غير محدود" />
        </div>
        <div class="flex items-center gap-2 pt-6">
          <p-inputSwitch formControlName="isActive"></p-inputSwitch>
          <span class="text-sm text-slate-600">مفعّلة</span>
        </div>

        <div class="sm:col-span-3">
          <label class="lbl">الميزات</label>
          <p-multiSelect
            [options]="features()"
            formControlName="featureCodes"
            optionLabel="name"
            optionValue="code"
            placeholder="اختر الميزات"
            styleClass="w-full"
            [filter]="true"
          ></p-multiSelect>
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
export class PlansComponent implements OnInit {
  private service = inject(PlansService);
  private featuresService = inject(FeaturesService);
  private fb = inject(FormBuilder);

  rows = signal<PlanDto[]>([]);
  features = signal<FeatureDto[]>([]);
  loading = signal(false);
  saving = signal(false);
  showForm = false;
  editingId: string | null = null;

  cycleOptions = [
    { label: 'شهري', value: BillingCycle.Monthly },
    { label: 'ربع سنوي', value: BillingCycle.Quarterly },
    { label: 'سنوي', value: BillingCycle.Annual },
  ];

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    currency: ['EGP', Validators.required],
    billingCycle: [BillingCycle.Monthly, Validators.required],
    durationInDays: [30, [Validators.required, Validators.min(1)]],
    maxMembers: [null as number | null],
    maxCoaches: [null as number | null],
    maxBranches: [null as number | null],
    maxEmployees: [null as number | null],
    maxStorageMB: [null as number | null],
    isActive: [true],
    displayOrder: [1],
    featureCodes: [[] as string[]],
  });

  ngOnInit(): void {
    this.load();
    this.featuresService.list().subscribe({
      next: (f) => this.features.set(f),
      error: () => this.features.set([]),
    });
  }

  cycleLabel(c: BillingCycle): string {
    return BILLING_CYCLE_LABEL[c] ?? '—';
  }

  lim(v: number | null): string {
    return v == null ? '∞' : String(v);
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
    this.form.reset({
      currency: 'EGP',
      billingCycle: BillingCycle.Monthly,
      durationInDays: 30,
      price: 0,
      isActive: true,
      displayOrder: 1,
      featureCodes: [],
    });
    this.showForm = true;
  }

  openEdit(p: PlanDto): void {
    this.editingId = p.id;
    this.form.reset({
      name: p.name,
      description: p.description,
      price: p.price,
      currency: p.currency,
      billingCycle: p.billingCycle,
      durationInDays: p.durationInDays,
      maxMembers: p.maxMembers,
      maxCoaches: p.maxCoaches,
      maxBranches: p.maxBranches,
      maxEmployees: p.maxEmployees,
      maxStorageMB: p.maxStorageMB,
      isActive: p.isActive,
      displayOrder: p.displayOrder,
      // Match feature codes to the seeded catalog (falls back to raw values).
      featureCodes: this.mapFeaturesToCodes(p.features),
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
    const num = (x: number | null) => (x === null || (x as unknown as string) === '' ? null : Number(x));
    const cmd = {
      name: v.name,
      description: v.description,
      price: Number(v.price),
      currency: v.currency,
      billingCycle: v.billingCycle,
      durationInDays: Number(v.durationInDays),
      maxMembers: num(v.maxMembers),
      maxCoaches: num(v.maxCoaches),
      maxBranches: num(v.maxBranches),
      maxEmployees: num(v.maxEmployees),
      maxStorageMB: num(v.maxStorageMB),
      isActive: v.isActive,
      displayOrder: Number(v.displayOrder) || 0,
      featureCodes: v.featureCodes,
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

  async remove(p: PlanDto): Promise<void> {
    const ok = await confirmAction('حذف الباقة', `حذف باقة "${p.name}"؟`, 'حذف', true);
    if (!ok) return;
    this.service.remove(p.id).subscribe({
      next: () => {
        toastSuccess('تم الحذف');
        this.load();
      },
      error: (err) => {
        // 409 → plan has active subscriptions; suggest deactivating instead.
        if (err?.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'لا يمكن الحذف',
            text: errMsg(err) + ' — يمكنك تعطيل الباقة بدلاً من حذفها.',
            showCancelButton: true,
            confirmButtonText: 'تعطيل الباقة',
            cancelButtonText: 'إغلاق',
            confirmButtonColor: '#d97706',
            reverseButtons: true,
          }).then((res) => {
            if (res.isConfirmed) this.deactivate(p);
          });
        } else {
          toastError(errMsg(err));
        }
      },
    });
  }

  /** Turn off a plan that can't be deleted (has active subscriptions). */
  private deactivate(p: PlanDto): void {
    const cmd = {
      name: p.name,
      description: p.description,
      price: p.price,
      currency: p.currency,
      billingCycle: p.billingCycle,
      durationInDays: p.durationInDays,
      maxMembers: p.maxMembers,
      maxCoaches: p.maxCoaches,
      maxBranches: p.maxBranches,
      maxEmployees: p.maxEmployees,
      maxStorageMB: p.maxStorageMB,
      isActive: false,
      displayOrder: p.displayOrder,
      featureCodes: this.mapFeaturesToCodes(p.features),
    };
    this.service.update(p.id, cmd).subscribe({
      next: () => {
        toastSuccess('تم تعطيل الباقة');
        this.load();
      },
      error: (err) => toastError(errMsg(err)),
    });
  }

  /** The list DTO exposes `features` as display strings; map back to codes when possible. */
  private mapFeaturesToCodes(features: string[]): string[] {
    const catalog = this.features();
    if (!catalog.length) return features;
    return features
      .map((f) => {
        const match = catalog.find((c) => c.code === f || c.name === f);
        return match ? match.code : f;
      })
      .filter((code) => catalog.some((c) => c.code === code));
  }
}
