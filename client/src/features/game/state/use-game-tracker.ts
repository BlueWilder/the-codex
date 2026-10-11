import { usePlayerGame } from "@/features/game/state/use-player-game";

/**
 * The game state hook plus the two derived actions the tracker page wires
 * into GameTrackerView. Moved out of pages/Game.tsx unchanged.
 */
export function useGameTracker() {
  const playerGame = usePlayerGame();
  const { game, updatePlayer } = playerGame;

  const updatePlayerName = (playerId: string, name: string) => {
    updatePlayer(playerId, { name });
  };

  const setPrimaryClaim = (playerId: string, characterId: string) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    const existingClaims = player.claims ?? [];
    const newClaims = [characterId, ...existingClaims.filter(c => c !== characterId)];
    const existingRecords = player.claimRecords ?? [];
    const newRecords = existingRecords.some(r => r.characterId === characterId)
      ? existingRecords
      : [...existingRecords, { characterId, addedAt: new Date().toISOString(), day: game.currentDay }];
    updatePlayer(playerId, { claims: newClaims, claimRecords: newRecords });
  };

  return { ...playerGame, updatePlayerName, setPrimaryClaim };
}
