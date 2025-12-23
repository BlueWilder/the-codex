# Grimoire - Blood on the Clocktower Digital Assistant

## Overview

This is a digital Grimoire application for Blood on the Clocktower, a social deduction tabletop game. The app helps Storytellers (game moderators) manage games by providing script management, character reference, game setup, and game state tracking. It includes a comprehensive character database with abilities, night order information, tips, and jinx interactions.

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

### Key Data Models
1. **Scripts**: Store official and custom character lists (JSON content field contains character IDs)
2. **Games**: Track active game sessions with full game state stored as JSONB

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components (shadcn/ui based)
    pages/        # Route pages (Home, Scripts, Reference, GameTracker, etc.)
    hooks/        # Custom hooks for API calls
    lib/          # Utilities and game data
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