import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { environment } from '../../../environments/environment';
@Component({selector:'app-roles',standalone:true,changeDetection:ChangeDetectionStrategy.OnPush,imports:[CommonModule,TableModule,PageHeaderComponent],template:`<div class="lf-page"><app-page-header title="الأدوار والصلاحيات" subtitle="مراجعة صلاحيات أدوار المنصة" icon="pi pi-shield"></app-page-header><div class="lf-table-shell"><p-table [value]="rows()" [loading]="loading()"><ng-template pTemplate="header"><tr><th>الدور</th><th>عدد الصلاحيات</th><th>الصلاحيات</th></tr></ng-template><ng-template pTemplate="body" let-row><tr><td><b>{{row.name}}</b></td><td>{{row.permissions?.length||0}}</td><td><div class="flex flex-wrap gap-1">@for(p of row.permissions;track p){<span class="lf-badge lf-badge-blue">{{p}}</span>}</div></td></tr></ng-template><ng-template pTemplate="emptymessage"><tr><td colspan="3" class="text-center py-8">لا توجد أدوار</td></tr></ng-template></p-table></div></div>`})
export class RolesComponent { private http=inject(HttpClient); private notify=inject(NotifyService); rows=signal<any[]>([]); loading=signal(false); ngOnInit(){this.loading.set(true);this.http.get<any[]>(`${environment.apiUrl}/roles`).subscribe({next:r=>{this.rows.set(r);this.loading.set(false)},error:e=>{this.notify.error(errMsg(e));this.loading.set(false)}})} }
