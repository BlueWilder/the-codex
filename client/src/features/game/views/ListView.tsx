import { usePlayerGame } from "@/features/game/state/use-player-game";
import { latestDeathRecord, deathPhaseLabel } from "@/lib/death-phase";
import { X, Plus, FileText, GripVertical, Skull, ArrowDownUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { resolveClaimDescriptor, previousClaimId } from "@/features/game/claims";
import { teamParchment } from "@/lib/team-style";
import { type ClaimDescriptor, type GamePlayer } from "@/features/game/types";

export function SortablePlayerCard({
  player,
  game,
  seatNumber,
  onSelect,
  onToggleAlive,
  onOpenClaimPicker,
  onRemoveClaim,
}: {
  player: GamePlayer;
  game: NonNullable<ReturnType<typeof usePlayerGame>["game"]>;
  seatNumber: number;
  onSelect: () => void;
  onToggleAlive: () => void;
  onOpenClaimPicker: () => void;
  onRemoveClaim: (characterId: string) => void;
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

  const claimedChars = player.claims
    .map(id => resolveClaimDescriptor(id))
    .filter((c): c is ClaimDescriptor => c !== null);
  const primaryChar = claimedChars[0] ?? null;
  const wasId = previousClaimId(player);
  const hasNotes = player.notes.trim().length > 0;

  const isActive = player.status === 'alive';
  // Gate every dead visual (dimmed row, skull, dagger) on CURRENT status, not
  // on the existence of a death record, so a resurrected player renders as a
  // normal living seat. Matches the circle node's isDead gate.
  const isDead = player.status === 'dead' || player.status === 'exiled';
  const deathRecord = isDead ? latestDeathRecord(game.deathRecords ?? [], player.id) : null;
  const phaseStamp = deathPhaseLabel(deathRecord);

  // Believed claim first, then the claim it replaced ("was X"), then other
  // candidates. Every chip removes its claim when tapped, as before.
  const ordered = [
    ...claimedChars.slice(0, 1),
    ...claimedChars.filter(c => c.id === wasId),
    ...claimedChars.slice(1).filter(c => c.id !== wasId),
  ];

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
          data-team={primaryChar?.team}
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
          {phaseStamp && (
            <span className="shrink-0 font-sans text-xs font-semibold text-[var(--parchment-ink-muted)]" data-testid={`text-seat-death-${player.id}`}>
              † {phaseStamp}
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1" data-testid={`claims-row-${player.id}`}>
          {ordered.length > 0 ? (
            ordered.map((char, idx) => {
              const team = teamParchment(char.team);
              const isPrimary = idx === 0;
              const isWas = !isPrimary && char.id === wasId;
              return (
                <div key={char.id} className="inline-flex items-center" data-testid={`chip-candidate-${player.id}-${char.id}`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveClaim(char.id); }}
                    className={cn(
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 font-serif text-[15px] leading-tight transition-opacity hover:opacity-80",
                      isPrimary && cn(team.tint, team.text, team.ring, "font-semibold"),
                      isWas && "bg-transparent border-[var(--parchment-rule)] text-[var(--parchment-ink-muted)]",
                      !isPrimary && !isWas && cn("bg-transparent", team.text, team.ring)
                    )}
                    title={`Remove ${char.name} claim`}
                    data-testid={`button-claim-badge-${char.id}-${player.id}`}
                  >
                    {isWas ? `was ${char.name}` : char.name}
                    <X className="h-3 w-3 opacity-50" />
                  </button>
                </div>
              );
            })
          ) : (
            <span
              className="font-serif text-[15px] italic text-[var(--parchment-ink-faint)]"
              data-testid={`text-no-claim-${player.id}`}
            >
              no claim yet
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onOpenClaimPicker(); }}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--parchment-control-border)] text-[var(--parchment-ink-link)] transition-colors hover:bg-[var(--parchment-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Add claim"
            data-testid={`button-add-claim-${player.id}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {hasNotes && <FileText className="h-4 w-4 text-[var(--parchment-ink-faint)]" aria-label="Has notes" />}
        {!player.isTraveler && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleAlive(); }}
            className={cn(
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
              isDead
                ? "border-[var(--parchment-ink)] bg-[var(--parchment-ink)] text-[var(--parchment-panel)]"
                : "border-[var(--parchment-rule)] text-[var(--parchment-ink-muted)] hover:bg-[var(--parchment-control)]"
            )}
            title={isDead ? "Revive player" : "Mark as dead"}
            data-testid={`button-toggle-dead-${player.id}`}
          >
            <Skull className="w-4 h-4" />
          </button>
        )}
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
  filteredPlayers,
  onReorderPlayers,
  onReversePlayers,
  onSelectPlayer,
  onToggleAlive,
  onOpenClaimPicker,
  onRemoveClaim,
}: {
  game: NonNullable<ReturnType<typeof usePlayerGame>["game"]>;
  filteredPlayers: GamePlayer[];
  onReorderPlayers: (activeId: string, overId: string) => void;
  onReversePlayers: () => void;
  onSelectPlayer: (playerId: string) => void;
  onToggleAlive: (playerId: string) => void;
  onOpenClaimPicker: (playerId: string) => void;
  onRemoveClaim: (playerId: string, characterId: string) => void;
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
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onReversePlayers}
          className="game-label flex items-center gap-1 rounded-md px-1.5 py-1 text-[var(--parchment-ink-muted)] hover:text-[var(--parchment-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          data-testid="button-reverse-order"
        >
          <ArrowDownUp className="w-3.5 h-3.5" />
          Reverse Order
        </button>
      </div>
      <SortableContext items={filteredPlayers.map(p => p.id)} strategy={rectSortingStrategy}>
        <div className="divide-y divide-[var(--parchment-rule)]">
          {filteredPlayers.map((player) => (
            <SortablePlayerCard
              key={player.id}
              player={player}
              game={game}
              seatNumber={game.players.findIndex(p => p.id === player.id) + 1}
              onSelect={() => onSelectPlayer(player.id)}
              onToggleAlive={() => onToggleAlive(player.id)}
              onOpenClaimPicker={() => onOpenClaimPicker(player.id)}
              onRemoveClaim={(charId) => onRemoveClaim(player.id, charId)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
