import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FeatureDto, PagedResult } from '../../core/models/platform.models';

@Injectable({ providedIn: 'root' })
export class FeaturesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/features`;

  /** Features are seed/reference data — cache the response so switching between the
   *  Features and Plans screens doesn't refetch it every time. */
  private cache$?: Observable<FeatureDto[]>;

  list(page = 1, pageSize = 20): Observable<PagedResult<FeatureDto>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<FeatureDto>>(this.base, { params });
  }

  /** Bounded reference catalog for selection controls. Grid pages remain server paginated. */
  catalog(): Observable<FeatureDto[]> {
    if (!this.cache$) {
      this.cache$ = this.list(1, 100).pipe(
        map((response) => response.items),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.cache$;
  }

  /** Drop the cache (call after any future feature mutation). */
  invalidate(): void {
    this.cache$ = undefined;
  }
  overrides(page = 1, pageSize = 20, tenantId?: string): Observable<PagedResult<any>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (tenantId) params = params.set('tenantId', tenantId);
    return this.http.get<PagedResult<any>>(`${this.base}/tenant-overrides`, { params });
  }
  setOverride(command: any): Observable<string> { return this.http.post<string>(`${this.base}/tenant-overrides`, command); }
  quotaDefinitions(page = 1, pageSize = 20): Observable<PagedResult<any>> {
    return this.http.get<PagedResult<any>>(`${this.base}/quota-definitions`, { params: new HttpParams().set('page', page).set('pageSize', pageSize) });
  }
  saveQuota(command: any): Observable<string> {
    return command.id
      ? this.http.put<string>(`${this.base}/quota-definitions/${command.id}`, command)
      : this.http.post<string>(`${this.base}/quota-definitions`, command);
  }
  dependencies(page = 1, pageSize = 20): Observable<PagedResult<any>> {
    return this.http.get<PagedResult<any>>(`${this.base}/dependencies`, { params: new HttpParams().set('page', page).set('pageSize', pageSize) });
  }
  addDependency(command: { featureId: string; dependsOnFeatureId: string }): Observable<string> {
    return this.http.post<string>(`${this.base}/dependencies`, command);
  }
  removeDependency(id: string): Observable<void> { return this.http.delete<void>(`${this.base}/dependencies/${id}`); }

  save(command: Partial<FeatureDto> & { code: string; name: string }): Observable<FeatureDto> {
    const request = command.id
      ? this.http.put<FeatureDto>(`${this.base}/${command.id}`, command)
      : this.http.post<FeatureDto>(this.base, command);
    return request.pipe(shareReplay(1));
  }
}
