import { useState, useEffect, useCallback } from "react";

export interface VoteRecord {
  day: number;
  nomineeId: string;
  voted: boolean;
}

export interface GamePlayer {
  id: string;
  name: string;
  isAlive: boolean;
  notes: string;
  claims: string[];
  votes: VoteRecord[];
}

export interface PlayerGame {
  id: string;
  createdAt: string;
  playerCount: number;
  breakdown: { townsfolk: number; outsiders: number; minions: number; demons: number };
  players: GamePlayer[];
  currentDay: number;
}

const STORAGE_KEY = "clocktower_player_game";

export const PLAYER_BREAKDOWN: Record<number, { townsfolk: number; outsiders: number; minions: number; demons: number }> = {
  5:  { townsfolk: 3, outsiders: 0, minions: 1, demons: 1 },
  6:  { townsfolk: 3, outsiders: 1, minions: 1, demons: 1 },
  7:  { townsfolk: 5, outsiders: 0, minions: 1, demons: 1 },
  8:  { townsfolk: 5, outsiders: 1, minions: 1, demons: 1 },
  9:  { townsfolk: 5, outsiders: 2, minions: 1, demons: 1 },
  10: { townsfolk: 7, outsiders: 0, minions: 2, demons: 1 },
  11: { townsfolk: 7, outsiders: 1, minions: 2, demons: 1 },
  12: { townsfolk: 7, outsiders: 2, minions: 2, demons: 1 },
  13: { townsfolk: 9, outsiders: 0, minions: 3, demons: 1 },
  14: { townsfolk: 9, outsiders: 1, minions: 3, demons: 1 },
  15: { townsfolk: 9, outsiders: 2, minions: 3, demons: 1 },
};

export function getBreakdown(count: number) {
  if (count >= 15) return PLAYER_BREAKDOWN[15];
  if (count < 5) return PLAYER_BREAKDOWN[5];
  return PLAYER_BREAKDOWN[count];
}

export function usePlayerGame() {
  const [game, setGame] = useState<PlayerGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setGame(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const saveGame = useCallback((newGame: PlayerGame | null) => {
    setGame(newGame);
    if (newGame) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newGame));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const createGame = useCallback((playerCount: number, playerNames: string[]) => {
    const newGame: PlayerGame = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      playerCount,
      breakdown: getBreakdown(playerCount),
      currentDay: 1,
      players: playerNames.map((name, i) => ({
        id: `player-${i}`,
        name,
        isAlive: true,
        notes: "",
        claims: [],
        votes: [],
      })),
    };
    saveGame(newGame);
    return newGame;
  }, [saveGame]);

  const endGame = useCallback(() => {
    saveGame(null);
  }, [saveGame]);

  const updatePlayer = useCallback((playerId: string, updates: Partial<GamePlayer>) => {
    if (!game) return;
    const newGame = {
      ...game,
      players: game.players.map(p => 
        p.id === playerId ? { ...p, ...updates } : p
      ),
    };
    saveGame(newGame);
  }, [game, saveGame]);

  const addClaim = useCallback((playerId: string, characterId: string) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player || player.claims.includes(characterId)) return;
    updatePlayer(playerId, { claims: [...player.claims, characterId] });
  }, [game, updatePlayer]);

  const removeClaim = useCallback((playerId: string, characterId: string) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    updatePlayer(playerId, { claims: player.claims.filter(c => c !== characterId) });
  }, [game, updatePlayer]);

  const addVote = useCallback((playerId: string, nomineeId: string, voted: boolean) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    const newVote: VoteRecord = { day: game.currentDay, nomineeId, voted };
    updatePlayer(playerId, { votes: [...player.votes, newVote] });
  }, [game, updatePlayer]);

  const toggleAlive = useCallback((playerId: string) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    updatePlayer(playerId, { isAlive: !player.isAlive });
  }, [game, updatePlayer]);

  const setNotes = useCallback((playerId: string, notes: string) => {
    updatePlayer(playerId, { notes });
  }, [updatePlayer]);

  const nextDay = useCallback(() => {
    if (!game) return;
    saveGame({ ...game, currentDay: game.currentDay + 1 });
  }, [game, saveGame]);

  const prevDay = useCallback(() => {
    if (!game || game.currentDay <= 1) return;
    saveGame({ ...game, currentDay: game.currentDay - 1 });
  }, [game, saveGame]);

  return {
    game,
    isLoading,
    createGame,
    endGame,
    updatePlayer,
    addClaim,
    removeClaim,
    addVote,
    toggleAlive,
    setNotes,
    nextDay,
    prevDay,
  };
}
