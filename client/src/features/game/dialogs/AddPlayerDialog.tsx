import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type GamePlayer } from "@/features/game/types";

export function AddPlayerDialog({
  open,
  onClose,
  onAddPlayer,
  players,
}: {
  open: boolean;
  onClose: () => void;
  onAddPlayer: (name: string, insertAfterPlayerId: string | null) => void;
  players: GamePlayer[];
}) {
  const [name, setName] = useState(`Player ${players.length + 1}`);
  const [insertAfter, setInsertAfter] = useState<string>("__end__");

  const resetState = () => {
    setName(`Player ${players.length + 1}`);
    setInsertAfter("__end__");
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    onAddPlayer(name.trim(), insertAfter === "__beginning__" ? null : insertAfter);
    resetState();
    onClose();
  };

  const handleAddAsTraveler = () => {
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
          <DialogTitle className="font-display text-2xl font-semibold text-[var(--parchment-ink)]">Add Player</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Player Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Player name"
              data-testid="input-new-player-name"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Insert After</label>
            <select
              value={insertAfter}
              onChange={(e) => setInsertAfter(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              data-testid="select-insert-position"
            >
              <option value="__beginning__">At beginning</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              <option value="__end__">At end</option>
            </select>
          </div>
          <p className="flex items-center gap-1 font-serif text-sm text-[var(--parchment-ink-muted)]">
            <span className="font-semibold text-[var(--attention)]">Warning:</span> Adding players mid-game may affect balance. Consider Traveler instead.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={handleClose} data-testid="button-cancel-add-player">
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleAdd} disabled={!name.trim()} data-testid="button-confirm-add-player">
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
