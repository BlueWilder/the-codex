import { usePlayerGame } from "@/features/game/state/use-player-game";
import { InlineGameLog } from "@/components/InlineGameLog";

/** The Notebook tab: the game log and notes for the current game. */
export function NotebookView({
  game,
  onSetGameNotes,
  onAddNotebookNote,
  onRemoveNotebookNote,
}: {
  game: NonNullable<ReturnType<typeof usePlayerGame>["game"]>;
  onSetGameNotes: (notes: string) => void;
  onAddNotebookNote: (text: string) => void;
  onRemoveNotebookNote: (id: string) => void;
}) {
  return (
    <InlineGameLog
      game={game}
      onUpdateGameNotes={onSetGameNotes}
      onAddNotebookNote={onAddNotebookNote}
      onRemoveNotebookNote={onRemoveNotebookNote}
    />
  );
}
