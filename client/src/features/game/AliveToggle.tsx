import { Skull, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { type GamePlayer } from "@/features/game/types";

/** A seat reads as dead whenever it is not alive (dead, exiled or left). */
export function isSeatDead(player: GamePlayer): boolean {
  return player.status !== 'alive';
}

/**
 * The one alive/dead toggle, used in the seat sheet header and on List rows:
 * a raised circle with a smiley while alive and a skull while dead. Tapping
 * flips the seat.
 */
export function AliveToggle({
  isDead,
  playerName,
  onToggle,
  size = 44,
  className,
  "data-testid": testId,
}: {
  isDead: boolean;
  playerName: string;
  onToggle: () => void;
  size?: number;
  className?: string;
  "data-testid"?: string;
}) {
  const iconPx = Math.round(size * 0.48);
  const Icon = isDead ? Skull : Smile;
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border bg-[var(--parchment-raised)] transition-colors hover:bg-[var(--parchment-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDead
          ? "border-[var(--parchment-ink)] text-[var(--parchment-ink)]"
          : "border-[var(--parchment-control-border)] text-[var(--parchment-ink-muted)]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={isDead ? `Mark ${playerName} alive` : `Mark ${playerName} dead`}
      title={isDead ? "Dead, tap to revive" : "Alive, tap to mark dead"}
      data-state={isDead ? "dead" : "alive"}
      data-testid={testId}
    >
      <Icon style={{ width: iconPx, height: iconPx }} aria-hidden="true" />
    </button>
  );
}
