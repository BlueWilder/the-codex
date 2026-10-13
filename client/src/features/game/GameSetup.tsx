import { useState, useEffect, useRef } from "react";
import { getBreakdown } from "@/features/game/state/use-player-game";
import { useLocalScripts, getScriptByIdStatic, type LocalScript } from "@/hooks/use-local-scripts";
import { ScriptBuilderDialog } from "@/components/ScriptBuilderDialog";
import { FriendsPicker } from "@/components/FriendsPicker";
import { useScriptScan } from "@/hooks/use-script-scan";
import { CustomScriptList } from "@/components/CustomScriptList";
import { PageTitle } from "@/components/PageTitle";
import { resolveScriptCharacters, countScriptCharacters } from "@/lib/script-resolve";
import { ScriptSheet } from "@/components/character/ScriptSheet";
import { ArrowLeft, ChevronRight, Play, Minus, Plus, Loader2, BookOpen, Users, Scroll, Camera } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { teamParchment } from "@/lib/team-style";
import { type GameScriptRef } from "@/features/game/types";

/** Character Breakdown pill on parchment; team colors come from teamParchment. */
const PILL = "border font-sans text-sm font-semibold px-3 py-1";

export function SetupWizard({
  onStart,
  initialScriptId,
}: {
  onStart: (count: number, names: string[], script?: GameScriptRef | null) => void;
  /** A script chosen before setup (a Home Play card). Setup opens on player count with it selected. */
  initialScriptId?: string | null;
}) {
  const [playerCount, setPlayerCount] = useState(8);
  const [selectedScript, setSelectedScript] = useState<LocalScript | null>(
    () => (initialScriptId ? getScriptByIdStatic(initialScriptId) : null),
  );
  const appliedInitialScript = useRef(false);
  const playersCardRef = useRef<HTMLDivElement>(null);
  const [scriptDrawerOpen, setScriptDrawerOpen] = useState(false);
  const [showScriptBuilder, setShowScriptBuilder] = useState(false);
  const [editingScript, setEditingScript] = useState<LocalScript | null>(null);
  const [scannedCharacters, setScannedCharacters] = useState<Set<string> | null>(null);
  const [assignedNames, setAssignedNames] = useState<string[]>([]);
  const [assignedFriendIds, setAssignedFriendIds] = useState<string[]>([]);
  const [friendsPickerOpen, setFriendsPickerOpen] = useState(false);
  const { allScripts, customScripts, addCustomScriptAsync, updateCustomScript, getScriptById } = useLocalScripts();
  const { inputRef: scanInputRef, scanning, openPicker: openScanPicker, onFileChange: handleScanScript } = useScriptScan((ids) => {
    setEditingScript(null);
    setScannedCharacters(ids);
    setScriptDrawerOpen(false);
    setShowScriptBuilder(true);
  });

  useEffect(() => {
    localStorage.removeItem("clocktower_st_session");
  }, []);

  // A script handed in from Home skips the script step: select it (cloud
  // scripts resolve once they load) and bring the player count into view.
  useEffect(() => {
    if (!initialScriptId || appliedInitialScript.current) return;
    const script = getScriptById(initialScriptId);
    if (!script) return;
    appliedInitialScript.current = true;
    setSelectedScript(script);
    playersCardRef.current?.scrollIntoView?.({ block: "start" });
  }, [initialScriptId, getScriptById]);

  const breakdown = getBreakdown(playerCount);

  const handleSelectScript = (script: LocalScript | null) => {
    appliedInitialScript.current = true; // a manual pick wins over a late-loading handed-in script
    setSelectedScript(script);
    setScriptDrawerOpen(false);
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
    <div>
      {/* Game Mode hides the app header; this slim game header is setup's only chrome (UI rule 6). */}
      <header className="game-chrome sticky top-0 z-40 -mx-5 -mt-5 mb-6 border-b px-2 py-2" data-testid="header-setup">
        <Link
          href="/"
          className="btn-icon text-[var(--shell-inactive)] hover:text-[var(--shell-gold)]"
          aria-label="Back to home"
          data-testid="button-back-home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </header>
      <PageTitle className="mb-6">New Game</PageTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="game-panel flex flex-col" data-testid="card-script">
          <div className="section-label mb-3">Script</div>
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

        <div ref={playersCardRef} className="game-panel flex scroll-mt-20 flex-col" data-testid="card-players">
          <div className="section-label mb-3">Players</div>
          {/* One secondary pill: minus at the left end, the count centered, plus at the right end. */}
          <div className="btn-secondary w-full justify-between px-0.5 hover:!bg-transparent" role="group" aria-label="Player count" data-testid="stepper-players">
            <button
              type="button"
              onClick={() => setPlayerCount(Math.max(5, playerCount - 1))}
              disabled={playerCount <= 5}
              className="btn-icon h-10 w-10"
              aria-label="Fewer players"
              data-testid="button-decrease-players"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="font-display text-2xl leading-none text-[var(--parchment-ink)]" data-testid="text-player-count">
              {playerCount}
            </span>
            <button
              type="button"
              onClick={() => setPlayerCount(Math.min(20, playerCount + 1))}
              disabled={playerCount >= 20}
              className="btn-icon h-10 w-10"
              aria-label="More players"
              data-testid="button-increase-players"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <Button
            variant="pill"
            onClick={() => setFriendsPickerOpen(true)}
            className="mt-3 w-full"
            data-testid="button-add-from-friends"
          >
            <Users />
            Add from Friends
          </Button>
          {assignedNames.length > 0 && (
            <div className="mt-3 flex items-center gap-3 font-serif text-sm text-[var(--parchment-ink-muted)]" data-testid="text-assigned-friends">
              <span className="flex-1 truncate">
                {assignedNames.length} added: {assignedNames.join(", ")}
              </span>
              <button
                onClick={() => { setAssignedNames([]); setAssignedFriendIds([]); }}
                className="btn-secondary"
                data-testid="button-clear-assigned-friends"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="game-panel mb-4 space-y-3">
        <p className="section-label">Character Breakdown</p>
        <div className="flex flex-wrap gap-3" data-testid="text-breakdown">
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

      <div className="sticky bottom-0 z-30 -mx-5 mt-6 px-5 pt-3 pb-4 flex justify-center bg-gradient-to-t from-background via-background/95 to-transparent">
        <Button variant="primary" onClick={handleStartGame} className="shadow-lg shadow-black/40" data-testid="button-start-game">
          <Play /> Start Game
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
          <DrawerHeader className="px-4 text-left">
            <DrawerTitle className="font-display text-2xl font-semibold text-[var(--parchment-ink)]">Select a script</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-3 overflow-y-auto px-4 pb-6">
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
                <BookOpen className="h-5 w-5 shrink-0 text-[var(--parchment-ink-link)]" />
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg font-semibold leading-tight text-[var(--parchment-ink)]">All Characters</div>
                  <div className="font-serif text-sm text-[var(--parchment-ink-muted)]">No script filter, show all characters when claiming</div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--parchment-ink-faint)]" />
              </div>
            </button>

            <h3 className="section-label pt-3">Official Scripts</h3>

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
                  <Scroll className="h-5 w-5 shrink-0 text-[var(--parchment-ink-link)]" />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-lg font-semibold leading-tight text-[var(--parchment-ink)]">{script.name}</div>
                    <div className="font-serif text-sm text-[var(--parchment-ink-muted)]">{countScriptCharacters(script)} characters</div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--parchment-ink-faint)]" />
                </div>
              </button>
            ))}

            <h3 className="section-label pt-3">Community Scripts</h3>

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
                  <Users className="h-5 w-5 shrink-0 text-[var(--parchment-ink-link)]" />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-lg font-semibold leading-tight text-[var(--parchment-ink)]">{script.name}</div>
                    <div className="font-serif text-sm text-[var(--parchment-ink-muted)]">{countScriptCharacters(script)} characters</div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--parchment-ink-faint)]" />
                </div>
              </button>
            ))}

            <h3 className="section-label pt-3">Custom Scripts</h3>
            <CustomScriptList
              scripts={customScripts}
              selectedId={selectedScript?.id}
              onSelect={handleSelectScript}
              onEdit={(script) => {
                setEditingScript(script);
                setScriptDrawerOpen(false);
                setShowScriptBuilder(true);
              }}
              onCreate={() => {
                setEditingScript(null);
                setScannedCharacters(null);
                setScriptDrawerOpen(false);
                setShowScriptBuilder(true);
              }}
            />
            <button
              onClick={openScanPicker}
              disabled={scanning}
              className="btn-secondary w-full"
              data-testid="button-scan-paper-script"
            >
              {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {scanning ? "Scanning photo..." : "Scan Paper Script"}
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
