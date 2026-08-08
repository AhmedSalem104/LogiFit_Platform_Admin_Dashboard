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

export interface DatabaseResource {
  id: string;
  provider: string;
  hasProtectedConnection: boolean;
  status: DatabaseResourceStatus;
  tenantId: string | null;
  tenantName: string | null;
  reservedAtUtc: string | null;
  assignedAtUtc: string | null;
  lastHealthCheckAtUtc: string | null;
  sizeBytes: number | null;
  schemaVersion: string | null;
}

export interface RegisterDatabaseResourceCommand {
  provider: 'ManualMonster' | 'LocalSql';
  databaseName: string;
  serverKey?: string;
  connectionString: string;
}

@Injectable({ providedIn: 'root' })
export class DatabaseResourcesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/database-resources`;

  list(page = 1, pageSize = 100): Observable<PagedResult<DatabaseResource>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<DatabaseResource>>(this.base, { params });
  }

  register(command: RegisterDatabaseResourceCommand): Observable<DatabaseResource> {
    return this.http.post<DatabaseResource>(this.base, command);
  }
}
