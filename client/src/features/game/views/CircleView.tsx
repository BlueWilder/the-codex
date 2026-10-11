import { useState, useEffect } from "react";
import { latestDeathRecord, deathPhaseLabel } from "@/lib/death-phase";
import { Plus, MoreVertical, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, useDraggable } from "@dnd-kit/core";
import { teamCard } from "@/lib/team-style";
import { CharacterToken } from "@/components/character/CharacterToken";
import { type ClaimDescriptor, type GamePlayer, type DeathRecord } from "@/features/game/types";
import { resolveClaimDescriptor, candidateChipClass } from "@/features/game/claims";

/** Pull just the text color token out of the single team-style source. */
function seatRoleTextColor(team: string): string {
  return teamCard(team).split(' ').find((c) => c.startsWith('text-')) ?? 'text-foreground';
}

function CircleNodeContent({
  player,
  nodeSize,
  isOverlay = false,
}: {
  player: GamePlayer;
  nodeSize: number;
  isDragging?: boolean;
  isOverlay?: boolean;
  nameOutside?: boolean;
}) {
  const claims = player.claims ?? [];
  const primaryId = claims?.[0] ?? null;
  const primaryChar = primaryId ? resolveClaimDescriptor(primaryId) : null;
  const isDead = player.status === 'dead' || player.status === 'exiled';

  const tokenSize = Math.round(nodeSize * 0.62);
  const roleName = primaryChar?.name ?? null;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-full text-center",
        isOverlay && "shadow-2xl scale-110"
      )}
      style={{ width: nodeSize, height: nodeSize }}
      data-testid={`token-seat-${player.id}`}
    >
      {primaryChar ? (
        <CharacterToken
          characterId={primaryId ?? undefined}
          team={primaryChar.team}
          size={tokenSize}
          muted={isDead}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground/60",
            isDead && "opacity-40"
          )}
          style={{ width: tokenSize, height: tokenSize }}
        >
          <Plus style={{ width: Math.round(tokenSize * 0.45), height: Math.round(tokenSize * 0.45) }} />
        </div>
      )}

      {roleName ? (
        <span
          className={cn(
            "mt-0.5 text-[9px] leading-tight font-medium truncate px-1",
            isDead ? "text-muted-foreground" : seatRoleTextColor(primaryChar?.team ?? 'townsfolk')
          )}
          style={{ maxWidth: nodeSize - 6 }}
          data-testid={`text-seat-role-${player.id}`}
        >
          {roleName.length > 9 ? roleName.slice(0, 8) + '…' : roleName}
        </span>
      ) : (
        <span
          className="mt-0.5 text-[9px] leading-tight italic text-muted-foreground/60 px-1"
          data-testid={`text-seat-noclaim-${player.id}`}
        >
          no claim
        </span>
      )}

      {isDead && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none flex items-end justify-center overflow-hidden"
          data-testid={`overlay-shroud-${player.id}`}
        >
          <div className="absolute inset-0 rounded-full bg-[#c79fe6]/15 border-2 border-[#3d2f57]" />
        </div>
      )}
    </div>
  );
}

export function CircleSeatingChart({
  players,
  currentDay,
  deathRecords = [],
  onSelectPlayer,
  onOpenPrimaryPicker,
  onReorderPlayers,
  onSetCirclePosition,
  onSetMultipleCirclePositions,
  onResetCirclePositions,
}: {
  players: GamePlayer[];
  currentDay: number;
  deathRecords?: DeathRecord[];
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

  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(window.innerWidth - 32, 500);
      setDimensions({ width, height: width });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const playerCount = players.length;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const nodeSize = playerCount <= 8 ? 76 : playerCount <= 12 ? 66 : playerCount <= 15 ? 56 : 50;
  const radius = Math.min(centerX, centerY) - nodeSize / 2 - 8;

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

  const getPlayerAngleDeg = (player: GamePlayer, index: number) => {
    const pos = getPlayerPosition(player, index);
    const px = pos.x + nodeSize / 2;
    const py = pos.y + nodeSize / 2;
    const deg = Math.atan2(py - centerY, px - centerX) * (180 / Math.PI);
    return ((deg % 360) + 360) % 360;
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
    <div className="flex flex-col items-center pt-4 pb-4 px-2">
      {hasCustomPositions && (
        <button
          onClick={onResetCirclePositions}
          className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border border-amber-700/50 bg-amber-950/30 text-amber-400 hover:bg-amber-900/40 hover:border-amber-600/60 mb-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
          data-testid="reset-circle-layout"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Circle Up
        </button>
      )}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div
          className="relative overflow-visible"
          style={{ width: dimensions.width, height: dimensions.height }}
        >
          {players.map((player, index) => {
            const pos = getPlayerPosition(player, index);
            const isBeingDragged = activeId === player.id;
            const displayX = isBeingDragged ? pos.x + dragDelta.x : pos.x;
            const displayY = isBeingDragged ? pos.y + dragDelta.y : pos.y;
            const angleDeg = getPlayerAngleDeg(player, index);
            const deathRecord = latestDeathRecord(deathRecords, player.id);

            return (
              <DraggableCircleNode
                key={player.id}
                player={player}
                position={{ x: displayX, y: displayY }}
                nodeSize={nodeSize}
                onSelectPlayer={onSelectPlayer}
                onOpenPrimaryPicker={onOpenPrimaryPicker}
                isDragging={isBeingDragged}
                angleDeg={angleDeg}
                deathRecord={deathRecord}
              />
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}

function DraggableCircleNode({
  player,
  position,
  nodeSize,
  onSelectPlayer,
  onOpenPrimaryPicker,
  isDragging,
  angleDeg,
  deathRecord = null,
}: {
  player: GamePlayer;
  position: { x: number; y: number };
  nodeSize: number;
  onSelectPlayer: (playerId: string) => void;
  onOpenPrimaryPicker?: (playerId: string) => void;
  isDragging: boolean;
  angleDeg: number;
  deathRecord?: DeathRecord | null;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: player.id,
  });

  const isBottom = angleDeg > 0 && angleDeg < 180;
  const isActive = player.status === 'alive';
  const isDead = player.status === 'dead' || player.status === 'exiled';
  const displayName = player.name.length > 9 ? player.name.slice(0, 8) + '…' : player.name;
  const phaseStamp = deathPhaseLabel(deathRecord);

  const extraClaims = (player.claims ?? [])
    .slice(1)
    .map(id => resolveClaimDescriptor(id))
    .filter((c): c is ClaimDescriptor => c !== null);
  const shownExtras = extraClaims.slice(0, 3);
  const hiddenExtras = extraClaims.length - shownExtras.length;

  return (
    <div
      className={cn("absolute", isDragging ? "z-30" : "z-10")}
      style={{
        left: position.x,
        top: position.y,
        width: nodeSize,
        height: nodeSize,
        transition: isDragging ? 'none' : 'left 200ms ease, top 200ms ease',
      }}
      data-testid={`circle-node-${player.id}`}
    >
      <span
        className={cn(
          "absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 pointer-events-none",
        )}
        style={isBottom ? { top: nodeSize + 2 } : { bottom: nodeSize + 2 }}
      >
        <span
          className={cn(
            "font-display text-[11px] font-medium whitespace-nowrap",
            !isActive && "text-muted-foreground line-through",
            isActive && "text-foreground"
          )}
        >
          {displayName}
          {phaseStamp && (
            <span className="ml-1 text-[#c79fe6]" data-testid={`text-seat-death-${player.id}`}>
              † {phaseStamp}
            </span>
          )}
        </span>
        {extraClaims.length > 0 && (
          <span className="flex flex-wrap justify-center gap-0.5 max-w-[88px]">
            {shownExtras.map(c => (
              <span
                key={c.id}
                className={cn(
                  "px-1 py-[1px] rounded text-[8px] leading-none border",
                  isDead ? "text-muted-foreground border-muted-foreground/30 bg-transparent" : candidateChipClass(c.team, false)
                )}
                data-testid={`chip-seat-extra-${c.id}-${player.id}`}
              >
                {c.name.length > 6 ? c.name.slice(0, 5) + '…' : c.name}
              </span>
            ))}
            {hiddenExtras > 0 && (
              <span
                className="px-1 py-[1px] rounded text-[8px] leading-none text-muted-foreground"
                data-testid={`chip-seat-extra-more-${player.id}`}
              >
                +{hiddenExtras}
              </span>
            )}
          </span>
        )}
      </span>
      <button
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={() => !isDragging && onOpenPrimaryPicker?.(player.id)}
        className={cn(
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          "w-full h-full rounded-full touch-none",
          !isDragging && "hover-elevate active-elevate-2"
        )}
        style={{
          transform: isDragging ? 'scale(1.15)' : 'scale(1)',
          boxShadow: isDragging ? '0 0 8px 3px rgba(201, 162, 39, 0.7), 0 0 20px 6px rgba(201, 162, 39, 0.35)' : 'none',
        }}
        data-testid={`button-seat-token-${player.id}`}
      >
        <CircleNodeContent
          player={player}
          nodeSize={nodeSize}
          isDragging={isDragging}
          nameOutside={true}
        />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isDragging) onSelectPlayer(player.id);
        }}
        className="absolute -bottom-1 -right-1 z-20 w-5 h-5 rounded-full bg-amber-950/90 border border-amber-600/70 text-amber-300 flex items-center justify-center shadow hover:bg-amber-900 hover:border-amber-500 active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
        aria-label={`More options for ${player.name}`}
        data-testid={`button-seat-more-${player.id}`}
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
