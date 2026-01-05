# The Codex - Blood on the Clocktower Character Reference

## Overview

The Codex is a character reference application for Blood on the Clocktower, a social deduction tabletop game. The app provides comprehensive character information including abilities, night order, tips and tricks, bluffing strategies, and jinx interactions. Characters can be filtered by script (Trouble Brewing, Bad Moon Rising, Sects & Violets) and team type. Also includes all 57+ experimental characters from The Carousel edition.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state, React useState for local UI state
- **Styling**: Tailwind CSS with a dark Gothic theme (crimson, amber, parchment tones)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for page transitions and UI interactions
- **Drag & Drop**: @dnd-kit for sortable lists and token manipulation
- **Typography**: Custom fonts (Cinzel Decorative for display, Crimson Text for body, Homemade Apple for handwriting)

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
    pages/        # Route pages (Home, Reference)
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
- **Data Verification (Jan 2026)**: Complete audit of all character editions against official wiki:
  - Core editions (TB, BMR, S&V): 100% verified accurate
  - Experimental characters: 57+ verified with 8 fixes applied - Psychopath, Organ Grinder, Vizier, Riot, Alchemist, Lycanthrope, Nightwatchman, Boomdandy

### Game Mode (Player Tracker)
A localStorage-based player tracking tool at `/game` for note-taking during games:
- **Setup wizard**: 3-step flow with player count selection (5-20), player name inputs, and optional script selection
- **Script selection**: Choose from official scripts or custom scripts saved from Reference page
- **Player cards**: Grid display showing name, alive/dead status, claim badges, indicator icons
- **Player detail drawer**: Notes, claims (filtered by selected script), voting record by day
- **Day tracker**: Scoreboard-style header with alive/dead counts, votes to execute, available votes, and script name badge
- **View modes**: List view and Circle seating chart view (toggle in header)
- **Persistence**: Game state saved to localStorage, survives page refresh
- **Hook**: `client/src/hooks/use-player-game.ts` manages all game state with types for GamePlayer, VoteRecord, PlayerGame, GameScriptRef
- **Script sync**: `client/src/hooks/use-local-scripts.ts` provides reactive script storage shared across all pages with cross-tab sync via storage events

### Game Log
A chronological event viewer accessible via "Log" button in game header:
- **Event types tracked**: Claims (with timestamp/day), nominations (with outcomes), deaths (execution/night/exile), ghost votes used, traveler joins/leaves/exiles
- **Organization**: Events grouped by day, with day/night sections within each day
- **Filtering**: Filter by event type (All, Claims, Votes, Deaths, Travelers)
- **Data structures**: ClaimRecord, DeathRecord, TravelerEvent, GhostVoteEvent interfaces in use-player-game.ts
- **Historical accuracy**: Nomination outcomes (passed/failed, vote counts) are stored at creation time to ensure accuracy regardless of future game state changes
- **Component**: `client/src/components/GameLogDialog.tsx`

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