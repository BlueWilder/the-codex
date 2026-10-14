import { useState, useMemo } from "react";
import { ALL_CHARACTERS } from "@/lib/game-data";
import { useFriends } from "@/hooks/use-friends";
import { X, Search, Pencil, MoreVertical, UserPlus, Trash2, Ban, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { teamParchment } from "@/lib/team-style";
import { CharacterMedallion } from "@/components/character/CharacterMedallion";
import { GENERIC_TRAVELLER_ID, resolveClaimDescriptor } from "@/features/game/claims";
import { AliveToggle, isSeatDead } from "@/features/game/AliveToggle";
import { type ClaimDescriptor, type GamePlayer, type PlayerStatus } from "@/features/game/types";

const TEAM_GROUPS = [
  { team: 'townsfolk', label: 'Townsfolk' },
  { team: 'outsider', label: 'Outsiders' },
  { team: 'minion', label: 'Minions' },
  { team: 'demon', label: 'Demons' },
  { team: 'traveler', label: 'Travellers' },
] as const;

interface SheetCharacter {
  id: string;
  name: string;
  team: string;
  ability?: string;
}

/**
 * The seat sheet: everything about one seat in a single bottom sheet. Header
 * (name, alive/dead toggle, seat menu), the claims this player has made as
 * removable chips, the script's characters to add claims from, and the seat's
 * note pinned at the bottom. Opens whenever `player` is set.
 */
export function SeatSheet({
  player,
  players,
  scriptCharacterIds,
  onClose,
  onToggleAlive,
  onSetPlayerStatus,
  onAddClaim,
  onRemoveClaim,
  onSetNotes,
  onSetPlayerName,
  onConvertToTraveler,
  onRemovePlayer,
  canRemovePlayer = true,
}: {
  player: GamePlayer | null;
  players: GamePlayer[];
  scriptCharacterIds?: string[] | null;
  onClose: () => void;
  onToggleAlive: () => void;
  onSetPlayerStatus?: (status: PlayerStatus) => void;
  onAddClaim: (characterId: string) => void;
  onRemoveClaim: (characterId: string) => void;
  onSetNotes: (notes: string) => void;
  onSetPlayerName: (name: string) => void;
  onConvertToTraveler?: () => void;
  onRemovePlayer?: () => void;
  canRemovePlayer?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const { friends } = useFriends();

  // The script's characters (every character without a script), grouped by
  // team, plus the generic Traveller claim. Travellers and Fabled from the
  // script itself are not claims a player makes.
  const pool = useMemo<SheetCharacter[]>(() => {
    const chars: SheetCharacter[] = ALL_CHARACTERS
      .filter(c => c.team !== 'traveler' && c.team !== 'fabled')
      .filter(c => !scriptCharacterIds || scriptCharacterIds.length === 0 || scriptCharacterIds.includes(c.id))
      .map(c => ({ id: c.id, name: c.name, team: c.team, ability: c.ability }))
      .sort((a, b) => a.name.localeCompare(b.name));
    chars.push({ id: GENERIC_TRAVELLER_ID, name: 'Traveller', team: 'traveler' });
    return chars;
  }, [scriptCharacterIds]);

  const groups = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matches = (c: SheetCharacter) =>
      !term ||
      c.name.toLowerCase().includes(term) ||
      c.team.toLowerCase().includes(term) ||
      (c.id === GENERIC_TRAVELLER_ID && "traveler".includes(term));
    return TEAM_GROUPS
      .map(g => ({ ...g, characters: pool.filter(c => c.team === g.team && matches(c)) }))
      .filter(g => g.characters.length > 0);
  }, [pool, search]);

  if (!player) return null;

  const seatIndex = players.findIndex(p => p.id === player.id);
  const displayName = player.name.trim() || `Player ${seatIndex + 1}`;
  const isDead = isSeatDead(player);
  const claimed = new Set(player.claims);
  const claims = player.claims
    .map(id => resolveClaimDescriptor(id))
    .filter((c): c is ClaimDescriptor => c !== null);

  // Names on OTHER seats (case-insensitive), so a friend seated elsewhere
  // cannot be picked twice. This seat's own name stays available.
  const takenSeatNames = new Set(
    players
      .filter(p => p.id !== player.id)
      .map(p => p.name.trim().toLowerCase()),
  );

  const commitName = () => {
    const next = editedName.trim();
    if (next && next !== player.name) onSetPlayerName(next);
    setIsEditingName(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    setSearch("");
    setIsEditingName(false);
    setNoteOpen(false);
    onClose();
  };

  return (
    <>
      <Drawer open={!!player} onOpenChange={handleOpenChange}>
        <DrawerContent
          className="parchment-scope flex h-[88dvh] flex-col border-[var(--parchment-border)] bg-[var(--parchment-panel)]"
          onOpenAutoFocus={(e) => e.preventDefault()}
          data-testid={`sheet-seat-${player.id}`}
        >
          {/* Header: name, alive/dead toggle, seat menu */}
          <div className="shrink-0 px-4 pb-3 pt-3">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                {isEditingName ? (
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={commitName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitName();
                      else if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    autoFocus
                    className="h-11 w-full px-2 font-display text-[26px]"
                    data-testid="input-edit-player-name"
                  />
                ) : (
                  <DrawerTitle
                    className="truncate font-display text-[26px] font-normal leading-tight tracking-normal text-[var(--parchment-ink)]"
                    data-testid="text-seat-sheet-name"
                  >
                    {displayName}
                  </DrawerTitle>
                )}
                <DrawerDescription className="sr-only">Claims and note for {displayName}</DrawerDescription>
              </div>

              <AliveToggle
                isDead={isDead}
                playerName={displayName}
                onToggle={onToggleAlive}
                data-testid="button-toggle-alive"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="btn-icon text-[var(--parchment-ink-muted)]"
                    aria-label={`Seat options for ${displayName}`}
                    data-testid="button-seat-menu"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  // Keep focus off the trigger on close, so the rename field keeps it.
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <DropdownMenuItem
                    onSelect={() => {
                      // Wait for the menu to close and settle focus, or the
                      // rename field would mount, lose focus and close again.
                      setTimeout(() => {
                        setEditedName(player.name);
                        setIsEditingName(true);
                      }, 0);
                    }}
                    data-testid="button-edit-player-name"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  {!player.isTraveler && onConvertToTraveler && (
                    <DropdownMenuItem onSelect={onConvertToTraveler} data-testid="button-convert-to-traveler">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Make Traveler
                    </DropdownMenuItem>
                  )}
                  {player.isTraveler && onSetPlayerStatus && player.status !== 'exiled' && (
                    <DropdownMenuItem onSelect={() => onSetPlayerStatus('exiled')} data-testid="button-set-exiled">
                      <Ban className="mr-2 h-4 w-4" />
                      Mark Exiled
                    </DropdownMenuItem>
                  )}
                  {player.isTraveler && onSetPlayerStatus && player.status !== 'left' && (
                    <DropdownMenuItem onSelect={() => onSetPlayerStatus('left')} data-testid="button-set-left">
                      <LogOut className="mr-2 h-4 w-4" />
                      Mark Left
                    </DropdownMenuItem>
                  )}
                  {onRemovePlayer && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={!canRemovePlayer}
                        onSelect={() => setShowRemoveConfirm(true)}
                        className="text-[var(--parchment-minion)] focus:text-[var(--parchment-minion)] [&_svg]:text-[var(--parchment-minion)]"
                        data-testid="button-remove-player"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {canRemovePlayer ? "Remove Player" : "Cannot remove last player"}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {isEditingName && friends.length > 0 && (
              <div className="mt-3" data-testid="section-from-friends">
                <h3 className="section-label mb-3">From Friends</h3>
                <div className="flex flex-wrap gap-3">
                  {friends.map((friend) => {
                    const seated = takenSeatNames.has(friend.name.trim().toLowerCase());
                    return (
                      <button
                        key={friend.id}
                        type="button"
                        disabled={seated}
                        onMouseDown={(e) => e.preventDefault()}
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => setEditedName(friend.name)}
                        className="btn-secondary"
                        data-testid={`button-assign-friend-${friend.id}`}
                      >
                        {friend.name}
                        {seated && <span className="ml-1.5 text-[10px] uppercase tracking-wider opacity-70">seated</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Claims this player has made */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5" data-testid={`row-claims-${player.id}`}>
              {claims.length > 0 ? (
                claims.map((char) => {
                  const team = teamParchment(char.team);
                  return (
                    <span
                      key={char.id}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border-[1.5px] py-0.5 pl-2.5 pr-1 font-display text-[15px] leading-tight",
                        team.tint,
                        team.border,
                        team.text,
                      )}
                      data-team={char.team}
                      data-testid={`chip-claim-${char.id}-${player.id}`}
                    >
                      {char.name}
                      <button
                        type="button"
                        onClick={() => onRemoveClaim(char.id)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Remove ${char.name} claim`}
                        data-testid={`button-remove-claim-${char.id}-${player.id}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  );
                })
              ) : (
                <span className="font-serif text-[15px] italic text-[var(--parchment-ink-muted)]" data-testid={`text-no-claims-${player.id}`}>
                  No claims yet. Tap a character to add one.
                </span>
              )}
            </div>

            {/* Search */}
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--parchment-ink-faint)]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search characters..."
                className="h-11 rounded-[10px] bg-[var(--parchment-raised)] pl-10 font-serif text-base placeholder:text-[var(--parchment-ink-faint)]"
                data-testid="input-search-character"
              />
            </div>
          </div>

          {/* The script's characters, by team */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3" data-testid="list-seat-characters">
            {groups.map((group) => (
              <section key={group.team} className="mb-6" data-testid={`section-team-${group.team}`}>
                <h3 className="section-label mb-3">{group.label}</h3>
                <div className="space-y-3">
                  {group.characters.map((char) => {
                    const isClaimed = claimed.has(char.id);
                    return (
                      <button
                        key={char.id}
                        type="button"
                        disabled={isClaimed}
                        onClick={() => onAddClaim(char.id)}
                        className={cn(
                          "game-card flex w-full items-center gap-3 p-2.5 text-left transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isClaimed ? "cursor-default opacity-60" : "hover:bg-[var(--parchment-control)]",
                        )}
                        aria-label={isClaimed ? `${char.name}, already claimed` : `Add ${char.name} claim`}
                        data-claimed={isClaimed ? "true" : undefined}
                        data-testid={`button-select-character-${char.id}`}
                      >
                        <CharacterMedallion
                          characterId={char.id === GENERIC_TRAVELLER_ID ? undefined : char.id}
                          team={char.team}
                          size={36}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-base leading-tight text-[var(--parchment-ink)]">{char.name}</span>
                          {char.ability && (
                            <span className="mt-0.5 block font-serif text-[13px] leading-snug text-[var(--parchment-ink-body)]">{char.ability}</span>
                          )}
                        </span>
                        {/* Tappable cards show a chevron (UI rule 4); claimed ones do nothing and show none. */}
                        {!isClaimed && <ChevronRight className="h-4 w-4 shrink-0 text-[var(--parchment-ink-faint)]" data-testid={`chevron-character-${char.id}`} />}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
            {groups.length === 0 && (
              <p className="py-8 text-center font-serif italic text-[var(--parchment-ink-muted)]" data-testid="text-no-characters">
                No characters found
              </p>
            )}
          </div>

          {/* Note, pinned at the bottom */}
          <div className="shrink-0 border-t border-[var(--parchment-rule)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
            <div className="relative">
              <Pencil className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[var(--parchment-ink-faint)]" />
              <Textarea
                value={player.notes}
                onChange={(e) => onSetNotes(e.target.value)}
                onFocus={() => setNoteOpen(true)}
                onBlur={() => setNoteOpen(false)}
                rows={noteOpen ? 4 : 1}
                placeholder="Add a note about this player..."
                className={cn(
                  "resize-none rounded-[10px] border-[var(--parchment-control-border)] bg-[var(--parchment-raised)] pl-9 font-serif text-base",
                  noteOpen ? "min-h-[104px]" : "h-11 min-h-0 overflow-hidden whitespace-nowrap py-2.5",
                )}
                data-state={noteOpen ? "open" : "closed"}
                data-testid="textarea-notes"
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent className="parchment-scope rounded-[14px] border-[var(--parchment-border)] bg-[var(--parchment-panel)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl font-semibold text-[var(--parchment-ink)]">Remove Player?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{displayName}" from the game? This deletes their note and claims.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-remove">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRemovePlayer?.();
                setShowRemoveConfirm(false);
                onClose();
              }}
              data-testid="button-confirm-remove"
            >
              Remove Player
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
