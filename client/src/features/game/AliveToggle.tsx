import { Skull, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { type GamePlayer } from "@/features/game/types";

/** A seat reads as dead whenever it is not alive (dead, exiled or left). */
export function isSeatDead(player: GamePlayer): boolean {
  return player.status !== 'alive';
}

/**
 * The one alive/dead toggle, used in the seat sheet header and on List rows:
 * a 44px icon button (UI rule 3) with a smiley while alive and a skull while
 * dead. Tapping flips the seat.
 */
export function AliveToggle({
  isDead,
  playerName,
  onToggle,
  className,
  "data-testid": testId,
}: {
  isDead: boolean;
  playerName: string;
  onToggle: () => void;
  className?: string;
  "data-testid"?: string;
}) {
  const Icon = isDead ? Skull : Smile;
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={cn(
        "btn-icon",
        isDead ? "text-[var(--parchment-ink)]" : "text-[var(--parchment-ink-muted)]",
        className,
      )}
      aria-label={isDead ? `Mark ${playerName} alive` : `Mark ${playerName} dead`}
      title={isDead ? "Dead, tap to revive" : "Alive, tap to mark dead"}
      data-state={isDead ? "dead" : "alive"}
      data-testid={testId}
    >
      <Icon className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}
