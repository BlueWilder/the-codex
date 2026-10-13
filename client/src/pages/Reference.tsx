import { Layout } from "@/components/ui/Layout";
import { ALL_CHARACTERS, OFFICIAL_SCRIPTS, type Character } from "@/lib/game-data";
import { useState, useMemo } from "react";
import { Search, Moon, Plus, Check, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useLocalScripts, type LocalScript } from "@/hooks/use-local-scripts";
import { ScriptBuilderDialog } from "@/components/ScriptBuilderDialog";
import { type ScriptSort } from "@/lib/night-order";
import { resolveCharactersForScriptFilter } from "@/lib/script-resolve";
import { ScriptView, SortToggle, NightViewToggle, type NightView } from "@/components/character/ScriptView";
import { PageTitle } from "@/components/PageTitle";

const SCRIPTS = [
  { id: 'all', label: 'All Scripts', isCommunity: false },
  { id: 'tb', label: 'Trouble Brewing', isCommunity: false },
  { id: 'bmr', label: 'Bad Moon Rising', isCommunity: false },
  { id: 'snv', label: 'Sects & Violets', isCommunity: false },
  { id: 'twh', label: 'The Wild Hunt', isCommunity: true },
  { id: 'sot', label: 'The Ship of Theseus', isCommunity: true },
  { id: 'la', label: 'Leviathan Awakens', isCommunity: true },
];


export default function Reference() {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [scriptFilter, setScriptFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<ScriptSort>("team");
  const [nightView, setNightView] = useState<NightView>("first");
  const [showScriptBuilder, setShowScriptBuilder] = useState(false);
  const [editingScript, setEditingScript] = useState<LocalScript | null>(null);
  const [copyingCommunityScript, setCopyingCommunityScript] = useState<{ name: string; characterIds: string[]; synopsis?: string } | null>(null);
  const { customScripts, addCustomScript, addCustomScriptAsync, updateCustomScript, deleteCustomScript } = useLocalScripts();

  const activeCustomScript = scriptFilter.startsWith('custom:') 
    ? customScripts.find(s => s.id === scriptFilter.replace('custom:', ''))
    : null;

  const scriptCharacterIds = useMemo(
    () =>
      new Set(
        resolveCharactersForScriptFilter(scriptFilter, activeCustomScript, {
          includeTravellers: true,
          includeFabled: true,
        }).map(c => c.id),
      ),
    [scriptFilter, activeCustomScript],
  );

  const filtered = ALL_CHARACTERS.filter(char => {
    const matchesSearch = char.name.toLowerCase().includes(search.toLowerCase()) || 
                          char.ability.toLowerCase().includes(search.toLowerCase());
    const isFabled = char.team === "fabled";
    const hideFabledByDefault = isFabled && teamFilter === "all" && scriptFilter !== "all";
    const matchesTeam = (teamFilter === "all" && !hideFabledByDefault) || char.team === teamFilter;
    const matchesScript = scriptCharacterIds.has(char.id);

    return matchesSearch && matchesTeam && matchesScript;
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-3">
          <PageTitle>Character Reference</PageTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--shell-inactive)]" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ability..."
              className="h-11 w-full rounded-full border border-[var(--shell-border)] bg-[var(--shell-chrome)] pl-10 pr-4 font-serif text-base text-[var(--parchment-panel)] transition-colors placeholder:text-[var(--shell-inactive)] focus:border-[var(--shell-gold)] focus:outline-none"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="space-y-3">
          {/* Script filters: secondary pills, the active one primary-styled. */}
          <div className="-mx-[var(--page-x)] flex items-center gap-2 overflow-x-auto px-[var(--page-x)] scrollbar-hide" data-testid="row-script-filters">
            {SCRIPTS.map((script) => (
              <div key={script.id} className="flex shrink-0 items-center">
                <button
                  onClick={() => setScriptFilter(script.id)}
                  className="btn-secondary"
                  data-active={scriptFilter === script.id ? "true" : undefined}
                  data-testid={`button-script-${script.id}`}
                >
                  {script.label}
                </button>
                {script.isCommunity && (
                  <button
                    onClick={() => {
                      const officialScript = OFFICIAL_SCRIPTS.find(s => s.id === script.id);
                      if (officialScript) {
                        setCopyingCommunityScript({
                          name: `${officialScript.name} (Copy)`,
                          characterIds: officialScript.characters,
                          synopsis: officialScript.description,
                        });
                        setEditingScript(null);
                        setShowScriptBuilder(true);
                      }
                    }}
                    className="btn-icon text-[var(--shell-inactive)] hover:text-[var(--shell-gold)]"
                    title="Copy & edit script"
                    aria-label={`Copy and edit ${script.label}`}
                    data-testid={`button-copy-script-${script.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {customScripts.length > 0 && (
              <>
                <div className="mx-1 h-6 w-px shrink-0 bg-[var(--shell-border)]" />
                {customScripts.map((script) => (
                  <div key={script.id} className="flex shrink-0 items-center">
                    <button
                      onClick={() => setScriptFilter(`custom:${script.id}`)}
                      className="btn-secondary"
                      data-active={scriptFilter === `custom:${script.id}` ? "true" : undefined}
                      data-testid={`button-load-script-${script.id}`}
                    >
                      {script.name}
                    </button>
                    <button
                      onClick={() => {
                        setEditingScript(script);
                        setShowScriptBuilder(true);
                      }}
                      className="btn-icon text-[var(--shell-inactive)] hover:text-[var(--shell-gold)]"
                      title="Edit script"
                      aria-label={`Edit ${script.name}`}
                      data-testid={`button-edit-script-${script.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (scriptFilter === `custom:${script.id}`) {
                          setScriptFilter("all");
                        }
                        deleteCustomScript(script.id);
                      }}
                      className="btn-icon text-[var(--shell-inactive)] hover:text-[var(--shell-gold)]"
                      title="Delete script"
                      aria-label={`Delete ${script.name}`}
                      data-testid={`button-delete-script-${script.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </>
            )}

            <button
              onClick={() => {
                setEditingScript(null);
                setShowScriptBuilder(true);
              }}
              className="btn-secondary"
              data-testid="button-create-custom-script"
            >
              <Plus className="h-4 w-4" />
              New Script
            </button>
          </div>

          {/* Team filters scroll; the By Team / By Night pair sits at the row's right end. */}
          <div className="flex items-center gap-3">
            <div className="-ml-[var(--page-x)] flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pl-[var(--page-x)] scrollbar-hide" data-testid="row-team-filters">
              {['all', 'townsfolk', 'outsider', 'minion', 'demon', 'traveler', 'fabled'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTeamFilter(f)}
                  className="btn-secondary capitalize"
                  data-active={teamFilter === f ? "true" : undefined}
                  data-testid={`button-filter-${f}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <SortToggle value={sortOrder} onChange={setSortOrder} />
          </div>

          {sortOrder === "night" && (
            <div className="flex justify-end">
              <NightViewToggle value={nightView} onChange={setNightView} />
            </div>
          )}
        </div>

        <ScriptBuilderDialog
          open={showScriptBuilder}
          onOpenChange={(open) => {
            setShowScriptBuilder(open);
            if (!open) setCopyingCommunityScript(null);
          }}
          initialCharacters={
            editingScript
              ? new Set(editingScript.characterIds)
              : copyingCommunityScript
                ? new Set(copyingCommunityScript.characterIds)
                : new Set()
          }
          initialName={editingScript?.name || copyingCommunityScript?.name || ""}
          initialSynopsis={editingScript?.synopsis || copyingCommunityScript?.synopsis || ""}
          title={
            editingScript
              ? "Edit Custom Script"
              : copyingCommunityScript
                ? "Copy & Edit Script"
                : "Create Custom Script"
          }
          editMode={!!editingScript}
          onSave={async (name, characterIds, synopsis) => {
            if (editingScript) {
              updateCustomScript(editingScript.id, name, characterIds, synopsis);
            } else {
              const newScript = await addCustomScriptAsync(name, characterIds, synopsis);
              setScriptFilter(`custom:${newScript.id}`);
            }
            setCopyingCommunityScript(null);
          }}
        />

        <ScriptView
          characters={filtered}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          nightView={nightView}
          onNightViewChange={setNightView}
          showToolbar={false}
        />
      </div>
    </Layout>
  );
}
