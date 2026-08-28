@replit.md

## Claude Code specifics

Everything in replit.md applies. These rules cover mechanics that differ for Claude Code.

### Environment
- This repo lives in a Replit workspace. Replit's Run button owns the dev server and the port binding. Do not start, stop, or restart a dev server. If a change needs to be seen running, say so and I will run it.
- Do not modify .replit or replit.nix. If a change appears to require it, stop and tell me.
- Secrets come from Replit Secrets as environment variables. Read from process.env. Never hardcode a secret, never print or echo an env value, never write one into a file.
- DATABASE_URL points at a real PostgreSQL database holding live user scripts. Never run drizzle-kit push, a migration, or destructive SQL without asking first.

### Checkpoints
- The "use Checkpoints" rule in replit.md is a Replit Agent feature you do not have. Your equivalent: after each unit of work that passes tests, stage and commit with a clear message. Do not push.

### Verify before reporting done
- Run the test suite and the typecheck defined in package.json before claiming a task is complete. Use the scripts that already exist there, do not invent commands.
- The two pre-existing TypeScript errors in ScriptBuilderDialog.tsx and GameTracker.tsx are expected. Confirm your change added no new ones.

### Shared repo
- Replit Agent also works in this repo. Files may have changed since your last session. Read before you write.
