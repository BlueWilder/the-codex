import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Check } from "lucide-react";

interface CaptureFriendsDialogProps {
  open: boolean;
  names: string[];
  onSave: (selectedNames: string[]) => void;
  onSkip: () => void;
}

export function CaptureFriendsDialog({ open, names, onSave, onSkip }: CaptureFriendsDialogProps) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setSelected(names);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggle = (name: string) => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onSkip(); }}>
      <DialogContent className="max-w-md parchment-scope rounded-[14px] border-[var(--parchment-border)] bg-[var(--parchment-panel)]" data-testid="dialog-capture-friends">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl font-semibold text-[var(--parchment-ink)]">
            <Users className="w-5 h-5" />
            Add these players to Friends?
          </DialogTitle>
          <DialogDescription className="font-serif text-muted-foreground">
            Save names for faster setup next game. Players already in your Friends list are not shown.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-3 py-1">
          {names.map((name) => {
            const picked = selected.includes(name);
            return (
              <button
                key={name}
                onClick={() => toggle(name)}
                aria-pressed={picked}
                className="btn-secondary"
                data-active={picked ? "true" : undefined}
                data-testid={`capture-chip-${name}`}
              >
                {name}
                {picked && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button
            variant="pill"
            className="flex-1"
            onClick={onSkip}
            data-testid="button-capture-skip"
          >
            Not now
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => onSave(selected)}
            data-testid="button-capture-save"
          >
            {selected.length > 0
              ? `Save ${selected.length} ${selected.length === 1 ? "friend" : "friends"}`
              : "Save none"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
