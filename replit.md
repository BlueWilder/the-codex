# The Codex - Blood on the Clocktower Character Reference

## Overview

The Codex is a character reference application for Blood on the Clocktower, a social deduction tabletop game. The app provides comprehensive character information including abilities, night order, tips and tricks, bluffing strategies, and jinx interactions. Characters can be filtered by script (Trouble Brewing, Bad Moon Rising, Sects & Violets) and team type. Also includes all 57+ experimental characters from The Carousel edition.

## User Preferences

Preferred communication style: Simple, everyday language.

No em dashes in user-facing copy. Use commas, periods, or parentheses.

## Agent Prompt Contract

Durable rules for every build/update prompt on this repo. Prompts may reference this section instead of restating these.

- No em dashes in user-facing copy. Use commas, periods, or parentheses.
- data-testid on every new interactive or display element. Formats: button-<action>, input-<field>, text-<label>, step-<name>. Match existing names (e.g. button-next-step, input-player-name-N, text-player-count).
- Tests live in tests/**/*.test.{ts,tsx} (vitest, jsdom, @testing-library/react, per-file jsdom directive). Any prompt that adds, removes, or alters a user-facing flow must add or update a test there.
- Two known pre-existing TypeScript errors exist in ScriptBuilderDialog.tsx and GameTracker.tsx. Do NOT fix them as a side effect; report only, unless the task is explicitly to fix them.
- The /game route renders client/src/pages/Game.tsx. GameSetup.tsx and GameTracker.tsx are a separate, older DB-backed flow that is NOT on /game. Do not edit them unless the task names them.
- Stay in scope. Do not silently fix adjacent bugs or refactor outside the named change. Report drift for follow-up.
- Shared character UI lives in client/src/components/character/ (ScriptView, CharacterCard, TeamBadge, NightBadges, JinxList). Reuse it; do not duplicate card grids or team-color logic. Team colors flow from lib/team-style.ts; night order from lib/night-order.ts; script resolution from lib/script-resolve.ts.
- Dark gothic only, no light mode, no external brand palette.
- Use Checkpoints after each major feature works. Store secrets in env vars, never hardcode. Report every file changed and flag any system file (.replit, .gitignore) touched.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state, React useState for local UI state
- **Styling**: Tailwind CSS with a dark Gothic theme (crimson, amber, parchment tones)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for page transitions and UI interactions
- **Drag & Drop**: @dnd-kit for sortable lists and token manipulation
- **Typography**: Fraunces (display and all headings, replaced Cinzel Decorative app-wide 2026-06-28), Crimson Text (serif body), Plus Jakarta Sans (UI labels, counts, pills), Homemade Apple (handwriting accent). Font CSS variables in index.css: --font-display (Fraunces), --font-serif (Crimson Text), --font-sans (Plus Jakarta Sans), --font-mono (system mono), --font-handwriting (Homemade Apple).

### Design System
- **Theme**: dark gothic only. There is NO light mode. Do not add light-mode styling or apply any external brand palette. The Codex has its own identity: charcoal background, parchment text, antique gold and amber accents, crimson primary.
- **Team color system**: driven by `getTeamColor` in `client/src/pages/Reference.tsx`. Each team tints the card text, border, and background. Values: Townsfolk `text-blue-400`, Outsider `text-blue-200`, Minion `text-red-400`, Demon `text-red-600`, Traveler `text-slate-300`, Fabled `text-[#efc344]` (gold). Preserve this per-team tinting on any card surface.
- **Storyteller accent**: the "How to Run" host instructions use a fixed amethyst (`#c79fe6`) regardless of team, inside a panel with border `#3d2f57`, a Wand2 icon, and a small "Storyteller" tag. Applied in `Reference.tsx` and `STWizard.tsx`. Keep host-facing content visually distinct from player-facing content.

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: REST API with typed routes defined in `shared/routes.ts`
- **Build**: esbuild for server bundling, Vite for client

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains table definitions
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Migrations**: Drizzle Kit for database migrations (`drizzle-kit push`)

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components (shadcn/ui based)
    pages/        # Route pages (Home, Reference, Game, Introduction)
    lib/          # Utilities and game data (game-data.ts contains all character info)
server/           # Express backend
  routes.ts       # API route handlers
  storage.ts      # Database abstraction layer
  db.ts           # Drizzle database connection
shared/           # Shared between client and server
  schema.ts       # Drizzle table definitions
  routes.ts       # API contract with Zod validation
```

### Game Data
Character data is stored client-side in `client/src/lib/game-data.ts` with full character information including:
- Abilities and night order
- Setup effects (Baron adds outsiders, etc.)
- Reminder tokens
- Extended summaries, tips, and bluffing advice
- Jinx interactions between characters
- Storyteller "How to Run" instructions for all characters
- **Data Verification (Mar 2026)**: Complete audit of all character editions against official wiki:
  - Core editions (TB, BMR, S&V): 100% verified accurate
  - Experimental characters: 71 verified against wiki with fixes applied:
    - Jan 2026: Psychopath, Organ Grinder, Vizier, Riot, Alchemist, Lycanthrope, Nightwatchman, Boomdandy
    - Mar 2026: Wizard (completely wrong ability), Princess (completely wrong ability), Deus ex Fiasco (completely wrong ability), Damsel (wording), Snitch (wording), Al-Hadikhia (wording), Plague Doctor (wording), Yaggababble (wording)
- **Built-in Scripts**: Trouble Brewing, Bad Moon Rising, Sects & Violets (official, with synopses), The Wild Hunt (community, by Logan & Brad), The Ship of Theseus (community, by TopazChicken)
- **Custom Script Synopsis**: Optional synopsis text field in script editor; stored in DB (`synopsis` column on `customScripts` table) or localStorage; displayed on Night Sheet with same collapsible block as base scripts
  - Community scripts use experimental characters; Reference page filter uses `OFFICIAL_SCRIPTS` character lists instead of `edition` matching

### Introduction Page
A beginner-friendly guide at `/introduction` explaining Blood on the Clocktower to new players:
- **Hero**: "Welcome to Ravenswood Bluff" with atmospheric intro
- **The Setup**: Two teams, hidden roles explanation
- **How It Plays**: Night/Day/Execution phase rhythm
- **What Makes This Different**: Three key differentiators (info can be wrong, dead players stay in, Storyteller plays too)
- **Your Role**: Expandable accordions for Townsfolk, Outsiders, Minions, Demons
- **Quick Tips**: Two-column layout with tips for good vs evil players
- **First Game Mindset**: Encouragement for new players
- **CTA**: Links to Character Reference

### Storyteller Mode (Bag Builder)
> DEPRECATED, slated for removal in S5

A Storyteller-specific setup flow forked from the New Game wizard:
- **Entry point**: "Storyteller" button on Step 1 (player count) of the regular setup wizard
- **ST Step 2 — Script Selection**: Reuses the same script selector UI (official, community, custom scripts)
- **ST Step 3 — Bag Builder**: Character grid grouped by team (Townsfolk, Outsiders, Minions, Demons)
  - Cards show name + ability text, click to select/deselect
  - Lock/unlock selected characters (gold ring = locked, stays through shuffle)
  - Live running tally: green = exact count, red = over, default = under
  - Shuffle button: randomly fills unlocked slots to meet required counts
  - Clear All: resets all selections and locks
  - Accept Bag: enabled only when all tallies are exactly met
- **Night Sheet** (post-Accept Bag): Two tabs (First Night / Other Nights)
  - Shows ALL characters from the script sorted by official night order (roles can swap/enter mid-game)
  - Bag characters highlighted with solid border and amber dot indicator; non-bag characters dimmed with dashed border
  - Active/inactive toggle: power icon on left side of each row; inactive characters get reduced opacity and strikethrough name
  - Wizard header (step indicators, title) hidden — Night Sheet is the ST's standalone home base
  - Each row: order number, character name, team badge (color-coded), ability text
  - Expandable rows: tap to reveal How to Run, Tips & Tricks, and Reminder tokens
  - "End Session" button clears state and returns to setup
- **Persistence**: ST session saved to localStorage (`clocktower_st_session` key) with script info, bag IDs, and active/inactive IDs; survives browser refresh; Game.tsx auto-enters ST mode if session exists
- **Component**: `client/src/components/STWizard.tsx`; exports `getStoredSTSession()` and `clearSTSession()` helpers
- **Back navigation**: Returns to Step 1 of the regular wizard
- Player flow (Steps 1→2→3) is completely unchanged

### Game Mode (Player Tracker)
A localStorage-based player tracking tool at `/game` for note-taking during games:
- **Setup wizard**: 4-step linear flow, script-first: (1) Select a Script (or All Characters), (2) read-only ScriptView preview of the chosen script, (3) player count (5-20), (4) player names. No Player/Storyteller role fork.
- **Script selection**: official, community, or custom scripts, with Create Custom Script and Scan Paper Script (saved as custom, auto-selected) inline. All Characters skips the preview.
- **Preview**: reuses the shared read-only ScriptView (client/src/components/character/ScriptView.tsx); characters resolved via resolveScriptCharacters(script, { includeTravellers: false, includeFabled: false }) so the preview matches the in-game claim picker.
- **Player cards**: Grid display showing name, alive/dead status, claim badges, indicator icons
- **Player detail drawer**: Claims (with team color-coded badges), notes, nomination history by day
  - Claims section appears first (more frequently accessed during play)
  - Tapping a claim badge opens character preview with ability, tips, and link to full reference
  - Travelers excluded from claims list (they're always known before game starts)
  - "Convert to Traveler" option for mid-game player conversion
- **Trust slider**: Horizontal gradient bar (red→tan→green) on each player card with draggable brass knob (0-100 scale, 50=neutral). Disabled with reduced opacity for dead players. Component: `client/src/components/TrustSlider.tsx`
- **Day tracker**: Scoreboard-style header with alive/dead counts, votes to execute, available votes, and script name badge
- **View modes**: List view and Circle seating chart view (toggle in header)
  - Circle view arranges players in a full 360° circle; scoreboard auto-collapses to a compact summary bar to maximize space
  - Free-drag positioning: players can be dragged anywhere on the circle canvas; custom positions saved as normalized `circleX`/`circleY` (0-1) on `GamePlayer`
  - Dragging a player re-sorts the players array clockwise from 12 o'clock, which also updates list view order
  - "Circle Up" button appears when custom positions exist; clears all `circleX`/`circleY` to restore default circle
- **Persistence**: Game state saved to localStorage, survives page refresh
- **Nomination system**: Dual recording modes:
  - **Full Vote Record**: Track individual player votes with auto ghost vote handling
  - **Quick Log**: Simple vote count and result entry (Failed/On Block/Executed) without individual voter tracking
- **Chopping Block system**: Official BOTC execution rules:
  - First nomination reaching vote threshold goes on the block
  - Subsequent nominations with higher votes replace the current block
  - Equal votes create a tie (no execution in BOTC rules)
  - Block indicator in game header shows current status (single player or tied)
  - Modal for resolving block: execute, no execution, or keep block
  - Day change prompts when unresolved block exists
  - Result types: `on_the_block`, `passed`, `executed`, `failed`
- **Hook**: `client/src/hooks/use-player-game.ts` manages all game state with types for GamePlayer, VoteRecord, PlayerGame, GameScriptRef, Nomination (with isQuickLog, result fields), and choppingBlock array for tracking block nominations
- **Script sync**: `client/src/hooks/use-local-scripts.ts` provides reactive script storage shared across all pages with cross-tab sync via storage events

### Game Log
A chronological event viewer accessible via "Log" button in game header:
- **Event types tracked**: Claims (with timestamp/day), nominations (with outcomes), deaths (execution/night/exile), ghost votes used, traveler joins/leaves/exiles
- **Organization**: Events grouped by day, with day/night sections within each day
- **Filtering**: Filter by event type (All, Claims, Votes, Deaths, Travelers)
- **Data structures**: ClaimRecord, DeathRecord, TravelerEvent, GhostVoteEvent interfaces in use-player-game.ts
- **Historical accuracy**: Nomination outcomes (passed/failed, vote counts) are stored at creation time to ensure accuracy regardless of future game state changes
- **Component**: `client/src/components/GameLogDialog.tsx`

### User Authentication & Cloud Scripts
Authentication system for saving custom scripts to the cloud:
- **Authentication**: Replit Auth (OIDC) supporting Google, GitHub, X, Apple, and email/password
- **Login/Logout UI**: User profile dropdown in navigation header
- **Cloud Scripts**: When logged in, custom scripts are saved to PostgreSQL database (user-specific)
- **Fallback**: When logged out, scripts are saved to localStorage
- **Script ID format**: `db-{id}` for database scripts, `custom-{timestamp}` for localStorage scripts
- **API endpoints**: `/api/custom-scripts` for CRUD operations (protected by authentication)
- **Schema**: `customScripts` table in `shared/schema.ts` with userId, name, characterIds
- **Hook**: `client/src/hooks/use-local-scripts.ts` handles sync between localStorage and database
- **Auth hook**: `client/src/hooks/use-auth.ts` provides user state across the app

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage (available but not yet implemented)

### Third-Party Libraries
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Data fetching and caching
- **Framer Motion**: Animation library
- **@dnd-kit**: Drag and drop functionality
- **Zod**: Runtime type validation
- **date-fns**: Date utilities

### Development Tools
- **Vite**: Development server with HMR
- **Replit plugins**: cartographer, dev-banner, runtime-error-modal for Replit environment