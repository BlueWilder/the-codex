import { useState, useEffect, useCallback } from "react";

export interface PlayerVote {
  playerId: string;
  voted: boolean;
}

export interface Nomination {
  id: string;
  day: number;
  nomineeId: string;
  nominatorId: string;
  votes: PlayerVote[];
}

export interface GamePlayer {
  id: string;
  name: string;
  isAlive: boolean;
  hasGhostVote: boolean;
  notes: string;
  claims: string[];
}

export interface PlayerGame {
  id: string;
  createdAt: string;
  playerCount: number;
  breakdown: { townsfolk: number; outsiders: number; minions: number; demons: number };
  players: GamePlayer[];
  nominations: Nomination[];
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
        const parsed = JSON.parse(stored);
        // Migrate legacy data: ensure nominations array exists
        if (!parsed.nominations) {
          parsed.nominations = [];
        }
        // Remove legacy votes from players if present
        if (parsed.players) {
          parsed.players = parsed.players.map((p: GamePlayer & { votes?: unknown }) => {
            const { votes, ...rest } = p;
            return rest;
          });
        }
        setGame(parsed);
        // Re-save to persist migration
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
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
        hasGhostVote: true,
        notes: "",
        claims: [],
      })),
      nominations: [],
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

  const hasBeenNominatedToday = useCallback((playerId: string) => {
    if (!game) return false;
    return game.nominations.some(n => n.day === game.currentDay && n.nomineeId === playerId);
  }, [game]);

  const hasNominatedToday = useCallback((playerId: string) => {
    if (!game) return false;
    return game.nominations.some(n => n.day === game.currentDay && n.nominatorId === playerId);
  }, [game]);

  const getDayNominations = useCallback((day: number) => {
    if (!game) return [];
    return game.nominations.filter(n => n.day === day);
  }, [game]);

  const createNomination = useCallback((nomineeId: string, nominatorId: string, votes: PlayerVote[]) => {
    if (!game) return;
    if (hasBeenNominatedToday(nomineeId) || hasNominatedToday(nominatorId)) return;
    
    const newNomination: Nomination = {
      id: crypto.randomUUID(),
      day: game.currentDay,
      nomineeId,
      nominatorId,
      votes,
    };
    saveGame({ ...game, nominations: [...game.nominations, newNomination] });
  }, [game, saveGame, hasBeenNominatedToday, hasNominatedToday]);

  const deleteNomination = useCallback((nominationId: string) => {
    if (!game) return;
    saveGame({ ...game, nominations: game.nominations.filter(n => n.id !== nominationId) });
  }, [game, saveGame]);

  const toggleAlive = useCallback((playerId: string) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    updatePlayer(playerId, { isAlive: !player.isAlive });
  }, [game, updatePlayer]);

  const toggleGhostVote = useCallback((playerId: string) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    updatePlayer(playerId, { hasGhostVote: !player.hasGhostVote });
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

  const reorderPlayers = useCallback((activeId: string, overId: string) => {
    if (!game || activeId === overId) return;
    const oldIndex = game.players.findIndex(p => p.id === activeId);
    const newIndex = game.players.findIndex(p => p.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;
    
    const newPlayers = [...game.players];
    const [removed] = newPlayers.splice(oldIndex, 1);
    newPlayers.splice(newIndex, 0, removed);
    saveGame({ ...game, players: newPlayers });
  }, [game, saveGame]);

  return {
    game,
    isLoading,
    createGame,
    endGame,
    updatePlayer,
    addClaim,
    removeClaim,
    toggleAlive,
    toggleGhostVote,
    setNotes,
    nextDay,
    prevDay,
    reorderPlayers,
    hasBeenNominatedToday,
    hasNominatedToday,
    getDayNominations,
    createNomination,
    deleteNomination,
  };
}
