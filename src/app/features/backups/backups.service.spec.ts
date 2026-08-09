import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BackupScope, BackupsService } from './backups.service';

describe('BackupsService contracts', () => {
  let service: BackupsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackupsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BackupsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the selected scope, tenant IDs, and idempotency key to the batch endpoint', () => {
    service.createBatch({
      scope: BackupScope.SelectedTenants,
      tenantIds: ['tenant-1'],
      idempotencyKey: 'dashboard:2:test',
    }).subscribe();

    const request = http.expectOne(item => item.url.endsWith('/backups/batch'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      scope: BackupScope.SelectedTenants,
      tenantIds: ['tenant-1'],
      idempotencyKey: 'dashboard:2:test',
    });
    request.flush({});
  });

  it('encodes protected storage keys before requesting a download', () => {
    service.download('manifest-abc/../unsafe.json').subscribe();

    const request = http.expectOne(item => item.url.includes('/backups/manifest-abc%2F..%2Funsafe.json/download'));
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob());
  });
});
