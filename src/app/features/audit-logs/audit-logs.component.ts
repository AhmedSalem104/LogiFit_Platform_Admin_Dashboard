import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { environment } from '../../../environments/environment';

@Component({ selector: 'app-audit-logs', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, FormsModule, TableModule, ButtonModule, PageHeaderComponent], template: `
<div class="lf-page"><app-page-header title="سجل التدقيق" subtitle="سجل العمليات الحساسة على المنصة" icon="pi pi-history"></app-page-header>
<div class="lf-card p-4 flex flex-wrap items-end gap-3"><div><label class="lf-label">اسم الكيان</label><input class="lf-input" [(ngModel)]="entityName" /></div><div><label class="lf-label">نوع العملية</label><input class="lf-input" [(ngModel)]="action" /></div><button pButton label="بحث" icon="pi pi-search" (click)="load()"></button><button pButton label="إعادة ضبط" severity="secondary" [outlined]="true" (click)="reset()"></button></div>
<div class="lf-table-shell"><p-table [value]="rows()" [loading]="loading()"><ng-template pTemplate="header"><tr><th>الوقت</th><th>العملية</th><th>الكيان</th><th>المعرّف</th><th>المستخدم</th></tr></ng-template><ng-template pTemplate="body" let-row><tr><td>{{row.timestamp | date:'medium'}}</td><td>{{row.action}}</td><td>{{row.entityName}}</td><td><code>{{row.entityId}}</code></td><td>{{row.userId || '—'}}</td></tr></ng-template><ng-template pTemplate="emptymessage"><tr><td colspan="5" class="text-center py-8">لا توجد سجلات</td></tr></ng-template></p-table></div></div>` })
export class AuditLogsComponent { private http=inject(HttpClient); private notify=inject(NotifyService); rows=signal<any[]>([]); loading=signal(false); entityName=''; action=''; ngOnInit(){this.load();} load(){this.loading.set(true); let p=new HttpParams().set('page',1).set('pageSize',100); if(this.entityName)p=p.set('entityName',this.entityName); if(this.action)p=p.set('action',this.action); this.http.get<any>(`${environment.apiUrl}/audit-logs`,{params:p}).subscribe({next:r=>{this.rows.set(r.items);this.loading.set(false)},error:e=>{this.notify.error(errMsg(e));this.loading.set(false)}})} reset(){this.entityName='';this.action='';this.load();} }
