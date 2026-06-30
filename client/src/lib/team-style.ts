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
