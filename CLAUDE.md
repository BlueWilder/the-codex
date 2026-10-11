@replit.md

## Claude Code specifics

Everything in replit.md applies. These rules cover mechanics that differ for Claude Code.

### Environment
- This repo lives in a Replit workspace. Replit's Run button owns the dev server and the port binding. Do not start, stop, or restart a dev server. If a change needs to be seen running, say so and I will run it.
- Do not modify .replit. If a change appears to require it, stop and tell me.
- Secrets come from Replit Secrets as environment variables. Read from process.env. Never hardcode a secret, never print or echo an env value, never write one into a file.
- DATABASE_URL points at a real PostgreSQL database holding live user scripts. Never run drizzle-kit push, a migration, or destructive SQL without asking first.
- Replit's package mirror (`package-firewall.replit.local`, the resolved URL for many entries in package-lock.json) is unreachable off-Replit, so `npm ci` fails there. The accepted workaround: temporarily rewrite those URLs to `https://registry.npmjs.org/` to install, then restore package-lock.json (`git checkout -- package-lock.json`, or reapply real dependency changes on top). Integrity hashes still verify every tarball. Never commit a lockfile change that only redirects the mirror.

### Checkpoints
- The "use Checkpoints" rule in replit.md is a Replit Agent feature you do not have. Your equivalent: after each unit of work that passes tests, stage and commit with a clear message.
- When a task is complete, commit and push to main. Replit pulls from main and publishes manually, so a push does not deploy on its own.

### Verify before reporting done
- Run the typecheck with `npm run check` before claiming a task is complete. It currently passes clean, so treat any error it reports as one your change introduced. The test suite is `npx vitest run` (there is no test script in package.json).
- `npx vitest run` is safe: storage is injected, so no test issues a query. DATABASE_URL still has to be set, since server/db.ts throws at import without it, but nothing ever connects. Do not run the *.integration-test.ts files against production; they read and write a real database and need a throwaway one.

### Shared repo
- Replit Agent also works in this repo. Files may have changed since your last session. Read before you write.

### Removed code
- The legacy games and scripts API (`/api/games`, `/api/scripts`, the `shared/routes.ts` contract, and the `use-games` / `use-scripts` hooks) was removed. It had no auth or ownership checks and nothing used it. The `games` and `scripts` tables and their schema in `shared/schema.ts` remain for now. Startup seeding of the official scripts still writes to `scripts` through `storage.getScripts` / `storage.createScript`. Do not drop or alter these tables without asking.
- Some replit.md text still mentions removed code (GameSetup.tsx, and `shared/routes.ts` as the API contract). That code no longer exists.
