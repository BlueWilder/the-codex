import { cn } from "@/lib/utils";
import { teamParchment } from "@/lib/team-style";

/** Team name for parchment surfaces: small caps label, or a tinted pill. */
export function TeamBadge({ team, variant }: { team: string; variant: "label" | "pill" }) {
  const style = teamParchment(team);
  if (variant === "label") {
    return <span className={cn("game-label", style.text)}>{team}</span>;
  }
  return (
    <span className={cn("game-label rounded-full border px-2 py-0.5", style.tint, style.text, style.ring)}>
      {team}
    </span>
  );
}
