import { useState, useRef } from "react";
import { ALL_CHARACTERS, getJinxesForCharacter } from "@/lib/game-data";
import { useFriends } from "@/hooks/use-friends";
import { X, Plus, FileText, UserPlus, Ban, LogOut, Trash2, Pencil, Info, ExternalLink, Users, Skull, Theater } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerClose } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TeamBadge } from "@/components/character/TeamBadge";
import { NightBadges } from "@/components/character/NightBadges";
import { JinxBadge } from "@/components/character/JinxBadge";
import { JinxList } from "@/components/character/JinxList";
import { GENERIC_TRAVELLER_ID, resolveClaimDescriptor, candidateChipClass } from "@/features/game/claims";
import { type GamePlayer, type PlayerStatus } from "@/features/game/types";
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

  const claimedCharacters = player.claims.map(id => resolveClaimDescriptor(id)).filter(Boolean);

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
        <DrawerContent className="max-h-[85vh] flex flex-col">
          <DrawerHeader className="border-b border-border pb-4 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                {player.status === 'dead' && <Skull className="w-5 h-5 text-muted-foreground" />}
                {player.status === 'exiled' && <Ban className="w-5 h-5 text-purple-400" />}
                {player.status === 'left' && <LogOut className="w-5 h-5 text-muted-foreground" />}
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
                    className="font-display text-xl text-amber-500 h-8 w-40"
                    data-testid="input-edit-player-name"
                  />
                ) : (
                  <button
                    onClick={() => {
                      setEditedName(player.name);
                      setIsEditingName(true);
                    }}
                    className="font-display text-xl text-amber-500 hover:underline hover:underline-offset-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                    data-testid="button-edit-player-name"
                  >
                    {player.name}
                    <Pencil className="w-3.5 h-3.5 inline ml-1.5 opacity-50" />
                  </button>
                )}
                {player.isTraveler && (
                  <Badge variant="secondary" className="bg-purple-900/40 text-purple-300 border-purple-700">
                    Traveler
                  </Badge>
                )}
                <Badge 
                  variant={player.status === 'alive' ? "default" : "secondary"} 
                  className={cn(
                    player.status === 'alive' && "bg-emerald-900/50 text-emerald-300",
                    player.status === 'exiled' && "bg-purple-900/50 text-purple-300",
                    player.status === 'left' && "bg-muted text-muted-foreground"
                  )}
                >
                  {player.status === 'alive' ? "Alive" : player.status === 'dead' ? "Dead" : player.status === 'exiled' ? "Exiled" : "Left"}
                </Badge>
              </div>
              <DrawerClose asChild>
                <Button size="icon" variant="ghost" data-testid="button-close-drawer">
                  <X className="w-5 h-5" />
                </Button>
              </DrawerClose>
            </div>
            {isEditingName && friends.length > 0 && (
              <div className="mt-3 text-left" data-testid="section-from-friends">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Users className="w-3.5 h-3.5 text-[#c79fe6]" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#c79fe6]">From Friends</span>
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
                            ? "border-[#3d2f57]/40 bg-transparent text-muted-foreground/50 cursor-not-allowed"
                            : "border-[#3d2f57] bg-[#c79fe6]/5 text-[#c79fe6] hover:bg-[#c79fe6]/15"
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
            <div className="p-4">
            <div className="space-y-6">
              {/* Status Controls - Different for Travelers vs Regular Players */}
              {player.isTraveler ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {player.status !== 'alive' && onSetPlayerStatus && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-emerald-800 text-emerald-400"
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
                        className="border-red-800 text-red-400"
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
                        className="border-purple-800 text-purple-400"
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
                        className="border-muted text-muted-foreground"
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
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1",
                      player.status === 'alive'
                        ? "border-red-800 text-red-400"
                        : "border-emerald-800 text-emerald-400"
                    )}
                    onClick={onToggleAlive}
                    data-testid="button-toggle-alive"
                  >
                    <Skull className="w-4 h-4 mr-2" />
                    {player.status === 'alive' ? "Mark as Dead" : "Mark as Alive"}
                  </Button>
                </div>
              )}

              {/* Claims Section - Primary focus */}
              <div className="rounded-lg bg-card/50 border border-border/50 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-amber-500/80 flex items-center gap-2">
                    <Theater className="w-4 h-4" /> Claims
                  </h3>
                  <Button size="sm" variant="outline" className="border-amber-800/50 text-amber-400" onClick={() => setShowCharacterPicker(true)} data-testid="button-add-claim">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                {claimedCharacters.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {claimedCharacters.map((char, idx) => char && (
                      <div
                        key={char.id}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border pl-3 pr-1.5 py-1",
                          candidateChipClass(char.team, idx === 0)
                        )}
                        data-testid={idx === 0 ? `chip-primary-${player.id}` : `badge-claim-${char.id}`}
                      >
                        {char.id !== GENERIC_TRAVELLER_ID ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 text-base font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                            onClick={() => {
                              const full = ALL_CHARACTERS.find(c => c.id === char.id);
                              if (full) setPreviewCharacter(full);
                            }}
                            title={`View ${char.name}`}
                            data-testid={`button-claim-info-${char.id}-${player.id}`}
                          >
                            {char.name}
                            <Info className="w-3.5 h-3.5 opacity-60" />
                          </button>
                        ) : (
                          <span className="text-base font-semibold">{char.name}</span>
                        )}
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-background/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                          onClick={() => onRemoveClaim(char.id)}
                          title={`Remove ${char.name} claim`}
                          aria-label={`Remove ${char.name} claim`}
                          data-testid={`button-remove-claim-${char.id}-${player.id}`}
                        >
                          <X className="w-4 h-4 opacity-70" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic" data-testid={`text-no-claims-${player.id}`}>No claims recorded</p>
                )}
              </div>


              {/* Notes Section */}
              <div ref={notesSectionRef} className="rounded-lg bg-card/30 border border-border/30 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Notes
                  </h3>
                </div>
                <Textarea
                  value={player.notes}
                  onChange={(e) => onSetNotes(e.target.value)}
                  onFocus={() => {
                    setTimeout(() => {
                      notesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 350);
                  }}
                  placeholder="Add notes about this player..."
                  className="min-h-[80px] resize-none bg-background/50"
                  data-testid="textarea-notes"
                />
              </div>

              {/* Player Actions - subtle styling at bottom */}
              {!player.isTraveler && (onConvertToTraveler || onRemovePlayer) && (
                <div className="pt-6 mt-6 border-t border-border/50 space-y-2">
                  {onConvertToTraveler && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground hover:text-purple-400"
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
                      className="w-full text-muted-foreground hover:text-destructive"
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
