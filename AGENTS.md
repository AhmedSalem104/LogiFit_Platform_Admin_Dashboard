# Platform Dashboard Execution Rules

## Written hand-off

Documentation is synchronized across `LogicFit` (Backend), `LogiFit_Angular` (Tenant UI), and
`LogiFit_Platform_Admin_Dashboard` (Platform UI). A cross-repository feature is incomplete until
every affected repository records the matching API contract, user flow, screen behavior,
permissions, architecture, and operational impact in the same task. If one repository is not
affected, its Pull Request impact list must say `No documentation impact` and give the reason.
Always distinguish local work, an open PR, merge to `develop`, release, deployment, and
production verification; never describe one state as another.

- Keep `docs/ADMIN-WORKSPACE.md`, `docs/SCREEN-CATALOG.md`, `docs/SCREEN-OPERATIONS-GUIDE.md`,
  `docs/ARCHITECTURE-AND-INTEGRATION.md`, and `docs/STYLE-GUIDE.md` aligned with
  every screen, service, permission, design, or operational change.
- `docs/API-ENDPOINT-CATALOG.md` mirrors the source-derived catalog in the
  backend repository. Refresh it after any controller contract change by running
  `..\LogicFit\Scripts\Export-ApiEndpointCatalog.ps1` then copying the output.
- Authentication, identity, OTP, session, invitation, workspace-selection, permission, or
  access-gate changes must update this repository's admin workspace, screen, architecture, and
  style references plus the Backend canonical auth flow and Tenant UI documentation when affected.
- Every cross-repository Pull Request must list documentation impact for all three repositories
  and the required merge/deployment order.
- Do not record credentials, JWTs, connection strings, backup artifacts, payment
  proofs, or publish profiles in documentation or Git.

## Safety and quality

- The UI is permission-aware; the Platform API remains the authority for all
  permissions, tenant isolation, finance, backup, and lifecycle decisions.
- Keep immutable operational and financial history read-only. Use explicit
  lifecycle actions rather than generic edit/delete controls.
- Run `npm run build` before handing off dashboard changes.
