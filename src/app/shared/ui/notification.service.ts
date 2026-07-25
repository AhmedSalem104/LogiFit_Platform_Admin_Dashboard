import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  readonly unreadCount = signal(0);
  refresh(): void {
    const params = new HttpParams().set('page', 1).set('pageSize', 1);
    this.http.get<{ unreadCount: number }>(`${environment.apiUrl}/notifications`, { params }).subscribe({ next: response => this.unreadCount.set(response.unreadCount ?? 0) });
  }
  decrement(): void { this.unreadCount.update(value => Math.max(0, value - 1)); }
}
