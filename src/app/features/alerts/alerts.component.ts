import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import { PagedResult } from '../../core/models/platform.models';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-alerts', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <div class="lf-page"><app-page-header title="مركز التنبيهات" subtitle="متابعة أعطال المهام والـOutbox والمدفوعات التي تحتاج تدخلاً" icon="pi pi-bell"><button pButton type="button" label="تحديث" icon="pi pi-refresh" [loading]="loading()" (click)="load()"></button></app-page-header>
      @if (alerts().length) {<section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div class="divide-y divide-slate-100">@for (alert of alerts(); track alert.title + alert.occurredAtUtc + alert.message) {<article class="flex gap-4 p-5" [class.bg-red-50]="alert.severity === 'error'"><span class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" [class.bg-red-100]="alert.severity === 'error'" [class.text-red-600]="alert.severity === 'error'" [class.bg-amber-100]="alert.severity !== 'error'" [class.text-amber-600]="alert.severity !== 'error'"><i [class]="alert.severity === 'error' ? 'pi pi-times-circle' : 'pi pi-exclamation-triangle'"></i></span><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center justify-between gap-2"><h2 class="m-0 text-sm font-extrabold text-slate-800">{{alert.title}}</h2><time class="text-xs text-slate-400">{{alert.occurredAtUtc | date:'medium'}}</time></div><p class="mb-0 mt-1 text-sm text-slate-600">{{alert.message}}</p>@if (alert.detail) {<p class="mb-0 mt-2 break-words rounded-lg bg-slate-950 px-3 py-2 font-mono text-xs text-slate-200" dir="ltr">{{alert.detail}}</p>}</div></article>}</div><app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator></section>} @else if (!loading()) {<section class="lf-card p-10 text-center"><i class="pi pi-check-circle text-4xl text-emerald-500"></i><h2 class="mb-0 mt-3 text-lg font-extrabold text-slate-800">لا توجد تنبيهات تحتاج إجراء</h2><p class="mb-0 mt-1 text-sm text-slate-500">المهام والرسائل والمدفوعات تبدو مستقرة حاليًا.</p></section>}
    </div>`,
})
export class AlertsComponent implements OnInit {
  private http = inject(HttpClient); private notify = inject(NotifyService); alerts = signal<any[]>([]); loading = signal(false); page = 1; pageSize = 20; totalCount = 0;
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); const params = new HttpParams().set('page', this.page).set('pageSize', this.pageSize); this.http.get<PagedResult<any>>(`${environment.apiUrl}/alerts`, { params }).subscribe({ next: (response) => { this.alerts.set(response.items); this.totalCount = response.totalCount; this.loading.set(false); }, error: (error) => { this.notify.error(errMsg(error)); this.loading.set(false); } }); }
  onPageChange(event: { page: number; pageSize: number }): void { this.page = event.page; this.pageSize = event.pageSize; this.load(); }
}
