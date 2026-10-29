# B. B. Bale Chambers project audit

Audit date: 2026-10-29
Source archive: `NEW-BBBALE-main.zip`

## Summary

The source contains a real persistence/synchronization defect: `src/worker.ts` had a D1 snapshot loader (`loadFromD1`) but did not call it from the sync pull/version routes or before accepting a sync push. Worker isolate memory was therefore treated as the live state even though it is not durable. The sync push route also used only `env.DB`, ignored the persistence result, and returned success even if no D1 binding was present or persistence failed.

A targeted patch is included for restoring the master snapshot from D1, loading the latest snapshot before merge/push, requiring a confirmed D1 snapshot write before returning sync success, and including deletion tombstones in the pull payload. The reset endpoint is now disabled to prevent accidental destructive resets. Hard-coded counsel bypass strings were replaced with a Worker secret binding, and the CI Node version was raised to 24.12.0 to match Firebase packages in the lockfile that declare Node >=24.12.0.

## Changes in this ZIP

- `src/worker.ts`
  - `loadFromD1` is now called by `/api/sync/version`, `/api/sync/pull`, `/api/sync/push`, and login verification.
  - Sync pushes merge against the latest saved D1 master snapshot.
  - Sync push now returns an error if the D1 binding is absent or the master snapshot write is not confirmed.
  - Snapshot table setup only creates `chambers_sync` if absent. It does not drop or clear any existing tables/data.
  - `/api/sync/pull` now includes `deletedBranchIds` and `deletedUserIds` in the returned data payload.
  - `/api/sync/reset` no longer clears in-memory or D1 data; it returns HTTP 403.
  - Counsel bypass uses the `COUNSEL_BYPASS_TOKEN` Worker secret instead of hard-coded source-code tokens.
  - Password changes are not reported successful unless the D1 snapshot write is confirmed.
- `.github/workflows/deploy.yml`: CI uses Node `24.12.0`.
- `.env.example`: documents that `COUNSEL_BYPASS_TOKEN` must be configured as a Worker secret and must not be committed as a real value.

## Checks completed

- Enumerated all 77 files in the source project.
- Ran TypeScript transpile/syntax diagnostics over 57 `.ts` and `.tsx` source files: **0 syntax diagnostics**.
- Parsed `package.json`, `package-lock.json`, Firebase JSON configuration files, and `wrangler.jsonc` as JSON successfully.
- Executed `d1-schema.sql` against SQLite: passed; 13 tables were created in an in-memory test database.
- Inspected sync, storage, login, reset, D1 binding, Firebase, and deployment configuration paths.

## Checks not completed

- Full `npm ci` timed out twice in the available environment.
- `tsc --noEmit` could not run because dependencies were not installed (`vite/client` type definitions missing).
- Vite production build, Wrangler dry-run, and live API tests were not completed.
- No Cloudflare deployment or remote database writes were performed.

## Important unresolved issues — do not treat this archive as production-approved

1. **Live database identity is unverified.** The configuration in the ZIP references database ID `eb94e59f-64ac-402e-95da-09747a0e51c7` and Worker name `bb-bale-chambers`. The connected Cloudflare account investigation did not return a D1 database and showed a Worker named `bbbale`. Confirm the actual production Worker and D1 binding/database ID before deployment. Do not change the database ID by guesswork.
2. **API authorization is not production-safe.** `/api/sync/pull` exposes the full snapshot, including user records, and sync endpoints do not require a verified staff session. CORS is `*`. A complete server-side authentication/session design is still required before this app should hold confidential legal/client records in production.
3. **Passwords are stored in plaintext in the snapshot and some login responses return user objects.** Password hashing, safe session issuance, and removal of password fields from API responses are still required.
4. **Sync merge semantics do not fully support deletion.** The current merge routine merges non-empty arrays and retains records absent from an incoming array. Tombstones exist for branches/users only. Deletions in other collections can reappear; fixing this safely requires explicit per-record tombstones/versioning or a concurrency-safe authoritative write model.
5. **Concurrent pushes can still race.** Two devices can read the same snapshot and write competing updates. This patch reduces stale-isolate overwrites but does not implement compare-and-swap/transactional conflict resolution.
6. **Snapshot-only persistence is the canonical storage path in this patch.** The existing normalized business tables are left untouched to avoid schema-dependent writes silently failing. If external reporting depends on those normalized tables, that integration needs a separate tested migration/synchronization implementation.
7. **The source includes a default-password flow (`Admin@2026`) and client-visible authentication logic.** This should be replaced with secure server-side authentication before production use.

## Safe next step

Do not deploy until the production Worker and D1 database binding are verified and the API authentication issues above are addressed. Preserve a D1 export/backup before any future production migration. This audit ZIP has not been deployed and has not intentionally modified any remote data.
