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
      title="Database Resources"
      subtitle="Manage the protected workspace database pool with explicit, server-validated actions."
      icon="pi pi-database">
      <button
        pButton
        type="button"
        label="Refresh"
        icon="pi pi-refresh"
        class="p-button-text"
        aria-label="Refresh database resources"
        [loading]="loading()"
        (click)="load()"></button>
      <button pButton type="button" label="Register database" icon="pi pi-plus" (click)="openRegister()"></button>
    </app-page-header>

    @if (loadError(); as message) {
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
        <span><i class="pi pi-exclamation-circle me-2"></i>{{ message }}</span>
        <button pButton type="button" label="Retry" icon="pi pi-refresh" class="p-button-sm p-button-danger p-button-outlined" (click)="load()"></button>
      </div>
    }

    <div class="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
      <div class="flex items-start gap-3">
        <i class="pi pi-info-circle mt-1"></i>
        <div>
          <p class="m-0 font-extrabold">Protected resource pool controls</p>
          <p class="mb-0 mt-1">Register and repair accept a connection string only over the protected API. The server tests it, encrypts it immediately, and never returns or displays it. Allocated resources must use the explicit repair action; migrations, health checks, assignment, and backups remain server-authoritative.</p>
          <a routerLink="/backups" class="mt-2 inline-flex items-center gap-2 font-bold text-blue-700 hover:underline">
            Open Backup Center <i class="pi pi-arrow-right text-xs"></i>
          </a>
        </div>
      </div>
    </div>

      <div class="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] md:items-end">
        <label class="lf-label m-0">
          Lifecycle status
          <select class="lf-input mt-1" [ngModel]="statusFilter()" (ngModelChange)="selectStatus($event)">
            <option [ngValue]="null">All statuses</option>
            @for (option of statusOptions; track option.value) {
              <option [ngValue]="option.value">{{ option.label }}</option>
            }
          </select>
        </label>
        <label class="lf-label m-0">
          Tenant ID (optional)
          <input class="lf-input mt-1" [ngModel]="tenantIdFilter()" (ngModelChange)="tenantIdFilter.set($event)" dir="ltr" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
        </label>
        <button pButton type="button" label="Apply filters" icon="pi pi-filter" class="p-button-outlined" [loading]="loading()" (click)="applyFilters()"></button>
        <button pButton type="button" label="Clear" icon="pi pi-times" class="p-button-text p-button-secondary" [disabled]="!hasFilters()" (click)="clearFilters()"></button>
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
    <p class="-mt-4 mb-6 text-xs text-slate-500">Summary counts describe the currently loaded page. The table total is {{ totalCount }} resource(s).</p>

    <section class="lf-card overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 class="m-0 text-base font-extrabold text-slate-800">Registered workspace databases</h2>
          <p class="mb-0 mt-1 text-xs text-slate-500">Connection strings are encrypted in DatabaseResources and never displayed here.</p>
        </div>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{{ totalCount }} resources</span>
      </div>

      <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>Resource</th>
            <th>Status</th>
            <th>Workspace</th>
            <th>Provisioning / health</th>
            <th>Backups</th>
            <th class="text-center">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>
              <div class="font-bold text-slate-800" dir="ltr">{{ row.resourceCode || shortId(row.id) }}</div>
              <div class="mt-1 text-xs text-slate-500" dir="ltr">{{ row.provider }}</div>
              <div class="mt-1 text-[11px]" [class.text-emerald-600]="row.hasProtectedConnection" [class.text-amber-600]="!row.hasProtectedConnection">
                <i [class]="row.hasProtectedConnection ? 'pi pi-lock' : 'pi pi-exclamation-triangle'"></i>
                {{ row.hasProtectedConnection ? 'Protected connection saved' : 'Connection missing' }}
              </div>
            </td>
            <td><span class="lf-badge" [ngClass]="statusClass(row)">{{ lifecycleLabel(row) }}</span></td>
            <td>
              @if (row.tenantName) {
                <div class="font-semibold text-slate-700">{{ row.tenantName }}</div>
                <div class="text-xs text-slate-500">{{ workspaceLabel(row.workspaceType) }}</div>
              } @else {
                <span class="text-sm text-slate-400">Not allocated</span>
              }
            </td>
            <td>
              <div class="text-sm text-slate-700">{{ provisioningLabel(row) }}</div>
              @if (row.provisioningError || row.lastError) {
                <div class="text-xs font-semibold text-rose-600">{{ row.provisioningError || row.lastError }}</div>
              }
              <div class="mt-1 text-xs text-slate-500">Health: {{ row.lastHealthCheckAtUtc ? formatDate(row.lastHealthCheckAtUtc) : 'Not checked' }}</div>
              @if (row.schemaVersion) { <div class="text-[11px] text-slate-400" dir="ltr">{{ row.schemaVersion }}</div> }
            </td>
            <td>
              <div class="font-semibold text-slate-700">{{ row.backupCount || 0 }} backup(s)</div>
              <div class="text-xs text-slate-500">{{ row.lastBackupStatus || 'No backup yet' }}</div>
              @if (row.lastBackupCompletedAtUtc) { <div class="text-[11px] text-slate-400">{{ formatDate(row.lastBackupCompletedAtUtc) }}</div> }
            </td>
            <td class="whitespace-nowrap text-center">
              <div class="flex flex-wrap justify-center gap-1">
                @if (canRepair(row)) {
                  <button pButton type="button" label="Repair" icon="pi pi-wrench" class="p-button-sm p-button-warning p-button-outlined" title="Repair protected connection" (click)="openRepair(row)"></button>
                }
                @if (canRunMigrations(row)) {
                  <button pButton type="button" label="Migrations" icon="pi pi-sync" class="p-button-sm p-button-outlined" [loading]="busyId() === row.id && busyAction() === 'migrations'" (click)="runMigrations(row)"></button>
                }
                @if (isAllocated(row)) {
                  <button pButton type="button" label="Backup" icon="pi pi-save" class="p-button-sm p-button-outlined" [loading]="busyId() === row.id && busyAction() === 'backup'" (click)="createBackup(row)"></button>
                }
                @if (canDisable(row)) {
                  <button pButton type="button" label="Disable" icon="pi pi-ban" class="p-button-sm p-button-warning p-button-text" [loading]="busyId() === row.id && busyAction() === 'status'" (click)="setStatus(row, 'Disabled')"></button>
                }
                @if (isDisabled(row)) {
                  <button pButton type="button" label="Enable" icon="pi pi-check" class="p-button-sm p-button-success p-button-text" [loading]="busyId() === row.id && busyAction() === 'status'" (click)="setStatus(row, 'Available')"></button>
                }
                @if (!canRepair(row) && !canRunMigrations(row) && !isAllocated(row) && !canDisable(row) && !isDisabled(row)) {
                  <span class="text-xs text-slate-400">Server managed</span>
                }
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="6" class="py-14 text-center text-slate-400"><i class="pi pi-database mb-2 block text-3xl opacity-40"></i>No database resources registered. Use Register database to add a protected pool resource.</td></tr>
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
      [header]="repairMode ? (repairAllocated ? 'Repair allocated database connection' : 'Repair database resource') : 'Register database resource'">
      <form #resourceForm="ngForm" (ngSubmit)="save()" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        @if (!repairMode) {
          <div>
            <label class="lf-label">Provider *</label>
            <select class="lf-input" name="provider" [(ngModel)]="editor.provider" required>
              <option value="ManualMonster">ManualMonster</option>
              <option value="LocalSql">LocalSql</option>
            </select>
          </div>
          <div>
            <label class="lf-label">Database label *</label>
            <input class="lf-input" name="databaseName" [(ngModel)]="editor.databaseName" dir="ltr" required placeholder="tenant-db-01" />
          </div>
          <div class="sm:col-span-2">
            <label class="lf-label">Server key / note</label>
            <input class="lf-input" name="serverKey" [(ngModel)]="editor.serverKey" dir="ltr" placeholder="Optional operator reference" />
          </div>
        } @else {
          <div class="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
            <i class="pi pi-wrench me-1"></i>
            @if (repairAllocated) {
              This replaces the protected value for the allocated workspace mapping. The existing value is never displayed.
            } @else {
              This validates and protects a new pool connection, then returns the resource to Available.
            }
          </div>
        }
        <div class="sm:col-span-2">
          <label class="lf-label">Connection string *</label>
          <textarea class="lf-input min-h-28 font-mono text-xs" name="connectionString" [(ngModel)]="editor.connectionString" dir="ltr" required autocomplete="new-password" placeholder="Entered over TLS; never displayed after save"></textarea>
          <p class="mt-1 text-xs text-slate-500">The server validates the SQL database, encrypts the value before persistence, and returns only a protected-connection flag.</p>
        </div>
        @if (!repairMode && lastTest(); as test) {
          <div class="sm:col-span-2 rounded-xl p-3 text-sm" [class.bg-emerald-50]="test.succeeded" [class.text-emerald-700]="test.succeeded" [class.bg-rose-50]="!test.succeeded" [class.text-rose-700]="!test.succeeded">
            <i [class]="test.succeeded ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
            {{ test.message }}
          </div>
        }
      </form>
      <ng-template pTemplate="footer">
        <button pButton type="button" label="Cancel" class="p-button-text p-button-secondary" (click)="closeDialog()"></button>
        @if (!repairMode) {
          <button pButton type="button" label="Test connection" icon="pi pi-link" class="p-button-outlined" [loading]="testing()" [disabled]="!editor.databaseName.trim() || !editor.connectionString.trim()" (click)="testConnection()"></button>
        }
        <button pButton type="submit" [label]="repairMode ? 'Repair and protect' : 'Register securely'" icon="pi pi-lock" [loading]="saving() || registering()" [disabled]="saving() || registering() || !editor.connectionString.trim() || (!repairMode && (!editor.provider.trim() || !editor.databaseName.trim()))" (click)="save()"></button>
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
    { label: 'Available on page', value: this.count('Available'), icon: 'pi pi-check-circle', color: 'text-emerald-500' },
    { label: 'Allocated on page', value: this.count('Allocated'), icon: 'pi pi-link', color: 'text-blue-500' },
    { label: 'In progress on page', value: this.rows().filter(row => ['Provisioning', 'RestorePending'].includes(this.lifecycleLabel(row))).length, icon: 'pi pi-spin pi-spinner', color: 'text-amber-500' },
    { label: 'Needs review on page', value: this.rows().filter(row => ['Failed', 'Disabled'].includes(this.lifecycleLabel(row))).length, icon: 'pi pi-exclamation-triangle', color: 'text-rose-500' },
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
    { value: DatabaseResourceStatus.Available, label: 'Available' },
    { value: DatabaseResourceStatus.Reserved, label: 'Reserved' },
    { value: DatabaseResourceStatus.Provisioning, label: 'Provisioning' },
    { value: DatabaseResourceStatus.Assigned, label: 'Assigned' },
    { value: DatabaseResourceStatus.Maintenance, label: 'Maintenance / Disabled' },
    { value: DatabaseResourceStatus.RestorePending, label: 'Restore pending' },
    { value: DatabaseResourceStatus.Faulted, label: 'Faulted / Failed' },
    { value: DatabaseResourceStatus.Retired, label: 'Retired' },
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
      this.notify.error('Tenant ID must be a valid GUID.');
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
      header: allocated ? 'Repair allocated connection?' : 'Repair pool connection?',
      message: allocated
        ? `The new value will be tested and applied to ${row.resourceCode || this.shortId(row.id)} and its active workspace mapping.`
        : `The new value will be tested and ${row.resourceCode || this.shortId(row.id)} will return to Available.`,
      acceptLabel: 'Continue',
      rejectLabel: 'Cancel',
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
    if (this.repairMode || !this.editor.databaseName.trim() || !this.editor.connectionString.trim()) return;
    this.testing.set(true);
    this.lastTest.set(null);
    this.service.testConnection(this.editor.databaseName.trim(), this.editor.connectionString.trim()).subscribe({
      next: result => {
        this.testing.set(false);
        this.lastTest.set(result);
        result.succeeded ? this.notify.success('Connection test succeeded.') : this.notify.error(result.message);
      },
      error: error => { this.testing.set(false); this.notify.error(errMsg(error)); },
    });
  }

  save(): void {
    if (this.repairMode && this.editingId) {
      if (!this.editor.connectionString.trim()) {
        this.notify.error('A new connection string is required for repair.');
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
      this.notify.error('Provider, database label, and connection string are required.');
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
        this.notify.success('Database resource registered securely.');
        this.closeDialog();
        this.load();
      },
      error: error => { this.registering.set(false); this.notify.error(errMsg(error)); },
    });
  }

  runMigrations(row: DatabaseResource): void {
    if (!this.canRunMigrations(row)) return;
    void this.notify.confirm({
      header: 'Run migrations and health check?',
      message: `The server will run tenant migrations and CanConnect for ${row.resourceCode || this.shortId(row.id)}.`,
      acceptLabel: 'Run migrations',
      rejectLabel: 'Cancel',
    }).then(confirmed => {
      if (!confirmed) return;
      this.startBusy(row.id, 'migrations');
      this.service.runMigrations(row.id).subscribe({
        next: result => { this.finishBusy(); this.notify.success(result.message); this.load(); },
        error: error => { this.finishBusy(); this.notify.error(errMsg(error)); this.load(); },
      });
    });
  }

  createBackup(row: DatabaseResource): void {
    if (!this.isAllocated(row)) return;
    void this.notify.confirm({
      header: 'Create backup for this workspace?',
      message: `The server will resolve and create the protected backup batch for ${row.tenantName || 'the allocated workspace'}.`,
      acceptLabel: 'Create backup',
      rejectLabel: 'Cancel',
    }).then(confirmed => {
      if (!confirmed) return;
      this.startBusy(row.id, 'backup');
      this.service.createBackup(row.id).subscribe({
        next: () => { this.finishBusy(); this.notify.success('Backup request completed. Review the Backup Center for checksum and artifact evidence.'); this.load(); },
        error: error => { this.finishBusy(); this.notify.error(errMsg(error)); this.load(); },
      });
    });
  }

  setStatus(row: DatabaseResource, status: 'Available' | 'Disabled'): void {
    const enabling = status === 'Available';
    void this.notify.confirm({
      header: enabling ? 'Enable resource?' : 'Disable resource?',
      message: enabling
        ? `Allow ${row.resourceCode || this.shortId(row.id)} to be selected for a new workspace?`
        : `Stop ${row.resourceCode || this.shortId(row.id)} from being selected for a new workspace?`,
      acceptLabel: enabling ? 'Enable' : 'Disable',
      rejectLabel: 'Cancel',
      danger: !enabling,
    }).then(confirmed => {
      if (!confirmed) return;
      this.startBusy(row.id, 'status');
      this.service.setStatus(row.id, status).subscribe({
        next: updated => { this.finishBusy(); this.replace(updated); this.notify.success(`Resource marked ${status}.`); },
        error: error => { this.finishBusy(); this.notify.error(errMsg(error)); this.load(); },
      });
    });
  }

  lifecycleLabel(row: DatabaseResource): string {
    return row.lifecycleStatus || this.statusLabel(row.status);
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
    if (row.provisioningError || row.lastError) return 'Failed';
    if (row.provisioningStatus === null || row.provisioningStatus === undefined) return 'Not started';
    return String(row.provisioningStatus);
  }

  workspaceLabel(workspaceType: string | null): string {
    if (workspaceType === 'FreelanceCoach') return 'Freelance coach workspace';
    if (workspaceType === 'Gym') return 'Gym workspace';
    return 'Assigned workspace';
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
    return Number.isNaN(date.getTime()) ? 'Invalid timestamp' : date.toLocaleString();
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

  private startBusy(id: string, action: string): void {
    this.busyId.set(id);
    this.busyAction.set(action);
  }

  private finishBusy(): void {
    this.busyId.set(null);
    this.busyAction.set(null);
  }

  private replace(updated: DatabaseResource): void {
    this.rows.update(rows => rows.map(row => row.id === updated.id ? updated : row));
  }
}
