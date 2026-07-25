import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import { PagedResult } from '../../core/models/platform.models';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { environment } from '../../../environments/environment';
import { ADMIN_ASSISTANT_COMMAND_EVENT } from '../../shared/assistant/admin-assistant.service';

@Component({
  selector: 'app-administrators', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule, TableModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <div class="lf-page"><app-page-header title="مشرفو المنصة" subtitle="إنشاء وإدارة حسابات فريق تشغيل المنصة" icon="pi pi-users"><button pButton type="button" label="مشرف جديد" icon="pi pi-user-plus" (click)="openCreate()"></button></app-page-header>
      <section class="lf-card mb-5 flex items-start gap-3 border-r-4 border-r-primary-500 p-4"><i class="pi pi-lock mt-0.5 text-primary-600"></i><p class="m-0 text-sm leading-6 text-slate-600">لا يُحذف حساب المشرف حفاظًا على سجل التدقيق. يمكن لمالك المنصة فقط تعطيل أو إعادة تفعيل حسابات المشرفين.</p></section>
      <section class="lf-table-shell"><p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true"><ng-template pTemplate="header"><tr><th>الاسم</th><th>البريد الإلكتروني</th><th>الدور</th><th>الحالة</th><th class="w-28 text-center">إجراء</th></tr></ng-template><ng-template pTemplate="body" let-row><tr><td class="font-semibold text-slate-800">{{row.fullName || '—'}}</td><td dir="ltr">{{row.email}}</td><td><span class="lf-badge lf-badge-blue">{{row.role}}</span></td><td><span class="lf-badge" [class.lf-badge-green]="row.isActive" [class.lf-badge-red]="!row.isActive">{{row.isActive?'نشط':'موقوف'}}</span></td><td class="text-center">@if (row.role !== 'PlatformOwner') {<button pButton type="button" [label]="row.isActive?'تعطيل':'تفعيل'" [severity]="row.isActive?'danger':'success'" [text]="true" [loading]="busyId() === row.id" (click)="toggle(row)"></button>}</td></tr></ng-template><ng-template pTemplate="emptymessage"><tr><td colspan="5" class="py-10 text-center text-slate-400">لا يوجد مشرفون</td></tr></ng-template></p-table><app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator></section>
      <p-dialog header="إضافة مشرف منصة" [(visible)]="showCreate" [modal]="true" [style]="{width:'520px', maxWidth:'94vw'}" [draggable]="false"><div class="grid gap-4"><div><label class="lf-label">الاسم الكامل *</label><input class="lf-input" [(ngModel)]="fullName" /></div><div><label class="lf-label">البريد الإلكتروني *</label><input class="lf-input" type="email" dir="ltr" [(ngModel)]="email" /></div><div><label class="lf-label">كلمة المرور *</label><input class="lf-input" type="password" dir="ltr" [(ngModel)]="password" placeholder="12 حرفًا على الأقل" /></div></div><ng-template pTemplate="footer"><button pButton type="button" label="إلغاء" class="p-button-text p-button-secondary" (click)="showCreate=false"></button><button pButton type="button" label="إنشاء" icon="pi pi-check" [loading]="creating()" [disabled]="!canCreate()" (click)="create()"></button></ng-template></p-dialog>
    </div>`,
})
export class AdministratorsComponent implements OnInit {
  @HostListener(`window:${ADMIN_ASSISTANT_COMMAND_EVENT}`, ['$event'])
  onAssistantCommand(event: Event): void {
    if ((event as CustomEvent<{ command?: string }>).detail?.command === 'create-administrator') this.openCreate();
  }

  private http = inject(HttpClient); private notify = inject(NotifyService);
  rows = signal<any[]>([]); loading = signal(false); creating = signal(false); busyId = signal<string | null>(null);
  page = 1; pageSize = 20; totalCount = 0; showCreate = false; fullName = ''; email = ''; password = '';
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); const params = new HttpParams().set('page', this.page).set('pageSize', this.pageSize); this.http.get<PagedResult<any>>(`${environment.apiUrl}/administrators`, { params }).subscribe({ next: (response) => { this.rows.set(response.items); this.totalCount = response.totalCount; this.loading.set(false); }, error: (error) => { this.notify.error(errMsg(error)); this.loading.set(false); } }); }
  onPageChange(event: { page: number; pageSize: number }): void { this.page = event.page; this.pageSize = event.pageSize; this.load(); }
  openCreate(): void { this.fullName = ''; this.email = ''; this.password = ''; this.showCreate = true; }
  canCreate(): boolean { return !!this.fullName.trim() && !!this.email.trim() && this.password.length >= 12; }
  create(): void { if (!this.canCreate()) return; this.creating.set(true); this.http.post(`${environment.apiUrl}/administrators`, { fullName: this.fullName.trim(), email: this.email.trim(), password: this.password }).subscribe({ next: () => { this.creating.set(false); this.showCreate = false; this.notify.success('تم إنشاء المشرف'); this.load(); }, error: (error) => { this.creating.set(false); this.notify.error(errMsg(error)); } }); }
  async toggle(row: any): Promise<void> { const action = row.isActive ? 'تعطيل' : 'تفعيل'; const ok = await this.notify.confirm({ header: `${action} المشرف`, message: `هل تريد ${action} حساب ${row.email}؟`, acceptLabel: action, danger: row.isActive }); if (!ok) return; this.busyId.set(row.id); this.http.patch(`${environment.apiUrl}/administrators/${row.id}/status`, !row.isActive).subscribe({ next: () => { this.busyId.set(null); this.notify.success(`تم ${action} الحساب`); this.load(); }, error: (error) => { this.busyId.set(null); this.notify.error(errMsg(error)); } }); }
}
