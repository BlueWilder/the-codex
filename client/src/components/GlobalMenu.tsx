import { useState } from "react";
import { MoreVertical, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FriendsManager } from "@/components/FriendsManager";
import { useFriends } from "@/hooks/use-friends";


export function GlobalMenu() {
  const { friends, addFriend } = useFriends();
  const [menuOpen, setMenuOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [feedback, setFeedback] = useState<
    { kind: "added"; name: string } | { kind: "duplicate"; name: string } | null
  >(null);

  const handleQuickAdd = () => {
    const trimmed = quickName.trim();
    if (!trimmed) return;
    const isDuplicate = friends.some(
      (f) => f.name.trim().toLowerCase() === trimmed.toLowerCase(),
    );
    if (isDuplicate) {
      setFeedback({ kind: "duplicate", name: trimmed });
      return;
    }
    addFriend(trimmed).then(
      () => {
        setQuickName("");
        setFeedback({ kind: "added", name: trimmed });
      },
      () => setFeedback({ kind: "duplicate", name: trimmed }),
    );
  };

  return (
    <>
      <DropdownMenu
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          if (!open) {
            setQuickName("");
            setFeedback(null);
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="round"
            className="text-muted-foreground hover:text-amber-200"
            aria-label="More options"
            data-testid="button-global-menu"
          >
            <MoreVertical className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem
            onSelect={() => setManagerOpen(true)}
            className="cursor-pointer gap-2 text-[#c79fe6] focus:text-[#c79fe6]"
            data-testid="menu-item-friends"
          >
            <Users className="h-4 w-4" />
            Friends
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="section-label">
            Quick add friend
          </DropdownMenuLabel>
          <div
            className="px-2 pb-2 pt-0.5"
            onKeyDown={(e) => {
              // Let Escape bubble so Radix closes the menu; block other keys
              // so typing doesn't trigger the menu's typeahead navigation.
              if (e.key !== "Escape") e.stopPropagation();
            }}
          >
            <div className="flex items-center gap-1.5">
              <Input
                value={quickName}
                onChange={(e) => {
                  setQuickName(e.target.value);
                  if (feedback) setFeedback(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleQuickAdd();
                }}
                placeholder="Friend's name"
                className="h-11 border-[#3d2f57] focus-visible:ring-[#c79fe6]/50"
                data-testid="input-quick-add-friend"
              />
              <Button
                variant="round"
                onClick={handleQuickAdd}
                disabled={!quickName.trim()}
                className="text-[#c79fe6]"
                aria-label="Add friend"
                data-testid="button-quick-add-friend"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {feedback && (
              <p
                role="status"
                aria-live="polite"
                className={
                  feedback.kind === "duplicate"
                    ? "mt-1.5 text-xs text-red-400"
                    : "mt-1.5 text-xs text-[#c79fe6]"
                }
                data-testid={
                  feedback.kind === "duplicate"
                    ? "text-quick-add-duplicate"
                    : "text-quick-add-success"
                }
              >
                {feedback.kind === "duplicate"
                  ? `${feedback.name} is already in your friends list.`
                  : `Added ${feedback.name}.`}
              </p>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <FriendsManager open={managerOpen} onOpenChange={setManagerOpen} />
    </>
  );
}
