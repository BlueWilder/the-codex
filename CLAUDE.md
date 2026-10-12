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

### Home page
`pages/Home.tsx` (`/`) is on the Game Mode visual system: dark shell, parchment panels. Top to bottom:
- Brand block: "Codex" in Fraunces 44px with the amber gradient, then the quote in Crimson Text italic. Keep the quote text exactly as it is.
- Resume: only when `clocktower_player_game` holds a game (read through `usePlayerGame`). One parchment card with the script name (or "No Script") and "N seats · M alive"; it links to `/game`.
- Play: one parchment panel of script cards, the user's custom scripts first (cloud when signed in, browser when not), then official, then community. Six show, then an "All N scripts" link expands the list in place. Official cards read "N characters · official"; others show townsfolk / outsider / minion / demon counts from `resolveScriptCharacters`.
- Tapping a Play card goes to `/game?script=<id>` (`newGamePath`). With a saved game it first confirms "Replace your current game?". The saved game is not touched until Start Game is pressed, so backing out of setup keeps it.
- Scan / Import / My scripts: three dark buttons. Scan uses `useScriptScan` (`hooks/use-script-scan.ts`, shared with the setup wizard) and opens `ScriptBuilderDialog` to review. Import opens `ScriptBuilderDialog` with `initialShowImport`. My scripts opens a drawer with `CustomScriptList` (`components/CustomScriptList.tsx`, shared with the setup wizard's script drawer): tap to play, pencil to edit, Create Custom Script. These only save scripts; they never start a game.
- Footer: Mage Productions credit, the disclaimer, and the Community Created Content mark.
- There is no Enter Game Mode button or Manage Friends link on Home. Game Mode is the header's game icon or a Play card; friends live in the header menu and the setup wizard.
- `ScriptBuilderDialog` resets its state whenever `initialCharacters` (or its other initial props) changes identity, so pass stable values (Home memoizes them).

### Game tracker layout
The `/game` page lives in `client/src/features/game/`. `pages/Game.tsx` is a thin page: it reads state through `useGameTracker`, shows the loader, and renders `SetupWizard` or `GameTrackerView`. `/game?script=<id>` always shows `SetupWizard` with `initialScriptId`, even over a saved game; starting replaces the save and drops the query.
- `state/use-player-game.ts`: all game state and its localStorage persistence (key `clocktower_player_game`). Changing the key or the `PlayerGame` shape breaks games in progress on deploy. `hooks/use-player-game.ts` only re-exports it, for the tests.
- `state/use-game-tracker.ts`: `usePlayerGame` plus `updatePlayerName`.
- `types.ts`: game model types (re-exported from state) and `ClaimDescriptor`. `claims.ts`: claim display helpers shared by views and the seat sheet (`resolveClaimDescriptor`, `latestClaimId`).
- `GameSetup.tsx` (`SetupWizard`): one screen with script picker, player count, friends, start. With `initialScriptId` the script is preselected (cloud scripts once they load; a manual pick wins) and the page scrolls to the player count card.
- `GameTrackerView.tsx`: the active game shell (script header, scoreboard, tab switch, bottom nav). It owns the UI state (selected seat, open dialogs, active tab) and wires the views, the seat sheet and the dialogs.
- `views/`: one file per bottom tab. `CircleView.tsx` (Circle tab, internal key `circle`, test id `nav-grim`; `CircleSeatingChart` with drag positioning), `ListView.tsx` (List, `SortablePlayerCard` with drag-to-reorder), `NotebookView.tsx` (Notes tab, key `log`, test id `nav-notebook`), `GameScriptView.tsx` (named to stay distinct from `components/character/ScriptView`).
- `SeatSheet.tsx`: the seat sheet, the one place a seat's claims, alive/dead state, menu actions and note are edited (see below). `AliveToggle.tsx`: the shared alive/dead toggle and `isSeatDead`.
- `dialogs/`: one file per dialog or drawer (`AddPlayerDialog`, `AddTravelerDialog`, `PlayAgainDialog`, `ScriptCharacterDrawer`). `ScriptCharacterDrawer` is the Script tab's character card drawer, not a seat surface.
- Tests import several of these from `@/pages/Game`, which re-exports them. Keep those re-exports when moving or renaming a component.

### Seat sheet
Tapping a seat anywhere (Circle medallion, List row or name) opens `SeatSheet`, a parchment bottom sheet (vaul `Drawer`). It replaced the old player detail drawer and the Set Claim / Select Characters picker; both are gone.
- Header: name in Fraunces 26px (an unnamed seat reads "Player N"), the 44px `AliveToggle` (smiley alive, skull dead; tapping calls `toggleAlive`), and a ⋮ menu with Rename, Make Traveler and Remove Player. Traveller seats get Mark Exiled and Mark Left there instead of Make Traveler, and Remove Player on a traveller goes through `removeTraveler` so the leave is logged. No seat number in the sheet. Rename opens an inline field with the From Friends picker.
- Claim chips: every claim the player has made, in the order made, as team-tinted pills with an x that calls `removeClaim`. Chips do nothing else when tapped.
- Search plus the script's characters (all characters without a script, never script Travellers or Fabled, plus the generic Traveller claim) grouped by team. Tapping a card calls `addClaim` and the sheet stays open. Characters this player already claimed render at 60% opacity and are disabled.
- The seat's note (`GamePlayer.notes`) is pinned at the bottom: a one-line field with a pencil that expands to a textarea on focus.
- There is no primary or believed claim. Circle and List show `latestClaimId(player)` under the name in team color: the claim with the latest `claimRecords` timestamp, ties to the later position in `claims`, and the last claim for legacy saves without records. Older claims show only in the sheet. `claims[0]` has no special meaning now. Old saves load unchanged (same key, same `PlayerGame` shape).
- Dead means `status !== 'alive'` (`isSeatDead`). Dead seats keep the skull medallion and dimming in both views; the List row's toggle is the same `AliveToggle`.
- jsdom has no pointer capture, and vaul calls it when a pointerdown bubbles through the sheet (for example opening the ⋮ menu in a test). Tests that open the seat menu stub `Element.prototype.setPointerCapture`; see `tests/game-seat-sheet.test.tsx`.

### Game Mode visual system
Game Mode (setup and active game), Home, the Character Reference page, and their dialogs and sheets use "parchment sheet in a dark shell". Tokens are CSS variables in `client/src/index.css`; parchment, ink and team values come from the Script tab's `ScriptSheet`, so keep the two in step.
- Shell: `--shell-chrome`, `--shell-border`, `--shell-gold` (titles, active nav), `--shell-inactive`, `--attention`. Page background stays `--background` + the body glow.
- Parchment: `--parchment-panel` (+ `-from`/`-to` gradient), `--parchment-raised`, `--parchment-border`, `--parchment-rule`, `--parchment-control` (+ `-border`, `-hover`), ink `--parchment-ink`, `-ink-body`, `-ink-muted`, `-ink-faint`, `-ink-link`.
- Team on parchment: `--parchment-<team>`, `-tint`, `-ring`; use `teamParchment(team)` from `lib/team-style.ts`. Dark-shell team colors stay in `teamCard`/`teamBadge`/`teamRing`.
- Panel pattern: each tab renders one `.game-panel` (14px radius, 12px padding) on the shell; cards inside use `.game-card` (raised, 1px border, 10px radius); small caps labels use `.game-label`; header and nav use `.game-chrome`. `.game-panel` and `.parchment-scope` re-point the shadcn color variables, so semantic classes (`text-foreground`, `border-border`, `Input`) render as ink on parchment inside them. Radix portals (dialogs, popovers) render outside the panel and stay dark unless given `.parchment-scope` themselves.
- Characters on parchment: `CharacterMedallion` (team tint, ring, token art or team glyph) plus name in Fraunces. `CharacterCard` (Reference and the Script tab drawer) adds `TeamBadge variant="label"`; the seat sheet's character cards use a 36px medallion with the ability text instead. `TeamBadge`, `NightBadges`, `JinxBadge` and `JinxList` are parchment-only now.
- Tailwind cannot apply an opacity modifier to a CSS-variable color (`border-[var(--x)]/40` silently drops the class). Use a solid token or another token instead.

### No day/night tracking
The player decides what day it is; the UI shows no phase (no phase pill, no "Night 2" anywhere, no death or claim day stamps, no Notes chapter headings). `use-player-game` still keeps `phase`, `currentDay`, `advancePhase`/`regressPhase` and the phase stamps on death records and notes, only because `tests/player-game-phase.test.ts`, `player-game-notebook.test.ts` and `game-notebook-log.test.tsx` pin that behavior. Nothing in the UI calls advance/regress, so new records stay on Night 1. Old saves load unchanged. Removing that state means rewriting those tests; ask first.
