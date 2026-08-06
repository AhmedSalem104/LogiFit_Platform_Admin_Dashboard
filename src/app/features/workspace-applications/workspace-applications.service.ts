import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../core/models/platform.models';

export enum PlatformApplicationType {
  GymWorkspaceCreation = 1,
  FreelanceWorkspaceCreation = 2,
  CoachMembership = 3,
  AssistantMembership = 4,
  ClientMembership = 5,
}

export enum PlatformApplicationStatus {
  Draft = 1,
  Submitted = 2,
  UnderReview = 3,
  NeedsMoreInformation = 4,
  Approved = 5,
  Rejected = 6,
  Cancelled = 7,
  Expired = 8,
}

export enum PlatformPaymentStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4,
  Expired = 5,
}

export enum PlatformWorkspaceStatus {
  Active = 1,
  Suspended = 2,
  Trial = 3,
  PastDue = 4,
  Cancelled = 5,
  PendingApproval = 6,
  Archived = 7,
  Deleted = 8,
  Provisioning = 9,
  ProvisioningFailed = 10,
  PendingSubscription = 11,
  AwaitingDatabaseCapacity = 12,
}

export enum PlatformSubscriptionStatus {
  PendingPayment = 1,
  Trial = 2,
  Active = 3,
  PastDue = 4,
  Suspended = 5,
  Cancelled = 6,
  Expired = 7,
  GracePeriod = 8,
  PendingActivation = 9,
}

export enum PlatformProvisioningStatus {
  Pending = 1,
  AwaitingDatabaseCapacity = 2,
  Provisioning = 3,
  Completed = 4,
  Failed = 5,
}

export enum PlatformDatabaseStatus {
  Available = 1,
  Reserved = 2,
  Provisioning = 3,
  Assigned = 4,
  Maintenance = 5,
  RestorePending = 6,
  Faulted = 7,
  Retired = 8,
}

export interface PlatformWorkspaceApplication {
  id: string;
  applicationType: PlatformApplicationType;
  status: PlatformApplicationStatus;
  applicantEmail: string;
  applicantPhoneNumber: string | null;
  workspaceIdentifier: string | null;
  requestedRole: string | number | null;
  informationRequest: string | null;
  requestedFields: string[];
  decisionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  provisionedWorkspaceId: string | null;
  workspaceType: number | null;
  paymentStatus: PlatformPaymentStatus | null;
  workspaceStatus: PlatformWorkspaceStatus | null;
  subscriptionStatus: PlatformSubscriptionStatus | null;
  databaseStatus: PlatformDatabaseStatus | null;
  databaseStatusCode: 'Unassigned' | 'Provisioning' | 'Ready' | 'Unavailable' | 'Failed' | 'Released' | null;
  provisioningStatus: PlatformProvisioningStatus | null;
  canAccessDashboard: boolean;
  requiredAction: string | null;
  nextStep: string | null;
  userMessage: string | null;
  lastUpdatedAtUtc: string | null;
  provisioningErrorCode: string | null;
  rowVersion: string;
}

export interface WorkspaceApplicationsFilters {
  applicationType?: PlatformApplicationType;
  status?: PlatformApplicationStatus;
  paymentStatus?: PlatformPaymentStatus;
  workspaceStatus?: PlatformWorkspaceStatus;
  subscriptionStatus?: PlatformSubscriptionStatus;
  provisioningStatus?: PlatformProvisioningStatus;
}

export interface CreatePlatformWorkspaceApplicationCommand {
  workspaceType: 1 | 2;
  workspaceName: string;
  workspaceIdentifier: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerPhoneNumber: string;
  planId: string;
  billingCycle: number;
  brandName?: string;
  description?: string;
  address?: string;
  specialization?: string;
  deliveryMode?: string;
}

export interface OneTimeOwnerCredentials {
  email: string;
  temporaryPassword: string;
  mustChangePassword: boolean;
}

export interface PlatformWorkspaceApplicationCreated {
  application: PlatformWorkspaceApplication;
  newIdentity: boolean;
  oneTimeCredentials: OneTimeOwnerCredentials | null;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceApplicationsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/workspace-applications`;

  list(filters: WorkspaceApplicationsFilters = {}, page = 1, pageSize = 20): Observable<PagedResult<PlatformWorkspaceApplication>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (filters.applicationType != null) params = params.set('applicationType', filters.applicationType);
    if (filters.status != null) params = params.set('status', filters.status);
    if (filters.paymentStatus != null) params = params.set('paymentStatus', filters.paymentStatus);
    if (filters.workspaceStatus != null) params = params.set('workspaceStatus', filters.workspaceStatus);
    if (filters.subscriptionStatus != null) params = params.set('subscriptionStatus', filters.subscriptionStatus);
    if (filters.provisioningStatus != null) params = params.set('provisioningStatus', filters.provisioningStatus);
    return this.http.get<PagedResult<PlatformWorkspaceApplication>>(this.base, { params });
  }

  create(command: CreatePlatformWorkspaceApplicationCommand): Observable<PlatformWorkspaceApplicationCreated> {
    return this.http.post<PlatformWorkspaceApplicationCreated>(this.base, command);
  }

  startReview(application: PlatformWorkspaceApplication): Observable<PlatformWorkspaceApplication> {
    return this.http.post<PlatformWorkspaceApplication>(`${this.base}/${application.id}/start-review`, { rowVersion: application.rowVersion });
  }

  requestInformation(application: PlatformWorkspaceApplication, message: string, requestedFields: string[]): Observable<PlatformWorkspaceApplication> {
    return this.http.post<PlatformWorkspaceApplication>(`${this.base}/${application.id}/request-information`, {
      rowVersion: application.rowVersion, message, requestedFields,
    });
  }

  approveWorkspace(application: PlatformWorkspaceApplication): Observable<PlatformWorkspaceApplication> {
    return this.http.post<PlatformWorkspaceApplication>(`${this.base}/${application.id}/approve-workspace`, { rowVersion: application.rowVersion });
  }

  retryProvisioning(application: PlatformWorkspaceApplication): Observable<PlatformWorkspaceApplication> {
    return this.http.post<PlatformWorkspaceApplication>(`${this.base}/${application.id}/retry-provisioning`, {});
  }

  reject(application: PlatformWorkspaceApplication, reason: string): Observable<PlatformWorkspaceApplication> {
    return this.http.post<PlatformWorkspaceApplication>(`${this.base}/${application.id}/reject`, {
      rowVersion: application.rowVersion, reason,
    });
  }
}
