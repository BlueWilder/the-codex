import { cn } from "@/lib/utils";
import { teamParchment } from "@/lib/team-style";
import { characterIcon } from "@/lib/character-icons";
import { getTeamGlyph } from "@/components/character/CharacterToken";

/**
 * Parchment character medallion: team tint fill, team ring, and the
 * character's token art (or its team glyph when there is no art). Shared by
 * the seat sheet, character cards and drawers.
 */
export function CharacterMedallion({
  characterId,
  team,
  size = 40,
  className,
}: {
  characterId?: string;
  team: string;
  size?: number;
  className?: string;
}) {
  const style = teamParchment(team);
  const icon = characterId ? characterIcon(characterId) : undefined;
  const Glyph = getTeamGlyph(team);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2",
        style.tint,
        style.ring,
        className,
      )}
      style={{ width: size, height: size }}
      data-team={team}
    >
      {icon ? (
        <img src={icon} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        <Glyph className={cn("h-1/2 w-1/2", style.text)} />
      )}
    </span>
  );
}
