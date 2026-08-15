import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TenantsService } from './tenants.service';

describe('TenantsService contracts', () => {
  let service: TenantsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TenantsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TenantsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('passes an idempotency key when a legacy caller explicitly uses the endpoint', () => {
    service.create({
      name: 'Gym',
      subdomain: 'gym',
      email: 'owner@example.com',
      phoneNumber: '',
      ownerFullName: 'Owner',
      ownerEmail: 'owner@example.com',
      ownerPhoneNumber: '01000000000',
      ownerPassword: 'password8',
    }, 'gym-request-1').subscribe();

    const request = http.expectOne('/api/platform/tenants');
    expect(request.request.headers.get('Idempotency-Key')).toBe('gym-request-1');
    request.flush({});
  });
});
