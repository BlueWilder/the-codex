import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Pencil, X, Check, Plus } from "lucide-react";
import { useFriends } from "@/hooks/use-friends";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background";

interface FriendsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FriendsManager({ open, onOpenChange }: FriendsManagerProps) {
  const { friends, addFriend, renameFriend, removeFriend, isLoading } = useFriends();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [renameError, setRenameError] = useState<string | null>(null);

  const isDuplicateName = (name: string, excludeId?: string) =>
    friends.some(
      (f) =>
        f.id !== excludeId &&
        f.name.trim().toLowerCase() === name.toLowerCase(),
    );

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (isDuplicateName(trimmed)) {
      setAddError(`${trimmed} is already in your friends list.`);
      return;
    }
    addFriend(trimmed);
    setNewName("");
    setAddError(null);
  };

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
    setRenameError(null);
  };

  const commitRename = () => {
    if (!editingId) return;
    const trimmed = editName.trim();
    if (trimmed) {
      if (isDuplicateName(trimmed, editingId)) {
        setRenameError(`${trimmed} is already in your friends list.`);
        return;
      }
      renameFriend(editingId, trimmed);
    }
    setEditingId(null);
    setEditName("");
    setRenameError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-[#3d2f57] bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-[#c79fe6] flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Friends
          </DialogTitle>
          <DialogDescription className="font-serif text-muted-foreground">
            Save the people you play with for quick access later.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              if (addError) setAddError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Friend's name"
            className="border-[#3d2f57] focus-visible:ring-[#c79fe6]/50"
            data-testid="input-friend-name"
          />
          <Button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="bg-[#c79fe6]/20 text-[#c79fe6] border border-[#3d2f57] hover:bg-[#c79fe6]/30 transition-colors duration-150"
            data-testid="button-add-friend"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        {addError && (
          <p
            role="status"
            aria-live="polite"
            className="-mt-2 text-xs text-red-400"
            data-testid="text-add-friend-duplicate"
          >
            {addError}
          </p>
        )}

        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-6 text-center" data-testid="text-friends-loading">
              Loading...
            </p>
          ) : friends.length === 0 ? (
            <div className="py-8 text-center" data-testid="text-friends-empty">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#c79fe6]" />
              <p className="text-sm text-muted-foreground">
                No friends yet. Add someone you play with.
              </p>
            </div>
          ) : (
            friends.map((friend) => (
              <div
                key={friend.id}
                className="rounded-lg border border-[#3d2f57]/60 bg-[#c79fe6]/5 px-3 py-2 transition-colors duration-150"
                data-testid={`friend-row-${friend.id}`}
              >
                <div className="flex items-center gap-2">
                {editingId === friend.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => {
                        setEditName(e.target.value);
                        if (renameError) setRenameError(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && commitRename()}
                      autoFocus
                      className="h-8 border-[#3d2f57] focus-visible:ring-[#c79fe6]/50"
                      data-testid={`input-rename-friend-${friend.id}`}
                    />
                    <button
                      onClick={commitRename}
                      className={`p-1.5 rounded-md text-[#c79fe6] hover:bg-[#c79fe6]/15 transition-colors duration-150 ${FOCUS_RING}`}
                      aria-label="Save name"
                      data-testid={`button-save-rename-friend-${friend.id}`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-serif text-foreground truncate" data-testid={`text-friend-name-${friend.id}`}>
                      {friend.name}
                    </span>
                    <button
                      onClick={() => startRename(friend.id, friend.name)}
                      className={`p-1.5 rounded-md text-muted-foreground hover:text-[#c79fe6] hover:bg-[#c79fe6]/15 transition-colors duration-150 ${FOCUS_RING}`}
                      aria-label={`Rename ${friend.name}`}
                      data-testid={`button-rename-friend-${friend.id}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFriend(friend.id)}
                      className={`p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/15 transition-colors duration-150 ${FOCUS_RING}`}
                      aria-label={`Remove ${friend.name}`}
                      data-testid={`button-remove-friend-${friend.id}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
                </div>
                {editingId === friend.id && renameError && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="mt-1 text-xs text-red-400"
                    data-testid={`text-rename-friend-duplicate-${friend.id}`}
                  >
                    {renameError}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
