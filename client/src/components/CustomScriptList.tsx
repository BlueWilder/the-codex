import { Pencil, Plus, Scroll } from "lucide-react";
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
            "w-full text-left p-3 transition-colors flex items-center gap-2",
            selectedId === script.id
              ? "game-card border-[1.5px] border-[var(--parchment-ink-link)] bg-[var(--parchment-control)]"
              : "game-card"
          )}
        >
          <button
            onClick={() => onSelect(script)}
            className="flex-1 flex items-center gap-3 hover-elevate rounded-lg -m-2 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            data-testid={`button-script-${script.id}`}
          >
            <Scroll className="h-5 w-5 text-[var(--parchment-ink-link)]" />
            <div>
              <div className="font-display text-lg font-semibold leading-tight text-[var(--parchment-ink)]">{script.name}</div>
              <div className="font-serif text-sm text-[var(--parchment-ink-muted)]">{countScriptCharacters(script)} characters</div>
            </div>
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(script);
            }}
            aria-label={`Edit ${script.name}`}
            data-testid={`button-edit-script-${script.id}`}
          >
            <Pencil className="h-4 w-4 text-[var(--parchment-ink-muted)]" />
          </Button>
        </div>
      ))}
      <button
        onClick={onCreate}
        className="w-full text-left p-3 rounded-[10px] border border-dashed border-[var(--parchment-control-border)] hover:bg-[var(--parchment-control)] transition-colors flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
        data-testid="button-create-custom-script"
      >
        <Plus className="h-5 w-5 text-[var(--parchment-ink-link)]" />
        <div className="font-display text-lg font-semibold text-[var(--parchment-ink-link)]">Create Custom Script</div>
      </button>
    </>
  );
}
