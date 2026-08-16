import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BillingCycle,
  PaymentRequestStatus,
  PagedResult,
  ProvisioningJobStatus,
  TenantStatus,
  TenantSubscriptionStatus,
} from '../../core/models/platform.models';

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

export enum PlatformWorkspaceType {
  Gym = 1,
  FreelanceCoach = 2,
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
  workspaceType: PlatformWorkspaceType | null;
  paymentRequestId: string | null;
  paymentStatus: PaymentRequestStatus | null;
  hasPaymentProof: boolean;
  paymentProofVersion: number;
  workspaceStatus: TenantStatus | null;
  subscriptionStatus: TenantSubscriptionStatus | null;
  databaseStatus: number | null;
  databaseStatusCode: string | null;
  provisioningStatus: ProvisioningJobStatus | null;
  userJourneyStage: string;
  canAccessDashboard: boolean;
  requiredAction: string | null;
  nextStep: string | null;
  userMessage: string | null;
  lastUpdatedAtUtc: string | null;
  provisioningErrorCode: string | null;
  rowVersion: string;
}

export interface WorkspaceApplicationFilters {
  status?: PlatformApplicationStatus;
  type?: PlatformApplicationType;
  paymentStatus?: PaymentRequestStatus;
  workspaceStatus?: TenantStatus;
  subscriptionStatus?: TenantSubscriptionStatus;
  provisioningStatus?: ProvisioningJobStatus;
}

export interface CreatePlatformWorkspaceApplicationCommand {
  workspaceType: PlatformWorkspaceType;
  workspaceName: string;
  workspaceIdentifier: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerPhoneNumber?: string;
  planId: string;
  billingCycle: BillingCycle;
  brandName?: string;
  description?: string;
  address?: string;
  specialization?: string;
  deliveryMode?: string;
}

export interface PlatformWorkspaceApplicationCreated {
  application: PlatformWorkspaceApplication;
  newIdentity: boolean;
  oneTimeCredentials: { email: string; temporaryPassword: string; mustChangePassword: boolean } | null;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceApplicationsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/workspace-applications`;

  list(filters: WorkspaceApplicationFilters = {}, page = 1, pageSize = 20): Observable<PagedResult<PlatformWorkspaceApplication>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (filters.status != null) params = params.set('status', filters.status);
    if (filters.type != null) params = params.set('applicationType', filters.type);
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

  approve(application: PlatformWorkspaceApplication): Observable<PlatformWorkspaceApplication> {
    const action = [PlatformApplicationType.GymWorkspaceCreation, PlatformApplicationType.FreelanceWorkspaceCreation].includes(application.applicationType)
      ? 'approve-workspace'
      : 'approve-membership';
    return this.http.post<PlatformWorkspaceApplication>(`${this.base}/${application.id}/${action}`, { rowVersion: application.rowVersion });
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
