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
}
