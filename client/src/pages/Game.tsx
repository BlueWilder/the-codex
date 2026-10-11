import { Layout } from "@/components/ui/Layout";
import { useGameTracker } from "@/features/game/state/use-game-tracker";
import { Loader2 } from "lucide-react";
import { SetupWizard } from "@/features/game/GameSetup";
import { GameTrackerView } from "@/features/game/GameTrackerView";

// Components that moved into features/game are re-exported here so existing
// imports from "@/pages/Game" (including the test suite) keep working.
export { CircleSeatingChart } from "@/features/game/views/CircleView";
export { SortablePlayerCard } from "@/features/game/views/ListView";
export { CharacterPicker } from "@/features/game/dialogs/CharacterPicker";
export { SetupWizard } from "@/features/game/GameSetup";
export { PlayerDetailDrawer } from "@/features/game/PlayerDetailDrawer";
export { GameTrackerView } from "@/features/game/GameTrackerView";

export default function Game() {
  const {
    game,
    isLoading,
    createGame,
    endGame,
    playAgain,
    addClaim,
    addMultipleClaims,
    removeClaim,
    toggleAlive,
    setPlayerStatus,
    setNotes,
    advancePhase,
    regressPhase,
    reorderPlayers,
    reversePlayers,
    clearScript,
    setScript,
    addTraveler,
    convertToTraveler,
    removeTraveler,
    setGameNotes,
    addNotebookNote,
    removeNotebookNote,
    addPlayer,
    removePlayer,
    setCirclePosition,
    setMultipleCirclePositions,
    resetCirclePositions,
    updatePlayerName,
    setPrimaryClaim,
  } = useGameTracker();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {!game ? (
        <SetupWizard onStart={createGame} />
      ) : (
        <GameTrackerView
          game={game}
          onEndGame={endGame}
          onPlayAgain={playAgain}
          onToggleAlive={toggleAlive}
          onSetPlayerStatus={setPlayerStatus}
          onAddClaim={addClaim}
          onAddMultipleClaims={addMultipleClaims}
          onSetPrimaryClaim={setPrimaryClaim}
          onRemoveClaim={removeClaim}
          onSetNotes={setNotes}
          onUpdatePlayerName={updatePlayerName}
          onAdvancePhase={advancePhase}
          onRegressPhase={regressPhase}
          onReorderPlayers={reorderPlayers}
          onReversePlayers={reversePlayers}
          onClearScript={clearScript}
          onSetScript={setScript}
          onAddTraveler={addTraveler}
          onConvertToTraveler={convertToTraveler}
          onRemoveTraveler={removeTraveler}
          onSetGameNotes={setGameNotes}
          onAddNotebookNote={addNotebookNote}
          onRemoveNotebookNote={removeNotebookNote}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
          onSetCirclePosition={setCirclePosition}
          onSetMultipleCirclePositions={setMultipleCirclePositions}
          onResetCirclePositions={resetCirclePositions}
        />
      )}
    </Layout>
  );
}
