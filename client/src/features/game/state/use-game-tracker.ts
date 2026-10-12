import { usePlayerGame } from "@/features/game/state/use-player-game";

/**
 * The game state hook plus the derived rename action the tracker page wires
 * into GameTrackerView.
 */
export function useGameTracker() {
  const playerGame = usePlayerGame();
  const { updatePlayer } = playerGame;

  const updatePlayerName = (playerId: string, name: string) => {
    updatePlayer(playerId, { name });
  };

  return { ...playerGame, updatePlayerName };
}
