import { useState, useEffect, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Search, Upload, FileText, AlertTriangle, CheckCircle2, X, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_CHARACTERS } from "@/lib/game-data";
import { scanScriptFile } from "@/lib/scan-script";
import { teamParchment } from "@/lib/team-style";

interface ScriptBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCharacters?: Set<string>;
  initialName?: string;
  initialSynopsis?: string;
  onSave: (name: string, characterIds: string[], synopsis?: string) => void | Promise<void>;
  title?: string;
  editMode?: boolean;
  /** Open with the JSON import panel already showing (Home's Import button). */
  initialShowImport?: boolean;
}

export function ScriptBuilderDialog({
  open,
  onOpenChange,
  initialCharacters = new Set(),
  initialName = "",
  initialSynopsis = "",
  onSave,
  title = "Create Custom Script",
  editMode = false,
  initialShowImport = false,
}: ScriptBuilderDialogProps) {
  const [scriptName, setScriptName] = useState(initialName);
  const [synopsis, setSynopsis] = useState(initialSynopsis);
  const [selectedCharacters, setSelectedCharacters] = useState<Set<string>>(new Set(initialCharacters));
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

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
      setShowImport(initialShowImport);
      setImportJson("");
      setImportMessage(null);
      setScanning(false);
      setSaving(false);
    }
  }, [open, initialCharacters, initialName, initialSynopsis, initialShowImport]);

  const handleScanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (scanInputRef.current) scanInputRef.current.value = '';
    if (!file) return;
    setScanning(true);
    setImportMessage(null);
    try {
      const { matchedIds, unmatchedNames } = await scanScriptFile(file);
      if (matchedIds.length === 0) {
        setImportMessage({ type: 'error', text: 'No characters were recognized in that photo. Try a clearer, well-lit shot.' });
        return;
      }
      setSelectedCharacters(prev => {
        const next = new Set(prev);
        matchedIds.forEach(id => next.add(id));
        return next;
      });
      if (unmatchedNames.length > 0) {
        setImportMessage({ type: 'warning', text: `Added ${matchedIds.length} character${matchedIds.length === 1 ? '' : 's'} from the photo. Couldn't match: ${unmatchedNames.join(', ')}.` });
      } else {
        setImportMessage({ type: 'success', text: `Added ${matchedIds.length} character${matchedIds.length === 1 ? '' : 's'} from the photo. Review and edit below.` });
      }
    } catch (err) {
      setImportMessage({ type: 'error', text: err instanceof Error ? err.message : 'Could not scan that photo. Please try again.' });
    } finally {
      setScanning(false);
    }
  };

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
      let rawId: string;

      if (typeof item === 'string') {
        if (item === '_meta') continue;
        rawId = item;
      } else if (typeof item === 'object' && item !== null && 'id' in item) {
        rawId = String((item as { id: string }).id);

        if (rawId === '_meta') {
          if ('name' in item && typeof (item as { name?: string }).name === 'string') {
            importedName = (item as { name: string }).name;
          }
          continue;
        }
      } else {
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

    const uniqueMatched = Array.from(new Set(matched));

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

  const handleSave = async () => {
    if (!scriptName.trim() || selectedCharacters.size === 0 || saving) return;
    setSaving(true);
    try {
      await onSave(scriptName.trim(), Array.from(selectedCharacters), synopsis.trim() || undefined);
      onOpenChange(false);
    } catch (err) {
      setImportMessage({ type: 'error', text: err instanceof Error ? err.message : 'Could not save the script. Please try again.' });
    } finally {
      setSaving(false);
    }
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-4 parchment-scope rounded-[14px] border-[var(--parchment-border)] bg-[var(--parchment-panel)]">
        <DialogHeader className="pb-2 pr-10 text-left">
          <DialogTitle className="font-display text-2xl font-semibold text-[var(--parchment-ink)]">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="section-label mb-2 block">Script Name</label>
            <Input
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              placeholder="e.g., My Custom Script"
              className="max-w-sm"
              data-testid="input-script-name"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="section-label">Synopsis (optional)</label>
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
              "border bg-[var(--parchment-raised)] font-serif text-sm",
              importMessage.type === 'success' && "border-[var(--parchment-border)] text-[var(--parchment-ink-link)]",
              importMessage.type === 'warning' && "border-[var(--attention)] text-[var(--attention)]",
              importMessage.type === 'error' && "border-[var(--parchment-minion)] text-[var(--parchment-minion)]",
            )} data-testid="import-message">
              {importMessage.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
              {importMessage.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
              {importMessage.type === 'error' && <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
              <span className="flex-1">{importMessage.text}</span>
              <button onClick={() => setImportMessage(null)} className="btn-icon -my-2.5 -mr-2" aria-label="Dismiss message">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div>
            {!showImport ? (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="pill"
                  onClick={() => { setShowImport(true); setImportMessage(null); }}
                  data-testid="button-import-json"
                >
                  <Upload /> Import JSON
                </Button>
                <Button
                  variant="pill"
                  disabled={scanning}
                  onClick={() => scanInputRef.current?.click()}
                  data-testid="button-scan-photo"
                >
                  {scanning ? <Loader2 className="animate-spin" /> : <Camera />}
                  {scanning ? "Scanning..." : "Scan Photo"}
                </Button>
                <input
                  ref={scanInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleScanUpload}
                  data-testid="input-scan-file"
                />
              </div>
            ) : (
              <div className="game-card p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="section-label">Import from BOTC Script Tool</span>
                  <button onClick={() => { setShowImport(false); setImportJson(""); }} className="btn-icon -my-2 -mr-2 text-muted-foreground" aria-label="Close import">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder='Paste JSON here, e.g. [{"id":"_meta","name":"My Script"},{"id":"imp"},...]'
                  className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background placeholder:text-muted-foreground"
                  data-testid="input-import-json"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="pill"
                    onClick={() => processImportJson(importJson)}
                    disabled={!importJson.trim()}
                    data-testid="button-import-confirm"
                  >
                    <FileText /> Import
                  </Button>
                  <label className="cursor-pointer">
                    <Button variant="pill" className="pointer-events-none" asChild>
                      <span><Upload /> Upload .json</span>
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
                    variant="pill"
                    onClick={() => { setShowImport(false); setImportJson(""); }}
                    data-testid="button-import-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 font-sans text-xs font-semibold">
            <span className="text-muted-foreground">Selected:</span>
            <span className="text-[var(--parchment-townsfolk)]">{teamCounts.townsfolk} TF</span>
            <span className="text-[var(--parchment-outsider)]">{teamCounts.outsider} OS</span>
            <span className="text-[var(--parchment-minion)]">{teamCounts.minion} MN</span>
            <span className={cn("font-bold text-[var(--parchment-demon)]", !hasDemon && "opacity-60")}>
              {teamCounts.demon} DM {!hasDemon && "(need 1+)"}
            </span>
            <span className="text-[var(--parchment-traveler)]">{teamCounts.traveler} TR</span>
            <span className="text-[var(--parchment-fabled)]">{teamCounts.fabled} FB</span>
            <span className="ml-auto font-medium">{selectedCharacters.size} total</span>
          </div>
        </div>
        
        <div className="-mx-4 flex shrink-0 gap-3 overflow-x-auto px-4 pt-2 scrollbar-hide">
          {['all', 'townsfolk', 'outsider', 'minion', 'demon', 'traveler', 'fabled'].map((f) => (
            <button
              key={f}
              onClick={() => setTeamFilter(f)}
              className="btn-secondary capitalize"
              data-active={teamFilter === f ? "true" : undefined}
              data-testid={`builder-filter-${f}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search characters..."
              className="pl-9 h-11"
              data-testid="input-search-builder"
            />
          </div>
          <Button variant="pill" className="px-3" onClick={handleSelectAll} data-testid="button-select-all">
            Select All
          </Button>
          <Button variant="pill" className="px-3" onClick={handleClearAll} data-testid="button-clear-all">
            Clear
          </Button>
        </div>

        <div className="flex-1 min-h-0 max-h-[45vh] md:max-h-[50vh] overflow-y-auto rounded-[10px] border border-[var(--parchment-rule)] p-2 touch-pan-y">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 md:gap-2">
            {filteredChars.map((char) => (
              <button
                key={char.id}
                onClick={() => toggleCharacter(char.id)}
                className={cn(
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                  "game-card p-1.5 md:p-2 text-left transition-all duration-150",
                  selectedCharacters.has(char.id)
                    ? cn("border-[1.5px] bg-[var(--parchment-control)]", teamParchment(char.team).border)
                    : "opacity-70 hover:opacity-100"
                )}
                data-testid={`builder-character-${char.id}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={cn("truncate font-display text-[13px] font-semibold md:text-sm", teamParchment(char.team).text)}>{char.name}</span>
                  {selectedCharacters.has(char.id) && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-[var(--parchment-ink-link)]" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-[var(--parchment-ink-muted)] md:text-[10px]">{char.team}</span>
                  <span className="font-sans text-[8px] uppercase text-[var(--parchment-ink-faint)] md:text-[9px]">{char.edition?.toUpperCase()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-2 gap-3">
          <Button variant="pill" onClick={() => onOpenChange(false)} disabled={saving} data-testid="button-cancel-builder">
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleSave} 
            disabled={!scriptName.trim() || selectedCharacters.size === 0 || saving}
            data-testid="button-save-script"
          >
            {saving && <Loader2 className="animate-spin" />}
            {saving ? "Saving..." : editMode ? "Update Script" : "Save Script"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
