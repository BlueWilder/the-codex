import { useState, useEffect, useCallback } from "react";

export type PlayerStatus = 'alive' | 'dead' | 'left' | 'exiled';

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

export interface ExileVote {
  id: string;
  day: number;
  travelerId: string;
  votes: PlayerVote[];
  passed: boolean;
}

export interface GamePlayer {
  id: string;
  name: string;
  isAlive: boolean;
  status: PlayerStatus;
  hasGhostVote: boolean;
  notes: string;
  claims: string[];
  isTraveler?: boolean;
}

export function isPlayerActive(player: GamePlayer): boolean {
  return player.status === 'alive';
}

export function canPlayerVote(player: GamePlayer): boolean {
  if (player.status === 'alive') return true;
  if (player.status === 'dead' && player.hasGhostVote && !player.isTraveler) return true;
  return false;
}

export function canPlayerVoteOnExile(player: GamePlayer): boolean {
  return player.status === 'alive' || player.status === 'dead';
}

export interface GameScriptRef {
  id: string;
}

export interface PlayerGame {
  id: string;
  createdAt: string;
  playerCount: number;
  breakdown: { townsfolk: number; outsiders: number; minions: number; demons: number; travelers?: number };
  players: GamePlayer[];
  nominations: Nomination[];
  exileVotes: ExileVote[];
  currentDay: number;
  script?: GameScriptRef | null;
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
  if (count > 15) {
    return { ...PLAYER_BREAKDOWN[15], travelers: count - 15 };
  }
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
        // Migrate: ensure exileVotes array exists
        if (!parsed.exileVotes) {
          parsed.exileVotes = [];
        }
        // Migrate: add status field to players if missing
        if (parsed.players) {
          parsed.players = parsed.players.map((p: GamePlayer & { votes?: unknown }) => {
            const { votes, ...rest } = p;
            // Add status field based on isAlive if missing
            if (!rest.status) {
              rest.status = rest.isAlive ? 'alive' : 'dead';
            }
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

  const createGame = useCallback((playerCount: number, playerNames: string[], script?: GameScriptRef | null) => {
    const travelerStartIndex = playerCount > 15 ? 15 : playerCount;
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
        status: 'alive' as PlayerStatus,
        hasGhostVote: !( i >= travelerStartIndex), // Travelers don't get ghost votes
        notes: "",
        claims: [],
        isTraveler: i >= travelerStartIndex,
      })),
      nominations: [],
      exileVotes: [],
      script: script || null,
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
    
    // Calculate votes needed and check for automatic execution
    const aliveCount = game.players.filter(p => p.status === 'alive').length;
    const votesNeeded = Math.ceil(aliveCount / 2);
    const yesVotes = votes.filter(v => v.voted).length;
    
    // First, mark ghost votes as spent for dead non-Traveler players who voted yes
    let updatedPlayers = game.players.map(p => {
      const playerVote = votes.find(v => v.playerId === p.id);
      // If dead, non-Traveler, has ghost vote, and voted yes - spend it
      if (p.status === 'dead' && !p.isTraveler && p.hasGhostVote && playerVote?.voted) {
        return { ...p, hasGhostVote: false };
      }
      return p;
    });
    
    if (yesVotes >= votesNeeded) {
      // Auto-execute: mark nominee as dead, Travelers don't get ghost votes
      const nominee = updatedPlayers.find(p => p.id === nomineeId);
      if (nominee && nominee.status === 'alive') {
        updatedPlayers = updatedPlayers.map(p => 
          p.id === nomineeId 
            ? { ...p, isAlive: false, status: 'dead' as PlayerStatus, hasGhostVote: !nominee.isTraveler }
            : p
        );
      }
    }
    
    saveGame({ 
      ...game, 
      players: updatedPlayers,
      nominations: [...game.nominations, newNomination] 
    });
  }, [game, saveGame, hasBeenNominatedToday, hasNominatedToday]);

  const deleteNomination = useCallback((nominationId: string) => {
    if (!game) return;
    saveGame({ ...game, nominations: game.nominations.filter(n => n.id !== nominationId) });
  }, [game, saveGame]);

  const toggleAlive = useCallback((playerId: string) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    const newStatus: PlayerStatus = player.status === 'alive' ? 'dead' : 'alive';
    const newIsAlive = newStatus === 'alive';
    // Regular players get ghost vote when dying, Travelers don't
    const hasGhostVote = !newIsAlive && !player.isTraveler ? true : player.hasGhostVote;
    updatePlayer(playerId, { isAlive: newIsAlive, status: newStatus, hasGhostVote });
  }, [game, updatePlayer]);

  const setPlayerStatus = useCallback((playerId: string, status: PlayerStatus) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    const newIsAlive = status === 'alive';
    // Travelers never get ghost votes
    const hasGhostVote = player.isTraveler ? false : (status === 'dead' ? true : player.hasGhostVote);
    updatePlayer(playerId, { isAlive: newIsAlive, status, hasGhostVote });
  }, [game, updatePlayer]);

  const toggleGhostVote = useCallback((playerId: string) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    // Travelers can never have ghost votes
    if (player.isTraveler) return;
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

  const clearScript = useCallback(() => {
    if (!game) return;
    saveGame({ ...game, script: null });
  }, [game, saveGame]);

  const setScript = useCallback((scriptRef: GameScriptRef | null) => {
    if (!game) return;
    saveGame({ ...game, script: scriptRef });
  }, [game, saveGame]);

  const addTraveler = useCallback((name: string, initialClaims: string[] = []) => {
    if (!game) return;
    const travelerCount = game.players.filter(p => p.isTraveler).length;
    const newTraveler: GamePlayer = {
      id: `traveler-${Date.now()}`,
      name: name || `Traveler ${travelerCount + 1}`,
      isAlive: true,
      status: 'alive',
      hasGhostVote: false, // Travelers never get ghost votes
      notes: "",
      claims: initialClaims,
      isTraveler: true,
    };
    saveGame({ ...game, players: [...game.players, newTraveler] });
  }, [game, saveGame]);

  const removeTraveler = useCallback((playerId: string) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player || !player.isTraveler) return; // Only Travelers can be removed
    // Remove player and their nominations/exile votes
    const newNominations = game.nominations.filter(
      n => n.nomineeId !== playerId && n.nominatorId !== playerId
    );
    const newExileVotes = game.exileVotes.filter(e => e.travelerId !== playerId);
    saveGame({ 
      ...game, 
      players: game.players.filter(p => p.id !== playerId),
      nominations: newNominations,
      exileVotes: newExileVotes,
    });
  }, [game, saveGame]);

  const createExileVote = useCallback((travelerId: string, votes: PlayerVote[]) => {
    if (!game) return;
    const traveler = game.players.find(p => p.id === travelerId);
    if (!traveler || !traveler.isTraveler) return;
    
    // Calculate if exile passes (50% of living players)
    const aliveCount = game.players.filter(p => p.status === 'alive').length;
    const votesNeeded = Math.ceil(aliveCount / 2);
    const yesVotes = votes.filter(v => v.voted).length;
    const passed = yesVotes >= votesNeeded;
    
    const newExileVote: ExileVote = {
      id: crypto.randomUUID(),
      day: game.currentDay,
      travelerId,
      votes,
      passed,
    };
    
    let updatedPlayers = game.players;
    if (passed) {
      updatedPlayers = game.players.map(p => 
        p.id === travelerId 
          ? { ...p, isAlive: false, status: 'exiled' as PlayerStatus, hasGhostVote: false }
          : p
      );
    }
    
    saveGame({ 
      ...game, 
      players: updatedPlayers,
      exileVotes: [...game.exileVotes, newExileVote] 
    });
  }, [game, saveGame]);

  const getPlayerExileVotes = useCallback((playerId: string) => {
    if (!game) return [];
    return game.exileVotes.filter(e => e.travelerId === playerId);
  }, [game]);

  return {
    game,
    isLoading,
    createGame,
    endGame,
    updatePlayer,
    addClaim,
    removeClaim,
    toggleAlive,
    setPlayerStatus,
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
    clearScript,
    setScript,
    addTraveler,
    removeTraveler,
    createExileVote,
    getPlayerExileVotes,
  };
}
