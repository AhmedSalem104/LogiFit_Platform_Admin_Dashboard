import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import { TenantsService } from './tenants.service';
import {
  PlatformTenantDto,
  PlatformTenantCredentialsDto,
  TENANT_STATUS_BADGE,
  TenantStatus,
} from '../../core/models/platform.models';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { ADMIN_ASSISTANT_COMMAND_EVENT } from '../../shared/assistant/admin-assistant.service';

@Component({
  selector: 'app-tenants',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    ServerPaginatorComponent,
  ],
  template: `
    <app-page-header title="الجيمات" subtitle="إدارة الجيمات ودورة حياتها" icon="pi pi-building">
      <p-dropdown
        [options]="statusOptions"
        [(ngModel)]="statusFilter"
        (onChange)="resetPage()"
        optionLabel="label"
        optionValue="value"
        placeholder="كل الحالات"
        [showClear]="true"
        styleClass="w-full sm:w-48"
      ></p-dropdown>
      <button pButton label="إنشاء طلب مساحة عمل" icon="pi pi-plus" (click)="openCreate()"></button>
    </app-page-header>

    <div class="lf-card overflow-hidden">
      <p-table [value]="rows()" [loading]="loading()" [paginator]="rows().length > 10" [rows]="10"
        styleClass="p-datatable-sm" [scrollable]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>الاسم</th>
            <th class="hidden sm:table-cell">الـ Subdomain</th>
            <th>الحالة</th>
            <th class="hidden md:table-cell">الأعضاء</th>
            <th class="hidden lg:table-cell">تاريخ الإنشاء</th>
            <th class="text-center">الإجراءات</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-t>
          <tr>
            <td>
              <div class="font-semibold text-slate-800">{{ t.name }}</div>
              <div class="text-xs text-slate-400" dir="ltr">{{ t.email }}</div>
            </td>
            <td dir="ltr" class="text-left hidden sm:table-cell">{{ t.subdomain }}</td>
            <td><app-status-badge [badge]="badge(t.status)"></app-status-badge></td>
            <td class="hidden md:table-cell tabular-nums">{{ t.membersCount | number }}</td>
            <td dir="ltr" class="text-left hidden lg:table-cell">{{ t.createdAt | date: 'yyyy-MM-dd' }}</td>
            <td class="text-center whitespace-nowrap">
              <button pButton pTooltip="بيانات الدخول" aria-label="بيانات الدخول" icon="pi pi-id-card" class="p-button-sm p-button-text" (click)="openCredentials(t)"></button>
              @if (t.status === TS.PendingApproval) {
                <button pButton pTooltip="موافقة" icon="pi pi-check" class="p-button-sm p-button-success p-button-text" [disabled]="busyId() !== null" [loading]="busyId() === t.id && busyAction() === 'approve'" (click)="act(t, 'approve')"></button>
              }
              @if (t.status === TS.Suspended || t.status === TS.PendingApproval) {
                <button pButton pTooltip="تفعيل" icon="pi pi-play" class="p-button-sm p-button-text" [disabled]="busyId() !== null" [loading]="busyId() === t.id && busyAction() === 'activate'" (click)="act(t, 'activate')"></button>
              }
              @if (t.status === TS.Active || t.status === TS.Trial) {
                <button pButton pTooltip="إيقاف" icon="pi pi-pause" class="p-button-sm p-button-warning p-button-text" [disabled]="busyId() !== null" [loading]="busyId() === t.id && busyAction() === 'suspend'" (click)="act(t, 'suspend')"></button>
              }
              @if (t.status !== TS.Archived) {
                <button pButton pTooltip="أرشفة" icon="pi pi-inbox" class="p-button-sm p-button-secondary p-button-text" [disabled]="busyId() !== null" [loading]="busyId() === t.id && busyAction() === 'archive'" (click)="act(t, 'archive')"></button>
              }
              @if (t.isDeleted || t.status === TS.Deleted) {
                <button pButton pTooltip="استعادة" aria-label="استعادة" icon="pi pi-replay" class="p-button-sm p-button-success p-button-text" [disabled]="busyId() !== null" [loading]="busyId() === t.id && busyAction() === 'restore'" (click)="restore(t)"></button>
              } @else {
                <button pButton pTooltip="حذف مؤقت" aria-label="حذف مؤقت" icon="pi pi-ban" class="p-button-sm p-button-warning p-button-text" [disabled]="busyId() !== null" [loading]="busyId() === t.id && busyAction() === 'soft-delete'" (click)="softDelete(t)"></button>
              }
              <button pButton pTooltip="حذف نهائي" aria-label="حذف نهائي" icon="pi pi-trash" class="p-button-sm p-button-danger p-button-text" [disabled]="busyId() !== null" [loading]="busyId() === t.id && busyAction() === 'permanent-delete'" (click)="permanentDelete(t)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="6" class="text-center text-slate-400 py-10"><i class="pi pi-building text-2xl block mb-2 opacity-40"></i>لا توجد جيمات</td></tr>
        </ng-template>
      </p-table>
      <app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator>
    </div>

    <!-- Create dialog -->
    <p-dialog header="إنشاء جيم جديد" [(visible)]="showCreate" [modal]="true" [style]="{ width: '640px', maxWidth: '94vw' }"
      [dismissableMask]="true" [draggable]="false">
      <form [formGroup]="form" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wide">بيانات الجيم</div>
        <div>
          <label class="lf-label">اسم الجيم *</label>
          <input class="lf-input" formControlName="name" />
        </div>
        <div>
          <label class="lf-label">Subdomain *</label>
          <input class="lf-input" formControlName="subdomain" dir="ltr" placeholder="powergym" />
        </div>
        <div>
          <label class="lf-label">إيميل الجيم *</label>
          <input class="lf-input" formControlName="email" dir="ltr" />
        </div>
        <div>
          <label class="lf-label">هاتف الجيم</label>
          <input class="lf-input" formControlName="phoneNumber" dir="ltr" />
        </div>

        <div class="sm:col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wide mt-1 pt-2 border-t border-slate-100">بيانات صاحب الجيم (Owner)</div>
        <div>
          <label class="lf-label">اسم المالك *</label>
          <input class="lf-input" formControlName="ownerFullName" />
        </div>
        <div>
          <label class="lf-label">إيميل المالك *</label>
          <input class="lf-input" formControlName="ownerEmail" dir="ltr" />
        </div>
        <div>
          <label class="lf-label">هاتف المالك *</label>
          <input class="lf-input" formControlName="ownerPhoneNumber" dir="ltr" placeholder="01000000000" />
        </div>
        <div>
          <label class="lf-label">كلمة مرور المالك *</label>
          <input class="lf-input" formControlName="ownerPassword" type="password" autocomplete="new-password" dir="ltr" />
        </div>
      </form>
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showCreate = false"></button>
        <button pButton label="إنشاء" icon="pi pi-check" [disabled]="form.invalid || saving()" (click)="create()"></button>
      </ng-template>
    </p-dialog>

    <!-- Safe owner credentials dialog: password/hash are never returned or displayed. -->
    <p-dialog header="بيانات دخول المالك" [(visible)]="showCredentials" [modal]="true" [style]="{ width: '500px', maxWidth: '94vw' }" [draggable]="false">
      @if (credentials(); as c) {
        <div class="text-sm text-slate-600 leading-relaxed">
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
            <div class="flex items-center justify-between gap-4"><span>البريد المستخدم للدخول</span><b dir="ltr">{{ c.ownerEmail || 'غير متاح' }}</b></div>
            <div class="flex items-center justify-between gap-4"><span>Global Identity</span><b>{{ c.identityLinked ? 'مرتبطة' : 'غير مرتبطة' }}</b></div>
            <div class="flex items-center justify-between gap-4"><span>حالة الحساب</span><b>{{ c.ownerAccountActive ? 'نشط' : 'معطل' }}</b></div>
            <div class="flex items-center justify-between gap-4"><span>التحقق من البريد</span><b>{{ c.emailVerifiedAtUtc ? 'تم التحقق' : 'غير متحقق' }}</b></div>
          </div>
          <p class="mt-4 text-xs text-slate-500">لا يتم عرض كلمة المرور الحالية. استخدم إعادة التعيين لإرسال رابط آمن لمرة واحدة إلى البريد.</p>
        </div>
      }
      <ng-template pTemplate="footer">
        <button pButton label="إعادة تعيين كلمة المرور" icon="pi pi-envelope" class="p-button-outlined" [disabled]="!credentials()?.passwordResetAvailable || saving()" (click)="resetPassword()"></button>
        <button pButton label="إغلاق" icon="pi pi-times" class="p-button-text p-button-secondary" (click)="showCredentials = false"></button>
      </ng-template>
    </p-dialog>
  `,
})
export class TenantsComponent implements OnInit {
  @HostListener(`window:${ADMIN_ASSISTANT_COMMAND_EVENT}`, ['$event'])
  onAssistantCommand(event: Event): void {
    if ((event as CustomEvent<{ command?: string }>).detail?.command === 'create-tenant') this.openCreate();
  }

  private service = inject(TenantsService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private notify = inject(NotifyService);

  readonly TS = TenantStatus;
  rows = signal<PlatformTenantDto[]>([]);
  page = 1;
  pageSize = 20;
  totalCount = 0;
  loading = signal(false);
  saving = signal(false);
  busyId = signal<string | null>(null);
  busyAction = signal<string | null>(null);
  statusFilter: TenantStatus | null = null;
  showCreate = false;
  showCredentials = false;
  credentials = signal<PlatformTenantCredentialsDto | null>(null);
  selectedTenant = signal<PlatformTenantDto | null>(null);

  statusOptions = [
    { label: 'نشط', value: TenantStatus.Active },
    { label: 'بانتظار الموافقة', value: TenantStatus.PendingApproval },
    { label: 'موقوف', value: TenantStatus.Suspended },
    { label: 'تجريبي', value: TenantStatus.Trial },
    { label: 'مؤرشف', value: TenantStatus.Archived },
    { label: 'محذوف مؤقتاً', value: TenantStatus.Deleted },
  ];

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    subdomain: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    ownerFullName: ['', Validators.required],
    ownerEmail: ['', [Validators.required, Validators.email]],
    ownerPhoneNumber: ['', Validators.required],
    ownerPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    this.load();
  }

  badge(status: TenantStatus) {
    return TENANT_STATUS_BADGE[status];
  }

  load(): void {
    this.loading.set(true);
    this.service.list(this.statusFilter ?? undefined, this.page, this.pageSize).subscribe({
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

  resetPage(): void {
    this.page = 1;
    this.load();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.load();
  }

  openCreate(): void {
    // Creation must use the unified application, payment, approval, and
    // provisioning workflow. The legacy form could not create its prerequisites.
    void this.router.navigate(['/workspace-applications'], { queryParams: { create: '1' } });
  }

  create(): void {
    if (this.saving()) return;
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
        this.form.reset();
        this.notify.success('تم إنشاء الجيم');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(errMsg(err));
      },
    });
  }

  openCredentials(t: PlatformTenantDto): void {
    this.selectedTenant.set(t);
    this.credentials.set(null);
    this.showCredentials = true;
    this.service.credentials(t.id).subscribe({
      next: (data) => this.credentials.set(data),
      error: (err) => {
        this.showCredentials = false;
        this.notify.error(errMsg(err));
      },
    });
  }

  async resetPassword(): Promise<void> {
    const tenant = this.selectedTenant();
    const credentials = this.credentials();
    if (!tenant || !credentials?.passwordResetAvailable || this.saving()) return;

    const ok = await this.notify.confirm({
      header: 'إعادة تعيين كلمة المرور',
      message: `سيتم إرسال رابط آمن إلى ${credentials.ownerEmail || 'بريد المالك'} دون كشف كلمة المرور الحالية. متابعة؟`,
      acceptLabel: 'إرسال الرابط',
    });
    if (!ok) return;

    this.saving.set(true);
    this.service.requestPasswordReset(tenant.id).subscribe({
      next: (result) => {
        this.saving.set(false);
        this.notify.success(`تم إرسال رابط إعادة التعيين إلى ${result.ownerEmail || 'بريد المالك'}`);
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(errMsg(err));
      },
    });
  }

  async softDelete(t: PlatformTenantDto): Promise<void> {
    if (!this.beginAction(t.id, 'soft-delete')) return;
    const ok = await this.notify.confirm({
      header: 'حذف مؤقت للجيم',
      message: `سيتم تعطيل "${t.name}" ومنع الدخول مع الاحتفاظ بالبيانات وإمكانية الاستعادة.`,
      acceptLabel: 'تعطيل وحذف مؤقت',
      danger: true,
    });
    if (!ok) { this.clearAction(); return; }

    this.service.softDelete(t.id).subscribe({
      next: () => {
        this.clearAction();
        this.notify.success('تم تعطيل الجيم وحفظ بياناته');
        this.load();
      },
      error: (err) => { this.clearAction(); this.notify.error(errMsg(err)); },
    });
  }

  async restore(t: PlatformTenantDto): Promise<void> {
    if (!this.beginAction(t.id, 'restore')) return;
    const ok = await this.notify.confirm({
      header: 'استعادة الجيم',
      message: `استعادة "${t.name}" وإتاحة الدخول مرة أخرى؟`,
      acceptLabel: 'استعادة',
    });
    if (!ok) { this.clearAction(); return; }

    this.service.restore(t.id).subscribe({
      next: () => {
        this.clearAction();
        this.notify.success('تمت استعادة الجيم');
        this.load();
      },
      error: (err) => { this.clearAction(); this.notify.error(errMsg(err)); },
    });
  }

  async permanentDelete(t: PlatformTenantDto): Promise<void> {
    if (!this.beginAction(t.id, 'permanent-delete')) return;
    const confirmation = await this.notify.textPrompt({
      title: 'حذف نهائي وغير قابل للتراجع',
      label: `سيتم إنشاء نسخة BACPAC كاملة أولاً، ثم تفريغ قاعدة بيانات الجيم وإعادتها لقائمة الموارد. لن يتم حذف Global Identity للمالك. اكتب اسم الجيم حرفياً للتأكيد: ${t.name}`,
      placeholder: t.name,
      confirmLabel: 'تنفيذ الحذف النهائي',
    });
    if (confirmation?.trim() !== t.name.trim()) { this.clearAction(); return; }

    this.saving.set(true);
    this.service.permanentDelete(t.id, {
      tenantNameConfirmation: confirmation,
      preserveGlobalIdentity: true,
    }).subscribe({
      next: (result) => {
        this.clearAction();
        this.saving.set(false);
        this.notify.success(`تم الحذف النهائي بعد نجاح النسخة الاحتياطية. رقم النسخة: ${result.backupBatchId}`);
        this.load();
      },
      error: (err) => {
        this.clearAction();
        this.saving.set(false);
        this.notify.error(errMsg(err));
      },
    });
  }

  async act(t: PlatformTenantDto, action: 'approve' | 'activate' | 'suspend' | 'archive'): Promise<void> {
    if (!this.beginAction(t.id, action)) return;
    const meta = {
      approve: { header: 'موافقة على الجيم', message: `تفعيل "${t.name}"؟`, danger: false },
      activate: { header: 'تفعيل الجيم', message: `إعادة تفعيل "${t.name}"؟`, danger: false },
      suspend: { header: 'إيقاف الجيم', message: `إيقاف "${t.name}"؟ لن يتمكن من استخدام النظام.`, danger: true },
      archive: { header: 'أرشفة الجيم', message: `أرشفة "${t.name}"؟`, danger: true },
    }[action];

    const ok = await this.notify.confirm({ ...meta, acceptLabel: meta.header });
    if (!ok) { this.clearAction(); return; }

    this.service[action](t.id).subscribe({
      next: (updated) => {
        this.clearAction();
        this.rows.update((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
        this.notify.success('تم تنفيذ الإجراء');
      },
      error: (err) => { this.clearAction(); this.notify.error(errMsg(err)); },
    });
  }

  private beginAction(id: string, action: string): boolean {
    if (this.busyId()) return false;
    this.busyId.set(id);
    this.busyAction.set(action);
    return true;
  }

  private clearAction(): void {
    this.busyId.set(null);
    this.busyAction.set(null);
  }
}
