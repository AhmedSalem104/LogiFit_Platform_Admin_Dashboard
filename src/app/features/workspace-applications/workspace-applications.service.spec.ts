import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PaymentRequestStatus, ProvisioningJobStatus, TenantStatus, TenantSubscriptionStatus } from '../../core/models/platform.models';
import { PlatformApplicationStatus, PlatformApplicationType, WorkspaceApplicationsService } from './workspace-applications.service';

describe('WorkspaceApplicationsService contracts', () => {
  let service: WorkspaceApplicationsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkspaceApplicationsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WorkspaceApplicationsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends every lifecycle filter to the platform applications endpoint', () => {
    service.list({
      status: PlatformApplicationStatus.UnderReview,
      type: PlatformApplicationType.FreelanceWorkspaceCreation,
      paymentStatus: PaymentRequestStatus.Approved,
      workspaceStatus: TenantStatus.PendingApproval,
      subscriptionStatus: TenantSubscriptionStatus.PendingPayment,
      provisioningStatus: ProvisioningJobStatus.AwaitingDatabaseCapacity,
    }, 2, 25).subscribe();

    const request = http.expectOne(item => item.url.endsWith('/workspace-applications'));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('pageSize')).toBe('25');
    expect(request.request.params.get('status')).toBe(String(PlatformApplicationStatus.UnderReview));
    expect(request.request.params.get('applicationType')).toBe(String(PlatformApplicationType.FreelanceWorkspaceCreation));
    expect(request.request.params.get('paymentStatus')).toBe(String(PaymentRequestStatus.Approved));
    expect(request.request.params.get('workspaceStatus')).toBe(String(TenantStatus.PendingApproval));
    expect(request.request.params.get('subscriptionStatus')).toBe(String(TenantSubscriptionStatus.PendingPayment));
    expect(request.request.params.get('provisioningStatus')).toBe(String(ProvisioningJobStatus.AwaitingDatabaseCapacity));
    request.flush({ items: [], totalCount: 0, page: 2, pageSize: 25 });
  });
});
