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
import { Card } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { teamBadge } from "@/lib/team-style";
import { type GameScriptRef } from "@/features/game/types";

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
      <h1 className="text-3xl md:text-4xl font-display text-amber-500 mb-8 text-center">New Game</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Card className="p-4 flex flex-col" data-testid="card-script">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Script</div>
          <button
            onClick={() => setScriptDrawerOpen(true)}
            className="w-full flex-1 text-left flex items-center gap-3 rounded-lg hover-elevate -m-1 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            data-testid="button-script-selector"
          >
            {selectedScript ? (
              <Scroll className="w-5 h-5 text-amber-500/70 shrink-0" />
            ) : (
              <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              {selectedScript ? (
                <>
                  <div className="font-medium truncate">{selectedScript.name}</div>
                  <div className="text-sm text-muted-foreground">{countScriptCharacters(selectedScript)} characters</div>
                </>
              ) : (
                <>
                  <div className="font-medium text-amber-100">Select a script</div>
                  <div className="text-sm text-muted-foreground">Tap to choose, or start with all characters</div>
                </>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </button>
        </Card>

        <Card className="p-4 flex flex-col" data-testid="card-players">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Players</div>
          <div className="flex flex-1 items-center justify-center gap-4">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setPlayerCount(Math.max(5, playerCount - 1))}
              data-testid="button-decrease-players"
            >
              <ChevronDown className="w-5 h-5" />
            </Button>
            <div className="text-4xl md:text-5xl font-display text-amber-100 w-16 text-center" data-testid="text-player-count">
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
            className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-md border border-[#3d2f57] bg-[#c79fe6]/5 px-3 py-1.5 text-sm text-[#c79fe6] hover:bg-[#c79fe6]/15 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            data-testid="button-add-from-friends"
          >
            <Users className="w-3.5 h-3.5" />
            Add from Friends
          </button>
          {assignedNames.length > 0 && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground" data-testid="text-assigned-friends">
              <span className="flex-1 truncate">
                {assignedNames.length} added: {assignedNames.join(", ")}
              </span>
              <button
                onClick={() => { setAssignedNames([]); setAssignedFriendIds([]); }}
                className="shrink-0 rounded-md px-1.5 py-0.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/15 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                data-testid="button-clear-assigned-friends"
              >
                Clear
              </button>
            </div>
          )}
        </Card>
      </div>

      <div className="w-full bg-muted/30 p-6 rounded-lg text-center space-y-3 mb-4">
        <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">Character Breakdown</p>
        <div className="flex flex-wrap justify-center gap-3" data-testid="text-breakdown">
          <Badge variant="secondary" className={cn(teamBadge('townsfolk'), 'text-sm px-3 py-1 font-sans')}>
            {breakdown.townsfolk} Townsfolk
          </Badge>
          <Badge variant="secondary" className={cn(teamBadge('outsider'), 'text-sm px-3 py-1 font-sans')}>
            {breakdown.outsiders} Outsiders
          </Badge>
          <Badge variant="secondary" className={cn(teamBadge('minion'), 'text-sm px-3 py-1 font-sans')}>
            {breakdown.minions} Minions
          </Badge>
          <Badge variant="secondary" className={cn(teamBadge('demon'), 'text-sm px-3 py-1 font-sans')}>
            {breakdown.demons} Demon
          </Badge>
          {'travelers' in breakdown && breakdown.travelers > 0 && (
            <Badge variant="secondary" className={cn(teamBadge('traveler'), 'text-sm px-3 py-1 font-sans')}>
              + {breakdown.travelers} {breakdown.travelers === 1 ? 'Traveler' : 'Travelers'}
            </Badge>
          )}
        </div>
      </div>

      {selectedScript ? (
        <ScriptSheet characters={sheetCharacters} scriptName={selectedScript.name} />
      ) : (
        <div className="py-12 text-center text-muted-foreground" data-testid="text-script-nudge">
          <Scroll className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Pick a script to see the full character sheet.</p>
        </div>
      )}

      <div className="sticky bottom-0 z-30 -mx-4 mt-6 px-4 pt-3 pb-4 flex justify-center bg-gradient-to-t from-background via-background/95 to-transparent">
        <Button onClick={handleStartGame} size="lg" className="shadow-lg shadow-amber-900/30" data-testid="button-start-game">
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
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Select a script</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6 space-y-3">
            <button
              onClick={() => handleSelectScript(null)}
              className={cn(
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                "w-full text-left p-4 rounded-lg border transition-colors",
                !selectedScript
                  ? "bg-amber-900/30 border-amber-600 ring-1 ring-amber-500/50"
                  : "bg-card border-border hover-elevate"
              )}
              data-testid="button-no-script"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">All Characters</div>
                  <div className="text-sm text-muted-foreground">No script filter - show all characters when claiming</div>
                </div>
              </div>
            </button>

            <div className="pt-2 pb-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Official Scripts</span>
            </div>

            {allScripts.filter(s => s.isOfficial && !s.isCommunity).map(script => (
              <button
                key={script.id}
                onClick={() => handleSelectScript(script)}
                className={cn(
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                  "w-full text-left p-4 rounded-lg border transition-colors",
                  selectedScript?.id === script.id
                    ? "bg-amber-900/30 border-amber-600 ring-1 ring-amber-500/50"
                    : "bg-card border-border hover-elevate"
                )}
                data-testid={`button-script-${script.id}`}
              >
                <div className="flex items-center gap-3">
                  <Scroll className="w-5 h-5 text-amber-500/70" />
                  <div>
                    <div className="font-medium">{script.name}</div>
                    <div className="text-sm text-muted-foreground">{countScriptCharacters(script)} characters</div>
                  </div>
                </div>
              </button>
            ))}

            <div className="pt-2 pb-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Community Scripts</span>
            </div>

            {allScripts.filter(s => s.isOfficial && s.isCommunity).map(script => (
              <button
                key={script.id}
                onClick={() => handleSelectScript(script)}
                className={cn(
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                  "w-full text-left p-4 rounded-lg border transition-colors",
                  selectedScript?.id === script.id
                    ? "bg-teal-900/30 border-teal-600 ring-1 ring-teal-500/50"
                    : "bg-card border-border hover-elevate"
                )}
                data-testid={`button-script-${script.id}`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-teal-500/70" />
                  <div>
                    <div className="font-medium">{script.name}</div>
                    <div className="text-sm text-muted-foreground">{countScriptCharacters(script)} characters</div>
                  </div>
                </div>
              </button>
            ))}

            <div className="pt-2 pb-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Custom Scripts</span>
            </div>
            {customScripts.map(script => (
              <div
                key={script.id}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-colors flex items-center gap-2",
                  selectedScript?.id === script.id
                    ? "bg-purple-900/30 border-purple-600 ring-1 ring-purple-500/50"
                    : "bg-card border-border"
                )}
              >
                <button
                  onClick={() => handleSelectScript(script)}
                  className="flex-1 flex items-center gap-3 hover-elevate rounded-lg -m-2 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                  data-testid={`button-script-${script.id}`}
                >
                  <Scroll className="w-5 h-5 text-purple-500/70" />
                  <div>
                    <div className="font-medium">{script.name}</div>
                    <div className="text-sm text-muted-foreground">{countScriptCharacters(script)} characters</div>
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
                  <Pencil className="w-4 h-4 text-muted-foreground" />
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
              className="w-full text-left p-4 rounded-lg border border-dashed border-purple-700/50 hover-elevate transition-colors flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              data-testid="button-create-custom-script"
            >
              <Plus className="w-5 h-5 text-purple-500/70" />
              <div className="font-medium text-purple-400">Create Custom Script</div>
            </button>
            <button
              onClick={() => scanInputRef.current?.click()}
              disabled={scanning}
              className="w-full text-left p-4 rounded-lg border border-dashed border-amber-700/50 hover-elevate transition-colors flex items-center gap-3 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              data-testid="button-scan-paper-script"
            >
              {scanning ? (
                <Loader2 className="w-5 h-5 text-amber-500/70 animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-amber-500/70" />
              )}
              <div>
                <div className="font-medium text-amber-400">{scanning ? "Scanning photo..." : "Scan Paper Script"}</div>
                <div className="text-sm text-muted-foreground">Take a photo of a printed script to build it automatically</div>
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
              <div className="flex items-center gap-2 pt-2 text-sm text-amber-400" data-testid="status-scanning">
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
