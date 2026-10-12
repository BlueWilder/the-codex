import { useState, useMemo } from "react";
import { ALL_CHARACTERS } from "@/lib/game-data";
import { Check, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { teamParchment } from "@/lib/team-style";
import { CharacterMedallion } from "@/components/character/CharacterMedallion";
import { TeamBadge } from "@/components/character/TeamBadge";
import { type ClaimDescriptor } from "@/features/game/types";
import { GENERIC_TRAVELLER_ID } from "@/features/game/claims";

export function CharacterPicker({ 
  open, 
  onClose, 
  onSelect,
  onRemove,
  excludeIds = [],
  scriptCharacterIds,
  singleSelect = false,
  primaryClaimId,
  title,
}: { 
  open: boolean; 
  onClose: () => void; 
  onSelect: (characterIds: string[]) => void;
  onRemove?: (characterId: string) => void;
  excludeIds?: string[];
  scriptCharacterIds?: string[] | null;
  singleSelect?: boolean;
  primaryClaimId?: string;
  title?: string;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filteredCharacters = useMemo(() => {
    const term = search.toLowerCase();
    const getTeamOrder = (team: string) => {
      switch (team) {
        case 'townsfolk': return 0;
        case 'outsider': return 1;
        case 'minion': return 2;
        case 'demon': return 3;
        case 'traveler': return 4;
        case 'fabled': return 5;
        default: return 6;
      }
    };
    return ALL_CHARACTERS.filter(c => {
      if (excludeIds.includes(c.id)) return false;
      if (c.team === 'traveler' || c.team === 'fabled') return false;
      if (scriptCharacterIds && scriptCharacterIds.length > 0 && !scriptCharacterIds.includes(c.id)) return false;
      return c.name.toLowerCase().includes(term) || c.team.toLowerCase().includes(term);
    }).sort((a, b) => {
      const orderDiff = getTeamOrder(a.team) - getTeamOrder(b.team);
      if (orderDiff !== 0) return orderDiff;
      return a.name.localeCompare(b.name);
    });
  }, [search, excludeIds, scriptCharacterIds]);

  const pickerOptions = useMemo<ClaimDescriptor[]>(() => {
    const opts: ClaimDescriptor[] = filteredCharacters.map(c => ({
      id: c.id,
      name: c.name,
      team: c.team,
    }));
    const term = search.toLowerCase();
    const travellerAlreadyClaimed = excludeIds.includes(GENERIC_TRAVELLER_ID);
    const matchesSearch =
      !term || "traveller".includes(term) || "traveler".includes(term);
    if (!travellerAlreadyClaimed && matchesSearch) {
      opts.push({ id: GENERIC_TRAVELLER_ID, name: "Traveller", team: "traveler" });
    }
    return opts;
  }, [filteredCharacters, search, excludeIds]);

  const toggleCharacter = (charId: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(charId)) {
        next.delete(charId);
      } else {
        next.add(charId);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (selected.size > 0) {
      onSelect(Array.from(selected));
    }
    setSelected(new Set());
    setSearch("");
    onClose();
  };

  const handleSelectRow = (charId: string) => {
    if (singleSelect) {
      if (primaryClaimId && charId === primaryClaimId) {
        onRemove?.(charId);
      } else {
        onSelect([charId]);
      }
      setSelected(new Set());
      setSearch("");
      onClose();
      return;
    }
    toggleCharacter(charId);
  };

  const handleClose = () => {
    setSelected(new Set());
    setSearch("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="parchment-scope max-w-md gap-0 rounded-[14px] border-[var(--parchment-border)] bg-[var(--parchment-panel)] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex max-h-[70vh] flex-col overflow-hidden px-3.5 pt-4">
          <DialogHeader className="mb-3 text-left">
            <DialogTitle className="font-display text-2xl font-semibold text-[var(--parchment-ink)]">{title ?? (singleSelect ? "Set Claim" : "Select Characters")}</DialogTitle>
          </DialogHeader>
          <div className="relative mb-3 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--parchment-ink-faint)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search characters..."
              className="rounded-[10px] bg-[var(--parchment-raised)] pl-10 font-serif text-base placeholder:text-[var(--parchment-ink-faint)]"
              data-testid="input-search-character"
            />
          </div>
          <div className="-mx-1 flex-1 overflow-y-auto px-1">
            <div className="space-y-2 pb-3">
              {pickerOptions.map(char => {
                const isPrimary = singleSelect && primaryClaimId === char.id;
                const isSelected = singleSelect ? isPrimary : selected.has(char.id);
                return (
                  <button
                    key={char.id}
                    onClick={() => handleSelectRow(char.id)}
                    className={cn(
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "game-card flex w-full items-center gap-3 p-2.5 text-left transition-colors hover:bg-[var(--parchment-control)]",
                      isSelected && cn("border-[1.5px]", teamParchment(char.team).border)
                    )}
                    title={isPrimary ? `Tap to remove ${char.name} claim` : undefined}
                    data-testid={`button-select-character-${char.id}`}
                  >
                    {!singleSelect && (
                      <Checkbox 
                        checked={isSelected} 
                        className="pointer-events-none"
                        data-testid={`checkbox-character-${char.id}`}
                      />
                    )}
                    <CharacterMedallion
                      characterId={char.id === GENERIC_TRAVELLER_ID ? undefined : char.id}
                      team={char.team}
                      size={40}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-lg font-semibold leading-tight text-[var(--parchment-ink)]">{char.name}</span>
                      <TeamBadge team={char.team} variant="label" />
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {isPrimary && (
                        <span className="game-label text-[var(--parchment-ink-link)]" data-testid={`text-tap-to-remove-${char.id}`}>
                          Tap to remove
                        </span>
                      )}
                      {isPrimary && (
                        <Check className="h-4 w-4 shrink-0 text-[var(--parchment-ink-link)]" data-testid={`icon-current-claim-${char.id}`} />
                      )}
                    </span>
                  </button>
                );
              })}
              {pickerOptions.length === 0 && (
                <p className="py-8 text-center font-serif italic text-[var(--parchment-ink-muted)]">No characters found</p>
              )}
            </div>
          </div>
        </div>
        {!singleSelect && (
          <div className="flex items-center justify-between gap-3 border-t border-[var(--parchment-rule)] px-3.5 py-3">
            <span className="font-serif text-sm text-[var(--parchment-ink-muted)]">
              {selected.size > 0 ? `${selected.size} selected` : "Select characters to add"}
            </span>
            <Button 
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="bg-[var(--parchment-ink-link)] text-[var(--parchment-panel)] hover:bg-[var(--parchment-ink)]"
              data-testid="button-confirm-add-claims"
            >
              Add {selected.size > 0 ? `${selected.size} ` : ""}Claim{selected.size !== 1 ? "s" : ""}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
