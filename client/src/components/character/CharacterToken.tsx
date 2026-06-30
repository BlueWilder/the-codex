import { User, VenetianMask, PersonStanding, Footprints, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCharacterById } from "@/lib/game-data";
import { teamCard, teamRing } from "@/lib/team-style";

/**
 * A horned demon drawn inline so the Demon glyph is not a stock lucide icon.
 * Kept in sync with the Script sheet's demon glyph (ScriptSheet.tsx).
 */
function DemonGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}
         strokeLinecap="round" strokeLinejoin="round" className={className}
         aria-hidden="true">
      <path d="M6 7C5 5.5 4.5 4 5 3c1 .5 2 1.5 2.5 3" />
      <path d="M18 7c1-1.5 1.5-3 1-4-1 .5-2 1.5-2.5 3" />
      <path d="M5 11a7 7 0 0 1 14 0c0 5-3 9-7 9s-7-4-7-9Z" />
      <path d="M9.5 12.5 8 11.5" />
      <path d="M16 12.5 14.5 11.5" />
      <path d="M10 16c1 1 3 1 4 0" />
    </svg>
  );
}

/**
 * Placeholder team glyphs, matching the Script sheet set. Real per-character
 * token art swaps in via the Character.icon field once it exists.
 */
function getTeamGlyph(team: string): React.ComponentType<{ className?: string }> {
  switch (team) {
    case "townsfolk": return User;
    case "outsider": return PersonStanding;
    case "minion": return VenetianMask;
    case "demon": return DemonGlyph;
    case "traveler": return Footprints;
    case "fabled": return Star;
    default: return User;
  }
}

/** Pull just the text color token out of the single team-style source. */
function teamGlyphColor(team: string): string {
  return teamCard(team).split(" ").find((c) => c.startsWith("text-")) ?? "text-foreground";
}

interface CharacterTokenProps {
  /** Character id resolved via getCharacterById for the icon and team. */
  characterId?: string;
  /** Explicit team override (e.g. the generic Traveller, which has no id). */
  team?: string;
  /** Diameter in px. */
  size?: number;
  /** Grey the token (dead/exiled seats). */
  muted?: boolean;
  className?: string;
  "data-testid"?: string;
}

/**
 * A circular seat token, character-keyed. Renders the official per-character
 * icon when one exists (future), otherwise a team-category placeholder glyph
 * colored by team. The ring color flows from the single team-style.ts source.
 */
export function CharacterToken({
  characterId,
  team,
  size = 40,
  muted = false,
  className,
  "data-testid": testId,
}: CharacterTokenProps) {
  const char = characterId ? getCharacterById(characterId) : undefined;
  const resolvedTeam = team ?? char?.team ?? "townsfolk";
  const iconUrl = char?.icon;
  const Glyph = getTeamGlyph(resolvedTeam);

  return (
    <span
      data-testid={testId}
      data-team={resolvedTeam}
      data-glyph={iconUrl ? "image" : "glyph"}
      className={cn(
        "inline-flex items-center justify-center rounded-full border-2 bg-background/40 shrink-0",
        teamRing(resolvedTeam),
        muted && "opacity-40 grayscale",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {iconUrl ? (
        <img src={iconUrl} alt="" className="w-full h-full rounded-full object-cover" />
      ) : (
        <Glyph className={cn(teamGlyphColor(resolvedTeam))} />
      )}
    </span>
  );
}
