export type Team = 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveler' | 'fabled';

interface TeamStyle {
  card: string;
  badge: string;
  surface: string;
  inputAccent: string;
}

const TEAM_STYLES: Record<Team, TeamStyle> = {
  townsfolk: {
    card: 'text-blue-400 border-blue-900/30 bg-blue-950/20',
    badge: 'bg-blue-900/60 text-blue-200 border-blue-700',
    surface: 'border-blue-900/30 bg-blue-950/20',
    inputAccent: 'border-blue-900/40',
  },
  outsider: {
    card: 'text-blue-200 border-blue-800/30 bg-blue-900/10',
    badge: 'bg-blue-800/50 text-blue-100 border-blue-500',
    surface: 'border-blue-800/30 bg-blue-900/10',
    inputAccent: 'border-blue-800/40',
  },
  minion: {
    card: 'text-red-400 border-red-900/30 bg-red-950/20',
    badge: 'bg-red-900/60 text-red-300 border-red-700',
    surface: 'border-red-900/30 bg-red-950/20',
    inputAccent: 'border-red-900/40',
  },
  demon: {
    card: 'text-red-600 border-red-900/50 bg-red-950/30',
    badge: 'bg-red-950/70 text-red-200 border-red-600',
    surface: 'border-red-900/50 bg-red-950/30',
    inputAccent: 'border-red-900/50',
  },
  traveler: {
    card: 'text-slate-300 border-slate-600/40 bg-slate-800/20',
    badge: 'bg-slate-800/60 text-slate-200 border-slate-600',
    surface: 'border-slate-600/40 bg-slate-800/20',
    inputAccent: 'border-slate-600/40',
  },
  fabled: {
    card: 'text-[#efc344] border-[#efc344]/30 bg-[#efc344]/10',
    badge: 'bg-[#efc344]/15 text-[#efc344] border-[#efc344]/50',
    surface: 'border-[#efc344]/30 bg-[#efc344]/10',
    inputAccent: 'border-[#efc344]/40',
  },
};

const FALLBACK: TeamStyle = {
  card: 'text-gray-400 border-gray-800',
  badge: 'bg-gray-900/60 text-gray-200 border-gray-700',
  surface: 'border-gray-800 bg-gray-900/20',
  inputAccent: 'border-gray-800',
};

export function teamCard(team: string): string {
  return (TEAM_STYLES[team as Team] ?? FALLBACK).card;
}

export function teamBadge(team: string): string {
  return (TEAM_STYLES[team as Team] ?? FALLBACK).badge;
}

export function teamSurface(team: string): string {
  return (TEAM_STYLES[team as Team] ?? FALLBACK).surface;
}

export function teamInputAccent(team: string): string {
  return (TEAM_STYLES[team as Team] ?? FALLBACK).inputAccent;
}

/**
 * The team ring/border color for tokens and seat nodes. Reuses the existing
 * badge border value (no new color values), so the seat ring flows from this
 * single source instead of a duplicate inline map.
 */
export function teamRing(team: string): string {
  const badge = (TEAM_STYLES[team as Team] ?? FALLBACK).badge;
  return badge.split(' ').find((c) => c.startsWith('border-')) ?? '';
}

/**
 * Team colors for parchment surfaces in Game Mode. Values live as CSS
 * variables in index.css (taken from the Script tab's ScriptSheet); the dark
 * shell keeps using the TEAM_STYLES map above. Class strings are written out
 * in full so Tailwind can see them.
 */
interface ParchmentTeamStyle {
  /** Team-colored text. */
  text: string;
  /** Light team tint, for medallion and chip fills. */
  tint: string;
  /** Team ring color, as the ScriptSheet token ring. */
  ring: string;
  /** Solid team-colored border, for claim chips in the seat sheet. */
  border: string;
}

const PARCHMENT_TEAM: Record<Team, ParchmentTeamStyle> = {
  townsfolk: {
    text: 'text-[var(--parchment-townsfolk)]',
    tint: 'bg-[var(--parchment-townsfolk-tint)]',
    ring: 'border-[var(--parchment-townsfolk-ring)]',
    border: 'border-[var(--parchment-townsfolk)]',
  },
  outsider: {
    text: 'text-[var(--parchment-outsider)]',
    tint: 'bg-[var(--parchment-outsider-tint)]',
    ring: 'border-[var(--parchment-outsider-ring)]',
    border: 'border-[var(--parchment-outsider)]',
  },
  minion: {
    text: 'text-[var(--parchment-minion)]',
    tint: 'bg-[var(--parchment-minion-tint)]',
    ring: 'border-[var(--parchment-minion-ring)]',
    border: 'border-[var(--parchment-minion)]',
  },
  demon: {
    text: 'text-[var(--parchment-demon)]',
    tint: 'bg-[var(--parchment-demon-tint)]',
    ring: 'border-[var(--parchment-demon-ring)]',
    border: 'border-[var(--parchment-demon)]',
  },
  traveler: {
    text: 'text-[var(--parchment-traveler)]',
    tint: 'bg-[var(--parchment-traveler-tint)]',
    ring: 'border-[var(--parchment-traveler-ring)]',
    border: 'border-[var(--parchment-traveler)]',
  },
  fabled: {
    text: 'text-[var(--parchment-fabled)]',
    tint: 'bg-[var(--parchment-fabled-tint)]',
    ring: 'border-[var(--parchment-fabled-ring)]',
    border: 'border-[var(--parchment-fabled)]',
  },
};

const PARCHMENT_FALLBACK: ParchmentTeamStyle = {
  text: 'text-[var(--parchment-ink-muted)]',
  tint: 'bg-[var(--parchment-raised)]',
  ring: 'border-[var(--parchment-border)]',
  border: 'border-[var(--parchment-border)]',
};

export function teamParchment(team: string): ParchmentTeamStyle {
  return PARCHMENT_TEAM[team as Team] ?? PARCHMENT_FALLBACK;
}
