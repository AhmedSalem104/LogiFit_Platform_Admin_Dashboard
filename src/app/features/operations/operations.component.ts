import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import { PagedResult } from '../../core/models/platform.models';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-operations', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonModule, TableModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <div class="lf-page"><app-page-header title="مراقبة العمليات" subtitle="سجل تنفيذ المهام ورسائل الـOutbox؛ القراءة فقط لحماية الاتساق" icon="pi pi-cog"><button pButton type="button" label="تحديث" icon="pi pi-refresh" [loading]="loading()" (click)="load()"></button></app-page-header>
      <div class="grid grid-cols-1 gap-5 2xl:grid-cols-2"><section class="lf-table-shell"><div class="border-b border-slate-100 px-5 py-4"><h2 class="m-0 text-base font-extrabold text-slate-800">سجل تنفيذ المهام</h2><p class="mb-0 mt-1 text-xs text-slate-500">متابعة الفشل ووقت التنفيذ ومحاولات إعادة التشغيل</p></div><p-table [value]="jobs()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true"><ng-template pTemplate="header"><tr><th>المهمة</th><th>الحالة</th><th>وقت البدء</th><th>المحاولات</th></tr></ng-template><ng-template pTemplate="body" let-row><tr><td class="font-semibold">{{row.jobName}}</td><td><span class="lf-badge" [class.lf-badge-green]="row.status === 'Succeeded'" [class.lf-badge-red]="row.status === 'Failed'" [class.lf-badge-gray]="row.status !== 'Succeeded' && row.status !== 'Failed'">{{row.status}}</span></td><td>{{row.startedAtUtc | date:'medium'}}</td><td class="tabular-nums">{{row.attemptCount}}</td></tr></ng-template><ng-template pTemplate="emptymessage"><tr><td colspan="4" class="py-10 text-center text-slate-400">لا توجد عمليات مسجلة</td></tr></ng-template></p-table><app-server-paginator [page]="jobsPage" [pageSize]="jobsPageSize" [totalCount]="jobsTotal" (pageChange)="onJobsPageChange($event)"></app-server-paginator></section>
      <section class="lf-table-shell"><div class="border-b border-slate-100 px-5 py-4"><h2 class="m-0 text-base font-extrabold text-slate-800">رسائل Outbox</h2><p class="mb-0 mt-1 text-xs text-slate-500">رسائل التكامل والتنبيهات التي تنتظر المعالجة أو فشلت</p></div><p-table [value]="outbox()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true"><ng-template pTemplate="header"><tr><th>النوع</th><th>الإنشاء</th><th>المعالجة</th><th>المحاولات</th></tr></ng-template><ng-template pTemplate="body" let-row><tr><td class="max-w-60 truncate font-semibold" [title]="row.type">{{row.type}}</td><td>{{row.occurredAtUtc | date:'medium'}}</td><td><span class="lf-badge" [class.lf-badge-green]="row.processedAtUtc" [class.lf-badge-yellow]="!row.processedAtUtc">{{row.processedAtUtc ? 'تمت' : 'قيد الانتظار'}}</span></td><td class="tabular-nums">{{row.attemptCount}}</td></tr></ng-template><ng-template pTemplate="emptymessage"><tr><td colspan="4" class="py-10 text-center text-slate-400">لا توجد رسائل</td></tr></ng-template></p-table><app-server-paginator [page]="outboxPage" [pageSize]="outboxPageSize" [totalCount]="outboxTotal" (pageChange)="onOutboxPageChange($event)"></app-server-paginator></section></div>
    </div>`,
})
export class OperationsComponent implements OnInit {
  private http = inject(HttpClient); private notify = inject(NotifyService); jobs = signal<any[]>([]); outbox = signal<any[]>([]); loading = signal(false);
  jobsPage = 1; jobsPageSize = 20; jobsTotal = 0; outboxPage = 1; outboxPageSize = 20; outboxTotal = 0;
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); const jobsParams = new HttpParams().set('page', this.jobsPage).set('pageSize', this.jobsPageSize); const outboxParams = new HttpParams().set('page', this.outboxPage).set('pageSize', this.outboxPageSize); forkJoin({ jobs: this.http.get<PagedResult<any>>(`${environment.apiUrl}/operations/jobs`, { params: jobsParams }), outbox: this.http.get<PagedResult<any>>(`${environment.apiUrl}/operations/outbox`, { params: outboxParams }) }).subscribe({ next: ({ jobs, outbox }) => { this.jobs.set(jobs.items); this.jobsTotal = jobs.totalCount; this.outbox.set(outbox.items); this.outboxTotal = outbox.totalCount; this.loading.set(false); }, error: (error) => { this.notify.error(errMsg(error)); this.loading.set(false); } }); }
  onJobsPageChange(event: { page: number; pageSize: number }): void { this.jobsPage = event.page; this.jobsPageSize = event.pageSize; this.load(); }
  onOutboxPageChange(event: { page: number; pageSize: number }): void { this.outboxPage = event.page; this.outboxPageSize = event.pageSize; this.load(); }
}
