import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../core/models/platform.models';

export type DatabaseResourceStatus = 'Available' | 'Allocated' | 'Disabled' | 'Failed' | 'Provisioning' | 'RestorePending';

export interface DatabaseResource {
  id: string;
  resourceCode: string;
  provider: string;
  status: number;
  lifecycleStatus: DatabaseResourceStatus;
  tenantId: string | null;
  tenantName: string | null;
  workspaceType: string | null;
  workspaceStatus: number | null;
  subscriptionStatus: number | null;
  subscriptionEndDate: string | null;
  provisioningStatus: number | null;
  provisioningError: string | null;
  reservedAtUtc: string | null;
  assignedAtUtc: string | null;
  lastHealthCheckAtUtc: string | null;
  sizeBytes: number | null;
  schemaVersion: string | null;
  lastError: string | null;
  backupCount: number;
  lastBackupStatus: string | null;
  lastBackupCompletedAtUtc: string | null;
  hasConnectionString: boolean;
}

export interface SaveDatabaseResourceRequest {
  provider: string;
  databaseName?: string;
  serverKey?: string;
  connectionString?: string;
}

export interface ConnectionTestResult {
  succeeded: boolean;
  databaseName: string;
  serverKey: string | null;
  errorCode: string | null;
  message: string;
}

export interface ResourceOperationResult {
  succeeded: boolean;
  message: string;
  errorCode: string | null;
  schemaVersion: string | null;
}

@Injectable({ providedIn: 'root' })
export class DatabaseResourcesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/database-resources`;

  list(page = 1, pageSize = 100): Observable<PagedResult<DatabaseResource>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<DatabaseResource>>(this.base, { params });
  }

  testConnection(databaseName: string, connectionString: string): Observable<ConnectionTestResult> {
    return this.http.post<ConnectionTestResult>(`${this.base}/test-connection`, { databaseName, connectionString });
  }

  create(request: SaveDatabaseResourceRequest): Observable<DatabaseResource> {
    return this.http.post<DatabaseResource>(this.base, request);
  }

  update(id: string, request: SaveDatabaseResourceRequest): Observable<DatabaseResource> {
    return this.http.put<DatabaseResource>(`${this.base}/${id}`, request);
  }

  repairConnection(id: string, connectionString: string): Observable<ResourceOperationResult> {
    return this.http.post<ResourceOperationResult>(`${this.base}/${id}/repair-connection`, {
      connectionString,
      confirm: true,
    });
  }

  setStatus(id: string, status: DatabaseResourceStatus): Observable<DatabaseResource> {
    return this.http.post<DatabaseResource>(`${this.base}/${id}/status`, { status });
  }

  runMigrations(id: string): Observable<ResourceOperationResult> {
    return this.http.post<ResourceOperationResult>(`${this.base}/${id}/migrations`, {});
  }

  backup(id: string): Observable<unknown> {
    return this.http.post(`${this.base}/${id}/backup`, {});
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
