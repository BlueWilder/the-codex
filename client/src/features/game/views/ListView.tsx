import { usePlayerGame } from "@/features/game/state/use-player-game";
import { FileText, GripVertical, Skull, ArrowDownUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { resolveClaimDescriptor, latestClaimId } from "@/features/game/claims";
import { teamParchment } from "@/lib/team-style";
import { AliveToggle, isSeatDead } from "@/features/game/AliveToggle";
import { type GamePlayer } from "@/features/game/types";

export function SortablePlayerCard({
  player,
  seatNumber,
  onSelect,
  onToggleAlive,
}: {
  player: GamePlayer;
  seatNumber: number;
  onSelect: () => void;
  onToggleAlive: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging 
      ? 'transform 150ms cubic-bezier(0.22, 1, 0.36, 1)' 
      : transition || 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1)',
  };

  // The row shows the claim this player made most recently; the seat sheet
  // holds the full list.
  const latestId = latestClaimId(player);
  const latestChar = latestId ? resolveClaimDescriptor(latestId) : null;
  const latestTeam = latestChar ? teamParchment(latestChar.team) : null;
  const hasNotes = player.notes.trim().length > 0;

  const isActive = player.status === 'alive';
  const isDead = isSeatDead(player);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-2 py-2.5",
        isDead && "opacity-[0.55]",
        isDragging && "relative z-50 rounded-[10px] bg-[var(--parchment-raised)] shadow-lg"
      )}
      data-testid={`card-player-${player.id}`}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="-ml-1 flex h-9 w-6 shrink-0 touch-none cursor-grab items-center justify-center rounded-md text-[var(--parchment-ink-faint)] hover:text-[var(--parchment-ink)] active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Drag ${player.name} to reorder`}
        data-testid={`button-drag-${player.id}`}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        className="relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        title={`View ${player.name}`}
        data-testid={`button-token-${player.id}`}
      >
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isDead
              ? "border-2 border-[var(--parchment-ink)] bg-[var(--parchment-raised)] text-[var(--parchment-ink)]"
              : "bg-[var(--parchment-ink)] text-[var(--parchment-panel)]"
          )}
          data-team={latestChar?.team}
          data-testid={`token-list-${player.id}`}
        >
          {isDead ? (
            <span data-testid={`overlay-shroud-${player.id}`}>
              <Skull className="h-5 w-5" aria-label="Dead" />
            </span>
          ) : (
            <span
              className="font-display text-lg leading-none tabular-nums"
              data-testid={`text-seat-number-${player.id}`}
            >
              {seatNumber}
            </span>
          )}
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-baseline gap-1.5">
          {player.isTraveler && (
            <span className="game-label shrink-0 rounded border border-[var(--parchment-traveler-ring)] px-1 text-[var(--parchment-traveler)]">
              T
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={cn(
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "min-w-0 truncate text-left font-display text-lg leading-tight text-[var(--parchment-ink)] hover:underline",
              !isActive && "line-through"
            )}
            data-testid={`button-player-name-${player.id}`}
          >
            {player.name}
          </button>
        </div>

        <div className="mt-0.5 flex min-w-0" data-testid={`claims-row-${player.id}`}>
          {latestChar ? (
            <span
              className={cn("min-w-0 truncate font-display text-[15px] font-semibold leading-tight", latestTeam?.text)}
              data-team={latestChar.team}
              data-testid={`text-claim-${player.id}`}
            >
              {latestChar.name}
            </span>
          ) : (
            <span
              className="font-serif text-[15px] italic text-[var(--parchment-ink-faint)]"
              data-testid={`text-no-claim-${player.id}`}
            >
              no claim yet
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {hasNotes && <FileText className="h-4 w-4 text-[var(--parchment-ink-faint)]" aria-label="Has notes" />}
        <AliveToggle
          isDead={isDead}
          playerName={player.name}
          onToggle={onToggleAlive}
          data-testid={`button-toggle-dead-${player.id}`}
        />
      </div>
    </div>
  );
}

/**
 * The List tab: a drag-to-reorder grid of player cards. Moved out of
 * GameTrackerView along with the drag sensors only this tab uses.
 */
export function ListView({
  game,
  players,
  onReorderPlayers,
  onReversePlayers,
  onSelectPlayer,
  onToggleAlive,
}: {
  game: NonNullable<ReturnType<typeof usePlayerGame>["game"]>;
  players: GamePlayer[];
  onReorderPlayers: (activeId: string, overId: string) => void;
  onReversePlayers: () => void;
  onSelectPlayer: (playerId: string) => void;
  onToggleAlive: (playerId: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorderPlayers(active.id as string, over.id as string);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={onReversePlayers}
          className="btn-secondary"
          data-testid="button-reverse-order"
        >
          <ArrowDownUp className="w-3.5 h-3.5" />
          Reverse Order
        </button>
      </div>
      <SortableContext items={players.map(p => p.id)} strategy={rectSortingStrategy}>
        <div className="divide-y divide-[var(--parchment-rule)]">
          {players.map((player) => (
            <SortablePlayerCard
              key={player.id}
              player={player}
              seatNumber={game.players.findIndex(p => p.id === player.id) + 1}
              onSelect={() => onSelectPlayer(player.id)}
              onToggleAlive={() => onToggleAlive(player.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
