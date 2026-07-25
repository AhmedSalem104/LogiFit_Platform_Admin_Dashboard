import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import { PagedResult } from '../../core/models/platform.models';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-audit-logs', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <div class="lf-page"><app-page-header title="سجل التدقيق" subtitle="سجل غير قابل للتعديل للعمليات الحساسة على المنصة" icon="pi pi-history"></app-page-header>
      <section class="lf-card mb-5 grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]"><div><label class="lf-label">اسم الكيان</label><input class="lf-input" [(ngModel)]="entityName" (keyup.enter)="search()" placeholder="Tenant / Plan" /></div><div><label class="lf-label">نوع العملية</label><input class="lf-input" [(ngModel)]="action" (keyup.enter)="search()" placeholder="Created / Updated" /></div><button pButton type="button" label="بحث" icon="pi pi-search" (click)="search()"></button><button pButton type="button" label="إعادة ضبط" class="p-button-text p-button-secondary" (click)="reset()"></button></section>
      <section class="lf-table-shell"><p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true"><ng-template pTemplate="header"><tr><th>الوقت</th><th>العملية</th><th>الكيان</th><th>المعرّف</th><th>المستخدم</th></tr></ng-template><ng-template pTemplate="body" let-row><tr><td>{{row.timestamp | date:'medium'}}</td><td><span class="lf-badge lf-badge-blue">{{row.action}}</span></td><td>{{row.entityName}}</td><td><code class="text-xs" dir="ltr">{{row.entityId}}</code></td><td><code class="text-xs" dir="ltr">{{row.userId || '—'}}</code></td></tr></ng-template><ng-template pTemplate="emptymessage"><tr><td colspan="5" class="py-10 text-center text-slate-400">لا توجد سجلات مطابقة</td></tr></ng-template></p-table><app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator></section>
    </div>`,
})
export class AuditLogsComponent implements OnInit {
  private http = inject(HttpClient); private notify = inject(NotifyService); rows = signal<any[]>([]); loading = signal(false); entityName = ''; action = ''; page = 1; pageSize = 20; totalCount = 0;
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); let params = new HttpParams().set('page', this.page).set('pageSize', this.pageSize); if (this.entityName.trim()) params = params.set('entityName', this.entityName.trim()); if (this.action.trim()) params = params.set('action', this.action.trim()); this.http.get<PagedResult<any>>(`${environment.apiUrl}/audit-logs`, { params }).subscribe({ next: (response) => { this.rows.set(response.items); this.totalCount = response.totalCount; this.loading.set(false); }, error: (error) => { this.notify.error(errMsg(error)); this.loading.set(false); } }); }
  search(): void { this.page = 1; this.load(); }
  reset(): void { this.entityName = ''; this.action = ''; this.search(); }
  onPageChange(event: { page: number; pageSize: number }): void { this.page = event.page; this.pageSize = event.pageSize; this.load(); }
}
