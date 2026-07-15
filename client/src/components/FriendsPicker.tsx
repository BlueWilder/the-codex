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
import { useFriends } from "@/hooks/use-friends";
import { cn } from "@/lib/utils";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background";

const MAX_PLAYERS = 20;

interface FriendsPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIds: string[];
  onConfirm: (ids: string[], names: string[]) => void;
}

export function FriendsPicker({ open, onOpenChange, initialIds, onConfirm }: FriendsPickerProps) {
  const { friends, isLoading } = useFriends();
  const [pickedIds, setPickedIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      // Pre-select previously assigned friends that still exist, in order.
      setPickedIds(initialIds.filter(id => friends.some(f => f.id === id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const togglePick = (id: string) => {
    setPickedIds(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= MAX_PLAYERS) return prev;
      return [...prev, id];
    });
  };

  const handleConfirm = () => {
    const ids = pickedIds.filter(id => friends.some(f => f.id === id));
    const names = ids
      .map(id => friends.find(f => f.id === id)?.name)
      .filter((n): n is string => !!n);
    onConfirm(ids, names);
    onOpenChange(false);
  };

  const atCap = pickedIds.length >= MAX_PLAYERS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-[#3d2f57] bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-[#c79fe6] flex items-center gap-2">
            <Users className="w-5 h-5" />
            Add from Friends
          </DialogTitle>
          <DialogDescription className="font-serif text-muted-foreground">
            Pick who is playing. They will fill the first seats in order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-6 text-center" data-testid="text-friends-picker-loading">
              Loading...
            </p>
          ) : friends.length === 0 ? (
            <div className="py-8 text-center" data-testid="text-friends-picker-empty">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#c79fe6]" />
              <p className="text-sm text-muted-foreground">
                No friends yet. Add some in Manage Friends on the home page.
              </p>
            </div>
          ) : (
            friends.map((friend) => {
              const pickIndex = pickedIds.indexOf(friend.id);
              const picked = pickIndex >= 0;
              return (
                <button
                  key={friend.id}
                  onClick={() => togglePick(friend.id)}
                  aria-pressed={picked}
                  disabled={!picked && atCap}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none",
                    picked
                      ? "border-[#c79fe6]/60 bg-[#c79fe6]/15"
                      : "border-[#3d2f57]/60 bg-[#c79fe6]/5 hover:bg-[#c79fe6]/10",
                    FOCUS_RING
                  )}
                  data-testid={`friend-pick-${friend.id}`}
                >
                  <span className="flex-1 font-serif text-foreground truncate">
                    {friend.name}
                  </span>
                  {picked && (
                    <span className="flex items-center gap-1 text-xs text-[#c79fe6]">
                      Seat {pickIndex + 1}
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          className="bg-[#c79fe6]/20 text-[#c79fe6] border border-[#3d2f57] hover:bg-[#c79fe6]/30 transition-colors duration-150"
          data-testid="button-confirm-friends"
        >
          {pickedIds.length > 0
            ? `Add ${pickedIds.length} ${pickedIds.length === 1 ? "player" : "players"}`
            : "Done"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
