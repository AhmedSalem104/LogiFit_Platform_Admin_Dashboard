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
  selector: 'app-backups',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TableModule, ButtonModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <app-page-header
      title="Backup Center"
      subtitle="Create, verify, and securely download platform backup evidence."
      icon="pi pi-database">
    </app-page-header>

    <section
      class="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-2xl shadow-indigo-950/20"
      aria-live="polite">
      <div class="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl"></div>

      <ng-container *ngIf="status() as backupStatus; else statusPending">
        <div class="relative flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
          <div class="max-w-2xl">
            <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              <span
                class="h-2 w-2 rounded-full"
                [class.bg-emerald-400]="backupStatus.isReady"
                [class.bg-amber-300]="!backupStatus.isReady"></span>
              {{ readinessLabel(backupStatus) }}
            </div>
            <h2 class="m-0 text-2xl font-black tracking-tight sm:text-3xl">{{ readinessTitle(backupStatus) }}</h2>
            <p class="mb-0 mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              {{ readinessMessage(backupStatus) }}
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row xl:flex-col">
            <label for="backup-scope" class="flex min-w-64 flex-col gap-1 text-xs font-semibold text-slate-200">
              Backup scope
              <select
                id="backup-scope"
                [value]="selectedScope()"
                (change)="selectScope($any($event.target).value)"
                class="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-300">
                <option *ngFor="let option of scopeOptions" [value]="option.value">{{ option.label }}</option>
              </select>
            </label>
            <p class="m-0 max-w-xs text-xs leading-5 text-slate-300">{{ scopeDescription(selectedScope()) }}</p>
            <button
              pButton
              type="button"
              label="Create backup"
              icon="pi pi-shield"
              [loading]="creating()"
              [disabled]="!backupStatus.isReady || creating()"
              [attr.aria-busy]="creating()"
              (click)="create()"
              class="!border-0 !bg-white !px-5 !py-3 !font-bold !text-slate-950 hover:!bg-cyan-50 disabled:!opacity-50"></button>
            <button
              pButton
              type="button"
              label="Refresh"
              icon="pi pi-refresh"
              [loading]="refreshing()"
              [attr.aria-busy]="refreshing()"
              (click)="refresh()"
              class="!border-white/20 !bg-white/10 !px-5 !py-3 !font-semibold !text-white hover:!bg-white/20"></button>
          </div>
        </div>

        <div *ngIf="!backupStatus.isReady" class="relative mt-6 flex items-start gap-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
          <i class="pi pi-exclamation-triangle mt-0.5 text-amber-300"></i>
          <div>
            <p class="m-0 font-bold">Backup creation is unavailable</p>
            <p class="mb-0 mt-1 leading-5">{{ backupStatus.unavailableReason || 'Enable and configure the server backup provider before creating a backup.' }}</p>
          </div>
        </div>

        <div class="relative mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
            <p class="m-0 text-xs text-slate-400">Export format</p>
            <p class="mb-0 mt-2 text-lg font-extrabold">{{ backupStatus.format || '—' }}</p>
            <span class="text-xs text-cyan-200">Schema + data</span>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
            <p class="m-0 text-xs text-slate-400">Retention</p>
            <p class="mb-0 mt-2 text-lg font-extrabold">{{ backupStatus.retentionDays }} days</p>
            <span class="text-xs text-slate-300">Automatic cleanup</span>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
            <p class="m-0 text-xs text-slate-400">Available archives</p>
            <p class="mb-0 mt-2 text-lg font-extrabold">{{ backupStatus.backupCount }}</p>
            <span class="text-xs text-slate-300">Private server storage</span>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
            <p class="m-0 text-xs text-slate-400">Daily schedule</p>
            <p class="mb-0 mt-2 text-lg font-extrabold">{{ backupStatus.runAtUtc || 'Not scheduled' }} <span *ngIf="backupStatus.runAtUtc" class="text-xs font-medium text-slate-300">UTC</span></p>
            <span class="text-xs text-slate-300">Server-controlled time</span>
          </div>
        </div>
      </ng-container>

      <ng-template #statusPending>
        <div class="relative flex min-h-48 items-center gap-3 text-slate-200">
          <i class="pi pi-spin pi-spinner text-xl text-cyan-300"></i>
          <span>Checking backup service readiness…</span>
        </div>
      </ng-template>
    </section>

    <div *ngIf="statusError()" class="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
      <i class="pi pi-times-circle mt-0.5"></i>
      <div>
        <p class="m-0 font-bold">Could not read the latest backup status</p>
        <p class="mb-0 mt-1">{{ statusError() }}</p>
      </div>
    </div>

    <div *ngIf="lastCreatedBatch() as recentBatch" class="mb-6 flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="m-0 font-bold">Latest backup request received</p>
        <p class="mb-0 mt-1">{{ scopeLabel(recentBatch.scope) }} · {{ batchStatusLabel(recentBatch.status) }} · {{ completedCount(recentBatch) }}/{{ recentBatch.artifacts.length }} targets complete</p>
      </div>
      <span class="font-mono text-xs text-emerald-700">{{ recentBatch.id }}</span>
    </div>

    <section class="mb-6 grid gap-4 lg:grid-cols-3">
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><i class="pi pi-lock"></i></div>
        <h3 class="m-0 text-sm font-bold text-slate-900">Private storage</h3>
        <p class="mb-0 mt-2 text-sm leading-6 text-slate-500">Backup files stay behind the protected admin download endpoint. Connection strings and provider credentials are never displayed.</p>
      </article>
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><i class="pi pi-check-square"></i></div>
        <h3 class="m-0 text-sm font-bold text-slate-900">Evidence per target</h3>
        <p class="mb-0 mt-2 text-sm leading-6 text-slate-500">Every batch reports each resolved platform or tenant artifact, its status, size, and SHA-256 checksum.</p>
      </article>
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><i class="pi pi-history"></i></div>
        <h3 class="m-0 text-sm font-bold text-slate-900">Controlled restore</h3>
        <p class="mb-0 mt-2 text-sm leading-6 text-slate-500">This screen records evidence and download actions. Restore capability is shown separately and is never started here.</p>
      </article>
    </section>

    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="m-0 text-lg font-extrabold text-slate-900">Completed backup files</h2>
          <p class="mb-0 mt-1 text-sm text-slate-500">Legacy archive list. Use batch history below for per-target checksum and manifest evidence.</p>
        </div>
        <span class="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"><i class="pi pi-folder"></i>{{ totalCount }} files</span>
      </div>

      <div *ngIf="archiveError()" class="mx-5 mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
        <i class="pi pi-times-circle mt-0.5"></i>
        <span>{{ archiveError() }}</span>
      </div>

      <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr><th>File</th><th>Created</th><th>Size</th><th>Status</th><th class="text-left">Action</th></tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>
              <div class="flex items-center gap-3">
                <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><i class="pi pi-file"></i></span>
                <div><code class="text-xs font-semibold text-slate-700">{{ row.fileName }}</code><p class="m-0 mt-1 text-[11px] text-slate-400">BACPAC · full database export</p></div>
              </div>
            </td>
            <td><span class="text-sm font-medium text-slate-700">{{ row.createdAt | date:'medium' }}</span></td>
            <td><span class="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{{ formatBytes(row.sizeBytes) }}</span></td>
            <td><span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold" [ngClass]="recordStatusClass(row.status)"><i class="text-[10px]" [ngClass]="recordStatusIcon(row.status)"></i>{{ recordStatusLabel(row.status) }}</span></td>
            <td class="text-left"><button pButton type="button" label="Secure download" icon="pi pi-download" [loading]="downloadingFile() === row.fileName" (click)="download(row)" class="!border-indigo-100 !bg-indigo-50 !text-indigo-700 hover:!bg-indigo-100"></button></td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="5" class="py-14 text-center"><i class="pi pi-inbox mb-3 block text-3xl text-slate-300"></i><p class="m-0 font-bold text-slate-600">No completed backup files yet</p><p class="mb-0 mt-1 text-sm text-slate-400">Create a backup after the service reports Ready. The resulting batch will appear below.</p></td></tr>
        </ng-template>
      </p-table>
      <app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator>
    </section>

    <section class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="m-0 text-lg font-extrabold text-slate-900">Backup batches</h2>
          <p class="mb-0 mt-1 text-sm text-slate-500">One batch contains one independent artifact for every target resolved by the selected scope.</p>
        </div>
        <span class="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700"><i class="pi pi-sitemap"></i>{{ batches().length }} batches</span>
      </div>

      <div *ngIf="batchError()" class="mx-5 mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
        <i class="pi pi-times-circle mt-0.5"></i><span>{{ batchError() }}</span>
      </div>
      <div *ngIf="batchLoading()" class="flex items-center gap-2 px-5 py-8 text-sm text-slate-500"><i class="pi pi-spin pi-spinner text-indigo-500"></i>Loading batch history…</div>
      <div *ngIf="!batchLoading() && batches().length === 0 && !batchError()" class="px-5 py-10 text-center text-sm text-slate-500">No batch history is available yet.</div>

      <div *ngFor="let batch of batches()" class="border-b border-slate-100 px-5 py-5 last:border-b-0">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{{ scopeLabel(batch.scope) }}</span>
              <span class="rounded-full px-2.5 py-1 text-xs font-bold" [ngClass]="batchStatusClass(batch.status)">{{ batchStatusLabel(batch.status) }}</span>
              <span class="text-xs text-slate-400">{{ completedCount(batch) }}/{{ batch.artifacts.length }} targets complete</span>
            </div>
            <div class="mt-3 h-2 max-w-xl overflow-hidden rounded-full bg-slate-100" role="progressbar" [attr.aria-valuenow]="progressPercent(batch)" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="'Backup progress for ' + batch.id">
              <div class="h-full rounded-full bg-indigo-500 transition-all" [style.width.%]="progressPercent(batch)"></div>
            </div>
            <p class="mb-0 mt-2 text-xs text-slate-500">Started {{ batch.startedAtUtc | date:'medium' }} <span *ngIf="batch.completedAtUtc">· finished {{ batch.completedAtUtc | date:'medium' }}</span></p>
            <p class="mb-0 mt-1 truncate font-mono text-[11px] text-slate-400" [title]="batch.id">Batch {{ batch.id }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button *ngIf="batch.manifestStorageKey" pButton type="button" label="Download manifest" icon="pi pi-file-export" [loading]="downloadingFile() === batch.manifestStorageKey" (click)="downloadManifest(batch)" class="!border-slate-200 !bg-slate-50 !text-slate-700 hover:!bg-slate-100"></button>
            <button *ngIf="isRetryable(batch)" pButton type="button" label="Retry failed targets" icon="pi pi-refresh" [loading]="batchAction() === batch.id" (click)="retry(batch)" class="!border-amber-200 !bg-amber-50 !text-amber-800 hover:!bg-amber-100"></button>
          </div>
        </div>

        <div *ngIf="batch.artifacts.length > 0; else noArtifacts" class="mt-4 grid gap-3 xl:grid-cols-2">
          <article *ngFor="let artifact of batch.artifacts" class="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="m-0 truncate text-sm font-bold text-slate-800" [title]="artifactLabel(artifact)">{{ artifactLabel(artifact) }}</p>
                <div class="mt-2 flex flex-wrap items-center gap-2">
                  <span class="rounded-full px-2 py-1 text-[11px] font-bold" [ngClass]="artifactStatusClass(artifact.status)">{{ artifactStatusLabel(artifact.status) }}</span>
                  <span class="text-xs text-slate-500">{{ formatBytes(artifact.sizeBytes) }}</span>
                </div>
              </div>
              <button *ngIf="artifact.storageKey" pButton type="button" icon="pi pi-download" [attr.aria-label]="'Download ' + artifactLabel(artifact)" [loading]="downloadingFile() === artifact.storageKey" (click)="downloadArtifact(artifact)" class="!h-8 !w-8 !border-indigo-100 !bg-indigo-50 !text-indigo-700 hover:!bg-indigo-100"></button>
            </div>
            <div class="mt-3 rounded-lg bg-white p-3 text-xs text-slate-500">
              <span class="font-semibold text-slate-700">SHA-256:</span>
              <code *ngIf="artifact.sha256; else noChecksum" class="ml-1 break-all text-[11px]">{{ artifact.sha256 }}</code>
              <ng-template #noChecksum><span class="ml-1 text-amber-700">Not available yet</span></ng-template>
            </div>
            <p *ngIf="artifact.errorCode" class="mb-0 mt-2 text-xs font-semibold text-red-700">Failure code: {{ artifact.errorCode }}</p>
          </article>
        </div>
        <ng-template #noArtifacts><p class="mb-0 mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">The server has not returned target artifacts for this batch yet.</p></ng-template>
      </div>

      <div class="border-t border-slate-100 bg-slate-50/60 px-5 py-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 class="m-0 text-sm font-extrabold text-slate-900">Restore capability</h3>
            <p class="mb-0 mt-1 text-sm text-slate-500">Restore remains provider-controlled and is never started from this evidence view.</p>
          </div>
          <ng-container *ngIf="restoreCapabilities() as capabilities; else restorePending">
            <span class="rounded-full px-3 py-1.5 text-xs font-bold" [ngClass]="capabilities.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">{{ capabilities.enabled ? 'Available' : 'Manual / unavailable' }}</span>
          </ng-container>
          <ng-template #restorePending><span class="text-xs font-semibold text-slate-400">Checking provider…</span></ng-template>
        </div>
        <p *ngIf="restoreCapabilities() as capabilities" class="mb-0 mt-3 text-xs text-slate-500">{{ capabilities.enabled ? restoreDetails(capabilities) : (capabilities.unavailableReason || 'Direct restore is not enabled for this provider.') }} Batch start and finish events are recorded by the server audit log.</p>
        <p *ngIf="restoreError()" class="mb-0 mt-3 text-xs font-semibold text-red-700">{{ restoreError() }}</p>
      </div>
    </section>
  `,
})
export class BackupsComponent implements OnInit {
  @HostListener(`window:${ADMIN_ASSISTANT_COMMAND_EVENT}`, ['$event'])
  onAssistantCommand(event: Event): void {
    if ((event as CustomEvent<{ command?: string }>).detail?.command === 'create-backup') this.create();
  }

  private readonly service = inject(BackupsService);
  private readonly notify = inject(NotifyService);

  rows = signal<BackupRecord[]>([]);
  loading = signal(false);
  creating = signal(false);
  refreshing = signal(false);
  page = 1;
  pageSize = 20;
  totalCount = 0;
  downloadingFile = signal<string | null>(null);
  status = signal<BackupStatus | null>(null);
  statusError = signal<string | null>(null);
  archiveError = signal<string | null>(null);
  batches = signal<BackupBatch[]>([]);
  batchLoading = signal(false);
  batchError = signal<string | null>(null);
  batchAction = signal<string | null>(null);
  restoreCapabilities = signal<RestoreCapabilities | null>(null);
  restoreError = signal<string | null>(null);
  lastCreatedBatch = signal<BackupBatch | null>(null);
  selectedScope = signal<BackupScope>(BackupScope.FullSystem);

  scopeOptions = [
    { value: BackupScope.FullSystem, label: 'Full system (platform + all active tenants)' },
    { value: BackupScope.AllTenants, label: 'All active tenant databases' },
    { value: BackupScope.AllGyms, label: 'All active gym databases' },
    { value: BackupScope.AllFreelance, label: 'All active freelance databases' },
    { value: BackupScope.Platform, label: 'Platform database only' },
  ];

  ngOnInit(): void {
    this.loadStatus();
  }

  refresh(): void {
    this.refreshing.set(true);
    this.loadStatus();
  }

  loadStatus(): void {
    this.statusError.set(null);
    this.service.status().subscribe({
      next: status => {
        this.status.set(status);
        this.refreshing.set(false);
        this.loadRelatedData();
      },
      error: error => {
        const message = this.readError(error, 'The server did not return backup readiness.');
        this.statusError.set(message);
        this.status.set({
          isEnabled: false,
          isReady: false,
          format: 'BACPAC',
          retentionDays: 0,
          runAtUtc: '',
          backupCount: 0,
          unavailableReason: message,
        });
        this.refreshing.set(false);
        this.loadRelatedData();
      },
    });
  }

  private loadRelatedData(): void {
    this.load();
    this.loadBatches();
    this.loadRestoreCapabilities();
  }

  loadBatches(): void {
    this.batchLoading.set(true);
    this.batchError.set(null);
    this.service.listBatches().subscribe({
      next: batches => {
        this.batches.set(batches);
        this.batchLoading.set(false);
      },
      error: error => {
        this.batches.set([]);
        this.batchError.set(this.readError(error, 'The server did not return batch history.'));
        this.batchLoading.set(false);
      },
    });
  }

  loadRestoreCapabilities(): void {
    this.restoreError.set(null);
    this.service.restoreCapabilities().subscribe({
      next: capabilities => this.restoreCapabilities.set(capabilities),
      error: error => {
        this.restoreCapabilities.set(null);
        this.restoreError.set(this.readError(error, 'Could not read restore capability.'));
      },
    });
  }

  selectScope(value: string | number): void {
    const scope = Number(value) as BackupScope;
    if (this.scopeOptions.some(option => option.value === scope)) this.selectedScope.set(scope);
  }

  load(): void {
    this.loading.set(true);
    this.archiveError.set(null);
    this.service.list(this.page, this.pageSize).subscribe({
      next: result => {
        this.rows.set(result.items ?? []);
        this.totalCount = result.totalCount ?? 0;
        this.loading.set(false);
      },
      error: error => {
        this.rows.set([]);
        this.totalCount = 0;
        this.archiveError.set(this.readError(error, 'The server did not return completed backup files.'));
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.load();
  }

  create(): void {
    const backupStatus = this.status();
    if (!backupStatus?.isReady) {
      this.notify.error(backupStatus?.unavailableReason || 'Backup service is not ready.', 'Backup unavailable');
      return;
    }

    const scope = this.selectedScope();
    void this.notify.confirm({
      header: 'Create backup now?',
      message: `The server will create a ${this.scopeLabel(scope)} batch and return per-target status, size, SHA-256, and manifest evidence.`,
      acceptLabel: 'Create backup',
      rejectLabel: 'Cancel',
      icon: 'pi pi-shield',
    }).then(confirmed => {
      if (!confirmed) return;
      this.creating.set(true);
      this.service.createBatch({ scope }).subscribe({
        next: batch => {
          this.lastCreatedBatch.set(batch);
          this.creating.set(false);
          this.notify.success(`${this.scopeLabel(batch.scope)} returned ${this.batchStatusLabel(batch.status)} with ${completedCountValue(batch)}/${batch.artifacts.length} targets complete.`, 'Backup request completed');
          this.loadStatus();
        },
        error: error => {
          this.creating.set(false);
          this.notify.error(this.readError(error, 'The backup request failed before producing a result.'), 'Backup request failed');
          this.loadStatus();
        },
      });
    });
  }

  retry(batch: BackupBatch): void {
    if (!this.isRetryable(batch)) return;
    void this.notify.confirm({
      header: 'Retry failed targets?',
      message: `The server will retry the failed or incomplete targets in batch ${batch.id}. Completed artifacts will remain recorded.`,
      acceptLabel: 'Retry targets',
      rejectLabel: 'Cancel',
      icon: 'pi pi-refresh',
    }).then(confirmed => {
      if (!confirmed) return;
      this.batchAction.set(batch.id);
      this.service.retryBatch(batch.id).subscribe({
        next: updated => {
          this.batches.update(items => items.map(item => item.id === updated.id ? updated : item));
          this.batchAction.set(null);
          this.notify.success(`${this.completedCount(updated)}/${updated.artifacts.length} targets are complete.`, 'Retry completed');
          this.loadStatus();
        },
        error: error => {
          this.batchAction.set(null);
          this.notify.error(this.readError(error, 'The retry request failed.'), 'Retry failed');
          this.loadBatches();
        },
      });
    });
  }

  download(row: BackupRecord): void {
    this.downloadFile(row.fileName, row.fileName);
  }

  downloadManifest(batch: BackupBatch): void {
    if (batch.manifestStorageKey) this.downloadFile(batch.manifestStorageKey, `${batch.id}-manifest.json`);
  }

  downloadArtifact(artifact: BackupArtifact): void {
    if (artifact.storageKey) this.downloadFile(artifact.storageKey, `${artifact.id}.bacpac`);
  }

  private downloadFile(resourceKey: string, downloadName: string): void {
    this.downloadingFile.set(resourceKey);
    this.service.download(resourceKey).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = downloadName;
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 0);
        this.downloadingFile.set(null);
      },
      error: error => {
        this.downloadingFile.set(null);
        this.notify.error(this.readError(error, 'The protected download could not be completed.'), 'Download failed');
      },
    });
  }

  readinessLabel(status: BackupStatus): string {
    return status.isReady ? 'Ready to create backups' : 'Action required before backup';
  }

  readinessTitle(status: BackupStatus): string {
    return status.isReady ? 'Your backup evidence is under control.' : 'Backup service is not ready.';
  }

  readinessMessage(status: BackupStatus): string {
    if (!status.isReady) return status.unavailableReason || 'Enable and configure the server backup provider before creating a backup.';
    return 'Create a scoped BACPAC batch, then verify each artifact, checksum, and manifest before downloading it.';
  }

  scopeLabel(scope: BackupScope | number): string {
    return this.scopeOptions.find(option => option.value === Number(scope))?.label || 'Unknown scope';
  }

  scopeDescription(scope: BackupScope | number): string {
    switch (Number(scope)) {
      case BackupScope.FullSystem: return 'Platform database plus every active tenant mapping resolved by the server.';
      case BackupScope.AllTenants: return 'Every active tenant database, without the platform database.';
      case BackupScope.AllGyms: return 'Every active gym workspace database.';
      case BackupScope.AllFreelance: return 'Every active freelance workspace database.';
      case BackupScope.Platform: return 'The platform database only.';
      default: return 'The server resolves targets from the selected scope.';
    }
  }

  batchStatusLabel(status: string): string {
    switch (status) {
      case 'Completed': return 'Completed';
      case 'Running': return 'Running';
      case 'Partial': return 'Partial';
      case 'Failed': return 'Failed';
      default: return status || 'Unknown';
    }
  }

  batchStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700';
      case 'Running':
      case 'Partial': return 'bg-amber-50 text-amber-700';
      case 'Failed': return 'bg-red-50 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  }

  artifactStatusLabel(status: string): string {
    return status === 'Completed' ? 'Verified' : this.batchStatusLabel(status);
  }

  artifactStatusClass(status: string): string {
    if (status === 'Completed') return 'bg-emerald-50 text-emerald-700';
    if (status === 'Failed') return 'bg-red-50 text-red-700';
    return 'bg-amber-50 text-amber-700';
  }

  recordStatusLabel(status: string): string {
    return status === 'Completed' ? 'Completed' : this.batchStatusLabel(status);
  }

  recordStatusClass(status: string): string {
    return status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
  }

  recordStatusIcon(status: string): string {
    return status === 'Completed' ? 'pi pi-check-circle text-emerald-600' : 'pi pi-info-circle text-amber-600';
  }

  completedCount(batch: BackupBatch): number {
    return completedCountValue(batch);
  }

  progressPercent(batch: BackupBatch): number {
    return batch.artifacts.length === 0 ? 0 : Math.round((this.completedCount(batch) / batch.artifacts.length) * 100);
  }

  isRetryable(batch: BackupBatch): boolean {
    return batch.status === 'Failed' || batch.status === 'Partial';
  }

  artifactLabel(artifact: BackupArtifact): string {
    return artifact.tenantId ? `Tenant database (${artifact.tenantId.slice(0, 8)}…)` : 'Platform database';
  }

  formatBytes(value: number | null | undefined): string {
    if (!Number.isFinite(value) || !value || value <= 0) return '—';
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  restoreDetails(capabilities: RestoreCapabilities): string {
    const details: string[] = [];
    if (capabilities.supportsBacpacImport) details.push('BACPAC import is supported');
    if (capabilities.supportsMappingSwitch) details.push('mapping switch is supported');
    return details.length > 0 ? `${details.join(' and ')} by the provider.` : 'The provider reported restore capability.';
  }

  private readError(error: unknown, fallback: string): string {
    const message = errMsg(error);
    return message && !message.includes('غير متوقع') ? message : fallback;
  }
}

function completedCountValue(batch: BackupBatch): number {
  return batch.artifacts.filter(artifact => artifact.status === 'Completed').length;
}
