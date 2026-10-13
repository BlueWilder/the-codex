import { ChevronRight, Pencil, Plus, Scroll } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { countScriptCharacters } from "@/lib/script-resolve";
import { type LocalScript } from "@/hooks/use-local-scripts";

/**
 * The user's custom scripts as parchment cards (tap to choose, pencil to
 * edit) plus a Create Custom Script button. Shared by the setup wizard's
 * script drawer and the Home page's My scripts sheet.
 */
export function CustomScriptList({
  scripts,
  selectedId,
  onSelect,
  onEdit,
  onCreate,
}: {
  scripts: LocalScript[];
  selectedId?: string | null;
  onSelect: (script: LocalScript) => void;
  onEdit: (script: LocalScript) => void;
  onCreate: () => void;
}) {
  return (
    <>
      {scripts.map(script => (
        <div
          key={script.id}
          className={cn(
            "relative",
            selectedId === script.id
              ? "game-card border-[1.5px] border-[var(--parchment-ink-link)] bg-[var(--parchment-control)]"
              : "game-card"
          )}
        >
          <button
            onClick={() => onSelect(script)}
            className="flex w-full items-center gap-3 rounded-[10px] p-3 text-left transition-colors hover:bg-[var(--parchment-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-testid={`button-script-${script.id}`}
          >
            <Scroll className="h-5 w-5 shrink-0 text-[var(--parchment-ink-link)]" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-lg font-semibold leading-tight text-[var(--parchment-ink)]">{script.name}</div>
              <div className="font-serif text-sm text-[var(--parchment-ink-muted)]">{countScriptCharacters(script)} characters</div>
            </div>
            {/* Room for the edit button, which sits over the card beside the chevron. */}
            <span className="w-11 shrink-0" aria-hidden="true" />
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--parchment-ink-faint)]" />
          </button>
          <Button
            variant="round"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(script);
            }}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-[var(--parchment-ink-muted)]"
            aria-label={`Edit ${script.name}`}
            data-testid={`button-edit-script-${script.id}`}
          >
            <Pencil />
          </Button>
        </div>
      ))}
      <Button
        variant="pill"
        onClick={onCreate}
        className="w-full"
        data-testid="button-create-custom-script"
      >
        <Plus />
        Create Custom Script
      </Button>
    </>
  );
}
