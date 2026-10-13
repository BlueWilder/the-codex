import { useState, useMemo } from "react";
import { ALL_CHARACTERS } from "@/lib/game-data";
import { Plus, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function AddTravelerDialog({
  open,
  onClose,
  onAddTraveler,
}: {
  open: boolean;
  onClose: () => void;
  onAddTraveler: (name: string, initialClaims?: string[]) => void;
}) {
  const [name, setName] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [claimSearch, setClaimSearch] = useState("");

  const travelerCharacters = useMemo(() => {
    let chars = ALL_CHARACTERS.filter(c => c.team === "traveler");
    if (claimSearch) {
      chars = chars.filter(c => c.name.toLowerCase().includes(claimSearch.toLowerCase()));
    }
    return chars;
  }, [claimSearch]);

  const resetState = () => {
    setName("");
    setSelectedClaim(null);
    setClaimSearch("");
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    const claims = selectedClaim ? [selectedClaim] : [];
    onAddTraveler(name.trim(), claims);
    resetState();
    onClose();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm parchment-scope rounded-[14px] border-[var(--parchment-border)] bg-[var(--parchment-panel)]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold text-[var(--parchment-ink)]">Add Traveler</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="section-label mb-2 block">Traveler Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Traveler name"
              data-testid="input-traveler-name"
            />
          </div>
          <div>
            <label className="section-label mb-2 block">Character Claim (optional)</label>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={claimSearch}
                onChange={(e) => setClaimSearch(e.target.value)}
                placeholder="Search travelers..."
                className="pl-8"
                data-testid="input-search-traveler-claim"
              />
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {travelerCharacters.map(char => (
                <button
                  key={char.id}
                  onClick={() => setSelectedClaim(selectedClaim === char.id ? null : char.id)}
                  className={cn(
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                    "w-full text-left px-2 py-1.5 rounded-md text-sm flex items-center gap-2",
                    selectedClaim === char.id 
                      ? "border border-[var(--parchment-ink-link)] bg-[var(--parchment-control)] text-[var(--parchment-ink)]" 
                      : "hover-elevate"
                  )}
                  data-testid={`button-claim-${char.id}`}
                >
                  {char.name}
                  {selectedClaim === char.id && <Check className="ml-auto h-3.5 w-3.5 text-[var(--parchment-ink-link)]" />}
                </button>
              ))}
              {travelerCharacters.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">No travelers found</p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="pill" className="flex-1" onClick={handleClose} data-testid="button-cancel-add-traveler">
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleAdd} disabled={!name.trim()} data-testid="button-confirm-add-traveler">
              <Plus />
              Add Traveler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
