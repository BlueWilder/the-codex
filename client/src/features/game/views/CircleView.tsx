import { useState, useEffect, useRef } from "react";
import { MoreVertical, RotateCcw, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, useDraggable } from "@dnd-kit/core";
import { teamParchment } from "@/lib/team-style";
import { type ClaimDescriptor, type GamePlayer } from "@/features/game/types";
import { resolveClaimDescriptor } from "@/features/game/claims";

/**
 * Seat medallion plus the name and believed claim under it. States:
 * claimed (team tint, 3px team ring), no claim (raised fill, dashed ring,
 * muted number), dead (raised fill, ink ring, skull, whole seat at 50%,
 * name struck through). Font sizes scale with the medallion size.
 */
function CircleNodeContent({
  player,
  seatNumber,
  nodeSize,
  labelShiftX = 0,
}: {
  player: GamePlayer;
  seatNumber: number;
  nodeSize: number;
  /** Horizontal nudge of the name block toward the ring's center (side seats). */
  labelShiftX?: number;
}) {
  const claims = player.claims ?? [];
  const primaryId = claims[0] ?? null;
  const primaryChar = primaryId ? resolveClaimDescriptor(primaryId) : null;
  const isDead = player.status === 'dead' || player.status === 'exiled';
  const isActive = player.status === 'alive';
  const team = primaryChar ? teamParchment(primaryChar.team) : null;

  // 72px medallion: 26px number, 15px name, 12px claim. Smaller rings scale down.
  const scale = nodeSize / 72;
  const numberPx = Math.round(26 * scale);
  const namePx = Math.max(12, Math.round(15 * scale));
  const claimPx = Math.max(10, Math.round(12 * scale));
  const labelWidth = nodeSize + 18;

  const extraClaims = claims
    .slice(1)
    .map(id => resolveClaimDescriptor(id))
    .filter((c): c is ClaimDescriptor => c !== null);
  const shownExtras = extraClaims.slice(0, 3);
  const hiddenExtras = extraClaims.length - shownExtras.length;

  return (
    <div
      className="relative"
      style={{ width: nodeSize, height: nodeSize }}
      data-testid={`token-seat-${player.id}`}
    >
      <div
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full border-[3px]",
          // Dead seats dim the medallion and the name block separately (not a
          // shared wrapper) so the name can still layer above other seats.
          isDead && "opacity-50",
          isDead
            ? "border-[var(--parchment-ink)] bg-[var(--parchment-raised)]"
            : team
              ? cn(team.tint, team.ring)
              : "border-dashed border-[var(--parchment-control-border)] bg-[var(--parchment-raised)]",
        )}
        data-team={primaryChar?.team}
      >
        {isDead ? (
          <span
            className="flex items-center justify-center text-[var(--parchment-ink)]"
            data-testid={`overlay-shroud-${player.id}`}
          >
            <Skull style={{ width: numberPx, height: numberPx }} aria-label="Dead" />
          </span>
        ) : (
          <span
            className={cn(
              "font-display leading-none tabular-nums",
              team ? "text-[var(--parchment-ink)]" : "text-[var(--parchment-ink-faint)]",
            )}
            style={{ fontSize: numberPx }}
          >
            {seatNumber}
          </span>
        )}
      </div>

      <div
        className={cn(
          "pointer-events-none absolute left-1/2 z-20 flex -translate-x-1/2 flex-col items-center text-center [text-shadow:0_0_2px_var(--parchment-panel),0_0_4px_var(--parchment-panel)]",
          isDead && "opacity-50",
        )}
        style={{ top: nodeSize + 3, width: labelWidth, marginLeft: labelShiftX }}
      >
        <span
          className={cn(
            "max-w-full truncate font-display leading-tight text-[var(--parchment-ink)]",
            !isActive && "line-through",
          )}
          style={{ fontSize: namePx }}
        >
          {player.name}
        </span>
        {primaryChar ? (
          <span
            className={cn("max-w-full truncate font-serif leading-tight", team?.text)}
            style={{ fontSize: claimPx }}
            data-testid={`text-seat-role-${player.id}`}
          >
            {primaryChar.name}
          </span>
        ) : (
          <span
            className="font-serif italic leading-tight text-[var(--parchment-ink-faint)]"
            style={{ fontSize: claimPx }}
            data-testid={`text-seat-noclaim-${player.id}`}
          >
            no claim
          </span>
        )}
        {extraClaims.length > 0 && (
          <span className="mt-0.5 flex flex-wrap justify-center gap-0.5">
            {shownExtras.map(c => (
              <span
                key={c.id}
                className={cn(
                  "rounded border bg-transparent px-1 py-[1px] font-sans text-[8px] leading-none",
                  teamParchment(c.team).text,
                  teamParchment(c.team).ring,
                )}
                data-testid={`chip-seat-extra-${c.id}-${player.id}`}
              >
                {c.name.length > 6 ? c.name.slice(0, 5) + '…' : c.name}
              </span>
            ))}
            {hiddenExtras > 0 && (
              <span
                className="px-1 py-[1px] font-sans text-[8px] leading-none text-[var(--parchment-ink-muted)]"
                data-testid={`chip-seat-extra-more-${player.id}`}
              >
                +{hiddenExtras}
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

export function CircleSeatingChart({
  players,
  centerLabel,
  onSelectPlayer,
  onOpenPrimaryPicker,
  onReorderPlayers,
  onSetCirclePosition,
  onSetMultipleCirclePositions,
  onResetCirclePositions,
}: {
  players: GamePlayer[];
  /** Shown in the middle of the ring (the script name); nothing when absent. */
  centerLabel?: string;
  onSelectPlayer: (playerId: string) => void;
  onOpenPrimaryPicker?: (playerId: string) => void;
  onReorderPlayers: (activeId: string, overId: string) => void;
  onSetCirclePosition: (playerId: string, x: number, y: number) => void;
  onSetMultipleCirclePositions: (updates: { playerId: string; x: number; y: number }[]) => void;
  onResetCirclePositions: () => void;
}) {
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  // The ring fills the panel's width (capped on wide screens). Positions stay
  // normalized to a square of that width, as before, so saved custom seat
  // positions keep their meaning.
  const canvasRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const updateDimensions = () => {
      const measured = canvasRef.current?.clientWidth ?? 0;
      const available = measured > 0 ? measured : window.innerWidth - 32;
      const width = Math.min(available, 560);
      setDimensions({ width, height: width });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    const observer = typeof ResizeObserver !== 'undefined' && canvasRef.current
      ? new ResizeObserver(updateDimensions)
      : null;
    if (observer && canvasRef.current) observer.observe(canvasRef.current);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      observer?.disconnect();
    };
  }, []);

  const playerCount = players.length;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  // Seat medallion: 72px up to 8 seats, 60px for 9 to 12, 52px for 13 and up.
  const nodeSize = playerCount <= 8 ? 72 : playerCount <= 12 ? 60 : 52;
  // Left and right seats sit 6px inside the panel edge.
  const radius = Math.min(centerX, centerY) - nodeSize / 2 - 6;
  // Room under the bottom seat for its name, claim and chips.
  const labelRoom = 52;

  // Names sit under each medallion. On side seats they would run into the
  // next seat down, so they shift sideways in proportion to how far the seat
  // is from the vertical axis: toward the center on the upper half (the seat
  // below is further out) and toward the edge on the lower half (the seat
  // below is further in). Labels are kept inside the panel.
  const getLabelShiftX = (player: GamePlayer, index: number) => {
    const pos = getPlayerPosition(player, index);
    const seatX = pos.x + nodeSize / 2;
    const seatY = pos.y + nodeSize / 2;
    const side = radius > 0 ? Math.max(-1, Math.min(1, (seatX - centerX) / radius)) : 0;
    const upper = seatY < centerY - nodeSize / 4;
    const shift = (upper ? -side : side) * nodeSize * 0.6;
    const halfLabel = (nodeSize + 18) / 2;
    const min = halfLabel - seatX;
    const max = dimensions.width - halfLabel - seatX;
    return Math.round(Math.max(min, Math.min(max, shift)));
  };

  const getDefaultPosition = (index: number) => {
    const angle = (-90 + (index / playerCount) * 360) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(angle) - nodeSize / 2,
      y: centerY + radius * Math.sin(angle) - nodeSize / 2,
    };
  };

  const getPlayerPosition = (player: GamePlayer, index: number) => {
    if (player.circleX !== undefined && player.circleY !== undefined) {
      return {
        x: player.circleX * dimensions.width - nodeSize / 2,
        y: player.circleY * dimensions.height - nodeSize / 2,
      };
    }
    return getDefaultPosition(index);
  };

  const hasCustomPositions = players.some(p => p.circleX !== undefined);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setDragDelta({ x: 0, y: 0 });
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleDragMove = (event: { delta: { x: number; y: number } }) => {
    setDragDelta(event.delta);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const playerId = active.id as string;
    const playerIndex = players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      setActiveId(null);
      setDragDelta({ x: 0, y: 0 });
      return;
    }

    const hasMoved = Math.abs(delta.x) > 3 || Math.abs(delta.y) > 3;
    if (hasMoved) {
      const currentPos = getPlayerPosition(players[playerIndex], playerIndex);
      const newCenterX = currentPos.x + nodeSize / 2 + delta.x;
      const newCenterY = currentPos.y + nodeSize / 2 + delta.y;
      const clampedX = Math.max(0, Math.min(1, newCenterX / dimensions.width));
      const clampedY = Math.max(0, Math.min(1, newCenterY / dimensions.height));

      const minDist = nodeSize * 0.8;
      const updates: { playerId: string; x: number; y: number }[] = [
        { playerId, x: clampedX, y: clampedY },
      ];

      players.forEach((other, i) => {
        if (other.id === playerId) return;
        const otherPos = getPlayerPosition(other, i);
        const otherCenterX = otherPos.x + nodeSize / 2;
        const otherCenterY = otherPos.y + nodeSize / 2;
        const dx = otherCenterX - newCenterX;
        const dy = otherCenterY - newCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDist) {
          const angle = dist > 1 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
          const pushDist = (minDist * 1.2 - dist);
          const nudgedX = (otherCenterX + Math.cos(angle) * pushDist) / dimensions.width;
          const nudgedY = (otherCenterY + Math.sin(angle) * pushDist) / dimensions.height;
          updates.push({
            playerId: other.id,
            x: Math.max(0, Math.min(1, nudgedX)),
            y: Math.max(0, Math.min(1, nudgedY)),
          });
        }
      });

      if (updates.length > 1) {
        onSetMultipleCirclePositions(updates);
      } else {
        onSetCirclePosition(playerId, clampedX, clampedY);
      }
    }

    setActiveId(null);
    setDragDelta({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col items-center">
      {hasCustomPositions && (
        <button
          onClick={onResetCirclePositions}
          className="mb-2 flex items-center gap-1.5 rounded-full border border-[var(--parchment-control-border)] bg-[var(--parchment-control)] px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider text-[var(--parchment-ink-link)] transition-colors hover:bg-[var(--parchment-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          data-testid="reset-circle-layout"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Circle Up
        </button>
      )}
      <div ref={canvasRef} className="w-full">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          <div
            className="relative mx-auto overflow-visible"
            style={{ width: dimensions.width, height: dimensions.height + labelRoom }}
          >
            <div
              className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
              style={{ left: centerX, top: centerY }}
              data-testid="circle-center"
            >
              {centerLabel && (
                <span className="max-w-[60%] font-display text-xl leading-tight text-[var(--parchment-ink)]">{centerLabel}</span>
              )}
              <span className="font-serif text-sm italic text-[var(--parchment-ink-muted)]">hold a seat to move it</span>
            </div>
            {players.map((player, index) => {
              const pos = getPlayerPosition(player, index);
              const isBeingDragged = activeId === player.id;
              const displayX = isBeingDragged ? pos.x + dragDelta.x : pos.x;
              const displayY = isBeingDragged ? pos.y + dragDelta.y : pos.y;

              return (
                <DraggableCircleNode
                  key={player.id}
                  player={player}
                  seatNumber={index + 1}
                  position={{ x: displayX, y: displayY }}
                  nodeSize={nodeSize}
                  labelShiftX={getLabelShiftX(player, index)}
                  onSelectPlayer={onSelectPlayer}
                  onOpenPrimaryPicker={onOpenPrimaryPicker}
                  isDragging={isBeingDragged}
                />
              );
            })}
          </div>
        </DndContext>
      </div>
    </div>
  );
}

function DraggableCircleNode({
  player,
  seatNumber,
  position,
  nodeSize,
  labelShiftX = 0,
  onSelectPlayer,
  onOpenPrimaryPicker,
  isDragging,
}: {
  player: GamePlayer;
  seatNumber: number;
  position: { x: number; y: number };
  nodeSize: number;
  labelShiftX?: number;
  onSelectPlayer: (playerId: string) => void;
  onOpenPrimaryPicker?: (playerId: string) => void;
  isDragging: boolean;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: player.id,
  });

  return (
    <div
      className={cn("absolute", isDragging && "z-30")}
      style={{
        left: position.x,
        top: position.y,
        width: nodeSize,
        height: nodeSize,
        transition: isDragging ? 'none' : 'left 200ms ease, top 200ms ease',
      }}
      data-testid={`circle-node-${player.id}`}
    >
      <button
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={() => !isDragging && onOpenPrimaryPicker?.(player.id)}
        className="h-full w-full touch-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        style={{
          transform: isDragging ? 'scale(1.15)' : undefined,
          boxShadow: isDragging ? '0 0 8px 3px rgba(201, 162, 39, 0.7), 0 0 20px 6px rgba(201, 162, 39, 0.35)' : 'none',
        }}
        data-testid={`button-seat-token-${player.id}`}
      >
        <CircleNodeContent
          player={player}
          seatNumber={seatNumber}
          nodeSize={nodeSize}
          labelShiftX={labelShiftX}
        />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isDragging) onSelectPlayer(player.id);
        }}
        className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--parchment-control-border)] bg-[var(--parchment-raised)] text-[var(--parchment-ink-muted)] shadow-sm transition-colors hover:bg-[var(--parchment-control)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        aria-label={`More options for ${player.name}`}
        data-testid={`button-seat-more-${player.id}`}
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
