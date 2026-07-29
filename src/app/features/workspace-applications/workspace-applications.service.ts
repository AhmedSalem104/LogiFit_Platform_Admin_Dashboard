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
  rowVersion: string;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceApplicationsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/workspace-applications`;

  list(status?: PlatformApplicationStatus, type?: PlatformApplicationType, page = 1, pageSize = 20): Observable<PagedResult<PlatformWorkspaceApplication>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (status != null) params = params.set('status', status);
    if (type != null) params = params.set('applicationType', type);
    return this.http.get<PagedResult<PlatformWorkspaceApplication>>(this.base, { params });
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
    const action = application.applicationType === PlatformApplicationType.FreelanceWorkspaceCreation
      ? 'approve-freelance'
      : 'approve-membership';
    return this.http.post<PlatformWorkspaceApplication>(`${this.base}/${application.id}/${action}`, { rowVersion: application.rowVersion });
  }

  reject(application: PlatformWorkspaceApplication, reason: string): Observable<PlatformWorkspaceApplication> {
    return this.http.post<PlatformWorkspaceApplication>(`${this.base}/${application.id}/reject`, {
      rowVersion: application.rowVersion, reason,
    });
  }
}
