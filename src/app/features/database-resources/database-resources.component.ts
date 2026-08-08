import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { ServerPaginatorComponent, PageChange } from '../../shared/ui/server-paginator.component';
import {
  DatabaseResource,
  DatabaseResourceStatus,
  DatabaseResourcesService,
  RegisterDatabaseResourceCommand,
} from './database-resources.service';

@Component({
  selector: 'app-database-resources',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, ButtonModule, DialogModule, TableModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <app-page-header
      title="Database Resources"
      subtitle="Review the protected workspace database pool and its server-owned lifecycle state."
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
          <p class="m-0 font-extrabold">Protected resource pool</p>
          <p class="mb-0 mt-1">Registering accepts the connection string only over the protected server API. The value is encrypted immediately, never returned, and never displayed in this screen. Migrations, health checks, assignment, and backups remain server-managed.</p>
          <a routerLink="/backups" class="mt-2 inline-flex items-center gap-2 font-bold text-blue-700 hover:underline">
            Open Backup Center <i class="pi pi-arrow-right text-xs"></i>
          </a>
        </div>
      </div>
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
            <th>Health</th>
            <th>Schema</th>
            <th class="text-center">Scope</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>
              <div class="font-bold text-slate-800" dir="ltr">{{ shortId(row.id) }}</div>
              <div class="mt-1 text-xs text-slate-500" dir="ltr">{{ row.provider }}</div>
              <div class="mt-1 text-[11px] text-slate-400">{{ row.hasProtectedConnection ? 'Protected connection saved' : 'Protected connection not configured' }}</div>
            </td>
            <td><span class="lf-badge" [ngClass]="statusClass(row.status)">{{ statusLabel(row.status) }}</span></td>
            <td>
              @if (row.tenantName) {
                <div class="font-semibold text-slate-700">{{ row.tenantName }}</div>
                <div class="text-xs text-slate-500">Assigned workspace</div>
              } @else {
                <span class="text-sm text-slate-400">Not allocated</span>
              }
            </td>
            <td>
              <div class="text-sm text-slate-700">{{ row.lastHealthCheckAtUtc ? formatDate(row.lastHealthCheckAtUtc) : 'Not checked' }}</div>
              @if (row.sizeBytes !== null) { <div class="text-xs text-slate-500">{{ formatSize(row.sizeBytes) }}</div> }
            </td>
            <td><span class="text-sm text-slate-700" dir="ltr">{{ row.schemaVersion || 'Not recorded' }}</span></td>
            <td class="text-center"><span class="lf-badge lf-badge-gray">Server-managed</span></td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="6" class="py-14 text-center text-slate-400"><i class="pi pi-database mb-2 block text-3xl opacity-40"></i>No database resources registered.</td></tr>
        </ng-template>
      </p-table>
      <app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator>
    </section>

    <p-dialog header="Register database resource" [(visible)]="showRegister" [modal]="true" [style]="{ width: '620px', maxWidth: '95vw' }" [draggable]="false">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label class="lf-label">Provider<select class="lf-input" [(ngModel)]="registerProvider"><option value="ManualMonster">ManualMonster</option><option value="LocalSql">LocalSql</option></select></label>
        <label class="lf-label">Database label *<input class="lf-input" [(ngModel)]="registerDatabaseName" placeholder="tenant-db-01" /></label>
        <label class="lf-label sm:col-span-2">Server key / note<input class="lf-input" [(ngModel)]="registerServerKey" placeholder="Optional operator reference" /></label>
        <label class="lf-label sm:col-span-2">Connection string *<textarea class="lf-input" rows="4" [(ngModel)]="registerConnectionString" autocomplete="off" placeholder="Entered once; never displayed after save"></textarea></label>
      </div>
      <p class="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800"><i class="pi pi-lock me-1"></i> The server encrypts this value before persistence. It is used only inside provisioning/health/backup services.</p>
      <ng-template pTemplate="footer"><button pButton label="Cancel" class="p-button-text p-button-secondary" (click)="showRegister = false"></button><button pButton label="Register securely" icon="pi pi-lock" [loading]="registering()" [disabled]="registering()" (click)="register()"></button></ng-template>
    </p-dialog>
  `,
})
export class DatabaseResourcesComponent implements OnInit {
  private readonly service = inject(DatabaseResourcesService);
  private readonly notify = inject(NotifyService);

  readonly rows = signal<DatabaseResource[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly summaryCards = computed(() => [
    { label: 'Available', value: this.count(DatabaseResourceStatus.Available), icon: 'pi pi-check-circle', color: 'text-emerald-500' },
    { label: 'Assigned', value: this.count(DatabaseResourceStatus.Assigned), icon: 'pi pi-link', color: 'text-blue-500' },
    { label: 'In progress', value: this.rows().filter(row => [DatabaseResourceStatus.Reserved, DatabaseResourceStatus.Provisioning, DatabaseResourceStatus.RestorePending].includes(row.status)).length, icon: 'pi pi-spin pi-spinner', color: 'text-amber-500' },
    { label: 'Needs review', value: this.rows().filter(row => [DatabaseResourceStatus.Maintenance, DatabaseResourceStatus.Faulted, DatabaseResourceStatus.Retired].includes(row.status)).length, icon: 'pi pi-exclamation-triangle', color: 'text-rose-500' },
  ]);
  readonly registering = signal(false);
  showRegister = false;
  registerProvider: 'ManualMonster' | 'LocalSql' = 'ManualMonster';
  registerDatabaseName = '';
  registerServerKey = '';
  registerConnectionString = '';

  page = 1;
  pageSize = 20;
  totalCount = 0;

  ngOnInit(): void { this.load(); }

  openRegister(): void { this.showRegister = true; }

  register(): void {
    if (!this.registerDatabaseName.trim() || !this.registerConnectionString.trim()) {
      this.notify.error('Provider, database label, and connection string are required.');
      return;
    }
    const command: RegisterDatabaseResourceCommand = {
      provider: this.registerProvider,
      databaseName: this.registerDatabaseName.trim(),
      serverKey: this.registerServerKey.trim() || undefined,
      connectionString: this.registerConnectionString.trim(),
    };
    this.registering.set(true);
    this.service.register(command).subscribe({
      next: () => {
        this.registering.set(false);
        this.showRegister = false;
        this.registerDatabaseName = '';
        this.registerServerKey = '';
        this.registerConnectionString = '';
        this.notify.success('Database resource registered securely.');
        this.load();
      },
      error: error => { this.registering.set(false); this.notify.error(errMsg(error)); },
    });
  }

  load(page = this.page, pageSize = this.pageSize): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.page = page;
    this.pageSize = pageSize;
    this.service.list(page, pageSize).subscribe({
      next: result => {
        this.rows.set(result.items);
        this.totalCount = result.totalCount;
        this.page = result.page;
        this.pageSize = result.pageSize;
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

  statusLabel(status: DatabaseResourceStatus): string {
    return {
      [DatabaseResourceStatus.Available]: 'Available',
      [DatabaseResourceStatus.Reserved]: 'Reserved',
      [DatabaseResourceStatus.Provisioning]: 'Provisioning',
      [DatabaseResourceStatus.Assigned]: 'Assigned',
      [DatabaseResourceStatus.Maintenance]: 'Maintenance',
      [DatabaseResourceStatus.RestorePending]: 'Restore pending',
      [DatabaseResourceStatus.Faulted]: 'Faulted',
      [DatabaseResourceStatus.Retired]: 'Retired',
    }[status] || 'Unknown';
  }

  statusClass(status: DatabaseResourceStatus): string {
    if (status === DatabaseResourceStatus.Available) return 'lf-badge-green';
    if (status === DatabaseResourceStatus.Assigned) return 'lf-badge-blue';
    if ([DatabaseResourceStatus.Reserved, DatabaseResourceStatus.Provisioning, DatabaseResourceStatus.RestorePending].includes(status)) return 'lf-badge-yellow';
    if (status === DatabaseResourceStatus.Faulted) return 'lf-badge-red';
    return 'lf-badge-gray';
  }

  shortId(id: string): string { return id.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id; }

  formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Invalid timestamp' : date.toLocaleString();
  }

  formatSize(value: number | null): string {
    if (value === null || value < 0) return '—';
    if (value < 1024) return `${value} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let size = value;
    let unit = 'B';
    for (const candidate of units) {
      size /= 1024;
      unit = candidate;
      if (size < 1024 || candidate === 'TB') break;
    }
    return `${size.toFixed(size >= 10 ? 0 : 1)} ${unit}`;
  }

  private count(status: DatabaseResourceStatus): number { return this.rows().filter(row => row.status === status).length; }
}
