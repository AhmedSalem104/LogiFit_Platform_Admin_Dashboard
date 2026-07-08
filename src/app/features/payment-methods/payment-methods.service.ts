import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentMethodDto, SavePaymentMethodCommand } from '../../core/models/platform.models';

@Injectable({ providedIn: 'root' })
export class PaymentMethodsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/payment-methods`;

  list(activeOnly = false): Observable<PaymentMethodDto[]> {
    const params = new HttpParams().set('activeOnly', activeOnly);
    return this.http.get<PaymentMethodDto[]>(this.base, { params });
  }

  create(cmd: SavePaymentMethodCommand): Observable<PaymentMethodDto> {
    return this.http.post<PaymentMethodDto>(this.base, cmd);
  }

  update(id: string, cmd: SavePaymentMethodCommand): Observable<PaymentMethodDto> {
    return this.http.put<PaymentMethodDto>(`${this.base}/${id}`, { ...cmd, id });
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
