import { useState, useEffect, useCallback } from "react";

export type PlayerStatus = 'alive' | 'dead' | 'left' | 'exiled';

export interface ClaimRecord {
  characterId: string;
  addedAt: string;
  day: number;
}

export interface DeathRecord {
  playerId: string;
  day: number;
  type: 'execution' | 'night' | 'exile';
  phase: 'day' | 'night'; // Moment-in-time phase, stamped at write
  timestamp: string;
  nominationId?: string; // If execution, link to nomination
}

export interface TravelerEvent {
  playerId: string;
  playerName: string;
  type: 'joined' | 'left' | 'exiled';
  day: number;
  timestamp: string;
  characterId?: string;
}

export interface NotebookNote {
  id: string;
  day: number;
  phase: 'day' | 'night'; // Moment-in-time phase, stamped at write
  text: string;
  createdAt: string;
}

export interface GamePlayer {
  id: string;
  name: string;
  isAlive: boolean;
  status: PlayerStatus;
  notes: string;
  claims: string[]; // Legacy: simple character IDs
  claimRecords?: ClaimRecord[]; // New: with timestamps
  isTraveler?: boolean;
  joinedAt?: string; // When traveler joined
  joinedDay?: number;
  circleX?: number; // Normalized 0-1 position on circle canvas
  circleY?: number;
}

export function isPlayerActive(player: GamePlayer): boolean {
  return player.status === 'alive';
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
  currentDay: number;
  phase: 'day' | 'night'; // Night N = (day N, 'night'); Day N = (day N, 'day')
  script?: GameScriptRef | null;
  // Event logs for Game Log view
  deathRecords?: DeathRecord[];
  travelerEvents?: TravelerEvent[];
  // Free-form game notes
  gameNotes?: string;
  // Per-phase notebook notes, stamped with day + phase at write
  notebookNotes?: NotebookNote[];
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
        // Migrate: ensure event log arrays exist
        if (!parsed.deathRecords) parsed.deathRecords = [];
        if (!parsed.travelerEvents) parsed.travelerEvents = [];
        // Migrate: ensure notebookNotes array exists
        if (!parsed.notebookNotes) parsed.notebookNotes = [];
        // Migrate: backfill game phase. Existing in-progress games predate
        // the phase concept and were operating as a day, so default to 'day'.
        if (parsed.phase !== 'day' && parsed.phase !== 'night') {
          parsed.phase = 'day';
        }
        // Migrate: backfill each death record's phase, derived from its type
        // (night deaths happened at night; executions and exiles at day).
        if (Array.isArray(parsed.deathRecords)) {
          parsed.deathRecords = parsed.deathRecords.map((dr: DeathRecord) => {
            if (dr.phase === 'day' || dr.phase === 'night') {
              return dr;
            }
            return { ...dr, phase: dr.type === 'night' ? 'night' : 'day' };
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
      phase: 'night',
      players: playerNames.map((name, i) => ({
        id: `player-${i}`,
        name,
        isAlive: true,
        status: 'alive' as PlayerStatus,
        notes: "",
        claims: [],
        isTraveler: i >= travelerStartIndex,
      })),
      notebookNotes: [],
      script: script || null,
    };
    saveGame(newGame);
    return newGame;
  }, [saveGame]);

  const endGame = useCallback(() => {
    saveGame(null);
  }, [saveGame]);

  const playAgain = useCallback(() => {
    if (!game) return;
    
    // Keep non-traveler players, reset their game state
    const resetPlayers = game.players
      .filter(p => !p.isTraveler)
      .map(p => ({
        ...p,
        isAlive: true,
        status: 'alive' as PlayerStatus,
        notes: '',
        claims: [],
        claimRecords: [],
      }));
    
    const newGame: PlayerGame = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      playerCount: resetPlayers.length,
      breakdown: getBreakdown(resetPlayers.length),
      players: resetPlayers,
      currentDay: 1,
      phase: 'night',
      deathRecords: [],
      travelerEvents: [],
      script: game.script, // Keep script selection
      gameNotes: '',
      notebookNotes: [],
    };
    
    saveGame(newGame);
  }, [game, saveGame]);

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
    
    const newClaimRecord: ClaimRecord = {
      characterId,
      addedAt: new Date().toISOString(),
      day: game.currentDay,
    };
    
    const existingRecords = player.claimRecords || [];
    updatePlayer(playerId, { 
      claims: [...player.claims, characterId],
      claimRecords: [...existingRecords, newClaimRecord],
    });
  }, [game, updatePlayer]);
  
  const addMultipleClaims = useCallback((playerId: string, characterIds: string[]) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    
    // Filter out any already-claimed characters
    const newCharacterIds = characterIds.filter(id => !player.claims.includes(id));
    if (newCharacterIds.length === 0) return;
    
    const timestamp = new Date().toISOString();
    const newClaimRecords: ClaimRecord[] = newCharacterIds.map(characterId => ({
      characterId,
      addedAt: timestamp,
      day: game.currentDay,
    }));
    
    const existingRecords = player.claimRecords || [];
    updatePlayer(playerId, { 
      claims: [...player.claims, ...newCharacterIds],
      claimRecords: [...existingRecords, ...newClaimRecords],
    });
  }, [game, updatePlayer]);

  const removeClaim = useCallback((playerId: string, characterId: string) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    // Keep claimRecords consistent with claims membership. Natural array order
    // means removing claims[0] promotes the next claim to primary.
    const existingRecords = player.claimRecords ?? [];
    updatePlayer(playerId, {
      claims: player.claims.filter(c => c !== characterId),
      claimRecords: existingRecords.filter(r => r.characterId !== characterId),
    });
  }, [game, updatePlayer]);

  const toggleAlive = useCallback((playerId: string) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    const newStatus: PlayerStatus = player.status === 'alive' ? 'dead' : 'alive';
    const newIsAlive = newStatus === 'alive';
    
    // If player is dying (not being resurrected), record a death stamped with
    // the current phase (day = execution, night = night kill).
    if (!newIsAlive && player.status === 'alive') {
      // Replace (not skip) any existing record for the same player on the same
      // day and phase. A revive then re-kill in the SAME phase (e.g. day
      // execution -> revive -> exile) must update the latest death type; a
      // re-kill in a LATER phase of the same day (night kill -> revive -> day
      // execution) keeps both, since their phases differ. This also prevents
      // duplicate records from a double-fire of the same transition.
      const newDeathRecord: DeathRecord = {
        playerId,
        day: game.currentDay,
        type: game.phase === 'day' ? 'execution' : 'night',
        phase: game.phase,
        timestamp: new Date().toISOString(),
      };

      const newGame = {
        ...game,
        players: game.players.map(p =>
          p.id === playerId
            ? { ...p, isAlive: newIsAlive, status: newStatus }
            : p
        ),
        deathRecords: [
          ...(game.deathRecords || []).filter(
            d => !(d.playerId === playerId && d.day === game.currentDay && d.phase === game.phase)
          ),
          newDeathRecord,
        ],
      };
      saveGame(newGame);
      return;
    }
    
    updatePlayer(playerId, { isAlive: newIsAlive, status: newStatus });
  }, [game, updatePlayer, saveGame]);

  const setPlayerStatus = useCallback((playerId: string, status: PlayerStatus) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    const newIsAlive = status === 'alive';

    // Stamp a phase-aware death record when a living player transitions to a
    // death state ('dead' or 'exiled'). 'left' is not a death. Resurrecting
    // back to 'alive' records nothing.
    const isDeathTransition =
      player.status === 'alive' && (status === 'dead' || status === 'exiled');
    if (isDeathTransition) {
      // Replace (not skip) any existing record for the same player on the same
      // day and phase, so a revive then re-kill in the same phase (e.g. day
      // execution -> revive -> exile) updates the latest death type. A re-kill
      // in a later phase of the same day keeps both records (phases differ).
      const deathType: DeathRecord['type'] =
        status === 'exiled'
          ? 'exile'
          : game.phase === 'day'
            ? 'execution'
            : 'night';
      const newDeathRecord: DeathRecord = {
        playerId,
        day: game.currentDay,
        type: deathType,
        phase: game.phase,
        timestamp: new Date().toISOString(),
      };
      saveGame({
        ...game,
        players: game.players.map(p =>
          p.id === playerId
            ? { ...p, isAlive: newIsAlive, status }
            : p
        ),
        deathRecords: [
          ...(game.deathRecords || []).filter(
            d => !(d.playerId === playerId && d.day === game.currentDay && d.phase === game.phase)
          ),
          newDeathRecord,
        ],
      });
      return;
    }

    updatePlayer(playerId, { isAlive: newIsAlive, status });
  }, [game, updatePlayer, saveGame]);

  const setNotes = useCallback((playerId: string, notes: string) => {
    updatePlayer(playerId, { notes });
  }, [updatePlayer]);

  // Advance the timeline one chapter: Night N -> Day N -> Night N+1 -> Day N+1.
  // night -> day keeps the same day number; day -> night increments the day.
  const advancePhase = useCallback(() => {
    if (!game) return;
    if (game.phase === 'night') {
      saveGame({ ...game, phase: 'day' });
    } else {
      saveGame({ ...game, currentDay: (game.currentDay ?? 1) + 1, phase: 'night' });
    }
  }, [game, saveGame]);

  // Regress one chapter, the reverse of advancePhase. Day N -> Night N (same
  // day); Night N -> Day N-1. Never regress before Night 1.
  const regressPhase = useCallback(() => {
    if (!game) return;
    if (game.phase === 'day') {
      saveGame({ ...game, phase: 'night' });
    } else {
      // Already at night; the previous chapter is the prior day's daytime.
      if ((game.currentDay ?? 1) <= 1) return; // Night 1 is the start
      saveGame({ ...game, currentDay: (game.currentDay ?? 1) - 1, phase: 'day' });
    }
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

  const reversePlayers = useCallback(() => {
    if (!game) return;
    saveGame({ ...game, players: [...game.players].reverse() });
  }, [game, saveGame]);

  const getDefaultCirclePositions = useCallback((playerCount: number) => {
    const gapDegrees = 60;
    const arcDegrees = 360 - gapDegrees;
    const startAngle = -90 + gapDegrees / 2;
    const stTopRatio = 0.075;

    return Array.from({ length: playerCount }, (_, index) => {
      const angle = (startAngle + (index / (playerCount - 1 || 1)) * arcDegrees) * (Math.PI / 180);
      const cx = 0.5 + 0.4 * Math.cos(angle);
      const cy = (0.5 + stTopRatio) + 0.4 * Math.sin(angle);
      return { x: cx, y: cy };
    });
  }, []);

  const sortPlayersClockwise = useCallback((players: GamePlayer[]): GamePlayer[] => {
    const centerX = 0.5;
    const centerY = 0.55;
    return [...players].sort((a, b) => {
      const ax = a.circleX ?? centerX;
      const ay = a.circleY ?? centerY;
      const bx = b.circleX ?? centerX;
      const by = b.circleY ?? centerY;
      const angleA = Math.atan2(ax - centerX, -(ay - centerY));
      const angleB = Math.atan2(bx - centerX, -(by - centerY));
      const normA = angleA < 0 ? angleA + 2 * Math.PI : angleA;
      const normB = angleB < 0 ? angleB + 2 * Math.PI : angleB;
      return normA - normB;
    });
  }, []);

  const setCirclePosition = useCallback((playerId: string, x: number, y: number) => {
    if (!game) return;
    const defaults = getDefaultCirclePositions(game.players.length);
    const newPlayers = game.players.map((p, i) => {
      if (p.id === playerId) return { ...p, circleX: x, circleY: y };
      if (p.circleX === undefined || p.circleY === undefined) {
        return { ...p, circleX: defaults[i].x, circleY: defaults[i].y };
      }
      return p;
    });
    const sorted = sortPlayersClockwise(newPlayers);
    saveGame({ ...game, players: sorted });
  }, [game, saveGame, sortPlayersClockwise, getDefaultCirclePositions]);

  const setMultipleCirclePositions = useCallback((updates: { playerId: string; x: number; y: number }[]) => {
    if (!game) return;
    const updateMap = new Map(updates.map(u => [u.playerId, { x: u.x, y: u.y }]));
    const defaults = getDefaultCirclePositions(game.players.length);
    const newPlayers = game.players.map((p, i) => {
      const update = updateMap.get(p.id);
      if (update) return { ...p, circleX: update.x, circleY: update.y };
      if (p.circleX === undefined || p.circleY === undefined) {
        return { ...p, circleX: defaults[i].x, circleY: defaults[i].y };
      }
      return p;
    });
    const sorted = sortPlayersClockwise(newPlayers);
    saveGame({ ...game, players: sorted });
  }, [game, saveGame, sortPlayersClockwise, getDefaultCirclePositions]);

  const resetCirclePositions = useCallback(() => {
    if (!game) return;
    const newPlayers = game.players.map(p => {
      const { circleX, circleY, ...rest } = p;
      return rest;
    });
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
    const timestamp = new Date().toISOString();
    const travelerName = name || `Traveler ${travelerCount + 1}`;
    const travelerId = `traveler-${Date.now()}`;
    
    const newTraveler: GamePlayer = {
      id: travelerId,
      name: travelerName,
      isAlive: true,
      status: 'alive',
      notes: "",
      claims: initialClaims,
      claimRecords: initialClaims.map(c => ({ characterId: c, addedAt: timestamp, day: game.currentDay })),
      isTraveler: true,
      joinedAt: timestamp,
      joinedDay: game.currentDay,
    };
    
    const travelerEvent: TravelerEvent = {
      playerId: travelerId,
      playerName: travelerName,
      type: 'joined',
      day: game.currentDay,
      timestamp,
      characterId: initialClaims[0], // First claim is typically the traveler character
    };
    
    saveGame({ 
      ...game, 
      players: [...game.players, newTraveler],
      travelerEvents: [...(game.travelerEvents || []), travelerEvent],
    });
  }, [game, saveGame]);

  const convertToTraveler = useCallback((playerId: string) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player || player.isTraveler) return; // Already a traveler or not found
    
    const timestamp = new Date().toISOString();
    
    // Record traveler joined event
    const travelerEvent: TravelerEvent = {
      playerId,
      playerName: player.name,
      type: 'joined',
      day: game.currentDay,
      timestamp,
      characterId: player.claims[0],
    };
    
    // Update the player to be a traveler
    const updatedPlayers = game.players.map(p => 
      p.id === playerId 
        ? { 
            ...p, 
            isTraveler: true, 
            joinedAt: timestamp,
            joinedDay: game.currentDay,
          } 
        : p
    );
    
    saveGame({ 
      ...game, 
      players: updatedPlayers,
      playerCount: updatedPlayers.filter(p => !p.isTraveler).length,
      travelerEvents: [...(game.travelerEvents || []), travelerEvent],
    });
  }, [game, saveGame]);

  const removeTraveler = useCallback((playerId: string) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player || !player.isTraveler) return; // Only Travelers can be removed
    
    // Record traveler left event
    const travelerEvent: TravelerEvent = {
      playerId,
      playerName: player.name,
      type: 'left',
      day: game.currentDay,
      timestamp: new Date().toISOString(),
      characterId: player.claims[0],
    };
    
    saveGame({ 
      ...game, 
      players: game.players.filter(p => p.id !== playerId),
      travelerEvents: [...(game.travelerEvents || []), travelerEvent],
    });
  }, [game, saveGame]);

  const setGameNotes = useCallback((notes: string) => {
    if (!game) return;
    saveGame({ ...game, gameNotes: notes });
  }, [game, saveGame]);

  const addNotebookNote = useCallback((text: string) => {
    if (!game) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const note: NotebookNote = {
      id: crypto.randomUUID(),
      day: game.currentDay,
      phase: game.phase,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    saveGame({ ...game, notebookNotes: [...(game.notebookNotes ?? []), note] });
  }, [game, saveGame]);

  const removeNotebookNote = useCallback((id: string) => {
    if (!game) return;
    saveGame({ ...game, notebookNotes: (game.notebookNotes ?? []).filter(n => n.id !== id) });
  }, [game, saveGame]);

  const addPlayer = useCallback((name: string, insertAfterPlayerId: string | null) => {
    if (!game) return;
    
    const newPlayer: GamePlayer = {
      id: `player-${Date.now()}`,
      name: name || `Player ${game.players.length + 1}`,
      isAlive: true,
      status: 'alive',
      notes: "",
      claims: [],
      claimRecords: [],
      isTraveler: false,
    };
    
    let newPlayers: GamePlayer[];
    if (insertAfterPlayerId === null) {
      newPlayers = [newPlayer, ...game.players];
    } else if (insertAfterPlayerId === '__end__') {
      newPlayers = [...game.players, newPlayer];
    } else {
      const insertIndex = game.players.findIndex(p => p.id === insertAfterPlayerId);
      if (insertIndex === -1) {
        newPlayers = [...game.players, newPlayer];
      } else {
        newPlayers = [
          ...game.players.slice(0, insertIndex + 1),
          newPlayer,
          ...game.players.slice(insertIndex + 1),
        ];
      }
    }
    
    saveGame({ 
      ...game, 
      players: newPlayers,
      playerCount: newPlayers.filter(p => !p.isTraveler).length,
    });
  }, [game, saveGame]);

  const removePlayer = useCallback((playerId: string) => {
    if (!game) return;
    if (game.players.length <= 1) return;
    
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    
    const newPlayers = game.players.filter(p => p.id !== playerId);
    
    // Clean up death records that reference the removed player
    const cleanedDeathRecords = (game.deathRecords || []).filter(dr => dr.playerId !== playerId);
    
    saveGame({ 
      ...game, 
      players: newPlayers,
      playerCount: newPlayers.filter(p => !p.isTraveler).length,
      deathRecords: cleanedDeathRecords,
    });
  }, [game, saveGame]);

  return {
    game,
    isLoading,
    createGame,
    endGame,
    playAgain,
    updatePlayer,
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
  };
}
