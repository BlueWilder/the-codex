import { useState, useEffect, useRef } from "react";
import { getBreakdown } from "@/features/game/state/use-player-game";
import { useLocalScripts, type LocalScript } from "@/hooks/use-local-scripts";
import { ScriptBuilderDialog } from "@/components/ScriptBuilderDialog";
import { FriendsPicker } from "@/components/FriendsPicker";
import { scanScriptFile } from "@/lib/scan-script";
import { resolveScriptCharacters, countScriptCharacters } from "@/lib/script-resolve";
import { ScriptSheet } from "@/components/character/ScriptSheet";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Play, Plus, ChevronUp, ChevronDown, Loader2, BookOpen, Pencil, Users, Scroll, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { teamParchment } from "@/lib/team-style";
import { type GameScriptRef } from "@/features/game/types";

/** Character Breakdown pill on parchment; team colors come from teamParchment. */
const PILL = "border font-sans text-sm font-semibold px-3 py-1";

export function SetupWizard({ onStart }: { onStart: (count: number, names: string[], script?: GameScriptRef | null) => void }) {
  const [playerCount, setPlayerCount] = useState(8);
  const [selectedScript, setSelectedScript] = useState<LocalScript | null>(null);
  const [scriptDrawerOpen, setScriptDrawerOpen] = useState(false);
  const [showScriptBuilder, setShowScriptBuilder] = useState(false);
  const [editingScript, setEditingScript] = useState<LocalScript | null>(null);
  const [scannedCharacters, setScannedCharacters] = useState<Set<string> | null>(null);
  const [scanning, setScanning] = useState(false);
  const [assignedNames, setAssignedNames] = useState<string[]>([]);
  const [assignedFriendIds, setAssignedFriendIds] = useState<string[]>([]);
  const [friendsPickerOpen, setFriendsPickerOpen] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const { allScripts, customScripts, addCustomScriptAsync, updateCustomScript, getScriptById } = useLocalScripts();
  const { toast } = useToast();

  useEffect(() => {
    localStorage.removeItem("clocktower_st_session");
  }, []);

  const breakdown = getBreakdown(playerCount);

  const handleSelectScript = (script: LocalScript | null) => {
    setSelectedScript(script);
    setScriptDrawerOpen(false);
  };

  const handleScanScript = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (scanInputRef.current) scanInputRef.current.value = '';
    if (!file) return;
    setScanning(true);
    try {
      const { matchedIds, unmatchedNames } = await scanScriptFile(file);
      if (matchedIds.length === 0) {
        toast({
          title: "No characters recognized",
          description: "Couldn't read any characters from that photo. Try a clearer, well-lit shot.",
          variant: "destructive",
        });
        return;
      }
      setEditingScript(null);
      setScannedCharacters(new Set(matchedIds));
      setScriptDrawerOpen(false);
      setShowScriptBuilder(true);
      if (unmatchedNames.length > 0) {
        toast({
          title: `Found ${matchedIds.length} characters`,
          description: `Couldn't match: ${unmatchedNames.join(', ')}. Review and edit before saving.`,
        });
      } else {
        toast({
          title: `Found ${matchedIds.length} characters`,
          description: "Review and edit your scanned script before saving.",
        });
      }
    } catch (err) {
      toast({
        title: "Scan failed",
        description: err instanceof Error ? err.message : "Could not scan that photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  const getDefaultName = (index: number) => {
    if (assignedNames[index]) {
      return assignedNames[index];
    }
    if (playerCount > 15 && index >= 15) {
      return `Traveler ${index - 14}`;
    }
    return `Player ${index + 1}`;
  };

  const handleAssignFriends = (ids: string[], names: string[]) => {
    setAssignedFriendIds(ids);
    setAssignedNames(names);
    if (names.length > playerCount) {
      setPlayerCount(Math.min(20, names.length));
    }
  };

  const handleStartGame = () => {
    const scriptRef: GameScriptRef | null = selectedScript ? {
      id: selectedScript.id,
    } : null;
    const finalNames = Array.from({ length: playerCount }, (_, i) => getDefaultName(i));
    onStart(playerCount, finalNames, scriptRef);
  };

  const sheetCharacters = selectedScript
    ? resolveScriptCharacters(selectedScript, { includeTravellers: false, includeFabled: false })
    : [];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="mb-6 text-center font-display text-3xl text-[var(--shell-gold)] md:text-4xl">New Game</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="game-panel flex flex-col p-3.5" data-testid="card-script">
          <div className="game-label mb-2 text-[var(--parchment-townsfolk)]">Script</div>
          <button
            onClick={() => setScriptDrawerOpen(true)}
            className="w-full flex-1 text-left flex items-center gap-3 rounded-lg hover-elevate -m-1 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            data-testid="button-script-selector"
          >
            {selectedScript ? (
              <Scroll className="h-5 w-5 shrink-0 text-[var(--parchment-ink-link)]" />
            ) : (
              <BookOpen className="h-5 w-5 shrink-0 text-[var(--parchment-ink-link)]" />
            )}
            <div className="flex-1 min-w-0">
              {selectedScript ? (
                <>
                  <div className="truncate font-display text-lg font-semibold text-[var(--parchment-ink)]">{selectedScript.name}</div>
                  <div className="font-serif text-sm text-[var(--parchment-ink-muted)]">{countScriptCharacters(selectedScript)} characters</div>
                </>
              ) : (
                <>
                  <div className="font-display text-lg font-semibold text-[var(--parchment-ink)]">Select a script</div>
                  <div className="font-serif text-sm text-[var(--parchment-ink-muted)]">Tap to choose, or start with all characters</div>
                </>
              )}
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-[var(--parchment-ink-faint)]" />
          </button>
        </div>

        <div className="game-panel flex flex-col p-3.5" data-testid="card-players">
          <div className="game-label mb-2 text-[var(--parchment-townsfolk)]">Players</div>
          <div className="flex flex-1 items-center justify-center gap-4">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setPlayerCount(Math.max(5, playerCount - 1))}
              data-testid="button-decrease-players"
            >
              <ChevronDown className="w-5 h-5" />
            </Button>
            <div className="w-16 text-center font-display text-5xl text-[var(--parchment-ink)]" data-testid="text-player-count">
              {playerCount}
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setPlayerCount(Math.min(20, playerCount + 1))}
              data-testid="button-increase-players"
            >
              <ChevronUp className="w-5 h-5" />
            </Button>
          </div>
          <button
            onClick={() => setFriendsPickerOpen(true)}
            className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-full border border-[var(--parchment-control-border)] bg-[var(--parchment-control)] px-3 py-1.5 font-sans text-xs font-bold uppercase tracking-wider text-[var(--parchment-ink-link)] hover:bg-[var(--parchment-control-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            data-testid="button-add-from-friends"
          >
            <Users className="w-3.5 h-3.5" />
            Add from Friends
          </button>
          {assignedNames.length > 0 && (
            <div className="mt-2 flex items-center gap-2 font-serif text-sm text-[var(--parchment-ink-muted)]" data-testid="text-assigned-friends">
              <span className="flex-1 truncate">
                {assignedNames.length} added: {assignedNames.join(", ")}
              </span>
              <button
                onClick={() => { setAssignedNames([]); setAssignedFriendIds([]); }}
                className="shrink-0 rounded-md px-1.5 py-0.5 text-[var(--parchment-ink-muted)] hover:text-[var(--parchment-minion)] hover:bg-[var(--parchment-control)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                data-testid="button-clear-assigned-friends"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="game-panel mb-4 space-y-2.5 p-3.5 text-center">
        <p className="game-label text-[var(--parchment-townsfolk)]">Character Breakdown</p>
        <div className="flex flex-wrap justify-center gap-3" data-testid="text-breakdown">
          <Badge variant="secondary" className={cn(PILL, teamParchment('townsfolk').tint, teamParchment('townsfolk').text, teamParchment('townsfolk').ring)}>
            {breakdown.townsfolk} Townsfolk
          </Badge>
          <Badge variant="secondary" className={cn(PILL, teamParchment('outsider').tint, teamParchment('outsider').text, teamParchment('outsider').ring)}>
            {breakdown.outsiders} Outsiders
          </Badge>
          <Badge variant="secondary" className={cn(PILL, teamParchment('minion').tint, teamParchment('minion').text, teamParchment('minion').ring)}>
            {breakdown.minions} Minions
          </Badge>
          <Badge variant="secondary" className={cn(PILL, teamParchment('demon').tint, teamParchment('demon').text, teamParchment('demon').ring)}>
            {breakdown.demons} Demon
          </Badge>
          {'travelers' in breakdown && breakdown.travelers > 0 && (
            <Badge variant="secondary" className={cn(PILL, teamParchment('traveler').tint, teamParchment('traveler').text, teamParchment('traveler').ring)}>
              + {breakdown.travelers} {breakdown.travelers === 1 ? 'Traveler' : 'Travelers'}
            </Badge>
          )}
        </div>
      </div>

      {selectedScript ? (
        <ScriptSheet characters={sheetCharacters} scriptName={selectedScript.name} />
      ) : (
        <div className="game-panel py-12 text-center text-[var(--parchment-ink-muted)]" data-testid="text-script-nudge">
          <Scroll className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-serif text-base">Pick a script to see the full character sheet.</p>
        </div>
      )}

      <div className="sticky bottom-0 z-30 -mx-4 mt-6 px-4 pt-3 pb-4 flex justify-center bg-gradient-to-t from-background via-background/95 to-transparent">
        <Button onClick={handleStartGame} size="lg" className="bg-[var(--shell-gold)] font-display text-lg text-[var(--shell-chrome)] shadow-lg shadow-black/40 hover:bg-[var(--shell-gold)] hover:brightness-110" data-testid="button-start-game">
          <Play className="w-4 h-4 mr-2" /> Start Game
        </Button>
      </div>

      <FriendsPicker
        open={friendsPickerOpen}
        onOpenChange={setFriendsPickerOpen}
        initialIds={assignedFriendIds}
        onConfirm={handleAssignFriends}
      />

      <Drawer open={scriptDrawerOpen} onOpenChange={setScriptDrawerOpen}>
        <DrawerContent className="parchment-scope max-h-[85vh] border-[var(--parchment-border)] bg-[var(--parchment-panel)]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-2xl font-semibold text-[var(--parchment-ink)]">Select a script</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-2 overflow-y-auto px-3.5 pb-6">
            <button
              onClick={() => handleSelectScript(null)}
              className={cn(
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                "w-full text-left p-3 transition-colors",
                !selectedScript
                  ? "game-card border-[1.5px] border-[var(--parchment-ink-link)] bg-[var(--parchment-control)]"
                  : "game-card hover:bg-[var(--parchment-control)]"
              )}
              data-testid="button-no-script"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-[var(--parchment-ink-link)]" />
                <div>
                  <div className="font-display text-lg font-semibold leading-tight text-[var(--parchment-ink)]">All Characters</div>
                  <div className="font-serif text-sm text-[var(--parchment-ink-muted)]">No script filter - show all characters when claiming</div>
                </div>
              </div>
            </button>

            <div className="pt-2 pb-1">
              <span className="game-label text-[var(--parchment-townsfolk)]">Official Scripts</span>
            </div>

            {allScripts.filter(s => s.isOfficial && !s.isCommunity).map(script => (
              <button
                key={script.id}
                onClick={() => handleSelectScript(script)}
                className={cn(
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                  "w-full text-left p-3 transition-colors",
                  selectedScript?.id === script.id
                    ? "game-card border-[1.5px] border-[var(--parchment-ink-link)] bg-[var(--parchment-control)]"
                    : "game-card hover:bg-[var(--parchment-control)]"
                )}
                data-testid={`button-script-${script.id}`}
              >
                <div className="flex items-center gap-3">
                  <Scroll className="h-5 w-5 text-[var(--parchment-ink-link)]" />
                  <div>
                    <div className="font-display text-lg font-semibold leading-tight text-[var(--parchment-ink)]">{script.name}</div>
                    <div className="font-serif text-sm text-[var(--parchment-ink-muted)]">{countScriptCharacters(script)} characters</div>
                  </div>
                </div>
              </button>
            ))}

            <div className="pt-2 pb-1">
              <span className="game-label text-[var(--parchment-townsfolk)]">Community Scripts</span>
            </div>

            {allScripts.filter(s => s.isOfficial && s.isCommunity).map(script => (
              <button
                key={script.id}
                onClick={() => handleSelectScript(script)}
                className={cn(
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                  "w-full text-left p-3 transition-colors",
                  selectedScript?.id === script.id
                    ? "game-card border-[1.5px] border-[var(--parchment-ink-link)] bg-[var(--parchment-control)]"
                    : "game-card hover:bg-[var(--parchment-control)]"
                )}
                data-testid={`button-script-${script.id}`}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[var(--parchment-ink-link)]" />
                  <div>
                    <div className="font-display text-lg font-semibold leading-tight text-[var(--parchment-ink)]">{script.name}</div>
                    <div className="font-serif text-sm text-[var(--parchment-ink-muted)]">{countScriptCharacters(script)} characters</div>
                  </div>
                </div>
              </button>
            ))}

            <div className="pt-2 pb-1">
              <span className="game-label text-[var(--parchment-townsfolk)]">Custom Scripts</span>
            </div>
            {customScripts.map(script => (
              <div
                key={script.id}
                className={cn(
                  "w-full text-left p-3 transition-colors flex items-center gap-2",
                  selectedScript?.id === script.id
                    ? "game-card border-[1.5px] border-[var(--parchment-ink-link)] bg-[var(--parchment-control)]"
                    : "game-card"
                )}
              >
                <button
                  onClick={() => handleSelectScript(script)}
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
                    setEditingScript(script);
                    setScriptDrawerOpen(false);
                    setShowScriptBuilder(true);
                  }}
                  data-testid={`button-edit-script-${script.id}`}
                >
                  <Pencil className="h-4 w-4 text-[var(--parchment-ink-muted)]" />
                </Button>
              </div>
            ))}
            <button
              onClick={() => {
                setEditingScript(null);
                setScannedCharacters(null);
                setScriptDrawerOpen(false);
                setShowScriptBuilder(true);
              }}
              className="w-full text-left p-3 rounded-[10px] border border-dashed border-[var(--parchment-control-border)] hover:bg-[var(--parchment-control)] transition-colors flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              data-testid="button-create-custom-script"
            >
              <Plus className="h-5 w-5 text-[var(--parchment-ink-link)]" />
              <div className="font-display text-lg font-semibold text-[var(--parchment-ink-link)]">Create Custom Script</div>
            </button>
            <button
              onClick={() => scanInputRef.current?.click()}
              disabled={scanning}
              className="w-full text-left p-3 rounded-[10px] border border-dashed border-[var(--parchment-control-border)] hover:bg-[var(--parchment-control)] transition-colors flex items-center gap-3 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              data-testid="button-scan-paper-script"
            >
              {scanning ? (
                <Loader2 className="h-5 w-5 animate-spin text-[var(--parchment-ink-link)]" />
              ) : (
                <Camera className="h-5 w-5 text-[var(--parchment-ink-link)]" />
              )}
              <div>
                <div className="font-display text-lg font-semibold text-[var(--parchment-ink-link)]">{scanning ? "Scanning photo..." : "Scan Paper Script"}</div>
                <div className="font-serif text-sm text-[var(--parchment-ink-muted)]">Take a photo of a printed script to build it automatically</div>
              </div>
            </button>
            <input
              ref={scanInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleScanScript}
              data-testid="input-scan-paper-script"
            />

            {scanning && (
              <div className="flex items-center gap-2 pt-2 font-serif text-sm text-[var(--parchment-ink-link)]" data-testid="status-scanning">
                <Loader2 className="w-4 h-4 animate-spin" />
                Reading your photo… the review screen will open in a moment.
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <ScriptBuilderDialog
        open={showScriptBuilder}
        onOpenChange={(o) => {
          setShowScriptBuilder(o);
          if (!o) setScannedCharacters(null);
        }}
        initialCharacters={
          editingScript
            ? new Set(editingScript.characterIds)
            : scannedCharacters ?? new Set()
        }
        initialName={editingScript?.name || (scannedCharacters ? "Scanned Script" : "")}
        initialSynopsis={editingScript?.synopsis || ""}
        title={editingScript ? "Edit Custom Script" : scannedCharacters ? "Review Scanned Script" : "Create Custom Script"}
        editMode={!!editingScript}
        onSave={async (name, characterIds, synopsis) => {
          if (editingScript) {
            updateCustomScript(editingScript.id, name, characterIds, synopsis);
            const updated = getScriptById(editingScript.id);
            if (updated) setSelectedScript(updated);
          } else {
            const newScript = await addCustomScriptAsync(name, characterIds, synopsis);
            setSelectedScript(newScript);
          }
        }}
      />
    </div>
  );
}
