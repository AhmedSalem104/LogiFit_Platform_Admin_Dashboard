import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateTenantWithOwnerCommand,
  PagedResult,
  PlatformTenantDto,
  PlatformTenantCredentialsDto,
  PlatformTenantDeleteRequest,
  PlatformTenantPasswordResetDto,
  PlatformTenantPermanentDeleteDto,
  TenantStatus,
} from '../../core/models/platform.models';

@Injectable({ providedIn: 'root' })
export class TenantsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/tenants`;

  list(status?: TenantStatus, page = 1, pageSize = 20): Observable<PagedResult<PlatformTenantDto>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (status != null) params = params.set('status', status);
    return this.http.get<PagedResult<PlatformTenantDto>>(this.base, { params });
  }

  create(cmd: CreateTenantWithOwnerCommand, idempotencyKey?: string): Observable<PlatformTenantDto> {
    const key = idempotencyKey?.trim();
    return this.http.post<PlatformTenantDto>(this.base, cmd, key
      ? { headers: new HttpHeaders({ 'Idempotency-Key': key }) }
      : undefined);
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

  credentials(id: string): Observable<PlatformTenantCredentialsDto> {
    return this.http.get<PlatformTenantCredentialsDto>(`${this.base}/${id}/credentials`);
  }

  requestPasswordReset(id: string): Observable<PlatformTenantPasswordResetDto> {
    return this.http.post<PlatformTenantPasswordResetDto>(`${this.base}/${id}/credentials/reset`, {});
  }

  softDelete(id: string): Observable<PlatformTenantDto> {
    return this.http.post<PlatformTenantDto>(`${this.base}/${id}/soft-delete`, {});
  }

  restore(id: string): Observable<PlatformTenantDto> {
    return this.http.post<PlatformTenantDto>(`${this.base}/${id}/restore`, {});
  }

  permanentDelete(id: string, request: PlatformTenantDeleteRequest): Observable<PlatformTenantPermanentDeleteDto> {
    return this.http.post<PlatformTenantPermanentDeleteDto>(`${this.base}/${id}/permanent-delete`, request);
  }
}
