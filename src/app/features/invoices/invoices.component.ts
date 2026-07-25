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
  selector: 'app-invoices', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <div class="lf-page"><app-page-header title="الفواتير" subtitle="سجل مالي غير قابل للتعديل؛ أي تصحيح يتم بعملية عكسية موثقة" icon="pi pi-file"></app-page-header>
      <section class="lf-card mb-5 flex flex-wrap items-end gap-3 p-4"><div><label class="lf-label">رقم الفاتورة</label><input class="lf-input" [(ngModel)]="number" (keyup.enter)="search()" dir="ltr" /></div><button pButton type="button" label="بحث" icon="pi pi-search" (click)="search()"></button><button pButton type="button" label="إعادة ضبط" class="p-button-text p-button-secondary" (click)="reset()"></button></section>
      <section class="lf-table-shell"><p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true"><ng-template pTemplate="header"><tr><th>رقم الفاتورة</th><th>تاريخ الإصدار</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th></tr></ng-template><ng-template pTemplate="body" let-row><tr><td><b dir="ltr">{{row.invoiceNumber}}</b></td><td>{{row.issueDate | date:'mediumDate'}}</td><td class="tabular-nums">{{row.total | number:'1.2-2'}}</td><td class="tabular-nums">{{row.amountPaid | number:'1.2-2'}}</td><td class="font-semibold tabular-nums">{{(row.total-row.amountPaid) | number:'1.2-2'}}</td><td><span class="lf-badge lf-badge-gray">{{row.status}}</span></td></tr></ng-template><ng-template pTemplate="emptymessage"><tr><td colspan="6" class="py-10 text-center text-slate-400">لا توجد فواتير مطابقة</td></tr></ng-template></p-table><app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator></section>
    </div>`,
})
export class InvoicesComponent implements OnInit {
  private http = inject(HttpClient); private notify = inject(NotifyService);
  rows = signal<any[]>([]); loading = signal(false); number = ''; page = 1; pageSize = 20; totalCount = 0;
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); let params = new HttpParams().set('page', this.page).set('pageSize', this.pageSize); if (this.number.trim()) params = params.set('number', this.number.trim()); this.http.get<PagedResult<any>>(`${environment.apiUrl}/invoices`, { params }).subscribe({ next: (response) => { this.rows.set(response.items); this.totalCount = response.totalCount; this.loading.set(false); }, error: (error) => { this.notify.error(errMsg(error)); this.loading.set(false); } }); }
  search(): void { this.page = 1; this.load(); }
  reset(): void { this.number = ''; this.search(); }
  onPageChange(event: { page: number; pageSize: number }): void { this.page = event.page; this.pageSize = event.pageSize; this.load(); }
}
