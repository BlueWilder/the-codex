# Blood on the Clocktower Tracker - Design Guidelines

## Design Approach
**Gothic Grimoire Aesthetic** - Drawing inspiration from medieval manuscripts, dark fantasy games (Darkest Dungeon, Diablo), and occult literature while maintaining modern app usability. Think ornate borders, aged parchment, candlelit ambiance translated into a functional interface.

## Typography System

**Primary Font**: Cinzel (Google Fonts) - Ornate serif for headers, game states
**Secondary Font**: Crimson Text (Google Fonts) - Readable serif for body content
**Utility Font**: Inter (Google Fonts) - Clean sans-serif for numbers, counts, secondary UI

Hierarchy:
- Page Titles: Cinzel, text-4xl/5xl, uppercase tracking
- Section Headers: Cinzel, text-2xl/3xl  
- Character Names: Crimson Text, text-lg/xl, medium weight
- Body/Labels: Crimson Text, text-base
- Counts/Stats: Inter, tabular-nums

## Layout System
Tailwind spacing units: 2, 4, 6, 8, 12, 16 for consistent rhythm
- Mobile containers: px-4, py-6
- Desktop containers: max-w-4xl, px-6, py-12
- Card spacing: p-6, gap-4
- Section dividers: my-12

## Component Library

### Navigation
Top bar with ornate divider beneath, includes: Game title, current day counter, menu icon (mobile) or tabs (desktop). Sticky positioning.

### Player Cards
Individual cards with ornamental corner accents (using border decorative elements via CSS):
- Player avatar placeholder (circular with decorative frame)
- Name (Crimson Text, bold)
- Claimed character (if any, with small character icon)
- Status indicators: Alive/Dead, Nominated, Protected
- Vote count badge
- Action buttons: Nominate, Kill, Claim Character

Card states: Default, Nominated (elevated with glow), Dead (reduced opacity with cross overlay), Executed (special treatment)

### Day Tracker
Prominent header showing current day with ornamental flourishes. Day navigation arrows. Timeline dots showing past days for quick access.

### Nomination Panel
Appears when day phase active. Shows:
- Current nominee with large character portrait
- Nominator info
- Vote tally with individual voter list
- Large "Execute/Pardon" decision display
- Timer if using timed votes

### Character Claim Modal
Full-screen overlay with grimoire aesthetic:
- Scrollable character list with icons and names
- Brief ability text
- Team indicator (Good/Evil)
- Search/filter by team or name
- Ornate close button

### Voting Interface
Vote buttons for each player during nomination:
- Hand-raising gesture icons
- Real-time vote count
- Lock-in confirmation
- Results reveal animation

### Game History
Accordion-style past days showing:
- Executions
- Deaths
- Character reveals
- Vote records
Collapsed by default, ornate expansion indicators.

## Icons
Use Font Awesome (solid) for functional icons: skull, scroll, users, clock, balance-scale, hand-paper, crown
Decorative flourishes using Unicode ornamental characters: ⚜ ◈ ❧ ※

## Images

**Hero Section**: No traditional hero. App opens directly to game state.

**Character Portraits**: Placeholder for custom character artwork (circular, 64px-80px diameter). Use decorative border frames around each portrait.

**Background Textures**: Subtle dark paper/parchment texture overlay on main container backgrounds (describe: aged, slightly stained parchment with subtle grain).

**Decorative Elements**: Corner ornaments, section dividers with Gothic flourishes (describe: symmetrical, vine-like patterns in crimson/amber).

## Responsive Strategy
Mobile (base): Single column, stacked cards, collapsible panels, full-width buttons
Tablet (md:): Two-column player grid, side-by-side nomination/voting
Desktop (lg:): Three-column player grid, fixed navigation, expanded character details

## Animations
Minimal, purposeful only:
- Card flips for death reveals (2s, preserve-3d)
- Vote count increment pulse
- Modal fade-in (200ms)
- Execution dramatic reveal (1s delay)

## Key Screens Structure

1. **Game Setup**: Player name inputs, character distribution mode, starting night setup
2. **Active Game View**: Player grid, day counter, active nomination panel, quick actions toolbar
3. **Night Phase**: Darkened interface, ability resolution tracking, minimal visibility
4. **Game End**: Victory screen with team reveal, final grimoire state, restart options

## Distinctive Elements
- Wax seal buttons for primary actions
- Torn parchment edge treatments on cards
- Candlelight glow effects on interactive elements (subtle box-shadow in amber)
- Gothic drop caps for section starts
- Ornamental horizontal rules between major sections
- Weathered/aged aesthetic without sacrificing readability