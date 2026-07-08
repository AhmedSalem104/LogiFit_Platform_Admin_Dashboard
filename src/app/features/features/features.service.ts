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
}
