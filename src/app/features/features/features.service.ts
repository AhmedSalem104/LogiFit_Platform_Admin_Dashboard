import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FeatureDto } from '../../core/models/platform.models';

@Injectable({ providedIn: 'root' })
export class FeaturesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/features`;

  /** Features are seed/reference data — cache the response so switching between the
   *  Features and Plans screens doesn't refetch it every time. */
  private cache$?: Observable<FeatureDto[]>;

  list(): Observable<FeatureDto[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<FeatureDto[]>(this.base).pipe(shareReplay({ bufferSize: 1, refCount: false }));
    }
    return this.cache$;
  }

  /** Drop the cache (call after any future feature mutation). */
  invalidate(): void {
    this.cache$ = undefined;
  }
  overrides(): Observable<any[]> { return this.http.get<any[]>(`${this.base}/tenant-overrides`); }
  setOverride(command: any): Observable<string> { return this.http.post<string>(`${this.base}/tenant-overrides`, command); }
  quotaDefinitions(): Observable<any[]> { return this.http.get<any[]>(`${this.base}/quota-definitions`); }
  dependencies(): Observable<any[]> { return this.http.get<any[]>(`${this.base}/dependencies`); }
  addDependency(command: { featureId: string; dependsOnFeatureId: string }): Observable<string> {
    return this.http.post<string>(`${this.base}/dependencies`, command);
  }

  save(command: Partial<FeatureDto> & { code: string; name: string }): Observable<FeatureDto> {
    const request = command.id
      ? this.http.put<FeatureDto>(`${this.base}/${command.id}`, command)
      : this.http.post<FeatureDto>(this.base, command);
    return request.pipe(shareReplay(1));
  }
}
