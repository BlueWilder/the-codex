@replit.md

## Claude Code specifics

Everything in replit.md applies. These rules cover mechanics that differ for Claude Code.

### Environment
- This repo lives in a Replit workspace. Replit's Run button owns the dev server and the port binding. Do not start, stop, or restart a dev server. If a change needs to be seen running, say so and I will run it.
- Do not modify .replit. If a change appears to require it, stop and tell me.
- Secrets come from Replit Secrets as environment variables. Read from process.env. Never hardcode a secret, never print or echo an env value, never write one into a file.
- DATABASE_URL points at a real PostgreSQL database holding live user scripts. Never run drizzle-kit push, a migration, or destructive SQL without asking first.

### Checkpoints
- The "use Checkpoints" rule in replit.md is a Replit Agent feature you do not have. Your equivalent: after each unit of work that passes tests, stage and commit with a clear message. Do not push.

### Verify before reporting done
- Run the typecheck with `npm run check` before claiming a task is complete. It currently passes clean, so treat any error it reports as one your change introduced. The test suite is `npx vitest run` (there is no test script in package.json).
- npx vitest run is safe and needs no database. Do not run the *.integration-test.ts files against production.

### Shared repo
- Replit Agent also works in this repo. Files may have changed since your last session. Read before you write.
