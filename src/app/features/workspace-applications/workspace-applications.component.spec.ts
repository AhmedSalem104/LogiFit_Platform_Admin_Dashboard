import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NotifyService } from '../../shared/ui/notify.service';
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
    rowVersion: 'AQIDBA=='
  };

  beforeEach(() => {
    service = jasmine.createSpyObj<WorkspaceApplicationsService>('WorkspaceApplicationsService', [
      'requestInformation',
    ]);
    service.requestInformation.and.returnValue(of(freelanceApplication));

    TestBed.configureTestingModule({
      providers: [
        { provide: WorkspaceApplicationsService, useValue: service },
        { provide: NotifyService, useValue: jasmine.createSpyObj<NotifyService>('NotifyService', ['success', 'error']) },
      ],
    });

    component = TestBed.runInInjectionContext(() => new WorkspaceApplicationsComponent());
  });

  it('opens the freelance information dialog with no submitted field names', () => {
    component.openInformation(freelanceApplication);

    expect(component.informationFields).toBe('');
    expect(component.fieldHint(freelanceApplication)).toBe('BrandName, Bio');
  });

  it('sends only field names explicitly entered by the administrator', () => {
    component.openInformation(freelanceApplication);
    component.informationMessage = 'Please complete your branding details.';
    component.informationFields = 'BrandName, Bio';

    component.sendInformationRequest();

    expect(service.requestInformation).toHaveBeenCalledWith(
      freelanceApplication,
      'Please complete your branding details.',
      ['BrandName', 'Bio'],
    );
  });
});
