# Complete API Endpoint Catalog

> **Source of truth:** this document is generated from the API controllers by `Scripts/Export-ApiEndpointCatalog.ps1`. Do not edit endpoint rows manually; change the controller, rerun the script, and include the refreshed catalog in the same Pull Request.

Generated: `2026-08-12 11:24 UTC`  |  Total endpoints: **404**

## Contract rules

- **Tenant API** routes normally start with `/api/...`; tenant identity is derived from the JWT and tenant middleware. A frontend-supplied `TenantId` is never a security boundary.
- **Platform API** routes start with `/api/platform/...` and require a Platform JWT and permission unless the entry explicitly says anonymous.
- Common outcomes: `400` validation, `401` missing/expired token, `403` insufficient permission, `404` resource missing, `409` conflict/duplicate, `429` rate limited, and `500` unexpected server error.
- Paginated Platform collections normally return `{ items, totalCount, page, pageSize, totalPages, hasPreviousPage, hasNextPage }`. Pages are one-based and page size is capped at 100.

## Platform API

### PlatformAdministrators

#### `GET /api/platform/administrators` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Governance, permissions, audit history, and alerts.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/administrators` - `Create`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Governance, permissions, audit history, and alerts.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `request`: `CreateAdministratorRequest` { `Email`: string; `Password`: string; `FullName`: string }<br>Handler signature: `[FromBody] CreateAdministratorRequest request`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `PATCH /api/platform/administrators/{id:guid}/status` - `SetStatus`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Governance, permissions, audit history, and alerts.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `isActive`: `bool`<br>Handler signature: `Guid id, [FromBody] bool isActive`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

### PlatformAlerts

#### `GET /api/platform/alerts` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Governance, permissions, audit history, and alerts.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### PlatformAudit

#### `GET /api/platform/audit-logs` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Governance, permissions, audit history, and alerts.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `entityName`: `string?`<br>Query `action`: `string?`<br>Query `fromUtc`: `DateTime?`<br>Query `toUtc`: `DateTime?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] string? entityName = null, [FromQuery] string? action = null, [FromQuery] DateTime? fromUtc = null, [FromQuery] DateTime? toUtc = null, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<ActionResult<object>>
- **Response schema:** `Task<ActionResult<object>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### PlatformAuth

#### `POST /api/platform/auth/login` - `Login`

- **Access:** Anonymous (no token required)
- **Business purpose:** Identity, login, and session issuance/rotation.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `PlatformPasswordLoginCommand` { `Email`: string; `Password`: string }<br>Handler signature: `[FromBody] PlatformPasswordLoginCommand command`
- **Declared response:** typeof(AuthResponseDto), StatusCodes.Status200OK<br>StatusCodes.Status401Unauthorized
- **Response schema:** `AuthResponseDto` with fields: { `UserId`: Guid; `Email`: string?; `PhoneNumber`: string?; `FullName`: string?; `Role`: string; `Roles`: IReadOnlyList<string>; `Permissions`: IReadOnlyList<string>; `TenantId`: Guid; `AccessToken`: string; `ExpiresAt`: DateTime; `MustChangePassword`: bool }<br>No response body declared.
- **Failure contract:** 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/platform/auth/logout-all` - `LogoutAll`

- **Access:** JWT required
- **Business purpose:** Identity, login, and session issuance/rotation.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** No request input.
- **Declared response:** StatusCodes.Status204NoContent
- **Response schema:** No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/platform/auth/refresh` - `Refresh`

- **Access:** Anonymous (no token required)
- **Business purpose:** Identity, login, and session issuance/rotation.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** No request input.
- **Declared response:** typeof(AuthResponseDto), StatusCodes.Status200OK<br>StatusCodes.Status401Unauthorized
- **Response schema:** `AuthResponseDto` with fields: { `UserId`: Guid; `Email`: string?; `PhoneNumber`: string?; `FullName`: string?; `Role`: string; `Roles`: IReadOnlyList<string>; `Permissions`: IReadOnlyList<string>; `TenantId`: Guid; `AccessToken`: string; `ExpiresAt`: DateTime; `MustChangePassword`: bool }<br>No response body declared.
- **Failure contract:** 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### PlatformBackups

#### `GET /api/platform/backups` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** ActionResult<PlatformPage<BackupRecord>>
- **Response schema:** `ActionResult<PlatformPage<BackupRecord>>` with fields: { `FileName`: string; `SizeBytes`: long; `CreatedAt`: DateTimeOffset; `Status`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/backups` - `Create`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<BackupRecord>>
- **Response schema:** `Task<ActionResult<BackupRecord>>` with fields: { `FileName`: string; `SizeBytes`: long; `CreatedAt`: DateTimeOffset; `Status`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `GET /api/platform/backups/{fileName}/download` - `Download`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `string fileName`
- **Declared response:** IActionResult
- **Response schema:** `IActionResult`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/backups/batch` - `CreateBatch`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `request`: `BackupBatchRequest` { `Scope`: BackupScope; `TenantIds`: IReadOnlyCollection<Guid>?; `IdempotencyKey`: string?; `IncludePlatform`: bool }<br>Handler signature: `[FromBody] BackupBatchRequest request`
- **Declared response:** Task<ActionResult<BackupBatchDto>>
- **Response schema:** `Task<ActionResult<BackupBatchDto>>` with fields: { `Id`: Guid; `Scope`: BackupScope; `Status`: string; `StartedAtUtc`: DateTimeOffset?; `CompletedAtUtc`: DateTimeOffset?; `ManifestStorageKey`: string?; `Artifacts`: IReadOnlyList<BackupArtifactDto> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `GET /api/platform/backups/batches` - `Batches`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `take`: `int`<br>Handler signature: `[FromQuery] int take = 50`
- **Declared response:** ActionResult<IReadOnlyList<BackupBatchDto>>
- **Response schema:** `ActionResult<IReadOnlyList<BackupBatchDto>>` with fields: { `Id`: Guid; `Scope`: BackupScope; `Status`: string; `StartedAtUtc`: DateTimeOffset?; `CompletedAtUtc`: DateTimeOffset?; `ManifestStorageKey`: string?; `Artifacts`: IReadOnlyList<BackupArtifactDto> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/backups/batches/{batchId:guid}/retry` - `Retry`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid batchId`
- **Declared response:** Task<ActionResult<BackupBatchDto>>
- **Response schema:** `Task<ActionResult<BackupBatchDto>>` with fields: { `Id`: Guid; `Scope`: BackupScope; `Status`: string; `StartedAtUtc`: DateTimeOffset?; `CompletedAtUtc`: DateTimeOffset?; `ManifestStorageKey`: string?; `Artifacts`: IReadOnlyList<BackupArtifactDto> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `GET /api/platform/backups/status` - `Status`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** ActionResult<BackupStatus>
- **Response schema:** `ActionResult<BackupStatus>` with fields: { `IsEnabled`: bool; `IsReady`: bool; `Format`: string; `RetentionDays`: int; `RunAtUtc`: string; `BackupCount`: int; `UnavailableReason`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### PlatformDashboard

#### `GET /api/platform/dashboard` - `Get`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `query`: `GetPlatformDashboardQuery`<br>Handler signature: `[FromQuery] GetPlatformDashboardQuery query`
- **Declared response:** typeof(PlatformDashboardDto), StatusCodes.Status200OK
- **Response schema:** `PlatformDashboardDto` with fields: { `FromUtc`: DateTime?; `ToUtc`: DateTime?; `TenantId`: Guid?; `PlanId`: Guid?; `SubscriptionStatus`: TenantSubscriptionStatus?; `TotalGyms`: int; `ActiveGyms`: int; `TrialGyms`: int; `PendingApprovalGyms`: int; `SuspendedGyms`: int; `TotalMembers`: int; `ExpiredSubscriptions`: int; `ActiveSubscriptions`: int; `PendingPayments`: int; `InvoiceCount`: int; `InvoicedAmount`: decimal; `CollectedAmount`: decimal; `FeatureCount`: int; `QuotaDefinitionCount`: int; `FailedJobs`: int; `FailedOutbox`: int; `Operations`: PlatformOperationsSummaryDto; `Applications`: ApplicationReviewSummaryDto; `Payments`: PaymentReviewSummaryDto }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/platform/dashboard/tenants` - `Tenants`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `search`: `string?`<br>Query `status`: `TenantStatus?`<br>Query `planId`: `Guid?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] string? search = null, [FromQuery] TenantStatus? status = null, [FromQuery] Guid? planId = null, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### PlatformDatabaseResources

#### `GET /api/platform/database-resources` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Database resource allocation, connectivity, migrations, and mapping.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `status`: `DatabaseResourceStatus?`<br>Query `tenantId`: `Guid?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] DatabaseResourceStatus? status = null, [FromQuery] Guid? tenantId = null, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<ActionResult<PlatformPage<PlatformDatabaseResourceDto>>>
- **Response schema:** `Task<ActionResult<PlatformPage<PlatformDatabaseResourceDto>>>` with fields: { `Id`: Guid; `ResourceCode`: string; `Provider`: string; `Status`: DatabaseResourceStatus; `LifecycleStatus`: string; `TenantId`: Guid?; `TenantName`: string?; `WorkspaceType`: string?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `SubscriptionEndDate`: DateTime?; `ProvisioningStatus`: ProvisioningJobStatus?; `ProvisioningError`: string?; `ReservedAtUtc`: DateTime?; `AssignedAtUtc`: DateTime?; `LastHealthCheckAtUtc`: DateTime?; `SizeBytes`: long?; `SchemaVersion`: string?; `LastError`: string?; `BackupCount`: int; `LastBackupStatus`: string?; `LastBackupCompletedAtUtc`: DateTime?; `HasProtectedConnection`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/database-resources` - `Create`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Database resource allocation, connectivity, migrations, and mapping.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `request`: `CreateDatabaseResourceRequest` { `Id`: Guid; `ResourceCode`: string; `Provider`: string; `Status`: DatabaseResourceStatus; `LifecycleStatus`: string; `TenantId`: Guid?; `TenantName`: string?; `WorkspaceType`: string?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `SubscriptionEndDate`: DateTime?; `ProvisioningStatus`: ProvisioningJobStatus?; `ProvisioningError`: string?; `ReservedAtUtc`: DateTime?; `AssignedAtUtc`: DateTime?; `LastHealthCheckAtUtc`: DateTime?; `SizeBytes`: long?; `SchemaVersion`: string?; `LastError`: string?; `BackupCount`: int; `LastBackupStatus`: string?; `LastBackupCompletedAtUtc`: DateTime?; `HasProtectedConnection`: bool }<br>Handler signature: `[FromBody] CreateDatabaseResourceRequest request`
- **Declared response:** Task<ActionResult<PlatformDatabaseResourceDto>>
- **Response schema:** `Task<ActionResult<PlatformDatabaseResourceDto>>` with fields: { `Id`: Guid; `ResourceCode`: string; `Provider`: string; `Status`: DatabaseResourceStatus; `LifecycleStatus`: string; `TenantId`: Guid?; `TenantName`: string?; `WorkspaceType`: string?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `SubscriptionEndDate`: DateTime?; `ProvisioningStatus`: ProvisioningJobStatus?; `ProvisioningError`: string?; `ReservedAtUtc`: DateTime?; `AssignedAtUtc`: DateTime?; `LastHealthCheckAtUtc`: DateTime?; `SizeBytes`: long?; `SchemaVersion`: string?; `LastError`: string?; `BackupCount`: int; `LastBackupStatus`: string?; `LastBackupCompletedAtUtc`: DateTime?; `HasProtectedConnection`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/platform/database-resources/{id:guid}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Database resource allocation, connectivity, migrations, and mapping.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `GET /api/platform/database-resources/{id:guid}` - `Get`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Database resource allocation, connectivity, migrations, and mapping.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<PlatformDatabaseResourceDto>>
- **Response schema:** `Task<ActionResult<PlatformDatabaseResourceDto>>` with fields: { `Id`: Guid; `ResourceCode`: string; `Provider`: string; `Status`: DatabaseResourceStatus; `LifecycleStatus`: string; `TenantId`: Guid?; `TenantName`: string?; `WorkspaceType`: string?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `SubscriptionEndDate`: DateTime?; `ProvisioningStatus`: ProvisioningJobStatus?; `ProvisioningError`: string?; `ReservedAtUtc`: DateTime?; `AssignedAtUtc`: DateTime?; `LastHealthCheckAtUtc`: DateTime?; `SizeBytes`: long?; `SchemaVersion`: string?; `LastError`: string?; `BackupCount`: int; `LastBackupStatus`: string?; `LastBackupCompletedAtUtc`: DateTime?; `HasProtectedConnection`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/platform/database-resources/{id:guid}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Database resource allocation, connectivity, migrations, and mapping.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Body `request`: `UpdateDatabaseResourceRequest` { `Id`: Guid; `ResourceCode`: string; `Provider`: string; `Status`: DatabaseResourceStatus; `LifecycleStatus`: string; `TenantId`: Guid?; `TenantName`: string?; `WorkspaceType`: string?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `SubscriptionEndDate`: DateTime?; `ProvisioningStatus`: ProvisioningJobStatus?; `ProvisioningError`: string?; `ReservedAtUtc`: DateTime?; `AssignedAtUtc`: DateTime?; `LastHealthCheckAtUtc`: DateTime?; `SizeBytes`: long?; `SchemaVersion`: string?; `LastError`: string?; `BackupCount`: int; `LastBackupStatus`: string?; `LastBackupCompletedAtUtc`: DateTime?; `HasProtectedConnection`: bool }<br>Handler signature: `Guid id, [FromBody] UpdateDatabaseResourceRequest request`
- **Declared response:** Task<ActionResult<PlatformDatabaseResourceDto>>
- **Response schema:** `Task<ActionResult<PlatformDatabaseResourceDto>>` with fields: { `Id`: Guid; `ResourceCode`: string; `Provider`: string; `Status`: DatabaseResourceStatus; `LifecycleStatus`: string; `TenantId`: Guid?; `TenantName`: string?; `WorkspaceType`: string?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `SubscriptionEndDate`: DateTime?; `ProvisioningStatus`: ProvisioningJobStatus?; `ProvisioningError`: string?; `ReservedAtUtc`: DateTime?; `AssignedAtUtc`: DateTime?; `LastHealthCheckAtUtc`: DateTime?; `SizeBytes`: long?; `SchemaVersion`: string?; `LastError`: string?; `BackupCount`: int; `LastBackupStatus`: string?; `LastBackupCompletedAtUtc`: DateTime?; `HasProtectedConnection`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/platform/database-resources/{id:guid}/backup` - `Backup`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Database resource allocation, connectivity, migrations, and mapping.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<BackupBatchDto>>
- **Response schema:** `Task<ActionResult<BackupBatchDto>>` with fields: { `Id`: Guid; `Scope`: BackupScope; `Status`: string; `StartedAtUtc`: DateTimeOffset?; `CompletedAtUtc`: DateTimeOffset?; `ManifestStorageKey`: string?; `Artifacts`: IReadOnlyList<BackupArtifactDto> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/platform/database-resources/{id:guid}/migrations` - `RunMigrations`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Database resource allocation, connectivity, migrations, and mapping.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<DatabaseResourceOperationDto>>
- **Response schema:** `Task<ActionResult<DatabaseResourceOperationDto>>` with fields: { `Id`: Guid; `ResourceCode`: string; `Provider`: string; `Status`: DatabaseResourceStatus; `LifecycleStatus`: string; `TenantId`: Guid?; `TenantName`: string?; `WorkspaceType`: string?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `SubscriptionEndDate`: DateTime?; `ProvisioningStatus`: ProvisioningJobStatus?; `ProvisioningError`: string?; `ReservedAtUtc`: DateTime?; `AssignedAtUtc`: DateTime?; `LastHealthCheckAtUtc`: DateTime?; `SizeBytes`: long?; `SchemaVersion`: string?; `LastError`: string?; `BackupCount`: int; `LastBackupStatus`: string?; `LastBackupCompletedAtUtc`: DateTime?; `HasProtectedConnection`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/platform/database-resources/{id:guid}/repair-connection` - `RepairConnection`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Database resource allocation, connectivity, migrations, and mapping.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `request`: `RepairDatabaseResourceConnectionRequest` { `Id`: Guid; `ResourceCode`: string; `Provider`: string; `Status`: DatabaseResourceStatus; `LifecycleStatus`: string; `TenantId`: Guid?; `TenantName`: string?; `WorkspaceType`: string?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `SubscriptionEndDate`: DateTime?; `ProvisioningStatus`: ProvisioningJobStatus?; `ProvisioningError`: string?; `ReservedAtUtc`: DateTime?; `AssignedAtUtc`: DateTime?; `LastHealthCheckAtUtc`: DateTime?; `SizeBytes`: long?; `SchemaVersion`: string?; `LastError`: string?; `BackupCount`: int; `LastBackupStatus`: string?; `LastBackupCompletedAtUtc`: DateTime?; `HasProtectedConnection`: bool }<br>Handler signature: `Guid id, [FromBody] RepairDatabaseResourceConnectionRequest request`
- **Declared response:** Task<ActionResult<DatabaseResourceOperationDto>>
- **Response schema:** `Task<ActionResult<DatabaseResourceOperationDto>>` with fields: { `Id`: Guid; `ResourceCode`: string; `Provider`: string; `Status`: DatabaseResourceStatus; `LifecycleStatus`: string; `TenantId`: Guid?; `TenantName`: string?; `WorkspaceType`: string?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `SubscriptionEndDate`: DateTime?; `ProvisioningStatus`: ProvisioningJobStatus?; `ProvisioningError`: string?; `ReservedAtUtc`: DateTime?; `AssignedAtUtc`: DateTime?; `LastHealthCheckAtUtc`: DateTime?; `SizeBytes`: long?; `SchemaVersion`: string?; `LastError`: string?; `BackupCount`: int; `LastBackupStatus`: string?; `LastBackupCompletedAtUtc`: DateTime?; `HasProtectedConnection`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/platform/database-resources/{id:guid}/status` - `SetStatus`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Database resource allocation, connectivity, migrations, and mapping.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `request`: `SetDatabaseResourceStatusRequest` { `Id`: Guid; `ResourceCode`: string; `Provider`: string; `Status`: DatabaseResourceStatus; `LifecycleStatus`: string; `TenantId`: Guid?; `TenantName`: string?; `WorkspaceType`: string?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `SubscriptionEndDate`: DateTime?; `ProvisioningStatus`: ProvisioningJobStatus?; `ProvisioningError`: string?; `ReservedAtUtc`: DateTime?; `AssignedAtUtc`: DateTime?; `LastHealthCheckAtUtc`: DateTime?; `SizeBytes`: long?; `SchemaVersion`: string?; `LastError`: string?; `BackupCount`: int; `LastBackupStatus`: string?; `LastBackupCompletedAtUtc`: DateTime?; `HasProtectedConnection`: bool }<br>Handler signature: `Guid id, [FromBody] SetDatabaseResourceStatusRequest request`
- **Declared response:** Task<ActionResult<PlatformDatabaseResourceDto>>
- **Response schema:** `Task<ActionResult<PlatformDatabaseResourceDto>>` with fields: { `Id`: Guid; `ResourceCode`: string; `Provider`: string; `Status`: DatabaseResourceStatus; `LifecycleStatus`: string; `TenantId`: Guid?; `TenantName`: string?; `WorkspaceType`: string?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `SubscriptionEndDate`: DateTime?; `ProvisioningStatus`: ProvisioningJobStatus?; `ProvisioningError`: string?; `ReservedAtUtc`: DateTime?; `AssignedAtUtc`: DateTime?; `LastHealthCheckAtUtc`: DateTime?; `SizeBytes`: long?; `SchemaVersion`: string?; `LastError`: string?; `BackupCount`: int; `LastBackupStatus`: string?; `LastBackupCompletedAtUtc`: DateTime?; `HasProtectedConnection`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/platform/database-resources/test-connection` - `TestConnection`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Database resource allocation, connectivity, migrations, and mapping.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `request`: `DatabaseConnectionTestRequest` { `Id`: Guid; `ResourceCode`: string; `Provider`: string; `Status`: DatabaseResourceStatus; `LifecycleStatus`: string; `TenantId`: Guid?; `TenantName`: string?; `WorkspaceType`: string?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `SubscriptionEndDate`: DateTime?; `ProvisioningStatus`: ProvisioningJobStatus?; `ProvisioningError`: string?; `ReservedAtUtc`: DateTime?; `AssignedAtUtc`: DateTime?; `LastHealthCheckAtUtc`: DateTime?; `SizeBytes`: long?; `SchemaVersion`: string?; `LastError`: string?; `BackupCount`: int; `LastBackupStatus`: string?; `LastBackupCompletedAtUtc`: DateTime?; `HasProtectedConnection`: bool }<br>Handler signature: `[FromBody] DatabaseConnectionTestRequest request`
- **Declared response:** Task<ActionResult<DatabaseConnectionTestDto>>
- **Response schema:** `Task<ActionResult<DatabaseConnectionTestDto>>` with fields: { `Id`: Guid; `ResourceCode`: string; `Provider`: string; `Status`: DatabaseResourceStatus; `LifecycleStatus`: string; `TenantId`: Guid?; `TenantName`: string?; `WorkspaceType`: string?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `SubscriptionEndDate`: DateTime?; `ProvisioningStatus`: ProvisioningJobStatus?; `ProvisioningError`: string?; `ReservedAtUtc`: DateTime?; `AssignedAtUtc`: DateTime?; `LastHealthCheckAtUtc`: DateTime?; `SizeBytes`: long?; `SchemaVersion`: string?; `LastError`: string?; `BackupCount`: int; `LastBackupStatus`: string?; `LastBackupCompletedAtUtc`: DateTime?; `HasProtectedConnection`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### PlatformDiagnostics

#### `GET /api/platform/diagnostics/version` - `Version`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** LogicFit API module `PlatformDiagnostics`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** ActionResult<PlatformVersionDiagnosticsDto>
- **Response schema:** `ActionResult<PlatformVersionDiagnosticsDto>` with fields: { `ApiContractVersion`: string; `BuildSha`: string; `AssemblyVersion`: string; `Environment`: string; `Runtime`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### PlatformFeatures

#### `GET /api/platform/features` - `GetFeatures`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Business purpose:** SaaS product configuration: plans, features, quotas, and dependencies.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** StatusCodes.Status200OK
- **Response schema:** No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/features` - `Create`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Business purpose:** SaaS product configuration: plans, features, quotas, and dependencies.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `UpsertFeatureCommand` { `Id`: Guid?; `Code`: string; `NameAr`: string?; `NameEn`: string?; `Name`: string; `Description`: string?; `Module`: string?; `IsFree`: bool; `IsActive`: bool; `SupportsQuota`: bool; `Status`: FeatureLifecycleStatus }<br>Handler signature: `[FromBody] UpsertFeatureCommand command`
- **Declared response:** Task<ActionResult<FeatureDto>>
- **Response schema:** `Task<ActionResult<FeatureDto>>` with fields: { `Id`: Guid; `Code`: string; `Name`: string; `NameAr`: string?; `NameEn`: string?; `Description`: string?; `Module`: string?; `IsFree`: bool; `IsActive`: bool; `SupportsQuota`: bool; `Status`: LogicFit.Domain.Enums.FeatureLifecycleStatus }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `PUT /api/platform/features/{id:guid}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Business purpose:** SaaS product configuration: plans, features, quotas, and dependencies.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Body `command`: `UpsertFeatureCommand` { `Id`: Guid?; `Code`: string; `NameAr`: string?; `NameEn`: string?; `Name`: string; `Description`: string?; `Module`: string?; `IsFree`: bool; `IsActive`: bool; `SupportsQuota`: bool; `Status`: FeatureLifecycleStatus }<br>Handler signature: `Guid id, [FromBody] UpsertFeatureCommand command`
- **Declared response:** Task<ActionResult<FeatureDto>>
- **Response schema:** `Task<ActionResult<FeatureDto>>` with fields: { `Id`: Guid; `Code`: string; `Name`: string; `NameAr`: string?; `NameEn`: string?; `Description`: string?; `Module`: string?; `IsFree`: bool; `IsActive`: bool; `SupportsQuota`: bool; `Status`: LogicFit.Domain.Enums.FeatureLifecycleStatus }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `GET /api/platform/features/dependencies` - `GetDependencies`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Business purpose:** SaaS product configuration: plans, features, quotas, and dependencies.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/features/dependencies` - `SetDependency`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Business purpose:** SaaS product configuration: plans, features, quotas, and dependencies.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `command`: `SetFeatureDependencyCommand` { `FeatureId`: Guid; `DependsOnFeatureId`: Guid }<br>Handler signature: `[FromBody] SetFeatureDependencyCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `DELETE /api/platform/features/dependencies/{id:guid}` - `DeleteDependency`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Business purpose:** SaaS product configuration: plans, features, quotas, and dependencies.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `GET /api/platform/features/quota-definitions` - `GetQuotaDefinitions`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Business purpose:** SaaS product configuration: plans, features, quotas, and dependencies.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/features/quota-definitions` - `CreateQuotaDefinition`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Business purpose:** SaaS product configuration: plans, features, quotas, and dependencies.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `UpsertQuotaDefinitionCommand` { `Id`: Guid?; `FeatureId`: Guid; `ResourceKey`: string; `Unit`: string; `DefaultLimit`: int?; `IsActive`: bool }<br>Handler signature: `[FromBody] UpsertQuotaDefinitionCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `PUT /api/platform/features/quota-definitions/{id:guid}` - `UpdateQuotaDefinition`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Business purpose:** SaaS product configuration: plans, features, quotas, and dependencies.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Body `command`: `UpsertQuotaDefinitionCommand` { `Id`: Guid?; `FeatureId`: Guid; `ResourceKey`: string; `Unit`: string; `DefaultLimit`: int?; `IsActive`: bool }<br>Handler signature: `Guid id, [FromBody] UpsertQuotaDefinitionCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `GET /api/platform/features/tenant-overrides` - `GetTenantOverrides`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Business purpose:** SaaS product configuration: plans, features, quotas, and dependencies.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `tenantId`: `Guid?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] Guid? tenantId, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/features/tenant-overrides` - `SetTenantOverride`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Business purpose:** SaaS product configuration: plans, features, quotas, and dependencies.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `SetTenantOverrideCommand` { `TenantId`: Guid; `FeatureId`: Guid; `IsEnabled`: bool; `LimitOverride`: int?; `Reason`: string; `StartsAt`: DateTime; `EndsAt`: DateTime? }<br>Handler signature: `[FromBody] SetTenantOverrideCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### PlatformInvoices

#### `GET /api/platform/invoices` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `number`: `string?`<br>Query `tenantId`: `Guid?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] string? number = null, [FromQuery] Guid? tenantId = null, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### PlatformNotifications

#### `GET /api/platform/notifications` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Governance, permissions, audit history, and alerts.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `search`: `string?`<br>Query `type`: `NotificationType?`<br>Query `isRead`: `bool?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] string? search = null, [FromQuery] NotificationType? type = null, [FromQuery] bool? isRead = null, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<ActionResult<object>>
- **Response schema:** `Task<ActionResult<object>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/notifications/{id:guid}/read` - `MarkRead`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Governance, permissions, audit history, and alerts.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/platform/notifications/read-all` - `MarkAllRead`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Governance, permissions, audit history, and alerts.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** No request input.
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### PlatformOperations

#### `GET /api/platform/operations/jobs` - `GetJobs`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Background jobs, Outbox messages, and operational monitoring.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/platform/operations/outbox` - `GetOutbox`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Background jobs, Outbox messages, and operational monitoring.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/platform/operations/provisioning` - `GetProvisioning`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Background jobs, Outbox messages, and operational monitoring.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `status`: `ProvisioningJobStatus?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] ProvisioningJobStatus? status = null, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### PlatformPaymentMethods

#### `GET /api/platform/payment-methods` - `Get`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `activeOnly`: `bool`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] bool activeOnly = false, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** StatusCodes.Status200OK
- **Response schema:** No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/payment-methods` - `Create`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `SavePaymentMethodCommand` { `Id`: Guid?; `Name`: string; `Type`: string?; `AccountName`: string?; `AccountNumber`: string?; `IBAN`: string?; `WalletNumber`: string?; `Instructions`: string?; `QRImageUrl`: string?; `IsActive`: bool; `DisplayOrder`: int }<br>Handler signature: `[FromBody] SavePaymentMethodCommand command`
- **Declared response:** typeof(PaymentMethodDto), StatusCodes.Status201Created
- **Response schema:** `PaymentMethodDto` with fields: { `Id`: Guid; `Name`: string; `Type`: string?; `AccountName`: string?; `AccountNumber`: string?; `IBAN`: string?; `WalletNumber`: string?; `Instructions`: string?; `QRImageUrl`: string?; `IsActive`: bool; `DisplayOrder`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/platform/payment-methods/{id:guid}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** StatusCodes.Status204NoContent
- **Response schema:** No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/platform/payment-methods/{id:guid}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Body `command`: `SavePaymentMethodCommand` { `Id`: Guid?; `Name`: string; `Type`: string?; `AccountName`: string?; `AccountNumber`: string?; `IBAN`: string?; `WalletNumber`: string?; `Instructions`: string?; `QRImageUrl`: string?; `IsActive`: bool; `DisplayOrder`: int }<br>Handler signature: `Guid id, [FromBody] SavePaymentMethodCommand command`
- **Declared response:** typeof(PaymentMethodDto), StatusCodes.Status200OK
- **Response schema:** `PaymentMethodDto` with fields: { `Id`: Guid; `Name`: string; `Type`: string?; `AccountName`: string?; `AccountNumber`: string?; `IBAN`: string?; `WalletNumber`: string?; `Instructions`: string?; `QRImageUrl`: string?; `IsActive`: bool; `DisplayOrder`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### PlatformPaymentRequests

#### `GET /api/platform/payment-requests` - `Get`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `status`: `PaymentRequestStatus?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] PaymentRequestStatus? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20`
- **Declared response:** StatusCodes.Status200OK
- **Response schema:** No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/payment-requests/{id:guid}/approve` - `Approve`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PaymentRequestDto), StatusCodes.Status200OK
- **Response schema:** `PaymentRequestDto` with fields: { `Id`: Guid; `TenantId`: Guid; `TenantName`: string?; `PlanId`: Guid; `PlanName`: string?; `TenantSubscriptionId`: Guid?; `ApplicationRequestId`: Guid?; `IdentityAccountId`: Guid?; `BillingCycle`: BillingCycle; `PlanSnapshotJson`: string?; `ProofVersion`: int; `Operation`: PaymentRequestOperation; `Amount`: decimal; `Currency`: string; `PaymentMethodId`: Guid?; `TransactionNumber`: string?; `PaymentDate`: DateTime?; `ProofFileUrl`: string?; `Notes`: string?; `Status`: PaymentRequestStatus; `ReviewedBy`: string?; `ReviewedAt`: DateTime?; `RejectReason`: string?; `CreatedAt`: DateTime }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `GET /api/platform/payment-requests/{id:guid}/proof` - `Proof`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/payment-requests/{id:guid}/reject` - `Reject`

- **Access:** JWT + Policy: `Permissions.ManagePaymentRequests`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `command`: `RejectPaymentRequestCommand` { `PaymentRequestId`: Guid; `RejectReason`: string }<br>Handler signature: `Guid id, [FromBody] RejectPaymentRequestCommand command`
- **Declared response:** typeof(PaymentRequestDto), StatusCodes.Status200OK
- **Response schema:** `PaymentRequestDto` with fields: { `Id`: Guid; `TenantId`: Guid; `TenantName`: string?; `PlanId`: Guid; `PlanName`: string?; `TenantSubscriptionId`: Guid?; `ApplicationRequestId`: Guid?; `IdentityAccountId`: Guid?; `BillingCycle`: BillingCycle; `PlanSnapshotJson`: string?; `ProofVersion`: int; `Operation`: PaymentRequestOperation; `Amount`: decimal; `Currency`: string; `PaymentMethodId`: Guid?; `TransactionNumber`: string?; `PaymentDate`: DateTime?; `ProofFileUrl`: string?; `Notes`: string?; `Status`: PaymentRequestStatus; `ReviewedBy`: string?; `ReviewedAt`: DateTime?; `RejectReason`: string?; `CreatedAt`: DateTime }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

### PlatformPlans

#### `GET /api/platform/plans` - `GetPlans`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Business purpose:** SaaS product configuration: plans, features, quotas, and dependencies.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `activeOnly`: `bool`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] bool activeOnly = false, [FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** StatusCodes.Status200OK
- **Response schema:** No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/plans` - `CreatePlan`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Business purpose:** SaaS product configuration: plans, features, quotas, and dependencies.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `CreatePlanCommand` { `Name`: string; `Description`: string?; `Price`: decimal; `Currency`: string; `BillingCycle`: BillingCycle; `DurationInDays`: int; `MaxMembers`: int?; `MaxCoaches`: int?; `MaxBranches`: int?; `MaxEmployees`: int?; `MaxStorageMB`: int?; `IsActive`: bool; `DisplayOrder`: int; `FeatureCodes`: List<string> }<br>Handler signature: `[FromBody] CreatePlanCommand command`
- **Declared response:** typeof(PlanDto), StatusCodes.Status201Created
- **Response schema:** `PlanDto` with fields: { `Id`: Guid; `Name`: string; `Description`: string?; `Price`: decimal; `Currency`: string; `BillingCycle`: BillingCycle; `DurationInDays`: int; `MaxMembers`: int?; `MaxCoaches`: int?; `MaxBranches`: int?; `MaxEmployees`: int?; `MaxStorageMB`: int?; `IsActive`: bool; `DisplayOrder`: int; `Features`: List<string> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/platform/plans/{id:guid}` - `DeletePlan`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Business purpose:** SaaS product configuration: plans, features, quotas, and dependencies.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** StatusCodes.Status204NoContent
- **Response schema:** No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/platform/plans/{id:guid}` - `UpdatePlan`

- **Access:** JWT + Policy: `Permissions.ManagePlans`
- **Business purpose:** SaaS product configuration: plans, features, quotas, and dependencies.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Body `command`: `UpdatePlanCommand` { `Id`: Guid; `Name`: string; `Description`: string?; `Price`: decimal; `Currency`: string; `BillingCycle`: BillingCycle; `DurationInDays`: int; `MaxMembers`: int?; `MaxCoaches`: int?; `MaxBranches`: int?; `MaxEmployees`: int?; `MaxStorageMB`: int?; `IsActive`: bool; `DisplayOrder`: int; `FeatureCodes`: List<string> }<br>Handler signature: `Guid id, [FromBody] UpdatePlanCommand command`
- **Declared response:** typeof(PlanDto), StatusCodes.Status200OK
- **Response schema:** `PlanDto` with fields: { `Id`: Guid; `Name`: string; `Description`: string?; `Price`: decimal; `Currency`: string; `BillingCycle`: BillingCycle; `DurationInDays`: int; `MaxMembers`: int?; `MaxCoaches`: int?; `MaxBranches`: int?; `MaxEmployees`: int?; `MaxStorageMB`: int?; `IsActive`: bool; `DisplayOrder`: int; `Features`: List<string> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### PlatformReports

#### `GET /api/platform/reports/catalog` - `Catalog`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/platform/reports/overview` - `Overview`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### PlatformRestores

#### `GET /api/platform/restores` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<IReadOnlyList<RestoreJobDto>>>
- **Response schema:** `Task<ActionResult<IReadOnlyList<RestoreJobDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Status`: RestoreJobStatus; `Provider`: string; `CreatedAtUtc`: DateTime; `StartedAtUtc`: DateTime?; `CompletedAtUtc`: DateTime?; `ErrorCode`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/restores` - `Restore`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `request`: `PlatformRestoreRequest` { `TenantId`: Guid; `SourceDatabaseBackupId`: Guid; `TargetDatabaseResourceId`: Guid?; `WorkspaceNameConfirmation`: string; `Reason`: string; `GrantToken`: string }<br>Handler signature: `[FromBody] PlatformRestoreRequest request`
- **Declared response:** Task<ActionResult<RestoreJobDto>>
- **Response schema:** `Task<ActionResult<RestoreJobDto>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Status`: RestoreJobStatus; `Provider`: string; `CreatedAtUtc`: DateTime; `StartedAtUtc`: DateTime?; `CompletedAtUtc`: DateTime?; `ErrorCode`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `GET /api/platform/restores/capabilities` - `Capabilities`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** ActionResult<DatabaseRestoreCapabilities>
- **Response schema:** `ActionResult<DatabaseRestoreCapabilities>` with fields: { `Enabled`: bool; `Mode`: string; `SupportsBacpacImport`: bool; `SupportsMappingSwitch`: bool; `UnavailableReason`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/restores/reauthenticate` - `Reauthenticate`

- **Access:** JWT + Policy: `Permissions.ManagePlatformBackups`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `request`: `PlatformPasswordReauthenticationRequest` { `CurrentPassword`: string }<br>Handler signature: `[FromBody] PlatformPasswordReauthenticationRequest request`
- **Declared response:** Task<ActionResult<SensitiveActionGrantDto>>
- **Response schema:** `Task<ActionResult<SensitiveActionGrantDto>>` with fields: { `GrantToken`: string; `ExpiresAtUtc`: DateTime; `Scope`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

### PlatformRoles

#### `GET /api/platform/roles` - `List`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Governance, permissions, audit history, and alerts.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] int page = 1, [FromQuery] int pageSize = PlatformPaging.DefaultPageSize`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/platform/roles/{id:guid}/permissions` - `Update`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Governance, permissions, audit history, and alerts.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Body `request`: `UpdateRolePermissionsRequest` { `PermissionCodes`: IReadOnlyList<string> }<br>Handler signature: `Guid id, [FromBody] UpdateRolePermissionsRequest request`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `GET /api/platform/roles/permissions` - `GetPermissionCatalog`

- **Access:** JWT + Policy: `Permissions.ManagePlatformReports`
- **Business purpose:** Governance, permissions, audit history, and alerts.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### PlatformSubscriptions

#### `GET /api/platform/subscriptions` - `GetSubscriptions`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `status`: `TenantSubscriptionStatus?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] TenantSubscriptionStatus? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20`
- **Declared response:** StatusCodes.Status200OK
- **Response schema:** No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/subscriptions/{id:guid}/extend` - `Extend`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `command`: `ExtendSubscriptionCommand` { `SubscriptionId`: Guid; `Days`: int }<br>Handler signature: `Guid id, [FromBody] ExtendSubscriptionCommand command`
- **Declared response:** Task<ActionResult<DateTime>>
- **Response schema:** `Task<ActionResult<DateTime>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/platform/subscriptions/{id:guid}/transition` - `Transition`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `command`: `TransitionSubscriptionCommand` { `SubscriptionId`: Guid; `TargetStatus`: TenantSubscriptionStatus }<br>Handler signature: `Guid id, [FromBody] TransitionSubscriptionCommand command`
- **Declared response:** Task<ActionResult<TenantSubscriptionStatus>>
- **Response schema:** `Task<ActionResult<TenantSubscriptionStatus>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `GET /api/platform/subscriptions/{id:guid}/upgrade-preview/{targetPlanId:guid}` - `UpgradePreview`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id, Guid targetPlanId`
- **Declared response:** Task<ActionResult<UpgradePreviewDto>>
- **Response schema:** `Task<ActionResult<UpgradePreviewDto>>` with fields: { `SubscriptionId`: Guid; `TargetPlanId`: Guid }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/platform/subscriptions/usage` - `GetUsage`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<TenantUsageDto>>>
- **Response schema:** `Task<ActionResult<List<TenantUsageDto>>>` with fields: { `TenantId`: Guid; `MembersCount`: int; `CoachesCount`: int; `EmployeesCount`: int; `BranchesCount`: int; `StorageUsedMB`: int; `LastCalculatedAt`: DateTime }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### PlatformTenants

#### `GET /api/platform/tenants` - `GetTenants`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `status`: `TenantStatus?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] TenantStatus? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20`
- **Declared response:** StatusCodes.Status200OK
- **Response schema:** No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/tenants` - `CreateTenant`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `CreateTenantWithOwnerCommand` { `Name`: string; `Subdomain`: string?; `Email`: string?; `PhoneNumber`: string?; `OwnerEmail`: string; `OwnerPhoneNumber`: string?; `OwnerPassword`: string; `OwnerFullName`: string }<br>Handler signature: `[FromHeader(Name = "Idempotency-Key")] string? idempotencyKey, [FromBody] CreateTenantWithOwnerCommand command`
- **Declared response:** typeof(PlatformTenantDto), StatusCodes.Status201Created<br>StatusCodes.Status400BadRequest<br>StatusCodes.Status409Conflict<br>StatusCodes.Status503ServiceUnavailable
- **Response schema:** `PlatformTenantDto` with fields: { `Id`: Guid; `Name`: string; `Subdomain`: string?; `Status`: TenantStatus; `Email`: string?; `PhoneNumber`: string?; `MembersCount`: int; `CreatedAt`: DateTime; `IsDeleted`: bool; `DeletedAt`: DateTime? }<br>No response body declared.<br>No response body declared.<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/platform/tenants/{id:guid}/activate` - `Activate`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantDto), StatusCodes.Status200OK
- **Response schema:** `PlatformTenantDto` with fields: { `Id`: Guid; `Name`: string; `Subdomain`: string?; `Status`: TenantStatus; `Email`: string?; `PhoneNumber`: string?; `MembersCount`: int; `CreatedAt`: DateTime; `IsDeleted`: bool; `DeletedAt`: DateTime? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/platform/tenants/{id:guid}/approve` - `Approve`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantDto), StatusCodes.Status200OK
- **Response schema:** `PlatformTenantDto` with fields: { `Id`: Guid; `Name`: string; `Subdomain`: string?; `Status`: TenantStatus; `Email`: string?; `PhoneNumber`: string?; `MembersCount`: int; `CreatedAt`: DateTime; `IsDeleted`: bool; `DeletedAt`: DateTime? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/platform/tenants/{id:guid}/archive` - `Archive`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantDto), StatusCodes.Status200OK
- **Response schema:** `PlatformTenantDto` with fields: { `Id`: Guid; `Name`: string; `Subdomain`: string?; `Status`: TenantStatus; `Email`: string?; `PhoneNumber`: string?; `MembersCount`: int; `CreatedAt`: DateTime; `IsDeleted`: bool; `DeletedAt`: DateTime? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `GET /api/platform/tenants/{id:guid}/credentials` - `Credentials`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantCredentialsDto), StatusCodes.Status200OK
- **Response schema:** `PlatformTenantCredentialsDto` with fields: { `TenantId`: Guid; `TenantName`: string; `OwnerEmail`: string?; `IdentityLinked`: bool; `IdentityActive`: bool; `EmailVerifiedAtUtc`: DateTime?; `OwnerAccountActive`: bool; `MembershipStatus`: WorkspaceMembershipStatus?; `LastLoginAtUtc`: DateTime?; `LockoutEndUtc`: DateTime?; `PasswordResetAvailable`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/tenants/{id:guid}/credentials/reset` - `ResetCredentials`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantPasswordResetDto), StatusCodes.Status202Accepted
- **Response schema:** `PlatformTenantPasswordResetDto` with fields: { `TenantId`: Guid; `OwnerEmail`: string?; `ResetEmailAccepted`: bool; `ExpiresInMinutes`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/platform/tenants/{id:guid}/permanent-delete` - `PermanentDelete`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `request`: `PlatformTenantDeleteRequest` { `TenantNameConfirmation`: string; `PreserveGlobalIdentity`: bool }<br>Handler signature: `Guid id, [FromBody] PlatformTenantDeleteRequest request`
- **Declared response:** typeof(PlatformTenantPermanentDeleteDto), StatusCodes.Status200OK
- **Response schema:** `PlatformTenantPermanentDeleteDto` with fields: { `TenantId`: Guid; `TenantName`: string; `Status`: string; `BackupBatchId`: Guid; `BackupArtifactId`: Guid; `DatabaseResourceId`: Guid; `GlobalIdentityPreserved`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/platform/tenants/{id:guid}/restore` - `Restore`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantDto), StatusCodes.Status200OK
- **Response schema:** `PlatformTenantDto` with fields: { `Id`: Guid; `Name`: string; `Subdomain`: string?; `Status`: TenantStatus; `Email`: string?; `PhoneNumber`: string?; `MembersCount`: int; `CreatedAt`: DateTime; `IsDeleted`: bool; `DeletedAt`: DateTime? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/platform/tenants/{id:guid}/soft-delete` - `SoftDelete`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantDto), StatusCodes.Status200OK
- **Response schema:** `PlatformTenantDto` with fields: { `Id`: Guid; `Name`: string; `Subdomain`: string?; `Status`: TenantStatus; `Email`: string?; `PhoneNumber`: string?; `MembersCount`: int; `CreatedAt`: DateTime; `IsDeleted`: bool; `DeletedAt`: DateTime? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/platform/tenants/{id:guid}/suspend` - `Suspend`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(PlatformTenantDto), StatusCodes.Status200OK
- **Response schema:** `PlatformTenantDto` with fields: { `Id`: Guid; `Name`: string; `Subdomain`: string?; `Status`: TenantStatus; `Email`: string?; `PhoneNumber`: string?; `MembersCount`: int; `CreatedAt`: DateTime; `IsDeleted`: bool; `DeletedAt`: DateTime? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

### PlatformWorkspaceApplications

#### `GET /api/platform/workspace-applications` - `List`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `applicationType`: `ApplicationType?`<br>Query `status`: `ApplicationRequestStatus?`<br>Query `paymentStatus`: `PaymentRequestStatus?`<br>Query `workspaceStatus`: `TenantStatus?`<br>Query `subscriptionStatus`: `TenantSubscriptionStatus?`<br>Query `provisioningStatus`: `ProvisioningJobStatus?`<br>Query `page`: `int`<br>Query `pageSize`: `int`<br>Handler signature: `[FromQuery] ApplicationType? applicationType, [FromQuery] ApplicationRequestStatus? status, [FromQuery] PaymentRequestStatus? paymentStatus, [FromQuery] TenantStatus? workspaceStatus, [FromQuery] TenantSubscriptionStatus? subscriptionStatus, [FromQuery] ProvisioningJobStatus? provisioningStatus, [FromQuery] int page = 1, [FromQuery] int pageSize = 20`
- **Declared response:** typeof(PagedResult<PlatformApplicationDto>), StatusCodes.Status200OK
- **Response schema:** `PagedResult<PlatformApplicationDto>` with fields: { `Id`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `ApplicationStatus`: ApplicationRequestStatus; `ApplicantEmail`: string; `ApplicantPhoneNumber`: string?; `WorkspaceIdentifier`: string?; `RequestedRole`: UserRole?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string>; `DecisionReason`: string?; `SubmittedAt`: DateTime?; `ReviewedAt`: DateTime?; `ReviewedBy`: string?; `ProvisionedWorkspaceId`: Guid?; `WorkspaceType`: WorkspaceType?; `PaymentRequestId`: Guid?; `PaymentStatus`: PaymentRequestStatus?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `DatabaseStatus`: DatabaseResourceStatus?; `DatabaseStatusCode`: string?; `ProvisioningStatus`: ProvisioningJobStatus?; `UserJourneyStage`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/platform/workspace-applications` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `CreatePlatformWorkspaceApplicationCommand` { `WorkspaceType`: WorkspaceType; `WorkspaceName`: string; `WorkspaceIdentifier`: string; `OwnerFullName`: string; `OwnerEmail`: string; `OwnerPhoneNumber`: string?; `PlanId`: Guid; `BillingCycle`: BillingCycle; `BrandName`: string?; `Description`: string?; `Address`: string?; `Specialization`: string?; `DeliveryMode`: string? }<br>Handler signature: `[FromBody] CreatePlatformWorkspaceApplicationCommand command`
- **Declared response:** typeof(PlatformWorkspaceApplicationCreatedDto), StatusCodes.Status201Created
- **Response schema:** `PlatformWorkspaceApplicationCreatedDto` with fields: { `WorkspaceType`: WorkspaceType; `WorkspaceName`: string; `WorkspaceIdentifier`: string; `OwnerFullName`: string; `BrandName`: string?; `LogoUrl`: string?; `PhotoUrl`: string?; `CoverImageUrl`: string?; `BackgroundImageUrl`: string?; `PrimaryColor`: string?; `SecondaryColor`: string?; `Bio`: string?; `DeliveryMode`: string?; `Specialties`: IReadOnlyList<string>; `Certifications`: IReadOnlyList<string>; `WelcomeMessage`: string?; `BookingSettings`: JsonElement?; `MustChangePassword`: bool; `ApplicationId`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `WorkspaceIdentifier`: string?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/platform/workspace-applications/{id:guid}/approve-freelance` - `ApproveFreelance`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `request`: `ConcurrencyRequest` { `RowVersion`: string; `Message`: string; `RequestedFields`: IReadOnlyList<string>; `Reason`: string }<br>Handler signature: `Guid id, [FromBody] ConcurrencyRequest request`
- **Declared response:** Task<ActionResult<PlatformApplicationDto>>
- **Response schema:** `Task<ActionResult<PlatformApplicationDto>>` with fields: { `Id`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `ApplicationStatus`: ApplicationRequestStatus; `ApplicantEmail`: string; `ApplicantPhoneNumber`: string?; `WorkspaceIdentifier`: string?; `RequestedRole`: UserRole?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string>; `DecisionReason`: string?; `SubmittedAt`: DateTime?; `ReviewedAt`: DateTime?; `ReviewedBy`: string?; `ProvisionedWorkspaceId`: Guid?; `WorkspaceType`: WorkspaceType?; `PaymentRequestId`: Guid?; `PaymentStatus`: PaymentRequestStatus?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `DatabaseStatus`: DatabaseResourceStatus?; `DatabaseStatusCode`: string?; `ProvisioningStatus`: ProvisioningJobStatus?; `UserJourneyStage`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/platform/workspace-applications/{id:guid}/approve-membership` - `ApproveMembership`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `request`: `ConcurrencyRequest` { `RowVersion`: string; `Message`: string; `RequestedFields`: IReadOnlyList<string>; `Reason`: string }<br>Handler signature: `Guid id, [FromBody] ConcurrencyRequest request`
- **Declared response:** Task<ActionResult<PlatformApplicationDto>>
- **Response schema:** `Task<ActionResult<PlatformApplicationDto>>` with fields: { `Id`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `ApplicationStatus`: ApplicationRequestStatus; `ApplicantEmail`: string; `ApplicantPhoneNumber`: string?; `WorkspaceIdentifier`: string?; `RequestedRole`: UserRole?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string>; `DecisionReason`: string?; `SubmittedAt`: DateTime?; `ReviewedAt`: DateTime?; `ReviewedBy`: string?; `ProvisionedWorkspaceId`: Guid?; `WorkspaceType`: WorkspaceType?; `PaymentRequestId`: Guid?; `PaymentStatus`: PaymentRequestStatus?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `DatabaseStatus`: DatabaseResourceStatus?; `DatabaseStatusCode`: string?; `ProvisioningStatus`: ProvisioningJobStatus?; `UserJourneyStage`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/platform/workspace-applications/{id:guid}/approve-workspace` - `ApproveWorkspace`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `request`: `ConcurrencyRequest` { `RowVersion`: string; `Message`: string; `RequestedFields`: IReadOnlyList<string>; `Reason`: string }<br>Handler signature: `Guid id, [FromBody] ConcurrencyRequest request`
- **Declared response:** Task<ActionResult<PlatformApplicationDto>>
- **Response schema:** `Task<ActionResult<PlatformApplicationDto>>` with fields: { `Id`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `ApplicationStatus`: ApplicationRequestStatus; `ApplicantEmail`: string; `ApplicantPhoneNumber`: string?; `WorkspaceIdentifier`: string?; `RequestedRole`: UserRole?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string>; `DecisionReason`: string?; `SubmittedAt`: DateTime?; `ReviewedAt`: DateTime?; `ReviewedBy`: string?; `ProvisionedWorkspaceId`: Guid?; `WorkspaceType`: WorkspaceType?; `PaymentRequestId`: Guid?; `PaymentStatus`: PaymentRequestStatus?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `DatabaseStatus`: DatabaseResourceStatus?; `DatabaseStatusCode`: string?; `ProvisioningStatus`: ProvisioningJobStatus?; `UserJourneyStage`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/platform/workspace-applications/{id:guid}/reject` - `Reject`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `request`: `RejectRequest` { `RowVersion`: string; `Message`: string; `RequestedFields`: IReadOnlyList<string>; `Reason`: string }<br>Handler signature: `Guid id, [FromBody] RejectRequest request`
- **Declared response:** Task<ActionResult<PlatformApplicationDto>>
- **Response schema:** `Task<ActionResult<PlatformApplicationDto>>` with fields: { `Id`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `ApplicationStatus`: ApplicationRequestStatus; `ApplicantEmail`: string; `ApplicantPhoneNumber`: string?; `WorkspaceIdentifier`: string?; `RequestedRole`: UserRole?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string>; `DecisionReason`: string?; `SubmittedAt`: DateTime?; `ReviewedAt`: DateTime?; `ReviewedBy`: string?; `ProvisionedWorkspaceId`: Guid?; `WorkspaceType`: WorkspaceType?; `PaymentRequestId`: Guid?; `PaymentStatus`: PaymentRequestStatus?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `DatabaseStatus`: DatabaseResourceStatus?; `DatabaseStatusCode`: string?; `ProvisioningStatus`: ProvisioningJobStatus?; `UserJourneyStage`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/platform/workspace-applications/{id:guid}/request-information` - `RequestInformation`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `request`: `RequestInformationRequest` { `RowVersion`: string; `Message`: string; `RequestedFields`: IReadOnlyList<string>; `Reason`: string }<br>Handler signature: `Guid id, [FromBody] RequestInformationRequest request`
- **Declared response:** Task<ActionResult<PlatformApplicationDto>>
- **Response schema:** `Task<ActionResult<PlatformApplicationDto>>` with fields: { `Id`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `ApplicationStatus`: ApplicationRequestStatus; `ApplicantEmail`: string; `ApplicantPhoneNumber`: string?; `WorkspaceIdentifier`: string?; `RequestedRole`: UserRole?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string>; `DecisionReason`: string?; `SubmittedAt`: DateTime?; `ReviewedAt`: DateTime?; `ReviewedBy`: string?; `ProvisionedWorkspaceId`: Guid?; `WorkspaceType`: WorkspaceType?; `PaymentRequestId`: Guid?; `PaymentStatus`: PaymentRequestStatus?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `DatabaseStatus`: DatabaseResourceStatus?; `DatabaseStatusCode`: string?; `ProvisioningStatus`: ProvisioningJobStatus?; `UserJourneyStage`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/platform/workspace-applications/{id:guid}/retry-provisioning` - `RetryProvisioning`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<PlatformApplicationDto>>
- **Response schema:** `Task<ActionResult<PlatformApplicationDto>>` with fields: { `Id`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `ApplicationStatus`: ApplicationRequestStatus; `ApplicantEmail`: string; `ApplicantPhoneNumber`: string?; `WorkspaceIdentifier`: string?; `RequestedRole`: UserRole?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string>; `DecisionReason`: string?; `SubmittedAt`: DateTime?; `ReviewedAt`: DateTime?; `ReviewedBy`: string?; `ProvisionedWorkspaceId`: Guid?; `WorkspaceType`: WorkspaceType?; `PaymentRequestId`: Guid?; `PaymentStatus`: PaymentRequestStatus?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `DatabaseStatus`: DatabaseResourceStatus?; `DatabaseStatusCode`: string?; `ProvisioningStatus`: ProvisioningJobStatus?; `UserJourneyStage`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/platform/workspace-applications/{id:guid}/start-review` - `StartReview`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `request`: `ConcurrencyRequest` { `RowVersion`: string; `Message`: string; `RequestedFields`: IReadOnlyList<string>; `Reason`: string }<br>Handler signature: `Guid id, [FromBody] ConcurrencyRequest request`
- **Declared response:** Task<ActionResult<PlatformApplicationDto>>
- **Response schema:** `Task<ActionResult<PlatformApplicationDto>>` with fields: { `Id`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `ApplicationStatus`: ApplicationRequestStatus; `ApplicantEmail`: string; `ApplicantPhoneNumber`: string?; `WorkspaceIdentifier`: string?; `RequestedRole`: UserRole?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string>; `DecisionReason`: string?; `SubmittedAt`: DateTime?; `ReviewedAt`: DateTime?; `ReviewedBy`: string?; `ProvisionedWorkspaceId`: Guid?; `WorkspaceType`: WorkspaceType?; `PaymentRequestId`: Guid?; `PaymentStatus`: PaymentRequestStatus?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `DatabaseStatus`: DatabaseResourceStatus?; `DatabaseStatusCode`: string?; `ProvisioningStatus`: ProvisioningJobStatus?; `UserJourneyStage`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

## Tenant API

### Appointments

#### `GET /api/Appointments` - `GetAppointments`

- **Access:** JWT required
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `coachId`: `Guid?`<br>Query `clientId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `status`: `AppointmentStatus?`<br>Handler signature: `[FromQuery] Guid? coachId, [FromQuery] Guid? clientId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] AppointmentStatus? status`
- **Declared response:** Task<ActionResult<List<AppointmentDto>>>
- **Response schema:** `Task<ActionResult<List<AppointmentDto>>>` with fields: { `Id`: Guid; `CoachId`: Guid; `CoachName`: string?; `ClientId`: Guid; `ClientName`: string?; `StartTime`: DateTime; `EndTime`: DateTime; `Title`: string?; `Notes`: string?; `Status`: AppointmentStatus }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Appointments` - `CreateAppointment`

- **Access:** JWT required
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `CreateAppointmentCommand` { `CoachId`: Guid?; `ClientId`: Guid; `StartTime`: DateTime; `EndTime`: DateTime; `Title`: string?; `Notes`: string? }<br>Handler signature: `[FromBody] CreateAppointmentCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/Appointments/{id}` - `DeleteAppointment`

- **Access:** JWT required
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `GET /api/Appointments/{id}` - `GetAppointmentById`

- **Access:** JWT required
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<AppointmentDto>>
- **Response schema:** `Task<ActionResult<AppointmentDto>>` with fields: { `Id`: Guid; `CoachId`: Guid; `CoachName`: string?; `ClientId`: Guid; `ClientName`: string?; `StartTime`: DateTime; `EndTime`: DateTime; `Title`: string?; `Notes`: string?; `Status`: AppointmentStatus }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/Appointments/{id}/status` - `UpdateAppointmentStatus`

- **Access:** JWT required
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `command`: `UpdateAppointmentStatusCommand` { `Id`: Guid; `Status`: AppointmentStatus }<br>Handler signature: `Guid id, [FromBody] UpdateAppointmentStatusCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

### Attendance

#### `GET /api/Attendance` - `GetAttendances`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `clientId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `checkedInOnly`: `bool?`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] bool? checkedInOnly`
- **Declared response:** Task<ActionResult<List<AttendanceDto>>>
- **Response schema:** `Task<ActionResult<List<AttendanceDto>>>` with fields: { `Id`: Guid; `ClientId`: Guid; `ClientName`: string?; `CheckInTime`: DateTime; `CheckOutTime`: DateTime?; `Notes`: string?; `DurationMinutes`: double?; `TotalCheckIns`: int; `CheckedInNow`: int; `AverageDurationMinutes`: double; `DailyBreakdown`: List<DailyAttendanceDto>; `Date`: DateTime; `Count`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `DELETE /api/Attendance/{id}` - `DeleteAttendance`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/Attendance/{id}/check-out` - `CheckOut`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/Attendance/check-in` - `CheckIn`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `CheckInCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `GET /api/Attendance/summary` - `GetAttendanceSummary`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<AttendanceSummaryDto>>
- **Response schema:** `Task<ActionResult<AttendanceSummaryDto>>` with fields: { `Id`: Guid; `ClientId`: Guid; `ClientName`: string?; `CheckInTime`: DateTime; `CheckOutTime`: DateTime?; `Notes`: string?; `DurationMinutes`: double?; `TotalCheckIns`: int; `CheckedInNow`: int; `AverageDurationMinutes`: double; `DailyBreakdown`: List<DailyAttendanceDto>; `Date`: DateTime; `Count`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### Auth

#### `POST /api/Auth/change-password` - `ChangePassword`

- **Access:** JWT required
- **Business purpose:** Identity, login, and session issuance/rotation.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `ChangePasswordCommand` { `CurrentPassword`: string; `NewPassword`: string }<br>Handler signature: `[FromBody] ChangePasswordCommand command`
- **Declared response:** StatusCodes.Status204NoContent<br>StatusCodes.Status400BadRequest<br>StatusCodes.Status401Unauthorized
- **Response schema:** No response body declared.<br>No response body declared.<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/Auth/logout-all` - `LogoutAll`

- **Access:** JWT required
- **Business purpose:** Identity, login, and session issuance/rotation.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** No request input.
- **Declared response:** StatusCodes.Status204NoContent<br>StatusCodes.Status401Unauthorized
- **Response schema:** No response body declared.<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/Auth/refresh` - `Refresh`

- **Access:** Anonymous (no token required)
- **Business purpose:** Identity, login, and session issuance/rotation.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** No request input.
- **Declared response:** typeof(AuthResponseDto), StatusCodes.Status200OK<br>StatusCodes.Status401Unauthorized
- **Response schema:** `AuthResponseDto` with fields: { `UserId`: Guid; `Email`: string?; `PhoneNumber`: string?; `FullName`: string?; `Role`: string; `Roles`: IReadOnlyList<string>; `Permissions`: IReadOnlyList<string>; `TenantId`: Guid; `AccessToken`: string; `ExpiresAt`: DateTime; `MustChangePassword`: bool }<br>No response body declared.
- **Failure contract:** 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### BodyMeasurements

#### `GET /api/BodyMeasurements` - `GetBodyMeasurements`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `clientId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<BodyMeasurementDto>>>
- **Response schema:** `Task<ActionResult<List<BodyMeasurementDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `ClientId`: Guid; `ClientName`: string?; `DateRecorded`: DateTime; `WeightKg`: double?; `SkeletalMuscleMass`: double?; `BodyFatMass`: double?; `BodyFatPercent`: double?; `TotalBodyWater`: double?; `Bmr`: double?; `VisceralFatLevel`: int?; `InbodyImageUrl`: string?; `FrontPhotoUrl`: string?; `SidePhotoUrl`: string?; `BackPhotoUrl`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/BodyMeasurements` - `CreateBodyMeasurement`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `CreateBodyMeasurementCommand` { `ClientId`: Guid; `DateRecorded`: DateTime; `WeightKg`: double; `SkeletalMuscleMass`: double?; `BodyFatMass`: double?; `BodyFatPercent`: double?; `TotalBodyWater`: double?; `Bmr`: double?; `VisceralFatLevel`: int? }<br>Handler signature: `[FromBody] CreateBodyMeasurementCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/BodyMeasurements/{id}` - `DeleteBodyMeasurement`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `POST /api/BodyMeasurements/with-images` - `CreateBodyMeasurementWithImages`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Form `command`: `CreateBodyMeasurementCommand`<br>Handler signature: `[FromForm] CreateBodyMeasurementCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### Branches

#### `GET /api/Branches` - `GetBranches`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `isActive`: `bool?`<br>Query `searchTerm`: `string?`<br>Handler signature: `[FromQuery] bool? isActive, [FromQuery] string? searchTerm`
- **Declared response:** typeof(List<BranchDto>), StatusCodes.Status200OK
- **Response schema:** `List<BranchDto>` with fields: { `Id`: Guid; `TenantId`: Guid; `Name`: string; `Code`: string?; `Description`: string?; `Address`: string?; `City`: string?; `PhoneNumber`: string?; `Email`: string?; `Latitude`: double?; `Longitude`: double?; `IsActive`: bool; `IsDefault`: bool; `Capacity`: int?; `OpenTime`: TimeSpan?; `CloseTime`: TimeSpan?; `ManagerId`: Guid?; `ManagerName`: string?; `LogoUrl`: string?; `CoverImageUrl`: string?; `OperatingHours`: List<BranchOperatingHoursDto>; `ActiveClientsCount`: int; `TodayCheckInsCount`: int; `DayOfWeek`: DayOfWeek }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Branches` - `CreateBranch`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateBranchCommand command`
- **Declared response:** typeof(Guid), StatusCodes.Status200OK
- **Response schema:** `Guid`; concrete properties are not declared in a discoverable DTO.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/Branches/{id}` - `DeleteBranch`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** StatusCodes.Status204NoContent
- **Response schema:** No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `GET /api/Branches/{id}` - `GetBranch`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(BranchDto), StatusCodes.Status200OK<br>StatusCodes.Status404NotFound
- **Response schema:** `BranchDto` with fields: { `Id`: Guid; `TenantId`: Guid; `Name`: string; `Code`: string?; `Description`: string?; `Address`: string?; `City`: string?; `PhoneNumber`: string?; `Email`: string?; `Latitude`: double?; `Longitude`: double?; `IsActive`: bool; `IsDefault`: bool; `Capacity`: int?; `OpenTime`: TimeSpan?; `CloseTime`: TimeSpan?; `ManagerId`: Guid?; `ManagerName`: string?; `LogoUrl`: string?; `CoverImageUrl`: string?; `OperatingHours`: List<BranchOperatingHoursDto>; `ActiveClientsCount`: int; `TodayCheckInsCount`: int; `DayOfWeek`: DayOfWeek }<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/Branches/{id}` - `UpdateBranch`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateBranchCommand command`
- **Declared response:** StatusCodes.Status204NoContent
- **Response schema:** No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `PUT /api/Branches/{id}/operating-hours` - `SetOperatingHours`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, SetOperatingHoursCommand command`
- **Declared response:** StatusCodes.Status204NoContent
- **Response schema:** No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### Branding

#### `GET /api/Branding/{identifier}` - `GetBranding`

- **Access:** Anonymous (no token required)
- **Business purpose:** LogicFit API module `Branding`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `string identifier`
- **Declared response:** typeof(BrandingDto), StatusCodes.Status200OK<br>StatusCodes.Status404NotFound
- **Response schema:** `BrandingDto` with fields: { `Identifier`: string; `TenantId`: Guid; `Name`: string; `Subdomain`: string?; `AppName`: string?; `LogoUrl`: string?; `LogoDarkUrl`: string?; `LogoLightUrl`: string?; `LogoIconUrl`: string?; `FaviconUrl`: string?; `CoverImageUrl`: string?; `LoginBackgroundUrl`: string?; `DashboardBannerUrl`: string?; `GalleryImages`: List<string>; `Assets`: List<BrandAssetDto>; `PrimaryColor`: string?; `PrimaryHoverColor`: string?; `PrimaryForegroundColor`: string?; `SecondaryColor`: string?; `SecondaryHoverColor`: string?; `SecondaryForegroundColor`: string?; `AccentColor`: string?; `BackgroundColor`: string?; `SurfaceColor`: string? }<br>No response body declared.
- **Failure contract:** 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### Challenges

#### `GET /api/Challenges` - `GetChallenges`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `status`: `ChallengeStatus?`<br>Handler signature: `[FromQuery] ChallengeStatus? status`
- **Declared response:** Task<ActionResult<List<ChallengeDto>>>
- **Response schema:** `Task<ActionResult<List<ChallengeDto>>>` with fields: { `Id`: Guid; `Title`: string; `Description`: string?; `StartDate`: DateTime; `EndDate`: DateTime; `TargetMetric`: string?; `TargetValue`: double?; `Status`: ChallengeStatus; `CreatedByCoachName`: string?; `ParticipantCount`: int; `CompletedCount`: int; `Rank`: int; `ClientId`: Guid; `ClientName`: string?; `CurrentProgress`: double; `ProgressPercentage`: double; `IsCompleted`: bool; `CompletedAt`: DateTime?; `ChallengeId`: Guid; `ChallengeTitle`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Challenges` - `CreateChallenge`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `CreateChallengeCommand` { `Title`: string; `Description`: string?; `StartDate`: DateTime; `EndDate`: DateTime; `TargetMetric`: string?; `TargetValue`: double?; `ClientIds`: List<Guid>? }<br>Handler signature: `[FromBody] CreateChallengeCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `PUT /api/Challenges/{challengeId}/progress` - `UpdateProgress`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Body `command`: `UpdateProgressCommand` { `ChallengeId`: Guid; `Progress`: double; `Increment`: bool }<br>Handler signature: `Guid challengeId, [FromBody] UpdateProgressCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `DELETE /api/Challenges/{id}` - `DeleteChallenge`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `GET /api/Challenges/{id}` - `GetChallengeById`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<ChallengeDto>>
- **Response schema:** `Task<ActionResult<ChallengeDto>>` with fields: { `Id`: Guid; `Title`: string; `Description`: string?; `StartDate`: DateTime; `EndDate`: DateTime; `TargetMetric`: string?; `TargetValue`: double?; `Status`: ChallengeStatus; `CreatedByCoachName`: string?; `ParticipantCount`: int; `CompletedCount`: int; `Rank`: int; `ClientId`: Guid; `ClientName`: string?; `CurrentProgress`: double; `ProgressPercentage`: double; `IsCompleted`: bool; `CompletedAt`: DateTime?; `ChallengeId`: Guid; `ChallengeTitle`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/Challenges/{id}` - `UpdateChallenge`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Body `command`: `UpdateChallengeCommand` { `Id`: Guid; `Title`: string?; `Description`: string?; `EndDate`: DateTime?; `Status`: ChallengeStatus? }<br>Handler signature: `Guid id, [FromBody] UpdateChallengeCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/Challenges/{id}/join` - `JoinChallenge`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `GET /api/Challenges/{id}/leaderboard` - `GetLeaderboard`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<List<ChallengeLeaderboardEntryDto>>>
- **Response schema:** `Task<ActionResult<List<ChallengeLeaderboardEntryDto>>>` with fields: { `Id`: Guid; `Title`: string; `Description`: string?; `StartDate`: DateTime; `EndDate`: DateTime; `TargetMetric`: string?; `TargetValue`: double?; `Status`: ChallengeStatus; `CreatedByCoachName`: string?; `ParticipantCount`: int; `CompletedCount`: int; `Rank`: int; `ClientId`: Guid; `ClientName`: string?; `CurrentProgress`: double; `ProgressPercentage`: double; `IsCompleted`: bool; `CompletedAt`: DateTime?; `ChallengeId`: Guid; `ChallengeTitle`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Challenges/my` - `GetMyChallenges`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<ClientChallengeDto>>>
- **Response schema:** `Task<ActionResult<List<ClientChallengeDto>>>` with fields: { `Id`: Guid; `Title`: string; `Description`: string?; `StartDate`: DateTime; `EndDate`: DateTime; `TargetMetric`: string?; `TargetValue`: double?; `Status`: ChallengeStatus; `CreatedByCoachName`: string?; `ParticipantCount`: int; `CompletedCount`: int; `Rank`: int; `ClientId`: Guid; `ClientName`: string?; `CurrentProgress`: double; `ProgressPercentage`: double; `IsCompleted`: bool; `CompletedAt`: DateTime?; `ChallengeId`: Guid; `ChallengeTitle`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### Chat

#### `GET /api/Chat/conversations` - `GetMyConversations`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<ConversationDto>>>
- **Response schema:** `Task<ActionResult<List<ConversationDto>>>` with fields: { `Id`: Guid; `CoachId`: Guid; `CoachName`: string?; `ClientId`: Guid; `ClientName`: string?; `LastMessageAt`: DateTime?; `LastMessagePreview`: string?; `UnreadCount`: int; `ConversationId`: Guid; `SenderId`: Guid; `SenderName`: string?; `Content`: string; `IsRead`: bool; `ReadAt`: DateTime?; `CreatedAt`: DateTime }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Chat/conversations/{conversationId}/messages` - `GetConversationMessages`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid conversationId`
- **Declared response:** Task<ActionResult<List<ChatMessageDto>>>
- **Response schema:** `Task<ActionResult<List<ChatMessageDto>>>` with fields: { `Id`: Guid; `CoachId`: Guid; `CoachName`: string?; `ClientId`: Guid; `ClientName`: string?; `LastMessageAt`: DateTime?; `LastMessagePreview`: string?; `UnreadCount`: int; `ConversationId`: Guid; `SenderId`: Guid; `SenderName`: string?; `Content`: string; `IsRead`: bool; `ReadAt`: DateTime?; `CreatedAt`: DateTime }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/Chat/conversations/{conversationId}/read` - `MarkMessagesAsRead`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid conversationId`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/Chat/messages` - `SendMessage`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `command`: `SendMessageCommand` { `ConversationId`: Guid?; `RecipientId`: Guid?; `Content`: string }<br>Handler signature: `[FromBody] SendMessageCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

### ClassSchedules

#### `GET /api/ClassSchedules` - `GetSchedules`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `groupClassId`: `Guid?`<br>Query `coachId`: `Guid?`<br>Query `roomId`: `Guid?`<br>Query `branchId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `includeCancelled`: `bool?`<br>Handler signature: `[FromQuery] Guid? groupClassId, [FromQuery] Guid? coachId, [FromQuery] Guid? roomId, [FromQuery] Guid? branchId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] bool? includeCancelled`
- **Declared response:** Task<ActionResult<List<ClassScheduleDto>>>
- **Response schema:** `Task<ActionResult<List<ClassScheduleDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `BranchId`: Guid?; `BranchName`: string?; `Name`: string; `Description`: string?; `Category`: string?; `DurationMinutes`: int; `Capacity`: int; `Color`: string?; `ImageUrl`: string?; `Price`: decimal?; `IsActive`: bool; `UpcomingSchedulesCount`: int; `GroupClassId`: Guid; `GroupClassName`: string?; `CoachId`: Guid?; `CoachName`: string?; `RoomId`: Guid?; `RoomName`: string?; `StartTime`: DateTime; `EndTime`: DateTime; `RecurrencePattern`: RecurrencePattern; `RecurrenceDaysOfWeek`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/ClassSchedules` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateClassScheduleCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/ClassSchedules/{id}/book` - `Book`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `BookClassCommand` { `ScheduleId`: Guid; `ClientId`: Guid }<br>Handler signature: `Guid id, [FromBody] BookClassCommand command`
- **Declared response:** Task<ActionResult<ClassEnrollmentDto>>
- **Response schema:** `Task<ActionResult<ClassEnrollmentDto>>` with fields: { `Id`: Guid; `TenantId`: Guid; `BranchId`: Guid?; `BranchName`: string?; `Name`: string; `Description`: string?; `Category`: string?; `DurationMinutes`: int; `Capacity`: int; `Color`: string?; `ImageUrl`: string?; `Price`: decimal?; `IsActive`: bool; `UpcomingSchedulesCount`: int; `GroupClassId`: Guid; `GroupClassName`: string?; `CoachId`: Guid?; `CoachName`: string?; `RoomId`: Guid?; `RoomName`: string?; `StartTime`: DateTime; `EndTime`: DateTime; `RecurrencePattern`: RecurrencePattern; `RecurrenceDaysOfWeek`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/ClassSchedules/{id}/cancel` - `Cancel`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `CancelClassScheduleCommand` { `Id`: Guid; `Reason`: string? }<br>Handler signature: `Guid id, [FromBody] CancelClassScheduleCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `GET /api/ClassSchedules/{id}/enrollments` - `GetEnrollments`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `includeCancelled`: `bool`<br>Handler signature: `Guid id, [FromQuery] bool includeCancelled = false`
- **Declared response:** Task<ActionResult<List<ClassEnrollmentDto>>>
- **Response schema:** `Task<ActionResult<List<ClassEnrollmentDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `BranchId`: Guid?; `BranchName`: string?; `Name`: string; `Description`: string?; `Category`: string?; `DurationMinutes`: int; `Capacity`: int; `Color`: string?; `ImageUrl`: string?; `Price`: decimal?; `IsActive`: bool; `UpcomingSchedulesCount`: int; `GroupClassId`: Guid; `GroupClassName`: string?; `CoachId`: Guid?; `CoachName`: string?; `RoomId`: Guid?; `RoomName`: string?; `StartTime`: DateTime; `EndTime`: DateTime; `RecurrencePattern`: RecurrencePattern; `RecurrenceDaysOfWeek`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/ClassSchedules/enrollments/{enrollmentId}/attended` - `MarkAttended`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid enrollmentId`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/ClassSchedules/enrollments/{enrollmentId}/cancel` - `CancelEnrollment`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `CancelEnrollmentCommand` { `Id`: Guid; `Reason`: string? }<br>Handler signature: `Guid enrollmentId, [FromBody] CancelEnrollmentCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### ClientDashboard

#### `GET /api/client/dashboard` - `GetMyDashboard`

- **Access:** JWT required
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<ClientDashboardDto>>
- **Response schema:** `Task<ActionResult<ClientDashboardDto>>` with fields: { `ActivePrograms`: List<MyWorkoutProgramDto>; `ActiveDietPlans`: List<MyDietPlanDto>; `ActiveSubscription`: MySubscriptionSummaryDto?; `RecentMeasurements`: List<MyBodyMeasurementDto>; `AssignedCoach`: MyCoachDto?; `UnreadNotificationCount`: int; `Id`: Guid; `Name`: string; `CoachName`: string?; `StartDate`: DateTime; `EndDate`: DateTime?; `Status`: PlanStatus; `TargetCalories`: double; `TargetProtein`: double; `TargetCarbs`: double; `TargetFats`: double; `PlanName`: string; `EndDate`: DateTime; `Status`: SubscriptionStatus; `TotalAmount`: decimal; `AmountPaid`: decimal; `DateRecorded`: DateTime; `WeightKg`: double?; `BodyFatPercent`: double? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/client/my-appointments` - `GetMyAppointments`

- **Access:** JWT required
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<MyAppointmentDto>>>
- **Response schema:** `Task<ActionResult<List<MyAppointmentDto>>>` with fields: { `Id`: Guid; `CoachName`: string?; `StartTime`: DateTime; `EndTime`: DateTime; `Title`: string?; `Status`: AppointmentStatus }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/client/my-coach` - `GetMyCoach`

- **Access:** JWT required
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<MyCoachDto>>
- **Response schema:** `Task<ActionResult<MyCoachDto>>` with fields: { `ActivePrograms`: List<MyWorkoutProgramDto>; `ActiveDietPlans`: List<MyDietPlanDto>; `ActiveSubscription`: MySubscriptionSummaryDto?; `RecentMeasurements`: List<MyBodyMeasurementDto>; `AssignedCoach`: MyCoachDto?; `UnreadNotificationCount`: int; `Id`: Guid; `Name`: string; `CoachName`: string?; `StartDate`: DateTime; `EndDate`: DateTime?; `Status`: PlanStatus; `TargetCalories`: double; `TargetProtein`: double; `TargetCarbs`: double; `TargetFats`: double; `PlanName`: string; `EndDate`: DateTime; `Status`: SubscriptionStatus; `TotalAmount`: decimal; `AmountPaid`: decimal; `DateRecorded`: DateTime; `WeightKg`: double?; `BodyFatPercent`: double? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/client/my-diet-plans` - `GetMyDietPlans`

- **Access:** JWT required
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<MyDietPlanDto>>>
- **Response schema:** `Task<ActionResult<List<MyDietPlanDto>>>` with fields: { `ActivePrograms`: List<MyWorkoutProgramDto>; `ActiveDietPlans`: List<MyDietPlanDto>; `ActiveSubscription`: MySubscriptionSummaryDto?; `RecentMeasurements`: List<MyBodyMeasurementDto>; `AssignedCoach`: MyCoachDto?; `UnreadNotificationCount`: int; `Id`: Guid; `Name`: string; `CoachName`: string?; `StartDate`: DateTime; `EndDate`: DateTime?; `Status`: PlanStatus; `TargetCalories`: double; `TargetProtein`: double; `TargetCarbs`: double; `TargetFats`: double; `PlanName`: string; `EndDate`: DateTime; `Status`: SubscriptionStatus; `TotalAmount`: decimal; `AmountPaid`: decimal; `DateRecorded`: DateTime; `WeightKg`: double?; `BodyFatPercent`: double? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/client/my-measurements` - `GetMyMeasurements`

- **Access:** JWT required
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<MyBodyMeasurementDto>>>
- **Response schema:** `Task<ActionResult<List<MyBodyMeasurementDto>>>` with fields: { `ActivePrograms`: List<MyWorkoutProgramDto>; `ActiveDietPlans`: List<MyDietPlanDto>; `ActiveSubscription`: MySubscriptionSummaryDto?; `RecentMeasurements`: List<MyBodyMeasurementDto>; `AssignedCoach`: MyCoachDto?; `UnreadNotificationCount`: int; `Id`: Guid; `Name`: string; `CoachName`: string?; `StartDate`: DateTime; `EndDate`: DateTime?; `Status`: PlanStatus; `TargetCalories`: double; `TargetProtein`: double; `TargetCarbs`: double; `TargetFats`: double; `PlanName`: string; `EndDate`: DateTime; `Status`: SubscriptionStatus; `TotalAmount`: decimal; `AmountPaid`: decimal; `DateRecorded`: DateTime; `WeightKg`: double?; `BodyFatPercent`: double? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/client/my-programs` - `GetMyPrograms`

- **Access:** JWT required
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<MyWorkoutProgramDto>>>
- **Response schema:** `Task<ActionResult<List<MyWorkoutProgramDto>>>` with fields: { `ActivePrograms`: List<MyWorkoutProgramDto>; `ActiveDietPlans`: List<MyDietPlanDto>; `ActiveSubscription`: MySubscriptionSummaryDto?; `RecentMeasurements`: List<MyBodyMeasurementDto>; `AssignedCoach`: MyCoachDto?; `UnreadNotificationCount`: int; `Id`: Guid; `Name`: string; `CoachName`: string?; `StartDate`: DateTime; `EndDate`: DateTime?; `Status`: PlanStatus; `TargetCalories`: double; `TargetProtein`: double; `TargetCarbs`: double; `TargetFats`: double; `PlanName`: string; `EndDate`: DateTime; `Status`: SubscriptionStatus; `TotalAmount`: decimal; `AmountPaid`: decimal; `DateRecorded`: DateTime; `WeightKg`: double?; `BodyFatPercent`: double? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/client/my-progress` - `GetMyProgress`

- **Access:** JWT required
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<TraineeProgressReportDto>>
- **Response schema:** `Task<ActionResult<TraineeProgressReportDto>>` with fields: { `TotalClients`: int; `ActiveClients`: int; `NewClientsThisMonth`: int; `TotalCoaches`: int; `ActiveSubscriptions`: int; `ExpiringSubscriptions`: int; `TotalRevenueThisMonth`: decimal; `TotalRevenueLastMonth`: decimal; `TotalWorkoutsThisMonth`: int; `TotalDietPlansActive`: int; `InactiveClients`: int; `ClientsWithActiveSubscription`: int; `ClientsWithoutSubscription`: int; `TopClients`: List<ClientSummaryDto>; `MonthlyTrend`: List<MonthlyClientDto>; `Id`: Guid; `Name`: string; `PhoneNumber`: string?; `TotalSessions`: int; `TotalPaid`: decimal; `Month`: string; `NewClients`: int; `ChurnedClients`: int; `TotalSubscriptions`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/client/my-subscriptions` - `GetMySubscriptions`

- **Access:** JWT required
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<List<MySubscriptionSummaryDto>>>
- **Response schema:** `Task<ActionResult<List<MySubscriptionSummaryDto>>>` with fields: { `ActivePrograms`: List<MyWorkoutProgramDto>; `ActiveDietPlans`: List<MyDietPlanDto>; `ActiveSubscription`: MySubscriptionSummaryDto?; `RecentMeasurements`: List<MyBodyMeasurementDto>; `AssignedCoach`: MyCoachDto?; `UnreadNotificationCount`: int; `Id`: Guid; `Name`: string; `CoachName`: string?; `StartDate`: DateTime; `EndDate`: DateTime?; `Status`: PlanStatus; `TargetCalories`: double; `TargetProtein`: double; `TargetCarbs`: double; `TargetFats`: double; `PlanName`: string; `EndDate`: DateTime; `Status`: SubscriptionStatus; `TotalAmount`: decimal; `AmountPaid`: decimal; `DateRecorded`: DateTime; `WeightKg`: double?; `BodyFatPercent`: double? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### Clients

#### `GET /api/Clients` - `GetClients`

- **Access:** JWT + Policy: `Permissions.ViewMembers`
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `searchTerm`: `string?`<br>Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] string? searchTerm, [FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<ClientDto>>>
- **Response schema:** `Task<ActionResult<List<ClientDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Email`: string?; `PhoneNumber`: string; `IsActive`: bool; `WalletBalance`: decimal; `Profile`: ClientProfileDto?; `ActiveSubscription`: ClientSubscriptionInfoDto?; `FullName`: string?; `Gender`: int?; `BirthDate`: DateTime?; `HeightCm`: double?; `ActivityLevel`: string?; `MedicalHistory`: string?; `PlanName`: string; `StartDate`: DateTime; `EndDate`: DateTime; `Status`: SubscriptionStatus; `Password`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Clients` - `CreateClient`

- **Access:** JWT + Policy: `Permissions.CreateMembers`
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateClientCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/Clients/{id}` - `DeleteClient`

- **Access:** JWT + Policy: `Permissions.DeleteMembers`
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `GET /api/Clients/{id}` - `GetClient`

- **Access:** JWT + Policy: `Permissions.ViewMembers`
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<ClientDto>>
- **Response schema:** `Task<ActionResult<ClientDto>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Email`: string?; `PhoneNumber`: string; `IsActive`: bool; `WalletBalance`: decimal; `Profile`: ClientProfileDto?; `ActiveSubscription`: ClientSubscriptionInfoDto?; `FullName`: string?; `Gender`: int?; `BirthDate`: DateTime?; `HeightCm`: double?; `ActivityLevel`: string?; `MedicalHistory`: string?; `PlanName`: string; `StartDate`: DateTime; `EndDate`: DateTime; `Status`: SubscriptionStatus; `Password`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/Clients/{id}` - `UpdateClient`

- **Access:** JWT + Policy: `Permissions.UpdateMembers`
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateClientCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/Clients/onboard` - `OnboardClient`

- **Access:** JWT + Policy: `Permissions.CreateMembers`
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `OnboardClientCommand command`
- **Declared response:** Task<ActionResult<OnboardClientResult>>
- **Response schema:** `Task<ActionResult<OnboardClientResult>>` with fields: { `PhoneNumber`: string; `Email`: string?; `Password`: string?; `FullName`: string?; `Gender`: int?; `BirthDate`: DateTime?; `CoachId`: Guid?; `Membership`: MembershipDetails?; `PlanId`: Guid; `StartDate`: DateTime; `PaymentMethod`: PaymentMethod?; `AmountPaid`: decimal?; `Discount`: decimal?; `Notes`: string?; `PayFromWallet`: bool; `IssueCard`: bool; `ClientId`: Guid; `SubscriptionId`: Guid?; `MembershipCardId`: Guid? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### CoachClients

#### `GET /api/coach-clients` - `GetCoachClients`

- **Access:** JWT + Policy: `Permissions.ViewMembers`
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `coachId`: `Guid?`<br>Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] Guid? coachId, [FromQuery] bool? isActive = true`
- **Declared response:** Task<ActionResult<List<CoachClientDto>>>
- **Response schema:** `Task<ActionResult<List<CoachClientDto>>>` with fields: { `Id`: Guid; `CoachId`: Guid; `CoachName`: string; `ClientId`: Guid; `ClientName`: string; `ClientPhone`: string?; `ClientEmail`: string?; `AssignedAt`: DateTime; `UnassignedAt`: DateTime?; `IsActive`: bool; `Notes`: string?; `HasActiveSubscription`: bool; `SubscriptionEndDate`: DateTime?; `WorkoutProgramsCount`: int; `DietPlansCount`: int; `WorkoutSessionsCount`: int; `LastSessionDate`: DateTime?; `CoachId`: Guid? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/coach-clients` - `AddTrainee`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `AddTraineeCommand command`
- **Declared response:** Task<ActionResult<AddTraineeResult>>
- **Response schema:** `Task<ActionResult<AddTraineeResult>>` with fields: { `ClientName`: string; `ClientPhone`: string; `ClientEmail`: string?; `Gender`: int?; `BirthDate`: DateTime?; `HeightCm`: double?; `ActivityLevel`: string?; `MedicalHistory`: string?; `Notes`: string?; `TemporaryPassword`: string?; `ClientId`: Guid; `TemporaryPassword`: string; `MustChangePassword`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/coach-clients/{clientId}` - `UnassignClientFromCoach`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid clientId`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `GET /api/coach-clients/{id}` - `GetCoachClientById`

- **Access:** JWT + Policy: `Permissions.ViewMembers`
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<CoachClientDto>>
- **Response schema:** `Task<ActionResult<CoachClientDto>>` with fields: { `Id`: Guid; `CoachId`: Guid; `CoachName`: string; `ClientId`: Guid; `ClientName`: string; `ClientPhone`: string?; `ClientEmail`: string?; `AssignedAt`: DateTime; `UnassignedAt`: DateTime?; `IsActive`: bool; `Notes`: string?; `HasActiveSubscription`: bool; `SubscriptionEndDate`: DateTime?; `WorkoutProgramsCount`: int; `DietPlansCount`: int; `WorkoutSessionsCount`: int; `LastSessionDate`: DateTime?; `CoachId`: Guid? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/coach-clients/{id}` - `UpdateCoachClient`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Body `command`: `UpdateCoachClientCommand` { `Id`: Guid; `NewCoachId`: Guid?; `IsActive`: bool? }<br>Handler signature: `Guid id, [FromBody] UpdateCoachClientCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/coach-clients/assign` - `AssignClientToCoach`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `AssignClientToCoachCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

### Coaches

#### `GET /api/Coaches` - `GetCoaches`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `searchTerm`: `string?`<br>Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] string? searchTerm, [FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<CoachDto>>>
- **Response schema:** `Task<ActionResult<List<CoachDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Email`: string?; `PhoneNumber`: string?; `IsActive`: bool; `Profile`: CoachProfileDto?; `TraineeCount`: int; `StaffQrCode`: string?; `StaffQrGeneratedAt`: DateTime?; `StaffQrRevokedAt`: DateTime?; `FullName`: string?; `ProfilePictureUrl`: string?; `Gender`: int?; `BirthDate`: DateTime? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Coaches` - `CreateCoach`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateCoachCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/Coaches/{id}` - `DeleteCoach`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `GET /api/Coaches/{id}` - `GetCoach`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<CoachDto>>
- **Response schema:** `Task<ActionResult<CoachDto>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Email`: string?; `PhoneNumber`: string?; `IsActive`: bool; `Profile`: CoachProfileDto?; `TraineeCount`: int; `StaffQrCode`: string?; `StaffQrGeneratedAt`: DateTime?; `StaffQrRevokedAt`: DateTime?; `FullName`: string?; `ProfilePictureUrl`: string?; `Gender`: int?; `BirthDate`: DateTime? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/Coaches/{id}` - `UpdateCoach`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateCoachCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/Coaches/{id}/qr/regenerate` - `RegenerateQr`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<object>>
- **Response schema:** `Task<ActionResult<object>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/Coaches/{id}/qr/revoke` - `RevokeQr`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### Commissions

#### `GET /api/Commissions` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `employeeId`: `Guid?`<br>Query `status`: `CommissionStatus?`<br>Query `sourceType`: `CommissionSourceType?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? employeeId, [FromQuery] CommissionStatus? status, [FromQuery] CommissionSourceType? sourceType, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<CommissionDto>>>
- **Response schema:** `Task<ActionResult<List<CommissionDto>>>` with fields: { `Id`: Guid; `EmployeeId`: Guid; `EmployeeName`: string?; `SourceType`: CommissionSourceType; `ReferenceId`: Guid?; `Amount`: decimal; `SourceAmount`: decimal; `EarnedDate`: DateTime; `Status`: CommissionStatus; `PayrollItemId`: Guid?; `Description`: string?; `EmployeeId`: Guid?; `Role`: UserRole?; `Type`: CommissionRuleType; `Value`: decimal; `MinAmount`: decimal?; `IsActive`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Commissions/rules` - `GetRules`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<CommissionRuleDto>>>
- **Response schema:** `Task<ActionResult<List<CommissionRuleDto>>>` with fields: { `Id`: Guid; `EmployeeId`: Guid; `EmployeeName`: string?; `SourceType`: CommissionSourceType; `ReferenceId`: Guid?; `Amount`: decimal; `SourceAmount`: decimal; `EarnedDate`: DateTime; `Status`: CommissionStatus; `PayrollItemId`: Guid?; `Description`: string?; `EmployeeId`: Guid?; `Role`: UserRole?; `Type`: CommissionRuleType; `Value`: decimal; `MinAmount`: decimal?; `IsActive`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Commissions/rules` - `CreateRule`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateCommissionRuleCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### Coupons

#### `GET /api/Coupons` - `GetCoupons`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** LogicFit API module `Coupons`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `isActive`: `bool?`<br>Query `search`: `string?`<br>Handler signature: `[FromQuery] bool? isActive, [FromQuery] string? search`
- **Declared response:** Task<ActionResult<List<CouponDto>>>
- **Response schema:** `Task<ActionResult<List<CouponDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Code`: string; `Description`: string?; `DiscountType`: DiscountType; `DiscountValue`: decimal; `MinimumAmount`: decimal?; `MaxDiscountAmount`: decimal?; `MaxUses`: int?; `UsedCount`: int; `MaxUsesPerUser`: int?; `StartDate`: DateTime?; `EndDate`: DateTime?; `ApplicableTo`: CouponApplicability; `IsActive`: bool; `IsValid`: bool; `ErrorMessage`: string?; `Coupon`: CouponDto?; `EstimatedDiscount`: decimal? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Coupons` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** LogicFit API module `Coupons`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateCouponCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/Coupons/{id}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** LogicFit API module `Coupons`.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/Coupons/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** LogicFit API module `Coupons`.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateCouponCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `GET /api/Coupons/validate` - `Validate`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** LogicFit API module `Coupons`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `code`: `string`<br>Query `amount`: `decimal`<br>Query `context`: `CouponApplicability?`<br>Query `clientId`: `Guid?`<br>Handler signature: `[FromQuery] string code, [FromQuery] decimal amount, [FromQuery] CouponApplicability? context, [FromQuery] Guid? clientId`
- **Declared response:** Task<ActionResult<ValidateCouponResultDto>>
- **Response schema:** `Task<ActionResult<ValidateCouponResultDto>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Code`: string; `Description`: string?; `DiscountType`: DiscountType; `DiscountValue`: decimal; `MinimumAmount`: decimal?; `MaxDiscountAmount`: decimal?; `MaxUses`: int?; `UsedCount`: int; `MaxUsesPerUser`: int?; `StartDate`: DateTime?; `EndDate`: DateTime?; `ApplicableTo`: CouponApplicability; `IsActive`: bool; `IsValid`: bool; `ErrorMessage`: string?; `Coupon`: CouponDto?; `EstimatedDiscount`: decimal? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### DietPlans

#### `GET /api/DietPlans` - `GetDietPlans`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `coachId`: `Guid?`<br>Query `clientId`: `Guid?`<br>Query `status`: `PlanStatus?`<br>Handler signature: `[FromQuery] Guid? coachId, [FromQuery] Guid? clientId, [FromQuery] PlanStatus? status`
- **Declared response:** Task<ActionResult<List<DietPlanDto>>>
- **Response schema:** `Task<ActionResult<List<DietPlanDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `CoachId`: Guid; `CoachName`: string?; `ClientId`: Guid; `ClientName`: string?; `Name`: string; `Description`: string?; `MealsPerDay`: int?; `StartDate`: DateTime; `EndDate`: DateTime?; `Status`: PlanStatus; `TargetCalories`: double?; `TargetProtein`: double?; `TargetCarbs`: double?; `TargetFats`: double?; `Meals`: List<DailyMealDto>; `PlanId`: Guid; `OrderIndex`: int; `Time`: string?; `Items`: List<MealItemDto>; `MealId`: Guid; `FoodId`: int; `FoodName`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/DietPlans` - `CreateDietPlan`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateDietPlanCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/DietPlans/{id}` - `DeleteDietPlan`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `GET /api/DietPlans/{id}` - `GetDietPlan`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<DietPlanDto>>
- **Response schema:** `Task<ActionResult<DietPlanDto>>` with fields: { `Id`: Guid; `TenantId`: Guid; `CoachId`: Guid; `CoachName`: string?; `ClientId`: Guid; `ClientName`: string?; `Name`: string; `Description`: string?; `MealsPerDay`: int?; `StartDate`: DateTime; `EndDate`: DateTime?; `Status`: PlanStatus; `TargetCalories`: double?; `TargetProtein`: double?; `TargetCarbs`: double?; `TargetFats`: double?; `Meals`: List<DailyMealDto>; `PlanId`: Guid; `OrderIndex`: int; `Time`: string?; `Items`: List<MealItemDto>; `MealId`: Guid; `FoodId`: int; `FoodName`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/DietPlans/{id}` - `UpdateDietPlan`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateDietPlanCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/DietPlans/{id}/duplicate` - `DuplicateDietPlan`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `DuplicateDietPlanCommand?` { `Id`: Guid; `NewClientId`: Guid?; `NewName`: string? }<br>Handler signature: `Guid id, [FromBody] DuplicateDietPlanCommand? command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/DietPlans/{planId}/meals` - `CreateDailyMeal`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid planId, CreateDailyMealCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/DietPlans/meals/{mealId}` - `DeleteDailyMeal`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid mealId`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/DietPlans/meals/{mealId}` - `UpdateDailyMeal`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid mealId, UpdateDailyMealCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/DietPlans/meals/{mealId}/items` - `CreateMealItem`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid mealId, CreateMealItemCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/DietPlans/meals/items/{itemId}` - `DeleteMealItem`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid itemId`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/DietPlans/meals/items/{itemId}` - `UpdateMealItem`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid itemId, UpdateMealItemCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### Employees

#### `GET /api/Employees` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `branchId`: `Guid?`<br>Query `department`: `string?`<br>Query `isActive`: `bool?`<br>Query `searchTerm`: `string?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] string? department, [FromQuery] bool? isActive, [FromQuery] string? searchTerm`
- **Declared response:** Task<ActionResult<List<EmployeeDto>>>
- **Response schema:** `Task<ActionResult<List<EmployeeDto>>>` with fields: { `Id`: Guid; `UserId`: Guid; `Email`: string?; `PhoneNumber`: string?; `Role`: UserRole; `EmployeeCode`: string?; `JobTitle`: string?; `Department`: string?; `JoinDate`: DateTime; `TerminationDate`: DateTime?; `BaseSalary`: decimal; `SalaryType`: SalaryType; `HourlyRate`: decimal?; `BankAccount`: string?; `BankName`: string?; `NationalId`: string?; `EmergencyContactName`: string?; `EmergencyContactPhone`: string?; `Qualifications`: string?; `BranchIds`: List<Guid>; `QrCode`: string?; `QrGeneratedAt`: DateTime?; `QrRevokedAt`: DateTime? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Employees` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateEmployeeCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `PUT /api/Employees/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateEmployeeCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/Employees/{id}/qr/regenerate` - `RegenerateQr`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<object>>
- **Response schema:** `Task<ActionResult<object>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/Employees/{id}/qr/revoke` - `RevokeQr`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/Employees/{id}/terminate` - `Terminate`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `TerminateEmployeeCommand` { `Id`: Guid; `TerminationDate`: DateTime?; `Reason`: string? }<br>Handler signature: `Guid id, [FromBody] TerminateEmployeeCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### Equipment

#### `GET /api/Equipment` - `GetEquipment`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `branchId`: `Guid?`<br>Query `roomId`: `Guid?`<br>Query `status`: `EquipmentStatus?`<br>Query `searchTerm`: `string?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] Guid? roomId, [FromQuery] EquipmentStatus? status, [FromQuery] string? searchTerm`
- **Declared response:** typeof(List<EquipmentDto>), StatusCodes.Status200OK
- **Response schema:** `List<EquipmentDto>` with fields: { `Id`: Guid; `TenantId`: Guid; `BranchId`: Guid; `BranchName`: string?; `RoomId`: Guid?; `RoomName`: string?; `Name`: string; `SerialNumber`: string?; `Brand`: string?; `Model`: string?; `Category`: string?; `PurchaseDate`: DateTime?; `PurchasePrice`: decimal?; `Status`: EquipmentStatus; `WarrantyUntil`: DateTime?; `ImageUrl`: string?; `Notes`: string?; `OpenMaintenanceCount`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Equipment` - `CreateEquipment`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateEquipmentCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/Equipment/{id}` - `DeleteEquipment`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/Equipment/{id}` - `UpdateEquipment`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateEquipmentCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `PUT /api/Equipment/{id}/status` - `ChangeStatus`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id, ChangeEquipmentStatusCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

### Exercises

#### `GET /api/Exercises` - `GetExercises`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `targetMuscleId`: `int?`<br>Query `equipment`: `string?`<br>Query `isHighImpact`: `bool?`<br>Handler signature: `[FromQuery] int? targetMuscleId, [FromQuery] string? equipment, [FromQuery] bool? isHighImpact`
- **Declared response:** Task<ActionResult<List<ExerciseDto>>>
- **Response schema:** `Task<ActionResult<List<ExerciseDto>>>` with fields: { `Id`: int; `TenantId`: Guid?; `Name`: string; `NameAr`: string?; `Description`: string?; `DescriptionAr`: string?; `TargetMuscleId`: int; `TargetMuscleName`: string?; `TargetMuscleBodyPart`: string?; `PrimaryMuscleContributionPercent`: int; `SecondaryMuscles`: List<SecondaryMuscleDto>; `ImageUrl`: string?; `VideoUrl`: string?; `Icon`: string?; `Equipment`: string?; `IsHighImpact`: bool; `Difficulty`: string?; `Category`: string?; `MovementPattern`: string?; `Mechanic`: string?; `Force`: string?; `Instructions`: List<string>?; `InstructionsAr`: List<string>?; `Tips`: List<string>? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Exercises` - `CreateExercise`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Form `command`: `CreateExerciseCommand`<br>Handler signature: `[FromForm] CreateExerciseCommand command`
- **Declared response:** Task<ActionResult<int>>
- **Response schema:** `Task<ActionResult<int>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/Exercises/{id}` - `DeleteExercise`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `int id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `GET /api/Exercises/{id}` - `GetExercise`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `int id`
- **Declared response:** Task<ActionResult<ExerciseDto>>
- **Response schema:** `Task<ActionResult<ExerciseDto>>` with fields: { `Id`: int; `TenantId`: Guid?; `Name`: string; `NameAr`: string?; `Description`: string?; `DescriptionAr`: string?; `TargetMuscleId`: int; `TargetMuscleName`: string?; `TargetMuscleBodyPart`: string?; `PrimaryMuscleContributionPercent`: int; `SecondaryMuscles`: List<SecondaryMuscleDto>; `ImageUrl`: string?; `VideoUrl`: string?; `Icon`: string?; `Equipment`: string?; `IsHighImpact`: bool; `Difficulty`: string?; `Category`: string?; `MovementPattern`: string?; `Mechanic`: string?; `Force`: string?; `Instructions`: List<string>?; `InstructionsAr`: List<string>?; `Tips`: List<string>? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/Exercises/{id}` - `UpdateExercise`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Form `command`: `UpdateExerciseCommand`<br>Handler signature: `int id, [FromForm] UpdateExerciseCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### ExpenseCategories

#### `GET /api/ExpenseCategories` - `GetCategories`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<ExpenseCategoryDto>>>
- **Response schema:** `Task<ActionResult<List<ExpenseCategoryDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Name`: string; `Description`: string?; `ParentCategoryId`: Guid?; `ParentCategoryName`: string?; `IsActive`: bool; `ChildrenCount`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/ExpenseCategories` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateExpenseCategoryCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/ExpenseCategories/{id}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/ExpenseCategories/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateExpenseCategoryCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### Expenses

#### `GET /api/Expenses` - `GetExpenses`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `branchId`: `Guid?`<br>Query `categoryId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `searchTerm`: `string?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] Guid? categoryId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] string? searchTerm`
- **Declared response:** Task<ActionResult<List<ExpenseDto>>>
- **Response schema:** `Task<ActionResult<List<ExpenseDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `BranchId`: Guid?; `BranchName`: string?; `CategoryId`: Guid; `CategoryName`: string?; `Amount`: decimal; `ExpenseDate`: DateTime; `Description`: string; `VendorName`: string?; `PaymentMethod`: PaymentMethod?; `ReceiptImageUrl`: string?; `ReferenceNumber`: string?; `ApprovedById`: Guid?; `ApprovedByName`: string?; `ApprovedAt`: DateTime? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Expenses` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateExpenseCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/Expenses/{id}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/Expenses/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateExpenseCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### Foods

#### `GET /api/Foods` - `GetFoods`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `category`: `string?`<br>Query `searchTerm`: `string?`<br>Query `isVerified`: `bool?`<br>Handler signature: `[FromQuery] string? category, [FromQuery] string? searchTerm, [FromQuery] bool? isVerified`
- **Declared response:** Task<ActionResult<List<FoodDto>>>
- **Response schema:** `Task<ActionResult<List<FoodDto>>>` with fields: { `Id`: int; `TenantId`: Guid?; `Name`: string; `NameAr`: string?; `Category`: string?; `CaloriesPer100g`: double; `ProteinPer100g`: double; `CarbsPer100g`: double; `FatsPer100g`: double; `FiberPer100g`: double?; `SugarPer100g`: double?; `SodiumPer100g`: double?; `ServingSize`: double?; `ServingUnit`: string?; `AlternativeGroupId`: string?; `IsVerified`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Foods` - `CreateFood`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateFoodCommand command`
- **Declared response:** Task<ActionResult<int>>
- **Response schema:** `Task<ActionResult<int>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/Foods/{id}` - `DeleteFood`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `int id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `GET /api/Foods/{id}` - `GetFood`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `int id`
- **Declared response:** Task<ActionResult<FoodDto>>
- **Response schema:** `Task<ActionResult<FoodDto>>` with fields: { `Id`: int; `TenantId`: Guid?; `Name`: string; `NameAr`: string?; `Category`: string?; `CaloriesPer100g`: double; `ProteinPer100g`: double; `CarbsPer100g`: double; `FatsPer100g`: double; `FiberPer100g`: double?; `SugarPer100g`: double?; `SodiumPer100g`: double?; `ServingSize`: double?; `ServingUnit`: string?; `AlternativeGroupId`: string?; `IsVerified`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/Foods/{id}` - `UpdateFood`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `int id, UpdateFoodCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### FreelanceTeamApplications

#### `POST /api/freelance/team/applications` - `Sponsor`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `SponsorFreelanceMembershipCommand` { `IdentityEmail`: string; `RequestedRole`: UserRole; `FullName`: string }<br>Handler signature: `[FromBody] SponsorFreelanceMembershipCommand command`
- **Declared response:** typeof(ApplicationTrackingStatusDto), StatusCodes.Status201Created
- **Response schema:** `ApplicationTrackingStatusDto` with fields: { `WorkspaceType`: WorkspaceType; `WorkspaceName`: string; `WorkspaceIdentifier`: string; `OwnerFullName`: string; `BrandName`: string?; `LogoUrl`: string?; `PhotoUrl`: string?; `CoverImageUrl`: string?; `BackgroundImageUrl`: string?; `PrimaryColor`: string?; `SecondaryColor`: string?; `Bio`: string?; `DeliveryMode`: string?; `Specialties`: IReadOnlyList<string>; `Certifications`: IReadOnlyList<string>; `WelcomeMessage`: string?; `BookingSettings`: JsonElement?; `MustChangePassword`: bool; `ApplicationId`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `WorkspaceIdentifier`: string?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/freelance/team/invites` - `Invite`

- **Access:** JWT + Policy: `Permissions.ManageCoaches`
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `CreateWorkspaceInviteCommand` { `Email`: string; `RequestedRole`: UserRole }<br>Handler signature: `[FromBody] CreateWorkspaceInviteCommand command`
- **Declared response:** typeof(WorkspaceInviteCreatedDto), StatusCodes.Status201Created
- **Response schema:** `WorkspaceInviteCreatedDto` with fields: { `InviteId`: Guid; `EmailMasked`: string; `Role`: UserRole; `ExpiresAt`: DateTime }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### GateAccess

#### `POST /api/GateAccess/check-in-qr` - `CheckInByQr`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `GateCheckInByQrCommand command`
- **Declared response:** typeof(GateCheckInResultDto), StatusCodes.Status200OK
- **Response schema:** `GateCheckInResultDto` with fields: { `Id`: Guid; `ClientId`: Guid?; `ClientName`: string?; `BranchId`: Guid?; `BranchName`: string?; `AccessTime`: DateTime; `Result`: GateAccessResult; `Method`: GateAccessMethod; `DenyReason`: GateDenyReason; `Notes`: string?; `ScannedCode`: string?; `Granted`: bool; `Message`: string; `AttendanceId`: Guid? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `GET /api/GateAccess/logs` - `GetLogs`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `clientId`: `Guid?`<br>Query `branchId`: `Guid?`<br>Query `result`: `GateAccessResult?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `take`: `int`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] Guid? branchId, [FromQuery] GateAccessResult? result, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] int take = 200`
- **Declared response:** typeof(List<GateAccessLogDto>), StatusCodes.Status200OK
- **Response schema:** `List<GateAccessLogDto>` with fields: { `Id`: Guid; `ClientId`: Guid?; `ClientName`: string?; `BranchId`: Guid?; `BranchName`: string?; `AccessTime`: DateTime; `Result`: GateAccessResult; `Method`: GateAccessMethod; `DenyReason`: GateDenyReason; `Notes`: string?; `ScannedCode`: string?; `Granted`: bool; `Message`: string; `AttendanceId`: Guid? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/GateAccess/scan` - `Scan`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `qrCode`: `string`<br>Handler signature: `[FromQuery] string qrCode`
- **Declared response:** typeof(QrMemberLookupDto), StatusCodes.Status200OK
- **Response schema:** `QrMemberLookupDto` with fields: { `ClientId`: Guid; `ClientName`: string; `Email`: string?; `PhoneNumber`: string?; `ProfilePictureUrl`: string?; `MembershipCardId`: Guid; `CardNumber`: string; `CardActive`: bool; `CardExpiresAt`: DateTime?; `SubscriptionActive`: bool; `SubscriptionStatus`: string?; `PlanName`: string?; `SubscriptionStartDate`: DateTime?; `SubscriptionEndDate`: DateTime?; `RemainingAmount`: decimal? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### GroupClasses

#### `GET /api/GroupClasses` - `GetClasses`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `branchId`: `Guid?`<br>Query `isActive`: `bool?`<br>Query `category`: `string?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] bool? isActive, [FromQuery] string? category`
- **Declared response:** Task<ActionResult<List<GroupClassDto>>>
- **Response schema:** `Task<ActionResult<List<GroupClassDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `BranchId`: Guid?; `BranchName`: string?; `Name`: string; `Description`: string?; `Category`: string?; `DurationMinutes`: int; `Capacity`: int; `Color`: string?; `ImageUrl`: string?; `Price`: decimal?; `IsActive`: bool; `UpcomingSchedulesCount`: int; `GroupClassId`: Guid; `GroupClassName`: string?; `CoachId`: Guid?; `CoachName`: string?; `RoomId`: Guid?; `RoomName`: string?; `StartTime`: DateTime; `EndTime`: DateTime; `RecurrencePattern`: RecurrencePattern; `RecurrenceDaysOfWeek`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/GroupClasses` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateGroupClassCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/GroupClasses/{id}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/GroupClasses/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateGroupClassCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### GymProfile

#### `GET /api/GymProfile` - `GetProfile`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `GymProfile`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** typeof(GymProfileDto), StatusCodes.Status200OK<br>StatusCodes.Status404NotFound
- **Response schema:** `GymProfileDto` with fields: { `Id`: Guid; `Name`: string; `Subdomain`: string?; `Description`: string?; `Address`: string?; `PhoneNumber`: string?; `Email`: string?; `LogoUrl`: string?; `CoverImageUrl`: string?; `GalleryImages`: List<string>; `Status`: string; `BrandingSettings`: BrandingSettingsDto?; `Statistics`: GymStatisticsDto; `PrimaryColor`: string?; `SecondaryColor`: string?; `AccentColor`: string?; `BackgroundColor`: string?; `SurfaceColor`: string?; `SidebarColor`: string?; `HeaderColor`: string?; `AppName`: string?; `FontFamily`: string?; `LoginBackgroundUrl`: string?; `DashboardBannerUrl`: string? }<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/GymProfile` - `UpdateProfile`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `GymProfile`.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Body `command`: `UpdateGymProfileCommand` { `Name`: string?; `Description`: string?; `Address`: string?; `PhoneNumber`: string?; `Email`: string?; `LogoUrl`: string?; `CoverImageUrl`: string?; `GalleryImages`: List<string>?; `PrimaryColor`: string?; `SecondaryColor`: string?; `LogoDarkUrl`: string?; `LogoLightUrl`: string?; `LogoIconUrl`: string?; `FaviconUrl`: string?; `LoginBackgroundUrl`: string?; `DashboardBannerUrl`: string?; `PrimaryHoverColor`: string?; `PrimaryForegroundColor`: string?; `SecondaryHoverColor`: string?; `SecondaryForegroundColor`: string?; `AccentColor`: string?; `BackgroundColor`: string?; `SurfaceColor`: string?; `CardColor`: string? }<br>Handler signature: `[FromBody] UpdateGymProfileCommand command`
- **Declared response:** StatusCodes.Status204NoContent<br>StatusCodes.Status404NotFound
- **Response schema:** No response body declared.<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/GymProfile/assets` - `UploadBrandAsset`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `GymProfile`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Form `file`: `IFormFile`<br>Form `assetType`: `string`<br>Form `title`: `string?`<br>Form `altText`: `string?`<br>Handler signature: `[FromForm] IFormFile file, [FromForm] string assetType = "Gallery", [FromForm] string? title = null, [FromForm] string? altText = null`
- **Declared response:** Task<ActionResult<BrandAssetResponse>>
- **Response schema:** `Task<ActionResult<BrandAssetResponse>>` with fields: { `Url`: string; `Urls`: List<string>; `Id`: Guid; `AssetType`: string; `ImageUrl`: string; `SortOrder`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/GymProfile/assets/{id:guid}` - `DeleteBrandAsset`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `GymProfile`.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `POST /api/GymProfile/cover` - `UploadCover`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `GymProfile`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `IFormFile file`
- **Declared response:** typeof(UploadResponseDto), StatusCodes.Status200OK<br>StatusCodes.Status400BadRequest
- **Response schema:** `UploadResponseDto` with fields: { `Url`: string; `Urls`: List<string>; `Id`: Guid; `AssetType`: string; `ImageUrl`: string; `SortOrder`: int }<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/GymProfile/gallery` - `UploadGalleryImages`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `GymProfile`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Form `files`: `List<IFormFile>`<br>Handler signature: `[FromForm] List<IFormFile> files`
- **Declared response:** typeof(UploadMultipleResponseDto), StatusCodes.Status200OK<br>StatusCodes.Status400BadRequest
- **Response schema:** `UploadMultipleResponseDto` with fields: { `Url`: string; `Urls`: List<string>; `Id`: Guid; `AssetType`: string; `ImageUrl`: string; `SortOrder`: int }<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/GymProfile/logo` - `UploadLogo`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `GymProfile`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `IFormFile file`
- **Declared response:** typeof(UploadResponseDto), StatusCodes.Status200OK<br>StatusCodes.Status400BadRequest
- **Response schema:** `UploadResponseDto` with fields: { `Url`: string; `Urls`: List<string>; `Id`: Guid; `AssetType`: string; `ImageUrl`: string; `SortOrder`: int }<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### Identity

#### `POST /api/identity/application-tracking-sessions` - `ReissueApplicationTrackingSessions`

- **Access:** Anonymous (no token required)
- **Business purpose:** Identity, login, and session issuance/rotation.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `ReissueApplicationTrackingSessionsCommand` { `WorkspaceSelectionToken`: string }<br>Handler signature: `[FromBody] ReissueApplicationTrackingSessionsCommand command`
- **Declared response:** typeof(IReadOnlyList<ApplicationTrackingSessionDto>), StatusCodes.Status200OK
- **Response schema:** `IReadOnlyList<ApplicationTrackingSessionDto>` with fields: { `WorkspaceType`: WorkspaceType; `WorkspaceName`: string; `WorkspaceIdentifier`: string; `OwnerFullName`: string; `BrandName`: string?; `LogoUrl`: string?; `PhotoUrl`: string?; `CoverImageUrl`: string?; `BackgroundImageUrl`: string?; `PrimaryColor`: string?; `SecondaryColor`: string?; `Bio`: string?; `DeliveryMode`: string?; `Specialties`: IReadOnlyList<string>; `Certifications`: IReadOnlyList<string>; `WelcomeMessage`: string?; `BookingSettings`: JsonElement?; `MustChangePassword`: bool; `ApplicationId`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `WorkspaceIdentifier`: string?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string> }
- **Failure contract:** 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/identity/login` - `Login`

- **Access:** Anonymous (no token required)
- **Business purpose:** Identity, login, and session issuance/rotation.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `IdentitySignInCommand` { `Email`: string; `Password`: string }<br>Handler signature: `[FromBody] IdentitySignInCommand command`
- **Declared response:** typeof(IdentitySignInDto), StatusCodes.Status200OK
- **Response schema:** `IdentitySignInDto` with fields: { `WorkspaceId`: Guid; `Name`: string; `Identifier`: string?; `WorkspaceType`: WorkspaceType; `WorkspaceStatus`: TenantStatus; `Role`: UserRole; `ApplicationId`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `SubmittedAt`: DateTime?; `WorkspaceIdentifier`: string?; `PaymentStatus`: PaymentRequestStatus?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `DatabaseStatusCode`: string?; `ProvisioningStatus`: ProvisioningJobStatus?; `CanAccessDashboard`: bool; `RequiredAction`: string?; `NextStep`: string?; `UserMessage`: string?; `LastUpdatedAtUtc`: DateTime?; `WorkspaceSelectionToken`: string; `ExpiresAt`: DateTime; `ActiveWorkspaces`: IReadOnlyList<IdentityWorkspaceDto> }
- **Failure contract:** 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/identity/password-reset` - `RequestPasswordReset`

- **Access:** Anonymous (no token required)
- **Business purpose:** Identity, login, and session issuance/rotation.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `command`: `RequestIdentityPasswordResetCommand` { `Email`: string }<br>Handler signature: `[FromBody] RequestIdentityPasswordResetCommand command`
- **Declared response:** StatusCodes.Status202Accepted
- **Response schema:** No response body declared.
- **Failure contract:** 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/identity/password-reset/confirm` - `ResetPassword`

- **Access:** Anonymous (no token required)
- **Business purpose:** Identity, login, and session issuance/rotation.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `command`: `ResetIdentityPasswordCommand` { `Token`: string; `NewPassword`: string }<br>Handler signature: `[FromBody] ResetIdentityPasswordCommand command`
- **Declared response:** StatusCodes.Status204NoContent
- **Response schema:** No response body declared.
- **Failure contract:** 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/identity/register` - `Register`

- **Access:** Anonymous (no token required)
- **Business purpose:** Identity, login, and session issuance/rotation.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `RegisterIdentityCommand` { `FullName`: string; `Email`: string; `Password`: string; `PhoneNumber`: string? }<br>Handler signature: `[FromBody] RegisterIdentityCommand command`
- **Declared response:** StatusCodes.Status202Accepted
- **Response schema:** No response body declared.
- **Failure contract:** 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/identity/select-workspace` - `SelectWorkspace`

- **Access:** Anonymous (no token required)
- **Business purpose:** Identity, login, and session issuance/rotation.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `SelectIdentityWorkspaceCommand` { `WorkspaceSelectionToken`: string; `WorkspaceId`: Guid }<br>Handler signature: `[FromBody] SelectIdentityWorkspaceCommand command`
- **Declared response:** typeof(AuthResponseDto), StatusCodes.Status200OK
- **Response schema:** `AuthResponseDto` with fields: { `UserId`: Guid; `Email`: string?; `PhoneNumber`: string?; `FullName`: string?; `Role`: string; `Roles`: IReadOnlyList<string>; `Permissions`: IReadOnlyList<string>; `TenantId`: Guid; `AccessToken`: string; `ExpiresAt`: DateTime; `MustChangePassword`: bool }
- **Failure contract:** 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/identity/verify-email` - `VerifyEmail`

- **Access:** Anonymous (no token required)
- **Business purpose:** Identity, login, and session issuance/rotation.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `VerifyIdentityEmailCommand` { `Token`: string }<br>Handler signature: `[FromBody] VerifyIdentityEmailCommand command`
- **Declared response:** StatusCodes.Status204NoContent
- **Response schema:** No response body declared.
- **Failure contract:** 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### Invoices

#### `GET /api/Invoices` - `GetInvoices`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `clientId`: `Guid?`<br>Query `branchId`: `Guid?`<br>Query `status`: `InvoiceStatus?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] Guid? branchId, [FromQuery] InvoiceStatus? status, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<InvoiceDto>>>
- **Response schema:** `Task<ActionResult<List<InvoiceDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `InvoiceNumber`: string; `ClientId`: Guid?; `ClientName`: string?; `BranchId`: Guid?; `BranchName`: string?; `IssueDate`: DateTime; `DueDate`: DateTime?; `Subtotal`: decimal; `TaxAmount`: decimal; `DiscountAmount`: decimal; `Total`: decimal; `AmountPaid`: decimal; `RemainingAmount`: decimal; `Status`: InvoiceStatus; `CouponId`: Guid?; `CouponCode`: string?; `Notes`: string?; `PdfUrl`: string?; `Items`: List<InvoiceItemDto>; `Payments`: List<InvoicePaymentDto>; `ItemType`: InvoiceItemType; `ReferenceId`: Guid? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Invoices` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateInvoiceCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `GET /api/Invoices/{id}` - `GetInvoice`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<InvoiceDto>>
- **Response schema:** `Task<ActionResult<InvoiceDto>>` with fields: { `Id`: Guid; `TenantId`: Guid; `InvoiceNumber`: string; `ClientId`: Guid?; `ClientName`: string?; `BranchId`: Guid?; `BranchName`: string?; `IssueDate`: DateTime; `DueDate`: DateTime?; `Subtotal`: decimal; `TaxAmount`: decimal; `DiscountAmount`: decimal; `Total`: decimal; `AmountPaid`: decimal; `RemainingAmount`: decimal; `Status`: InvoiceStatus; `CouponId`: Guid?; `CouponCode`: string?; `Notes`: string?; `PdfUrl`: string?; `Items`: List<InvoiceItemDto>; `Payments`: List<InvoicePaymentDto>; `ItemType`: InvoiceItemType; `ReferenceId`: Guid? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Invoices/{id}/cancel` - `Cancel`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `CancelInvoiceCommand` { `Id`: Guid; `Reason`: string? }<br>Handler signature: `Guid id, [FromBody] CancelInvoiceCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/Invoices/{id}/issue` - `Issue`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### Leaves

#### `GET /api/Leaves` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `employeeId`: `Guid?`<br>Query `status`: `LeaveStatus?`<br>Query `leaveType`: `LeaveType?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? employeeId, [FromQuery] LeaveStatus? status, [FromQuery] LeaveType? leaveType, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<LeaveRequestDto>>>
- **Response schema:** `Task<ActionResult<List<LeaveRequestDto>>>` with fields: { `Id`: Guid; `EmployeeId`: Guid; `EmployeeName`: string?; `FromDate`: DateTime; `ToDate`: DateTime; `LeaveType`: LeaveType; `Reason`: string?; `Status`: LeaveStatus; `ReviewedById`: Guid?; `ReviewedByName`: string?; `ReviewedAt`: DateTime?; `ReviewNotes`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Leaves` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateLeaveRequestCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/Leaves/{id}/review` - `Review`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `ReviewLeaveRequestCommand` { `Id`: Guid; `Decision`: LeaveStatus; `Notes`: string? }<br>Handler signature: `Guid id, [FromBody] ReviewLeaveRequestCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### Maintenance

#### `GET /api/Maintenance` - `GetRecords`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Background jobs, Outbox messages, and operational monitoring.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `equipmentId`: `Guid?`<br>Query `status`: `MaintenanceStatus?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? equipmentId, [FromQuery] MaintenanceStatus? status, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** typeof(List<MaintenanceRecordDto>), StatusCodes.Status200OK
- **Response schema:** `List<MaintenanceRecordDto>` with fields: { `Id`: Guid; `TenantId`: Guid; `EquipmentId`: Guid; `EquipmentName`: string?; `IssueDate`: DateTime; `ResolvedDate`: DateTime?; `Cost`: decimal?; `Description`: string; `TechnicianName`: string?; `TechnicianContact`: string?; `Status`: MaintenanceStatus; `ResolutionNotes`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Maintenance` - `CreateMaintenance`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Background jobs, Outbox messages, and operational monitoring.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateMaintenanceCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/Maintenance/{id}/resolve` - `Resolve`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Background jobs, Outbox messages, and operational monitoring.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid id, ResolveMaintenanceCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### MealLogs

#### `GET /api/meal-logs` - `GetMealLogs`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `date`: `DateTime?`<br>Handler signature: `[FromQuery] DateTime? date`
- **Declared response:** typeof(List<MealLogDto>), StatusCodes.Status200OK
- **Response schema:** `List<MealLogDto>` with fields: { `Id`: Guid; `MealItemId`: Guid; `MealName`: string; `FoodName`: string; `Unit`: string?; `IsAlternative`: bool; `ConsumedQuantity`: double; `ConsumedAt`: DateTime; `Calories`: double; `Protein`: double; `Carbs`: double; `Fats`: double }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/meal-logs` - `LogMeal`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `LogMealCommand` { `MealItemId`: Guid; `ConsumedQuantity`: double; `ConsumedAt`: DateTime?; `AlternativeFoodId`: int? }<br>Handler signature: `[FromBody] LogMealCommand command`
- **Declared response:** typeof(Guid), StatusCodes.Status201Created
- **Response schema:** `Guid`; concrete properties are not declared in a discoverable DTO.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/meal-logs/{id}` - `Delete`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `GET /api/meal-logs/summary` - `GetSummary`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `date`: `DateTime?`<br>Handler signature: `[FromQuery] DateTime? date`
- **Declared response:** typeof(NutritionSummaryDto), StatusCodes.Status200OK
- **Response schema:** `NutritionSummaryDto` with fields: { `Date`: DateTime; `LoggedCount`: int; `ConsumedCalories`: double; `ConsumedProtein`: double; `ConsumedCarbs`: double; `ConsumedFats`: double; `TargetCalories`: double; `TargetProtein`: double; `TargetCarbs`: double; `TargetFats`: double }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### Media

#### `GET /api/media/object` - `GetObject`

- **Access:** JWT required
- **Business purpose:** LogicFit API module `Media`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `key`: `string`<br>Handler signature: `[FromQuery] string key`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### MembershipCards

#### `GET /api/MembershipCards` - `GetCards`

- **Access:** JWT + Policy: `Permissions.ManageMembers`
- **Business purpose:** LogicFit API module `MembershipCards`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `clientId`: `Guid?`<br>Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] bool? isActive`
- **Declared response:** typeof(List<MembershipCardDto>), StatusCodes.Status200OK
- **Response schema:** `List<MembershipCardDto>` with fields: { `Id`: Guid; `TenantId`: Guid; `ClientId`: Guid; `ClientName`: string?; `CardNumber`: string; `QrCode`: string; `IsActive`: bool; `IssuedAt`: DateTime; `ExpiresAt`: DateTime?; `RevokedAt`: DateTime?; `RevokedReason`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/MembershipCards/{id}/revoke` - `RevokeCard`

- **Access:** JWT + Policy: `Permissions.ManageMembers`
- **Business purpose:** LogicFit API module `MembershipCards`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `RevokeMembershipCardCommand` { `Id`: Guid; `Reason`: string? }<br>Handler signature: `Guid id, [FromBody] RevokeMembershipCardCommand command`
- **Declared response:** StatusCodes.Status204NoContent
- **Response schema:** No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/MembershipCards/issue` - `IssueCard`

- **Access:** JWT + Policy: `Permissions.ManageMembers`
- **Business purpose:** LogicFit API module `MembershipCards`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `IssueMembershipCardCommand command`
- **Declared response:** typeof(Guid), StatusCodes.Status200OK
- **Response schema:** `Guid`; concrete properties are not declared in a discoverable DTO.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### Muscles

#### `GET /api/Muscles` - `GetMuscles`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `bodyPart`: `string?`<br>Handler signature: `[FromQuery] string? bodyPart`
- **Declared response:** typeof(List<MuscleDto>), StatusCodes.Status200OK
- **Response schema:** `List<MuscleDto>` with fields: { `Id`: int; `Name`: string; `NameAr`: string?; `BodyPart`: string?; `Description`: string?; `DescriptionAr`: string?; `Icon`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Muscles` - `CreateMuscle`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `CreateMuscleCommand` { `Name`: string; `NameAr`: string?; `BodyPart`: string?; `Description`: string?; `DescriptionAr`: string?; `Icon`: string? }<br>Handler signature: `[FromBody] CreateMuscleCommand command`
- **Declared response:** typeof(MuscleDto), StatusCodes.Status201Created<br>StatusCodes.Status400BadRequest
- **Response schema:** `MuscleDto` with fields: { `Id`: int; `Name`: string; `NameAr`: string?; `BodyPart`: string?; `Description`: string?; `DescriptionAr`: string?; `Icon`: string? }<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/Muscles/{id}` - `DeleteMuscle`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `int id`
- **Declared response:** StatusCodes.Status204NoContent<br>StatusCodes.Status400BadRequest<br>StatusCodes.Status404NotFound
- **Response schema:** No response body declared.<br>No response body declared.<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `GET /api/Muscles/{id}` - `GetMuscle`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `int id`
- **Declared response:** typeof(MuscleDto), StatusCodes.Status200OK<br>StatusCodes.Status404NotFound
- **Response schema:** `MuscleDto` with fields: { `Id`: int; `Name`: string; `NameAr`: string?; `BodyPart`: string?; `Description`: string?; `DescriptionAr`: string?; `Icon`: string? }<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/Muscles/{id}` - `UpdateMuscle`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Body `command`: `UpdateMuscleCommand` { `Id`: int; `Name`: string; `NameAr`: string?; `BodyPart`: string?; `Description`: string?; `DescriptionAr`: string?; `Icon`: string? }<br>Handler signature: `int id, [FromBody] UpdateMuscleCommand command`
- **Declared response:** typeof(MuscleDto), StatusCodes.Status200OK<br>StatusCodes.Status400BadRequest<br>StatusCodes.Status404NotFound
- **Response schema:** `MuscleDto` with fields: { `Id`: int; `Name`: string; `NameAr`: string?; `BodyPart`: string?; `Description`: string?; `DescriptionAr`: string?; `Icon`: string? }<br>No response body declared.<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### Notifications

#### `GET /api/Notifications` - `GetMyNotifications`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `isRead`: `bool?`<br>Query `type`: `NotificationType?`<br>Handler signature: `[FromQuery] bool? isRead, [FromQuery] NotificationType? type`
- **Declared response:** Task<ActionResult<List<NotificationDto>>>
- **Response schema:** `Task<ActionResult<List<NotificationDto>>>` with fields: { `Id`: Guid; `SenderId`: Guid; `SenderName`: string?; `RecipientId`: Guid; `RecipientName`: string?; `Title`: string; `Body`: string; `Type`: NotificationType; `IsRead`: bool; `ReadAt`: DateTime?; `CreatedAt`: DateTime }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Notifications` - `SendNotification`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `SendNotificationCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `PUT /api/Notifications/{id}/read` - `MarkAsRead`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/Notifications/bulk` - `SendBulkNotification`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `SendBulkNotificationCommand command`
- **Declared response:** Task<ActionResult<int>>
- **Response schema:** `Task<ActionResult<int>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `PUT /api/Notifications/read-all` - `MarkAllAsRead`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<int>>
- **Response schema:** `Task<ActionResult<int>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `GET /api/Notifications/unread-count` - `GetUnreadCount`

- **Access:** JWT required
- **Business purpose:** Communication, notifications, and challenges.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<int>>
- **Response schema:** `Task<ActionResult<int>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### Payments

#### `GET /api/Payments` - `GetPayments`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `clientId`: `Guid?`<br>Query `branchId`: `Guid?`<br>Query `invoiceId`: `Guid?`<br>Query `subscriptionId`: `Guid?`<br>Query `method`: `PaymentMethod?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] Guid? branchId, [FromQuery] Guid? invoiceId, [FromQuery] Guid? subscriptionId, [FromQuery] PaymentMethod? method, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<PaymentDto>>>
- **Response schema:** `Task<ActionResult<List<PaymentDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `InvoiceId`: Guid?; `InvoiceNumber`: string?; `SubscriptionId`: Guid?; `BranchId`: Guid?; `BranchName`: string?; `ClientId`: Guid?; `ClientName`: string?; `Amount`: decimal; `Method`: PaymentMethod; `ReceivedAt`: DateTime; `ReceivedByName`: string?; `ReceiptNumber`: string?; `Notes`: string?; `ReferenceNumber`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Payments` - `Record`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `RecordPaymentCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### Payroll

#### `GET /api/Payroll` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `year`: `int?`<br>Query `month`: `int?`<br>Query `branchId`: `Guid?`<br>Query `status`: `PayrollStatus?`<br>Handler signature: `[FromQuery] int? year, [FromQuery] int? month, [FromQuery] Guid? branchId, [FromQuery] PayrollStatus? status`
- **Declared response:** Task<ActionResult<List<PayrollRunDto>>>
- **Response schema:** `Task<ActionResult<List<PayrollRunDto>>>` with fields: { `Id`: Guid; `BranchId`: Guid?; `BranchName`: string?; `Month`: int; `Year`: int; `Status`: PayrollStatus; `TotalAmount`: decimal; `ApprovedAt`: DateTime?; `PaidAt`: DateTime?; `Notes`: string?; `ItemsCount`: int; `Items`: List<PayrollItemDto>; `EmployeeId`: Guid; `EmployeeName`: string?; `BaseSalary`: decimal; `CommissionTotal`: decimal; `Bonus`: decimal; `Deductions`: decimal; `NetSalary`: decimal }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Payroll/{id}/approve` - `Approve`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/Payroll/{id}/pay` - `Pay`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/Payroll/generate` - `Generate`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `GeneratePayrollCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `PUT /api/Payroll/items/{id}` - `UpdateItem`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdatePayrollItemCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### ProductCategories

#### `GET /api/ProductCategories` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<ProductCategoryDto>>>
- **Response schema:** `Task<ActionResult<List<ProductCategoryDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `CategoryId`: Guid?; `CategoryName`: string?; `Name`: string; `Description`: string?; `Sku`: string?; `Barcode`: string?; `CostPrice`: decimal; `SellingPrice`: decimal; `TaxRate`: decimal; `Unit`: string?; `ImageUrl`: string?; `IsActive`: bool; `MinStockLevel`: int; `TrackStock`: bool; `TotalStock`: decimal; `ParentCategoryId`: Guid?; `ParentCategoryName`: string?; `ProductsCount`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/ProductCategories` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateProductCategoryCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/ProductCategories/{id}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/ProductCategories/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateProductCategoryCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### Products

#### `GET /api/Products` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `categoryId`: `Guid?`<br>Query `isActive`: `bool?`<br>Query `searchTerm`: `string?`<br>Query `lowStockOnly`: `bool?`<br>Query `branchId`: `Guid?`<br>Handler signature: `[FromQuery] Guid? categoryId, [FromQuery] bool? isActive, [FromQuery] string? searchTerm, [FromQuery] bool? lowStockOnly, [FromQuery] Guid? branchId`
- **Declared response:** Task<ActionResult<List<ProductDto>>>
- **Response schema:** `Task<ActionResult<List<ProductDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `CategoryId`: Guid?; `CategoryName`: string?; `Name`: string; `Description`: string?; `Sku`: string?; `Barcode`: string?; `CostPrice`: decimal; `SellingPrice`: decimal; `TaxRate`: decimal; `Unit`: string?; `ImageUrl`: string?; `IsActive`: bool; `MinStockLevel`: int; `TrackStock`: bool; `TotalStock`: decimal; `ParentCategoryId`: Guid?; `ParentCategoryName`: string?; `ProductsCount`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Products` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateProductCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/Products/{id}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/Products/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateProductCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### Profile

#### `GET /api/Profile` - `GetMyProfile`

- **Access:** JWT required
- **Business purpose:** LogicFit API module `Profile`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** typeof(UserDto), StatusCodes.Status200OK<br>StatusCodes.Status401Unauthorized<br>StatusCodes.Status404NotFound
- **Response schema:** `UserDto` with fields: { `Id`: Guid; `TenantId`: Guid; `Email`: string; `PhoneNumber`: string?; `Role`: UserRole; `IsActive`: bool; `WalletBalance`: decimal; `Profile`: UserProfileDto?; `FullName`: string?; `ProfilePictureUrl`: string?; `Gender`: int?; `BirthDate`: DateTime?; `HeightCm`: double?; `WeightKg`: double?; `ActivityLevel`: string?; `FitnessGoal`: string?; `MedicalHistory`: string?; `Password`: string }<br>No response body declared.<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/Profile` - `UpdateMyProfile`

- **Access:** JWT required
- **Business purpose:** LogicFit API module `Profile`.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `UpdateMyProfileCommand command`
- **Declared response:** StatusCodes.Status204NoContent<br>StatusCodes.Status401Unauthorized<br>StatusCodes.Status404NotFound
- **Response schema:** No response body declared.<br>No response body declared.<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `DELETE /api/Profile/picture` - `DeleteProfilePicture`

- **Access:** JWT required
- **Business purpose:** LogicFit API module `Profile`.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** No request input.
- **Declared response:** StatusCodes.Status204NoContent<br>StatusCodes.Status401Unauthorized<br>StatusCodes.Status404NotFound
- **Response schema:** No response body declared.<br>No response body declared.<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `POST /api/Profile/picture` - `UploadProfilePicture`

- **Access:** JWT required
- **Business purpose:** LogicFit API module `Profile`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `IFormFile file`
- **Declared response:** typeof(UploadProfilePictureResponse), StatusCodes.Status200OK<br>StatusCodes.Status400BadRequest<br>StatusCodes.Status401Unauthorized
- **Response schema:** `UploadProfilePictureResponse` with fields: { `Url`: string }<br>No response body declared.<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### Reports

#### `GET /api/Reports/branch-comparison` - `GetBranchComparisonReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** typeof(BranchComparisonReportDto), StatusCodes.Status200OK
- **Response schema:** `BranchComparisonReportDto` with fields: { `ActiveMembers`: int; `TodayCheckIns`: int; `CurrentlyInsideCount`: int; `ExpiringSubscriptionsIn7Days`: int; `ExpiredSubscriptions`: int; `MonthRevenue`: decimal; `MonthExpenses`: decimal; `TodayRevenue`: decimal; `TodayExpenses`: decimal; `LowStockProductsCount`: int; `EquipmentUnderMaintenanceCount`: int; `PendingLeaveRequestsCount`: int; `UnpaidInvoicesCount`: int; `UnpaidInvoicesTotal`: decimal; `BranchKpis`: List<BranchKpiDto>; `BranchId`: Guid; `BranchName`: string; `Capacity`: int?; `CurrentlyInside`: int; `FromDate`: DateTime; `ToDate`: DateTime; `TotalExpenses`: decimal; `ExpensesCount`: int; `ByCategory`: List<ExpenseByCategoryDto> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Reports/class-attendance` - `GetClassAttendanceReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `branchId`: `Guid?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] Guid? branchId`
- **Declared response:** typeof(ClassAttendanceReportDto), StatusCodes.Status200OK
- **Response schema:** `ClassAttendanceReportDto` with fields: { `ActiveMembers`: int; `TodayCheckIns`: int; `CurrentlyInsideCount`: int; `ExpiringSubscriptionsIn7Days`: int; `ExpiredSubscriptions`: int; `MonthRevenue`: decimal; `MonthExpenses`: decimal; `TodayRevenue`: decimal; `TodayExpenses`: decimal; `LowStockProductsCount`: int; `EquipmentUnderMaintenanceCount`: int; `PendingLeaveRequestsCount`: int; `UnpaidInvoicesCount`: int; `UnpaidInvoicesTotal`: decimal; `BranchKpis`: List<BranchKpiDto>; `BranchId`: Guid; `BranchName`: string; `Capacity`: int?; `CurrentlyInside`: int; `FromDate`: DateTime; `ToDate`: DateTime; `TotalExpenses`: decimal; `ExpensesCount`: int; `ByCategory`: List<ExpenseByCategoryDto> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Reports/clients` - `GetClientsReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** typeof(ClientsReportDto), StatusCodes.Status200OK
- **Response schema:** `ClientsReportDto` with fields: { `TotalClients`: int; `ActiveClients`: int; `NewClientsThisMonth`: int; `TotalCoaches`: int; `ActiveSubscriptions`: int; `ExpiringSubscriptions`: int; `TotalRevenueThisMonth`: decimal; `TotalRevenueLastMonth`: decimal; `TotalWorkoutsThisMonth`: int; `TotalDietPlansActive`: int; `InactiveClients`: int; `ClientsWithActiveSubscription`: int; `ClientsWithoutSubscription`: int; `TopClients`: List<ClientSummaryDto>; `MonthlyTrend`: List<MonthlyClientDto>; `Id`: Guid; `Name`: string; `PhoneNumber`: string?; `TotalSessions`: int; `TotalPaid`: decimal; `Month`: string; `NewClients`: int; `ChurnedClients`: int; `TotalSubscriptions`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Reports/coach/dashboard` - `GetCoachDashboardReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `coachId`: `Guid?`<br>Handler signature: `[FromQuery] Guid? coachId`
- **Declared response:** typeof(CoachDashboardReportDto), StatusCodes.Status200OK
- **Response schema:** `CoachDashboardReportDto` with fields: { `TotalClients`: int; `ActiveClients`: int; `NewClientsThisMonth`: int; `TotalCoaches`: int; `ActiveSubscriptions`: int; `ExpiringSubscriptions`: int; `TotalRevenueThisMonth`: decimal; `TotalRevenueLastMonth`: decimal; `TotalWorkoutsThisMonth`: int; `TotalDietPlansActive`: int; `InactiveClients`: int; `ClientsWithActiveSubscription`: int; `ClientsWithoutSubscription`: int; `TopClients`: List<ClientSummaryDto>; `MonthlyTrend`: List<MonthlyClientDto>; `Id`: Guid; `Name`: string; `PhoneNumber`: string?; `TotalSessions`: int; `TotalPaid`: decimal; `Month`: string; `NewClients`: int; `ChurnedClients`: int; `TotalSubscriptions`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Reports/coach/trainee/{clientId}` - `GetTraineeProgressReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid clientId`
- **Declared response:** typeof(TraineeProgressReportDto), StatusCodes.Status200OK
- **Response schema:** `TraineeProgressReportDto` with fields: { `TotalClients`: int; `ActiveClients`: int; `NewClientsThisMonth`: int; `TotalCoaches`: int; `ActiveSubscriptions`: int; `ExpiringSubscriptions`: int; `TotalRevenueThisMonth`: decimal; `TotalRevenueLastMonth`: decimal; `TotalWorkoutsThisMonth`: int; `TotalDietPlansActive`: int; `InactiveClients`: int; `ClientsWithActiveSubscription`: int; `ClientsWithoutSubscription`: int; `TopClients`: List<ClientSummaryDto>; `MonthlyTrend`: List<MonthlyClientDto>; `Id`: Guid; `Name`: string; `PhoneNumber`: string?; `TotalSessions`: int; `TotalPaid`: decimal; `Month`: string; `NewClients`: int; `ChurnedClients`: int; `TotalSubscriptions`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Reports/coach/trainees` - `GetCoachTraineesReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `coachId`: `Guid?`<br>Handler signature: `[FromQuery] Guid? coachId`
- **Declared response:** typeof(CoachTraineesReportDto), StatusCodes.Status200OK
- **Response schema:** `CoachTraineesReportDto` with fields: { `TotalClients`: int; `ActiveClients`: int; `NewClientsThisMonth`: int; `TotalCoaches`: int; `ActiveSubscriptions`: int; `ExpiringSubscriptions`: int; `TotalRevenueThisMonth`: decimal; `TotalRevenueLastMonth`: decimal; `TotalWorkoutsThisMonth`: int; `TotalDietPlansActive`: int; `InactiveClients`: int; `ClientsWithActiveSubscription`: int; `ClientsWithoutSubscription`: int; `TopClients`: List<ClientSummaryDto>; `MonthlyTrend`: List<MonthlyClientDto>; `Id`: Guid; `Name`: string; `PhoneNumber`: string?; `TotalSessions`: int; `TotalPaid`: decimal; `Month`: string; `NewClients`: int; `ChurnedClients`: int; `TotalSubscriptions`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Reports/commissions` - `GetCommissionReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `employeeId`: `Guid?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] Guid? employeeId`
- **Declared response:** typeof(CommissionReportDto), StatusCodes.Status200OK
- **Response schema:** `CommissionReportDto` with fields: { `ActiveMembers`: int; `TodayCheckIns`: int; `CurrentlyInsideCount`: int; `ExpiringSubscriptionsIn7Days`: int; `ExpiredSubscriptions`: int; `MonthRevenue`: decimal; `MonthExpenses`: decimal; `TodayRevenue`: decimal; `TodayExpenses`: decimal; `LowStockProductsCount`: int; `EquipmentUnderMaintenanceCount`: int; `PendingLeaveRequestsCount`: int; `UnpaidInvoicesCount`: int; `UnpaidInvoicesTotal`: decimal; `BranchKpis`: List<BranchKpiDto>; `BranchId`: Guid; `BranchName`: string; `Capacity`: int?; `CurrentlyInside`: int; `FromDate`: DateTime; `ToDate`: DateTime; `TotalExpenses`: decimal; `ExpensesCount`: int; `ByCategory`: List<ExpenseByCategoryDto> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Reports/dashboard` - `GetDashboardReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** typeof(DashboardReportDto), StatusCodes.Status200OK
- **Response schema:** `DashboardReportDto` with fields: { `TotalClients`: int; `ActiveClients`: int; `NewClientsThisMonth`: int; `TotalCoaches`: int; `ActiveSubscriptions`: int; `ExpiringSubscriptions`: int; `TotalRevenueThisMonth`: decimal; `TotalRevenueLastMonth`: decimal; `TotalWorkoutsThisMonth`: int; `TotalDietPlansActive`: int; `InactiveClients`: int; `ClientsWithActiveSubscription`: int; `ClientsWithoutSubscription`: int; `TopClients`: List<ClientSummaryDto>; `MonthlyTrend`: List<MonthlyClientDto>; `Id`: Guid; `Name`: string; `PhoneNumber`: string?; `TotalSessions`: int; `TotalPaid`: decimal; `Month`: string; `NewClients`: int; `ChurnedClients`: int; `TotalSubscriptions`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Reports/equipment-utilization` - `GetEquipmentUtilizationReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `branchId`: `Guid?`<br>Handler signature: `[FromQuery] Guid? branchId`
- **Declared response:** typeof(EquipmentUtilizationReportDto), StatusCodes.Status200OK
- **Response schema:** `EquipmentUtilizationReportDto` with fields: { `ActiveMembers`: int; `TodayCheckIns`: int; `CurrentlyInsideCount`: int; `ExpiringSubscriptionsIn7Days`: int; `ExpiredSubscriptions`: int; `MonthRevenue`: decimal; `MonthExpenses`: decimal; `TodayRevenue`: decimal; `TodayExpenses`: decimal; `LowStockProductsCount`: int; `EquipmentUnderMaintenanceCount`: int; `PendingLeaveRequestsCount`: int; `UnpaidInvoicesCount`: int; `UnpaidInvoicesTotal`: decimal; `BranchKpis`: List<BranchKpiDto>; `BranchId`: Guid; `BranchName`: string; `Capacity`: int?; `CurrentlyInside`: int; `FromDate`: DateTime; `ToDate`: DateTime; `TotalExpenses`: decimal; `ExpensesCount`: int; `ByCategory`: List<ExpenseByCategoryDto> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Reports/expenses` - `GetExpensesReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `branchId`: `Guid?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] Guid? branchId`
- **Declared response:** typeof(ExpensesReportDto), StatusCodes.Status200OK
- **Response schema:** `ExpensesReportDto` with fields: { `ActiveMembers`: int; `TodayCheckIns`: int; `CurrentlyInsideCount`: int; `ExpiringSubscriptionsIn7Days`: int; `ExpiredSubscriptions`: int; `MonthRevenue`: decimal; `MonthExpenses`: decimal; `TodayRevenue`: decimal; `TodayExpenses`: decimal; `LowStockProductsCount`: int; `EquipmentUnderMaintenanceCount`: int; `PendingLeaveRequestsCount`: int; `UnpaidInvoicesCount`: int; `UnpaidInvoicesTotal`: decimal; `BranchKpis`: List<BranchKpiDto>; `BranchId`: Guid; `BranchName`: string; `Capacity`: int?; `CurrentlyInside`: int; `FromDate`: DateTime; `ToDate`: DateTime; `TotalExpenses`: decimal; `ExpensesCount`: int; `ByCategory`: List<ExpenseByCategoryDto> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Reports/financial` - `GetFinancialReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** typeof(FinancialReportDto), StatusCodes.Status200OK
- **Response schema:** `FinancialReportDto` with fields: { `TotalClients`: int; `ActiveClients`: int; `NewClientsThisMonth`: int; `TotalCoaches`: int; `ActiveSubscriptions`: int; `ExpiringSubscriptions`: int; `TotalRevenueThisMonth`: decimal; `TotalRevenueLastMonth`: decimal; `TotalWorkoutsThisMonth`: int; `TotalDietPlansActive`: int; `InactiveClients`: int; `ClientsWithActiveSubscription`: int; `ClientsWithoutSubscription`: int; `TopClients`: List<ClientSummaryDto>; `MonthlyTrend`: List<MonthlyClientDto>; `Id`: Guid; `Name`: string; `PhoneNumber`: string?; `TotalSessions`: int; `TotalPaid`: decimal; `Month`: string; `NewClients`: int; `ChurnedClients`: int; `TotalSubscriptions`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Reports/operations-dashboard` - `GetOperationsDashboard`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** typeof(OperationsDashboardDto), StatusCodes.Status200OK
- **Response schema:** `OperationsDashboardDto` with fields: { `ActiveMembers`: int; `TodayCheckIns`: int; `CurrentlyInsideCount`: int; `ExpiringSubscriptionsIn7Days`: int; `ExpiredSubscriptions`: int; `MonthRevenue`: decimal; `MonthExpenses`: decimal; `TodayRevenue`: decimal; `TodayExpenses`: decimal; `LowStockProductsCount`: int; `EquipmentUnderMaintenanceCount`: int; `PendingLeaveRequestsCount`: int; `UnpaidInvoicesCount`: int; `UnpaidInvoicesTotal`: decimal; `BranchKpis`: List<BranchKpiDto>; `BranchId`: Guid; `BranchName`: string; `Capacity`: int?; `CurrentlyInside`: int; `FromDate`: DateTime; `ToDate`: DateTime; `TotalExpenses`: decimal; `ExpensesCount`: int; `ByCategory`: List<ExpenseByCategoryDto> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Reports/payroll-summary` - `GetPayrollSummaryReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `year`: `int?`<br>Query `month`: `int?`<br>Handler signature: `[FromQuery] int? year, [FromQuery] int? month`
- **Declared response:** typeof(PayrollSummaryReportDto), StatusCodes.Status200OK
- **Response schema:** `PayrollSummaryReportDto` with fields: { `ActiveMembers`: int; `TodayCheckIns`: int; `CurrentlyInsideCount`: int; `ExpiringSubscriptionsIn7Days`: int; `ExpiredSubscriptions`: int; `MonthRevenue`: decimal; `MonthExpenses`: decimal; `TodayRevenue`: decimal; `TodayExpenses`: decimal; `LowStockProductsCount`: int; `EquipmentUnderMaintenanceCount`: int; `PendingLeaveRequestsCount`: int; `UnpaidInvoicesCount`: int; `UnpaidInvoicesTotal`: decimal; `BranchKpis`: List<BranchKpiDto>; `BranchId`: Guid; `BranchName`: string; `Capacity`: int?; `CurrentlyInside`: int; `FromDate`: DateTime; `ToDate`: DateTime; `TotalExpenses`: decimal; `ExpensesCount`: int; `ByCategory`: List<ExpenseByCategoryDto> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Reports/pos-sales` - `GetPosSalesReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `branchId`: `Guid?`<br>Query `topProductsCount`: `int`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] Guid? branchId, [FromQuery] int topProductsCount = 10`
- **Declared response:** typeof(PosSalesReportDto), StatusCodes.Status200OK
- **Response schema:** `PosSalesReportDto` with fields: { `ActiveMembers`: int; `TodayCheckIns`: int; `CurrentlyInsideCount`: int; `ExpiringSubscriptionsIn7Days`: int; `ExpiredSubscriptions`: int; `MonthRevenue`: decimal; `MonthExpenses`: decimal; `TodayRevenue`: decimal; `TodayExpenses`: decimal; `LowStockProductsCount`: int; `EquipmentUnderMaintenanceCount`: int; `PendingLeaveRequestsCount`: int; `UnpaidInvoicesCount`: int; `UnpaidInvoicesTotal`: decimal; `BranchKpis`: List<BranchKpiDto>; `BranchId`: Guid; `BranchName`: string; `Capacity`: int?; `CurrentlyInside`: int; `FromDate`: DateTime; `ToDate`: DateTime; `TotalExpenses`: decimal; `ExpensesCount`: int; `ByCategory`: List<ExpenseByCategoryDto> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Reports/stock-valuation` - `GetStockValuationReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `branchId`: `Guid?`<br>Handler signature: `[FromQuery] Guid? branchId`
- **Declared response:** typeof(StockValuationReportDto), StatusCodes.Status200OK
- **Response schema:** `StockValuationReportDto` with fields: { `ActiveMembers`: int; `TodayCheckIns`: int; `CurrentlyInsideCount`: int; `ExpiringSubscriptionsIn7Days`: int; `ExpiredSubscriptions`: int; `MonthRevenue`: decimal; `MonthExpenses`: decimal; `TodayRevenue`: decimal; `TodayExpenses`: decimal; `LowStockProductsCount`: int; `EquipmentUnderMaintenanceCount`: int; `PendingLeaveRequestsCount`: int; `UnpaidInvoicesCount`: int; `UnpaidInvoicesTotal`: decimal; `BranchKpis`: List<BranchKpiDto>; `BranchId`: Guid; `BranchName`: string; `Capacity`: int?; `CurrentlyInside`: int; `FromDate`: DateTime; `ToDate`: DateTime; `TotalExpenses`: decimal; `ExpensesCount`: int; `ByCategory`: List<ExpenseByCategoryDto> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Reports/subscriptions` - `GetSubscriptionsReport`

- **Access:** JWT + Policy: `Permissions.ViewReports`
- **Business purpose:** Operational and financial indicators and reports.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** typeof(SubscriptionsReportDto), StatusCodes.Status200OK
- **Response schema:** `SubscriptionsReportDto` with fields: { `TotalClients`: int; `ActiveClients`: int; `NewClientsThisMonth`: int; `TotalCoaches`: int; `ActiveSubscriptions`: int; `ExpiringSubscriptions`: int; `TotalRevenueThisMonth`: decimal; `TotalRevenueLastMonth`: decimal; `TotalWorkoutsThisMonth`: int; `TotalDietPlansActive`: int; `InactiveClients`: int; `ClientsWithActiveSubscription`: int; `ClientsWithoutSubscription`: int; `TopClients`: List<ClientSummaryDto>; `MonthlyTrend`: List<MonthlyClientDto>; `Id`: Guid; `Name`: string; `PhoneNumber`: string?; `TotalSessions`: int; `TotalPaid`: decimal; `Month`: string; `NewClients`: int; `ChurnedClients`: int; `TotalSubscriptions`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### Rooms

#### `GET /api/Rooms` - `GetRooms`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `branchId`: `Guid?`<br>Query `type`: `RoomType?`<br>Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] RoomType? type, [FromQuery] bool? isActive`
- **Declared response:** typeof(List<RoomDto>), StatusCodes.Status200OK
- **Response schema:** `List<RoomDto>` with fields: { `Id`: Guid; `TenantId`: Guid; `BranchId`: Guid; `BranchName`: string?; `Name`: string; `Type`: RoomType; `Capacity`: int?; `Description`: string?; `ImageUrl`: string?; `IsActive`: bool; `EquipmentCount`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Rooms` - `CreateRoom`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateRoomCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/Rooms/{id}` - `DeleteRoom`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/Rooms/{id}` - `UpdateRoom`

- **Access:** JWT + Policy: `Permissions.ManageBranches`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateRoomCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### Sales

#### `GET /api/Sales` - `GetSales`

- **Access:** JWT + Policy: `Permissions.ManagePOS`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `branchId`: `Guid?`<br>Query `clientId`: `Guid?`<br>Query `cashierId`: `Guid?`<br>Query `paymentMethod`: `PaymentMethod?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] Guid? clientId, [FromQuery] Guid? cashierId, [FromQuery] PaymentMethod? paymentMethod, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<SaleDto>>>
- **Response schema:** `Task<ActionResult<List<SaleDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `SaleNumber`: string; `BranchId`: Guid; `BranchName`: string?; `ClientId`: Guid?; `ClientName`: string?; `CashierId`: Guid?; `CashierName`: string?; `SaleDate`: DateTime; `Subtotal`: decimal; `TaxAmount`: decimal; `DiscountAmount`: decimal; `Total`: decimal; `PaymentMethod`: PaymentMethod; `InvoiceId`: Guid?; `InvoiceNumber`: string?; `Notes`: string?; `Items`: List<SaleItemDto>; `ProductId`: Guid; `ProductName`: string; `Quantity`: decimal; `UnitPrice`: decimal; `TaxRate`: decimal }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Sales/checkout` - `Checkout`

- **Access:** JWT + Policy: `Permissions.ManagePOS`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CheckoutSaleCommand command`
- **Declared response:** typeof(Guid), StatusCodes.Status200OK
- **Response schema:** `Guid`; concrete properties are not declared in a discoverable DTO.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### Shifts

#### `GET /api/Shifts` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** LogicFit API module `Shifts`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `branchId`: `Guid?`<br>Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<ShiftDto>>>
- **Response schema:** `Task<ActionResult<List<ShiftDto>>>` with fields: { `Id`: Guid; `BranchId`: Guid?; `BranchName`: string?; `Name`: string; `StartTime`: TimeSpan; `EndTime`: TimeSpan; `Color`: string?; `IsActive`: bool; `ShiftId`: Guid; `ShiftName`: string?; `EmployeeId`: Guid; `EmployeeName`: string?; `Date`: DateTime; `ActualCheckIn`: DateTime?; `ActualCheckOut`: DateTime?; `Notes`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Shifts` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** LogicFit API module `Shifts`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateShiftCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/Shifts/assign` - `Assign`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** LogicFit API module `Shifts`.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `AssignShiftCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `GET /api/Shifts/assignments` - `GetAssignments`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** LogicFit API module `Shifts`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `employeeId`: `Guid?`<br>Query `shiftId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? employeeId, [FromQuery] Guid? shiftId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<ShiftAssignmentDto>>>
- **Response schema:** `Task<ActionResult<List<ShiftAssignmentDto>>>` with fields: { `Id`: Guid; `BranchId`: Guid?; `BranchName`: string?; `Name`: string; `StartTime`: TimeSpan; `EndTime`: TimeSpan; `Color`: string?; `IsActive`: bool; `ShiftId`: Guid; `ShiftName`: string?; `EmployeeId`: Guid; `EmployeeName`: string?; `Date`: DateTime; `ActualCheckIn`: DateTime?; `ActualCheckOut`: DateTime?; `Notes`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### StaffAttendance

#### `GET /api/staff-attendance` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Query `branchId`: `Guid?`<br>Query `userId`: `Guid?`<br>Handler signature: `[FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] Guid? branchId, [FromQuery] Guid? userId`
- **Declared response:** Task<ActionResult<List<StaffAttendanceDto>>>
- **Response schema:** `Task<ActionResult<List<StaffAttendanceDto>>>` with fields: { `Id`: Guid; `UserId`: Guid; `EmployeeProfileId`: Guid?; `Name`: string?; `PhoneNumber`: string?; `Email`: string?; `BranchId`: Guid?; `CheckInTime`: DateTime; `CheckOutTime`: DateTime?; `DurationMinutes`: double?; `Method`: GateAccessMethod }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/staff-attendance/{id}/check-out` - `CheckOut`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/staff-attendance/toggle-qr` - `ToggleByQr`

- **Access:** JWT + Policy: `Permissions.ManageAttendance`
- **Business purpose:** Attendance, appointments, classes, and scheduling.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `request`: `ToggleStaffQrRequest` { `QrCode`: string; `BranchId`: Guid? }<br>Handler signature: `[FromBody] ToggleStaffQrRequest request`
- **Declared response:** Task<ActionResult<StaffAttendanceDto>>
- **Response schema:** `Task<ActionResult<StaffAttendanceDto>>` with fields: { `Id`: Guid; `UserId`: Guid; `EmployeeProfileId`: Guid?; `Name`: string?; `PhoneNumber`: string?; `Email`: string?; `BranchId`: Guid?; `CheckInTime`: DateTime; `CheckOutTime`: DateTime?; `DurationMinutes`: double?; `Method`: GateAccessMethod }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

### Stock

#### `GET /api/Stock` - `GetStock`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `branchId`: `Guid?`<br>Query `productId`: `Guid?`<br>Query `lowStockOnly`: `bool?`<br>Handler signature: `[FromQuery] Guid? branchId, [FromQuery] Guid? productId, [FromQuery] bool? lowStockOnly`
- **Declared response:** Task<ActionResult<List<StockItemDto>>>
- **Response schema:** `Task<ActionResult<List<StockItemDto>>>` with fields: { `Id`: Guid; `ProductId`: Guid; `ProductName`: string; `Sku`: string?; `BranchId`: Guid; `BranchName`: string?; `Quantity`: decimal; `MinStockLevel`: int; `LastMovementAt`: DateTime?; `ProductName`: string?; `Type`: StockMovementType; `QuantityAfter`: decimal; `Reason`: string?; `ReferenceType`: string?; `ReferenceId`: Guid?; `MovedAt`: DateTime; `MovedByName`: string?; `TargetBranchId`: Guid?; `TargetBranchName`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Stock/adjust` - `Adjust`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `AdjustStockCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `GET /api/Stock/movements` - `GetMovements`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `productId`: `Guid?`<br>Query `branchId`: `Guid?`<br>Query `type`: `StockMovementType?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? productId, [FromQuery] Guid? branchId, [FromQuery] StockMovementType? type, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<StockMovementDto>>>
- **Response schema:** `Task<ActionResult<List<StockMovementDto>>>` with fields: { `Id`: Guid; `ProductId`: Guid; `ProductName`: string; `Sku`: string?; `BranchId`: Guid; `BranchName`: string?; `Quantity`: decimal; `MinStockLevel`: int; `LastMovementAt`: DateTime?; `ProductName`: string?; `Type`: StockMovementType; `QuantityAfter`: decimal; `Reason`: string?; `ReferenceType`: string?; `ReferenceId`: Guid?; `MovedAt`: DateTime; `MovedByName`: string?; `TargetBranchId`: Guid?; `TargetBranchName`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Stock/transfer` - `Transfer`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `TransferStockCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### Subscriptions

#### `GET /api/Subscriptions` - `GetClientSubscriptions`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `clientId`: `Guid?`<br>Query `status`: `SubscriptionStatus?`<br>Query `planId`: `Guid?`<br>Query `expiringWithinDays`: `int?`<br>Query `searchTerm`: `string?`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] SubscriptionStatus? status, [FromQuery] Guid? planId, [FromQuery] int? expiringWithinDays, [FromQuery] string? searchTerm`
- **Declared response:** Task<ActionResult<List<ClientSubscriptionDto>>>
- **Response schema:** `Task<ActionResult<List<ClientSubscriptionDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Name`: string; `Price`: decimal; `DurationMonths`: int; `Description`: string?; `Features`: List<string>; `MaxFreezeDays`: int; `MaxFreezeCount`: int; `IsActive`: bool; `SessionsPerWeek`: int?; `InBodyIncluded`: bool; `PrivateCoach`: bool; `ActiveSubscribersCount`: int; `ClientId`: Guid; `ClientName`: string?; `PlanId`: Guid; `PlanName`: string?; `StartDate`: DateTime; `EndDate`: DateTime; `Status`: SubscriptionStatus; `SalesCoachId`: Guid?; `SalesCoachName`: string?; `PaymentMethod`: PaymentMethod? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Subscriptions` - `CreateClientSubscription`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateClientSubscriptionCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `GET /api/Subscriptions/{id}` - `GetSubscription`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<ClientSubscriptionDetailDto>>
- **Response schema:** `Task<ActionResult<ClientSubscriptionDetailDto>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Name`: string; `Price`: decimal; `DurationMonths`: int; `Description`: string?; `Features`: List<string>; `MaxFreezeDays`: int; `MaxFreezeCount`: int; `IsActive`: bool; `SessionsPerWeek`: int?; `InBodyIncluded`: bool; `PrivateCoach`: bool; `ActiveSubscribersCount`: int; `ClientId`: Guid; `ClientName`: string?; `PlanId`: Guid; `PlanName`: string?; `StartDate`: DateTime; `EndDate`: DateTime; `Status`: SubscriptionStatus; `SalesCoachId`: Guid?; `SalesCoachName`: string?; `PaymentMethod`: PaymentMethod? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/Subscriptions/{id}` - `UpdateClientSubscription`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateClientSubscriptionCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/Subscriptions/{subscriptionId}/cancel` - `CancelSubscription`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid subscriptionId, CancelSubscriptionCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/Subscriptions/{subscriptionId}/freeze` - `CreateSubscriptionFreeze`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid subscriptionId, CreateSubscriptionFreezeCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/Subscriptions/{subscriptionId}/payment` - `AddSubscriptionPayment`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid subscriptionId, AddSubscriptionPaymentCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/Subscriptions/{subscriptionId}/renew` - `RenewSubscription`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid subscriptionId, RenewSubscriptionCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `GET /api/Subscriptions/expiring` - `GetExpiringSubscriptions`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `days`: `int`<br>Handler signature: `[FromQuery] int days = 7`
- **Declared response:** Task<ActionResult<List<ClientSubscriptionDto>>>
- **Response schema:** `Task<ActionResult<List<ClientSubscriptionDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Name`: string; `Price`: decimal; `DurationMonths`: int; `Description`: string?; `Features`: List<string>; `MaxFreezeDays`: int; `MaxFreezeCount`: int; `IsActive`: bool; `SessionsPerWeek`: int?; `InBodyIncluded`: bool; `PrivateCoach`: bool; `ActiveSubscribersCount`: int; `ClientId`: Guid; `ClientName`: string?; `PlanId`: Guid; `PlanName`: string?; `StartDate`: DateTime; `EndDate`: DateTime; `Status`: SubscriptionStatus; `SalesCoachId`: Guid?; `SalesCoachName`: string?; `PaymentMethod`: PaymentMethod? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Subscriptions/freezes/{freezeId}/end` - `EndFreezeEarly`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid freezeId`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `GET /api/Subscriptions/plans` - `GetSubscriptionPlans`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<SubscriptionPlanDto>>>
- **Response schema:** `Task<ActionResult<List<SubscriptionPlanDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Name`: string; `Price`: decimal; `DurationMonths`: int; `Description`: string?; `Features`: List<string>; `MaxFreezeDays`: int; `MaxFreezeCount`: int; `IsActive`: bool; `SessionsPerWeek`: int?; `InBodyIncluded`: bool; `PrivateCoach`: bool; `ActiveSubscribersCount`: int; `ClientId`: Guid; `ClientName`: string?; `PlanId`: Guid; `PlanName`: string?; `StartDate`: DateTime; `EndDate`: DateTime; `Status`: SubscriptionStatus; `SalesCoachId`: Guid?; `SalesCoachName`: string?; `PaymentMethod`: PaymentMethod? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Subscriptions/plans` - `CreateSubscriptionPlan`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateSubscriptionPlanCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/Subscriptions/plans/{id}` - `DeleteSubscriptionPlan`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `GET /api/Subscriptions/plans/{id}` - `GetSubscriptionPlan`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<SubscriptionPlanDto>>
- **Response schema:** `Task<ActionResult<SubscriptionPlanDto>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Name`: string; `Price`: decimal; `DurationMonths`: int; `Description`: string?; `Features`: List<string>; `MaxFreezeDays`: int; `MaxFreezeCount`: int; `IsActive`: bool; `SessionsPerWeek`: int?; `InBodyIncluded`: bool; `PrivateCoach`: bool; `ActiveSubscribersCount`: int; `ClientId`: Guid; `ClientName`: string?; `PlanId`: Guid; `PlanName`: string?; `StartDate`: DateTime; `EndDate`: DateTime; `Status`: SubscriptionStatus; `SalesCoachId`: Guid?; `SalesCoachName`: string?; `PaymentMethod`: PaymentMethod? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/Subscriptions/plans/{id}` - `UpdateSubscriptionPlan`

- **Access:** JWT + Policy: `Permissions.ManageClientSubscriptions`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateSubscriptionPlanCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### Suppliers

#### `GET /api/Suppliers` - `Get`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `isActive`: `bool?`<br>Query `searchTerm`: `string?`<br>Handler signature: `[FromQuery] bool? isActive, [FromQuery] string? searchTerm`
- **Declared response:** Task<ActionResult<List<SupplierDto>>>
- **Response schema:** `Task<ActionResult<List<SupplierDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Name`: string; `ContactPerson`: string?; `Phone`: string?; `Email`: string?; `Address`: string?; `TaxNumber`: string?; `Notes`: string?; `IsActive`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Suppliers` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateSupplierCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/Suppliers/{id}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/Suppliers/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageInventory`
- **Business purpose:** Gym operations, facilities, finance, inventory, and staff.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateSupplierCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### TaxSettings

#### `GET /api/TaxSettings` - `GetSettings`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `TaxSettings`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `isActive`: `bool?`<br>Handler signature: `[FromQuery] bool? isActive`
- **Declared response:** Task<ActionResult<List<TaxSettingDto>>>
- **Response schema:** `Task<ActionResult<List<TaxSettingDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Name`: string; `Rate`: decimal; `IsDefault`: bool; `IsActive`: bool; `Description`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/TaxSettings` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `TaxSettings`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateTaxSettingCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/TaxSettings/{id}` - `Delete`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `TaxSettings`.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/TaxSettings/{id}` - `Update`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `TaxSettings`.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateTaxSettingCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### TenantBackups

#### `GET /api/tenant/backups/exports` - `List`

- **Access:** JWT + Policy: `Permissions.CreateAndDownloadTenantBackup`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** Task<ActionResult<IReadOnlyList<TenantBackupExportDto>>>
- **Response schema:** `Task<ActionResult<IReadOnlyList<TenantBackupExportDto>>>` with fields: { `Id`: Guid; `Status`: TenantBackupExportStatus; `CreatedAtUtc`: DateTime; `StartedAtUtc`: DateTime?; `CompletedAtUtc`: DateTime?; `DownloadedAtUtc`: DateTime?; `SizeBytes`: long?; `Sha256`: string?; `ErrorCode`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/tenant/backups/exports` - `Create`

- **Access:** JWT + Policy: `Permissions.CreateAndDownloadTenantBackup`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `request`: `TenantBackupExportRequest` { `GrantToken`: string; `IdempotencyKey`: string? }<br>Handler signature: `[FromBody] TenantBackupExportRequest request`
- **Declared response:** Task<ActionResult<TenantBackupExportDto>>
- **Response schema:** `Task<ActionResult<TenantBackupExportDto>>` with fields: { `Id`: Guid; `Status`: TenantBackupExportStatus; `CreatedAtUtc`: DateTime; `StartedAtUtc`: DateTime?; `CompletedAtUtc`: DateTime?; `DownloadedAtUtc`: DateTime?; `SizeBytes`: long?; `Sha256`: string?; `ErrorCode`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `GET /api/tenant/backups/exports/{exportId:guid}` - `Get`

- **Access:** JWT + Policy: `Permissions.CreateAndDownloadTenantBackup`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid exportId`
- **Declared response:** Task<ActionResult<TenantBackupExportDto>>
- **Response schema:** `Task<ActionResult<TenantBackupExportDto>>` with fields: { `Id`: Guid; `Status`: TenantBackupExportStatus; `CreatedAtUtc`: DateTime; `StartedAtUtc`: DateTime?; `CompletedAtUtc`: DateTime?; `DownloadedAtUtc`: DateTime?; `SizeBytes`: long?; `Sha256`: string?; `ErrorCode`: string? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/tenant/backups/exports/{exportId:guid}/download` - `Download`

- **Access:** JWT + Policy: `Permissions.CreateAndDownloadTenantBackup`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `token`: `string`<br>Handler signature: `Guid exportId, [FromQuery] string token`
- **Declared response:** Task<IActionResult>
- **Response schema:** `Task<IActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/tenant/backups/exports/{exportId:guid}/download-grant` - `CreateDownloadGrant`

- **Access:** JWT + Policy: `Permissions.CreateAndDownloadTenantBackup`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `request`: `SensitiveGrantRequest` { `GrantToken`: string }<br>Handler signature: `Guid exportId, [FromBody] SensitiveGrantRequest request`
- **Declared response:** Task<ActionResult<TenantBackupDownloadGrantDto>>
- **Response schema:** `Task<ActionResult<TenantBackupDownloadGrantDto>>` with fields: { `ExportId`: Guid; `DownloadToken`: string; `ExpiresAtUtc`: DateTime; `DownloadPath`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/tenant/backups/reauthenticate` - `Reauthenticate`

- **Access:** JWT + Policy: `Permissions.CreateAndDownloadTenantBackup`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `request`: `PasswordReauthenticationRequest` { `CurrentPassword`: string }<br>Handler signature: `[FromBody] PasswordReauthenticationRequest request`
- **Declared response:** Task<ActionResult<SensitiveActionGrantDto>>
- **Response schema:** `Task<ActionResult<SensitiveActionGrantDto>>` with fields: { `GrantToken`: string; `ExpiresAtUtc`: DateTime; `Scope`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/tenant/backups/reauthenticate-download` - `ReauthenticateForDownload`

- **Access:** JWT + Policy: `Permissions.CreateAndDownloadTenantBackup`
- **Business purpose:** Backup creation, checksum verification, retry, and controlled restore.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `request`: `PasswordReauthenticationRequest` { `CurrentPassword`: string }<br>Handler signature: `[FromBody] PasswordReauthenticationRequest request`
- **Declared response:** Task<ActionResult<SensitiveActionGrantDto>>
- **Response schema:** `Task<ActionResult<SensitiveActionGrantDto>>` with fields: { `GrantToken`: string; `ExpiresAtUtc`: DateTime; `Scope`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### TenantBilling

#### `GET /api/tenant/payment-methods` - `GetPaymentMethods`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** typeof(List<PaymentMethodDto>), StatusCodes.Status200OK
- **Response schema:** `List<PaymentMethodDto>` with fields: { `Id`: Guid; `Name`: string; `Type`: string?; `AccountName`: string?; `AccountNumber`: string?; `IBAN`: string?; `WalletNumber`: string?; `Instructions`: string?; `QRImageUrl`: string?; `IsActive`: bool; `DisplayOrder`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/tenant/payment-requests` - `GetMyPaymentRequests`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** typeof(List<PaymentRequestDto>), StatusCodes.Status200OK
- **Response schema:** `List<PaymentRequestDto>` with fields: { `Id`: Guid; `TenantId`: Guid; `TenantName`: string?; `PlanId`: Guid; `PlanName`: string?; `TenantSubscriptionId`: Guid?; `ApplicationRequestId`: Guid?; `IdentityAccountId`: Guid?; `BillingCycle`: BillingCycle; `PlanSnapshotJson`: string?; `ProofVersion`: int; `Operation`: PaymentRequestOperation; `Amount`: decimal; `Currency`: string; `PaymentMethodId`: Guid?; `TransactionNumber`: string?; `PaymentDate`: DateTime?; `ProofFileUrl`: string?; `Notes`: string?; `Status`: PaymentRequestStatus; `ReviewedBy`: string?; `ReviewedAt`: DateTime?; `RejectReason`: string?; `CreatedAt`: DateTime }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/tenant/payment-requests` - `SubmitPaymentRequest`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Business purpose:** Payments, invoices, subscriptions, and financial transitions.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Form `planId`: `Guid`<br>Form `paymentMethodId`: `Guid?`<br>Form `transactionNumber`: `string?`<br>Form `paymentDate`: `DateTime?`<br>Form `notes`: `string?`<br>Form `operation`: `PaymentRequestOperation`<br>Handler signature: `[FromForm] Guid planId, [FromForm] Guid? paymentMethodId, [FromForm] string? transactionNumber, [FromForm] DateTime? paymentDate, [FromForm] string? notes, IFormFile? proof, [FromForm] PaymentRequestOperation operation = PaymentRequestOperation.NewSubscription`
- **Declared response:** typeof(PaymentRequestDto), StatusCodes.Status200OK
- **Response schema:** `PaymentRequestDto` with fields: { `Id`: Guid; `TenantId`: Guid; `TenantName`: string?; `PlanId`: Guid; `PlanName`: string?; `TenantSubscriptionId`: Guid?; `ApplicationRequestId`: Guid?; `IdentityAccountId`: Guid?; `BillingCycle`: BillingCycle; `PlanSnapshotJson`: string?; `ProofVersion`: int; `Operation`: PaymentRequestOperation; `Amount`: decimal; `Currency`: string; `PaymentMethodId`: Guid?; `TransactionNumber`: string?; `PaymentDate`: DateTime?; `ProofFileUrl`: string?; `Notes`: string?; `Status`: PaymentRequestStatus; `ReviewedBy`: string?; `ReviewedAt`: DateTime?; `RejectReason`: string?; `CreatedAt`: DateTime }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### Tenants

#### `GET /api/Tenants` - `GetTenants`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** typeof(List<TenantDto>), StatusCodes.Status200OK
- **Response schema:** `List<TenantDto>` with fields: { `Id`: Guid; `Name`: string; `Subdomain`: string?; `Status`: TenantStatus; `CreatedAt`: DateTime }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Tenants` - `CreateTenant`

- **Access:** JWT + Policy: `Permissions.ManageTenants`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateTenantCommand command`
- **Declared response:** typeof(TenantDto), StatusCodes.Status201Created<br>typeof(ProblemDetails), StatusCodes.Status400BadRequest
- **Response schema:** `TenantDto` with fields: { `Id`: Guid; `Name`: string; `Subdomain`: string?; `Status`: TenantStatus; `CreatedAt`: DateTime }<br>`ProblemDetails`; concrete properties are not declared in a discoverable DTO.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### TenantSubscription

#### `GET /api/tenant/invoices` - `GetInvoices`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** typeof(List<SubscriptionInvoiceDto>), StatusCodes.Status200OK
- **Response schema:** `List<SubscriptionInvoiceDto>` with fields: { `Id`: Guid; `InvoiceNumber`: string; `Amount`: decimal; `Currency`: string; `Status`: SubscriptionInvoiceStatus; `IssueDate`: DateTime; `DueDate`: DateTime?; `PaidAt`: DateTime? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/tenant/my-subscription` - `GetMySubscription`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** typeof(MySubscriptionDto), StatusCodes.Status200OK
- **Response schema:** `MySubscriptionDto` with fields: { `HasSubscription`: bool; `SubscriptionId`: Guid?; `PlanId`: Guid?; `PlanName`: string?; `Status`: TenantSubscriptionStatus?; `StartDate`: DateTime?; `EndDate`: DateTime?; `TrialEndsAt`: DateTime?; `RemainingDays`: int?; `Amount`: decimal?; `Currency`: string?; `AutoRenew`: bool; `Features`: List<string>; `Members`: UsageLineDto; `Coaches`: UsageLineDto; `Branches`: UsageLineDto; `Employees`: UsageLineDto; `Used`: int; `Limit`: int? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/tenant/plans` - `GetAvailablePlans`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** typeof(List<PlanDto>), StatusCodes.Status200OK
- **Response schema:** `List<PlanDto>` with fields: { `Id`: Guid; `Name`: string; `Description`: string?; `Price`: decimal; `Currency`: string; `BillingCycle`: BillingCycle; `DurationInDays`: int; `MaxMembers`: int?; `MaxCoaches`: int?; `MaxBranches`: int?; `MaxEmployees`: int?; `MaxStorageMB`: int?; `IsActive`: bool; `DisplayOrder`: int; `Features`: List<string> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/tenant/subscription/renew` - `Renew`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** No request input.
- **Declared response:** typeof(TenantSubscriptionSummaryDto), StatusCodes.Status200OK
- **Response schema:** `TenantSubscriptionSummaryDto` with fields: { `SubscriptionId`: Guid; `PlanId`: Guid; `PlanName`: string; `Status`: TenantSubscriptionStatus; `Amount`: decimal; `Currency`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/tenant/subscription/select-plan` - `SelectPlan`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `ChooseSubscriptionPlanCommand` { `PlanId`: Guid }<br>Handler signature: `[FromBody] ChooseSubscriptionPlanCommand command`
- **Declared response:** typeof(TenantSubscriptionSummaryDto), StatusCodes.Status200OK
- **Response schema:** `TenantSubscriptionSummaryDto` with fields: { `SubscriptionId`: Guid; `PlanId`: Guid; `PlanName`: string; `Status`: TenantSubscriptionStatus; `Amount`: decimal; `Currency`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/tenant/subscription/upgrade` - `Upgrade`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `ChooseSubscriptionPlanCommand` { `PlanId`: Guid }<br>Handler signature: `[FromBody] ChooseSubscriptionPlanCommand command`
- **Declared response:** typeof(TenantSubscriptionSummaryDto), StatusCodes.Status200OK
- **Response schema:** `TenantSubscriptionSummaryDto` with fields: { `SubscriptionId`: Guid; `PlanId`: Guid; `PlanName`: string; `Status`: TenantSubscriptionStatus; `Amount`: decimal; `Currency`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `GET /api/tenant/usage` - `GetUsage`

- **Access:** JWT + Policy: `Permissions.ManageTenantBilling`
- **Business purpose:** Workspace lifecycle, isolation, status, and owner membership.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** typeof(MySubscriptionDto), StatusCodes.Status200OK
- **Response schema:** `MySubscriptionDto` with fields: { `HasSubscription`: bool; `SubscriptionId`: Guid?; `PlanId`: Guid?; `PlanName`: string?; `Status`: TenantSubscriptionStatus?; `StartDate`: DateTime?; `EndDate`: DateTime?; `TrialEndsAt`: DateTime?; `RemainingDays`: int?; `Amount`: decimal?; `Currency`: string?; `AutoRenew`: bool; `Features`: List<string>; `Members`: UsageLineDto; `Coaches`: UsageLineDto; `Branches`: UsageLineDto; `Employees`: UsageLineDto; `Used`: int; `Limit`: int? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### Transactions

#### `GET /api/Transactions` - `GetTransactions`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** LogicFit API module `Transactions`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `userId`: `Guid?`<br>Query `type`: `TransactionType?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? userId, [FromQuery] TransactionType? type, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** typeof(List<TransactionDto>), StatusCodes.Status200OK
- **Response schema:** `List<TransactionDto>` with fields: { `Id`: Guid; `TenantId`: Guid; `UserId`: Guid; `UserName`: string?; `Type`: TransactionType; `Amount`: decimal; `BalanceAfter`: decimal; `Description`: string?; `ReferenceType`: string?; `ReferenceId`: Guid?; `CreatedAt`: DateTime; `CreatedBy`: string?; `TotalDeposits`: decimal; `TotalWithdrawals`: decimal; `TotalPayments`: decimal; `TotalRefunds`: decimal; `NetBalance`: decimal; `TransactionCount`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/Transactions` - `CreateTransaction`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** LogicFit API module `Transactions`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `CreateTransactionCommand` { `UserId`: Guid; `Type`: TransactionType; `Amount`: decimal; `Description`: string?; `ReferenceType`: string?; `ReferenceId`: Guid? }<br>Handler signature: `[FromBody] CreateTransactionCommand command`
- **Declared response:** typeof(Guid), StatusCodes.Status201Created<br>StatusCodes.Status400BadRequest
- **Response schema:** `Guid`; concrete properties are not declared in a discoverable DTO.<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/Transactions/{id}` - `DeleteTransaction`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** LogicFit API module `Transactions`.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** StatusCodes.Status204NoContent<br>StatusCodes.Status404NotFound
- **Response schema:** No response body declared.<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `GET /api/Transactions/{id}` - `GetTransaction`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** LogicFit API module `Transactions`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** typeof(TransactionDto), StatusCodes.Status200OK<br>StatusCodes.Status404NotFound
- **Response schema:** `TransactionDto` with fields: { `Id`: Guid; `TenantId`: Guid; `UserId`: Guid; `UserName`: string?; `Type`: TransactionType; `Amount`: decimal; `BalanceAfter`: decimal; `Description`: string?; `ReferenceType`: string?; `ReferenceId`: Guid?; `CreatedAt`: DateTime; `CreatedBy`: string?; `TotalDeposits`: decimal; `TotalWithdrawals`: decimal; `TotalPayments`: decimal; `TotalRefunds`: decimal; `NetBalance`: decimal; `TransactionCount`: int }<br>No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Transactions/summary` - `GetTransactionSummary`

- **Access:** JWT + Policy: `Permissions.ManageFinance`
- **Business purpose:** LogicFit API module `Transactions`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `userId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? userId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** typeof(TransactionSummaryDto), StatusCodes.Status200OK
- **Response schema:** `TransactionSummaryDto` with fields: { `Id`: Guid; `TenantId`: Guid; `UserId`: Guid; `UserName`: string?; `Type`: TransactionType; `Amount`: decimal; `BalanceAfter`: decimal; `Description`: string?; `ReferenceType`: string?; `ReferenceId`: Guid?; `CreatedAt`: DateTime; `CreatedBy`: string?; `TotalDeposits`: decimal; `TotalWithdrawals`: decimal; `TotalPayments`: decimal; `TotalRefunds`: decimal; `NetBalance`: decimal; `TransactionCount`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

### Users

#### `GET /api/Users` - `GetUsers`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `Users`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `role`: `UserRole?`<br>Query `isActive`: `bool?`<br>Query `searchTerm`: `string?`<br>Handler signature: `[FromQuery] UserRole? role, [FromQuery] bool? isActive, [FromQuery] string? searchTerm`
- **Declared response:** Task<ActionResult<List<UserDto>>>
- **Response schema:** `Task<ActionResult<List<UserDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Email`: string; `PhoneNumber`: string?; `Role`: UserRole; `IsActive`: bool; `WalletBalance`: decimal; `Profile`: UserProfileDto?; `FullName`: string?; `ProfilePictureUrl`: string?; `Gender`: int?; `BirthDate`: DateTime?; `HeightCm`: double?; `WeightKg`: double?; `ActivityLevel`: string?; `FitnessGoal`: string?; `MedicalHistory`: string?; `Password`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/Users/{id}` - `GetUser`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `Users`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<UserDto>>
- **Response schema:** `Task<ActionResult<UserDto>>` with fields: { `Id`: Guid; `TenantId`: Guid; `Email`: string; `PhoneNumber`: string?; `Role`: UserRole; `IsActive`: bool; `WalletBalance`: decimal; `Profile`: UserProfileDto?; `FullName`: string?; `ProfilePictureUrl`: string?; `Gender`: int?; `BirthDate`: DateTime?; `HeightCm`: double?; `WeightKg`: double?; `ActivityLevel`: string?; `FitnessGoal`: string?; `MedicalHistory`: string?; `Password`: string }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/Users/{id}` - `UpdateUser`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `Users`.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateUserCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `PUT /api/Users/{id}/profile` - `UpdateUserProfile`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `Users`.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateUserProfileCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/Users/staff` - `CreateStaff`

- **Access:** JWT + Policy: `Permissions.ManageSettings`
- **Business purpose:** LogicFit API module `Users`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `CreateStaffUserCommand` { `PhoneNumber`: string; `Email`: string?; `Password`: string?; `FullName`: string; `Role`: UserRole }<br>Handler signature: `[FromBody] CreateStaffUserCommand command`
- **Declared response:** typeof(Guid), StatusCodes.Status201Created
- **Response schema:** `Guid`; concrete properties are not declared in a discoverable DTO.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### WorkoutPrograms

#### `GET /api/WorkoutPrograms` - `GetWorkoutPrograms`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `coachId`: `Guid?`<br>Query `clientId`: `Guid?`<br>Query `status`: `PlanStatus?`<br>Handler signature: `[FromQuery] Guid? coachId, [FromQuery] Guid? clientId, [FromQuery] PlanStatus? status`
- **Declared response:** Task<ActionResult<List<WorkoutProgramDto>>>
- **Response schema:** `Task<ActionResult<List<WorkoutProgramDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `CoachId`: Guid; `CoachName`: string?; `ClientId`: Guid; `ClientName`: string?; `Name`: string; `Description`: string?; `Goal`: string?; `Difficulty`: string?; `DaysPerWeek`: int?; `Status`: PlanStatus; `StartDate`: DateTime; `EndDate`: DateTime?; `Routines`: List<ProgramRoutineDto>; `ProgramId`: Guid; `DayOfWeek`: int; `Exercises`: List<RoutineExerciseDto>; `RoutineId`: Guid; `ExerciseId`: int; `ExerciseName`: string?; `Sets`: int; `RepsMin`: int; `RepsMax`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/WorkoutPrograms` - `CreateWorkoutProgram`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `CreateWorkoutProgramCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/WorkoutPrograms/{id}` - `DeleteWorkoutProgram`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `GET /api/WorkoutPrograms/{id}` - `GetWorkoutProgram`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<WorkoutProgramDto>>
- **Response schema:** `Task<ActionResult<WorkoutProgramDto>>` with fields: { `Id`: Guid; `TenantId`: Guid; `CoachId`: Guid; `CoachName`: string?; `ClientId`: Guid; `ClientName`: string?; `Name`: string; `Description`: string?; `Goal`: string?; `Difficulty`: string?; `DaysPerWeek`: int?; `Status`: PlanStatus; `StartDate`: DateTime; `EndDate`: DateTime?; `Routines`: List<ProgramRoutineDto>; `ProgramId`: Guid; `DayOfWeek`: int; `Exercises`: List<RoutineExerciseDto>; `RoutineId`: Guid; `ExerciseId`: int; `ExerciseName`: string?; `Sets`: int; `RepsMin`: int; `RepsMax`: int }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PUT /api/WorkoutPrograms/{id}` - `UpdateWorkoutProgram`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid id, UpdateWorkoutProgramCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/WorkoutPrograms/{id}/duplicate` - `DuplicateWorkoutProgram`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `DuplicateWorkoutProgramCommand?` { `Id`: Guid; `NewClientId`: Guid?; `NewName`: string? }<br>Handler signature: `Guid id, [FromBody] DuplicateWorkoutProgramCommand? command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/WorkoutPrograms/{programId}/routines` - `CreateProgramRoutine`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid programId, CreateProgramRoutineCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/WorkoutPrograms/routines/{routineId}` - `DeleteProgramRoutine`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid routineId`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/WorkoutPrograms/routines/{routineId}` - `UpdateProgramRoutine`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid routineId, UpdateProgramRoutineCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/WorkoutPrograms/routines/{routineId}/exercises` - `CreateRoutineExercise`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid routineId, CreateRoutineExerciseCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `DELETE /api/WorkoutPrograms/routines/exercises/{exerciseId}` - `DeleteRoutineExercise`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Delete / Remove`
- **Why it matters:** Removes a configuration record or relationship that the domain explicitly allows to be deleted.
- **Business benefit:** Cleans non-historical configuration without deleting immutable financial or operational history.
- **Inputs:** Handler signature: `Guid exerciseId`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Enforce authorization, isolation, and duplicate prevention; use lifecycle or reversal for historical records.

#### `PUT /api/WorkoutPrograms/routines/exercises/{exerciseId}` - `UpdateRoutineExercise`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Handler signature: `Guid exerciseId, UpdateRoutineExerciseCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

### WorkoutSessions

#### `GET /api/WorkoutSessions` - `GetWorkoutSessions`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `clientId`: `Guid?`<br>Query `fromDate`: `DateTime?`<br>Query `toDate`: `DateTime?`<br>Handler signature: `[FromQuery] Guid? clientId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate`
- **Declared response:** Task<ActionResult<List<WorkoutSessionDto>>>
- **Response schema:** `Task<ActionResult<List<WorkoutSessionDto>>>` with fields: { `Id`: Guid; `TenantId`: Guid; `ClientId`: Guid; `ClientName`: string?; `RoutineId`: Guid; `RoutineName`: string?; `StartedAt`: DateTime; `EndedAt`: DateTime?; `TotalVolumLifted`: double; `Notes`: string?; `Sets`: List<SessionSetDto>; `SessionId`: Guid; `ExerciseId`: int; `ExerciseName`: string?; `SetNumber`: int; `WeightKg`: double; `Reps`: int; `Rpe`: double?; `VolumeLoad`: double; `IsPr`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/WorkoutSessions/{id}` - `GetWorkoutSession`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Handler signature: `Guid id`
- **Declared response:** Task<ActionResult<WorkoutSessionDto>>
- **Response schema:** `Task<ActionResult<WorkoutSessionDto>>` with fields: { `Id`: Guid; `TenantId`: Guid; `ClientId`: Guid; `ClientName`: string?; `RoutineId`: Guid; `RoutineName`: string?; `StartedAt`: DateTime; `EndedAt`: DateTime?; `TotalVolumLifted`: double; `Notes`: string?; `Sets`: List<SessionSetDto>; `SessionId`: Guid; `ExerciseId`: int; `ExerciseName`: string?; `SetNumber`: int; `WeightKg`: double; `Reps`: int; `Rpe`: double?; `VolumeLoad`: double; `IsPr`: bool }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/WorkoutSessions/{sessionId}/end` - `EndWorkoutSession`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid sessionId, EndWorkoutSessionCommand command`
- **Declared response:** Task<ActionResult>
- **Response schema:** `Task<ActionResult>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/WorkoutSessions/{sessionId}/sets` - `CreateSessionSet`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid sessionId, CreateSessionSetCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/WorkoutSessions/start` - `StartWorkoutSession`

- **Access:** JWT required
- **Business purpose:** Training, nutrition, measurements, and content libraries.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `StartWorkoutSessionCommand command`
- **Declared response:** Task<ActionResult<Guid>>
- **Response schema:** `Task<ActionResult<Guid>>`; body is action-specific or a file/blob.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

### WorkspaceApplications

#### `POST /api/workspace-applications` - `Submit`

- **Access:** Server default (not declared explicitly)
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Form `form`: `SubmitWorkspaceApplicationForm`<br>Handler signature: `[FromForm] SubmitWorkspaceApplicationForm form, [FromForm(Name = "proof")] IFormFile? proof`
- **Declared response:** typeof(ApplicationTrackingSessionDto), StatusCodes.Status201Created
- **Response schema:** `ApplicationTrackingSessionDto` with fields: { `WorkspaceType`: WorkspaceType; `WorkspaceName`: string; `WorkspaceIdentifier`: string; `OwnerFullName`: string; `BrandName`: string?; `LogoUrl`: string?; `PhotoUrl`: string?; `CoverImageUrl`: string?; `BackgroundImageUrl`: string?; `PrimaryColor`: string?; `SecondaryColor`: string?; `Bio`: string?; `DeliveryMode`: string?; `Specialties`: IReadOnlyList<string>; `Certifications`: IReadOnlyList<string>; `WelcomeMessage`: string?; `BookingSettings`: JsonElement?; `MustChangePassword`: bool; `ApplicationId`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `WorkspaceIdentifier`: string?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/workspace-applications/freelance` - `SubmitFreelance`

- **Access:** Server default (not declared explicitly)
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `SubmitFreelanceWorkspaceApplicationCommand` { `WorkspaceType`: WorkspaceType; `Email`: string; `PhoneNumber`: string?; `Password`: string; `WorkspaceName`: string; `WorkspaceIdentifier`: string; `OwnerFullName`: string; `BrandName`: string?; `LogoUrl`: string?; `PhotoUrl`: string?; `CoverImageUrl`: string?; `BackgroundImageUrl`: string?; `PrimaryColor`: string?; `SecondaryColor`: string?; `Bio`: string?; `DeliveryMode`: string?; `Specialties`: IReadOnlyList<string>?; `Certifications`: IReadOnlyList<string>?; `WelcomeMessage`: string?; `BookingSettings`: System.Text.Json.JsonElement?; `PlanId`: Guid; `BillingCycle`: BillingCycle?; `PaymentAmount`: decimal?; `PaymentTransactionNumber`: string? }<br>Handler signature: `[FromBody] SubmitFreelanceWorkspaceApplicationCommand command`
- **Declared response:** typeof(ApplicationTrackingSessionDto), StatusCodes.Status201Created
- **Response schema:** `ApplicationTrackingSessionDto` with fields: { `WorkspaceType`: WorkspaceType; `WorkspaceName`: string; `WorkspaceIdentifier`: string; `OwnerFullName`: string; `BrandName`: string?; `LogoUrl`: string?; `PhotoUrl`: string?; `CoverImageUrl`: string?; `BackgroundImageUrl`: string?; `PrimaryColor`: string?; `SecondaryColor`: string?; `Bio`: string?; `DeliveryMode`: string?; `Specialties`: IReadOnlyList<string>; `Certifications`: IReadOnlyList<string>; `WelcomeMessage`: string?; `BookingSettings`: JsonElement?; `MustChangePassword`: bool; `ApplicationId`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `WorkspaceIdentifier`: string?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `GET /api/workspace-applications/plans` - `GetPlans`

- **Access:** Server default (not declared explicitly)
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** typeof(List<PlanDto>), StatusCodes.Status200OK
- **Response schema:** `List<PlanDto>` with fields: { `Id`: Guid; `Name`: string; `Description`: string?; `Price`: decimal; `Currency`: string; `BillingCycle`: BillingCycle; `DurationInDays`: int; `MaxMembers`: int?; `MaxCoaches`: int?; `MaxBranches`: int?; `MaxEmployees`: int?; `MaxStorageMB`: int?; `IsActive`: bool; `DisplayOrder`: int; `Features`: List<string> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `GET /api/workspace-applications/tracking` - `GetTrackingStatus`

- **Access:** Server default (not declared explicitly)
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** No request input.
- **Declared response:** typeof(ApplicationTrackingStatusDto), StatusCodes.Status200OK
- **Response schema:** `ApplicationTrackingStatusDto` with fields: { `WorkspaceType`: WorkspaceType; `WorkspaceName`: string; `WorkspaceIdentifier`: string; `OwnerFullName`: string; `BrandName`: string?; `LogoUrl`: string?; `PhotoUrl`: string?; `CoverImageUrl`: string?; `BackgroundImageUrl`: string?; `PrimaryColor`: string?; `SecondaryColor`: string?; `Bio`: string?; `DeliveryMode`: string?; `Specialties`: IReadOnlyList<string>; `Certifications`: IReadOnlyList<string>; `WelcomeMessage`: string?; `BookingSettings`: JsonElement?; `MustChangePassword`: bool; `ApplicationId`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `WorkspaceIdentifier`: string?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `PATCH /api/workspace-applications/tracking/fields` - `UpdateRequestedFields`

- **Access:** Server default (not declared explicitly)
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Update / Patch`
- **Why it matters:** Updates an existing entity while preserving authorization and optimistic concurrency rules.
- **Business benefit:** Corrects or configures data without creating duplicates or breaking existing relationships.
- **Inputs:** Body `System`: `IReadOnlyDictionary<string,`<br>Handler signature: `[FromBody] IReadOnlyDictionary<string, System.Text.Json.JsonElement> fields`
- **Declared response:** typeof(ApplicationTrackingStatusDto), StatusCodes.Status200OK
- **Response schema:** `ApplicationTrackingStatusDto` with fields: { `WorkspaceType`: WorkspaceType; `WorkspaceName`: string; `WorkspaceIdentifier`: string; `OwnerFullName`: string; `BrandName`: string?; `LogoUrl`: string?; `PhotoUrl`: string?; `CoverImageUrl`: string?; `BackgroundImageUrl`: string?; `PrimaryColor`: string?; `SecondaryColor`: string?; `Bio`: string?; `DeliveryMode`: string?; `Specialties`: IReadOnlyList<string>; `Certifications`: IReadOnlyList<string>; `WelcomeMessage`: string?; `BookingSettings`: JsonElement?; `MustChangePassword`: bool; `ApplicationId`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `WorkspaceIdentifier`: string?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate input, isolation, and RowVersion where required; return 400 for validation and 409 for conflicts.

#### `POST /api/workspace-applications/tracking/resubmit` - `Resubmit`

- **Access:** Server default (not declared explicitly)
- **Business purpose:** Gym and FreelanceCoach applications, review, and provisioning.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** No request input.
- **Declared response:** typeof(ApplicationTrackingStatusDto), StatusCodes.Status200OK
- **Response schema:** `ApplicationTrackingStatusDto` with fields: { `WorkspaceType`: WorkspaceType; `WorkspaceName`: string; `WorkspaceIdentifier`: string; `OwnerFullName`: string; `BrandName`: string?; `LogoUrl`: string?; `PhotoUrl`: string?; `CoverImageUrl`: string?; `BackgroundImageUrl`: string?; `PrimaryColor`: string?; `SecondaryColor`: string?; `Bio`: string?; `DeliveryMode`: string?; `Specialties`: IReadOnlyList<string>; `Certifications`: IReadOnlyList<string>; `WelcomeMessage`: string?; `BookingSettings`: JsonElement?; `MustChangePassword`: bool; `ApplicationId`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `WorkspaceIdentifier`: string?; `InformationRequest`: string?; `RequestedFields`: IReadOnlyList<string> }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### WorkspaceClientJoinCodes

#### `POST /api/workspace/client-join-codes` - `Generate`

- **Access:** JWT + Policy: `Permissions.ManageMembers`
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `command`: `GenerateWorkspaceClientJoinCodeCommand` { `AutoApproveClients`: bool; `ValidForDays`: int }<br>Handler signature: `[FromBody] GenerateWorkspaceClientJoinCodeCommand command`
- **Declared response:** typeof(WorkspaceClientJoinCodeDto), StatusCodes.Status201Created
- **Response schema:** `WorkspaceClientJoinCodeDto` with fields: { `Code`: string; `ExpiresAt`: DateTime; `AutoApproveClients`: bool; `WorkspaceId`: Guid; `WorkspaceName`: string; `WorkspaceIdentifier`: string?; `LogoUrl`: string?; `RequiresWorkspaceApproval`: bool; `MembershipStatus`: WorkspaceMembershipStatus }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/workspace/client-join-codes/join` - `Join`

- **Access:** Anonymous (no token required)
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `command`: `JoinWorkspaceAsClientCommand` { `Code`: string; `WorkspaceSelectionToken`: string }<br>Handler signature: `[FromBody] JoinWorkspaceAsClientCommand command`
- **Declared response:** typeof(ClientJoinResultDto), StatusCodes.Status200OK
- **Response schema:** `ClientJoinResultDto` with fields: { `Code`: string; `ExpiresAt`: DateTime; `AutoApproveClients`: bool; `WorkspaceId`: Guid; `WorkspaceName`: string; `WorkspaceIdentifier`: string?; `LogoUrl`: string?; `RequiresWorkspaceApproval`: bool; `MembershipStatus`: WorkspaceMembershipStatus }
- **Failure contract:** 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/workspace/client-join-codes/memberships/{membershipId:guid}/approve` - `Approve`

- **Access:** JWT + Policy: `Permissions.ManageMembers`
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid membershipId`
- **Declared response:** StatusCodes.Status204NoContent
- **Response schema:** No response body declared.
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/workspace/client-join-codes/preview` - `Preview`

- **Access:** Anonymous (no token required)
- **Business purpose:** Client management, trainee portal, and coach relationships.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Body `command`: `PreviewWorkspaceClientJoinCommand` { `Code`: string }<br>Handler signature: `[FromBody] PreviewWorkspaceClientJoinCommand command`
- **Declared response:** typeof(WorkspaceClientJoinPreviewDto), StatusCodes.Status200OK
- **Response schema:** `WorkspaceClientJoinPreviewDto` with fields: { `Code`: string; `ExpiresAt`: DateTime; `AutoApproveClients`: bool; `WorkspaceId`: Guid; `WorkspaceName`: string; `WorkspaceIdentifier`: string?; `LogoUrl`: string?; `RequiresWorkspaceApproval`: bool; `MembershipStatus`: WorkspaceMembershipStatus }
- **Failure contract:** 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

### WorkspaceInvites

#### `POST /api/workspace-invites/accept` - `Accept`

- **Access:** Anonymous (no token required)
- **Business purpose:** LogicFit API module `WorkspaceInvites`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `AcceptWorkspaceInviteCommand` { `Token`: string; `WorkspaceSelectionToken`: string }<br>Handler signature: `[FromBody] AcceptWorkspaceInviteCommand command`
- **Declared response:** StatusCodes.Status204NoContent
- **Response schema:** No response body declared.
- **Failure contract:** 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/workspace-invites/preview` - `Preview`

- **Access:** Anonymous (no token required)
- **Business purpose:** LogicFit API module `WorkspaceInvites`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `PreviewWorkspaceInviteCommand` { `Token`: string }<br>Handler signature: `[FromBody] PreviewWorkspaceInviteCommand command`
- **Declared response:** typeof(WorkspaceInvitePreviewDto), StatusCodes.Status200OK
- **Response schema:** `WorkspaceInvitePreviewDto` with fields: { `WorkspaceId`: Guid; `Name`: string; `Identifier`: string?; `WorkspaceType`: WorkspaceType; `WorkspaceStatus`: TenantStatus; `Role`: UserRole; `ApplicationId`: Guid; `ApplicationType`: ApplicationType; `Status`: ApplicationRequestStatus; `SubmittedAt`: DateTime?; `WorkspaceIdentifier`: string?; `PaymentStatus`: PaymentRequestStatus?; `WorkspaceStatus`: TenantStatus?; `SubscriptionStatus`: TenantSubscriptionStatus?; `DatabaseStatusCode`: string?; `ProvisioningStatus`: ProvisioningJobStatus?; `CanAccessDashboard`: bool; `RequiredAction`: string?; `NextStep`: string?; `UserMessage`: string?; `LastUpdatedAtUtc`: DateTime?; `WorkspaceSelectionToken`: string; `ExpiresAt`: DateTime; `ActiveWorkspaces`: IReadOnlyList<IdentityWorkspaceDto> }
- **Failure contract:** 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

### WorkspaceMembers

#### `GET /api/workspace-members` - `List`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** LogicFit API module `WorkspaceMembers`.
- **Operation profile:** `Read / Query`
- **Why it matters:** Reads the authoritative state or data with tenant isolation and authorization.
- **Business benefit:** Gives the UI and operators reliable information for decisions without changing server state.
- **Inputs:** Query `role`: `UserRole?`<br>Query `accessStatus`: `string?`<br>Query `searchTerm`: `string?`<br>Handler signature: `[FromQuery] UserRole? role, [FromQuery] string? accessStatus, [FromQuery] string? searchTerm`
- **Declared response:** typeof(IReadOnlyList<WorkspaceMemberDto>), StatusCodes.Status200OK
- **Response schema:** `IReadOnlyList<WorkspaceMemberDto>` with fields: { `MembershipId`: Guid; `UserId`: Guid; `IdentityAccountId`: Guid; `TenantId`: Guid; `Email`: string; `PhoneNumber`: string?; `FullName`: string?; `Role`: UserRole; `RoleName`: string; `MembershipStatus`: WorkspaceMembershipStatus; `AccessStatus`: string; `MustChangePassword`: bool; `IsActive`: bool; `UpdatedAtUtc`: DateTime?; `TemporaryPassword`: string; `Member`: WorkspaceMemberDto; `NewIdentity`: bool; `OneTimeCredentials`: OneTimeWorkspaceMemberCredentialsDto? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Read-only; handle 401/403/404/429 and show explicit loading, empty, or error states.

#### `POST /api/workspace-members` - `Create`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** LogicFit API module `WorkspaceMembers`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Body `command`: `CreateWorkspaceMemberCommand` { `Email`: string; `PhoneNumber`: string?; `FullName`: string; `Role`: UserRole }<br>Handler signature: `[FromBody] CreateWorkspaceMemberCommand command`
- **Declared response:** typeof(WorkspaceMemberCreatedDto), StatusCodes.Status201Created
- **Response schema:** `WorkspaceMemberCreatedDto` with fields: { `MembershipId`: Guid; `UserId`: Guid; `IdentityAccountId`: Guid; `TenantId`: Guid; `Email`: string; `PhoneNumber`: string?; `FullName`: string?; `Role`: UserRole; `RoleName`: string; `MembershipStatus`: WorkspaceMembershipStatus; `AccessStatus`: string; `MustChangePassword`: bool; `IsActive`: bool; `UpdatedAtUtc`: DateTime?; `TemporaryPassword`: string; `Member`: WorkspaceMemberDto; `NewIdentity`: bool; `OneTimeCredentials`: OneTimeWorkspaceMemberCredentialsDto? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/workspace-members/{membershipId:guid}/activate` - `Activate`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** LogicFit API module `WorkspaceMembers`.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid membershipId`
- **Declared response:** Task<ActionResult<WorkspaceMemberDto>>
- **Response schema:** `Task<ActionResult<WorkspaceMemberDto>>` with fields: { `MembershipId`: Guid; `UserId`: Guid; `IdentityAccountId`: Guid; `TenantId`: Guid; `Email`: string; `PhoneNumber`: string?; `FullName`: string?; `Role`: UserRole; `RoleName`: string; `MembershipStatus`: WorkspaceMembershipStatus; `AccessStatus`: string; `MustChangePassword`: bool; `IsActive`: bool; `UpdatedAtUtc`: DateTime?; `TemporaryPassword`: string; `Member`: WorkspaceMemberDto; `NewIdentity`: bool; `OneTimeCredentials`: OneTimeWorkspaceMemberCredentialsDto? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/workspace-members/{membershipId:guid}/remove` - `Remove`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** LogicFit API module `WorkspaceMembers`.
- **Operation profile:** `Create / Command`
- **Why it matters:** Creates an entity or executes a command inside a defined business module.
- **Business benefit:** Turns user input into an audited server operation and links required entities transactionally where needed.
- **Inputs:** Handler signature: `Guid membershipId`
- **Declared response:** Task<ActionResult<WorkspaceMemberDto>>
- **Response schema:** `Task<ActionResult<WorkspaceMemberDto>>` with fields: { `MembershipId`: Guid; `UserId`: Guid; `IdentityAccountId`: Guid; `TenantId`: Guid; `Email`: string; `PhoneNumber`: string?; `FullName`: string?; `Role`: UserRole; `RoleName`: string; `MembershipStatus`: WorkspaceMembershipStatus; `AccessStatus`: string; `MustChangePassword`: bool; `IsActive`: bool; `UpdatedAtUtc`: DateTime?; `TemporaryPassword`: string; `Member`: WorkspaceMemberDto; `NewIdentity`: bool; `OneTimeCredentials`: OneTimeWorkspaceMemberCredentialsDto? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Use validation, unique constraints, and idempotency for commands that may be retried.

#### `POST /api/workspace-members/{membershipId:guid}/reset-password` - `ResetPassword`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** LogicFit API module `WorkspaceMembers`.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid membershipId`
- **Declared response:** typeof(WorkspaceMemberCreatedDto), StatusCodes.Status200OK
- **Response schema:** `WorkspaceMemberCreatedDto` with fields: { `MembershipId`: Guid; `UserId`: Guid; `IdentityAccountId`: Guid; `TenantId`: Guid; `Email`: string; `PhoneNumber`: string?; `FullName`: string?; `Role`: UserRole; `RoleName`: string; `MembershipStatus`: WorkspaceMembershipStatus; `AccessStatus`: string; `MustChangePassword`: bool; `IsActive`: bool; `UpdatedAtUtc`: DateTime?; `TemporaryPassword`: string; `Member`: WorkspaceMemberDto; `NewIdentity`: bool; `OneTimeCredentials`: OneTimeWorkspaceMemberCredentialsDto? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.

#### `POST /api/workspace-members/{membershipId:guid}/suspend` - `Suspend`

- **Access:** JWT + Policy: `Permissions.ManageEmployees`
- **Business purpose:** LogicFit API module `WorkspaceMembers`.
- **Operation profile:** `Workflow / Lifecycle Command`
- **Why it matters:** Moves an entity through a sensitive business state or executes a workflow command instead of generic CRUD.
- **Business benefit:** Preserves lifecycle consistency, auditability, isolation, and idempotency for approval, provisioning, or suspension.
- **Inputs:** Handler signature: `Guid membershipId`
- **Declared response:** Task<ActionResult<WorkspaceMemberDto>>
- **Response schema:** `Task<ActionResult<WorkspaceMemberDto>>` with fields: { `MembershipId`: Guid; `UserId`: Guid; `IdentityAccountId`: Guid; `TenantId`: Guid; `Email`: string; `PhoneNumber`: string?; `FullName`: string?; `Role`: UserRole; `RoleName`: string; `MembershipStatus`: WorkspaceMembershipStatus; `AccessStatus`: string; `MustChangePassword`: bool; `IsActive`: bool; `UpdatedAtUtc`: DateTime?; `TemporaryPassword`: string; `Member`: WorkspaceMemberDto; `NewIdentity`: bool; `OneTimeCredentials`: OneTimeWorkspaceMemberCredentialsDto? }
- **Failure contract:** 401: missing or expired session Â· 403: insufficient permission or workspace scope Â· 400: invalid input or rejected business rule Â· 404: resource missing or outside the visible scope Â· 409: state, RowVersion, or duplicate conflict Â· 429: rate limit exceeded Â· 500: unexpected server error; inspect state before retrying a mutation
- **Safety/side effects:** Validate current state, RowVersion/idempotency, and authorization; return 409 for state conflicts.
