import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Layout } from "@/components/ui/Layout";
import { PageTitle } from "@/components/PageTitle";
import { ScriptBuilderDialog } from "@/components/ScriptBuilderDialog";
import { CustomScriptList } from "@/components/CustomScriptList";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { usePlayerGame } from "@/features/game/state/use-player-game";
import { useLocalScripts, type LocalScript } from "@/hooks/use-local-scripts";
import { useScriptScan } from "@/hooks/use-script-scan";
import { resolveScriptCharacters } from "@/lib/script-resolve";
import cccBadge from "@/assets/ccc-parchment.png";

/** Play cards shown before the "All N scripts" link expands the list. */
const PLAY_PREVIEW_COUNT = 6;

/** Where a Play card sends the player: setup with this script chosen. */
export function newGamePath(scriptId: string) {
  return `/game?script=${encodeURIComponent(scriptId)}`;
}

/** "25 characters · 13 / 4 / 4 / 4", or "22 characters · official". */
function scriptMeta(script: LocalScript) {
  const chars = resolveScriptCharacters(script);
  const total = `${chars.length} ${chars.length === 1 ? "character" : "characters"}`;
  if (script.isOfficial && !script.isCommunity) return `${total} · official`;
  const count = (team: string) => chars.filter(c => c.team === team).length;
  return `${total} · ${count("townsfolk")} / ${count("outsider")} / ${count("minion")} / ${count("demon")}`;
}

type BuilderMode =
  | { kind: "create" }
  | { kind: "edit"; script: LocalScript }
  | { kind: "scan"; characterIds: Set<string> }
  | { kind: "import" };

const EMPTY_SET = new Set<string>();

export default function Home() {
  const [, navigate] = useLocation();
  const { game } = usePlayerGame();
  const { allScripts, customScripts, getScriptById, addCustomScriptAsync, updateCustomScript } = useLocalScripts();
  const [showAllScripts, setShowAllScripts] = useState(false);
  const [pendingScript, setPendingScript] = useState<LocalScript | null>(null);
  const [myScriptsOpen, setMyScriptsOpen] = useState(false);
  const [builder, setBuilder] = useState<BuilderMode | null>(null);
  const scan = useScriptScan((characterIds) => setBuilder({ kind: "scan", characterIds }));

  // Custom scripts first, then official, then community.
  const playScripts = useMemo(
    () => [
      ...customScripts,
      ...allScripts.filter(s => s.isOfficial && !s.isCommunity),
      ...allScripts.filter(s => s.isOfficial && s.isCommunity),
    ],
    [allScripts, customScripts],
  );
  const visibleScripts = showAllScripts ? playScripts : playScripts.slice(0, PLAY_PREVIEW_COUNT);
  const hiddenCount = playScripts.length - visibleScripts.length;

  const resumeScriptName = game?.script
    ? getScriptById(game.script.id)?.name ?? "Saved game"
    : "No Script";
  const aliveCount = game ? game.players.filter(p => p.status === "alive").length : 0;

  const startWithScript = (script: LocalScript) => {
    if (game) {
      setPendingScript(script);
      return;
    }
    navigate(newGamePath(script.id));
  };

  // Stable builder props: the dialog resets itself when these change identity.
  const builderCharacters = useMemo(() => {
    if (builder?.kind === "edit") return new Set(builder.script.characterIds);
    if (builder?.kind === "scan") return builder.characterIds;
    return EMPTY_SET;
  }, [builder]);

  return (
    <Layout>
      <div className="mx-auto max-w-xl pb-8">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
          data-testid="section-brand"
        >
          <PageTitle>Codex</PageTitle>
          <p className="mt-1 max-w-[300px] font-serif text-base italic text-[var(--shell-inactive)]" data-testid="text-home-quote">
            "Do not dare to hope, for the demon devours hope before all else."
          </p>
        </motion.div>

        {/* Resume: only with a saved game */}
        {game && (
          <section className="mb-6" data-testid="section-resume">
            <h2 className="section-label mb-3">Resume</h2>
            <Link
              href="/game"
              className="game-panel flex items-center gap-3 transition-[filter] hover:brightness-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="card-resume"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[19px] leading-tight text-[var(--parchment-ink)]" data-testid="text-resume-script">
                  {resumeScriptName}
                </span>
                <span className="block font-serif text-sm text-[var(--parchment-ink-muted)]" data-testid="text-resume-summary">
                  {game.players.length} seats · {aliveCount} alive
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-[var(--parchment-ink-faint)]" />
            </Link>
          </section>
        )}

        {/* Play */}
        <section data-testid="section-play">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="section-label">Play</h2>
            <span className="font-serif text-sm italic text-[var(--shell-inactive)]">pick a script</span>
          </div>
          <div className="game-panel space-y-3" data-testid="panel-play">
            {visibleScripts.map(script => (
              <button
                key={script.id}
                type="button"
                onClick={() => startWithScript(script)}
                className="game-card flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-[var(--parchment-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid={`button-play-script-${script.id}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-lg leading-tight text-[var(--parchment-ink)]">{script.name}</span>
                  <span className="block font-serif text-sm text-[var(--parchment-ink-muted)]" data-testid={`text-play-meta-${script.id}`}>
                    {scriptMeta(script)}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--parchment-ink-faint)]" />
              </button>
            ))}
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAllScripts(true)}
                className="btn-secondary w-full"
                data-testid="button-all-scripts"
              >
                All {playScripts.length} scripts
              </button>
            )}
          </div>

          {/* Script tools: three secondary pills */}
          <div className="mt-3 grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={scan.openPicker}
              disabled={scan.scanning}
              className="btn-secondary w-full px-2"
              data-testid="button-home-scan"
            >
              {scan.scanning ? "Scanning…" : "Scan"}
            </button>
            <button
              type="button"
              onClick={() => setBuilder({ kind: "import" })}
              className="btn-secondary w-full px-2"
              data-testid="button-home-import"
            >
              Import
            </button>
            <button
              type="button"
              onClick={() => setMyScriptsOpen(true)}
              className="btn-secondary w-full px-2"
              data-testid="button-home-my-scripts"
            >
              My scripts
            </button>
          </div>
          <input
            ref={scan.inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={scan.onFileChange}
            data-testid="input-home-scan"
          />
        </section>

        {/* Footer */}
        <footer className="mt-6 space-y-3 border-t border-[var(--shell-border)] pt-6 text-center" data-testid="footer-home">
          <p className="text-xs text-muted-foreground">
            Created by{" "}
            <a
              href="https://mageproductions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-amber-600 underline underline-offset-2 hover:text-amber-500"
              data-testid="link-mage-productions"
            >
              Mage Productions
            </a>
          </p>
          <p
            className="mx-auto max-w-2xl text-xs leading-relaxed text-muted-foreground"
            data-testid="text-attribution"
          >
            This is an unofficial fan-made reference tool for Blood on the Clocktower. Blood on the Clocktower and all associated characters, names, and imagery are the property of Steven Medway and The Pandemonium Institute. This tool is not affiliated with, endorsed, or sponsored by The Pandemonium Institute. For the official game, visit{" "}
            <a
              href="https://bloodontheclocktower.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 underline underline-offset-2 hover:text-amber-500"
              data-testid="link-botc-official"
            >
              bloodontheclocktower.com
            </a>
          </p>
          <a
            href="https://botc.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-col items-center gap-1 pt-1 opacity-80 transition-opacity hover:opacity-100"
            data-testid="link-ccc-badge"
          >
            <img
              src={cccBadge}
              alt="Custom Characters Community"
              className="h-8 w-auto"
              data-testid="img-ccc-badge"
            />
            <span className="text-[10px] text-muted-foreground/60">
              A reference tool, not a source of official rulings.
            </span>
          </a>
        </footer>
      </div>

      {/* Replace the saved game? */}
      <AlertDialog open={!!pendingScript} onOpenChange={(open) => { if (!open) setPendingScript(null); }}>
        <AlertDialogContent className="parchment-scope rounded-[14px] border-[var(--parchment-border)] bg-[var(--parchment-panel)]" data-testid="dialog-replace-game">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl font-semibold text-[var(--parchment-ink)]">Replace your current game?</AlertDialogTitle>
            <AlertDialogDescription>
              Your saved game is replaced when you start a new one with {pendingScript?.name}. Until you press Start Game, Resume still opens it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-replace-game">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingScript) navigate(newGamePath(pendingScript.id));
                setPendingScript(null);
              }}
              data-testid="button-confirm-replace-game"
            >
              New game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* My scripts: the custom script list, tap to play, pencil to edit */}
      <Drawer open={myScriptsOpen} onOpenChange={setMyScriptsOpen}>
        <DrawerContent className="parchment-scope max-h-[85vh] border-[var(--parchment-border)] bg-[var(--parchment-panel)]" data-testid="drawer-my-scripts">
          <DrawerHeader className="px-4 text-left">
            <DrawerTitle className="font-display text-2xl font-semibold text-[var(--parchment-ink)]">My scripts</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-3 overflow-y-auto px-4 pb-6">
            {customScripts.length === 0 && (
              <p className="pb-1 font-serif text-base italic text-[var(--parchment-ink-muted)]" data-testid="text-no-custom-scripts">
                No custom scripts yet.
              </p>
            )}
            <CustomScriptList
              scripts={customScripts}
              onSelect={(script) => {
                setMyScriptsOpen(false);
                startWithScript(script);
              }}
              onEdit={(script) => {
                setMyScriptsOpen(false);
                setBuilder({ kind: "edit", script });
              }}
              onCreate={() => {
                setMyScriptsOpen(false);
                setBuilder({ kind: "create" });
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* The existing script builder, opened for create, edit, scan review or import */}
      <ScriptBuilderDialog
        open={builder !== null}
        onOpenChange={(open) => { if (!open) setBuilder(null); }}
        initialCharacters={builderCharacters}
        initialName={builder?.kind === "edit" ? builder.script.name : builder?.kind === "scan" ? "Scanned Script" : ""}
        initialSynopsis={builder?.kind === "edit" ? builder.script.synopsis ?? "" : ""}
        initialShowImport={builder?.kind === "import"}
        title={
          builder?.kind === "edit"
            ? "Edit Custom Script"
            : builder?.kind === "scan"
              ? "Review Scanned Script"
              : builder?.kind === "import"
                ? "Import Script"
                : "Create Custom Script"
        }
        editMode={builder?.kind === "edit"}
        onSave={async (name, characterIds, synopsis) => {
          if (builder?.kind === "edit") {
            updateCustomScript(builder.script.id, name, characterIds, synopsis);
          } else {
            await addCustomScriptAsync(name, characterIds, synopsis);
          }
        }}
      />
    </Layout>
  );
}
