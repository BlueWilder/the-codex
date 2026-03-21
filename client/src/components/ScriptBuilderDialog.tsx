import { useState, useEffect, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Search, Upload, FileText, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_CHARACTERS } from "@/lib/game-data";

interface ScriptBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCharacters?: Set<string>;
  initialName?: string;
  initialSynopsis?: string;
  onSave: (name: string, characterIds: string[], synopsis?: string) => void;
  title?: string;
  editMode?: boolean;
}

const TEAM_COLORS: Record<string, string> = {
  townsfolk: 'border-blue-900/50 bg-blue-950/30',
  outsider: 'border-blue-800/50 bg-blue-900/20',
  minion: 'border-red-900/50 bg-red-950/30',
  demon: 'border-red-800/50 bg-red-950/40',
  traveler: 'border-amber-900/50 bg-amber-950/30',
  fabled: 'border-violet-900/50 bg-violet-950/30',
};

export function ScriptBuilderDialog({
  open,
  onOpenChange,
  initialCharacters = new Set(),
  initialName = "",
  initialSynopsis = "",
  onSave,
  title = "Create Custom Script",
  editMode = false,
}: ScriptBuilderDialogProps) {
  const [scriptName, setScriptName] = useState(initialName);
  const [synopsis, setSynopsis] = useState(initialSynopsis);
  const [selectedCharacters, setSelectedCharacters] = useState<Set<string>>(new Set(initialCharacters));
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charLookup = useMemo(() => {
    const map = new Map<string, string>();
    ALL_CHARACTERS.forEach(c => map.set(c.id.toLowerCase().replace(/[^a-z0-9]/g, ''), c.id));
    return map;
  }, []);

  useEffect(() => {
    if (open) {
      setSelectedCharacters(new Set(initialCharacters));
      setScriptName(initialName);
      setSynopsis(initialSynopsis);
      setSearch("");
      setShowImport(false);
      setImportJson("");
      setImportMessage(null);
    }
  }, [open, initialCharacters, initialName, initialSynopsis]);

  const processImportJson = (jsonText: string) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setImportMessage({ type: 'error', text: 'Invalid JSON. Please check the format and try again.' });
      return;
    }

    if (!Array.isArray(parsed)) {
      setImportMessage({ type: 'error', text: 'Expected a JSON array. The BOTC Script Tool exports an array of character objects.' });
      return;
    }

    let importedName: string | null = null;
    const matched: string[] = [];
    const unrecognized: string[] = [];

    for (const item of parsed) {
      if (typeof item !== 'object' || item === null || !('id' in item)) continue;
      const rawId = String((item as { id: string }).id);

      if (rawId === '_meta') {
        if ('name' in item && typeof (item as { name?: string }).name === 'string') {
          importedName = (item as { name: string }).name;
        }
        continue;
      }

      const normalizedId = rawId.toLowerCase().replace(/[^a-z0-9]/g, '');
      const appId = charLookup.get(normalizedId);
      if (appId) {
        matched.push(appId);
      } else {
        unrecognized.push(rawId);
      }
    }

    const uniqueMatched = [...new Set(matched)];

    if (uniqueMatched.length === 0) {
      setImportMessage({ type: 'error', text: `No recognized characters found in the JSON. ${unrecognized.length > 0 ? `Unrecognized IDs: ${unrecognized.join(', ')}` : ''}` });
      return;
    }

    if (importedName) {
      setScriptName(importedName);
    }
    setSelectedCharacters(new Set(uniqueMatched));
    setShowImport(false);
    setImportJson("");

    if (unrecognized.length > 0) {
      setImportMessage({ type: 'warning', text: `${uniqueMatched.length} characters imported${importedName ? ` from "${importedName}"` : ''}. ${unrecognized.length} skipped: ${unrecognized.join(', ')}` });
    } else {
      setImportMessage({ type: 'success', text: `${uniqueMatched.length} characters imported${importedName ? ` from "${importedName}"` : ''}.` });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === 'string') {
        processImportJson(text);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleCharacter = (charId: string) => {
    const newSet = new Set(selectedCharacters);
    if (newSet.has(charId)) {
      newSet.delete(charId);
    } else {
      newSet.add(charId);
    }
    setSelectedCharacters(newSet);
  };

  const handleSave = () => {
    if (!scriptName.trim() || selectedCharacters.size === 0) return;
    onSave(scriptName.trim(), Array.from(selectedCharacters), synopsis.trim() || undefined);
    onOpenChange(false);
  };

  const handleSelectAll = () => {
    const filteredChars = ALL_CHARACTERS.filter(c => 
      (teamFilter === "all" || c.team === teamFilter) &&
      (!search || c.name.toLowerCase().includes(search.toLowerCase()))
    );
    const newSet = new Set(selectedCharacters);
    filteredChars.forEach(c => newSet.add(c.id));
    setSelectedCharacters(newSet);
  };

  const handleClearAll = () => {
    if (teamFilter === "all" && !search) {
      setSelectedCharacters(new Set());
    } else {
      const filteredChars = ALL_CHARACTERS.filter(c => 
        (teamFilter === "all" || c.team === teamFilter) &&
        (!search || c.name.toLowerCase().includes(search.toLowerCase()))
      );
      const newSet = new Set(selectedCharacters);
      filteredChars.forEach(c => newSet.delete(c.id));
      setSelectedCharacters(newSet);
    }
  };

  const filteredChars = ALL_CHARACTERS.filter(c => {
    const matchesTeam = teamFilter === "all" || c.team === teamFilter;
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  const teamCounts = {
    townsfolk: Array.from(selectedCharacters).filter(id => ALL_CHARACTERS.find(c => c.id === id)?.team === 'townsfolk').length,
    outsider: Array.from(selectedCharacters).filter(id => ALL_CHARACTERS.find(c => c.id === id)?.team === 'outsider').length,
    minion: Array.from(selectedCharacters).filter(id => ALL_CHARACTERS.find(c => c.id === id)?.team === 'minion').length,
    demon: Array.from(selectedCharacters).filter(id => ALL_CHARACTERS.find(c => c.id === id)?.team === 'demon').length,
    traveler: Array.from(selectedCharacters).filter(id => ALL_CHARACTERS.find(c => c.id === id)?.team === 'traveler').length,
    fabled: Array.from(selectedCharacters).filter(id => ALL_CHARACTERS.find(c => c.id === id)?.team === 'fabled').length,
  };

  const hasDemon = teamCounts.demon > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-4 md:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="font-display text-lg md:text-xl text-amber-500">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Script Name</label>
            <Input
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              placeholder="e.g., My Custom Script"
              className="max-w-sm"
              data-testid="input-script-name"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-muted-foreground">Synopsis (optional)</label>
              <span className="text-[10px] text-muted-foreground/60">{synopsis.length} chars</span>
            </div>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="A short atmospheric description of your script..."
              className="w-full max-w-sm h-16 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background placeholder:text-muted-foreground"
              data-testid="input-script-synopsis"
            />
          </div>

          {importMessage && (
            <div className={cn(
              "flex items-start gap-2 px-3 py-2 rounded-md text-xs",
              importMessage.type === 'success' && "bg-green-950/30 border border-green-900/40 text-green-300",
              importMessage.type === 'warning' && "bg-amber-950/30 border border-amber-900/40 text-amber-300",
              importMessage.type === 'error' && "bg-red-950/30 border border-red-900/40 text-red-300",
            )} data-testid="import-message">
              {importMessage.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
              {importMessage.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
              {importMessage.type === 'error' && <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
              <span className="flex-1">{importMessage.text}</span>
              <button onClick={() => setImportMessage(null)} className="shrink-0 opacity-60 hover:opacity-100">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div>
            {!showImport ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => { setShowImport(true); setImportMessage(null); }}
                data-testid="button-import-json"
              >
                <Upload className="w-3 h-3" /> Import JSON
              </Button>
            ) : (
              <div className="border border-amber-900/30 rounded-lg p-3 space-y-2 bg-amber-950/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-200/80">Import from BOTC Script Tool</span>
                  <button onClick={() => { setShowImport(false); setImportJson(""); }} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder='Paste JSON here, e.g. [{"id":"_meta","name":"My Script"},{"id":"imp"},...]'
                  className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background placeholder:text-muted-foreground"
                  data-testid="input-import-json"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => processImportJson(importJson)}
                    disabled={!importJson.trim()}
                    data-testid="button-import-confirm"
                  >
                    <FileText className="w-3 h-3" /> Import
                  </Button>
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 pointer-events-none" asChild>
                      <span><Upload className="w-3 h-3" /> Upload .json</span>
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleFileUpload}
                      data-testid="input-import-file"
                    />
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => { setShowImport(false); setImportJson(""); }}
                    data-testid="button-import-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Selected:</span>
            <span className="text-blue-400">{teamCounts.townsfolk} TF</span>
            <span className="text-blue-300">{teamCounts.outsider} OS</span>
            <span className="text-red-400">{teamCounts.minion} MN</span>
            <span className={cn("font-bold", hasDemon ? "text-red-500" : "text-red-500/50")}>
              {teamCounts.demon} DM {!hasDemon && "(need 1+)"}
            </span>
            <span className="text-amber-400">{teamCounts.traveler} TR</span>
            <span className="text-violet-400">{teamCounts.fabled} FB</span>
            <span className="ml-auto font-medium">{selectedCharacters.size} total</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-1 md:gap-2 pt-2">
          {['all', 'townsfolk', 'outsider', 'minion', 'demon', 'traveler', 'fabled'].map((f) => (
            <button
              key={f}
              onClick={() => setTeamFilter(f)}
              className={cn(
                "px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all border",
                teamFilter === f 
                  ? "bg-amber-900/50 text-amber-100 border-amber-600" 
                  : "bg-transparent text-muted-foreground border-transparent hover:bg-white/5"
              )}
              data-testid={`builder-filter-${f}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search characters..."
              className="pl-8 h-8"
              data-testid="input-search-builder"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs px-2" onClick={handleSelectAll} data-testid="button-select-all">
            Select All
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs px-2" onClick={handleClearAll} data-testid="button-clear-all">
            Clear
          </Button>
        </div>

        <div className="flex-1 min-h-0 max-h-[45vh] md:max-h-[50vh] overflow-y-auto border border-amber-900/30 rounded-lg p-2 touch-pan-y">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 md:gap-2">
            {filteredChars.map((char) => (
              <button
                key={char.id}
                onClick={() => toggleCharacter(char.id)}
                className={cn(
                  "p-1.5 md:p-2 rounded-lg border text-left transition-all",
                  TEAM_COLORS[char.team] || 'border-gray-800 bg-gray-900/20',
                  selectedCharacters.has(char.id) 
                    ? "ring-2 ring-amber-500" 
                    : "opacity-60 hover:opacity-100"
                )}
                data-testid={`builder-character-${char.id}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] md:text-xs font-bold truncate">{char.name}</span>
                  {selectedCharacters.has(char.id) && (
                    <Check className="w-3 h-3 text-amber-500 shrink-0" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] md:text-[10px] uppercase opacity-60">{char.team}</span>
                  <span className="text-[8px] md:text-[9px] uppercase opacity-40">{char.edition?.toUpperCase()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} data-testid="button-cancel-builder">
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={!scriptName.trim() || selectedCharacters.size === 0}
            data-testid="button-save-script"
          >
            {editMode ? "Update Script" : "Save Script"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
