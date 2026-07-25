import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { BackupsService, BackupRecord, BackupStatus } from './backups.service';

@Component({
  selector: 'app-backups', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TableModule, ButtonModule, PageHeaderComponent],
  template: `
    <app-page-header title="النسخ الاحتياطية" subtitle="تصدير فعلي للـ Schema والـ Data بصيغة BACPAC في مساحة خاصة." icon="pi pi-database"></app-page-header>

    <section class="lf-card mb-4 overflow-hidden" aria-live="polite">
      <ng-container *ngIf="status() as backupStatus; else statusPending">
        <div class="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-start gap-3">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              [class.bg-emerald-50]="backupStatus.isReady" [class.text-emerald-600]="backupStatus.isReady"
              [class.bg-amber-50]="!backupStatus.isReady" [class.text-amber-600]="!backupStatus.isReady">
              <i class="pi" [class.pi-check-circle]="backupStatus.isReady" [class.pi-exclamation-triangle]="!backupStatus.isReady"></i>
            </span>
            <div>
              <h2 class="m-0 text-base font-bold text-slate-900">{{ backupStatus.isReady ? 'خدمة النسخ جاهزة' : 'خدمة النسخ تحتاج إعدادًا' }}</h2>
              <p class="mb-0 mt-1 text-sm text-slate-500">{{ backupStatus.isReady ? 'يمكنك إنشاء نسخة يدوية الآن، وسيعمل الجدول اليومي تلقائيًا.' : backupStatus.unavailableReason }}</p>
            </div>
          </div>
          <button pButton label="إنشاء نسخة احتياطية الآن" icon="pi pi-save" [loading]="creating()"
            [disabled]="!backupStatus.isReady" (click)="create()"></button>
        </div>
        <div class="grid grid-cols-2 border-t border-slate-100 bg-slate-50 sm:grid-cols-4">
          <div class="border-b border-slate-100 p-4 sm:border-b-0 sm:border-l"><p class="m-0 text-xs text-slate-500">الصيغة</p><strong class="mt-1 block text-sm text-slate-800">{{ backupStatus.format }}</strong></div>
          <div class="border-b border-slate-100 p-4 sm:border-b-0 sm:border-l"><p class="m-0 text-xs text-slate-500">مدة الاحتفاظ</p><strong class="mt-1 block text-sm text-slate-800">{{ backupStatus.retentionDays }} أيام</strong></div>
          <div class="border-b border-slate-100 p-4 sm:border-b-0 sm:border-l"><p class="m-0 text-xs text-slate-500">النسخ الموجودة</p><strong class="mt-1 block text-sm text-slate-800">{{ backupStatus.backupCount }}</strong></div>
          <div class="p-4"><p class="m-0 text-xs text-slate-500">الجدولة اليومية UTC</p><strong class="mt-1 block text-sm text-slate-800">{{ backupStatus.runAtUtc }}</strong></div>
        </div>
      </ng-container>
      <ng-template #statusPending>
        <div class="p-5 text-sm text-slate-500"><i class="pi pi-spin pi-spinner ml-2"></i> جارٍ التحقق من جاهزية النسخ الاحتياطي…</div>
      </ng-template>
    </section>

    <div class="lf-card overflow-hidden">
      <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm">
        <ng-template pTemplate="header"><tr><th>الملف</th><th>تاريخ الإنشاء</th><th>الحجم</th><th>الحالة</th></tr></ng-template>
        <ng-template pTemplate="body" let-row><tr><td><code>{{ row.fileName }}</code></td><td>{{ row.createdAt | date:'medium' }}</td><td>{{ (row.sizeBytes / 1048576) | number:'1.1-1' }} MB</td><td><span class="text-emerald-600">{{ row.status }}</span></td></tr></ng-template>
        <ng-template pTemplate="emptymessage"><tr><td colspan="4" class="py-8 text-center text-slate-400">لا توجد نسخ مكتملة حتى الآن</td></tr></ng-template>
      </p-table>
    </div>
  `,
})
export class BackupsComponent implements OnInit {
  private service = inject(BackupsService); private notify = inject(NotifyService);
  rows = signal<BackupRecord[]>([]); loading = signal(false); creating = signal(false); status = signal<BackupStatus | null>(null);

  ngOnInit(): void { this.loadStatus(); }

  loadStatus(): void {
    this.service.status().subscribe({
      next: status => { this.status.set(status); this.load(); },
      error: () => {
        this.status.set({ isEnabled: false, isReady: false, format: 'BACPAC', retentionDays: 7, runAtUtc: '--:--', backupCount: 0, unavailableReason: 'لا يدعم إصدار الخادم الحالي فحص جاهزية النسخ. انشر تحديث النسخ الاحتياطي أولًا.' });
        this.load();
      },
    });
  }

  load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: rows => { this.rows.set(rows); this.loading.set(false); },
      error: error => { this.notify.error(errMsg(error)); this.loading.set(false); },
    });
  }

  create(): void {
    const status = this.status();
    if (!status?.isReady) { this.notify.error(status?.unavailableReason ?? 'خدمة النسخ الاحتياطي غير جاهزة.'); return; }
    if (!confirm('هل تريد إنشاء نسخة احتياطية كاملة لقاعدة البيانات الآن؟')) return;

    this.creating.set(true);
    this.service.create().subscribe({
      next: backup => {
        this.rows.update(rows => [backup, ...rows]);
        this.notify.success('تم إنشاء النسخة الاحتياطية بنجاح.');
        this.creating.set(false);
        this.loadStatus();
      },
      error: error => { this.notify.error(errMsg(error)); this.creating.set(false); this.loadStatus(); },
    });
  }
}
