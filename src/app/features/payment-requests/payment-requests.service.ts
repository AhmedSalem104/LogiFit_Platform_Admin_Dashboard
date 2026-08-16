import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PaymentRequestDto,
  PaymentProofDto,
  PaymentRequestStatus,
  PagedResult,
  RejectPaymentRequestCommand,
} from '../../core/models/platform.models';

@Injectable({ providedIn: 'root' })
export class PaymentRequestsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/payment-requests`;

  list(status?: PaymentRequestStatus, page = 1, pageSize = 20): Observable<PagedResult<PaymentRequestDto>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (status != null) params = params.set('status', status);
    return this.http.get<PagedResult<PaymentRequestDto>>(this.base, { params });
  }

  approve(id: string): Observable<PaymentRequestDto> {
    return this.http.post<PaymentRequestDto>(`${this.base}/${id}/approve`, {});
  }

  reject(id: string, cmd: RejectPaymentRequestCommand): Observable<PaymentRequestDto> {
    return this.http.post<PaymentRequestDto>(`${this.base}/${id}/reject`, cmd);
  }

  /** Loads the protected proof through HttpClient so the JWT interceptor is applied. */
  proof(id: string): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/proof`, { responseType: 'blob' });
  }

  proofHistory(id: string): Observable<PaymentProofDto[]> {
    return this.http.get<PaymentProofDto[]>(`${this.base}/${id}/proofs`);
  }

  proofVersion(id: string, version: number): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/proof?version=${version}`, { responseType: 'blob' });
  }

  uploadProof(id: string, file: File): Observable<PaymentRequestDto> {
    const body = new FormData();
    body.append('proof', file, file.name);
    return this.http.post<PaymentRequestDto>(`${this.base}/${id}/proof`, body);
  }
}
