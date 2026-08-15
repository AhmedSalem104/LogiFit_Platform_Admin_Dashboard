import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../core/models/platform.models';

export interface BackupRecord { fileName: string; sizeBytes: number; createdAt: string; status: string; }
export interface BackupStatus {
  isEnabled: boolean;
  isReady: boolean;
  format: string;
  retentionDays: number;
  runAtUtc: string;
  backupCount: number;
  unavailableReason: string | null;
}

export enum BackupScope {
  Platform = 1,
  SelectedTenants = 2,
  AllGyms = 3,
  AllFreelance = 4,
  AllTenants = 5,
  FullSystem = 6,
}

export interface BackupBatchRequest {
  scope: BackupScope;
  tenantIds?: string[];
  idempotencyKey?: string;
}

export interface BackupArtifact {
  id: string;
  tenantId: string | null;
  status: string;
  sizeBytes: number;
  startedAtUtc: string | null;
  completedAtUtc: string | null;
  storageKey: string | null;
  sha256: string | null;
  errorCode: string | null;
  tenantName?: string | null;
  workspaceIdentifier?: string | null;
  workspaceType?: string | null;
}

export interface BackupBatch {
  id: string;
  scope: BackupScope;
  status: string;
  startedAtUtc: string | null;
  completedAtUtc: string | null;
  manifestStorageKey: string | null;
  artifacts: BackupArtifact[];
}

export interface RestoreCapabilities {
  enabled: boolean;
  mode: string;
  supportsBacpacImport: boolean;
  supportsMappingSwitch: boolean;
  unavailableReason: string | null;
}

@Injectable({ providedIn: 'root' })
export class BackupsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/backups`;
  list(page = 1, pageSize = 20): Observable<PagedResult<BackupRecord>> {
    return this.http.get<PagedResult<BackupRecord>>(this.base, { params: { page, pageSize } });
  }
  status(): Observable<BackupStatus> { return this.http.get<BackupStatus>(`${this.base}/status`); }
  create(): Observable<BackupRecord> { return this.http.post<BackupRecord>(this.base, {}); }
  createBatch(request: BackupBatchRequest): Observable<BackupBatch> {
    return this.http.post<BackupBatch>(`${this.base}/batch`, request);
  }
  listBatches(take = 50): Observable<BackupBatch[]> {
    return this.http.get<BackupBatch[]>(`${this.base}/batches`, { params: { take } });
  }
  retryBatch(batchId: string): Observable<BackupBatch> {
    return this.http.post<BackupBatch>(`${this.base}/batches/${encodeURIComponent(batchId)}/retry`, {});
  }
  restoreCapabilities(): Observable<RestoreCapabilities> {
    return this.http.get<RestoreCapabilities>(`${environment.apiUrl}/restores/capabilities`);
  }
  download(fileName: string): Observable<Blob> {
    return this.http.get(`${this.base}/${encodeURIComponent(fileName)}/download`, { responseType: 'blob' });
  }
}
