import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import {
  BackupsService,
  BackupArtifact,
  BackupBatch,
  BackupRecord,
  BackupScope,
  BackupStatus,
  RestoreCapabilities,
} from './backups.service';
import { ADMIN_ASSISTANT_COMMAND_EVENT } from '../../shared/assistant/admin-assistant.service';

@Component({
  selector: 'app-backups', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TableModule, ButtonModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <app-page-header title="مركز النسخ الاحتياطي" subtitle="حماية قاعدة بيانات المنصة واستعادة الأعمال بثقة." icon="pi pi-database"></app-page-header>

    <section class="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-2xl shadow-indigo-950/20" aria-live="polite">
      <div class="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl"></div>

      <ng-container *ngIf="status() as backupStatus; else statusPending">
        <div class="relative flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
          <div class="max-w-2xl">
            <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              <span class="h-2 w-2 rounded-full" [class.bg-emerald-400]="backupStatus.isReady" [class.bg-amber-300]="!backupStatus.isReady"></span>
              {{ backupStatus.isReady ? 'الحماية مفعّلة وجاهزة' : 'تحتاج إعدادًا قبل التشغيل' }}
            </div>
            <h2 class="m-0 text-2xl font-black tracking-tight sm:text-3xl">{{ backupStatus.isReady ? 'بياناتك تحت السيطرة.' : 'خدمة النسخ الاحتياطي غير جاهزة.' }}</h2>
            <p class="mb-0 mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">{{ backupStatus.isReady ? 'يتم حفظ نسخة قابلة للاستعادة من البنية والبيانات الفعلية في مساحة خاصة، مع تنظيف تلقائي للنسخ القديمة.' : backupStatus.unavailableReason }}</p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row xl:flex-col">
            <label class="flex min-w-64 flex-col gap-1 text-xs font-semibold text-slate-200">
              Coverage scope
              <select [value]="selectedScope()" (change)="selectScope($any($event.target).value)"
                class="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-300">
                <option *ngFor="let option of scopeOptions" [value]="option.value">{{ option.label }}</option>
              </select>
            </label>
            <button pButton type="button" label="إنشاء نسخة الآن" icon="pi pi-shield" [loading]="creating()"
              [disabled]="!backupStatus.isReady" (click)="create()"
              class="!border-0 !bg-white !px-5 !py-3 !font-bold !text-slate-950 hover:!bg-cyan-50 disabled:!opacity-50"></button>
            <button pButton type="button" label="تحديث الحالة" icon="pi pi-refresh" [loading]="refreshing()" (click)="refresh()"
              class="!border-white/20 !bg-white/10 !px-5 !py-3 !font-semibold !text-white hover:!bg-white/20"></button>
          </div>
        </div>

        <div class="relative mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm"><p class="m-0 text-xs text-slate-400">صيغة الاستعادة</p><p class="mb-0 mt-2 text-lg font-extrabold">{{ backupStatus.format }}</p><span class="text-xs text-cyan-200">Schema + Data</span></div>
          <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm"><p class="m-0 text-xs text-slate-400">فترة الاحتفاظ</p><p class="mb-0 mt-2 text-lg font-extrabold">{{ backupStatus.retentionDays }} أيام</p><span class="text-xs text-slate-300">تنظيف تلقائي</span></div>
          <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm"><p class="m-0 text-xs text-slate-400">النسخ المتاحة</p><p class="mb-0 mt-2 text-lg font-extrabold">{{ backupStatus.backupCount }}</p><span class="text-xs text-slate-300">ملف خاص وآمن</span></div>
          <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm"><p class="m-0 text-xs text-slate-400">الجدولة اليومية</p><p class="mb-0 mt-2 text-lg font-extrabold">{{ backupStatus.runAtUtc }} <span class="text-xs font-medium text-slate-300">UTC</span></p><span class="text-xs text-slate-300">وقت خادم موحّد</span></div>
        </div>
      </ng-container>
      <ng-template #statusPending>
        <div class="relative flex min-h-48 items-center gap-3 text-slate-200"><i class="pi pi-spin pi-spinner text-xl text-cyan-300"></i><span>جارٍ التحقق من جاهزية النسخ الاحتياطي…</span></div>
      </ng-template>
    </section>

    <section class="mb-6 grid gap-4 lg:grid-cols-3">
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><i class="pi pi-lock"></i></div><h3 class="m-0 text-sm font-bold text-slate-900">تخزين خاص</h3><p class="mb-0 mt-2 text-sm leading-6 text-slate-500">لا تظهر ملفات النسخ كروابط عامة. يتطلب التنزيل جلسة إدارة مصرح بها.</p></article>
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><i class="pi pi-history"></i></div><h3 class="m-0 text-sm font-bold text-slate-900">احتفاظ منضبط</h3><p class="mb-0 mt-2 text-sm leading-6 text-slate-500">تظل أحدث النسخ متاحة لمدة {{ status()?.retentionDays ?? 7 }} أيام ثم تُحذف تلقائيًا.</p></article>
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><i class="pi pi-info-circle"></i></div><h3 class="m-0 text-sm font-bold text-slate-900">استعادة مدروسة</h3><p class="mb-0 mt-2 text-sm leading-6 text-slate-500">احتفظ بالملف في مكان آمن، ونفّذ الاستعادة على قاعدة هدف مراجَعة فقط.</p></article>
    </section>

    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 class="m-0 text-lg font-extrabold text-slate-900">سجل النسخ المكتملة</h2><p class="mb-0 mt-1 text-sm text-slate-500">يمكن تنزيل أي نسخة مكتملة عبر اتصال إداري موثق.</p></div>
        <span class="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"><i class="pi pi-folder"></i>{{ totalCount }} ملف</span>
      </div>

      <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm">
        <ng-template pTemplate="header"><tr><th>ملف النسخة</th><th>وقت الإنشاء</th><th>الحجم</th><th>الحالة</th><th class="text-left">الإجراء</th></tr></ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td><div class="flex items-center gap-3"><span class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><i class="pi pi-file"></i></span><div><code class="text-xs font-semibold text-slate-700">{{ row.fileName }}</code><p class="m-0 mt-1 text-[11px] text-slate-400">BACPAC • قاعدة بيانات كاملة</p></div></div></td>
            <td><span class="text-sm font-medium text-slate-700">{{ row.createdAt | date:'medium' }}</span></td>
            <td><span class="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{{ formatBytes(row.sizeBytes) }}</span></td>
            <td><span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><i class="pi pi-check-circle text-[10px]"></i>{{ row.status === 'Completed' ? 'مكتملة' : row.status }}</span></td>
            <td class="text-left"><button pButton type="button" label="تنزيل آمن" icon="pi pi-download" [loading]="downloadingFile() === row.fileName" (click)="download(row)" class="!border-indigo-100 !bg-indigo-50 !text-indigo-700 hover:!bg-indigo-100"></button></td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage"><tr><td colspan="5" class="py-14 text-center"><i class="pi pi-inbox mb-3 block text-3xl text-slate-300"></i><p class="m-0 font-bold text-slate-600">لا توجد نسخ مكتملة حتى الآن</p><p class="mb-0 mt-1 text-sm text-slate-400">أنشئ أول نسخة يدوية بعد التأكد من جاهزية الخدمة.</p></td></tr></ng-template>
      </p-table>
      <app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator>
    </section>

    <section class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="m-0 text-lg font-extrabold text-slate-900">Backup batches</h2>
          <p class="mb-0 mt-1 text-sm text-slate-500">Each batch keeps one independent artifact per resolved platform or tenant database.</p>
        </div>
        <span class="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
          <i class="pi pi-sitemap"></i>{{ batches().length }} batches
        </span>
      </div>

      <div *ngIf="batchLoading()" class="flex items-center gap-2 px-5 py-8 text-sm text-slate-500">
        <i class="pi pi-spin pi-spinner text-indigo-500"></i>Loading batch history...
      </div>
      <div *ngIf="!batchLoading() && batches().length === 0" class="px-5 py-10 text-center text-sm text-slate-500">
        No batch history is available yet.
      </div>

      <div *ngFor="let batch of batches()" class="border-b border-slate-100 px-5 py-5 last:border-b-0">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{{ scopeLabel(batch.scope) }}</span>
              <span class="rounded-full px-2.5 py-1 text-xs font-bold" [class.bg-emerald-50]="batch.status === 'Completed'" [class.text-emerald-700]="batch.status === 'Completed'" [class.bg-amber-50]="batch.status === 'Partial' || batch.status === 'Running'" [class.text-amber-700]="batch.status === 'Partial' || batch.status === 'Running'" [class.bg-red-50]="batch.status === 'Failed'" [class.text-red-700]="batch.status === 'Failed'">{{ batch.status }}</span>
              <span class="text-xs text-slate-400">{{ completedCount(batch) }}/{{ batch.artifacts.length }} targets completed</span>
            </div>
            <p class="mb-0 mt-2 text-xs text-slate-500">Started {{ batch.startedAtUtc | date:'medium' }} <span *ngIf="batch.completedAtUtc">· finished {{ batch.completedAtUtc | date:'medium' }}</span></p>
            <p class="mb-0 mt-1 font-mono text-[11px] text-slate-400">Batch {{ batch.id }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button *ngIf="batch.manifestStorageKey" pButton type="button" label="Download manifest" icon="pi pi-file-export" [loading]="downloadingFile() === batch.manifestStorageKey" (click)="downloadManifest(batch)" class="!border-slate-200 !bg-slate-50 !text-slate-700 hover:!bg-slate-100"></button>
            <button *ngIf="isRetryable(batch)" pButton type="button" label="Retry failed batch" icon="pi pi-refresh" [loading]="batchAction() === batch.id" (click)="retry(batch)" class="!border-amber-200 !bg-amber-50 !text-amber-800 hover:!bg-amber-100"></button>
          </div>
        </div>

        <div class="mt-4 grid gap-3 xl:grid-cols-2">
          <article *ngFor="let artifact of batch.artifacts" class="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="m-0 text-sm font-bold text-slate-800">{{ artifactLabel(artifact) }}</p>
                <p class="mb-0 mt-1 text-xs text-slate-500">{{ artifact.status }} · {{ formatBytes(artifact.sizeBytes) }}</p>
              </div>
              <button *ngIf="artifact.storageKey" pButton type="button" icon="pi pi-download" [attr.aria-label]="'Download ' + artifactLabel(artifact)" [loading]="downloadingFile() === artifact.storageKey" (click)="downloadArtifact(artifact)" class="!h-8 !w-8 !border-indigo-100 !bg-indigo-50 !text-indigo-700 hover:!bg-indigo-100"></button>
            </div>
            <div class="mt-3 rounded-lg bg-white p-3 text-xs text-slate-500">
              <span class="font-semibold text-slate-700">SHA-256:</span>
              <code class="ml-1 break-all text-[11px]">{{ artifact.sha256 || 'not available' }}</code>
            </div>
            <p *ngIf="artifact.errorCode" class="mb-0 mt-2 text-xs font-semibold text-red-700">Failure: {{ artifact.errorCode }}</p>
          </article>
        </div>
      </div>

      <div class="border-t border-slate-100 bg-slate-50/60 px-5 py-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 class="m-0 text-sm font-extrabold text-slate-900">Restore capability</h3>
            <p class="mb-0 mt-1 text-sm text-slate-500">Restore remains provider-controlled and is never started from this read-only evidence view.</p>
          </div>
          <ng-container *ngIf="restoreCapabilities() as capabilities; else restorePending">
            <span class="rounded-full px-3 py-1.5 text-xs font-bold" [class.bg-emerald-50]="capabilities.enabled" [class.text-emerald-700]="capabilities.enabled" [class.bg-amber-50]="!capabilities.enabled" [class.text-amber-700]="!capabilities.enabled">{{ capabilities.mode }}</span>
          </ng-container>
          <ng-template #restorePending><span class="text-xs font-semibold text-slate-400">Checking provider...</span></ng-template>
        </div>
        <p *ngIf="restoreCapabilities() as capabilities" class="mb-0 mt-3 text-xs text-slate-500">{{ capabilities.enabled ? 'BACPAC import and mapping switch are enabled by the provider.' : (capabilities.unavailableReason || 'Direct restore is not enabled for this provider.') }} Batch start and finish events are recorded by the server audit log.</p>
      </div>
    </section>
  `,
})
export class BackupsComponent implements OnInit {
  @HostListener(`window:${ADMIN_ASSISTANT_COMMAND_EVENT}`, ['$event'])
  onAssistantCommand(event: Event): void {
    if ((event as CustomEvent<{ command?: string }>).detail?.command === 'create-backup') this.create();
  }

  private service = inject(BackupsService); private notify = inject(NotifyService);
  rows = signal<BackupRecord[]>([]); loading = signal(false); creating = signal(false); refreshing = signal(false);
  page = 1; pageSize = 20; totalCount = 0;
  downloadingFile = signal<string | null>(null); status = signal<BackupStatus | null>(null);
  batches = signal<BackupBatch[]>([]); batchLoading = signal(false); batchAction = signal<string | null>(null);
  restoreCapabilities = signal<RestoreCapabilities | null>(null);
  selectedScope = signal<BackupScope>(BackupScope.FullSystem);
  scopeOptions = [
    { value: BackupScope.FullSystem, label: 'Full system (platform + all active tenants)' },
    { value: BackupScope.AllTenants, label: 'All active tenant databases' },
    { value: BackupScope.AllGyms, label: 'All active gym databases' },
    { value: BackupScope.AllFreelance, label: 'All active freelance databases' },
    { value: BackupScope.Platform, label: 'Platform database only' },
  ];

  ngOnInit(): void { this.loadStatus(); }

  refresh(): void { this.refreshing.set(true); this.loadStatus(); }

  loadStatus(): void {
    this.service.status().subscribe({
      next: status => { this.status.set(status); this.refreshing.set(false); this.load(); this.loadBatches(); this.loadRestoreCapabilities(); },
      error: () => {
        this.status.set({ isEnabled: false, isReady: false, format: 'BACPAC', retentionDays: 7, runAtUtc: '--:--', backupCount: 0, unavailableReason: 'لا يدعم إصدار الخادم الحالي فحص جاهزية النسخ. انشر تحديث النسخ الاحتياطي أولًا.' });
        this.refreshing.set(false); this.load(); this.loadBatches(); this.loadRestoreCapabilities();
      },
    });
  }

  loadBatches(): void {
    this.batchLoading.set(true);
    this.service.listBatches().subscribe({
      next: batches => { this.batches.set(batches); this.batchLoading.set(false); },
      error: error => { this.notify.error(errMsg(error)); this.batchLoading.set(false); },
    });
  }

  loadRestoreCapabilities(): void {
    this.service.restoreCapabilities().subscribe({
      next: capabilities => this.restoreCapabilities.set(capabilities),
      error: () => this.restoreCapabilities.set(null),
    });
  }

  selectScope(value: string): void {
    const scope = Number(value) as BackupScope;
    if (this.scopeOptions.some(option => option.value === scope)) this.selectedScope.set(scope);
  }

  load(): void {
    this.loading.set(true);
    this.service.list(this.page, this.pageSize).subscribe({
      next: response => { this.rows.set(response.items); this.totalCount = response.totalCount; this.loading.set(false); },
      error: error => { this.notify.error(errMsg(error)); this.loading.set(false); },
    });
  }

  onPageChange(event: { page: number; pageSize: number }): void { this.page = event.page; this.pageSize = event.pageSize; this.load(); }

  async create(): Promise<void> {
    const status = this.status();
    const confirmed = await this.notify.confirm({
      header: 'إنشاء نسخة احتياطية',
      message: 'سيتم إنشاء ملف BACPAC جديد يحوي بنية قاعدة البيانات وبياناتها الحالية. قد تستغرق العملية عدة دقائق.',
      acceptLabel: 'إنشاء النسخة',
    });
    if (!confirmed) return;
    if (!status?.isReady) { this.notify.error(status?.unavailableReason ?? 'خدمة النسخ الاحتياطي غير جاهزة.'); return; }
    this.creating.set(true);
    this.service.createBatch({ scope: this.selectedScope() }).subscribe({
      next: backup => { this.batches.update(batches => [backup, ...batches]); this.notify.success('تم إنشاء النسخة الاحتياطية بنجاح.'); this.creating.set(false); this.loadStatus(); },
      error: error => { this.notify.error(errMsg(error)); this.creating.set(false); this.loadStatus(); },
    });
  }

  scopeLabel(scope: BackupScope): string {
    switch (Number(scope)) {
      case BackupScope.FullSystem: return 'Full system';
      case BackupScope.AllTenants: return 'All tenants';
      case BackupScope.AllGyms: return 'All gyms';
      case BackupScope.AllFreelance: return 'All freelance';
      case BackupScope.SelectedTenants: return 'Selected tenants';
      case BackupScope.Platform: return 'Platform';
      default: return 'Unknown scope';
    }
  }

  completedCount(batch: BackupBatch): number {
    return batch.artifacts.filter(artifact => artifact.status === 'Completed').length;
  }

  isRetryable(batch: BackupBatch): boolean {
    return batch.status === 'Failed' || batch.status === 'Partial';
  }

  artifactLabel(artifact: BackupArtifact): string {
    return artifact.tenantId ? `Tenant ${artifact.tenantId.slice(0, 8)}` : 'Platform database';
  }

  async retry(batch: BackupBatch): Promise<void> {
    const confirmed = await this.notify.confirm({
      header: 'Retry backup batch',
      message: 'The server will create a new attempt for the failed or partial targets only.',
      acceptLabel: 'Retry',
    });
    if (!confirmed) return;
    this.batchAction.set(batch.id);
    this.service.retryBatch(batch.id).subscribe({
      next: result => {
        this.batches.update(batches => batches.map(item => item.id === batch.id ? result : item));
        this.notify.success('A new backup attempt was created.');
        this.batchAction.set(null);
        this.loadStatus();
      },
      error: error => { this.notify.error(errMsg(error)); this.batchAction.set(null); this.loadBatches(); },
    });
  }

  downloadArtifact(artifact: BackupArtifact): void {
    if (artifact.storageKey) this.downloadFile(artifact.storageKey);
  }

  downloadManifest(batch: BackupBatch): void {
    if (batch.manifestStorageKey) this.downloadFile(batch.manifestStorageKey);
  }

  download(backup: BackupRecord): void {
    this.downloadingFile.set(backup.fileName);
    this.service.download(backup.fileName).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url; anchor.download = backup.fileName; anchor.click();
        URL.revokeObjectURL(url);
        this.notify.success('بدأ تنزيل النسخة الاحتياطية.');
        this.downloadingFile.set(null);
      },
      error: error => { this.notify.error(errMsg(error)); this.downloadingFile.set(null); },
    });
  }

  downloadFile(fileName: string): void {
    this.downloadingFile.set(fileName);
    this.service.download(fileName).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url; anchor.download = fileName; anchor.click();
        URL.revokeObjectURL(url);
        this.notify.success('Download started.');
        this.downloadingFile.set(null);
      },
      error: error => { this.notify.error(errMsg(error)); this.downloadingFile.set(null); },
    });
  }

  formatBytes(value: number): string {
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }
}
