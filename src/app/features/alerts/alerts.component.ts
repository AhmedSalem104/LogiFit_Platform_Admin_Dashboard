import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { PagedResult } from '../../core/models/platform.models';
import { environment } from '../../../environments/environment';

type NotificationItem = { id: string; title: string; body: string; type: number; isRead: boolean; readAt?: string; createdAt: string };
type NotificationResponse = PagedResult<NotificationItem> & { unreadCount: number };

@Component({
  selector: 'app-alerts', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <div class="lf-page">
      <app-page-header title="مركز الإشعارات" subtitle="تابع التنبيهات والإجراءات المطلوبة من مكان واحد" icon="pi pi-bell">
        <button class="lf-btn lf-btn-secondary" type="button" (click)="load()"><i class="pi pi-refresh"></i> تحديث</button>
        <button class="lf-btn lf-btn-primary" type="button" [disabled]="!unreadCount() || markAllBusy()" [attr.aria-busy]="markAllBusy()" (click)="markAllRead()"><i class="pi pi-check-circle"></i> {{ markAllBusy() ? 'جارٍ التعليم...' : 'تعليم الكل كمقروء' }}</button>
      </app-page-header>
      <section class="lf-card p-4 sm:p-5">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-[1fr_12rem_10rem]">
          <label class="lf-input flex items-center gap-2"><i class="pi pi-search text-slate-400"></i><input class="min-w-0 flex-1 border-0 bg-transparent p-0 outline-none" [(ngModel)]="search" (ngModelChange)="refresh()" placeholder="ابحث في العنوان أو التفاصيل" aria-label="بحث الإشعارات"></label>
          <select class="lf-input" [(ngModel)]="type" (ngModelChange)="refresh()"><option [ngValue]="null">كل الأنواع</option><option [ngValue]="1">عام</option><option [ngValue]="4">انتهاء اشتراك</option><option [ngValue]="5">مخصص</option></select>
          <select class="lf-input" [(ngModel)]="readFilter" (ngModelChange)="refresh()"><option [ngValue]="null">الكل</option><option [ngValue]="false">غير مقروء</option><option [ngValue]="true">مقروء</option></select>
        </div>
        <div class="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{{ totalCount | number }} إشعار</span><span class="lf-chip" [class.bg-rose-50]="unreadCount()" [class.text-rose-700]="unreadCount()">{{ unreadCount() | number }} غير مقروء</span></div>
      </section>
      @if (loading()) { <section class="grid gap-3">@for (item of [1,2,3,4]; track item) {<div class="lf-card h-24 animate-pulse bg-slate-50"></div>}</section> }
      @else if (items().length) { <section class="lf-card overflow-hidden"><div class="divide-y divide-slate-100">@for (item of items(); track item.id) {<article class="notification-row flex gap-4 p-4 sm:p-5" [class.notification-unread]="!item.isRead" (click)="markRead(item)"><span class="notification-icon" [class.text-rose-600]="!item.isRead" [class.bg-rose-50]="!item.isRead"><i [class]="iconFor(item.type)"></i></span><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center justify-between gap-2"><h2 class="m-0 text-sm font-extrabold text-slate-800">{{ item.title }}</h2><time class="text-xs text-slate-400">{{ item.createdAt | date:'medium' }}</time></div><p class="mb-0 mt-1 text-sm leading-7 text-slate-600">{{ item.body }}</p>@if (!item.isRead) {<span class="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-600"><i class="pi pi-circle-fill text-[.45rem]"></i> غير مقروء</span>}</div></article>}</div><app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator></section> }
      @else { <section class="lf-empty-state"><i class="pi pi-check-circle text-emerald-500"></i><h3>لا توجد إشعارات</h3><p>لا توجد إشعارات مطابقة للفلاتر الحالية.</p></section> }
    </div>`
})
export class AlertsComponent implements OnInit {
  private http = inject(HttpClient); private notify = inject(NotifyService);
  items = signal<NotificationItem[]>([]); loading = signal(false); unreadCount = signal(0); markAllBusy = signal(false); markingIds = signal<Set<string>>(new Set());
  search = ''; type: number | null = null; readFilter: boolean | null = null; page = 1; pageSize = 20; totalCount = 0;
  ngOnInit(): void { this.load(); }
  refresh(): void { this.page = 1; this.load(); }
  load(): void {
    this.loading.set(true);
    let params = new HttpParams().set('page', this.page).set('pageSize', this.pageSize);
    if (this.search.trim()) params = params.set('search', this.search.trim());
    if (this.type !== null) params = params.set('type', this.type);
    if (this.readFilter !== null) params = params.set('isRead', this.readFilter);
    this.http.get<NotificationResponse>(`${environment.apiUrl}/notifications`, { params }).subscribe({
      next: response => { this.items.set(response.items); this.totalCount = response.totalCount; this.unreadCount.set(response.unreadCount); this.loading.set(false); },
      error: error => { this.notify.error(errMsg(error)); this.loading.set(false); }
    });
  }
  markRead(item: NotificationItem): void {
    if (item.isRead || this.markAllBusy() || this.markingIds().has(item.id)) return;
    this.markingIds.update(ids => new Set(ids).add(item.id));
    this.http.post(`${environment.apiUrl}/notifications/${item.id}/read`, {}).subscribe({
      next: () => { item.isRead = true; this.items.set([...this.items()]); this.unreadCount.update(value => Math.max(0, value - 1)); this.clearMarking(item.id); },
      error: error => { this.clearMarking(item.id); this.notify.error(errMsg(error)); },
    });
  }
  markAllRead(): void {
    if (!this.unreadCount() || this.markAllBusy()) return;
    this.markAllBusy.set(true);
    this.http.post<{marked:number}>(`${environment.apiUrl}/notifications/read-all`, {}).subscribe({
      next: () => { this.items.update(items => items.map(item => ({ ...item, isRead: true }))); this.unreadCount.set(0); this.markAllBusy.set(false); this.notify.success('تم تعليم الإشعارات كمقروءة'); },
      error: error => { this.markAllBusy.set(false); this.notify.error(errMsg(error)); },
    });
  }
  private clearMarking(id: string): void { this.markingIds.update(ids => { const next = new Set(ids); next.delete(id); return next; }); }
  onPageChange(event: {page:number; pageSize:number}): void { this.page = event.page; this.pageSize = event.pageSize; this.load(); }
  iconFor(type: number): string { return type === 4 ? 'pi pi-calendar-times' : type === 5 ? 'pi pi-megaphone' : 'pi pi-bell'; }
}
