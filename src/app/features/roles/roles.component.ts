import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import { PagedResult } from '../../core/models/platform.models';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-roles', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonModule, TableModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <div class="lf-page"><app-page-header title="الأدوار والصلاحيات" subtitle="تعيين أقل صلاحية لازمة لفريق تشغيل المنصة" icon="pi pi-shield"></app-page-header>
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section class="lf-table-shell"><p-table [value]="roles()" [loading]="loading()" styleClass="p-datatable-sm"><ng-template pTemplate="header"><tr><th>الدور</th><th>الصلاحيات</th><th class="w-24 text-center">إجراء</th></tr></ng-template><ng-template pTemplate="body" let-row><tr [class.bg-primary-50]="selected()?.id === row.id"><td class="font-semibold">{{row.name}}</td><td><span class="lf-badge lf-badge-blue">{{row.permissions?.length || 0}} صلاحية</span></td><td class="text-center"><button pButton type="button" label="إدارة" class="p-button-sm p-button-text" (click)="select(row)"></button></td></tr></ng-template><ng-template pTemplate="emptymessage"><tr><td colspan="3" class="py-10 text-center text-slate-400">لا توجد أدوار</td></tr></ng-template></p-table><app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator></section>
        <section class="lf-card p-5">@if (selected(); as role) {<div class="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 class="m-0 text-lg font-extrabold text-slate-800">صلاحيات {{role.name}}</h2><p class="mb-0 mt-1 text-sm text-slate-500">حفظ التغييرات يحدّث صلاحيات مستخدمي الدور فورًا.</p></div><button pButton type="button" label="حفظ الصلاحيات" icon="pi pi-save" [loading]="saving()" (click)="save()"></button></div><div class="grid max-h-[560px] grid-cols-1 gap-2 overflow-auto pr-1 sm:grid-cols-2">@for (permission of catalog(); track permission.code) {<label class="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-100 p-3 hover:bg-slate-50"><input type="checkbox" [checked]="has(permission.code)" (change)="toggle(permission.code)"/><span class="min-w-0"><b class="block text-sm text-slate-700">{{permission.displayName || permission.code}}</b><small class="text-slate-400" dir="ltr">{{permission.code}}</small></span></label>}</div>} @else {<div class="flex min-h-64 flex-col items-center justify-center text-center text-slate-400"><i class="pi pi-shield mb-3 text-4xl"></i><p class="m-0">اختر دورًا لإدارة صلاحياته</p></div>}</section>
      </div>
    </div>`,
})
export class RolesComponent implements OnInit {
  private http = inject(HttpClient); private notify = inject(NotifyService);
  roles = signal<any[]>([]); catalog = signal<any[]>([]); selected = signal<any | null>(null); chosen = signal<Set<string>>(new Set()); loading = signal(false); saving = signal(false);
  page = 1; pageSize = 20; totalCount = 0;
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); const params = new HttpParams().set('page', this.page).set('pageSize', this.pageSize); this.http.get<PagedResult<any>>(`${environment.apiUrl}/roles`, { params }).subscribe({ next: (response) => { this.roles.set(response.items.map((role: any) => ({ ...role, name: role.nameAr || role.name }))); this.totalCount = response.totalCount; this.loadCatalog(); }, error: (error) => this.fail(error) }); }
  private loadCatalog(): void { this.http.get<any[]>(`${environment.apiUrl}/roles/permissions`).subscribe({ next: (items) => { this.catalog.set(items.map((item: any) => ({ ...item, displayName: item.displayNameAr || item.displayName }))); this.loading.set(false); }, error: (error) => this.fail(error) }); }
  onPageChange(event: { page: number; pageSize: number }): void { this.page = event.page; this.pageSize = event.pageSize; this.selected.set(null); this.load(); }
  select(role: any): void { this.selected.set(role); this.chosen.set(new Set(role.permissions || [])); }
  has(code: string): boolean { return this.chosen().has(code); }
  toggle(code: string): void { const next = new Set(this.chosen()); next.has(code) ? next.delete(code) : next.add(code); this.chosen.set(next); }
  save(): void { const role = this.selected(); if (!role) return; this.saving.set(true); this.http.put(`${environment.apiUrl}/roles/${role.id}/permissions`, { permissionCodes: [...this.chosen()] }).subscribe({ next: () => { this.saving.set(false); this.notify.success('تم حفظ الصلاحيات'); this.load(); }, error: (error) => { this.saving.set(false); this.notify.error(errMsg(error)); } }); }
  private fail(error: any): void { this.notify.error(errMsg(error)); this.loading.set(false); }
}
