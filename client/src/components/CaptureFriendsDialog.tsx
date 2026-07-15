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
import { cn } from "@/lib/utils";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background";

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
      <DialogContent className="max-w-md border-[#3d2f57] bg-background" data-testid="dialog-capture-friends">
        <DialogHeader>
          <DialogTitle className="font-display text-[#c79fe6] flex items-center gap-2">
            <Users className="w-5 h-5" />
            Add these players to Friends?
          </DialogTitle>
          <DialogDescription className="font-serif text-muted-foreground">
            Save names for faster setup next game. Players already in your Friends list are not shown.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 py-1">
          {names.map((name) => {
            const picked = selected.includes(name);
            return (
              <button
                key={name}
                onClick={() => toggle(name)}
                aria-pressed={picked}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-serif transition-colors duration-150",
                  picked
                    ? "border-[#c79fe6]/60 bg-[#c79fe6]/15 text-foreground"
                    : "border-[#3d2f57]/60 bg-[#c79fe6]/5 text-muted-foreground hover:bg-[#c79fe6]/10",
                  FOCUS_RING
                )}
                data-testid={`capture-chip-${name}`}
              >
                {name}
                {picked && <Check className="w-3.5 h-3.5 text-[#c79fe6]" />}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onSkip}
            data-testid="button-capture-skip"
          >
            Not now
          </Button>
          <Button
            className="flex-1 bg-[#c79fe6]/20 text-[#c79fe6] border border-[#3d2f57] hover:bg-[#c79fe6]/30 transition-colors duration-150"
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
