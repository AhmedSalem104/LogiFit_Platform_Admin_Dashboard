// ============================================================================
// Platform API models — mirrors PLATFORM_FRONTEND_GUIDE.md
// All JSON is camelCase, dates are UTC ISO-8601 strings.
// ============================================================================

// ---------------------------------- Enums ----------------------------------

export enum TenantStatus {
  Active = 1,
  Suspended = 2,
  Trial = 3,
  PastDue = 4,
  Cancelled = 5,
  PendingApproval = 6,
  Archived = 7,
  Deleted = 8,
}

export enum TenantSubscriptionStatus {
  PendingPayment = 1,
  Trial = 2,
  Active = 3,
  PastDue = 4,
  Suspended = 5,
  Cancelled = 6,
  Expired = 7,
  GracePeriod = 8,
}

export enum PaymentRequestStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4,
  Expired = 5,
}

export enum ProvisioningJobStatus {
  Pending = 1,
  AwaitingDatabaseCapacity = 2,
  Provisioning = 3,
  Completed = 4,
  Failed = 5,
}

export enum PaymentRequestOperation {
  NewSubscription = 1,
  Renew = 2,
  Upgrade = 3,
  Extend = 4,
}

export enum SubscriptionInvoiceStatus {
  Unpaid = 1,
  PendingReview = 2,
  Paid = 3,
  Cancelled = 4,
  Overdue = 5,
}

export enum BillingCycle {
  Monthly = 1,
  SemiAnnual = 2,
  Annual = 3,
}

// ------------------------------- Badge helpers ------------------------------

export type BadgeColor = 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple';

export interface BadgeInfo {
  label: string;
  color: BadgeColor;
}

export const TENANT_STATUS_BADGE: Record<TenantStatus, BadgeInfo> = {
  [TenantStatus.Active]: { label: 'نشط', color: 'green' },
  [TenantStatus.Suspended]: { label: 'موقوف', color: 'red' },
  [TenantStatus.Trial]: { label: 'تجريبي', color: 'blue' },
  [TenantStatus.PastDue]: { label: 'متأخر السداد', color: 'yellow' },
  [TenantStatus.Cancelled]: { label: 'ملغى', color: 'gray' },
  [TenantStatus.PendingApproval]: { label: 'بانتظار الموافقة', color: 'yellow' },
  [TenantStatus.Archived]: { label: 'مؤرشف', color: 'gray' },
  [TenantStatus.Deleted]: { label: 'محذوف', color: 'gray' },
};

export const SUBSCRIPTION_STATUS_BADGE: Partial<Record<TenantSubscriptionStatus, BadgeInfo>> = {
  [TenantSubscriptionStatus.PendingPayment]: { label: 'بانتظار الدفع', color: 'yellow' },
  [TenantSubscriptionStatus.Trial]: { label: 'تجريبي', color: 'blue' },
  [TenantSubscriptionStatus.Active]: { label: 'نشط', color: 'green' },
  [TenantSubscriptionStatus.PastDue]: { label: 'متأخر السداد', color: 'yellow' },
  [TenantSubscriptionStatus.Suspended]: { label: 'موقوف', color: 'red' },
  [TenantSubscriptionStatus.Cancelled]: { label: 'ملغى', color: 'gray' },
  [TenantSubscriptionStatus.Expired]: { label: 'منتهٍ', color: 'red' },
};

export const PAYMENT_REQUEST_STATUS_BADGE: Record<PaymentRequestStatus, BadgeInfo> = {
  [PaymentRequestStatus.Pending]: { label: 'قيد المراجعة', color: 'yellow' },
  [PaymentRequestStatus.Approved]: { label: 'مقبول', color: 'green' },
  [PaymentRequestStatus.Rejected]: { label: 'مرفوض', color: 'red' },
  [PaymentRequestStatus.Cancelled]: { label: 'ملغى', color: 'gray' },
  [PaymentRequestStatus.Expired]: { label: 'منتهٍ', color: 'gray' },
};

export const BILLING_CYCLE_LABEL: Record<BillingCycle, string> = {
  [BillingCycle.Monthly]: 'شهري',
  [BillingCycle.SemiAnnual]: '6 أشهر',
  [BillingCycle.Annual]: 'سنوي',
};

// --------------------------------- DTOs ------------------------------------

export interface PlatformDashboardDto {
  totalGyms: number;
  activeGyms: number;
  trialGyms: number;
  pendingApprovalGyms: number;
  suspendedGyms: number;
  totalMembers: number;
  expiredSubscriptions: number;
  activeSubscriptions: number;
  pendingPayments: number;
  invoiceCount: number;
  invoicedAmount: number;
  collectedAmount: number;
  featureCount: number;
  quotaDefinitionCount: number;
  failedJobs: number;
  failedOutbox: number;
  operations?: PlatformOperationsSummaryDto;
}

export interface PlatformOperationsSummaryDto {
  applications: ApplicationReviewSummaryDto;
  payments: PaymentReviewSummaryDto;
  databasePool: DatabasePoolSummaryDto;
  provisioning: ProvisioningSummaryDto;
  backups: BackupSummaryDto;
  restores: RestoreSummaryDto;
}

export interface ApplicationReviewSummaryDto {
  draft: number;
  submitted: number;
  underReview: number;
  needsMoreInformation: number;
  approved: number;
  rejected: number;
  gymWorkspaceCreation: number;
  freelanceWorkspaceCreation: number;
  membership: number;
}

export interface PaymentReviewSummaryDto {
  pendingReview: number;
  approved: number;
  rejected: number;
  pendingAmount: number;
}

export interface DatabasePoolSummaryDto {
  total: number;
  available: number;
  reserved: number;
  provisioning: number;
  assigned: number;
  maintenance: number;
  restorePending: number;
  faulted: number;
  retired: number;
  activeMappings: number;
}

export interface ProvisioningSummaryDto {
  pending: number;
  awaitingDatabaseCapacity: number;
  provisioning: number;
  completed: number;
  failed: number;
}

export interface BackupSummaryDto {
  totalBatches: number;
  runningBatches: number;
  completedBatches: number;
  failedBatches: number;
  failedArtifacts: number;
  lastCompletedAtUtc: string | null;
}

export interface RestoreSummaryDto {
  totalJobs: number;
  pendingJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  capabilities: DatabaseRestoreCapabilitiesDto;
}

export interface DatabaseRestoreCapabilitiesDto {
  enabled: boolean;
  mode: string;
  supportsBacpacImport: boolean;
  supportsMappingSwitch: boolean;
  unavailableReason: string | null;
}

export interface PlatformTenantDto {
  id: string;
  name: string;
  subdomain: string;
  workspaceType?: string | number | null;
  status: TenantStatus;
  email: string;
  phoneNumber: string;
  membersCount: number;
  createdAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
}

export interface PlatformTenantCredentialsDto {
  tenantId: string;
  tenantName: string;
  ownerEmail: string | null;
  identityLinked: boolean;
  identityActive: boolean;
  emailVerifiedAtUtc: string | null;
  ownerAccountActive: boolean;
  membershipStatus: number | null;
  lastLoginAtUtc: string | null;
  lockoutEndUtc: string | null;
  passwordResetAvailable: boolean;
}

export interface PlatformTenantPasswordResetDto {
  tenantId: string;
  ownerEmail: string | null;
  resetEmailAccepted: boolean;
  expiresInMinutes: number;
}

export interface PlatformTenantDeleteRequest {
  tenantNameConfirmation: string;
  preserveGlobalIdentity: boolean;
}

export interface PlatformTenantPermanentDeleteDto {
  tenantId: string;
  tenantName: string;
  status: string;
  backupBatchId: string;
  backupArtifactId: string;
  databaseResourceId: string;
  globalIdentityPreserved: boolean;
}

export interface CreateTenantWithOwnerCommand {
  name: string;
  subdomain: string;
  email: string;
  phoneNumber: string;
  ownerEmail: string;
  ownerPhoneNumber: string;
  ownerPassword: string;
  ownerFullName: string;
}

export interface PlanDto {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  durationInDays: number;
  maxMembers: number | null;
  maxCoaches: number | null;
  maxBranches: number | null;
  maxEmployees: number | null;
  maxStorageMB: number | null;
  isActive: boolean;
  displayOrder: number;
  features: string[];
}

export interface SavePlanCommand {
  id?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  durationInDays: number;
  maxMembers: number | null;
  maxCoaches: number | null;
  maxBranches: number | null;
  maxEmployees: number | null;
  maxStorageMB: number | null;
  isActive: boolean;
  displayOrder: number;
  featureCodes: string[];
}

export interface FeatureDto {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  nameAr?: string;
  nameEn?: string;
  module?: string;
  isFree?: boolean;
  supportsQuota?: boolean;
  status?: number;
}

export interface PaymentMethodDto {
  id: string;
  name: string;
  type: string;
  accountName: string | null;
  accountNumber: string | null;
  iban: string | null;
  walletNumber: string | null;
  instructions: string | null;
  qrImageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
}

export interface SavePaymentMethodCommand {
  id?: string;
  name: string;
  type: string;
  accountName: string | null;
  accountNumber: string | null;
  iban: string | null;
  walletNumber: string | null;
  instructions: string | null;
  qrImageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
}

export interface PaymentRequestDto {
  id: string;
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  tenantSubscriptionId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  transactionNumber: string;
  paymentDate: string;
  proofFileUrl: string;
  notes: string | null;
  status: PaymentRequestStatus;
  operation: PaymentRequestOperation;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
}

export interface RejectPaymentRequestCommand {
  rejectReason: string;
}

export interface PlatformSubscriptionDto {
  id: string;
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  status: TenantSubscriptionStatus;
  startDate: string;
  endDate: string;
  trialEndsAt: string | null;
  amount: number;
  currency: string;
  autoRenew: boolean;
}

// Standard API error envelope
export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

/** Standard one-based paging contract returned by platform collection APIs. */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
