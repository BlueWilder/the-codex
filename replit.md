# The Codex - Blood on the Clocktower Character Reference

## Overview

The Codex is a character reference application for Blood on the Clocktower, a social deduction tabletop game. The app provides comprehensive character information including abilities, night order, tips and tricks, bluffing strategies, and jinx interactions. Characters can be filtered by script (Trouble Brewing, Bad Moon Rising, Sects & Violets) and team type. Also includes all 57+ experimental characters from The Carousel edition.

## User Preferences

Preferred communication style: Simple, everyday language.

No em dashes in user-facing copy. Use commas, periods, or parentheses.

## Agent Prompt Contract

Durable rules for every build/update prompt on this repo. Prompts may reference this section instead of restating these.

- No em dashes in user-facing copy. Use commas, periods, or parentheses.
- data-testid on every new interactive or display element. Formats: button-<action>, input-<field>, text-<label>, step-<name>. Match existing names (e.g. button-start-game, input-script-synopsis, text-player-count).
- Tests live in tests/**/*.test.{ts,tsx} (vitest, jsdom, @testing-library/react, per-file jsdom directive). Any prompt that adds, removes, or alters a user-facing flow must add or update a test there.
- The /game route renders client/src/pages/Game.tsx. GameSetup.tsx is a separate, older DB-backed page that is not routed. Do not edit it unless the task names it.
- Stay in scope. Do not silently fix adjacent bugs or refactor outside the named change. Report drift for follow-up.
- Shared character UI lives in client/src/components/character/ (ScriptView, ScriptSheet, CharacterCard, TeamBadge, NightBadges, JinxList). Reuse it; do not duplicate card grids or team-color logic. Team colors flow from lib/team-style.ts; night order from lib/night-order.ts; script resolution from lib/script-resolve.ts.
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
- **Team color system**: driven by `teamCard` in `client/src/lib/team-style.ts`. Each team tints the card text, border, and background. Values: Townsfolk `text-blue-400`, Outsider `text-blue-200`, Minion `text-red-400`, Demon `text-red-600`, Traveler `text-slate-300`, Fabled `text-[#efc344]` (gold). Preserve this per-team tinting on any card surface.
- **Storyteller accent**: the "How to Run" host instructions use a fixed amethyst (`#c79fe6`) regardless of team, inside a panel with border `#3d2f57`, a Wand2 icon, and a small "Storyteller" tag. Applied in `CharacterCard.tsx`. Keep host-facing content visually distinct from player-facing content.

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
- **Built-in Scripts**: Trouble Brewing, Bad Moon Rising, Sects & Violets (official, with synopses), The Wild Hunt (community, by Logan & Brad), The Ship of Theseus (community, by TopazChicken), Leviathan Awakens (community, by TopazChicken)
- **Custom Script Synopsis**: Optional synopsis text field in script editor; stored in DB (`synopsis` column on `customScripts` table) or localStorage
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

### Game Mode (Player Tracker)
A localStorage-based player tracking tool at `/game` for note-taking during games:
- **Setup screen**: a single screen, script-first: select a script (or All Characters), set the player count (5-20), then Start Game. No Player/Storyteller role fork.
- **Script selection**: official, community, or custom scripts, with Create Custom Script and Scan Paper Script (saved as custom, auto-selected) inline.
- **Preview**: the selected script renders inline as a ScriptSheet (client/src/components/character/ScriptSheet.tsx); characters resolved via resolveScriptCharacters(script, { includeTravellers: false, includeFabled: false }) so the preview matches the in-game claim picker.
- **Player cards**: Grid display showing name, alive/dead status, claim badges, indicator icons
- **Player detail drawer**: Claims (with team color-coded badges) and notes
  - Claims section appears first (more frequently accessed during play)
  - Tapping a claim badge opens character preview with ability, tips, and link to full reference
  - Travelers excluded from claims list (they're always known before game starts)
  - "Convert to Traveler" option for mid-game player conversion
- **Day tracker**: Scoreboard-style header with the current phase (Night N / Day N), previous/next chapter controls, alive/dead counts, and traveler count. Collapses to a compact summary bar.
- **View modes**: four tabs in a bottom nav: Grim (circle seating chart), List, Notebook, Script
  - Circle view arranges players in a full 360° circle; scoreboard auto-collapses to a compact summary bar to maximize space
  - Free-drag positioning: players can be dragged anywhere on the circle canvas; custom positions saved as normalized `circleX`/`circleY` (0-1) on `GamePlayer`
  - Dragging a player re-sorts the players array clockwise from 12 o'clock, which also updates list view order
  - "Circle Up" button appears when custom positions exist; clears all `circleX`/`circleY` to restore default circle
- **Persistence**: Game state saved to localStorage, survives page refresh
- **Hook**: `client/src/hooks/use-player-game.ts` manages all game state with types for GamePlayer, ClaimRecord, DeathRecord, TravelerEvent, NotebookNote, PlayerGame, and GameScriptRef
- **Script sync**: `client/src/hooks/use-local-scripts.ts` provides reactive script storage shared across all pages with cross-tab sync via storage events

### Game Log
A chronological event viewer in the Notebook tab of the game tracker:
- **Event types tracked**: Claims (with timestamp/day), deaths (execution/night/exile), traveler joins/leaves/exiles
- **Organization**: Events grouped by chapter (day plus phase)
- **Filtering**: Filter by event type (All, Claims, Deaths, Travelers)
- **Data structures**: ClaimRecord, DeathRecord, TravelerEvent, NotebookNote interfaces in use-player-game.ts
- **Component**: `client/src/components/InlineGameLog.tsx`

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
- **connect-pg-simple**: Session storage, backing the Replit Auth sessions in `server/replit_integrations/auth/replitAuth.ts`

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