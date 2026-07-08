import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlatformDashboardDto } from '../../core/models/platform.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/dashboard`;

  get(): Observable<PlatformDashboardDto> {
    return this.http.get<PlatformDashboardDto>(this.base);
  }
}
