import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PaymentRequestDto,
  PaymentRequestStatus,
  RejectPaymentRequestCommand,
} from '../../core/models/platform.models';

@Injectable({ providedIn: 'root' })
export class PaymentRequestsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/payment-requests`;

  list(status?: PaymentRequestStatus): Observable<PaymentRequestDto[]> {
    let params = new HttpParams();
    if (status != null) params = params.set('status', status);
    return this.http.get<PaymentRequestDto[]>(this.base, { params });
  }

  approve(id: string): Observable<PaymentRequestDto> {
    return this.http.post<PaymentRequestDto>(`${this.base}/${id}/approve`, {});
  }

  reject(id: string, cmd: RejectPaymentRequestCommand): Observable<PaymentRequestDto> {
    return this.http.post<PaymentRequestDto>(`${this.base}/${id}/reject`, cmd);
  }
}
