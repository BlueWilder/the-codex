import { useState, useMemo } from "react";
import { ALL_CHARACTERS } from "@/lib/game-data";
import { Check, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { teamBadge } from "@/lib/team-style";
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
      <DialogContent className="max-w-md p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="flex flex-col max-h-[70vh] overflow-hidden p-6 pb-0">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-display text-amber-500">{title ?? (singleSelect ? "Set Claim" : "Select Characters")}</DialogTitle>
          </DialogHeader>
          <div className="relative mb-4 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search characters..."
              className="pl-10"
              data-testid="input-search-character"
            />
          </div>
          <div className="flex-1 overflow-y-auto -mx-2 px-2">
            <div className="space-y-1 pb-4">
              {pickerOptions.map(char => {
                const isPrimary = singleSelect && primaryClaimId === char.id;
                const isSelected = singleSelect ? isPrimary : selected.has(char.id);
                return (
                  <button
                    key={char.id}
                    onClick={() => handleSelectRow(char.id)}
                    className={cn(
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                      "w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-3",
                      "hover-elevate active-elevate-2",
                      teamBadge(char.team),
                      isSelected && "ring-2 ring-amber-500 ring-offset-1 ring-offset-background"
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
                    {isPrimary && (
                      <Check className="w-4 h-4 text-amber-500 shrink-0" data-testid={`icon-current-claim-${char.id}`} />
                    )}
                    <span className="font-medium">{char.name}</span>
                    <span className="ml-auto flex items-center gap-2">
                      {isPrimary && (
                        <span className="text-xs text-amber-500/80" data-testid={`text-tap-to-remove-${char.id}`}>
                          Tap to remove
                        </span>
                      )}
                      <TeamBadge team={char.team} variant="label" />
                    </span>
                  </button>
                );
              })}
              {pickerOptions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No characters found</p>
              )}
            </div>
          </div>
        </div>
        {!singleSelect && (
          <div className="flex items-center justify-between gap-3 p-4 border-t border-border bg-card/50">
            <span className="text-sm text-muted-foreground">
              {selected.size > 0 ? `${selected.size} selected` : "Select characters to add"}
            </span>
            <Button 
              onClick={handleConfirm}
              disabled={selected.size === 0}
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
