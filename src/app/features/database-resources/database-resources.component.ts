import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import {
  DatabaseResource,
  DatabaseResourceStatus,
  DatabaseResourcesService,
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
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule, TableModule, PageHeaderComponent],
  template: `
    <app-page-header
      title="Database Resources"
      subtitle="Manage the four pre-created databases used by gyms and freelance workspaces."
      icon="pi pi-database">
      <button pButton type="button" label="Refresh" icon="pi pi-refresh" class="p-button-text" [loading]="loading()" (click)="load()"></button>
      <button pButton type="button" label="Add database" icon="pi pi-plus" (click)="openCreate()"></button>
    </app-page-header>

    <div class="grid grid-cols-2 gap-3 md:grid-cols-4 mb-6">
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

    <section class="lf-card overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 class="m-0 text-base font-extrabold text-slate-800">Registered workspace databases</h2>
          <p class="mb-0 mt-1 text-xs text-slate-500">Connection strings are encrypted in DatabaseResources and never displayed here.</p>
        </div>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{{ rows().length }} resources</span>
      </div>

      <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>Database</th>
            <th>Status</th>
            <th>Workspace</th>
            <th>Provisioning / subscription</th>
            <th>Backups</th>
            <th class="text-center">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>
              <div class="font-bold text-slate-800" dir="ltr">{{ row.resourceCode }}</div>
              <div class="mt-1 text-xs text-slate-500" dir="ltr">{{ row.provider }}</div>
              <div class="mt-1 text-[11px] text-slate-400">{{ row.hasConnectionString ? 'Protected connection saved' : 'Connection missing' }}</div>
            </td>
            <td><span class="lf-badge" [ngClass]="statusClass(row.lifecycleStatus)">{{ row.lifecycleStatus }}</span></td>
            <td>
              @if (row.tenantName) {
                <div class="font-semibold text-slate-700">{{ row.tenantName }}</div>
                <div class="text-xs text-slate-500">{{ workspaceLabel(row) }}</div>
              } @else {
                <span class="text-sm text-slate-400">Not allocated</span>
              }
            </td>
            <td>
              <div class="text-sm text-slate-700">{{ provisioningLabel(row) }}</div>
              @if (row.subscriptionStatus) { <div class="text-xs text-slate-500">Subscription status: {{ row.subscriptionStatus }}</div> }
              @if (row.provisioningError) { <div class="text-xs font-semibold text-rose-600">{{ row.provisioningError }}</div> }
            </td>
            <td>
              <div class="font-semibold text-slate-700">{{ row.backupCount }} backup(s)</div>
              <div class="text-xs text-slate-500">{{ row.lastBackupStatus || 'No backup yet' }}</div>
            </td>
            <td class="whitespace-nowrap text-center">
              <button pButton type="button" icon="pi pi-pencil" class="p-button-text p-button-sm" title="Edit" (click)="openEdit(row)"></button>
              @if (row.lifecycleStatus === 'Allocated' || row.lifecycleStatus === 'Failed') {
                <button pButton type="button" icon="pi pi-wrench" class="p-button-text p-button-sm p-button-warning" title="Repair protected connection" (click)="openRepair(row)"></button>
              }
              <button pButton type="button" icon="pi pi-sync" class="p-button-text p-button-sm" title="Run migrations" [loading]="busyId() === row.id && busyAction() === 'migrations'" (click)="runMigrations(row)"></button>
              @if (row.lifecycleStatus === 'Allocated') {
                <button pButton type="button" icon="pi pi-save" class="p-button-text p-button-sm" title="Create backup" [loading]="busyId() === row.id && busyAction() === 'backup'" (click)="createBackup(row)"></button>
              }
              @if (row.lifecycleStatus === 'Available' || row.lifecycleStatus === 'Failed') {
                <button pButton type="button" icon="pi pi-ban" class="p-button-text p-button-sm p-button-warning" title="Disable" [loading]="busyId() === row.id && busyAction() === 'status'" (click)="setStatus(row, 'Disabled')"></button>
              }
              @if (row.lifecycleStatus === 'Disabled') {
                <button pButton type="button" icon="pi pi-check" class="p-button-text p-button-sm p-button-success" title="Enable" [loading]="busyId() === row.id && busyAction() === 'status'" (click)="setStatus(row, 'Available')"></button>
              }
              @if (row.lifecycleStatus !== 'Allocated' && row.lifecycleStatus !== 'Provisioning') {
                <button pButton type="button" icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" title="Delete" [loading]="busyId() === row.id && busyAction() === 'delete'" (click)="remove(row)"></button>
              }
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="6" class="py-14 text-center text-slate-400"><i class="pi pi-database mb-2 block text-3xl opacity-40"></i>No database resources registered. Add the four connection strings from this screen.</td></tr>
        </ng-template>
      </p-table>
    </section>

    <p-dialog
      [(visible)]="dialogVisible"
      [modal]="true"
      [draggable]="false"
      [dismissableMask]="true"
      [style]="{ width: '650px', maxWidth: '94vw' }"
      [header]="repairMode ? 'Repair allocated database connection' : editingId ? 'Edit database resource' : 'Add database resource'">
      <form #resourceForm="ngForm" (ngSubmit)="save()" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="lf-label">Provider *</label>
          <input class="lf-input" name="provider" [(ngModel)]="editor.provider" required />
        </div>
        <div>
          <label class="lf-label">Database name {{ editingId ? '(only for connection test)' : '*' }}</label>
          <input class="lf-input" name="databaseName" [(ngModel)]="editor.databaseName" dir="ltr" [required]="!editingId" [placeholder]="editingId ? 'Leave blank to keep the current database' : ''" />
        </div>
        <div class="sm:col-span-2">
          <label class="lf-label">Server key (optional)</label>
          <input class="lf-input" name="serverKey" [(ngModel)]="editor.serverKey" dir="ltr" placeholder="Host or server label" />
        </div>
        <div class="sm:col-span-2">
          <label class="lf-label">Connection string {{ repairMode ? '*' : editingId ? '(leave blank to keep the current one)' : '*' }}</label>
          <textarea class="lf-input min-h-28 font-mono text-xs" name="connectionString" [(ngModel)]="editor.connectionString" dir="ltr" [required]="!editingId" autocomplete="new-password"></textarea>
          <p class="mt-1 text-xs text-slate-500">It is tested first, then encrypted and stored in the central database. It is never returned by the API.</p>
          @if (repairMode) {
            <p class="mt-1 text-xs font-semibold text-amber-700">
              @if (repairAllocated) {
                This repairs the allocated workspace mapping and replaces only the protected value.
              } @else {
                This repairs the failed pool resource and returns it to Available for a new workspace.
              }
              The current connection is never displayed.
            </p>
          }
        </div>
        @if (lastTest(); as test) {
          <div class="sm:col-span-2 rounded-xl p-3 text-sm" [class.bg-emerald-50]="test.succeeded" [class.text-emerald-700]="test.succeeded" [class.bg-rose-50]="!test.succeeded" [class.text-rose-700]="!test.succeeded">
            <i [class]="test.succeeded ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
            {{ test.message }}
          </div>
        }
      </form>
      <ng-template pTemplate="footer">
        <button pButton type="button" label="Cancel" class="p-button-text p-button-secondary" (click)="dialogVisible = false"></button>
        @if (!repairMode) {
          <button pButton type="button" label="Test connection" icon="pi pi-link" class="p-button-outlined" [loading]="testing()" [disabled]="!editor.databaseName || !editor.connectionString" (click)="testConnection()"></button>
        }
        <button pButton type="button" [label]="repairMode ? 'Repair and protect' : 'Save'" icon="pi pi-check" [loading]="saving()" [disabled]="!editor.provider || (repairMode && !editor.connectionString) || (!editingId && !editor.databaseName) || (!editingId && !editor.connectionString)" (click)="save()"></button>
      </ng-template>
    </p-dialog>
  `,
})
export class DatabaseResourcesComponent implements OnInit {
  private readonly service = inject(DatabaseResourcesService);
  private readonly notify = inject(NotifyService);

  readonly rows = signal<DatabaseResource[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly testing = signal(false);
  readonly busyId = signal<string | null>(null);
  readonly busyAction = signal<string | null>(null);
  readonly lastTest = signal<{ succeeded: boolean; message: string } | null>(null);
  readonly summaryCards = computed(() => [
    { label: 'Available', value: this.count('Available'), icon: 'pi pi-check-circle', color: 'text-emerald-500' },
    { label: 'Allocated', value: this.count('Allocated'), icon: 'pi pi-link', color: 'text-blue-500' },
    { label: 'Disabled', value: this.count('Disabled'), icon: 'pi pi-ban', color: 'text-slate-400' },
    { label: 'Failed', value: this.count('Failed'), icon: 'pi pi-exclamation-triangle', color: 'text-rose-500' },
  ]);

  dialogVisible = false;
  editingId: string | null = null;
  repairMode = false;
  repairAllocated = false;
  editor: ResourceEditor = this.emptyEditor();

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: result => { this.rows.set(result.items); this.loading.set(false); },
      error: error => { this.loading.set(false); this.notify.error(errMsg(error)); },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.repairMode = false;
    this.repairAllocated = false;
    this.editor = this.emptyEditor();
    this.lastTest.set(null);
    this.dialogVisible = true;
  }

  openEdit(row: DatabaseResource): void {
    this.editingId = row.id;
    this.repairMode = false;
    this.repairAllocated = false;
    this.editor = { provider: row.provider, databaseName: '', serverKey: '', connectionString: '' };
    this.lastTest.set(null);
    this.dialogVisible = true;
  }

  async openRepair(row: DatabaseResource): Promise<void> {
    const allocated = row.lifecycleStatus === 'Allocated';
    if (!await this.notify.confirm({
      header: 'Repair protected connection',
      message: allocated
        ? `The new connection will be tested and then applied to ${row.resourceCode} and its active workspace mapping. Continue?`
        : `The new connection will be tested and then ${row.resourceCode} will be returned to the Available pool. Continue?`,
      acceptLabel: 'Continue',
    })) return;

    this.editingId = row.id;
    this.repairMode = true;
    this.repairAllocated = allocated;
    this.editor = { provider: row.provider, databaseName: '', serverKey: '', connectionString: '' };
    this.lastTest.set(null);
    this.dialogVisible = true;
  }

  testConnection(): void {
    this.testing.set(true);
    this.lastTest.set(null);
    this.service.testConnection(this.editor.databaseName.trim(), this.editor.connectionString).subscribe({
      next: result => { this.testing.set(false); this.lastTest.set(result); result.succeeded ? this.notify.success('Connection test succeeded.') : this.notify.error(result.message); },
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
          this.dialogVisible = false;
          this.repairMode = false;
          this.repairAllocated = false;
          this.editor.connectionString = '';
          this.notify.success(result.message);
          this.load();
        },
        error: error => { this.saving.set(false); this.notify.error(errMsg(error)); },
      });
      return;
    }

    if (!this.editor.provider.trim() || (!this.editingId && !this.editor.databaseName.trim()) || (!this.editingId && !this.editor.connectionString.trim())) {
      this.notify.error('Provider, database name, and a connection string are required for a new resource.');
      return;
    }
    this.saving.set(true);
    const request = {
      provider: this.editor.provider.trim(),
      databaseName: this.editor.databaseName.trim() || undefined,
      serverKey: this.editor.serverKey.trim() || undefined,
      connectionString: this.editor.connectionString.trim() || undefined,
    };
    const operation = this.editingId ? this.service.update(this.editingId, request) : this.service.create(request);
    operation.subscribe({
      next: row => {
        this.saving.set(false);
        this.dialogVisible = false;
        this.editor.connectionString = '';
        this.rows.update(rows => this.editingId ? rows.map(item => item.id === row.id ? row : item) : [row, ...rows]);
        this.notify.success('Database resource saved in DatabaseResources.');
      },
      error: error => { this.saving.set(false); this.notify.error(errMsg(error)); },
    });
  }

  async setStatus(row: DatabaseResource, status: DatabaseResourceStatus): Promise<void> {
    const confirmed = await this.notify.confirm({
      header: `${status} resource`,
      message: status === 'Disabled' ? `Disable ${row.resourceCode}? It will not be selected for a new workspace.` : `Enable ${row.resourceCode} for workspace allocation?`,
      acceptLabel: status === 'Disabled' ? 'Disable' : 'Enable',
      danger: status === 'Disabled',
    });
    if (!confirmed) return;
    this.startBusy(row.id, 'status');
    this.service.setStatus(row.id, status).subscribe({
      next: updated => { this.finishBusy(); this.replace(updated); this.notify.success(`Resource marked ${status}.`); },
      error: error => { this.finishBusy(); this.notify.error(errMsg(error)); },
    });
  }

  async runMigrations(row: DatabaseResource): Promise<void> {
    if (!await this.notify.confirm({ header: 'Run tenant migrations', message: `Run the tenant schema migrations on ${row.resourceCode}?`, acceptLabel: 'Run migrations' })) return;
    this.startBusy(row.id, 'migrations');
    this.service.runMigrations(row.id).subscribe({
      next: result => { this.finishBusy(); this.notify.success(result.message); this.load(); },
      error: error => { this.finishBusy(); this.notify.error(errMsg(error)); this.load(); },
    });
  }

  async createBackup(row: DatabaseResource): Promise<void> {
    if (!await this.notify.confirm({ header: 'Create database backup', message: `Create a BACPAC backup for ${row.resourceCode}?`, acceptLabel: 'Create backup' })) return;
    this.startBusy(row.id, 'backup');
    this.service.backup(row.id).subscribe({
      next: () => { this.finishBusy(); this.notify.success('Backup batch started.'); this.load(); },
      error: error => { this.finishBusy(); this.notify.error(errMsg(error)); },
    });
  }

  async remove(row: DatabaseResource): Promise<void> {
    if (!await this.notify.confirm({ header: 'Delete database resource', message: `Delete ${row.resourceCode}? Linked or historical resources are rejected by the API.`, acceptLabel: 'Delete', danger: true })) return;
    this.startBusy(row.id, 'delete');
    this.service.remove(row.id).subscribe({
      next: () => { this.finishBusy(); this.rows.update(rows => rows.filter(item => item.id !== row.id)); this.notify.success('Database resource deleted.'); },
      error: error => { this.finishBusy(); this.notify.error(errMsg(error)); },
    });
  }

  statusClass(status: DatabaseResourceStatus): string {
    return status === 'Available' ? 'lf-badge-green' : status === 'Allocated' ? 'lf-badge-blue' : status === 'Failed' ? 'lf-badge-red' : status === 'Provisioning' ? 'lf-badge-yellow' : 'lf-badge-gray';
  }

  workspaceLabel(row: DatabaseResource): string {
    return row.workspaceType === 'FreelanceCoach' ? 'Freelance coach workspace' : 'Gym workspace';
  }

  provisioningLabel(row: DatabaseResource): string {
    if (!row.tenantId) return 'Waiting for allocation';
    if (row.provisioningStatus === 4) return 'Provisioning completed';
    if (row.provisioningStatus === 2) return 'Waiting for database capacity';
    if (row.provisioningStatus === 5) return 'Provisioning failed';
    return 'Provisioning in progress';
  }

  private count(status: DatabaseResourceStatus): number { return this.rows().filter(row => row.lifecycleStatus === status).length; }
  private replace(updated: DatabaseResource): void { this.rows.update(rows => rows.map(row => row.id === updated.id ? updated : row)); }
  private startBusy(id: string, action: string): void { this.busyId.set(id); this.busyAction.set(action); }
  private finishBusy(): void { this.busyId.set(null); this.busyAction.set(null); }
  private emptyEditor(): ResourceEditor { return { provider: 'ManualMonster', databaseName: '', serverKey: '', connectionString: '' }; }
}
