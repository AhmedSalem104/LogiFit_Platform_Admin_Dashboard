import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { ServerPaginatorComponent, PageChange } from '../../shared/ui/server-paginator.component';
import {
  ConnectionTestResult,
  DatabaseResource,
  DatabaseResourceLifecycleStatus,
  DatabaseResourceStatus,
  DatabaseResourcesService,
  RegisterDatabaseResourceCommand,
} from './database-resources.service';

interface ResourceEditor {
  provider: string;
  databaseName: string;
  serverKey: string;
  connectionString: string;
}

@Component({
  selector: 'app-database-resources',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, DialogModule, TableModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <app-page-header
      title="موارد قواعد البيانات"
      subtitle="أدر Pool قواعد بيانات مساحات العمل المحمية بإجراءات واضحة يتحقق منها الخادم."
      icon="pi pi-database">
      <button
        pButton
        type="button"
        label="تحديث"
        icon="pi pi-refresh"
        class="p-button-text"
        aria-label="تحديث موارد قواعد البيانات"
        [loading]="loading()"
        (click)="load()"></button>
      <button pButton type="button" label="تسجيل قاعدة بيانات" icon="pi pi-plus" (click)="openRegister()"></button>
    </app-page-header>

    @if (loadError(); as message) {
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
        <span><i class="pi pi-exclamation-circle me-2"></i>{{ message }}</span>
        <button pButton type="button" label="إعادة المحاولة" icon="pi pi-refresh" class="p-button-sm p-button-danger p-button-outlined" (click)="load()"></button>
      </div>
    }

    <div class="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
      <div class="flex items-start gap-3">
        <i class="pi pi-info-circle mt-1"></i>
        <div>
          <p class="m-0 font-extrabold">إدارة Pool الموارد المحمية</p>
          <p class="mb-0 mt-1">يقبل التسجيل والإصلاح سلسلة الاتصال عبر الـAPI المحمي فقط. يختبرها الخادم ويشفّرها فورًا ولا يعيدها أو يعرضها مطلقًا. تستخدم الموارد المخصصة إجراء الإصلاح الصريح؛ وتظل الترحيلات وفحوصات الصحة والتخصيص والنسخ الاحتياطية تحت تحكم الخادم.</p>
          <a routerLink="/backups" class="mt-2 inline-flex items-center gap-2 font-bold text-blue-700 hover:underline">
            عرض مركز النسخ الاحتياطية <i class="pi pi-arrow-right text-xs"></i>
          </a>
        </div>
      </div>
    </div>

      <div class="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] md:items-end">
        <label class="lf-label m-0">
          حالة دورة الحياة
          <select class="lf-input mt-1" [ngModel]="statusFilter()" (ngModelChange)="selectStatus($event)">
            <option [ngValue]="null">كل الحالات</option>
            @for (option of statusOptions; track option.value) {
              <option [ngValue]="option.value">{{ option.label }}</option>
            }
          </select>
        </label>
        <label class="lf-label m-0">
          معرّف مساحة العمل (اختياري)
          <input class="lf-input mt-1" [ngModel]="tenantIdFilter()" (ngModelChange)="tenantIdFilter.set($event)" dir="ltr" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
        </label>
        <button pButton type="button" label="تطبيق الفلاتر" icon="pi pi-filter" class="p-button-outlined" [loading]="loading()" (click)="applyFilters()"></button>
        <button pButton type="button" label="مسح" icon="pi pi-times" class="p-button-text p-button-secondary" [disabled]="!hasFilters()" (click)="clearFilters()"></button>
      </div>

      <div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      @for (card of summaryCards(); track card.label) {
        <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-slate-500">{{ card.label }}</span>
            <i [class]="card.icon + ' ' + card.color"></i>
          </div>
          <div class="mt-2 text-2xl font-black text-slate-800">{{ card.value }}</div>
        </div>
      }
    </div>
    <p class="-mt-4 mb-6 text-xs text-slate-500">تعرض أرقام الملخص الصفحة المحملة حاليًا. إجمالي الجدول هو {{ totalCount }} موردًا.</p>

    <section class="lf-card overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 class="m-0 text-base font-extrabold text-slate-800">قواعد بيانات مساحات العمل المسجلة</h2>
          <p class="mb-0 mt-1 text-xs text-slate-500">تُشفّر سلاسل الاتصال داخل DatabaseResources ولا تُعرض هنا مطلقًا.</p>
        </div>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{{ totalCount }} موردًا</span>
      </div>

      <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>المورد</th>
            <th>الحالة</th>
            <th>مساحة العمل</th>
            <th>التجهيز / الصحة</th>
            <th>النسخ الاحتياطية</th>
            <th class="text-center">الإجراءات</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>
              <div class="font-bold text-slate-800" dir="ltr">{{ row.databaseName || row.resourceCode || shortId(row.id) }}</div>
              <div class="mt-1 text-xs text-slate-500" dir="ltr">المورد: {{ row.resourceCode || shortId(row.id) }}</div>
              <div class="mt-1 text-xs text-slate-500" dir="ltr">{{ providerLabel(row.provider) }}</div>
              @if (row.serverHost) {
                <div class="mt-1 text-xs text-slate-500" dir="ltr"><i class="pi pi-cloud me-1"></i>{{ row.serverHost }}{{ row.serverPort ? ':' + row.serverPort : '' }}</div>
              }
              @if (row.serverKey) { <div class="mt-1 text-[11px] text-slate-400" dir="ltr">{{ row.serverKey }}</div> }
              <div class="mt-1 text-[11px]" [class.text-emerald-600]="row.hasProtectedConnection" [class.text-amber-600]="!row.hasProtectedConnection">
                <i [class]="row.hasProtectedConnection ? 'pi pi-lock' : 'pi pi-exclamation-triangle'"></i>
                {{ row.hasProtectedConnection ? 'تم حفظ الاتصال المحمي' : 'الاتصال غير موجود' }}
              </div>
            </td>
            <td><span class="lf-badge" [ngClass]="statusClass(row)">{{ lifecycleText(row) }}</span></td>
            <td>
              @if (row.tenantName) {
                <div class="font-semibold text-slate-700">{{ row.tenantName }}</div>
                <div class="text-xs text-slate-500">{{ workspaceLabel(row.workspaceType) }}</div>
              } @else {
                <span class="text-sm text-slate-400">غير مخصص</span>
              }
            </td>
            <td>
              <div class="text-sm text-slate-700">{{ provisioningLabel(row) }}</div>
              @if (row.provisioningError || row.lastError) {
                <div class="text-xs font-semibold text-rose-600">{{ errorLabel(row.provisioningError || row.lastError) }}</div>
              }
              @if (row.lastConnectionTestSucceeded === true) {
                <div class="mt-2 text-xs font-semibold text-emerald-600"><i class="pi pi-check-circle me-1"></i>آخر فحص ناجح{{ row.lastConnectionTestDurationMs ? ' · ' + row.lastConnectionTestDurationMs + 'ms' : '' }}</div>
              } @else if (row.lastConnectionTestSucceeded === false) {
                <div class="mt-2 text-xs font-semibold text-rose-600"><i class="pi pi-times-circle me-1"></i>{{ errorLabel(row.lastConnectionErrorCode) || row.lastConnectionErrorMessage || 'آخر فحص فشل' }}</div>
                @if (row.lastConnectionErrorMessage && row.lastConnectionErrorMessage !== errorLabel(row.lastConnectionErrorCode)) {
                  <div class="mt-1 max-w-xs text-[11px] text-rose-500">{{ row.lastConnectionErrorMessage }}</div>
                }
              }
              <div class="mt-1 text-xs text-slate-500">آخر فحص: {{ row.lastConnectionTestAtUtc ? formatDate(row.lastConnectionTestAtUtc) : 'لم يتم الاختبار' }}</div>
              <div class="mt-1 text-xs text-slate-500">الصحة: {{ row.lastHealthCheckAtUtc ? formatDate(row.lastHealthCheckAtUtc) : 'لم يتم التحقق' }}</div>
              @if (row.schemaVersion) { <div class="text-[11px] text-slate-400" dir="ltr">{{ row.schemaVersion }}</div> }
            </td>
            <td>
              <div class="font-semibold text-slate-700">{{ row.backupCount || 0 }} نسخة</div>
              <div class="text-xs text-slate-500">{{ backupStatusLabel(row.lastBackupStatus) }}</div>
              @if (row.lastBackupCompletedAtUtc) { <div class="text-[11px] text-slate-400">{{ formatDate(row.lastBackupCompletedAtUtc) }}</div> }
            </td>
            <td class="whitespace-nowrap text-center">
              <div class="flex flex-wrap justify-center gap-1">
                <button pButton type="button" label="فحص الاتصال" icon="pi pi-link" class="p-button-sm p-button-outlined" [loading]="busyId() === row.id && busyAction() === 'test'" [disabled]="busyId() !== null" (click)="testStoredConnection(row)"></button>
                @if (canRepair(row)) {
                  <button pButton type="button" label="إصلاح" icon="pi pi-wrench" class="p-button-sm p-button-warning p-button-outlined" title="إصلاح الاتصال المحمي" [disabled]="busyId() !== null" (click)="openRepair(row)"></button>
                }
                @if (canRunMigrations(row)) {
                  <button pButton type="button" label="الترحيلات" icon="pi pi-sync" class="p-button-sm p-button-outlined" [loading]="busyId() === row.id && busyAction() === 'migrations'" [disabled]="busyId() !== null" (click)="runMigrations(row)"></button>
                }
                @if (isAllocated(row)) {
                  <button pButton type="button" label="نسخة احتياطية" icon="pi pi-save" class="p-button-sm p-button-outlined" [loading]="busyId() === row.id && busyAction() === 'backup'" [disabled]="busyId() !== null" (click)="createBackup(row)"></button>
                }
                @if (canDisable(row)) {
                  <button pButton type="button" label="تعطيل" icon="pi pi-ban" class="p-button-sm p-button-warning p-button-text" [loading]="busyId() === row.id && busyAction() === 'status'" [disabled]="busyId() !== null" (click)="setStatus(row, 'Disabled')"></button>
                }
                @if (isDisabled(row)) {
                  <button pButton type="button" label="تفعيل" icon="pi pi-check" class="p-button-sm p-button-success p-button-text" [loading]="busyId() === row.id && busyAction() === 'status'" [disabled]="busyId() !== null" (click)="setStatus(row, 'Available')"></button>
                }
                @if (row.canDelete) {
                  <button pButton type="button" label="حذف نهائي" icon="pi pi-trash" class="p-button-sm p-button-danger p-button-outlined" [loading]="busyId() === row.id && busyAction() === 'delete'" [disabled]="busyId() !== null" (click)="deleteResource(row)"></button>
                } @else if (row.deletionBlockedReason) {
                  <span class="text-[11px] text-slate-400" [title]="errorLabel(row.deletionBlockedReason)"><i class="pi pi-lock me-1"></i>الحذف محمي</span>
                }
                @if (!canRepair(row) && !canRunMigrations(row) && !isAllocated(row) && !canDisable(row) && !isDisabled(row) && !row.canDelete) {
                  <span class="text-xs text-slate-400">يديرها الخادم</span>
                }
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="6" class="py-14 text-center text-slate-400"><i class="pi pi-database mb-2 block text-3xl opacity-40"></i>لا توجد موارد قواعد بيانات مسجلة. استخدم «تسجيل قاعدة بيانات» لإضافة مورد محمي إلى الـPool.</td></tr>
        </ng-template>
      </p-table>
      <app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator>
    </section>

    <p-dialog
      [(visible)]="dialogVisible"
      [modal]="true"
      [draggable]="false"
      [dismissableMask]="true"
      [style]="{ width: '650px', maxWidth: '94vw' }"
      [header]="repairMode ? (repairAllocated ? 'إصلاح اتصال قاعدة البيانات المخصص' : 'إصلاح مورد قاعدة البيانات') : 'تسجيل مورد قاعدة بيانات'">
      <form #resourceForm="ngForm" (ngSubmit)="save()" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        @if (!repairMode) {
          <div>
            <label class="lf-label">المزود *</label>
            <select class="lf-input" name="provider" [(ngModel)]="editor.provider" required>
              <option value="ManualMonster">ManualMonster</option>
              <option value="LocalSql">LocalSql</option>
            </select>
          </div>
          <div>
            <label class="lf-label">اسم قاعدة البيانات *</label>
            <input class="lf-input" name="databaseName" [(ngModel)]="editor.databaseName" dir="ltr" required placeholder="tenant-db-01" />
          </div>
          <div class="sm:col-span-2">
            <label class="lf-label">مفتاح الخادم / ملاحظة</label>
            <input class="lf-input" name="serverKey" [(ngModel)]="editor.serverKey" dir="ltr" placeholder="مرجع تشغيلي اختياري" />
          </div>
        } @else {
          <div class="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
            <i class="pi pi-wrench me-1"></i>
            @if (repairAllocated) {
              سيستبدل هذا القيمة المحمية لربط مساحة العمل المخصصة. لا تُعرض القيمة الحالية مطلقًا.
            } @else {
              يتحقق هذا الإجراء من اتصال جديد للـPool ويحميه، ثم يعيد المورد إلى حالة «متاح».
            }
          </div>
        }
        <div class="sm:col-span-2">
          <label class="lf-label">سلسلة الاتصال *</label>
          <textarea class="lf-input min-h-28 font-mono text-xs" name="connectionString" [(ngModel)]="editor.connectionString" dir="ltr" required autocomplete="new-password" placeholder="تُدخل عبر اتصال آمن ولا تُعرض بعد الحفظ"></textarea>
          <p class="mt-1 text-xs text-slate-500">يتحقق الخادم من قاعدة بيانات SQL ويشفّر القيمة قبل حفظها، ولا يعيد إلا مؤشرًا بوجود اتصال محمي.</p>
        </div>
        @if (!repairMode && lastTest(); as test) {
          <div class="sm:col-span-2 rounded-xl p-3 text-sm" [class.bg-emerald-50]="test.succeeded" [class.text-emerald-700]="test.succeeded" [class.bg-rose-50]="!test.succeeded" [class.text-rose-700]="!test.succeeded">
            <i [class]="test.succeeded ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
            {{ connectionTestMessage(test) }}
          </div>
        }
      </form>
      <ng-template pTemplate="footer">
        <button pButton type="button" label="إلغاء" class="p-button-text p-button-secondary" (click)="closeDialog()"></button>
        @if (!repairMode) {
          <button pButton type="button" label="اختبار الاتصال" icon="pi pi-link" class="p-button-outlined" [loading]="testing()" [disabled]="!editor.databaseName.trim() || !editor.connectionString.trim()" (click)="testConnection()"></button>
        }
        <button pButton type="button" [label]="repairMode ? 'إصلاح وحماية' : 'تسجيل آمن'" icon="pi pi-lock" [loading]="saving() || registering()" [disabled]="saving() || registering() || !editor.connectionString.trim() || (!repairMode && (!editor.provider.trim() || !editor.databaseName.trim()))" (click)="save()"></button>
      </ng-template>
    </p-dialog>
  `,
})
export class DatabaseResourcesComponent implements OnInit {
  private readonly service = inject(DatabaseResourcesService);
  private readonly notify = inject(NotifyService);

  readonly rows = signal<DatabaseResource[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly registering = signal(false);
  readonly saving = signal(false);
  readonly testing = signal(false);
  readonly busyId = signal<string | null>(null);
  readonly busyAction = signal<string | null>(null);
  readonly lastTest = signal<ConnectionTestResult | null>(null);
  readonly summaryCards = computed(() => [
    { label: 'متاح في الصفحة', value: this.count('Available'), icon: 'pi pi-check-circle', color: 'text-emerald-500' },
    { label: 'مخصص في الصفحة', value: this.count('Allocated'), icon: 'pi pi-link', color: 'text-blue-500' },
    { label: 'قيد التنفيذ في الصفحة', value: this.rows().filter(row => ['Provisioning', 'RestorePending'].includes(this.lifecycleLabel(row))).length, icon: 'pi pi-spin pi-spinner', color: 'text-amber-500' },
    { label: 'يحتاج إلى مراجعة', value: this.rows().filter(row => ['Failed', 'Disabled'].includes(this.lifecycleLabel(row))).length, icon: 'pi pi-exclamation-triangle', color: 'text-rose-500' },
  ]);

  dialogVisible = false;
  repairMode = false;
  repairAllocated = false;
  editingId: string | null = null;
  editor: ResourceEditor = this.emptyEditor();
  page = 1;
  pageSize = 20;
  totalCount = 0;
  statusFilter = signal<DatabaseResourceStatus | null>(null);
  tenantIdFilter = signal('');

  readonly statusOptions = [
    { value: DatabaseResourceStatus.Available, label: 'متاح' },
    { value: DatabaseResourceStatus.Reserved, label: 'محجوز' },
    { value: DatabaseResourceStatus.Provisioning, label: 'جارٍ التجهيز' },
    { value: DatabaseResourceStatus.Assigned, label: 'مخصص' },
    { value: DatabaseResourceStatus.Maintenance, label: 'صيانة / معطل' },
    { value: DatabaseResourceStatus.RestorePending, label: 'بانتظار الاستعادة' },
    { value: DatabaseResourceStatus.Faulted, label: 'متعطل / فاشل' },
    { value: DatabaseResourceStatus.Retired, label: 'متقاعد' },
  ];

  ngOnInit(): void { this.load(); }

  load(
    page = this.page,
    pageSize = this.pageSize,
    status = this.statusFilter(),
    tenantId = this.tenantIdFilter().trim() || null,
  ): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.page = page;
    this.pageSize = pageSize;
    this.service.list(page, pageSize, status, tenantId).subscribe({
      next: result => {
        this.rows.set(result.items ?? []);
        this.totalCount = result.totalCount ?? 0;
        this.page = result.page ?? page;
        this.pageSize = result.pageSize ?? pageSize;
        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);
        this.loadError.set(errMsg(error));
        this.notify.error(errMsg(error));
      },
    });
  }

  onPageChange(change: PageChange): void { this.load(change.page, change.pageSize); }

  selectStatus(value: DatabaseResourceStatus | string | null): void {
    this.statusFilter.set(value === null || value === '' ? null : Number(value) as DatabaseResourceStatus);
  }

  applyFilters(): void {
    const tenantId = this.tenantIdFilter().trim();
    if (tenantId && !this.isGuid(tenantId)) {
      this.notify.error('يجب أن يكون معرّف مساحة العمل GUID صالحًا.');
      return;
    }
    this.load(1, this.pageSize, this.statusFilter(), tenantId || null);
  }

  clearFilters(): void {
    this.statusFilter.set(null);
    this.tenantIdFilter.set('');
    this.load(1, this.pageSize, null, null);
  }

  hasFilters(): boolean { return this.statusFilter() !== null || !!this.tenantIdFilter().trim(); }

  openRegister(): void {
    this.editingId = null;
    this.repairMode = false;
    this.repairAllocated = false;
    this.editor = this.emptyEditor();
    this.lastTest.set(null);
    this.dialogVisible = true;
  }

  openRepair(row: DatabaseResource): void {
    if (!this.canRepair(row)) return;
    const allocated = this.isAllocated(row);
    void this.notify.confirm({
      header: allocated ? 'هل تريد إصلاح الاتصال المخصص؟' : 'هل تريد إصلاح اتصال المورد؟',
      message: allocated
        ? `سيُختبر الاتصال الجديد ويُطبق على ${row.resourceCode || this.shortId(row.id)} وربطه النشط بمساحة العمل.`
        : `سيُختبر الاتصال الجديد ويعود ${row.resourceCode || this.shortId(row.id)} إلى حالة «متاح».`,
      acceptLabel: 'متابعة',
      rejectLabel: 'إلغاء',
      danger: true,
      icon: 'pi pi-wrench',
    }).then(confirmed => {
      if (!confirmed) return;
      this.editingId = row.id;
      this.repairMode = true;
      this.repairAllocated = allocated;
      this.editor = this.emptyEditor(row.provider);
      this.lastTest.set(null);
      this.dialogVisible = true;
    });
  }

  closeDialog(): void {
    this.dialogVisible = false;
    this.editor.connectionString = '';
    this.repairMode = false;
    this.repairAllocated = false;
  }

  testConnection(): void {
    if (this.testing() || this.repairMode || !this.editor.databaseName.trim() || !this.editor.connectionString.trim()) return;
    this.testing.set(true);
    this.lastTest.set(null);
    this.service.testConnection(this.editor.databaseName.trim(), this.editor.connectionString.trim()).subscribe({
      next: result => {
        this.testing.set(false);
        this.lastTest.set(result);
        result.succeeded ? this.notify.success('نجح اختبار الاتصال.') : this.notify.error(this.connectionTestMessage(result));
      },
      error: error => { this.testing.set(false); this.notify.error(errMsg(error)); },
    });
  }

  testStoredConnection(row: DatabaseResource): void {
    if (!this.startBusy(row.id, 'test')) return;
    this.service.testStoredConnection(row.id).subscribe({
      next: result => {
        this.finishBusy();
        result.succeeded
          ? this.notify.success(`${this.connectionTestMessage(result)}${result.durationMs ? ` (${result.durationMs}ms)` : ''}`)
          : this.notify.error(this.connectionTestMessage(result));
        this.load();
      },
      error: error => { this.finishBusy(); this.notify.error(errMsg(error)); this.load(); },
    });
  }

  save(): void {
    if (this.saving() || this.registering()) return;
    if (this.repairMode && this.editingId) {
      if (!this.editor.connectionString.trim()) {
        this.notify.error('أدخل سلسلة اتصال جديدة للإصلاح.');
        return;
      }
      this.saving.set(true);
      this.service.repairConnection(this.editingId, this.editor.connectionString.trim()).subscribe({
        next: result => {
          this.saving.set(false);
          this.notify.success(result.message);
          this.closeDialog();
          this.load();
        },
        error: error => { this.saving.set(false); this.notify.error(errMsg(error)); },
      });
      return;
    }

    if (!this.editor.provider.trim() || !this.editor.databaseName.trim() || !this.editor.connectionString.trim()) {
      this.notify.error('المزود واسم قاعدة البيانات وسلسلة الاتصال حقول مطلوبة.');
      return;
    }
    const command: RegisterDatabaseResourceCommand = {
      provider: this.editor.provider.trim(),
      databaseName: this.editor.databaseName.trim(),
      serverKey: this.editor.serverKey.trim() || undefined,
      connectionString: this.editor.connectionString.trim(),
    };
    this.registering.set(true);
    this.service.register(command).subscribe({
      next: () => {
        this.registering.set(false);
        this.notify.success('تم تسجيل مورد قاعدة البيانات بأمان.');
        this.closeDialog();
        this.load();
      },
      error: error => { this.registering.set(false); this.notify.error(errMsg(error)); },
    });
  }

  deleteResource(row: DatabaseResource): void {
    if (!row.canDelete || !this.startBusy(row.id, 'delete')) return;
    void this.notify.confirm({
      header: 'هل تريد حذف مورد قاعدة البيانات نهائيًا؟',
      message: `سيُحذف المورد «${row.databaseName || row.resourceCode || this.shortId(row.id)}» وسلسلة الاتصال المحمية من قاعدة المنصة. لا يمكن التراجع عن هذا الإجراء.`,
      acceptLabel: 'حذف نهائي',
      rejectLabel: 'إلغاء',
      danger: true,
      icon: 'pi pi-trash',
    }).then(confirmed => {
      if (!confirmed) { this.finishBusy(); return; }
      this.service.delete(row.id).subscribe({
        next: () => { this.finishBusy(); this.notify.success('تم حذف مورد قاعدة البيانات نهائيًا.'); this.load(); },
        error: error => { this.finishBusy(); this.notify.error(errMsg(error)); this.load(); },
      });
    }).catch(() => this.finishBusy());
  }

  runMigrations(row: DatabaseResource): void {
    if (!this.canRunMigrations(row) || !this.startBusy(row.id, 'migrations')) return;
    void this.notify.confirm({
      header: 'هل تريد تشغيل الترحيلات وفحص الصحة؟',
      message: `سيشغل الخادم ترحيلات مساحة العمل واختبار CanConnect للمورد ${row.resourceCode || this.shortId(row.id)}.`,
      acceptLabel: 'تشغيل الترحيلات',
      rejectLabel: 'إلغاء',
    }).then(confirmed => {
      if (!confirmed) { this.finishBusy(); return; }
      this.service.runMigrations(row.id).subscribe({
        next: result => { this.finishBusy(); this.notify.success(result.message); this.load(); },
        error: error => { this.finishBusy(); this.notify.error(errMsg(error)); this.load(); },
      });
    }).catch(() => this.finishBusy());
  }

  createBackup(row: DatabaseResource): void {
    if (!this.isAllocated(row) || !this.startBusy(row.id, 'backup')) return;
    void this.notify.confirm({
      header: 'هل تريد إنشاء نسخة لهذه المساحة؟',
      message: `سيحدد الخادم دفعة النسخ المحمية وينشئها لمساحة العمل ${row.tenantName || 'المخصصة'}.`,
      acceptLabel: 'إنشاء النسخة',
      rejectLabel: 'إلغاء',
    }).then(confirmed => {
      if (!confirmed) { this.finishBusy(); return; }
      this.service.createBackup(row.id).subscribe({
        next: () => { this.finishBusy(); this.notify.success('اكتمل طلب النسخ الاحتياطي. راجع مركز النسخ الاحتياطية لمراجعة البصمة وملفات الأدلة.'); this.load(); },
        error: error => { this.finishBusy(); this.notify.error(errMsg(error)); this.load(); },
      });
    }).catch(() => this.finishBusy());
  }

  setStatus(row: DatabaseResource, status: 'Available' | 'Disabled'): void {
    if (!this.startBusy(row.id, 'status')) return;
    const enabling = status === 'Available';
    void this.notify.confirm({
      header: enabling ? 'هل تريد تفعيل المورد؟' : 'هل تريد تعطيل المورد؟',
      message: enabling
        ? `هل تسمح باختيار ${row.resourceCode || this.shortId(row.id)} لمساحة عمل جديدة؟`
        : `هل تمنع اختيار ${row.resourceCode || this.shortId(row.id)} لمساحة عمل جديدة؟`,
      acceptLabel: enabling ? 'تفعيل' : 'تعطيل',
      rejectLabel: 'إلغاء',
      danger: !enabling,
    }).then(confirmed => {
      if (!confirmed) { this.finishBusy(); return; }
      this.service.setStatus(row.id, status).subscribe({
        next: updated => { this.finishBusy(); this.replace(updated); this.notify.success(`تم تغيير حالة المورد إلى «${enabling ? 'متاح' : 'معطل'}».`); },
        error: error => { this.finishBusy(); this.notify.error(errMsg(error)); this.load(); },
      });
    }).catch(() => this.finishBusy());
  }

  lifecycleLabel(row: DatabaseResource): string {
    return row.lifecycleStatus || this.statusLabel(row.status);
  }

  lifecycleText(row: DatabaseResource): string {
    switch (this.lifecycleLabel(row)) {
      case 'Available': return 'متاح';
      case 'Allocated': return 'مخصص';
      case 'Provisioning': return 'جارٍ التجهيز';
      case 'RestorePending': return 'بانتظار الاستعادة';
      case 'Failed': return 'فاشل';
      case 'Disabled': return 'معطل';
      default: return 'غير معروف';
    }
  }

  statusClass(row: DatabaseResource): string {
    const status = this.lifecycleLabel(row);
    if (status === 'Available') return 'lf-badge-green';
    if (status === 'Allocated') return 'lf-badge-blue';
    if (['Provisioning', 'RestorePending'].includes(status)) return 'lf-badge-yellow';
    if (['Failed', 'Disabled'].includes(status)) return 'lf-badge-red';
    return 'lf-badge-gray';
  }

  canRepair(row: DatabaseResource): boolean {
    const lifecycle = this.lifecycleLabel(row);
    return ['Available', 'Allocated', 'Failed'].includes(lifecycle)
      || (lifecycle === 'Disabled' && row.status === DatabaseResourceStatus.Maintenance);
  }

  canRunMigrations(row: DatabaseResource): boolean {
    return row.hasProtectedConnection && ['Available', 'Allocated', 'Failed', 'Provisioning'].includes(this.lifecycleLabel(row));
  }

  isAllocated(row: DatabaseResource): boolean { return this.lifecycleLabel(row) === 'Allocated'; }

  canDisable(row: DatabaseResource): boolean { return ['Available', 'Failed'].includes(this.lifecycleLabel(row)); }

  isDisabled(row: DatabaseResource): boolean { return this.lifecycleLabel(row) === 'Disabled'; }

  provisioningLabel(row: DatabaseResource): string {
    if (row.provisioningError || row.lastError) return 'فشل';
    if (row.provisioningStatus === null || row.provisioningStatus === undefined) return 'لم يبدأ';
    switch (String(row.provisioningStatus)) {
      case '1': return 'قيد الانتظار';
      case '2': return 'بانتظار سعة قاعدة بيانات';
      case '3': return 'جارٍ التجهيز';
      case '4': return 'اكتمل';
      case '5': return 'فشل';
      case 'Pending': return 'قيد الانتظار';
      case 'AwaitingDatabaseCapacity': return 'بانتظار سعة قاعدة بيانات';
      case 'Provisioning': return 'جارٍ التجهيز';
      case 'Completed': return 'اكتمل';
      case 'Failed': return 'فشل';
      default: return String(row.provisioningStatus);
    }
  }

  workspaceLabel(workspaceType: number | string | null): string {
    if (workspaceType === 'FreelanceCoach' || workspaceType === 2 || workspaceType === '2') return 'مساحة مدرب حر';
    if (workspaceType === 'Gym' || workspaceType === 1 || workspaceType === '1') return 'مساحة جيم';
    return 'مساحة العمل المخصصة';
  }

  providerLabel(provider: string): string {
    if (provider === 'ManualMonster') return 'Monster يدوي';
    if (provider === 'LocalSql') return 'SQL محلي';
    return provider;
  }

  backupStatusLabel(status: string | number | null | undefined): string {
    switch (status) {
      case 3: return 'مكتملة';
      case 2: return 'قيد التنفيذ';
      case 4: return 'مكتملة جزئيًا';
      case 5: return 'فاشلة';
      case 1: return 'قيد الانتظار';
      case 'Completed': return 'مكتملة';
      case 'Running': return 'قيد التنفيذ';
      case 'Partial': return 'مكتملة جزئيًا';
      case 'Failed': return 'فاشلة';
      case 'Pending': return 'قيد الانتظار';
      case 'Queued': return 'في قائمة الانتظار';
      case null:
      case undefined:
      case '': return 'لا توجد نسخة بعد';
      default: return String(status);
    }
  }

  errorLabel(error: string | null | undefined): string {
    if (!error) return '';
    switch (error) {
      case 'DATABASE_CONNECTION_NOT_CONFIGURED': return 'لم يتم إعداد اتصال قاعدة البيانات.';
      case 'DATABASE_CONNECTION_STRING_REQUIRED': return 'سلسلة الاتصال مطلوبة.';
      case 'DATABASE_CONNECTION_REPAIR_CONFIRMATION_REQUIRED': return 'يجب تأكيد استبدال اتصال قاعدة البيانات.';
      case 'DATABASE_CONNECTION_FAILED': return 'فشل الاتصال بقاعدة البيانات.';
      case 'DATABASE_HEALTH_CHECK_FAILED': return 'فشل فحص صحة قاعدة البيانات.';
      case 'TENANT_DATABASE_HEALTH_CHECK_FAILED': return 'فشل فحص صحة قاعدة بيانات مساحة العمل.';
      case 'DATABASE_RESOURCE_UNAVAILABLE': return 'مورد قاعدة البيانات غير متاح.';
      case 'DATABASE_CAPACITY_UNAVAILABLE': return 'لا توجد سعة متاحة في Pool قواعد البيانات.';
      case 'PROVISIONING_FAILED': return 'فشل تجهيز قاعدة البيانات.';
      case 'DATABASE_CONNECTION_STRING_INVALID': return 'صيغة سلسلة الاتصال غير صحيحة.';
      case 'DATABASE_CONNECTION_SERVER_REQUIRED': return 'لم يتم تحديد خادم قاعدة البيانات.';
      case 'DATABASE_CONNECTION_TIMEOUT': return 'انتهت مهلة الاتصال؛ تحقق من الخادم والمنفذ.';
      case 'DATABASE_AUTHENTICATION_FAILED': return 'فشل التحقق من بيانات دخول قاعدة البيانات.';
      case 'DATABASE_NOT_FOUND': return 'قاعدة البيانات المطلوبة غير موجودة أو غير متاحة.';
      case 'DATABASE_CONNECTION_REFUSED': return 'تعذر الوصول إلى خادم قاعدة البيانات.';
      case 'DATABASE_TLS_FAILED': return 'فشل الاتصال الآمن؛ تحقق من إعدادات الشهادة.';
      case 'DATABASE_CONNECTION_UNPROTECT_FAILED': return 'تعذر قراءة الاتصال المحمي على الخادم.';
      case 'TENANT_MIGRATION_FAILED': return 'فشلت الترحيلات أو فحص صحة قاعدة البيانات.';
      case 'DATABASE_RESOURCE_RESERVED': return 'المورد محجوز أو قيد الاستخدام.';
      case 'DATABASE_RESOURCE_ASSIGNED': return 'المورد مرتبط بمساحة عمل.';
      case 'DATABASE_RESOURCE_PROVISIONING': return 'المورد مرتبط بعملية تجهيز نشطة.';
      case 'DATABASE_RESOURCE_RESTORE_ACTIVE': return 'المورد مرتبط بعملية استعادة نشطة.';
      case 'DATABASE_RESOURCE_HAS_BACKUPS': return 'للمورد نسخ احتياطية محفوظة؛ الحذف محمي.';
      case 'DATABASE_RESOURCE_NOT_ASSIGNED': return 'لا يمكن إنشاء نسخة قبل تخصيص المورد لمساحة عمل جاهزة.';
      case 'BACKUP_SERVICE_UNAVAILABLE': return 'خدمة النسخ الاحتياطي غير جاهزة حاليًا.';
      default: return error;
    }
  }

  connectionTestMessage(result: ConnectionTestResult): string {
    if (result.succeeded) return 'نجح اختبار الاتصال.';
    return this.errorLabel(result.errorCode) || result.message || 'فشل اختبار الاتصال.';
  }

  statusLabel(status: DatabaseResourceStatus): DatabaseResourceLifecycleStatus {
    return {
      [DatabaseResourceStatus.Available]: 'Available',
      [DatabaseResourceStatus.Reserved]: 'Provisioning',
      [DatabaseResourceStatus.Provisioning]: 'Provisioning',
      [DatabaseResourceStatus.Assigned]: 'Allocated',
      [DatabaseResourceStatus.Maintenance]: 'Disabled',
      [DatabaseResourceStatus.RestorePending]: 'RestorePending',
      [DatabaseResourceStatus.Faulted]: 'Failed',
      [DatabaseResourceStatus.Retired]: 'Disabled',
    }[status] || 'Unknown';
  }

  shortId(id: string): string { return id.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id; }

  formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'تاريخ غير صالح' : date.toLocaleString();
  }

  private emptyEditor(provider = 'ManualMonster'): ResourceEditor {
    return { provider, databaseName: '', serverKey: '', connectionString: '' };
  }

  private count(status: DatabaseResourceLifecycleStatus): number {
    return this.rows().filter(row => this.lifecycleLabel(row) === status).length;
  }

  private isGuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }

  private startBusy(id: string, action: string): boolean {
    if (this.busyId()) return false;
    this.busyId.set(id);
    this.busyAction.set(action);
    return true;
  }

  private finishBusy(): void {
    this.busyId.set(null);
    this.busyAction.set(null);
  }

  private replace(updated: DatabaseResource): void {
    this.rows.update(rows => rows.map(row => row.id === updated.id ? updated : row));
  }
}
