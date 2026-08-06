# Existing Backup screen review — 2026-08-05

Related: [LogicFit #239](https://github.com/AhmedSalem104/LogicFit/issues/239) and
[LogicFit #230](https://github.com/AhmedSalem104/LogicFit/issues/230).

## State

The implementation slice is complete locally on the #239 branch. The existing `/backups` screen
was extended; no new screen was created. No database, tenant mapping, database resource, or
Production deployment was changed.

## What the current screen does

- Route: `/backups`.
- Permission: `ManagePlatformBackups`.
- Service calls: legacy file list/status/download plus batch create/history/retry and restore
  capability discovery.
- Visible data: readiness, BACPAC format, retention, UTC schedule, count, file name, creation time,
  size, and status.
- Visible mutations: confirmed batch create and retry for failed/partial batches, plus authorized
  artifact/manifest download. Backup records remain immutable; there is no generic edit/delete
  action.

## What it does not yet do

The screen now defaults to `FullSystem` (platform database plus all active tenant mappings) and
also exposes the server-owned `AllTenants`, `AllGyms`, `AllFreelance`, and `Platform` scopes. It
shows per-target status, partial/failed artifacts, retry state, checksum, manifest download, and
safe restore capability state. It does not render database names, connection strings, passwords,
protected values, absolute paths, or raw exception details.

The Backend reports Monster restore as `ManualOnly` and disabled, so the Dashboard must not add an
active restore mutation while that capability remains disabled. A safe future UI may show the
capability and operator handoff state without claiming that restore or rollback was performed.

## Implemented contract

1. The Backend `BackupArtifactDto` returns `Sha256`; batch start/finish events are recorded in the
   platform Audit Log.
2. The existing screen calls `/batch`, `/batches`, `/batches/{id}/retry`, and
   `/restores/capabilities` under the existing `ManagePlatformBackups` permission.
3. Creation and retry require explicit confirmation. Retry is available only for `Failed` or
   `Partial` batches.
4. `ManualOnly` or disabled restore capability is displayed as an operator handoff state; no
   restore mutation was added.
5. API catalog and dashboard flow/screen documents were refreshed. `npm run build` and the
   backend contract tests passed locally.

## Acceptance boundary

This screen change is not a Production backup/restore verification. Production work remains a
separate protected operation requiring a verified backup, migration review, CI success, health
checks, rollback plan, and explicit operator approval. Missing or failed batch evidence must block
mapping-changing or destructive operations.
