import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateTenantWithOwnerCommand,
  PlatformTenantDto,
  TenantStatus,
} from '../../core/models/platform.models';

@Injectable({ providedIn: 'root' })
export class TenantsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/tenants`;

  list(status?: TenantStatus): Observable<PlatformTenantDto[]> {
    let params = new HttpParams();
    if (status != null) params = params.set('status', status);
    return this.http.get<PlatformTenantDto[]>(this.base, { params });
  }

  create(cmd: CreateTenantWithOwnerCommand): Observable<PlatformTenantDto> {
    return this.http.post<PlatformTenantDto>(this.base, cmd);
  }

  approve(id: string): Observable<PlatformTenantDto> {
    return this.http.post<PlatformTenantDto>(`${this.base}/${id}/approve`, {});
  }

  activate(id: string): Observable<PlatformTenantDto> {
    return this.http.post<PlatformTenantDto>(`${this.base}/${id}/activate`, {});
  }

  suspend(id: string): Observable<PlatformTenantDto> {
    return this.http.post<PlatformTenantDto>(`${this.base}/${id}/suspend`, {});
  }

  archive(id: string): Observable<PlatformTenantDto> {
    return this.http.post<PlatformTenantDto>(`${this.base}/${id}/archive`, {});
  }
}
