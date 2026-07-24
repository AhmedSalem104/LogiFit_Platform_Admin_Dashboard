import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlatformSubscriptionDto, TenantSubscriptionStatus } from '../../core/models/platform.models';

@Injectable({ providedIn: 'root' })
export class SubscriptionsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/subscriptions`;

  list(status?: TenantSubscriptionStatus): Observable<PlatformSubscriptionDto[]> {
    let params = new HttpParams();
    if (status != null) params = params.set('status', status);
    return this.http.get<PlatformSubscriptionDto[]>(this.base, { params });
  }

  usage(): Observable<TenantUsageDto[]> {
    return this.http.get<TenantUsageDto[]>(`${this.base}/usage`);
  }

  transition(subscriptionId: string, targetStatus: TenantSubscriptionStatus): Observable<TenantSubscriptionStatus> {
    return this.http.post<TenantSubscriptionStatus>(`${this.base}/${subscriptionId}/transition`, { targetStatus });
  }

  extend(subscriptionId: string, days: number): Observable<string> {
    return this.http.post<string>(`${this.base}/${subscriptionId}/extend`, { days });
  }

  upgradePreview(subscriptionId: string, targetPlanId: string): Observable<{ amount: number; currency: string; remainingDays: number; currentDurationDays: number; targetPlanId: string }> {
    return this.http.get<{ amount: number; currency: string; remainingDays: number; currentDurationDays: number; targetPlanId: string }>(`${this.base}/${subscriptionId}/upgrade-preview/${targetPlanId}`);
  }
}

export interface TenantUsageDto {
  tenantId: string;
  membersCount: number;
  coachesCount: number;
  employeesCount: number;
  branchesCount: number;
  storageUsedMB: number;
  lastCalculatedAt: string;
}
