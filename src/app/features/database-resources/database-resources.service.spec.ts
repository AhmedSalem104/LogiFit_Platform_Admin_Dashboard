import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DatabaseResourceStatus, DatabaseResourcesService } from './database-resources.service';

describe('DatabaseResourcesService contracts', () => {
  let service: DatabaseResourcesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatabaseResourcesService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DatabaseResourcesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends lifecycle and tenant filters as server-side query parameters', () => {
    service.list(2, 50, DatabaseResourceStatus.Assigned, 'tenant-1').subscribe();

    const request = http.expectOne(item => item.url.endsWith('/database-resources'));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('pageSize')).toBe('50');
    expect(request.request.params.get('status')).toBe(String(DatabaseResourceStatus.Assigned));
    expect(request.request.params.get('tenantId')).toBe('tenant-1');
    request.flush({ items: [], totalCount: 0, page: 2, pageSize: 50, totalPages: 0 });
  });
});
