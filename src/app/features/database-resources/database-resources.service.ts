import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../core/models/platform.models';

/** Mirrors LogicFit.Domain.Enums.DatabaseResourceStatus. */
export enum DatabaseResourceStatus {
  Available = 1,
  Reserved = 2,
  Provisioning = 3,
  Assigned = 4,
  Maintenance = 5,
  RestorePending = 6,
  Faulted = 7,
  Retired = 8,
}

export type DatabaseResourceLifecycleStatus =
  | 'Available'
  | 'Allocated'
  | 'Disabled'
  | 'Failed'
  | 'Provisioning'
  | 'RestorePending'
  | string;

/** Safe DTO. The API deliberately never returns database names or connection material. */
export interface DatabaseResource {
  id: string;
  resourceCode: string;
  provider: string;
  hasProtectedConnection: boolean;
  status: DatabaseResourceStatus;
  lifecycleStatus: DatabaseResourceLifecycleStatus;
  tenantId: string | null;
  tenantName: string | null;
  workspaceType: string | null;
  workspaceStatus: number | string | null;
  subscriptionStatus: number | string | null;
  provisioningStatus: number | string | null;
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
}

export interface RegisterDatabaseResourceCommand {
  provider: 'ManualMonster' | 'LocalSql' | string;
  databaseName: string;
  serverKey?: string;
  connectionString: string;
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

  list(page = 1, pageSize = 20): Observable<PagedResult<DatabaseResource>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<DatabaseResource>>(this.base, { params });
  }

  testConnection(databaseName: string, connectionString: string): Observable<ConnectionTestResult> {
    return this.http.post<ConnectionTestResult>(`${this.base}/test-connection`, { databaseName, connectionString });
  }

  register(command: RegisterDatabaseResourceCommand): Observable<DatabaseResource> {
    return this.http.post<DatabaseResource>(this.base, command);
  }

  repairConnection(id: string, connectionString: string): Observable<ResourceOperationResult> {
    return this.http.post<ResourceOperationResult>(`${this.base}/${id}/repair-connection`, {
      connectionString,
      confirm: true,
    });
  }

  runMigrations(id: string): Observable<ResourceOperationResult> {
    return this.http.post<ResourceOperationResult>(`${this.base}/${id}/migrations`, {});
  }

  createBackup(id: string): Observable<unknown> {
    return this.http.post(`${this.base}/${id}/backup`, {});
  }

  setStatus(id: string, status: 'Available' | 'Disabled' | 'Failed'): Observable<DatabaseResource> {
    return this.http.post<DatabaseResource>(`${this.base}/${id}/status`, { status });
  }
}
