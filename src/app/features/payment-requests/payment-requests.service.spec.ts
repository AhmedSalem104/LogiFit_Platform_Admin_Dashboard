import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PaymentRequestsService } from './payment-requests.service';

describe('PaymentRequestsService proof contracts', () => {
  let service: PaymentRequestsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PaymentRequestsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PaymentRequestsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uploads a proof as multipart data and keeps history/version endpoints protected by the API service', () => {
    const file = new File(['receipt'], 'receipt.pdf', { type: 'application/pdf' });

    service.uploadProof('payment-1', file).subscribe();
    const upload = http.expectOne(request => request.url.endsWith('/payment-requests/payment-1/proof'));
    expect(upload.request.method).toBe('POST');
    expect(upload.request.body instanceof FormData).toBeTrue();
    expect((upload.request.body as FormData).get('proof')).toBeTruthy();
    upload.flush({});

    service.proofHistory('payment-1').subscribe();
    const history = http.expectOne('/api/platform/payment-requests/payment-1/proofs');
    expect(history.request.method).toBe('GET');
    history.flush([]);

    service.proofVersion('payment-1', 2).subscribe();
    const version = http.expectOne('/api/platform/payment-requests/payment-1/proof?version=2');
    expect(version.request.method).toBe('GET');
    version.flush(new Blob(['receipt'], { type: 'application/pdf' }));
  });
});
