# Platform Dashboard Execution Rules

## Written hand-off

- Keep `docs/ADMIN-WORKSPACE.md`, `docs/SCREEN-CATALOG.md`, `docs/SCREEN-OPERATIONS-GUIDE.md`,
  `docs/ARCHITECTURE-AND-INTEGRATION.md`, and `docs/STYLE-GUIDE.md` aligned with
  every screen, service, permission, design, or operational change.
- `docs/API-ENDPOINT-CATALOG.md` mirrors the source-derived catalog in the
  backend repository. Refresh it after any controller contract change by running
  `..\LogicFit\Scripts\Export-ApiEndpointCatalog.ps1` then copying the output.
- Do not record credentials, JWTs, connection strings, backup artifacts, payment
  proofs, or publish profiles in documentation or Git.

## Safety and quality

- The UI is permission-aware; the Platform API remains the authority for all
  permissions, tenant isolation, finance, backup, and lifecycle decisions.
- Keep immutable operational and financial history read-only. Use explicit
  lifecycle actions rather than generic edit/delete controls.
- Run `npm run build` before handing off dashboard changes.
