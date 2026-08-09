# Backup and database-resource hardening — 2026-08-09

This document records the implementation slice for Issue #239 and the related dashboard
controls. It is source documentation only; it does not claim that Production has been repaired
or deployed.

## Database Resources

- The list supports server-side lifecycle status and Tenant ID filters. Summary cards are labeled
  as page-scoped because the API is paginated; `totalCount` remains the authoritative total.
- `Register database` remains write-only for the connection string. The server tests the value,
  protects it, and returns safe metadata only.
- `Repair` is available for `Available`, `Allocated`, `Failed`, and `Disabled` lifecycle rows.
  For an allocated row the Backend replaces the active mapping transactionally; for an unallocated
  pool row it returns the resource to `Available` according to the server lifecycle rules.
- `Migrations`, resource backup, and status actions remain permission-protected and server-owned.
  The UI never displays a database name, connection string, encrypted value, or storage path.

## Backup Center

- The screen supports `Platform`, `SelectedTenants`, `AllGyms`, `AllFreelance`, `AllTenants`, and
  `FullSystem`. Selected tenants are loaded from the active tenant list and only their IDs are sent.
- Creation is gated by the server readiness contract. The UI explains that readiness covers private
  storage/configuration, while target decryption, `CanConnect`, export, and SHA-256 verification
  are performed by the Backend for every selected target.
- Confirmation and in-flight locks prevent repeated clicks. Manual creation sends a unique
  idempotency key, and the Backend remains the final duplicate-prevention boundary.
- Batch history exposes per-target status, size, checksum, manifest, protected download, and retry.
  Retry is offered only for `Failed` or `Partial` batches and is locked to one request at a time.

## Backend fixes covered by this slice

- Current GUID-suffixed BACPAC and manifest keys are accepted by the protected download policy;
  traversal, unsupported extensions, and incomplete names remain rejected.
- Retry of a `FullSystem` batch replays only failed targets. A platform-only failure is represented
  by an explicit empty tenant set and cannot expand into a retry of all active tenant databases.
- Regression tests cover filename policy and target-filter semantics. No database migration or
  Production data change is part of this source change.

## Verification

- Backend: `dotnet test LogicFit.sln --configuration Release --no-restore` — 221 passed.
- Dashboard: `npm run build` — passed; existing SCSS budget warning remains in the workspace
  applications component.
- Dashboard: `npm test -- --watch=false --browsers=ChromeHeadless` — 8 passed.
- Protected Production endpoints still require an authenticated session and the server health
  endpoint must be HTTP 200/Healthy after deployment. A current Production encrypted mapping
  decryption issue cannot be solved from the frontend; it requires the protected Repair action
  with the real operator-owned connection value.
