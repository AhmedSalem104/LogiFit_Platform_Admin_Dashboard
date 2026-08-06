import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PlatformDashboardDto } from '../../core/models/platform.models';

export interface DashboardFilters {
  fromUtc?: string;
  toUtc?: string;
  tenantId?: string;
  planId?: string;
  subscriptionStatus?: number;
}

export interface DashboardTenantSummary {
  id: string;
  name: string;
  subdomain: string | null;
  status: number;
  createdAt: string;
  membersCount: number;
  subscription: {
    status: number;
    endDate: string | null;
    planId: string;
    planName: string;
  } | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/dashboard`;

  get(filters: DashboardFilters = {}): Observable<PlatformDashboardDto> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value)); });
    return this.http.get<PlatformDashboardDto>(this.base, { params });
  }

  getTenants(page = 1, pageSize = 8, search = ''): Observable<{ items: DashboardTenantSummary[] }> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search.trim()) params = params.set('search', search.trim());
    return this.http.get<any>(`${this.base}/tenants`, { params });
  }
}
