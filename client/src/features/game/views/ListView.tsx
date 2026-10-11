import { usePlayerGame } from "@/features/game/state/use-player-game";
import { latestDeathRecord, deathPhaseLabel } from "@/lib/death-phase";
import { X, Plus, FileText, GripVertical, Skull, ArrowDownUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CharacterToken } from "@/components/character/CharacterToken";
import { resolveClaimDescriptor, candidateChipClass } from "@/features/game/claims";
import { type GamePlayer } from "@/features/game/types";

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

  const claimedChars = player.claims.map(id => resolveClaimDescriptor(id)).filter(Boolean);
  const primaryChar = claimedChars[0] ?? null;
  const hasNotes = player.notes.trim().length > 0;

  const isActive = player.status === 'alive';
  // Gate every dead visual (greyed row, shroud, dagger) on CURRENT status, not
  // on the existence of a death record, so a resurrected player renders as a
  // normal living seat. Matches the circle node's isDead gate.
  const isDead = player.status === 'dead' || player.status === 'exiled';
  const deathRecord = isDead ? latestDeathRecord(game.deathRecords ?? [], player.id) : null;
  const phaseStamp = deathPhaseLabel(deathRecord);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "rounded-md border border-border/60 bg-card/40 p-2 cursor-pointer",
        isDead && "opacity-60",
        isDragging && "opacity-80 shadow-lg z-50 scale-[1.02]",
        player.isTraveler && "border-purple-700/50"
      )}
      data-testid={`card-player-${player.id}`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="touch-none cursor-grab active:cursor-grabbing flex items-center justify-center w-9 h-9 -ml-1 shrink-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
          data-testid={`button-drag-${player.id}`}
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <span
          className="shrink-0 mt-1.5 w-5 text-center text-sm font-mono tabular-nums text-muted-foreground"
          data-testid={`text-seat-number-${player.id}`}
        >
          {seatNumber}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="relative shrink-0 mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
          title={`View ${player.name}`}
          data-testid={`button-token-${player.id}`}
        >
          {primaryChar ? (
            <CharacterToken
              characterId={primaryChar.id}
              team={primaryChar.team}
              size={40}
              muted={isDead}
              data-testid={`token-list-${player.id}`}
            />
          ) : (
            <span
              className="inline-flex items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground/60 bg-background/40"
              style={{ width: 40, height: 40 }}
              data-testid={`token-list-${player.id}`}
            >
              <Plus className="w-4 h-4" />
            </span>
          )}
          {isDead && (
            <span
              className="absolute inset-0 rounded-full pointer-events-none flex items-end justify-center overflow-hidden"
              data-testid={`overlay-shroud-${player.id}`}
            >
              <span className="absolute inset-0 rounded-full bg-[#c79fe6]/15 border-2 border-[#3d2f57]" />
            </span>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {player.isTraveler && (
              <Badge variant="secondary" className="bg-purple-900/40 text-purple-300 border-purple-700 text-xs shrink-0">
                T
              </Badge>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className={cn(
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                "font-display font-semibold text-base text-left hover:underline truncate min-w-0",
                isActive ? "text-amber-100" : "text-muted-foreground line-through"
              )}
              data-testid={`button-player-name-${player.id}`}
            >
              {player.name}
            </button>
            {phaseStamp && (
              <span className="text-[#c79fe6] text-sm shrink-0" data-testid={`text-seat-death-${player.id}`}>
                † {phaseStamp}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5" data-testid={`claims-row-${player.id}`}>
            {claimedChars.length > 0 ? (
              claimedChars.map((char, idx) => char && (
                <div
                  key={char.id}
                  className="inline-flex items-center gap-1"
                  data-testid={`chip-candidate-${player.id}-${char.id}`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveClaim(char.id); }}
                    className={cn(
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background","inline-flex items-center gap-1 text-xs font-sans whitespace-nowrap rounded-full border px-2.5 py-1 font-semibold transition-colors hover:opacity-80", candidateChipClass(char.team, idx === 0))}
                    title={`Remove ${char.name} claim`}
                    data-testid={`button-claim-badge-${char.id}-${player.id}`}
                  >
                    {char.name}
                    <X className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </div>
              ))
            ) : (
              <span
                className="text-xs italic text-muted-foreground/60"
                data-testid={`text-no-claim-${player.id}`}
              >
                no claim yet
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onOpenClaimPicker(); }}
              className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-amber-700/60 text-amber-400 hover:bg-amber-900/20 hover:border-amber-600 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              title="Add claim"
              data-testid={`button-add-claim-${player.id}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1 h-4">
            {hasNotes && <FileText className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>
          {!player.isTraveler && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleAlive(); }}
              className={cn(
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                "flex items-center justify-center w-8 h-8 rounded-lg border transition-colors",
                isDead
                  ? "bg-red-900/40 border-red-700/60 text-red-400 hover:bg-red-900/60"
                  : "border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
              title={isDead ? "Revive player" : "Mark as dead"}
              data-testid={`button-toggle-dead-${player.id}`}
            >
              <Skull className="w-4 h-4" />
            </button>
          )}
        </div>
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
      <div className="flex justify-end mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReversePlayers}
          className="text-xs text-muted-foreground hover:text-foreground gap-1"
          data-testid="button-reverse-order"
        >
          <ArrowDownUp className="w-3.5 h-3.5" />
          Reverse Order
        </Button>
      </div>
      <SortableContext items={filteredPlayers.map(p => p.id)} strategy={rectSortingStrategy}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
