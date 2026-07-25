import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult, PlanDto, SavePlanCommand } from '../../core/models/platform.models';

@Injectable({ providedIn: 'root' })
export class PlansService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/plans`;

  list(activeOnly = false, page = 1, pageSize = 20): Observable<PagedResult<PlanDto>> {
    const params = new HttpParams().set('activeOnly', activeOnly).set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<PlanDto>>(this.base, { params });
  }

  create(cmd: SavePlanCommand): Observable<PlanDto> {
    return this.http.post<PlanDto>(this.base, cmd);
  }

  update(id: string, cmd: SavePlanCommand): Observable<PlanDto> {
    return this.http.put<PlanDto>(`${this.base}/${id}`, { ...cmd, id });
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
