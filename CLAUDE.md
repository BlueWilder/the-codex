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
- Some replit.md text still mentions removed code (`pages/GameSetup.tsx`, and `shared/routes.ts` as the API contract). That code no longer exists. replit.md's "GameSetup.tsx is an older, unrouted page, do not edit it" rule refers to the deleted `pages/GameSetup.tsx`, not to `features/game/GameSetup.tsx`, which is the live setup screen.

### Game tracker layout
The `/game` page lives in `client/src/features/game/`. `pages/Game.tsx` is a thin page: it reads state through `useGameTracker`, shows the loader, and renders `SetupWizard` or `GameTrackerView`.
- `state/use-player-game.ts`: all game state and its localStorage persistence (key `clocktower_player_game`). Changing the key or the `PlayerGame` shape breaks games in progress on deploy. `hooks/use-player-game.ts` only re-exports it, for the tests.
- `state/use-game-tracker.ts`: `usePlayerGame` plus `updatePlayerName` and `setPrimaryClaim`.
- `types.ts`: game model types (re-exported from state) and `ClaimDescriptor`. `claims.ts`: claim display helpers shared by views and dialogs.
- `GameSetup.tsx` (`SetupWizard`): script picker, player count, friends, start.
- `GameTrackerView.tsx`: the active game shell (script header, scoreboard, tab switch, bottom nav). It owns the UI state (selected player, open pickers and dialogs, active tab) and wires the views and dialogs.
- `views/`: one file per bottom tab. `CircleView.tsx` (Grim, `CircleSeatingChart` with drag positioning), `ListView.tsx` (List, `SortablePlayerCard` with drag-to-reorder), `NotebookView.tsx`, `GameScriptView.tsx` (named to stay distinct from `components/character/ScriptView`).
- `PlayerDetailDrawer.tsx`: the per-player claims and notes drawer.
- `dialogs/`: one file per dialog or drawer (`AddPlayerDialog`, `AddTravelerDialog`, `CharacterPicker`, `PlayAgainDialog`, `ScriptCharacterDrawer`).
- Tests import several of these from `@/pages/Game`, which re-exports them. Keep those re-exports when moving or renaming a component.
