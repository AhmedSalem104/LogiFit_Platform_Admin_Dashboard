# Complete API Endpoint Catalog

> **Source of truth:** this document is generated from the API controllers by `Scripts/Export-ApiEndpointCatalog.ps1`. Do not edit endpoint rows manually; change the controller, rerun the script, and include the refreshed catalog in the same Pull Request.

Generated: `2026-08-06 15:10 UTC`  |  Total endpoints: **386**

## Contract rules

- **Tenant API** routes normally start with `/api/...`; tenant identity is derived from the JWT and tenant middleware. A frontend-supplied `TenantId` is never a security boundary.
- **Platform API** routes start with `/api/platform/...` and require a Platform JWT and permission unless the entry explicitly says anonymous.
- Common outcomes: `400` validation, `401` missing/expired token, `403` insufficient permission, `404` resource missing, `409` conflict/duplicate, `429` rate limited, and `500` unexpected server error.
- Paginated Platform collections normally return `{ items, totalCount, page, pageSize, totalPages, hasPreviousPage, hasNextPage }`. Pages are one-based and page size is capped at 100.

## Platform API

### PlatformAdministrators

#### `GET /api/platform/administrators` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>

#### `POST /api/platform/administrators` - `Create`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** Body `request`: `CreateAdministratorRequest`<br>Handler signature: `[FromBody] CreateAdministratorRequest request`
- **Declared response:** Task<IActionResult>

#### `PATCH /api/platform/administrators/{id:guid}/status` - `SetStatus`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** Body `isActive`: `bool`<br>Handler signature: `Guid id, [FromBody] bool isActive`
- **Declared response:** Task<IActionResult>

### PlatformAlerts

#### `GET /api/platform/alerts` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>

### PlatformAudit

#### `GET /api/platform/audit-logs` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** Query `entityName`: `string?`<br>Query `action`: `string?`<br>Query `fromUtc`: `DateTime?`<br>Query `toUtc`: `DateTime?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] string? entityName = null, [FromQuery] string? action = null, [FromQuery] DateTime? fromUtc = null, [FromQuery] DateTime? toUtc = null, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<ActionResult<object>>

### PlatformAuth

#### `POST /api/platform/auth/login` - `Login`

- **Access:** Anonymous (no token required)
- **Inputs:** Body `command`: `PlatformPasswordLoginCommand`<br>Handler signature: `[FromBody] PlatformPasswordLoginCommand command`
- **Declared response:** typeof(AuthResponseDto), StatusCodes.Status200OK<br>StatusCodes.Status401Unauthorized

#### `POST /api/platform/auth/logout-all` - `LogoutAll`

- **Access:** JWT required
- **Inputs:** No request input.
- **Declared response:** StatusCodes.Status204NoContent

#### `POST /api/platform/auth/refresh` - `Refresh`

- **Access:** Anonymous (no token required)
- **Inputs:** No request input.
- **Declared response:** typeof(AuthResponseDto), StatusCodes.Status200OK<br>StatusCodes.Status401Unauthorized

### PlatformBackups

#### `GET /api/platform/backups` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** ActionResult<PlatformPage<BackupRecord>>

#### `POST /api/platform/backups` - `Create`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<BackupRecord>>

#### `GET /api/platform/backups/{fileName}/download` - `Download`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Inputs:** Handler signature: `string fileName`
- **Declared response:** IActionResult

#### `POST /api/platform/backups/batch` - `CreateBatch`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Inputs:** Body `request`: `BackupBatchRequest`<br>Handler signature: `[FromBody] BackupBatchRequest request`
- **Declared response:** Task<ActionResult<BackupBatchDto>>

#### `GET /api/platform/backups/batches` - `Batches`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Inputs:** Query `take`: `int`<br>Handler signature: `[FromQuery] int take = 50`
- **Declared response:** ActionResult<IReadOnlyList<BackupBatchDto>>

#### `POST /api/platform/backups/batches/{batchId:guid}/retry` - `Retry`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Inputs:** Handler signature: `Guid batchId`
- **Declared response:** Task<ActionResult<BackupBatchDto>>

#### `GET /api/platform/backups/status` - `Status`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Inputs:** No request input.
- **Declared response:** ActionResult<BackupStatus>

### PlatformDashboard

#### `GET /api/platform/dashboard` - `Get`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** Query `query`: `GetPlatformDashboardQuery`<br>Handler signature: `[FromQuery] GetPlatformDashboardQuery query`
- **Declared response:** typeof(PlatformDashboardDto), StatusCodes.Status200OK

#### `GET /api/platform/dashboard/tenants` - `Tenants`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** Query `search`: `string?`<br>Query `status`: `TenantStatus?`<br>Query `planId`: `Guid?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] string? search = null, [FromQuery] TenantStatus? status = null, [FromQuery] Guid? planId = null, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>

### PlatformDatabaseResources

#### `GET /api/platform/database-resources` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Inputs:** Query `status`: `DatabaseResourceStatus?`<br>Query `tenantId`: `Guid?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] DatabaseResourceStatus? status = null, [FromQuery] Guid? tenantId = null, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<ActionResult<PlatformPage<PlatformDatabaseResourceDto>>>

### PlatformDiagnostics

#### `GET /api/platform/diagnostics/version` - `Version`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** No request input.
- **Declared response:** ActionResult<PlatformVersionDiagnosticsDto>

### PlatformFeatures

#### `GET /api/platform/features` - `GetFeatures`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** StatusCodes.Status200OK

#### `POST /api/platform/features` - `Create`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Inputs:** Body `command`: `UpsertFeatureCommand` { `Id`: Guid?; `Code`: string; `NameAr`: string?; `NameEn`: string?; `Name`: string; `Description`: string?; `Module`: string?; `IsFree`: bool; `IsActive`: bool; `SupportsQuota`: bool; `Status`: FeatureLifecycleStatus }<br>Handler signature: `[FromBody] UpsertFeatureCommand command`
- **Declared response:** Task<ActionResult<FeatureDto>>

#### `PUT /api/platform/features/{id:guid}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Inputs:** Body `command`: `UpsertFeatureCommand` { `Id`: Guid?; `Code`: string; `NameAr`: string?; `NameEn`: string?; `Name`: string; `Description`: string?; `Module`: string?; `IsFree`: bool; `IsActive`: bool; `SupportsQuota`: bool; `Status`: FeatureLifecycleStatus }<br>Handler signature: `Guid id, [FromBody] UpsertFeatureCommand command`
- **Declared response:** Task<ActionResult<FeatureDto>>

#### `GET /api/platform/features/dependencies` - `GetDependencies`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>

#### `POST /api/platform/features/dependencies` - `SetDependency`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Inputs:** Body `command`: `SetFeatureDependencyCommand` { `FeatureId`: Guid; `DependsOnFeatureId`: Guid }<br>Handler signature: `[FromBody] SetFeatureDependencyCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/platform/features/dependencies/{id:guid}` - `DeleteDependency`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<IActionResult>

#### `GET /api/platform/features/quota-definitions` - `GetQuotaDefinitions`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>

#### `POST /api/platform/features/quota-definitions` - `CreateQuotaDefinition`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Inputs:** Body `command`: `UpsertQuotaDefinitionCommand` { `Id`: Guid?; `FeatureId`: Guid; `ResourceKey`: string; `Unit`: string; `DefaultLimit`: int?; `IsActive`: bool }<br>Handler signature: `[FromBody] UpsertQuotaDefinitionCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `PUT /api/platform/features/quota-definitions/{id:guid}` - `UpdateQuotaDefinition`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Inputs:** Body `command`: `UpsertQuotaDefinitionCommand` { `Id`: Guid?; `FeatureId`: Guid; `ResourceKey`: string; `Unit`: string; `DefaultLimit`: int?; `IsActive`: bool }<br>Handler signature: `Guid id, [FromBody] UpsertQuotaDefinitionCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `GET /api/platform/features/tenant-overrides` - `GetTenantOverrides`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Inputs:** Query `tenantId`: `Guid?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] Guid? tenantId, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>

#### `POST /api/platform/features/tenant-overrides` - `SetTenantOverride`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Inputs:** Body `command`: `SetTenantOverrideCommand` { `TenantId`: Guid; `FeatureId`: Guid; `IsEnabled`: bool; `LimitOverride`: int?; `Reason`: string; `StartsAt`: DateTime; `EndsAt`: DateTime? }<br>Handler signature: `[FromBody] SetTenantOverrideCommand command`
- **Declared response:** Task<ActionResult<Guid>>

### PlatformInvoices

#### `GET /api/platform/invoices` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** Query `number`: `string?`<br>Query `tenantId`: `Guid?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] string? number = null, [FromQuery] Guid? tenantId = null, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>

### PlatformNotifications

#### `GET /api/platform/notifications` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** Query `search`: `string?`<br>Query `type`: `NotificationType?`<br>Query `isRead`: `bool?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] string? search = null, [FromQuery] NotificationType? type = null, [FromQuery] bool? isRead = null, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<ActionResult<object>>

#### `POST /api/platform/notifications/{id:guid}/read` - `MarkRead`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<IActionResult>

#### `POST /api/platform/notifications/read-all` - `MarkAllRead`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** No request input.
- **Declared response:** Task<IActionResult>

### PlatformOperations

#### `GET /api/platform/operations/jobs` - `GetJobs`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>

#### `GET /api/platform/operations/outbox` - `GetOutbox`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>

#### `GET /api/platform/operations/provisioning` - `GetProvisioning`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** Query `status`: `ProvisioningJobStatus?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] ProvisioningJobStatus? status = null, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>

### PlatformPaymentMethods

#### `GET /api/platform/payment-methods` - `Get`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Inputs:** Query `activeOnly`: `bool`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] bool activeOnly = false, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** StatusCodes.Status200OK

#### `POST /api/platform/payment-methods` - `Create`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Inputs:** Body `command`: `SavePaymentMethodCommand` { `Id`: Guid?; `Name`: string; `Type`: string?; `AccountName`: string?; `AccountNumber`: string?; `IBAN`: string?; `WalletNumber`: string?; `Instructions`: string?; `QRImageUrl`: string?; `IsActive`: bool; `DisplayOrder`: int }<br>Handler signature: `[FromBody] SavePaymentMethodCommand command`
- **Declared response:** typeof(PaymentMethodDto), StatusCodes.Status201Created

#### `DELETE /api/platform/payment-methods/{id:guid}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** StatusCodes.Status204NoContent

#### `PUT /api/platform/payment-methods/{id:guid}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Inputs:** Body `command`: `SavePaymentMethodCommand` { `Id`: Guid?; `Name`: string; `Type`: string?; `AccountName`: string?; `AccountNumber`: string?; `IBAN`: string?; `WalletNumber`: string?; `Instructions`: string?; `QRImageUrl`: string?; `IsActive`: bool; `DisplayOrder`: int }<br>Handler signature: `Guid id, [FromBody] SavePaymentMethodCommand command`
- **Declared response:** typeof(PaymentMethodDto), StatusCodes.Status200OK

### PlatformPaymentRequests

#### `GET /api/platform/payment-requests` - `Get`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Inputs:** Query `status`: `PaymentRequestStatus?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] PaymentRequestStatus? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20`
- **Declared response:** StatusCodes.Status200OK

#### `POST /api/platform/payment-requests/{id:guid}/approve` - `Approve`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PaymentRequestDto), StatusCodes.Status200OK

#### `GET /api/platform/payment-requests/{id:guid}/proof` - `Proof`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<IActionResult>

#### `POST /api/platform/payment-requests/{id:guid}/reject` - `Reject`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Inputs:** Body `command`: `RejectPaymentRequestCommand` { `PaymentRequestId`: Guid; `RejectReason`: string }<br>Handler signature: `Guid id, [FromBody] RejectPaymentRequestCommand command`
- **Declared response:** typeof(PaymentRequestDto), StatusCodes.Status200OK

### PlatformPlans

#### `GET /api/platform/plans` - `GetPlans`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Inputs:** Query `activeOnly`: `bool`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] bool activeOnly = false, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** StatusCodes.Status200OK

#### `POST /api/platform/plans` - `CreatePlan`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Inputs:** Body `command`: `CreatePlanCommand` { `Name`: string; `Description`: string?; `Price`: decimal; `Currency`: string; `BillingCycle`: BillingCycle; `DurationInDays`: int; `MaxMembers`: int?; `MaxCoaches`: int?; `MaxBranches`: int?; `MaxEmployees`: int?; `MaxStorageMB`: int?; `IsActive`: bool; `DisplayOrder`: int; `FeatureCodes`: List<string> }<br>Handler signature: `[FromBody] CreatePlanCommand command`
- **Declared response:** typeof(PlanDto), StatusCodes.Status201Created

#### `DELETE /api/platform/plans/{id:guid}` - `DeletePlan`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** StatusCodes.Status204NoContent

#### `PUT /api/platform/plans/{id:guid}` - `UpdatePlan`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Inputs:** Body `command`: `UpdatePlanCommand` { `Id`: Guid; `Name`: string; `Description`: string?; `Price`: decimal; `Currency`: string; `BillingCycle`: BillingCycle; `DurationInDays`: int; `MaxMembers`: int?; `MaxCoaches`: int?; `MaxBranches`: int?; `MaxEmployees`: int?; `MaxStorageMB`: int?; `IsActive`: bool; `DisplayOrder`: int; `FeatureCodes`: List<string> }<br>Handler signature: `Guid id, [FromBody] UpdatePlanCommand command`
- **Declared response:** typeof(PlanDto), StatusCodes.Status200OK

### PlatformReports

#### `GET /api/platform/reports/catalog` - `Catalog`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** No request input.
- **Declared response:** Task<IActionResult>

#### `GET /api/platform/reports/overview` - `Overview`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** No request input.
- **Declared response:** Task<IActionResult>

### PlatformRestores

#### `GET /api/platform/restores` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<IReadOnlyList<RestoreJobDto>>>

#### `POST /api/platform/restores` - `Restore`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Inputs:** Body `request`: `PlatformRestoreRequest`<br>Handler signature: `[FromBody] PlatformRestoreRequest request`
- **Declared response:** Task<ActionResult<RestoreJobDto>>

#### `GET /api/platform/restores/capabilities` - `Capabilities`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Inputs:** No request input.
- **Declared response:** ActionResult<DatabaseRestoreCapabilities>

#### `POST /api/platform/restores/reauthenticate` - `Reauthenticate`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Inputs:** Body `request`: `PlatformPasswordReauthenticationRequest`<br>Handler signature: `[FromBody] PlatformPasswordReauthenticationRequest request`
- **Declared response:** Task<ActionResult<SensitiveActionGrantDto>>

### PlatformRoles

#### `GET /api/platform/roles` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>

#### `PUT /api/platform/roles/{id:guid}/permissions` - `Update`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** Body `request`: `UpdateRolePermissionsRequest`<br>Handler signature: `Guid id, [FromBody] UpdateRolePermissionsRequest request`
- **Declared response:** Task<IActionResult>

#### `GET /api/platform/roles/permissions` - `GetPermissionCatalog`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Inputs:** No request input.
- **Declared response:** Task<IActionResult>

### PlatformSubscriptions

#### `GET /api/platform/subscriptions` - `GetSubscriptions`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Query `status`: `TenantSubscriptionStatus?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] TenantSubscriptionStatus? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20`
- **Declared response:** StatusCodes.Status200OK

#### `POST /api/platform/subscriptions/{id:guid}/extend` - `Extend`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Body `command`: `ExtendSubscriptionCommand` { `SubscriptionId`: Guid; `Days`: int }<br>Handler signature: `Guid id, [FromBody] ExtendSubscriptionCommand command`
- **Declared response:** Task<ActionResult<DateTime>>

#### `POST /api/platform/subscriptions/{id:guid}/transition` - `Transition`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Body `command`: `TransitionSubscriptionCommand` { `SubscriptionId`: Guid; `TargetStatus`: TenantSubscriptionStatus }<br>Handler signature: `Guid id, [FromBody] TransitionSubscriptionCommand command`
- **Declared response:** Task<ActionResult<TenantSubscriptionStatus>>

#### `GET /api/platform/subscriptions/{id:guid}/upgrade-preview/{targetPlanId:guid}` - `UpgradePreview`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Handler signature: `Guid id, Guid targetPlanId`
- **Declared response:** Task<ActionResult<UpgradePreviewDto>>

#### `GET /api/platform/subscriptions/usage` - `GetUsage`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<TenantUsageDto>>>

### PlatformTenants

#### `GET /api/platform/tenants` - `GetTenants`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Query `status`: `TenantStatus?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] TenantStatus? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20`
- **Declared response:** StatusCodes.Status200OK

#### `POST /api/platform/tenants` - `CreateTenant`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Body `command`: `CreateTenantWithOwnerCommand` { `Name`: string; `Subdomain`: string?; `Email`: string?; `PhoneNumber`: string?; `OwnerEmail`: string; `OwnerPhoneNumber`: string?; `OwnerPassword`: string; `OwnerFullName`: string }<br>Handler signature: `[FromBody] CreateTenantWithOwnerCommand command`
- **Declared response:** typeof(PlatformTenantDto), StatusCodes.Status201Created

#### `POST /api/platform/tenants/{id:guid}/activate` - `Activate`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantDto), StatusCodes.Status200OK

#### `POST /api/platform/tenants/{id:guid}/approve` - `Approve`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantDto), StatusCodes.Status200OK

#### `POST /api/platform/tenants/{id:guid}/archive` - `Archive`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantDto), StatusCodes.Status200OK

#### `GET /api/platform/tenants/{id:guid}/credentials` - `Credentials`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantCredentialsDto), StatusCodes.Status200OK

#### `POST /api/platform/tenants/{id:guid}/credentials/reset` - `ResetCredentials`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantPasswordResetDto), StatusCodes.Status202Accepted

#### `POST /api/platform/tenants/{id:guid}/permanent-delete` - `PermanentDelete`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Body `request`: `PlatformTenantDeleteRequest`<br>Handler signature: `Guid id, [FromBody] PlatformTenantDeleteRequest request`
- **Declared response:** typeof(PlatformTenantPermanentDeleteDto), StatusCodes.Status200OK

#### `POST /api/platform/tenants/{id:guid}/restore` - `Restore`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantDto), StatusCodes.Status200OK

#### `POST /api/platform/tenants/{id:guid}/soft-delete` - `SoftDelete`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantDto), StatusCodes.Status200OK

#### `POST /api/platform/tenants/{id:guid}/suspend` - `Suspend`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantDto), StatusCodes.Status200OK

### PlatformWorkspaceApplications

#### `GET /api/platform/workspace-applications` - `List`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Query `applicationType`: `ApplicationType?`<br>Query `status`: `ApplicationRequestStatus?`<br>Query `paymentStatus`: `PaymentRequestStatus?`<br>Query `workspaceStatus`: `TenantStatus?`<br>Query `subscriptionStatus`: `TenantSubscriptionStatus?`<br>Query `provisioningStatus`: `ProvisioningJobStatus?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] ApplicationType? applicationType, [FromQuery] ApplicationRequestStatus? status, [FromQuery] PaymentRequestStatus? paymentStatus, [FromQuery] TenantStatus? workspaceStatus, [FromQuery] TenantSubscriptionStatus? subscriptionStatus, [FromQuery] ProvisioningJobStatus? provisioningStatus, [FromQuery] int page = 1, [FromQuery] int pageSize = 20`
- **Declared response:** typeof(PagedResult<PlatformApplicationDto>), StatusCodes.Status200OK

#### `POST /api/platform/workspace-applications` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Body `command`: `CreatePlatformWorkspaceApplicationCommand` { `WorkspaceType`: WorkspaceType; `WorkspaceName`: string; `WorkspaceIdentifier`: string; `OwnerFullName`: string; `OwnerEmail`: string; `OwnerPhoneNumber`: string?; `PlanId`: Guid; `BillingCycle`: BillingCycle; `BrandName`: string?; `Description`: string?; `Address`: string?; `Specialization`: string?; `DeliveryMode`: string? }<br>Handler signature: `[FromBody] CreatePlatformWorkspaceApplicationCommand command`
- **Declared response:** typeof(PlatformWorkspaceApplicationCreatedDto), StatusCodes.Status201Created

#### `POST /api/platform/workspace-applications/{id:guid}/approve-freelance` - `ApproveFreelance`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Body `request`: `ConcurrencyRequest`<br>Handler signature: `Guid id, [FromBody] ConcurrencyRequest request`
- **Declared response:** Task<ActionResult<PlatformApplicationDto>>

#### `POST /api/platform/workspace-applications/{id:guid}/approve-membership` - `ApproveMembership`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Body `request`: `ConcurrencyRequest`<br>Handler signature: `Guid id, [FromBody] ConcurrencyRequest request`
- **Declared response:** Task<ActionResult<PlatformApplicationDto>>

#### `POST /api/platform/workspace-applications/{id:guid}/approve-workspace` - `ApproveWorkspace`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Body `request`: `ConcurrencyRequest`<br>Handler signature: `Guid id, [FromBody] ConcurrencyRequest request`
- **Declared response:** Task<ActionResult<PlatformApplicationDto>>

#### `POST /api/platform/workspace-applications/{id:guid}/reject` - `Reject`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Body `request`: `RejectRequest`<br>Handler signature: `Guid id, [FromBody] RejectRequest request`
- **Declared response:** Task<ActionResult<PlatformApplicationDto>>

#### `POST /api/platform/workspace-applications/{id:guid}/request-information` - `RequestInformation`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Body `request`: `RequestInformationRequest`<br>Handler signature: `Guid id, [FromBody] RequestInformationRequest request`
- **Declared response:** Task<ActionResult<PlatformApplicationDto>>

#### `POST /api/platform/workspace-applications/{id:guid}/retry-provisioning` - `RetryProvisioning`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<PlatformApplicationDto>>

#### `POST /api/platform/workspace-applications/{id:guid}/start-review` - `StartReview`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Body `request`: `ConcurrencyRequest`<br>Handler signature: `Guid id, [FromBody] ConcurrencyRequest request`
- **Declared response:** Task<ActionResult<PlatformApplicationDto>>

## Tenant API

### Appointments

#### `GET /api/Appointments` - `GetAppointments`

- **Access:** JWT required
- **Inputs:** Query `coachId`: `Guid?`<br>Query `clientId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `status`: `AppointmentStatus?`<br>Handler signature: `[FromQuery] Guid? coachId, [FromQuery] Guid? clientId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] AppointmentStatus? status`
- **Declared response:** Task<ActionResult<List<AppointmentDto>>>

#### `POST /api/Appointments` - `CreateAppointment`

- **Access:** JWT required
- **Inputs:** Body `command`: `CreateAppointmentCommand` { `CoachId`: Guid?; `ClientId`: Guid; `StartTime`: DateTime; `EndTime`: DateTime; `Title`: string?; `Notes`: string? }<br>Handler signature: `[FromBody] CreateAppointmentCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/Appointments/{id}` - `DeleteAppointment`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `GET /api/Appointments/{id}` - `GetAppointmentById`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<AppointmentDto>>

#### `PUT /api/Appointments/{id}/status` - `UpdateAppointmentStatus`

- **Access:** JWT required
- **Inputs:** Body `command`: `UpdateAppointmentStatusCommand` { `Id`: Guid; `Status`: AppointmentStatus }<br>Handler signature: `Guid id, [FromBody] UpdateAppointmentStatusCommand command`
- **Declared response:** Task<ActionResult>

### Attendance

#### `GET /api/Attendance` - `GetAttendances`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Inputs:** Query `clientId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `checkedInOnly`: `bool?`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] bool? checkedInOnly`
- **Declared response:** Task<ActionResult<List<AttendanceDto>>>

#### `DELETE /api/Attendance/{id}` - `DeleteAttendance`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `POST /api/Attendance/{id}/check-out` - `CheckOut`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `POST /api/Attendance/check-in` - `CheckIn`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Inputs:** Handler signature: `CheckInCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `GET /api/Attendance/summary` - `GetAttendanceSummary`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<AttendanceSummaryDto>>

### Auth

#### `POST /api/Auth/change-password` - `ChangePassword`

- **Access:** JWT required
- **Inputs:** Body `command`: `ChangePasswordCommand` { `CurrentPassword`: string; `NewPassword`: string }<br>Handler signature: `[FromBody] ChangePasswordCommand command`
- **Declared response:** StatusCodes.Status204NoContent<br>StatusCodes.Status400BadRequest<br>StatusCodes.Status401Unauthorized

#### `POST /api/Auth/logout-all` - `LogoutAll`

- **Access:** JWT required
- **Inputs:** No request input.
- **Declared response:** StatusCodes.Status204NoContent<br>StatusCodes.Status401Unauthorized

#### `POST /api/Auth/refresh` - `Refresh`

- **Access:** Anonymous (no token required)
- **Inputs:** No request input.
- **Declared response:** typeof(AuthResponseDto), StatusCodes.Status200OK<br>StatusCodes.Status401Unauthorized

### BodyMeasurements

#### `GET /api/BodyMeasurements` - `GetBodyMeasurements`

- **Access:** JWT required
- **Inputs:** Query `clientId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<BodyMeasurementDto>>>

#### `POST /api/BodyMeasurements` - `CreateBodyMeasurement`

- **Access:** JWT required
- **Inputs:** Body `command`: `CreateBodyMeasurementCommand` { `ClientId`: Guid; `DateRecorded`: DateTime; `WeightKg`: double; `SkeletalMuscleMass`: double?; `BodyFatMass`: double?; `BodyFatPercent`: double?; `TotalBodyWater`: double?; `Bmr`: double?; `VisceralFatLevel`: int?; `InbodyImage`: IFormFile?; `FrontPhoto`: IFormFile?; `SidePhoto`: IFormFile?; `BackPhoto`: IFormFile? }<br>Handler signature: `[FromBody] CreateBodyMeasurementCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/BodyMeasurements/{id}` - `DeleteBodyMeasurement`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `POST /api/BodyMeasurements/with-images` - `CreateBodyMeasurementWithImages`

- **Access:** JWT required
- **Inputs:** Form `command`: `CreateBodyMeasurementCommand`<br>Handler signature: `[FromForm] CreateBodyMeasurementCommand command`
- **Declared response:** Task<ActionResult<Guid>>

### Branches

#### `GET /api/Branches` - `GetBranches`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Query `isActive`: `bool?`<br>Query `searchTerm`: `string?`<br>Handler signature: `[FromQuery] bool? isActive, [FromQuery] string? searchTerm`
- **Declared response:** typeof(List<BranchDto>), StatusCodes.Status200OK

#### `POST /api/Branches` - `CreateBranch`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Handler signature: `CreateBranchCommand command`
- **Declared response:** typeof(Guid), StatusCodes.Status200OK

#### `DELETE /api/Branches/{id}` - `DeleteBranch`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** StatusCodes.Status204NoContent

#### `GET /api/Branches/{id}` - `GetBranch`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(BranchDto), StatusCodes.Status200OK<br>StatusCodes.Status404NotFound

#### `PUT /api/Branches/{id}` - `UpdateBranch`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Handler signature: `Guid id, UpdateBranchCommand command`
- **Declared response:** StatusCodes.Status204NoContent

#### `PUT /api/Branches/{id}/operating-hours` - `SetOperatingHours`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Handler signature: `Guid id, SetOperatingHoursCommand command`
- **Declared response:** StatusCodes.Status204NoContent

### Branding

#### `GET /api/Branding/{identifier}` - `GetBranding`

- **Access:** Anonymous (no token required)
- **Inputs:** Handler signature: `string identifier`
- **Declared response:** typeof(BrandingDto), StatusCodes.Status200OK<br>StatusCodes.Status404NotFound

### Challenges

#### `GET /api/Challenges` - `GetChallenges`

- **Access:** JWT required
- **Inputs:** Query `status`: `ChallengeStatus?`<br>Handler signature: `[FromQuery] ChallengeStatus? status`
- **Declared response:** Task<ActionResult<List<ChallengeDto>>>

#### `POST /api/Challenges` - `CreateChallenge`

- **Access:** JWT required
- **Inputs:** Body `command`: `CreateChallengeCommand` { `Title`: string; `Description`: string?; `StartDate`: DateTime; `EndDate`: DateTime; `TargetMetric`: string?; `TargetValue`: double?; `ClientIds`: List<Guid>? }<br>Handler signature: `[FromBody] CreateChallengeCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `PUT /api/Challenges/{challengeId}/progress` - `UpdateProgress`

- **Access:** JWT required
- **Inputs:** Body `command`: `UpdateProgressCommand` { `ChallengeId`: Guid; `Progress`: double; `Increment`: bool }<br>Handler signature: `Guid challengeId, [FromBody] UpdateProgressCommand command`
- **Declared response:** Task<ActionResult>

#### `DELETE /api/Challenges/{id}` - `DeleteChallenge`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `GET /api/Challenges/{id}` - `GetChallengeById`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<ChallengeDto>>

#### `PUT /api/Challenges/{id}` - `UpdateChallenge`

- **Access:** JWT required
- **Inputs:** Body `command`: `UpdateChallengeCommand` { `Id`: Guid; `Title`: string?; `Description`: string?; `EndDate`: DateTime?; `Status`: ChallengeStatus? }<br>Handler signature: `Guid id, [FromBody] UpdateChallengeCommand command`
- **Declared response:** Task<ActionResult>

#### `POST /api/Challenges/{id}/join` - `JoinChallenge`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<Guid>>

#### `GET /api/Challenges/{id}/leaderboard` - `GetLeaderboard`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<List<ChallengeLeaderboardEntryDto>>>

#### `GET /api/Challenges/my` - `GetMyChallenges`

- **Access:** JWT required
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<ClientChallengeDto>>>

### Chat

#### `GET /api/Chat/conversations` - `GetMyConversations`

- **Access:** JWT required
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<ConversationDto>>>

#### `GET /api/Chat/conversations/{conversationId}/messages` - `GetConversationMessages`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid conversationId`
- **Declared response:** Task<ActionResult<List<ChatMessageDto>>>

#### `PUT /api/Chat/conversations/{conversationId}/read` - `MarkMessagesAsRead`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid conversationId`
- **Declared response:** Task<ActionResult>

#### `POST /api/Chat/messages` - `SendMessage`

- **Access:** JWT required
- **Inputs:** Body `command`: `SendMessageCommand` { `ConversationId`: Guid?; `RecipientId`: Guid?; `Content`: string }<br>Handler signature: `[FromBody] SendMessageCommand command`
- **Declared response:** Task<ActionResult<Guid>>

### ClassSchedules

#### `GET /api/ClassSchedules` - `GetSchedules`

- **Access:** JWT required
- **Inputs:** Query `groupClassId`: `Guid?`<br>Query `coachId`: `Guid?`<br>Query `roomId`: `Guid?`<br>Query `branchId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `includeCancelled`: `bool?`<br>Handler signature: `[FromQuery] Guid? groupClassId, [FromQuery] Guid? coachId, [FromQuery] Guid? roomId, [FromQuery] Guid? branchId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] bool? includeCancelled`
- **Declared response:** Task<ActionResult<List<ClassScheduleDto>>>

#### `POST /api/ClassSchedules` - `Create`

- **Access:** JWT required
- **Inputs:** Handler signature: `CreateClassScheduleCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `POST /api/ClassSchedules/{id}/book` - `Book`

- **Access:** JWT required
- **Inputs:** Body `command`: `BookClassCommand` { `ScheduleId`: Guid; `ClientId`: Guid }<br>Handler signature: `Guid id, [FromBody] BookClassCommand command`
- **Declared response:** Task<ActionResult<ClassEnrollmentDto>>

#### `POST /api/ClassSchedules/{id}/cancel` - `Cancel`

- **Access:** JWT required
- **Inputs:** Body `command`: `CancelClassScheduleCommand` { `Id`: Guid; `Reason`: string? }<br>Handler signature: `Guid id, [FromBody] CancelClassScheduleCommand command`
- **Declared response:** Task<ActionResult>

#### `GET /api/ClassSchedules/{id}/enrollments` - `GetEnrollments`

- **Access:** JWT required
- **Inputs:** Query `includeCancelled`: `bool`<br>Handler signature: `Guid id, [FromQuery] bool includeCancelled = false`
- **Declared response:** Task<ActionResult<List<ClassEnrollmentDto>>>

#### `POST /api/ClassSchedules/enrollments/{enrollmentId}/attended` - `MarkAttended`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid enrollmentId`
- **Declared response:** Task<ActionResult>

#### `POST /api/ClassSchedules/enrollments/{enrollmentId}/cancel` - `CancelEnrollment`

- **Access:** JWT required
- **Inputs:** Body `command`: `CancelEnrollmentCommand` { `Id`: Guid; `Reason`: string? }<br>Handler signature: `Guid enrollmentId, [FromBody] CancelEnrollmentCommand command`
- **Declared response:** Task<ActionResult>

### ClientDashboard

#### `GET /api/client/dashboard` - `GetMyDashboard`

- **Access:** JWT required
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<ClientDashboardDto>>

#### `GET /api/client/my-appointments` - `GetMyAppointments`

- **Access:** JWT required
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<MyAppointmentDto>>>

#### `GET /api/client/my-coach` - `GetMyCoach`

- **Access:** JWT required
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<MyCoachDto>>

#### `GET /api/client/my-diet-plans` - `GetMyDietPlans`

- **Access:** JWT required
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<MyDietPlanDto>>>

#### `GET /api/client/my-measurements` - `GetMyMeasurements`

- **Access:** JWT required
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<MyBodyMeasurementDto>>>

#### `GET /api/client/my-programs` - `GetMyPrograms`

- **Access:** JWT required
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<MyWorkoutProgramDto>>>

#### `GET /api/client/my-subscriptions` - `GetMySubscriptions`

- **Access:** JWT required
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<MySubscriptionSummaryDto>>>

### Clients

#### `GET /api/Clients` - `GetClients`

- **Access:** JWT + Policy: `Permissions.ViewMembers`
- **Inputs:** Query `searchTerm`: `string?`<br>Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] string? searchTerm, [FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<ClientDto>>>

#### `POST /api/Clients` - `CreateClient`

- **Access:** JWT + Policy: `Permissions.CreateMembers`
- **Inputs:** Handler signature: `CreateClientCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/Clients/{id}` - `DeleteClient`

- **Access:** JWT + Policy: `Permissions.DeleteMembers`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `GET /api/Clients/{id}` - `GetClient`

- **Access:** JWT + Policy: `Permissions.ViewMembers`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<ClientDto>>

#### `PUT /api/Clients/{id}` - `UpdateClient`

- **Access:** JWT + Policy: `Permissions.UpdateMembers`
- **Inputs:** Handler signature: `Guid id, UpdateClientCommand command`
- **Declared response:** Task<ActionResult>

#### `POST /api/Clients/onboard` - `OnboardClient`

- **Access:** JWT + Policy: `Permissions.CreateMembers`
- **Inputs:** Handler signature: `OnboardClientCommand command`
- **Declared response:** Task<ActionResult<OnboardClientResult>>

### CoachClients

#### `GET /api/coach-clients` - `GetCoachClients`

- **Access:** JWT + Policy: `Permissions.ViewMembers`
- **Inputs:** Query `coachId`: `Guid?`<br>Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] Guid? coachId, [FromQuery] bool? isActive = true`
- **Declared response:** Task<ActionResult<List<CoachClientDto>>>

#### `POST /api/coach-clients` - `AddTrainee`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Inputs:** Handler signature: `AddTraineeCommand command`
- **Declared response:** Task<ActionResult<AddTraineeResult>>

#### `DELETE /api/coach-clients/{clientId}` - `UnassignClientFromCoach`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Inputs:** Handler signature: `Guid clientId`
- **Declared response:** Task<ActionResult>

#### `GET /api/coach-clients/{id}` - `GetCoachClientById`

- **Access:** JWT + Policy: `Permissions.ViewMembers`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<CoachClientDto>>

#### `PUT /api/coach-clients/{id}` - `UpdateCoachClient`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Inputs:** Body `command`: `UpdateCoachClientCommand` { `Id`: Guid; `NewCoachId`: Guid?; `IsActive`: bool? }<br>Handler signature: `Guid id, [FromBody] UpdateCoachClientCommand command`
- **Declared response:** Task<ActionResult>

#### `POST /api/coach-clients/assign` - `AssignClientToCoach`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Inputs:** Handler signature: `AssignClientToCoachCommand command`
- **Declared response:** Task<ActionResult<Guid>>

### Coaches

#### `GET /api/Coaches` - `GetCoaches`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Inputs:** Query `searchTerm`: `string?`<br>Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] string? searchTerm, [FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<CoachDto>>>

#### `POST /api/Coaches` - `CreateCoach`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Inputs:** Handler signature: `CreateCoachCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/Coaches/{id}` - `DeleteCoach`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `GET /api/Coaches/{id}` - `GetCoach`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<CoachDto>>

#### `PUT /api/Coaches/{id}` - `UpdateCoach`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Inputs:** Handler signature: `Guid id, UpdateCoachCommand command`
- **Declared response:** Task<ActionResult>

#### `POST /api/Coaches/{id}/qr/regenerate` - `RegenerateQr`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<object>>

#### `POST /api/Coaches/{id}/qr/revoke` - `RevokeQr`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<IActionResult>

### Commissions

#### `GET /api/Commissions` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Query `employeeId`: `Guid?`<br>Query `status`: `CommissionStatus?`<br>Query `sourceType`: `CommissionSourceType?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? employeeId, [FromQuery] CommissionStatus? status, [FromQuery] CommissionSourceType? sourceType, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<CommissionDto>>>

#### `GET /api/Commissions/rules` - `GetRules`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<CommissionRuleDto>>>

#### `POST /api/Commissions/rules` - `CreateRule`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `CreateCommissionRuleCommand command`
- **Declared response:** Task<ActionResult<Guid>>

### Coupons

#### `GET /api/Coupons` - `GetCoupons`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Query `isActive`: `bool?`<br>Query `search`: `string?`<br>Handler signature: `[FromQuery] bool? isActive, [FromQuery] string? search`
- **Declared response:** Task<ActionResult<List<CouponDto>>>

#### `POST /api/Coupons` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `CreateCouponCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/Coupons/{id}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `PUT /api/Coupons/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `Guid id, UpdateCouponCommand command`
- **Declared response:** Task<ActionResult>

#### `GET /api/Coupons/validate` - `Validate`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Query `code`: `string`<br>Query `amount`: `decimal`<br>Query `context`: `CouponApplicability?`<br>Query `clientId`: `Guid?`<br>Handler signature: `[FromQuery] string code, [FromQuery] decimal amount, [FromQuery] CouponApplicability? context, [FromQuery] Guid? clientId`
- **Declared response:** Task<ActionResult<ValidateCouponResultDto>>

### DietPlans

#### `GET /api/DietPlans` - `GetDietPlans`

- **Access:** JWT required
- **Inputs:** Query `coachId`: `Guid?`<br>Query `clientId`: `Guid?`<br>Query `status`: `PlanStatus?`<br>Handler signature: `[FromQuery] Guid? coachId, [FromQuery] Guid? clientId, [FromQuery] PlanStatus? status`
- **Declared response:** Task<ActionResult<List<DietPlanDto>>>

#### `POST /api/DietPlans` - `CreateDietPlan`

- **Access:** JWT required
- **Inputs:** Handler signature: `CreateDietPlanCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/DietPlans/{id}` - `DeleteDietPlan`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `GET /api/DietPlans/{id}` - `GetDietPlan`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<DietPlanDto>>

#### `PUT /api/DietPlans/{id}` - `UpdateDietPlan`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id, UpdateDietPlanCommand command`
- **Declared response:** Task<ActionResult>

#### `POST /api/DietPlans/{id}/duplicate` - `DuplicateDietPlan`

- **Access:** JWT required
- **Inputs:** Body `command`: `DuplicateDietPlanCommand?` { `Id`: Guid; `NewClientId`: Guid?; `NewName`: string? }<br>Handler signature: `Guid id, [FromBody] DuplicateDietPlanCommand? command`
- **Declared response:** Task<ActionResult<Guid>>

#### `POST /api/DietPlans/{planId}/meals` - `CreateDailyMeal`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid planId, CreateDailyMealCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/DietPlans/meals/{mealId}` - `DeleteDailyMeal`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid mealId`
- **Declared response:** Task<ActionResult>

#### `PUT /api/DietPlans/meals/{mealId}` - `UpdateDailyMeal`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid mealId, UpdateDailyMealCommand command`
- **Declared response:** Task<ActionResult>

#### `POST /api/DietPlans/meals/{mealId}/items` - `CreateMealItem`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid mealId, CreateMealItemCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/DietPlans/meals/items/{itemId}` - `DeleteMealItem`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid itemId`
- **Declared response:** Task<ActionResult>

#### `PUT /api/DietPlans/meals/items/{itemId}` - `UpdateMealItem`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid itemId, UpdateMealItemCommand command`
- **Declared response:** Task<ActionResult>

### Employees

#### `GET /api/Employees` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Query `branchId`: `Guid?`<br>Query `department`: `string?`<br>Query `isActive`: `bool?`<br>Query `searchTerm`: `string?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] string? department, [FromQuery] bool? isActive, [FromQuery] string? searchTerm`
- **Declared response:** Task<ActionResult<List<EmployeeDto>>>

#### `POST /api/Employees` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Handler signature: `CreateEmployeeCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `PUT /api/Employees/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Handler signature: `Guid id, UpdateEmployeeCommand command`
- **Declared response:** Task<ActionResult>

#### `POST /api/Employees/{id}/qr/regenerate` - `RegenerateQr`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<object>>

#### `POST /api/Employees/{id}/qr/revoke` - `RevokeQr`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<IActionResult>

#### `POST /api/Employees/{id}/terminate` - `Terminate`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Body `command`: `TerminateEmployeeCommand` { `Id`: Guid; `TerminationDate`: DateTime?; `Reason`: string? }<br>Handler signature: `Guid id, [FromBody] TerminateEmployeeCommand command`
- **Declared response:** Task<ActionResult>

### Equipment

#### `GET /api/Equipment` - `GetEquipment`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Query `branchId`: `Guid?`<br>Query `roomId`: `Guid?`<br>Query `status`: `EquipmentStatus?`<br>Query `searchTerm`: `string?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] Guid? roomId, [FromQuery] EquipmentStatus? status, [FromQuery] string? searchTerm`
- **Declared response:** typeof(List<EquipmentDto>), StatusCodes.Status200OK

#### `POST /api/Equipment` - `CreateEquipment`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Handler signature: `CreateEquipmentCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/Equipment/{id}` - `DeleteEquipment`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `PUT /api/Equipment/{id}` - `UpdateEquipment`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Handler signature: `Guid id, UpdateEquipmentCommand command`
- **Declared response:** Task<ActionResult>

#### `PUT /api/Equipment/{id}/status` - `ChangeStatus`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Handler signature: `Guid id, ChangeEquipmentStatusCommand command`
- **Declared response:** Task<ActionResult>

### Exercises

#### `GET /api/Exercises` - `GetExercises`

- **Access:** JWT required
- **Inputs:** Query `targetMuscleId`: `int?`<br>Query `equipment`: `string?`<br>Query `isHighImpact`: `bool?`<br>Handler signature: `[FromQuery] int? targetMuscleId, [FromQuery] string? equipment, [FromQuery] bool? isHighImpact`
- **Declared response:** Task<ActionResult<List<ExerciseDto>>>

#### `POST /api/Exercises` - `CreateExercise`

- **Access:** JWT required
- **Inputs:** Form `command`: `CreateExerciseCommand`<br>Handler signature: `[FromForm] CreateExerciseCommand command`
- **Declared response:** Task<ActionResult<int>>

#### `DELETE /api/Exercises/{id}` - `DeleteExercise`

- **Access:** JWT required
- **Inputs:** Handler signature: `int id`
- **Declared response:** Task<ActionResult>

#### `GET /api/Exercises/{id}` - `GetExercise`

- **Access:** JWT required
- **Inputs:** Handler signature: `int id`
- **Declared response:** Task<ActionResult<ExerciseDto>>

#### `PUT /api/Exercises/{id}` - `UpdateExercise`

- **Access:** JWT required
- **Inputs:** Form `command`: `UpdateExerciseCommand`<br>Handler signature: `int id, [FromForm] UpdateExerciseCommand command`
- **Declared response:** Task<ActionResult>

### ExpenseCategories

#### `GET /api/ExpenseCategories` - `GetCategories`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<ExpenseCategoryDto>>>

#### `POST /api/ExpenseCategories` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `CreateExpenseCategoryCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/ExpenseCategories/{id}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `PUT /api/ExpenseCategories/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `Guid id, UpdateExpenseCategoryCommand command`
- **Declared response:** Task<ActionResult>

### Expenses

#### `GET /api/Expenses` - `GetExpenses`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Query `branchId`: `Guid?`<br>Query `categoryId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `searchTerm`: `string?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] Guid? categoryId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] string? searchTerm`
- **Declared response:** Task<ActionResult<List<ExpenseDto>>>

#### `POST /api/Expenses` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `CreateExpenseCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/Expenses/{id}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `PUT /api/Expenses/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `Guid id, UpdateExpenseCommand command`
- **Declared response:** Task<ActionResult>

### Foods

#### `GET /api/Foods` - `GetFoods`

- **Access:** JWT required
- **Inputs:** Query `category`: `string?`<br>Query `searchTerm`: `string?`<br>Query `isVerified`: `bool?`<br>Handler signature: `[FromQuery] string? category, [FromQuery] string? searchTerm, [FromQuery] bool? isVerified`
- **Declared response:** Task<ActionResult<List<FoodDto>>>

#### `POST /api/Foods` - `CreateFood`

- **Access:** JWT required
- **Inputs:** Handler signature: `CreateFoodCommand command`
- **Declared response:** Task<ActionResult<int>>

#### `DELETE /api/Foods/{id}` - `DeleteFood`

- **Access:** JWT required
- **Inputs:** Handler signature: `int id`
- **Declared response:** Task<ActionResult>

#### `GET /api/Foods/{id}` - `GetFood`

- **Access:** JWT required
- **Inputs:** Handler signature: `int id`
- **Declared response:** Task<ActionResult<FoodDto>>

#### `PUT /api/Foods/{id}` - `UpdateFood`

- **Access:** JWT required
- **Inputs:** Handler signature: `int id, UpdateFoodCommand command`
- **Declared response:** Task<ActionResult>

### FreelanceTeamApplications

#### `POST /api/freelance/team/applications` - `Sponsor`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Inputs:** Body `command`: `SponsorFreelanceMembershipCommand` { `IdentityEmail`: string; `RequestedRole`: UserRole; `FullName`: string }<br>Handler signature: `[FromBody] SponsorFreelanceMembershipCommand command`
- **Declared response:** typeof(ApplicationTrackingStatusDto), StatusCodes.Status201Created

#### `POST /api/freelance/team/applications/api/freelance/team/invites` - `Invite`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Inputs:** Body `command`: `CreateWorkspaceInviteCommand` { `Email`: string; `RequestedRole`: UserRole }<br>Handler signature: `[FromBody] CreateWorkspaceInviteCommand command`
- **Declared response:** typeof(WorkspaceInviteCreatedDto), StatusCodes.Status201Created

### GateAccess

#### `POST /api/GateAccess/check-in-qr` - `CheckInByQr`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Inputs:** Handler signature: `GateCheckInByQrCommand command`
- **Declared response:** typeof(GateCheckInResultDto), StatusCodes.Status200OK

#### `GET /api/GateAccess/logs` - `GetLogs`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Inputs:** Query `clientId`: `Guid?`<br>Query `branchId`: `Guid?`<br>Query `result`: `GateAccessResult?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `take`: `int`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] Guid? branchId, [FromQuery] GateAccessResult? result, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] int take = 200`
- **Declared response:** typeof(List<GateAccessLogDto>), StatusCodes.Status200OK

#### `GET /api/GateAccess/scan` - `Scan`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Inputs:** Query `qrCode`: `string`<br>Handler signature: `[FromQuery] string qrCode`
- **Declared response:** typeof(QrMemberLookupDto), StatusCodes.Status200OK

### GroupClasses

#### `GET /api/GroupClasses` - `GetClasses`

- **Access:** JWT required
- **Inputs:** Query `branchId`: `Guid?`<br>Query `isActive`: `bool?`<br>Query `category`: `string?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] bool? isActive, [FromQuery] string? category`
- **Declared response:** Task<ActionResult<List<GroupClassDto>>>

#### `POST /api/GroupClasses` - `Create`

- **Access:** JWT required
- **Inputs:** Handler signature: `CreateGroupClassCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/GroupClasses/{id}` - `Delete`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `PUT /api/GroupClasses/{id}` - `Update`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id, UpdateGroupClassCommand command`
- **Declared response:** Task<ActionResult>

### GymProfile

#### `GET /api/GymProfile` - `GetProfile`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** No request input.
- **Declared response:** typeof(GymProfileDto), StatusCodes.Status200OK<br>StatusCodes.Status404NotFound

#### `PUT /api/GymProfile` - `UpdateProfile`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** Body `command`: `UpdateGymProfileCommand` { `Name`: string?; `Description`: string?; `Address`: string?; `PhoneNumber`: string?; `Email`: string?; `LogoUrl`: string?; `CoverImageUrl`: string?; `GalleryImages`: List<string>?; `PrimaryColor`: string?; `SecondaryColor`: string?; `LogoDarkUrl`: string?; `LogoLightUrl`: string?; `LogoIconUrl`: string?; `FaviconUrl`: string?; `LoginBackgroundUrl`: string?; `DashboardBannerUrl`: string?; `PrimaryHoverColor`: string?; `PrimaryForegroundColor`: string?; `SecondaryHoverColor`: string?; `SecondaryForegroundColor`: string?; `AccentColor`: string?; `BackgroundColor`: string?; `SurfaceColor`: string?; `CardColor`: string? }<br>Handler signature: `[FromBody] UpdateGymProfileCommand command`
- **Declared response:** StatusCodes.Status204NoContent<br>StatusCodes.Status404NotFound

#### `POST /api/GymProfile/assets` - `UploadBrandAsset`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** Form `file`: `IFormFile`<br>Form `assetType`: `string`<br>Form `title`: `string?`<br>Form `altText`: `string?`<br>Handler signature: `[FromForm] IFormFile file, [FromForm] string assetType = "Gallery", [FromForm] string? title = null, [FromForm] string? altText = null`
- **Declared response:** Task<ActionResult<BrandAssetResponse>>

#### `DELETE /api/GymProfile/assets/{id:guid}` - `DeleteBrandAsset`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<IActionResult>

#### `POST /api/GymProfile/cover` - `UploadCover`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** Handler signature: `IFormFile file`
- **Declared response:** typeof(UploadResponseDto), StatusCodes.Status200OK<br>StatusCodes.Status400BadRequest

#### `POST /api/GymProfile/gallery` - `UploadGalleryImages`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** Form `files`: `List<IFormFile>`<br>Handler signature: `[FromForm] List<IFormFile> files`
- **Declared response:** typeof(UploadMultipleResponseDto), StatusCodes.Status200OK<br>StatusCodes.Status400BadRequest

#### `POST /api/GymProfile/logo` - `UploadLogo`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** Handler signature: `IFormFile file`
- **Declared response:** typeof(UploadResponseDto), StatusCodes.Status200OK<br>StatusCodes.Status400BadRequest

### Identity

#### `POST /api/identity/application-tracking-sessions` - `ReissueApplicationTrackingSessions`

- **Access:** Anonymous (no token required)
- **Inputs:** Body `command`: `ReissueApplicationTrackingSessionsCommand` { `WorkspaceSelectionToken`: string }<br>Handler signature: `[FromBody] ReissueApplicationTrackingSessionsCommand command`
- **Declared response:** typeof(IReadOnlyList<ApplicationTrackingSessionDto>), StatusCodes.Status200OK

#### `POST /api/identity/login` - `Login`

- **Access:** Anonymous (no token required)
- **Inputs:** Body `command`: `IdentitySignInCommand` { `Email`: string; `Password`: string }<br>Handler signature: `[FromBody] IdentitySignInCommand command`
- **Declared response:** typeof(IdentitySignInDto), StatusCodes.Status200OK

#### `POST /api/identity/password-reset` - `RequestPasswordReset`

- **Access:** Anonymous (no token required)
- **Inputs:** Body `command`: `RequestIdentityPasswordResetCommand` { `Email`: string }<br>Handler signature: `[FromBody] RequestIdentityPasswordResetCommand command`
- **Declared response:** StatusCodes.Status202Accepted

#### `POST /api/identity/password-reset/confirm` - `ResetPassword`

- **Access:** Anonymous (no token required)
- **Inputs:** Body `command`: `ResetIdentityPasswordCommand` { `Token`: string; `NewPassword`: string }<br>Handler signature: `[FromBody] ResetIdentityPasswordCommand command`
- **Declared response:** StatusCodes.Status204NoContent

#### `POST /api/identity/register` - `Register`

- **Access:** Anonymous (no token required)
- **Inputs:** Body `command`: `RegisterIdentityCommand` { `FullName`: string; `Email`: string; `Password`: string; `PhoneNumber`: string? }<br>Handler signature: `[FromBody] RegisterIdentityCommand command`
- **Declared response:** StatusCodes.Status202Accepted

#### `POST /api/identity/select-workspace` - `SelectWorkspace`

- **Access:** Anonymous (no token required)
- **Inputs:** Body `command`: `SelectIdentityWorkspaceCommand` { `WorkspaceSelectionToken`: string; `WorkspaceId`: Guid }<br>Handler signature: `[FromBody] SelectIdentityWorkspaceCommand command`
- **Declared response:** typeof(AuthResponseDto), StatusCodes.Status200OK

#### `POST /api/identity/verify-email` - `VerifyEmail`

- **Access:** Anonymous (no token required)
- **Inputs:** Body `command`: `VerifyIdentityEmailCommand` { `Token`: string }<br>Handler signature: `[FromBody] VerifyIdentityEmailCommand command`
- **Declared response:** StatusCodes.Status204NoContent

### Invoices

#### `GET /api/Invoices` - `GetInvoices`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Query `clientId`: `Guid?`<br>Query `branchId`: `Guid?`<br>Query `status`: `InvoiceStatus?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] Guid? branchId, [FromQuery] InvoiceStatus? status, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<InvoiceDto>>>

#### `POST /api/Invoices` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `CreateInvoiceCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `GET /api/Invoices/{id}` - `GetInvoice`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<InvoiceDto>>

#### `POST /api/Invoices/{id}/cancel` - `Cancel`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Body `command`: `CancelInvoiceCommand` { `Id`: Guid; `Reason`: string? }<br>Handler signature: `Guid id, [FromBody] CancelInvoiceCommand command`
- **Declared response:** Task<ActionResult>

#### `POST /api/Invoices/{id}/issue` - `Issue`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

### Leaves

#### `GET /api/Leaves` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Query `employeeId`: `Guid?`<br>Query `status`: `LeaveStatus?`<br>Query `leaveType`: `LeaveType?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? employeeId, [FromQuery] LeaveStatus? status, [FromQuery] LeaveType? leaveType, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<LeaveRequestDto>>>

#### `POST /api/Leaves` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Handler signature: `CreateLeaveRequestCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `POST /api/Leaves/{id}/review` - `Review`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Body `command`: `ReviewLeaveRequestCommand` { `Id`: Guid; `Decision`: LeaveStatus; `Notes`: string? }<br>Handler signature: `Guid id, [FromBody] ReviewLeaveRequestCommand command`
- **Declared response:** Task<ActionResult>

### Maintenance

#### `GET /api/Maintenance` - `GetRecords`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Query `equipmentId`: `Guid?`<br>Query `status`: `MaintenanceStatus?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? equipmentId, [FromQuery] MaintenanceStatus? status, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** typeof(List<MaintenanceRecordDto>), StatusCodes.Status200OK

#### `POST /api/Maintenance` - `CreateMaintenance`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Handler signature: `CreateMaintenanceCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `POST /api/Maintenance/{id}/resolve` - `Resolve`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Handler signature: `Guid id, ResolveMaintenanceCommand command`
- **Declared response:** Task<ActionResult>

### MealLogs

#### `GET /api/meal-logs` - `GetMealLogs`

- **Access:** JWT required
- **Inputs:** Query `date`: `DateTime?`<br>Handler signature: `[FromQuery] DateTime? date`
- **Declared response:** typeof(List<MealLogDto>), StatusCodes.Status200OK

#### `POST /api/meal-logs` - `LogMeal`

- **Access:** JWT required
- **Inputs:** Body `command`: `LogMealCommand` { `MealItemId`: Guid; `ConsumedQuantity`: double; `ConsumedAt`: DateTime?; `AlternativeFoodId`: int? }<br>Handler signature: `[FromBody] LogMealCommand command`
- **Declared response:** typeof(Guid), StatusCodes.Status201Created

#### `DELETE /api/meal-logs/{id}` - `Delete`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `GET /api/meal-logs/summary` - `GetSummary`

- **Access:** JWT required
- **Inputs:** Query `date`: `DateTime?`<br>Handler signature: `[FromQuery] DateTime? date`
- **Declared response:** typeof(NutritionSummaryDto), StatusCodes.Status200OK

### Media

#### `GET /api/media/object` - `GetObject`

- **Access:** JWT required
- **Inputs:** Query `key`: `string`<br>Handler signature: `[FromQuery] string key`
- **Declared response:** Task<IActionResult>

### MembershipCards

#### `GET /api/MembershipCards` - `GetCards`

- **Access:** JWT + Policy: `Permissions.ManageMembers`
- **Inputs:** Query `clientId`: `Guid?`<br>Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] bool? isActive`
- **Declared response:** typeof(List<MembershipCardDto>), StatusCodes.Status200OK

#### `POST /api/MembershipCards/{id}/revoke` - `RevokeCard`

- **Access:** JWT + Policy: `Permissions.ManageMembers`
- **Inputs:** Body `command`: `RevokeMembershipCardCommand` { `Id`: Guid; `Reason`: string? }<br>Handler signature: `Guid id, [FromBody] RevokeMembershipCardCommand command`
- **Declared response:** StatusCodes.Status204NoContent

#### `POST /api/MembershipCards/issue` - `IssueCard`

- **Access:** JWT + Policy: `Permissions.ManageMembers`
- **Inputs:** Handler signature: `IssueMembershipCardCommand command`
- **Declared response:** typeof(Guid), StatusCodes.Status200OK

### Muscles

#### `GET /api/Muscles` - `GetMuscles`

- **Access:** JWT required
- **Inputs:** Query `bodyPart`: `string?`<br>Handler signature: `[FromQuery] string? bodyPart`
- **Declared response:** typeof(List<MuscleDto>), StatusCodes.Status200OK

#### `POST /api/Muscles` - `CreateMuscle`

- **Access:** JWT required
- **Inputs:** Body `command`: `CreateMuscleCommand` { `Name`: string; `NameAr`: string?; `BodyPart`: string?; `Description`: string?; `DescriptionAr`: string?; `Icon`: string? }<br>Handler signature: `[FromBody] CreateMuscleCommand command`
- **Declared response:** typeof(MuscleDto), StatusCodes.Status201Created<br>StatusCodes.Status400BadRequest

#### `DELETE /api/Muscles/{id}` - `DeleteMuscle`

- **Access:** JWT required
- **Inputs:** Handler signature: `int id`
- **Declared response:** StatusCodes.Status204NoContent<br>StatusCodes.Status400BadRequest<br>StatusCodes.Status404NotFound

#### `GET /api/Muscles/{id}` - `GetMuscle`

- **Access:** JWT required
- **Inputs:** Handler signature: `int id`
- **Declared response:** typeof(MuscleDto), StatusCodes.Status200OK<br>StatusCodes.Status404NotFound

#### `PUT /api/Muscles/{id}` - `UpdateMuscle`

- **Access:** JWT required
- **Inputs:** Body `command`: `UpdateMuscleCommand` { `Id`: int; `Name`: string; `NameAr`: string?; `BodyPart`: string?; `Description`: string?; `DescriptionAr`: string?; `Icon`: string? }<br>Handler signature: `int id, [FromBody] UpdateMuscleCommand command`
- **Declared response:** typeof(MuscleDto), StatusCodes.Status200OK<br>StatusCodes.Status400BadRequest<br>StatusCodes.Status404NotFound

### Notifications

#### `GET /api/Notifications` - `GetMyNotifications`

- **Access:** JWT required
- **Inputs:** Query `isRead`: `bool?`<br>Query `type`: `NotificationType?`<br>Handler signature: `[FromQuery] bool? isRead, [FromQuery] NotificationType? type`
- **Declared response:** Task<ActionResult<List<NotificationDto>>>

#### `POST /api/Notifications` - `SendNotification`

- **Access:** JWT required
- **Inputs:** Handler signature: `SendNotificationCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `PUT /api/Notifications/{id}/read` - `MarkAsRead`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `POST /api/Notifications/bulk` - `SendBulkNotification`

- **Access:** JWT required
- **Inputs:** Handler signature: `SendBulkNotificationCommand command`
- **Declared response:** Task<ActionResult<int>>

#### `PUT /api/Notifications/read-all` - `MarkAllAsRead`

- **Access:** JWT required
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<int>>

#### `GET /api/Notifications/unread-count` - `GetUnreadCount`

- **Access:** JWT required
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<int>>

### Payments

#### `GET /api/Payments` - `GetPayments`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Query `clientId`: `Guid?`<br>Query `branchId`: `Guid?`<br>Query `invoiceId`: `Guid?`<br>Query `subscriptionId`: `Guid?`<br>Query `method`: `PaymentMethod?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] Guid? branchId, [FromQuery] Guid? invoiceId, [FromQuery] Guid? subscriptionId, [FromQuery] PaymentMethod? method, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<PaymentDto>>>

#### `POST /api/Payments` - `Record`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `RecordPaymentCommand command`
- **Declared response:** Task<ActionResult<Guid>>

### Payroll

#### `GET /api/Payroll` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Query `year`: `int?`<br>Query `month`: `int?`<br>Query `branchId`: `Guid?`<br>Query `status`: `PayrollStatus?`<br>Handler signature: `[FromQuery] int? year, [FromQuery] int? month, [FromQuery] Guid? branchId, [FromQuery] PayrollStatus? status`
- **Declared response:** Task<ActionResult<List<PayrollRunDto>>>

#### `POST /api/Payroll/{id}/approve` - `Approve`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `POST /api/Payroll/{id}/pay` - `Pay`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `POST /api/Payroll/generate` - `Generate`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Handler signature: `GeneratePayrollCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `PUT /api/Payroll/items/{id}` - `UpdateItem`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Handler signature: `Guid id, UpdatePayrollItemCommand command`
- **Declared response:** Task<ActionResult>

### ProductCategories

#### `GET /api/ProductCategories` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<ProductCategoryDto>>>

#### `POST /api/ProductCategories` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Handler signature: `CreateProductCategoryCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/ProductCategories/{id}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `PUT /api/ProductCategories/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Handler signature: `Guid id, UpdateProductCategoryCommand command`
- **Declared response:** Task<ActionResult>

### Products

#### `GET /api/Products` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Query `categoryId`: `Guid?`<br>Query `isActive`: `bool?`<br>Query `searchTerm`: `string?`<br>Query `lowStockOnly`: `bool?`<br>Query `branchId`: `Guid?`<br>Handler signature: `[FromQuery] Guid? categoryId, [FromQuery] bool? isActive, [FromQuery] string? searchTerm, [FromQuery] bool? lowStockOnly, [FromQuery] Guid? branchId`
- **Declared response:** Task<ActionResult<List<ProductDto>>>

#### `POST /api/Products` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Handler signature: `CreateProductCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/Products/{id}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `PUT /api/Products/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Handler signature: `Guid id, UpdateProductCommand command`
- **Declared response:** Task<ActionResult>

### Profile

#### `GET /api/Profile` - `GetMyProfile`

- **Access:** JWT required
- **Inputs:** No request input.
- **Declared response:** typeof(UserDto), StatusCodes.Status200OK<br>StatusCodes.Status401Unauthorized<br>StatusCodes.Status404NotFound

#### `PUT /api/Profile` - `UpdateMyProfile`

- **Access:** JWT required
- **Inputs:** Handler signature: `UpdateMyProfileCommand command`
- **Declared response:** StatusCodes.Status204NoContent<br>StatusCodes.Status401Unauthorized<br>StatusCodes.Status404NotFound

#### `DELETE /api/Profile/picture` - `DeleteProfilePicture`

- **Access:** JWT required
- **Inputs:** No request input.
- **Declared response:** StatusCodes.Status204NoContent<br>StatusCodes.Status401Unauthorized<br>StatusCodes.Status404NotFound

#### `POST /api/Profile/picture` - `UploadProfilePicture`

- **Access:** JWT required
- **Inputs:** Handler signature: `IFormFile file`
- **Declared response:** typeof(UploadProfilePictureResponse), StatusCodes.Status200OK<br>StatusCodes.Status400BadRequest<br>StatusCodes.Status401Unauthorized

### Reports

#### `GET /api/Reports/branch-comparison` - `GetBranchComparisonReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** typeof(BranchComparisonReportDto), StatusCodes.Status200OK

#### `GET /api/Reports/class-attendance` - `GetClassAttendanceReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `branchId`: `Guid?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] Guid? branchId`
- **Declared response:** typeof(ClassAttendanceReportDto), StatusCodes.Status200OK

#### `GET /api/Reports/clients` - `GetClientsReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** typeof(ClientsReportDto), StatusCodes.Status200OK

#### `GET /api/Reports/coach/dashboard` - `GetCoachDashboardReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** Query `coachId`: `Guid?`<br>Handler signature: `[FromQuery] Guid? coachId`
- **Declared response:** typeof(CoachDashboardReportDto), StatusCodes.Status200OK

#### `GET /api/Reports/coach/trainee/{clientId}` - `GetTraineeProgressReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** Handler signature: `Guid clientId`
- **Declared response:** typeof(TraineeProgressReportDto), StatusCodes.Status200OK

#### `GET /api/Reports/coach/trainees` - `GetCoachTraineesReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** Query `coachId`: `Guid?`<br>Handler signature: `[FromQuery] Guid? coachId`
- **Declared response:** typeof(CoachTraineesReportDto), StatusCodes.Status200OK

#### `GET /api/Reports/commissions` - `GetCommissionReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `employeeId`: `Guid?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] Guid? employeeId`
- **Declared response:** typeof(CommissionReportDto), StatusCodes.Status200OK

#### `GET /api/Reports/dashboard` - `GetDashboardReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** No request input.
- **Declared response:** typeof(DashboardReportDto), StatusCodes.Status200OK

#### `GET /api/Reports/equipment-utilization` - `GetEquipmentUtilizationReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** Query `branchId`: `Guid?`<br>Handler signature: `[FromQuery] Guid? branchId`
- **Declared response:** typeof(EquipmentUtilizationReportDto), StatusCodes.Status200OK

#### `GET /api/Reports/expenses` - `GetExpensesReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `branchId`: `Guid?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] Guid? branchId`
- **Declared response:** typeof(ExpensesReportDto), StatusCodes.Status200OK

#### `GET /api/Reports/financial` - `GetFinancialReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** typeof(FinancialReportDto), StatusCodes.Status200OK

#### `GET /api/Reports/operations-dashboard` - `GetOperationsDashboard`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** No request input.
- **Declared response:** typeof(OperationsDashboardDto), StatusCodes.Status200OK

#### `GET /api/Reports/payroll-summary` - `GetPayrollSummaryReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** Query `year`: `int?`<br>Query `month`: `int?`<br>Handler signature: `[FromQuery] int? year, [FromQuery] int? month`
- **Declared response:** typeof(PayrollSummaryReportDto), StatusCodes.Status200OK

#### `GET /api/Reports/pos-sales` - `GetPosSalesReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `branchId`: `Guid?`<br>Query `topProductsCount`: `int`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] Guid? branchId, [FromQuery] int topProductsCount = 10`
- **Declared response:** typeof(PosSalesReportDto), StatusCodes.Status200OK

#### `GET /api/Reports/stock-valuation` - `GetStockValuationReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** Query `branchId`: `Guid?`<br>Handler signature: `[FromQuery] Guid? branchId`
- **Declared response:** typeof(StockValuationReportDto), StatusCodes.Status200OK

#### `GET /api/Reports/subscriptions` - `GetSubscriptionsReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** typeof(SubscriptionsReportDto), StatusCodes.Status200OK

### Rooms

#### `GET /api/Rooms` - `GetRooms`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Query `branchId`: `Guid?`<br>Query `type`: `RoomType?`<br>Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] RoomType? type, [FromQuery] bool? isActive`
- **Declared response:** typeof(List<RoomDto>), StatusCodes.Status200OK

#### `POST /api/Rooms` - `CreateRoom`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Handler signature: `CreateRoomCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/Rooms/{id}` - `DeleteRoom`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `PUT /api/Rooms/{id}` - `UpdateRoom`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Inputs:** Handler signature: `Guid id, UpdateRoomCommand command`
- **Declared response:** Task<ActionResult>

### Sales

#### `GET /api/Sales` - `GetSales`

- **Access:** JWT + Policy: `Permissions.ManagePOS`
- **Inputs:** Query `branchId`: `Guid?`<br>Query `clientId`: `Guid?`<br>Query `cashierId`: `Guid?`<br>Query `paymentMethod`: `PaymentMethod?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] Guid? clientId, [FromQuery] Guid? cashierId, [FromQuery] PaymentMethod? paymentMethod, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<SaleDto>>>

#### `POST /api/Sales/checkout` - `Checkout`

- **Access:** JWT + Policy: `Permissions.ManagePOS`
- **Inputs:** Handler signature: `CheckoutSaleCommand command`
- **Declared response:** typeof(Guid), StatusCodes.Status200OK

### Shifts

#### `GET /api/Shifts` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Query `branchId`: `Guid?`<br>Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<ShiftDto>>>

#### `POST /api/Shifts` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Handler signature: `CreateShiftCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `POST /api/Shifts/assign` - `Assign`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Handler signature: `AssignShiftCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `GET /api/Shifts/assignments` - `GetAssignments`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Inputs:** Query `employeeId`: `Guid?`<br>Query `shiftId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? employeeId, [FromQuery] Guid? shiftId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<ShiftAssignmentDto>>>

### StaffAttendance

#### `GET /api/staff-attendance` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `branchId`: `Guid?`<br>Query `userId`: `Guid?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] Guid? branchId, [FromQuery] Guid? userId`
- **Declared response:** Task<ActionResult<List<StaffAttendanceDto>>>

#### `POST /api/staff-attendance/{id}/check-out` - `CheckOut`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<IActionResult>

#### `POST /api/staff-attendance/toggle-qr` - `ToggleByQr`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Inputs:** Body `request`: `ToggleStaffQrRequest`<br>Handler signature: `[FromBody] ToggleStaffQrRequest request`
- **Declared response:** Task<ActionResult<StaffAttendanceDto>>

### Stock

#### `GET /api/Stock` - `GetStock`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Query `branchId`: `Guid?`<br>Query `productId`: `Guid?`<br>Query `lowStockOnly`: `bool?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] Guid? productId, [FromQuery] bool? lowStockOnly`
- **Declared response:** Task<ActionResult<List<StockItemDto>>>

#### `POST /api/Stock/adjust` - `Adjust`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Handler signature: `AdjustStockCommand command`
- **Declared response:** Task<ActionResult>

#### `GET /api/Stock/movements` - `GetMovements`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Query `productId`: `Guid?`<br>Query `branchId`: `Guid?`<br>Query `type`: `StockMovementType?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? productId, [FromQuery] Guid? branchId, [FromQuery] StockMovementType? type, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<StockMovementDto>>>

#### `POST /api/Stock/transfer` - `Transfer`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Handler signature: `TransferStockCommand command`
- **Declared response:** Task<ActionResult>

### Subscriptions

#### `GET /api/Subscriptions` - `GetClientSubscriptions`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Inputs:** Query `clientId`: `Guid?`<br>Query `status`: `SubscriptionStatus?`<br>Query `planId`: `Guid?`<br>Query `expiringWithinDays`: `int?`<br>Query `searchTerm`: `string?`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] SubscriptionStatus? status, [FromQuery] Guid? planId, [FromQuery] int? expiringWithinDays, [FromQuery] string? searchTerm`
- **Declared response:** Task<ActionResult<List<ClientSubscriptionDto>>>

#### `POST /api/Subscriptions` - `CreateClientSubscription`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Inputs:** Handler signature: `CreateClientSubscriptionCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `GET /api/Subscriptions/{id}` - `GetSubscription`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<ClientSubscriptionDetailDto>>

#### `PUT /api/Subscriptions/{id}` - `UpdateClientSubscription`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Inputs:** Handler signature: `Guid id, UpdateClientSubscriptionCommand command`
- **Declared response:** Task<ActionResult>

#### `POST /api/Subscriptions/{subscriptionId}/cancel` - `CancelSubscription`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Inputs:** Handler signature: `Guid subscriptionId, CancelSubscriptionCommand command`
- **Declared response:** Task<ActionResult>

#### `POST /api/Subscriptions/{subscriptionId}/freeze` - `CreateSubscriptionFreeze`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Inputs:** Handler signature: `Guid subscriptionId, CreateSubscriptionFreezeCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `POST /api/Subscriptions/{subscriptionId}/payment` - `AddSubscriptionPayment`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Inputs:** Handler signature: `Guid subscriptionId, AddSubscriptionPaymentCommand command`
- **Declared response:** Task<ActionResult>

#### `POST /api/Subscriptions/{subscriptionId}/renew` - `RenewSubscription`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Inputs:** Handler signature: `Guid subscriptionId, RenewSubscriptionCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `GET /api/Subscriptions/expiring` - `GetExpiringSubscriptions`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Inputs:** Query `days`: `int`<br>Handler signature: `[FromQuery] int days = 7`
- **Declared response:** Task<ActionResult<List<ClientSubscriptionDto>>>

#### `POST /api/Subscriptions/freezes/{freezeId}/end` - `EndFreezeEarly`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Inputs:** Handler signature: `Guid freezeId`
- **Declared response:** Task<ActionResult>

#### `GET /api/Subscriptions/plans` - `GetSubscriptionPlans`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Inputs:** Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<SubscriptionPlanDto>>>

#### `POST /api/Subscriptions/plans` - `CreateSubscriptionPlan`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Inputs:** Handler signature: `CreateSubscriptionPlanCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/Subscriptions/plans/{id}` - `DeleteSubscriptionPlan`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `GET /api/Subscriptions/plans/{id}` - `GetSubscriptionPlan`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<SubscriptionPlanDto>>

#### `PUT /api/Subscriptions/plans/{id}` - `UpdateSubscriptionPlan`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Inputs:** Handler signature: `Guid id, UpdateSubscriptionPlanCommand command`
- **Declared response:** Task<ActionResult>

### Suppliers

#### `GET /api/Suppliers` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Query `isActive`: `bool?`<br>Query `searchTerm`: `string?`<br>Handler signature: `[FromQuery] bool? isActive, [FromQuery] string? searchTerm`
- **Declared response:** Task<ActionResult<List<SupplierDto>>>

#### `POST /api/Suppliers` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Handler signature: `CreateSupplierCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/Suppliers/{id}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `PUT /api/Suppliers/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Inputs:** Handler signature: `Guid id, UpdateSupplierCommand command`
- **Declared response:** Task<ActionResult>

### TaxSettings

#### `GET /api/TaxSettings` - `GetSettings`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<TaxSettingDto>>>

#### `POST /api/TaxSettings` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** Handler signature: `CreateTaxSettingCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/TaxSettings/{id}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `PUT /api/TaxSettings/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** Handler signature: `Guid id, UpdateTaxSettingCommand command`
- **Declared response:** Task<ActionResult>

### TenantBackups

#### `GET /api/tenant/backups/exports` - `List`

- **Access:** JWT + Policy: `Permissions.CreateAndDownloadTenantBackup`
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<IReadOnlyList<TenantBackupExportDto>>>

#### `POST /api/tenant/backups/exports` - `Create`

- **Access:** JWT + Policy: `Permissions.CreateAndDownloadTenantBackup`
- **Inputs:** Body `request`: `TenantBackupExportRequest`<br>Handler signature: `[FromBody] TenantBackupExportRequest request`
- **Declared response:** Task<ActionResult<TenantBackupExportDto>>

#### `GET /api/tenant/backups/exports/{exportId:guid}` - `Get`

- **Access:** JWT + Policy: `Permissions.CreateAndDownloadTenantBackup`
- **Inputs:** Handler signature: `Guid exportId`
- **Declared response:** Task<ActionResult<TenantBackupExportDto>>

#### `GET /api/tenant/backups/exports/{exportId:guid}/download` - `Download`

- **Access:** JWT + Policy: `Permissions.CreateAndDownloadTenantBackup`
- **Inputs:** Query `token`: `string`<br>Handler signature: `Guid exportId, [FromQuery] string token`
- **Declared response:** Task<IActionResult>

#### `POST /api/tenant/backups/exports/{exportId:guid}/download-grant` - `CreateDownloadGrant`

- **Access:** JWT + Policy: `Permissions.CreateAndDownloadTenantBackup`
- **Inputs:** Body `request`: `SensitiveGrantRequest`<br>Handler signature: `Guid exportId, [FromBody] SensitiveGrantRequest request`
- **Declared response:** Task<ActionResult<TenantBackupDownloadGrantDto>>

#### `POST /api/tenant/backups/reauthenticate` - `Reauthenticate`

- **Access:** JWT + Policy: `Permissions.CreateAndDownloadTenantBackup`
- **Inputs:** Body `request`: `PasswordReauthenticationRequest`<br>Handler signature: `[FromBody] PasswordReauthenticationRequest request`
- **Declared response:** Task<ActionResult<SensitiveActionGrantDto>>

#### `POST /api/tenant/backups/reauthenticate-download` - `ReauthenticateForDownload`

- **Access:** JWT + Policy: `Permissions.CreateAndDownloadTenantBackup`
- **Inputs:** Body `request`: `PasswordReauthenticationRequest`<br>Handler signature: `[FromBody] PasswordReauthenticationRequest request`
- **Declared response:** Task<ActionResult<SensitiveActionGrantDto>>

### TenantBilling

#### `GET /api/tenant/payment-methods` - `GetPaymentMethods`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Inputs:** No request input.
- **Declared response:** typeof(List<PaymentMethodDto>), StatusCodes.Status200OK

#### `GET /api/tenant/payment-requests` - `GetMyPaymentRequests`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Inputs:** No request input.
- **Declared response:** typeof(List<PaymentRequestDto>), StatusCodes.Status200OK

#### `POST /api/tenant/payment-requests` - `SubmitPaymentRequest`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Inputs:** Form `planId`: `Guid`<br>Form `paymentMethodId`: `Guid?`<br>Form `transactionNumber`: `string?`<br>Form `paymentDate`: `DateTime?`<br>Form `notes`: `string?`<br>Form `operation`: `PaymentRequestOperation`<br>Handler signature: `[FromForm] Guid planId, [FromForm] Guid? paymentMethodId, [FromForm] string? transactionNumber, [FromForm] DateTime? paymentDate, [FromForm] string? notes, IFormFile? proof, [FromForm] PaymentRequestOperation operation = PaymentRequestOperation.NewSubscription`
- **Declared response:** typeof(PaymentRequestDto), StatusCodes.Status200OK

### Tenants

#### `GET /api/Tenants` - `GetTenants`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** No request input.
- **Declared response:** typeof(List<TenantDto>), StatusCodes.Status200OK

#### `POST /api/Tenants` - `CreateTenant`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Inputs:** Handler signature: `CreateTenantCommand command`
- **Declared response:** typeof(TenantDto), StatusCodes.Status201Created<br>typeof(ProblemDetails), StatusCodes.Status400BadRequest

### TenantSubscription

#### `GET /api/tenant/invoices` - `GetInvoices`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Inputs:** No request input.
- **Declared response:** typeof(List<SubscriptionInvoiceDto>), StatusCodes.Status200OK

#### `GET /api/tenant/my-subscription` - `GetMySubscription`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Inputs:** No request input.
- **Declared response:** typeof(MySubscriptionDto), StatusCodes.Status200OK

#### `GET /api/tenant/plans` - `GetAvailablePlans`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Inputs:** No request input.
- **Declared response:** typeof(List<PlanDto>), StatusCodes.Status200OK

#### `POST /api/tenant/subscription/renew` - `Renew`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Inputs:** No request input.
- **Declared response:** typeof(TenantSubscriptionSummaryDto), StatusCodes.Status200OK

#### `POST /api/tenant/subscription/select-plan` - `SelectPlan`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Inputs:** Body `command`: `ChooseSubscriptionPlanCommand` { `PlanId`: Guid }<br>Handler signature: `[FromBody] ChooseSubscriptionPlanCommand command`
- **Declared response:** typeof(TenantSubscriptionSummaryDto), StatusCodes.Status200OK

#### `POST /api/tenant/subscription/upgrade` - `Upgrade`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Inputs:** Body `command`: `ChooseSubscriptionPlanCommand` { `PlanId`: Guid }<br>Handler signature: `[FromBody] ChooseSubscriptionPlanCommand command`
- **Declared response:** typeof(TenantSubscriptionSummaryDto), StatusCodes.Status200OK

#### `GET /api/tenant/usage` - `GetUsage`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Inputs:** No request input.
- **Declared response:** typeof(MySubscriptionDto), StatusCodes.Status200OK

### Transactions

#### `GET /api/Transactions` - `GetTransactions`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Query `userId`: `Guid?`<br>Query `type`: `TransactionType?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? userId, [FromQuery] TransactionType? type, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** typeof(List<TransactionDto>), StatusCodes.Status200OK

#### `POST /api/Transactions` - `CreateTransaction`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Body `command`: `CreateTransactionCommand` { `UserId`: Guid; `Type`: TransactionType; `Amount`: decimal; `Description`: string?; `ReferenceType`: string?; `ReferenceId`: Guid? }<br>Handler signature: `[FromBody] CreateTransactionCommand command`
- **Declared response:** typeof(Guid), StatusCodes.Status201Created<br>StatusCodes.Status400BadRequest

#### `DELETE /api/Transactions/{id}` - `DeleteTransaction`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** StatusCodes.Status204NoContent<br>StatusCodes.Status404NotFound

#### `GET /api/Transactions/{id}` - `GetTransaction`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(TransactionDto), StatusCodes.Status200OK<br>StatusCodes.Status404NotFound

#### `GET /api/Transactions/summary` - `GetTransactionSummary`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Inputs:** Query `userId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? userId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** typeof(TransactionSummaryDto), StatusCodes.Status200OK

### Users

#### `GET /api/Users` - `GetUsers`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** Query `role`: `UserRole?`<br>Query `isActive`: `bool?`<br>Query `searchTerm`: `string?`<br>Handler signature: `[FromQuery] UserRole? role, [FromQuery] bool? isActive, [FromQuery] string? searchTerm`
- **Declared response:** Task<ActionResult<List<UserDto>>>

#### `GET /api/Users/{id}` - `GetUser`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<UserDto>>

#### `PUT /api/Users/{id}` - `UpdateUser`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** Handler signature: `Guid id, UpdateUserCommand command`
- **Declared response:** Task<ActionResult>

#### `PUT /api/Users/{id}/profile` - `UpdateUserProfile`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** Handler signature: `Guid id, UpdateUserProfileCommand command`
- **Declared response:** Task<ActionResult>

#### `POST /api/Users/staff` - `CreateStaff`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Inputs:** Body `command`: `CreateStaffUserCommand` { `PhoneNumber`: string; `Email`: string?; `Password`: string?; `FullName`: string; `Role`: UserRole }<br>Handler signature: `[FromBody] CreateStaffUserCommand command`
- **Declared response:** typeof(Guid), StatusCodes.Status201Created

### WorkoutPrograms

#### `GET /api/WorkoutPrograms` - `GetWorkoutPrograms`

- **Access:** JWT required
- **Inputs:** Query `coachId`: `Guid?`<br>Query `clientId`: `Guid?`<br>Handler signature: `[FromQuery] Guid? coachId, [FromQuery] Guid? clientId`
- **Declared response:** Task<ActionResult<List<WorkoutProgramDto>>>

#### `POST /api/WorkoutPrograms` - `CreateWorkoutProgram`

- **Access:** JWT required
- **Inputs:** Handler signature: `CreateWorkoutProgramCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/WorkoutPrograms/{id}` - `DeleteWorkoutProgram`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>

#### `GET /api/WorkoutPrograms/{id}` - `GetWorkoutProgram`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<WorkoutProgramDto>>

#### `PUT /api/WorkoutPrograms/{id}` - `UpdateWorkoutProgram`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id, UpdateWorkoutProgramCommand command`
- **Declared response:** Task<ActionResult>

#### `POST /api/WorkoutPrograms/{id}/duplicate` - `DuplicateWorkoutProgram`

- **Access:** JWT required
- **Inputs:** Body `command`: `DuplicateWorkoutProgramCommand?` { `Id`: Guid; `NewClientId`: Guid?; `NewName`: string? }<br>Handler signature: `Guid id, [FromBody] DuplicateWorkoutProgramCommand? command`
- **Declared response:** Task<ActionResult<Guid>>

#### `POST /api/WorkoutPrograms/{programId}/routines` - `CreateProgramRoutine`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid programId, CreateProgramRoutineCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/WorkoutPrograms/routines/{routineId}` - `DeleteProgramRoutine`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid routineId`
- **Declared response:** Task<ActionResult>

#### `PUT /api/WorkoutPrograms/routines/{routineId}` - `UpdateProgramRoutine`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid routineId, UpdateProgramRoutineCommand command`
- **Declared response:** Task<ActionResult>

#### `POST /api/WorkoutPrograms/routines/{routineId}/exercises` - `CreateRoutineExercise`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid routineId, CreateRoutineExerciseCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `DELETE /api/WorkoutPrograms/routines/exercises/{exerciseId}` - `DeleteRoutineExercise`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid exerciseId`
- **Declared response:** Task<ActionResult>

#### `PUT /api/WorkoutPrograms/routines/exercises/{exerciseId}` - `UpdateRoutineExercise`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid exerciseId, UpdateRoutineExerciseCommand command`
- **Declared response:** Task<ActionResult>

### WorkoutSessions

#### `GET /api/WorkoutSessions` - `GetWorkoutSessions`

- **Access:** JWT required
- **Inputs:** Query `clientId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<WorkoutSessionDto>>>

#### `GET /api/WorkoutSessions/{id}` - `GetWorkoutSession`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<WorkoutSessionDto>>

#### `POST /api/WorkoutSessions/{sessionId}/end` - `EndWorkoutSession`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid sessionId, EndWorkoutSessionCommand command`
- **Declared response:** Task<ActionResult>

#### `POST /api/WorkoutSessions/{sessionId}/sets` - `CreateSessionSet`

- **Access:** JWT required
- **Inputs:** Handler signature: `Guid sessionId, CreateSessionSetCommand command`
- **Declared response:** Task<ActionResult<Guid>>

#### `POST /api/WorkoutSessions/start` - `StartWorkoutSession`

- **Access:** JWT required
- **Inputs:** Handler signature: `StartWorkoutSessionCommand command`
- **Declared response:** Task<ActionResult<Guid>>

### WorkspaceApplications

#### `POST /api/workspace-applications/freelance` - `SubmitFreelance`

- **Access:** Server default (not declared explicitly)
- **Inputs:** Body `command`: `SubmitFreelanceWorkspaceApplicationCommand` { `Email`: string; `PhoneNumber`: string?; `Password`: string; `WorkspaceName`: string; `WorkspaceIdentifier`: string; `OwnerFullName`: string; `BrandName`: string?; `LogoUrl`: string?; `PhotoUrl`: string?; `CoverImageUrl`: string?; `BackgroundImageUrl`: string?; `PrimaryColor`: string?; `SecondaryColor`: string?; `Bio`: string?; `Specialties`: IReadOnlyList<string>?; `Certifications`: IReadOnlyList<string>?; `WelcomeMessage`: string?; `BookingSettings`: System.Text.Json.JsonElement?; `PlanId`: Guid; `BillingCycle`: BillingCycle; `PaymentAmount`: decimal; `PaymentTransactionNumber`: string?; `PaymentDate`: DateTime?; `ProofStorageKey`: string }<br>Handler signature: `[FromBody] SubmitFreelanceWorkspaceApplicationCommand command`
- **Declared response:** typeof(ApplicationTrackingSessionDto), StatusCodes.Status201Created

#### `GET /api/workspace-applications/tracking` - `GetTrackingStatus`

- **Access:** Server default (not declared explicitly)
- **Inputs:** No request input.
- **Declared response:** typeof(ApplicationTrackingStatusDto), StatusCodes.Status200OK

#### `PATCH /api/workspace-applications/tracking/fields` - `UpdateRequestedFields`

- **Access:** Server default (not declared explicitly)
- **Inputs:** Body `System`: `IReadOnlyDictionary<string,`<br>Handler signature: `[FromBody] IReadOnlyDictionary<string, System.Text.Json.JsonElement> fields`
- **Declared response:** typeof(ApplicationTrackingStatusDto), StatusCodes.Status200OK

#### `POST /api/workspace-applications/tracking/resubmit` - `Resubmit`

- **Access:** Server default (not declared explicitly)
- **Inputs:** No request input.
- **Declared response:** typeof(ApplicationTrackingStatusDto), StatusCodes.Status200OK

### WorkspaceClientJoinCodes

#### `POST /api/workspace/client-join-codes` - `Generate`

- **Access:** JWT + Policy: `Permissions.ManageMembers`
- **Inputs:** Body `command`: `GenerateWorkspaceClientJoinCodeCommand` { `AutoApproveClients`: bool; `ValidForDays`: int }<br>Handler signature: `[FromBody] GenerateWorkspaceClientJoinCodeCommand command`
- **Declared response:** typeof(WorkspaceClientJoinCodeDto), StatusCodes.Status201Created

#### `POST /api/workspace/client-join-codes/join` - `Join`

- **Access:** Anonymous (no token required)
- **Inputs:** Body `command`: `JoinWorkspaceAsClientCommand` { `Code`: string; `WorkspaceSelectionToken`: string }<br>Handler signature: `[FromBody] JoinWorkspaceAsClientCommand command`
- **Declared response:** typeof(ClientJoinResultDto), StatusCodes.Status200OK

#### `POST /api/workspace/client-join-codes/memberships/{membershipId:guid}/approve` - `Approve`

- **Access:** JWT + Policy: `Permissions.ManageMembers`
- **Inputs:** Handler signature: `Guid membershipId`
- **Declared response:** StatusCodes.Status204NoContent

#### `POST /api/workspace/client-join-codes/preview` - `Preview`

- **Access:** Anonymous (no token required)
- **Inputs:** Body `command`: `PreviewWorkspaceClientJoinCommand` { `Code`: string }<br>Handler signature: `[FromBody] PreviewWorkspaceClientJoinCommand command`
- **Declared response:** typeof(WorkspaceClientJoinPreviewDto), StatusCodes.Status200OK

### WorkspaceInvites

#### `POST /api/workspace-invites/accept` - `Accept`

- **Access:** Anonymous (no token required)
- **Inputs:** Body `command`: `AcceptWorkspaceInviteCommand` { `Token`: string; `WorkspaceSelectionToken`: string }<br>Handler signature: `[FromBody] AcceptWorkspaceInviteCommand command`
- **Declared response:** StatusCodes.Status204NoContent

#### `POST /api/workspace-invites/preview` - `Preview`

- **Access:** Anonymous (no token required)
- **Inputs:** Body `command`: `PreviewWorkspaceInviteCommand` { `Token`: string }<br>Handler signature: `[FromBody] PreviewWorkspaceInviteCommand command`
- **Declared response:** typeof(WorkspaceInvitePreviewDto), StatusCodes.Status200OK
