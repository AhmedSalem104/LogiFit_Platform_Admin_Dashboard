import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PlatformDashboardDto } from '../../core/models/platform.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/dashboard`;

  get(filters: { fromUtc?: string; toUtc?: string; tenantId?: string; planId?: string; subscriptionStatus?: number } = {}): Observable<PlatformDashboardDto> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value)); });
    return this.http.get<PlatformDashboardDto>(this.base, { params });
  }

  getTenants(page = 1, pageSize = 8, search = ''): Observable<any> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search.trim()) params = params.set('search', search.trim());
    return this.http.get<any>(`${this.base}/tenants`, { params });
  }
}
