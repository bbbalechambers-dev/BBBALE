# B. B. Bale Chambers — Rebuild status

## What this package is
This is a staged rebuild based on the supplied project source. It preserves the existing React/Vite interface and its public pages, portals, staff modules, and data types while carrying forward the targeted D1 snapshot restoration/write-confirmation patch in `src/worker.ts`.

## Data safety choices
- The package is configured for a separate staging Worker (`bbbale-chambers-rebuild-staging`).
- The D1 database name and ID are deliberately placeholders because the existing production database identity could not be verified from the connected Cloudflare account.
- `scripts/predeploy-check.mjs` blocks deployment while placeholders remain.
- No production database was reset, migrated, or written by preparing this archive.
- Do not point staging at a new empty database and assume that fixes existing records. First identify and back up the existing production database.

## Work included
- Load the latest saved D1 `master` snapshot on sync pull/version and before sync push.
- Confirm snapshot persistence before reporting sync success.
- Include the existing branch/user deletion markers in sync pull responses.
- Disable the destructive sync-reset route.
- Replace hard-coded counsel bypass values with a Cloudflare Worker secret binding.
- Add a pre-deployment guard and configuration documentation.

## Not yet production-approved
The following remain release blockers and must be addressed/tested before this system is used for confidential legal records:
1. Full server-side authentication and authorization for every sync and administrative API route.
2. Password hashing and removal of passwords from API responses and snapshots.
3. Conflict-safe concurrent updates and complete deletion/tombstone handling for every collection.
4. Verification of the correct existing D1 database and a tested backup/restore procedure.
5. Dependency installation, full TypeScript check, Vite production build, Wrangler dry-run, and end-to-end multi-device tests.

## Validation performed for this package
- JSON/config parsing and schema validation should be rerun after installing dependencies.
- The previous source-level audit reported zero TypeScript/TSX syntax diagnostics across 57 source files and a successful isolated SQLite schema execution.
- A full build was not completed in the current environment because the installed dependency tree was incomplete (`vite` executable unavailable).

This archive is a staged development deliverable, not a claim that the live system has been repaired or that the replacement is safe to deploy to production today.
