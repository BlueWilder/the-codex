import { Layout } from "@/components/ui/Layout";
import { ALL_CHARACTERS, OFFICIAL_SCRIPTS, type Character } from "@/lib/game-data";
import { useState, useEffect, useMemo } from "react";
import { Search, Moon, Plus, Check, Trash2, Pencil, ArrowDownAZ, LayoutList, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useLocalScripts, type LocalScript } from "@/hooks/use-local-scripts";
import { ScriptBuilderDialog } from "@/components/ScriptBuilderDialog";
import { nightOrderValue, compareEndTeams, compareSheetOrder } from "@/lib/night-order";
import { resolveCharactersForScriptFilter } from "@/lib/script-resolve";
import { ScriptView } from "@/components/character/ScriptView";

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
  const [sortOrder, setSortOrder] = useState<"alphabetical" | "sheet" | "night">("alphabetical");
  const [showScriptBuilder, setShowScriptBuilder] = useState(false);
  const [editingScript, setEditingScript] = useState<LocalScript | null>(null);
  const [copyingCommunityScript, setCopyingCommunityScript] = useState<{ name: string; characterIds: string[]; synopsis?: string } | null>(null);
  const { customScripts, addCustomScript, addCustomScriptAsync, updateCustomScript, deleteCustomScript } = useLocalScripts();

  // Update sort order based on script filter
  useEffect(() => {
    if (scriptFilter === "all") {
      setSortOrder("alphabetical");
    } else {
      setSortOrder("sheet");
    }
  }, [scriptFilter]);

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
  }).sort((a, b) => {
    const endComparison = compareEndTeams(a, b);
    if (endComparison !== null) return endComparison;
    
    // Sort non-travelers based on selected sort order
    if (sortOrder === "alphabetical") {
      return a.name.localeCompare(b.name);
    } else if (sortOrder === "night") {
      // Night order sorting - use firstNightOrder, fall back to otherNightOrder
      const aOrder = nightOrderValue(a);
      const bOrder = nightOrderValue(b);
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    } else {
      // Sheet order: group by team, maintain original array order within team
      return compareSheetOrder(a, b, ALL_CHARACTERS);
    }
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-900/30 pb-6">
          <h1 className="text-4xl font-display text-amber-500">Character Reference</h1>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ability..."
              className="w-full bg-black/20 border border-amber-900/30 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-amber-600/50 transition-colors placeholder:text-muted-foreground/50"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center">
            {SCRIPTS.map((script) => (
              <div key={script.id} className="flex items-center">
                <button
                  onClick={() => setScriptFilter(script.id)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap",
                    script.isCommunity ? "rounded-l-full" : "rounded-full",
                    scriptFilter === script.id 
                      ? "bg-red-900/50 text-red-100 border-red-600" 
                      : "bg-transparent text-muted-foreground border-transparent hover:bg-white/5"
                  )}
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
                    className="px-1.5 py-1.5 rounded-r-full text-xs text-muted-foreground hover:bg-white/10 transition-colors"
                    title="Copy & edit script"
                    data-testid={`button-copy-script-${script.id}`}
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            
            {customScripts.length > 0 && (
              <>
                <div className="w-px h-6 bg-border mx-1" />
                {customScripts.map((script) => (
                  <div key={script.id} className="flex items-center">
                    <button
                      onClick={() => setScriptFilter(`custom:${script.id}`)}
                      className={cn(
                        "px-3 py-1.5 rounded-l-full text-xs font-bold tracking-wider transition-all border whitespace-nowrap",
                        scriptFilter === `custom:${script.id}`
                          ? "bg-purple-900/50 text-purple-100 border-purple-600"
                          : "bg-transparent text-muted-foreground border-transparent hover:bg-white/5"
                      )}
                      data-testid={`button-load-script-${script.id}`}
                    >
                      {script.name}
                    </button>
                    <button
                      onClick={() => {
                        setEditingScript(script);
                        setShowScriptBuilder(true);
                      }}
                      className="px-1.5 py-1.5 text-xs text-muted-foreground border-y border-transparent hover:bg-white/10 transition-colors"
                      title="Edit script"
                      data-testid={`button-edit-script-${script.id}`}
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (scriptFilter === `custom:${script.id}`) {
                          setScriptFilter("all");
                        }
                        deleteCustomScript(script.id);
                      }}
                      className="px-1.5 py-1.5 rounded-r-full text-xs text-muted-foreground border-y border-r border-transparent hover:bg-red-900/30 hover:text-red-400 transition-colors"
                      title="Delete script"
                      data-testid={`button-delete-script-${script.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
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
              className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all border border-dashed border-purple-700/50 whitespace-nowrap flex items-center gap-1 text-purple-400 hover:bg-purple-900/20"
              data-testid="button-create-custom-script"
            >
              <Plus className="w-3 h-3" />
              New Script
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center justify-between">
            <div className="flex gap-2 scrollbar-hide">
              {['all', 'townsfolk', 'outsider', 'minion', 'demon', 'traveler', 'fabled'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTeamFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
                    teamFilter === f 
                      ? "bg-amber-900/50 text-amber-100 border-amber-600" 
                      : "bg-transparent text-muted-foreground border-transparent hover:bg-white/5"
                  )}
                  data-testid={`button-filter-${f}`}
                >
                  {f}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setSortOrder(prev => {
                if (prev === "sheet") return "alphabetical";
                if (prev === "alphabetical") return "night";
                return "sheet";
              })}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all border whitespace-nowrap",
                "bg-transparent text-muted-foreground border-amber-900/30 hover:bg-white/5"
              )}
              title={
                sortOrder === "sheet" ? "Sheet order (by team) - click for A-Z" :
                sortOrder === "alphabetical" ? "Alphabetical - click for Night order" :
                "Night order - click for Sheet order"
              }
              data-testid="button-toggle-sort"
            >
              {sortOrder === "sheet" ? (
                <>
                  <LayoutList className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sheet</span>
                </>
              ) : sortOrder === "alphabetical" ? (
                <>
                  <ArrowDownAZ className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">A-Z</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Night</span>
                </>
              )}
            </button>
          </div>
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

        <ScriptView characters={filtered} />
      </div>
    </Layout>
  );
}
