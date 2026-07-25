import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { environment } from '../../../environments/environment';

@Component({ selector: 'app-invoices', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, FormsModule, TableModule, ButtonModule, PageHeaderComponent], template: `<div class="lf-page"><app-page-header title="الفواتير" subtitle="عرض ومتابعة الفواتير المالية للمنصة" icon="pi pi-file"></app-page-header><div class="lf-card p-4 flex items-end gap-3"><div><label class="lf-label">رقم الفاتورة</label><input class="lf-input" [(ngModel)]="number" /></div><button pButton label="بحث" icon="pi pi-search" (click)="load()"></button></div><div class="lf-table-shell"><p-table [value]="rows()" [loading]="loading()"><ng-template pTemplate="header"><tr><th>رقم الفاتورة</th><th>تاريخ الإصدار</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th></tr></ng-template><ng-template pTemplate="body" let-row><tr><td><b>{{row.invoiceNumber}}</b></td><td>{{row.issueDate | date:'mediumDate'}}</td><td>{{row.total | number:'1.2-2'}}</td><td>{{row.amountPaid | number:'1.2-2'}}</td><td>{{(row.total-row.amountPaid) | number:'1.2-2'}}</td><td>{{row.status}}</td></tr></ng-template><ng-template pTemplate="emptymessage"><tr><td colspan="6" class="text-center py-8">لا توجد فواتير</td></tr></ng-template></p-table></div></div>` })
export class InvoicesComponent { private http=inject(HttpClient); private notify=inject(NotifyService); rows=signal<any[]>([]); loading=signal(false); number=''; ngOnInit(){this.load();} load(){this.loading.set(true);let p=new HttpParams().set('page',1).set('pageSize',100);if(this.number)p=p.set('number',this.number);this.http.get<any>(`${environment.apiUrl}/invoices`,{params:p}).subscribe({next:r=>{this.rows.set(r.items);this.loading.set(false)},error:e=>{this.notify.error(errMsg(e));this.loading.set(false)}})} }
