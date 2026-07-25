import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
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
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import { PlansService } from './plans.service';
import { FeaturesService } from '../features/features.service';
import {
  BILLING_CYCLE_LABEL,
  BadgeInfo,
  BillingCycle,
  FeatureDto,
  PlanDto,
} from '../../core/models/platform.models';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { ADMIN_ASSISTANT_COMMAND_EVENT } from '../../shared/assistant/admin-assistant.service';

@Component({
  selector: 'app-plans',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    ServerPaginatorComponent,
  ],
  template: `
    <app-page-header title="الباقات" subtitle="باقات الاشتراك وحدودها ومميزاتها" icon="pi pi-box">
      <button pButton label="باقة جديدة" icon="pi pi-plus" (click)="openCreate()"></button>
    </app-page-header>

    <div class="lf-card overflow-hidden">
      <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>الاسم</th>
            <th>السعر</th>
            <th class="hidden sm:table-cell">الدورة</th>
            <th class="hidden lg:table-cell">الحدود</th>
            <th class="hidden md:table-cell">الميزات</th>
            <th>الحالة</th>
            <th class="text-center">الإجراءات</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-p>
          <tr>
            <td>
              <div class="font-semibold text-slate-800">{{ p.name }}</div>
              <div class="text-xs text-slate-400 truncate max-w-[220px]">{{ p.description }}</div>
            </td>
            <td class="whitespace-nowrap font-semibold tabular-nums">{{ p.price | number }} {{ p.currency }}</td>
            <td class="hidden sm:table-cell">{{ cycleLabel(p.billingCycle) }}</td>
            <td class="text-xs text-slate-500 hidden lg:table-cell">
              أعضاء: {{ lim(p.maxMembers) }} · مدربين: {{ lim(p.maxCoaches) }} · فروع: {{ lim(p.maxBranches) }}
            </td>
            <td class="hidden md:table-cell"><span class="lf-badge lf-badge-blue">{{ p.features.length }} ميزة</span></td>
            <td><app-status-badge [badge]="activeBadge(p.isActive)"></app-status-badge></td>
            <td class="text-center whitespace-nowrap">
              <button pButton pTooltip="تعديل" icon="pi pi-pencil" class="p-button-sm p-button-text" (click)="openEdit(p)"></button>
              <button pButton pTooltip="حذف" icon="pi pi-trash" class="p-button-sm p-button-danger p-button-text" (click)="remove(p)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="7" class="text-center text-slate-400 py-10"><i class="pi pi-box text-2xl block mb-2 opacity-40"></i>لا توجد باقات</td></tr>
        </ng-template>
      </p-table>
      <app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator>
    </div>

    <p-dialog [header]="editingId ? 'تعديل باقة' : 'باقة جديدة'" [(visible)]="showForm" [modal]="true"
      [style]="{ width: '720px', maxWidth: '95vw' }" [dismissableMask]="true" [draggable]="false">
      <form [formGroup]="form" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="sm:col-span-2">
          <label class="lf-label">اسم الباقة *</label>
          <input class="lf-input" formControlName="name" />
        </div>
        <div>
          <label class="lf-label">الترتيب</label>
          <input class="lf-input" type="number" formControlName="displayOrder" dir="ltr" />
        </div>
        <div class="sm:col-span-3">
          <label class="lf-label">الوصف</label>
          <input class="lf-input" formControlName="description" />
        </div>

        <div>
          <label class="lf-label">السعر *</label>
          <input class="lf-input" type="number" formControlName="price" dir="ltr" />
        </div>
        <div>
          <label class="lf-label">العملة *</label>
          <input class="lf-input" formControlName="currency" dir="ltr" placeholder="EGP" />
        </div>
        <div>
          <label class="lf-label">دورة الفوترة *</label>
          <p-dropdown [options]="cycleOptions" formControlName="billingCycle" optionLabel="label" optionValue="value" styleClass="w-full"></p-dropdown>
        </div>

        <div>
          <label class="lf-label">المدة (أيام) *</label>
          <input class="lf-input" type="number" formControlName="durationInDays" dir="ltr" />
        </div>

        <div class="sm:col-span-3 text-xs text-slate-400 -mb-2">اترك الحقل فارغاً = غير محدود</div>
        <div>
          <label class="lf-label">حد الأعضاء</label>
          <input class="lf-input" type="number" formControlName="maxMembers" dir="ltr" placeholder="∞" />
        </div>
        <div>
          <label class="lf-label">حد المدربين</label>
          <input class="lf-input" type="number" formControlName="maxCoaches" dir="ltr" placeholder="∞" />
        </div>
        <div>
          <label class="lf-label">حد الفروع</label>
          <input class="lf-input" type="number" formControlName="maxBranches" dir="ltr" placeholder="∞" />
        </div>
        <div>
          <label class="lf-label">حد الموظفين</label>
          <input class="lf-input" type="number" formControlName="maxEmployees" dir="ltr" placeholder="∞" />
        </div>
        <div>
          <label class="lf-label">التخزين (MB)</label>
          <input class="lf-input" type="number" formControlName="maxStorageMB" dir="ltr" placeholder="∞" />
        </div>
        <div class="flex items-center gap-2 pt-7">
          <p-inputSwitch formControlName="isActive"></p-inputSwitch>
          <span class="text-sm text-slate-600">مفعّلة</span>
        </div>

        <div class="sm:col-span-3">
          <label class="lf-label">الميزات</label>
          <p-multiSelect [options]="features()" formControlName="featureCodes" optionLabel="name" optionValue="code" placeholder="Features" styleClass="w-full" [filter]="true"></p-multiSelect>
          <textarea class="lf-input mt-2" formControlName="featureLimitsJson" dir="ltr" placeholder='{"members.manage":500}'></textarea><!--
            placeholder="اختر الميزات" styleClass="w-full" [filter]="true"></p-multiSelect>
        --></div>
      </form>
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showForm = false"></button>
        <button pButton label="حفظ" icon="pi pi-check" [disabled]="form.invalid || saving()" (click)="save()"></button>
      </ng-template>
    </p-dialog>
  `,
})
export class PlansComponent implements OnInit {
  @HostListener(`window:${ADMIN_ASSISTANT_COMMAND_EVENT}`, ['$event'])
  onAssistantCommand(event: Event): void {
    if ((event as CustomEvent<{ command?: string }>).detail?.command === 'create-plan') this.openCreate();
  }

  private service = inject(PlansService);
  private featuresService = inject(FeaturesService);
  private fb = inject(FormBuilder);
  private notify = inject(NotifyService);

  rows = signal<PlanDto[]>([]);
  page = 1;
  pageSize = 20;
  totalCount = 0;
  features = signal<FeatureDto[]>([]);
  loading = signal(false);
  saving = signal(false);
  showForm = false;
  editingId: string | null = null;

  cycleOptions = [
    { label: 'شهري', value: BillingCycle.Monthly },
    { label: '6 أشهر', value: BillingCycle.SemiAnnual },
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
    featureLimitsJson: ['{}'],
  });

  ngOnInit(): void {
    this.load();
    this.featuresService.catalog().subscribe({
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
    this.service.list(false, this.page, this.pageSize).subscribe({
      next: (data) => {
        this.rows.set(data.items);
        this.totalCount = data.totalCount;
        this.loading.set(false);
      },
      error: (err) => {
        this.notify.error(errMsg(err));
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.load();
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
      featureLimits: (() => { try { return JSON.parse(v.featureLimitsJson || '{}'); } catch { return {}; } })(),
    };
    const req = this.editingId ? this.service.update(this.editingId, cmd) : this.service.create(cmd);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm = false;
        this.notify.success('تم الحفظ');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(errMsg(err));
      },
    });
  }

  async remove(p: PlanDto): Promise<void> {
    const ok = await this.notify.confirm({
      header: 'حذف الباقة',
      message: `هل تريد حذف باقة "${p.name}"؟`,
      acceptLabel: 'حذف',
      danger: true,
    });
    if (!ok) return;
    this.service.remove(p.id).subscribe({
      next: () => {
        this.notify.success('تم الحذف');
        this.load();
      },
      error: async (err) => {
        // 409 → plan has active subscriptions; offer to deactivate instead.
        if (err?.status === 409) {
          const deactivate = await this.notify.confirm({
            header: 'لا يمكن الحذف',
            message: `${errMsg(err)} — يمكنك تعطيل الباقة بدلاً من حذفها.`,
            acceptLabel: 'تعطيل الباقة',
            rejectLabel: 'إغلاق',
          });
          if (deactivate) this.deactivate(p);
        } else {
          this.notify.error(errMsg(err));
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
        this.notify.success('تم تعطيل الباقة');
        this.load();
      },
      error: (err) => this.notify.error(errMsg(err)),
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
