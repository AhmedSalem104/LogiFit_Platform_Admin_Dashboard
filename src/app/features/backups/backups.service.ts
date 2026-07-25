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

@Injectable({ providedIn: 'root' })
export class BackupsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/backups`;
  list(page = 1, pageSize = 20): Observable<PagedResult<BackupRecord>> {
    return this.http.get<PagedResult<BackupRecord>>(this.base, { params: { page, pageSize } });
  }
  status(): Observable<BackupStatus> { return this.http.get<BackupStatus>(`${this.base}/status`); }
  create(): Observable<BackupRecord> { return this.http.post<BackupRecord>(this.base, {}); }
  download(fileName: string): Observable<Blob> {
    return this.http.get(`${this.base}/${encodeURIComponent(fileName)}/download`, { responseType: 'blob' });
  }
}
