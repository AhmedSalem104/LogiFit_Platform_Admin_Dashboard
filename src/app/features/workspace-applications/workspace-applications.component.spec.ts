import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NotifyService } from '../../shared/ui/notify.service';
import { PlansService } from '../plans/plans.service';
import {
  PlatformApplicationStatus,
  PlatformApplicationType,
  PlatformWorkspaceApplication,
  WorkspaceApplicationsService,
} from './workspace-applications.service';
import { WorkspaceApplicationsComponent } from './workspace-applications.component';

describe('WorkspaceApplicationsComponent information request', () => {
  let component: WorkspaceApplicationsComponent;
  let service: jasmine.SpyObj<WorkspaceApplicationsService>;

  const freelanceApplication: PlatformWorkspaceApplication = {
    id: 'a457dc34-72c7-45d8-acef-e6dc5ff42a06',
    applicationType: PlatformApplicationType.FreelanceWorkspaceCreation,
    status: PlatformApplicationStatus.UnderReview,
    applicantEmail: 'coach@example.com',
    applicantPhoneNumber: null,
    workspaceIdentifier: 'coach-workspace',
    requestedRole: null,
    informationRequest: null,
    requestedFields: [],
    decisionReason: null,
    submittedAt: '2026-07-29T00:00:00Z',
    reviewedAt: null,
    reviewedBy: null,
    provisionedWorkspaceId: null,
    workspaceType: 2,
    paymentStatus: null,
    workspaceStatus: null,
    subscriptionStatus: null,
    databaseStatus: null,
    databaseStatusCode: 'Unassigned',
    provisioningStatus: null,
    canAccessDashboard: false,
    requiredAction: null,
    nextStep: null,
    userMessage: null,
    lastUpdatedAtUtc: null,
    provisioningErrorCode: null,
    rowVersion: 'AQIDBA=='
  };

  beforeEach(() => {
    service = jasmine.createSpyObj<WorkspaceApplicationsService>('WorkspaceApplicationsService', [
      'requestInformation',
      'list',
    ]);
    service.requestInformation.and.returnValue(of(freelanceApplication));
    service.list.and.returnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0, hasPreviousPage: false, hasNextPage: false }));

    TestBed.configureTestingModule({
      providers: [
        { provide: WorkspaceApplicationsService, useValue: service },
        { provide: PlansService, useValue: jasmine.createSpyObj<PlansService>('PlansService', ['list']) },
        { provide: NotifyService, useValue: jasmine.createSpyObj<NotifyService>('NotifyService', ['success', 'error']) },
      ],
    });

    component = TestBed.runInInjectionContext(() => new WorkspaceApplicationsComponent());
  });

  it('opens the freelance information dialog with no preselected field names', () => {
    component.openInformation(freelanceApplication);

    expect(component.informationFields).toEqual([]);
    expect(component.informationFieldOptions(freelanceApplication).map(field => field.value)).toContain('BrandName');
    expect(component.informationFieldOptions(freelanceApplication).map(field => field.value)).toContain('Bio');
  });

  it('sends only allow-listed field names selected by the administrator', () => {
    component.openInformation(freelanceApplication);
    component.informationMessage = 'Please complete your branding details.';
    component.toggleInformationField('BrandName', true);
    component.toggleInformationField('Bio', true);

    component.sendInformationRequest();

    expect(service.requestInformation).toHaveBeenCalledWith(
      freelanceApplication,
      'Please complete your branding details.',
      ['BrandName', 'Bio'],
    );
  });

  it('explains a missing freelance-role conflict without exposing the raw server message', () => {
    const message = (component as any).actionErrorMessage({
      status: 409,
      error: { message: 'Freelance roles are not seeded yet.' },
    });

    expect(message).toContain('SeedFreelanceSystemRoles');
    expect(message).not.toContain('Freelance roles are not seeded yet.');
  });

  it('asks the administrator to review the refreshed request for a normal concurrency conflict', () => {
    const message = (component as any).actionErrorMessage({ status: 409, error: { code: 'CONCURRENCY_CONFLICT' } });

    expect(message).toContain('تم تحديث القائمة');
  });
});
