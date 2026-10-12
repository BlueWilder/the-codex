import { useState, useRef } from "react";
import { ALL_CHARACTERS, getJinxesForCharacter } from "@/lib/game-data";
import { useFriends } from "@/hooks/use-friends";
import { X, Plus, UserPlus, Ban, LogOut, Trash2, Pencil, Info, ExternalLink, Users, Skull, Theater } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Drawer, DrawerContent, DrawerHeader, DrawerClose } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TeamBadge } from "@/components/character/TeamBadge";
import { NightBadges } from "@/components/character/NightBadges";
import { JinxBadge } from "@/components/character/JinxBadge";
import { JinxList } from "@/components/character/JinxList";
import { GENERIC_TRAVELLER_ID, resolveClaimDescriptor } from "@/features/game/claims";
import { teamParchment } from "@/lib/team-style";
import { characterIcon } from "@/lib/character-icons";
import { type ClaimDescriptor, type GamePlayer, type PlayerStatus } from "@/features/game/types";
import { CharacterPicker } from "@/features/game/dialogs/CharacterPicker";

export function PlayerDetailDrawer({
  player,
  players,
  onClose,
  onToggleAlive,
  onSetPlayerStatus,
  onAddMultipleClaims,
  onRemoveClaim,
  onSetNotes,
  onSetPlayerName,
  onRemoveTraveler,
  onRemovePlayer,
  onConvertToTraveler,
  canRemovePlayer,
  scriptCharacterIds,
}: {
  player: GamePlayer | null;
  players: GamePlayer[];
  onClose: () => void;
  onToggleAlive: () => void;
  onSetPlayerStatus?: (status: PlayerStatus) => void;
  onAddMultipleClaims: (characterIds: string[]) => void;
  onRemoveClaim: (characterId: string) => void;
  onSetNotes: (notes: string) => void;
  onSetPlayerName: (name: string) => void;
  onRemoveTraveler?: () => void;
  onRemovePlayer?: () => void;
  onConvertToTraveler?: () => void;
  canRemovePlayer?: boolean;
  scriptCharacterIds?: string[] | null;
}) {
  const [showCharacterPicker, setShowCharacterPicker] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [previewCharacter, setPreviewCharacter] = useState<typeof ALL_CHARACTERS[0] | null>(null);
  const notesSectionRef = useRef<HTMLDivElement>(null);
  const { friends } = useFriends();

  if (!player) return null;

  const claimedCharacters = player.claims
    .map(id => resolveClaimDescriptor(id))
    .filter((c): c is ClaimDescriptor => c !== null);
  const seatNumber = players.findIndex(p => p.id === player.id) + 1;
  const isDead = player.status !== 'alive';
  const statusLabel = player.status === 'alive' ? "Alive" : player.status === 'dead' ? "Dead" : player.status === 'exiled' ? "Exiled" : "Left";
  const claimCountLabel = `${claimedCharacters.length} ${claimedCharacters.length === 1 ? "claim" : "claims"}`;

  // Names currently on OTHER seats (case-insensitive), derived live so
  // renaming a seat away frees that friend again. Self seat excluded.
  const takenSeatNames = new Set(
    players
      .filter(p => p.id !== player.id)
      .map(p => p.name.trim().toLowerCase()),
  );

  return (
    <>
      <Drawer open={!!player} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="parchment-scope flex max-h-[85vh] flex-col border-[var(--parchment-border)] bg-[var(--parchment-panel)]">
          <DrawerHeader className="relative shrink-0 border-b border-[var(--parchment-rule)] px-4 pb-3 pt-3 text-left">
            {/* Close sits in the corner so the seat row keeps its width for the name. */}
            <DrawerClose asChild>
              <Button
                size="icon"
                variant="ghost"
                className="absolute -top-3 right-1 h-8 w-8 text-[var(--parchment-ink-muted)] hover:bg-[var(--parchment-control)]"
                data-testid="button-close-drawer"
              >
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
            <div className="flex items-center gap-3">
              {/* Seat medallion */}
              <span
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                  isDead
                    ? "border-2 border-[var(--parchment-ink)] bg-[var(--parchment-raised)] text-[var(--parchment-ink)]"
                    : "bg-[var(--parchment-ink)] text-[var(--parchment-panel)]"
                )}
                data-testid="medallion-seat-detail"
              >
                {player.status === 'dead' ? (
                  <Skull className="h-6 w-6" aria-label="Dead" />
                ) : player.status === 'exiled' ? (
                  <Ban className="h-6 w-6" aria-label="Exiled" />
                ) : player.status === 'left' ? (
                  <LogOut className="h-6 w-6" aria-label="Left" />
                ) : (
                  <span className="font-display text-[22px] leading-none tabular-nums">{seatNumber}</span>
                )}
              </span>

              <div className="min-w-0 flex-1">
              {isEditingName ? (
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={() => {
                    if (editedName.trim() && editedName.trim() !== player.name) {
                      onSetPlayerName(editedName.trim());
                    }
                    setIsEditingName(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (editedName.trim() && editedName.trim() !== player.name) {
                        onSetPlayerName(editedName.trim());
                      }
                      setIsEditingName(false);
                    } else if (e.key === 'Escape') {
                      setIsEditingName(false);
                    }
                  }}
                  autoFocus
                  className="font-display text-[26px] h-10 w-full max-w-[14rem] px-2"
                  data-testid="input-edit-player-name"
                />
              ) : (
                <button
                  onClick={() => {
                    setEditedName(player.name);
                    setIsEditingName(true);
                  }}
                  className="max-w-full truncate text-left font-display text-[26px] leading-tight text-[var(--parchment-ink)] hover:underline hover:underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-testid="button-edit-player-name"
                >
                  {player.name}
                  <Pencil className="ml-1.5 inline h-4 w-4 align-baseline opacity-40" />
                </button>
              )}
                <div className="font-serif text-sm text-[var(--parchment-ink-muted)]" data-testid="text-player-status-summary">
                  {player.isTraveler && <span className="game-label mr-1.5 text-[var(--parchment-traveler)]">Traveler</span>}
                  {statusLabel} · {claimCountLabel}
                </div>
              </div>

              {!player.isTraveler && (
                <button
                  type="button"
                  onClick={onToggleAlive}
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 font-sans text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    player.status === 'alive'
                      ? "border-[var(--parchment-ink)] text-[var(--parchment-ink)] hover:bg-[var(--parchment-control)]"
                      : "border-[var(--parchment-ink)] bg-[var(--parchment-ink)] text-[var(--parchment-panel)]"
                  )}
                  data-testid="button-toggle-alive"
                >
                  <Skull className="h-4 w-4" />
                  {player.status === 'alive' ? "Mark dead" : "Mark alive"}
                </button>
              )}
            </div>
          {isEditingName && friends.length > 0 && (
            <div className="mt-3 text-left" data-testid="section-from-friends">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Users className="w-3.5 h-3.5 text-[var(--parchment-ink-link)]" />
                <span className="game-label text-[var(--parchment-ink-link)]">From Friends</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
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
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-sm font-serif transition-colors duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                        seated
                          ? "border-[var(--parchment-rule)] bg-transparent text-[var(--parchment-ink-faint)] cursor-not-allowed"
                          : "border-[var(--parchment-control-border)] bg-[var(--parchment-raised)] text-[var(--parchment-ink)] hover:bg-[var(--parchment-control)]"
                      )}
                      data-testid={`button-assign-friend-${friend.id}`}
                    >
                      {friend.name}
                      {seated && (
                        <span className="ml-1.5 text-[10px] uppercase tracking-wider opacity-70">seated</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          </DrawerHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-5 p-4">
              {player.isTraveler && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {player.status !== 'alive' && onSetPlayerStatus && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[var(--parchment-control-border)] bg-[var(--parchment-raised)] text-[var(--parchment-ink)] hover:bg-[var(--parchment-control)]"
                        onClick={() => onSetPlayerStatus('alive')}
                        data-testid="button-set-alive"
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Mark Alive
                      </Button>
                    )}
                    {player.status !== 'dead' && onSetPlayerStatus && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[var(--parchment-control-border)] bg-[var(--parchment-raised)] text-[var(--parchment-ink)] hover:bg-[var(--parchment-control)]"
                        onClick={() => onSetPlayerStatus('dead')}
                        data-testid="button-set-dead"
                      >
                        <Skull className="w-4 h-4 mr-1" />
                        Mark Dead
                      </Button>
                    )}
                    {player.status !== 'exiled' && onSetPlayerStatus && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[var(--parchment-control-border)] bg-[var(--parchment-raised)] text-[var(--parchment-ink)] hover:bg-[var(--parchment-control)]"
                        onClick={() => onSetPlayerStatus('exiled')}
                        data-testid="button-set-exiled"
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Mark Exiled
                      </Button>
                    )}
                    {player.status !== 'left' && onSetPlayerStatus && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[var(--parchment-control-border)] bg-[var(--parchment-raised)] text-[var(--parchment-ink)] hover:bg-[var(--parchment-control)]"
                        onClick={() => onSetPlayerStatus('left')}
                        data-testid="button-set-left"
                      >
                        <LogOut className="w-4 h-4 mr-1" />
                        Mark Left
                      </Button>
                    )}
                  </div>
                  {onRemoveTraveler && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        onRemoveTraveler();
                        onClose();
                      }}
                      data-testid="button-remove-traveler"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove from Game
                    </Button>
                  )}
                </div>
              )}

              {/* Claims */}
              <section className="space-y-2">
                <h3 className="game-label text-[var(--parchment-townsfolk)]">Claims</h3>
                {claimedCharacters.length > 0 ? (
                  <div className="space-y-2">
                    {claimedCharacters.map((char, idx) => {
                      const team = teamParchment(char.team);
                      const isBelieved = idx === 0;
                      const full = char.id !== GENERIC_TRAVELLER_ID ? ALL_CHARACTERS.find(c => c.id === char.id) : undefined;
                      const icon = full ? characterIcon(full.id) : undefined;
                      const record = (player.claimRecords ?? []).find(r => r.characterId === char.id);
                      return (
                        <div
                          key={char.id}
                          className={cn("game-card flex items-start gap-3 p-2.5", isBelieved && cn("border-[1.5px]", team.border))}
                          data-testid={isBelieved ? `chip-primary-${player.id}` : `badge-claim-${char.id}`}
                        >
                          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2", team.tint, team.ring)}>
                            {icon ? (
                              <img src={icon} alt="" className="h-full w-full rounded-full object-cover" />
                            ) : (
                              <Theater className={cn("h-5 w-5", team.text)} />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              {full ? (
                                <button
                                  type="button"
                                  className="inline-flex min-w-0 items-center gap-1 text-left font-display text-xl leading-tight text-[var(--parchment-ink)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  onClick={() => setPreviewCharacter(full)}
                                  title={`View ${char.name}`}
                                  data-testid={`button-claim-info-${char.id}-${player.id}`}
                                >
                                  <span className="truncate">{char.name}</span>
                                  <Info className="h-3.5 w-3.5 shrink-0 opacity-40" />
                                </button>
                              ) : (
                                <span className="font-display text-xl leading-tight text-[var(--parchment-ink)]">{char.name}</span>
                              )}
                              <div className="flex shrink-0 items-center gap-1">
                                {isBelieved && (
                                  <span className={cn("game-label rounded-full px-2 py-0.5", team.tint, team.text)} data-testid={`tag-believed-${player.id}`}>
                                    Believed
                                  </span>
                                )}
                                <button
                                  type="button"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--parchment-ink-muted)] transition-colors hover:bg-[var(--parchment-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  onClick={() => onRemoveClaim(char.id)}
                                  title={`Remove ${char.name} claim`}
                                  aria-label={`Remove ${char.name} claim`}
                                  data-testid={`button-remove-claim-${char.id}-${player.id}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            {full && (
                              <p className="mt-0.5 font-serif text-sm leading-snug text-[var(--parchment-ink-body)]">{full.ability}</p>
                            )}
                            {record && (
                              <p className="mt-1 font-serif text-sm italic text-[var(--parchment-ink-muted)]" data-testid={`text-claim-note-${char.id}-${player.id}`}>
                                Claimed Day {record.day}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="font-serif text-base italic text-[var(--parchment-ink-muted)]" data-testid={`text-no-claims-${player.id}`}>No claims recorded</p>
                )}
                <button
                  type="button"
                  onClick={() => setShowCharacterPicker(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-[var(--parchment-control-border)] py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[var(--parchment-ink-link)] transition-colors hover:bg-[var(--parchment-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-testid="button-add-claim"
                >
                  <Plus className="h-4 w-4" /> Add claim
                </button>
              </section>

              {/* Notes */}
              <section ref={notesSectionRef} className="space-y-2">
                <h3 className="game-label text-[var(--parchment-townsfolk)]">Notes</h3>
                <Textarea
                  value={player.notes}
                  onChange={(e) => onSetNotes(e.target.value)}
                  onFocus={() => {
                    setTimeout(() => {
                      notesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 350);
                  }}
                  placeholder="Add notes about this player..."
                  className="min-h-[80px] resize-none rounded-[10px] bg-[var(--parchment-raised)] font-serif text-base"
                  data-testid="textarea-notes"
                />
              </section>

              {/* Player Actions - subtle styling at bottom */}
              {!player.isTraveler && (onConvertToTraveler || onRemovePlayer) && (
                <div className="mt-2 space-y-1 border-t border-[var(--parchment-rule)] pt-4">
                  {onConvertToTraveler && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-[var(--parchment-ink-muted)] hover:bg-[var(--parchment-control)] hover:text-[var(--parchment-ink)]"
                      onClick={() => {
                        onConvertToTraveler();
                        onClose();
                      }}
                      data-testid="button-convert-to-traveler"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Make Traveler
                    </Button>
                  )}
                  {onRemovePlayer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-[var(--parchment-ink-muted)] hover:bg-[var(--parchment-control)] hover:text-[var(--parchment-minion)]"
                      onClick={() => setShowRemoveConfirm(true)}
                      disabled={!canRemovePlayer}
                      data-testid="button-remove-player"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {canRemovePlayer ? "Remove Player" : "Cannot remove last player"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      {/* Remove Player Confirmation */}
      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Player?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{player?.name}" from the game? This will delete all their notes, claims, and history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-remove">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

      <CharacterPicker
        open={showCharacterPicker}
        onClose={() => setShowCharacterPicker(false)}
        onSelect={(characterIds) => onAddMultipleClaims(characterIds)}
        excludeIds={player.claims}
        scriptCharacterIds={scriptCharacterIds}
      />

      {/* Character Preview Dialog */}
      <Dialog open={!!previewCharacter} onOpenChange={(open) => !open && setPreviewCharacter(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          {previewCharacter && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <TeamBadge team={previewCharacter.team} variant="pill" />
                  <span className="text-amber-400 font-display">{previewCharacter.name}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {/* Night order & jinx badges */}
                {(() => {
                  const previewJinxes = getJinxesForCharacter(previewCharacter.id);
                  const hasBadges =
                    previewCharacter.firstNightOrder !== null ||
                    previewCharacter.otherNightOrder !== null ||
                    previewJinxes.length > 0;
                  return hasBadges ? (
                    <div className="flex flex-wrap gap-2">
                      <NightBadges char={previewCharacter} />
                      <JinxBadge count={previewJinxes.length} />
                    </div>
                  ) : null;
                })()}

                {/* Ability */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Ability</h4>
                  <p className="text-sm leading-relaxed text-foreground/90 italic">"{previewCharacter.ability}"</p>
                </div>

                {/* Extended Summary */}
                {previewCharacter.extendedSummary && (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">How it Works</h4>
                    <p className="text-sm leading-relaxed text-foreground/80">{previewCharacter.extendedSummary}</p>
                  </div>
                )}

                {/* Tips (first 3) */}
                {previewCharacter.tipsAndTricks && previewCharacter.tipsAndTricks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Tips</h4>
                    <ul className="text-sm space-y-1 text-foreground/80">
                      {previewCharacter.tipsAndTricks.slice(0, 3).map((tip, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-amber-500">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Jinxes */}
                <JinxList char={previewCharacter} jinxes={getJinxesForCharacter(previewCharacter.id)} />

                {/* Action buttons */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(`/reference?character=${previewCharacter.id}`, '_blank')}
                    data-testid="button-view-full-reference"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Full Reference
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      onRemoveClaim(previewCharacter.id);
                      setPreviewCharacter(null);
                    }}
                    data-testid="button-remove-claim-from-preview"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Claim
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
