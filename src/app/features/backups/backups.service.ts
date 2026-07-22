import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BackupRecord { fileName: string; sizeBytes: number; createdAt: string; status: string; }

@Injectable({ providedIn: 'root' })
export class BackupsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/backups`;
  list(): Observable<BackupRecord[]> { return this.http.get<BackupRecord[]>(this.base); }
  create(): Observable<BackupRecord> { return this.http.post<BackupRecord>(this.base, {}); }
}
