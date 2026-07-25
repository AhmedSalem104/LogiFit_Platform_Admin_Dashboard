import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { BackupsService, BackupRecord } from './backups.service';

@Component({
  selector: 'app-backups', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TableModule, ButtonModule, PageHeaderComponent],
  template: `
    <app-page-header title="Backups" subtitle="Daily SQL Server backups; retention is configured on the server." icon="pi pi-database"></app-page-header>
    <div class="lf-card p-4 mb-4 flex items-center justify-between gap-4">
      <div><strong>Retention</strong><p class="text-slate-500 text-sm m-0">The service retains the last 7 days and never exposes database credentials.</p></div>
      <button pButton label="Create backup now" icon="pi pi-save" [loading]="creating()" (click)="create()"></button>
    </div>
    <div class="lf-card overflow-hidden"><p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm">
      <ng-template pTemplate="header"><tr><th>File</th><th>Created</th><th>Size</th><th>Status</th></tr></ng-template>
      <ng-template pTemplate="body" let-row><tr><td><code>{{ row.fileName }}</code></td><td>{{ row.createdAt | date:'medium' }}</td><td>{{ (row.sizeBytes / 1048576) | number:'1.1-1' }} MB</td><td>{{ row.status }}</td></tr></ng-template>
      <ng-template pTemplate="emptymessage"><tr><td colspan="4" class="text-center py-8 text-slate-400">No backups found</td></tr></ng-template>
    </p-table></div>
  `,
})
export class BackupsComponent implements OnInit {
  private service = inject(BackupsService); private notify = inject(NotifyService);
  rows = signal<BackupRecord[]>([]); loading = signal(false); creating = signal(false);
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); this.service.list().subscribe({ next: x => { this.rows.set(x); this.loading.set(false); }, error: e => { this.notify.error(errMsg(e)); this.loading.set(false); } }); }
  create(): void { if (!confirm('هل تريد إنشاء نسخة احتياطية لقاعدة البيانات الآن؟')) return; this.creating.set(true); this.service.create().subscribe({ next: x => { this.rows.update(rows => [x, ...rows]); this.notify.success('تم إنشاء النسخة الاحتياطية بنجاح'); this.creating.set(false); }, error: e => { this.notify.error(errMsg(e)); this.creating.set(false); } }); }
}
