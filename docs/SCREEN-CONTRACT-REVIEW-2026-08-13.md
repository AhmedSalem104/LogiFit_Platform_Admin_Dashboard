# Platform admin screen contract review — 2026-08-13

## Creation entry point

New Gym and FreelanceCoach creation is owned by `/workspace-applications`. The `/tenants` page is
the lifecycle list; its create action routes to the unified application screen. This guarantees
that a request creates the plan snapshot, pending payment, identity link, subscription, and
retryable provisioning record before any dashboard access can be granted. The legacy direct form
is not used by the dashboard because it cannot supply those prerequisites.

## Database resources

`/database-resources` sends connection material only to the server for validation. The server
parses and normalizes the SQL Server connection, verifies `DB_NAME()`, protects the value, and
returns safe metadata only. A malformed or mismatched connection is a `400` validation result; a
valid connection that cannot be opened is a `422` connection-test failure. The page separates
loading, error, and empty states so an API failure is never displayed as an empty pool.

## Regression checks

- `GET /api/platform/tenants` uses a separate cross-tenant member-count query to avoid fragile
  correlated EF translation.
- `GET /api/platform/dashboard/tenants` uses the same safe page-level member-count strategy; the
  dashboard’s tenant widget no longer reintroduces the old correlated query.
- The workspace-application list tolerates legacy duplicate payment rows by selecting the newest
  row deterministically, so old data cannot turn the screen into a 500 response.
- Resource listing ignores historical backup rows whose resource reference is null.
- Repeated lifecycle clicks are blocked while the first request is pending.
- Legacy tenant callers can provide `Idempotency-Key`; the dashboard uses the unified flow.
