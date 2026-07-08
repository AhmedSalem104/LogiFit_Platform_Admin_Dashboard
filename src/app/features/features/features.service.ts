import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FeatureDto } from '../../core/models/platform.models';

@Injectable({ providedIn: 'root' })
export class FeaturesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/features`;

  list(): Observable<FeatureDto[]> {
    return this.http.get<FeatureDto[]>(this.base);
  }
}
