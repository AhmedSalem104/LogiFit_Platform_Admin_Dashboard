import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlanDto, SavePlanCommand } from '../../core/models/platform.models';

@Injectable({ providedIn: 'root' })
export class PlansService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/plans`;

  list(activeOnly = false): Observable<PlanDto[]> {
    const params = new HttpParams().set('activeOnly', activeOnly);
    return this.http.get<PlanDto[]>(this.base, { params });
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
