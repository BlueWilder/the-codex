import { useState, useEffect, useCallback } from "react";

export type PlayerStatus = 'alive' | 'dead' | 'left' | 'exiled';

export interface PlayerVote {
  playerId: string;
  voted: boolean;
}

export type NominationResult = 'failed' | 'on_the_block' | 'passed' | 'executed';

export interface Nomination {
  id: string;
  day: number;
  nomineeId: string;
  nominatorId: string;
  votes?: PlayerVote[]; // Only if Full Vote Record used
  passed: boolean; // Whether the nomination passed (enough votes to execute)
  yesVotes: number; // Number of yes votes
  votesNeeded: number; // Votes needed at the time of nomination
  isQuickLog?: boolean; // True if Quick Log was used
  result?: NominationResult; // Quick log result - failed, passed (on block), or executed
}

export interface ExileVote {
  id: string;
  day: number;
  travelerId: string;
  votes: PlayerVote[];
  passed: boolean;
}

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

export interface GhostVoteEvent {
  playerId: string;
  day: number;
  timestamp: string;
  nominationId: string;
}

export interface GamePlayer {
  id: string;
  name: string;
  isAlive: boolean;
  status: PlayerStatus;
  hasGhostVote: boolean;
  notes: string;
  claims: string[]; // Legacy: simple character IDs
  claimRecords?: ClaimRecord[]; // New: with timestamps
  isTraveler?: boolean;
  joinedAt?: string; // When traveler joined
  joinedDay?: number;
  trust?: number; // 0-100 scale, 50 = neutral
  circleX?: number; // Normalized 0-1 position on circle canvas
  circleY?: number;
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
  phase: 'day' | 'night'; // Night N = (day N, 'night'); Day N = (day N, 'day')
  script?: GameScriptRef | null;
  // Event logs for Game Log view
  deathRecords?: DeathRecord[];
  travelerEvents?: TravelerEvent[];
  ghostVoteEvents?: GhostVoteEvent[];
  // Free-form game notes
  gameNotes?: string;
  // Chopping block - nomination IDs of players currently on the block
  choppingBlock?: string[];
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
        // Migrate: ensure event log arrays exist
        if (!parsed.deathRecords) parsed.deathRecords = [];
        if (!parsed.travelerEvents) parsed.travelerEvents = [];
        if (!parsed.ghostVoteEvents) parsed.ghostVoteEvents = [];
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

  const playAgain = useCallback(() => {
    if (!game) return;
    
    // Keep non-traveler players, reset their game state
    const resetPlayers = game.players
      .filter(p => !p.isTraveler)
      .map(p => ({
        ...p,
        isAlive: true,
        status: 'alive' as PlayerStatus,
        hasGhostVote: true,
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
      nominations: [],
      exileVotes: [],
      deathRecords: [],
      travelerEvents: [],
      ghostVoteEvents: [],
      script: game.script, // Keep script selection
      gameNotes: '',
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

  // Make a claim the primary candidate by moving it to claims[0] while keeping
  // the relative order of the rest. claimRecords membership is unchanged (it is
  // not order-significant). No-op if the id is already primary or not present.
  const setPrimaryCandidate = useCallback((playerId: string, characterId: string) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    const index = player.claims.indexOf(characterId);
    if (index <= 0) return; // already primary (0) or absent (-1)
    const reordered = [characterId, ...player.claims.filter(c => c !== characterId)];
    updatePlayer(playerId, { claims: reordered });
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
    
    const nominationId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    // Calculate votes needed
    const aliveCount = game.players.filter(p => p.status === 'alive').length;
    const votesNeeded = Math.ceil(aliveCount / 2);
    const yesVotes = votes.filter(v => v.voted).length;
    const meetsThreshold = yesVotes >= votesNeeded;
    
    // Get current block state
    const currentBlock = game.choppingBlock || [];
    const blockNominations = currentBlock
      .map(id => game.nominations.find(n => n.id === id))
      .filter((n): n is Nomination => n !== undefined);
    const currentBlockVotes = blockNominations.length > 0 ? blockNominations[0].yesVotes : 0;
    
    // Determine result based on block logic
    let result: NominationResult = 'failed';
    let newBlock = [...currentBlock];
    let updatedNominations = [...game.nominations];
    
    if (meetsThreshold) {
      if (currentBlock.length === 0) {
        // First to reach threshold - goes on block
        result = 'on_the_block';
        newBlock = [nominationId];
      } else if (yesVotes > currentBlockVotes) {
        // More votes than current block - replaces them
        result = 'on_the_block';
        // Update previous block holders to 'passed'
        updatedNominations = updatedNominations.map(nom =>
          currentBlock.includes(nom.id)
            ? { ...nom, result: 'passed' as NominationResult }
            : nom
        );
        newBlock = [nominationId];
      } else if (yesVotes === currentBlockVotes) {
        // Ties current block - joins them (signals no execution)
        result = 'on_the_block';
        newBlock = [...currentBlock, nominationId];
      } else {
        // Fewer votes than current block - fails
        result = 'failed';
      }
    }
    
    const newNomination: Nomination = {
      id: nominationId,
      day: game.currentDay,
      nomineeId,
      nominatorId,
      votes,
      passed: meetsThreshold,
      yesVotes,
      votesNeeded,
      result,
    };
    
    // Track ghost vote events
    const newGhostVoteEvents: GhostVoteEvent[] = [];
    
    // Mark ghost votes as spent for dead non-Traveler players who voted yes
    let updatedPlayers = game.players.map(p => {
      const playerVote = votes.find(v => v.playerId === p.id);
      // If dead, non-Traveler, has ghost vote, and voted yes - spend it
      if (p.status === 'dead' && !p.isTraveler && p.hasGhostVote && playerVote?.voted) {
        newGhostVoteEvents.push({
          playerId: p.id,
          day: game.currentDay,
          timestamp,
          nominationId,
        });
        return { ...p, hasGhostVote: false };
      }
      return p;
    });
    
    saveGame({ 
      ...game, 
      players: updatedPlayers,
      nominations: [...updatedNominations, newNomination],
      choppingBlock: newBlock,
      ghostVoteEvents: [...(game.ghostVoteEvents || []), ...newGhostVoteEvents],
    });
  }, [game, saveGame, hasBeenNominatedToday, hasNominatedToday]);

  const createQuickNomination = useCallback((
    nomineeId: string, 
    nominatorId: string, 
    yesVotes: number,
    result: NominationResult
  ) => {
    if (!game) return;
    if (hasBeenNominatedToday(nomineeId) || hasNominatedToday(nominatorId)) return;
    
    const nominationId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    const aliveCount = game.players.filter(p => p.status === 'alive').length;
    const votesNeeded = Math.ceil(aliveCount / 2);
    const passed = result === 'passed' || result === 'executed' || result === 'on_the_block';
    
    // Get current block state for handling 'on_the_block' result
    const currentBlock = game.choppingBlock || [];
    const blockNominations = currentBlock
      .map(id => game.nominations.find(n => n.id === id))
      .filter((n): n is Nomination => n !== undefined);
    const currentBlockVotes = blockNominations.length > 0 ? blockNominations[0].yesVotes : 0;
    
    let newBlock = [...currentBlock];
    let updatedNominations = [...game.nominations];
    let finalResult = result;
    
    // Handle block logic for 'on_the_block' result
    if (result === 'on_the_block') {
      if (currentBlock.length === 0) {
        // First on block
        newBlock = [nominationId];
      } else if (yesVotes > currentBlockVotes) {
        // Replaces current block
        updatedNominations = updatedNominations.map(nom =>
          currentBlock.includes(nom.id)
            ? { ...nom, result: 'passed' as NominationResult }
            : nom
        );
        newBlock = [nominationId];
      } else if (yesVotes === currentBlockVotes) {
        // Ties current block
        newBlock = [...currentBlock, nominationId];
      } else {
        // Fewer votes - becomes 'passed' (survived but didn't make block)
        finalResult = 'passed';
      }
    } else if (result === 'executed') {
      // Clear block since execution is happening
      // Update any previous block holders to 'passed'
      updatedNominations = updatedNominations.map(nom =>
        currentBlock.includes(nom.id)
          ? { ...nom, result: 'passed' as NominationResult }
          : nom
      );
      newBlock = [];
    }
    
    const newNomination: Nomination = {
      id: nominationId,
      day: game.currentDay,
      nomineeId,
      nominatorId,
      passed,
      yesVotes,
      votesNeeded,
      isQuickLog: true,
      result: finalResult,
    };
    
    let updatedPlayers = game.players;
    const newDeathRecords: DeathRecord[] = [];
    
    // If result is 'executed', mark nominee as dead
    if (result === 'executed') {
      const nominee = updatedPlayers.find(p => p.id === nomineeId);
      if (nominee && nominee.status === 'alive') {
        newDeathRecords.push({
          playerId: nomineeId,
          day: game.currentDay,
          type: 'execution',
          phase: game.phase,
          timestamp,
          nominationId,
        });
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
      nominations: [...updatedNominations, newNomination],
      choppingBlock: newBlock,
      deathRecords: [...(game.deathRecords || []), ...newDeathRecords],
    });
  }, [game, saveGame, hasBeenNominatedToday, hasNominatedToday]);

  const deleteNomination = useCallback((nominationId: string) => {
    if (!game) return;
    saveGame({ ...game, nominations: game.nominations.filter(n => n.id !== nominationId) });
  }, [game, saveGame]);

  // Get current chopping block info
  const getChoppingBlock = useCallback(() => {
    if (!game) return { nominations: [], isTied: false };
    const blockIds = game.choppingBlock || [];
    const nominations = blockIds
      .map(id => game.nominations.find(n => n.id === id))
      .filter((n): n is Nomination => n !== undefined);
    return {
      nominations,
      isTied: nominations.length > 1,
    };
  }, [game]);

  // Clear the chopping block (no execution) - update all block nominations to 'passed'
  const clearChoppingBlock = useCallback(() => {
    if (!game) return;
    const blockIds = game.choppingBlock || [];
    
    const updatedNominations = game.nominations.map(nom => 
      blockIds.includes(nom.id) 
        ? { ...nom, result: 'passed' as NominationResult }
        : nom
    );
    
    saveGame({
      ...game,
      nominations: updatedNominations,
      choppingBlock: [],
    });
  }, [game, saveGame]);

  // Skip the day's execution and move on in a single transaction. Clearing the
  // block and advancing the phase both derive from the same game snapshot, so
  // they must be saved together or the second save would overwrite the first.
  const skipExecutionAndAdvancePhase = useCallback(() => {
    if (!game) return;
    const blockIds = game.choppingBlock || [];
    const updatedNominations = game.nominations.map(nom =>
      blockIds.includes(nom.id)
        ? { ...nom, result: 'passed' as NominationResult }
        : nom
    );
    // Mirror advancePhase: Night -> Day (same day); Day -> Night N+1.
    const isNight = game.phase === 'night';
    saveGame({
      ...game,
      nominations: updatedNominations,
      choppingBlock: [],
      currentDay: isNight ? (game.currentDay ?? 1) : (game.currentDay ?? 1) + 1,
      phase: isNight ? 'day' : 'night',
    });
  }, [game, saveGame]);

  // Execute from chopping block (only when single player on block)
  const executeFromBlock = useCallback(() => {
    if (!game) return;
    const blockIds = game.choppingBlock || [];
    if (blockIds.length !== 1) return; // Can only execute when single player on block
    
    const nominationId = blockIds[0];
    const nomination = game.nominations.find(n => n.id === nominationId);
    if (!nomination) return;
    
    const nominee = game.players.find(p => p.id === nomination.nomineeId);
    if (!nominee) return;
    
    const timestamp = new Date().toISOString();
    const newDeathRecords: DeathRecord[] = [];
    let updatedPlayers = game.players;
    
    // Mark player as dead
    if (nominee.status === 'alive') {
      newDeathRecords.push({
        playerId: nomination.nomineeId,
        day: game.currentDay,
        type: 'execution',
        phase: game.phase,
        timestamp,
        nominationId,
      });
      updatedPlayers = updatedPlayers.map(p => 
        p.id === nomination.nomineeId 
          ? { ...p, isAlive: false, status: 'dead' as PlayerStatus, hasGhostVote: !nominee.isTraveler }
          : p
      );
    }
    
    // Update nomination result to 'executed'
    const updatedNominations = game.nominations.map(nom => 
      nom.id === nominationId 
        ? { ...nom, result: 'executed' as NominationResult }
        : nom
    );
    
    saveGame({
      ...game,
      players: updatedPlayers,
      nominations: updatedNominations,
      deathRecords: [...(game.deathRecords || []), ...newDeathRecords],
      choppingBlock: [],
    });
  }, [game, saveGame]);

  const toggleAlive = useCallback((playerId: string) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    const newStatus: PlayerStatus = player.status === 'alive' ? 'dead' : 'alive';
    const newIsAlive = newStatus === 'alive';
    // Regular players get ghost vote when dying, Travelers don't
    const hasGhostVote = !newIsAlive && !player.isTraveler ? true : player.hasGhostVote;
    
    // If player is dying (not being resurrected), record a night death
    // (Executions are recorded separately in createNomination)
    if (!newIsAlive && player.status === 'alive') {
      // Check if this player was executed today - if so, don't double-record
      const wasExecutedToday = (game.deathRecords || []).some(
        d => d.playerId === playerId && d.day === game.currentDay && d.type === 'execution'
      );
      
      if (!wasExecutedToday) {
        const newDeathRecord: DeathRecord = {
          playerId,
          day: game.currentDay,
          type: 'night',
          phase: game.phase,
          timestamp: new Date().toISOString(),
        };
        
        const newGame = {
          ...game,
          players: game.players.map(p => 
            p.id === playerId 
              ? { ...p, isAlive: newIsAlive, status: newStatus, hasGhostVote }
              : p
          ),
          deathRecords: [...(game.deathRecords || []), newDeathRecord],
        };
        saveGame(newGame);
        return;
      }
    }
    
    updatePlayer(playerId, { isAlive: newIsAlive, status: newStatus, hasGhostVote });
  }, [game, updatePlayer, saveGame]);

  const setPlayerStatus = useCallback((playerId: string, status: PlayerStatus) => {
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    const newIsAlive = status === 'alive';
    // Travelers never get ghost votes
    const hasGhostVote = player.isTraveler ? false : (status === 'dead' ? true : player.hasGhostVote);

    // Stamp a phase-aware death record when a living player transitions to a
    // death state ('dead' or 'exiled'). 'left' is not a death. Resurrecting
    // back to 'alive' records nothing.
    const isDeathTransition =
      player.status === 'alive' && (status === 'dead' || status === 'exiled');
    if (isDeathTransition) {
      // Idempotent: skip if a death for this player on this day already exists
      // (e.g. written by the execution or toggleAlive paths).
      const alreadyRecorded = (game.deathRecords || []).some(
        d => d.playerId === playerId && d.day === game.currentDay
      );
      if (!alreadyRecorded) {
        const newDeathRecord: DeathRecord = {
          playerId,
          day: game.currentDay,
          type: status === 'exiled' ? 'exile' : 'night',
          phase: game.phase,
          timestamp: new Date().toISOString(),
        };
        saveGame({
          ...game,
          players: game.players.map(p =>
            p.id === playerId
              ? { ...p, isAlive: newIsAlive, status, hasGhostVote }
              : p
          ),
          deathRecords: [...(game.deathRecords || []), newDeathRecord],
        });
        return;
      }
    }

    updatePlayer(playerId, { isAlive: newIsAlive, status, hasGhostVote });
  }, [game, updatePlayer, saveGame]);

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

  const setTrust = useCallback((playerId: string, trust: number) => {
    updatePlayer(playerId, { trust: Math.max(0, Math.min(100, trust)) });
  }, [updatePlayer]);

  const nextDay = useCallback(() => {
    if (!game) return;
    saveGame({ ...game, currentDay: game.currentDay + 1 });
  }, [game, saveGame]);

  const prevDay = useCallback(() => {
    if (!game || game.currentDay <= 1) return;
    saveGame({ ...game, currentDay: game.currentDay - 1 });
  }, [game, saveGame]);

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
      hasGhostVote: false, // Travelers never get ghost votes
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
            hasGhostVote: false, // Travelers don't get ghost votes
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
      travelerEvents: [...(game.travelerEvents || []), travelerEvent],
    });
  }, [game, saveGame]);

  const createExileVote = useCallback((travelerId: string, votes: PlayerVote[]) => {
    if (!game) return;
    const traveler = game.players.find(p => p.id === travelerId);
    if (!traveler || !traveler.isTraveler) return;
    
    const timestamp = new Date().toISOString();
    
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
    const newDeathRecords: DeathRecord[] = [];
    const newTravelerEvents: TravelerEvent[] = [];
    
    if (passed) {
      updatedPlayers = game.players.map(p => 
        p.id === travelerId 
          ? { ...p, isAlive: false, status: 'exiled' as PlayerStatus, hasGhostVote: false }
          : p
      );
      
      newDeathRecords.push({
        playerId: travelerId,
        day: game.currentDay,
        type: 'exile',
        phase: game.phase,
        timestamp,
      });
      
      newTravelerEvents.push({
        playerId: travelerId,
        playerName: traveler.name,
        type: 'exiled',
        day: game.currentDay,
        timestamp,
        characterId: traveler.claims[0],
      });
    }
    
    saveGame({ 
      ...game, 
      players: updatedPlayers,
      exileVotes: [...game.exileVotes, newExileVote],
      deathRecords: [...(game.deathRecords || []), ...newDeathRecords],
      travelerEvents: [...(game.travelerEvents || []), ...newTravelerEvents],
    });
  }, [game, saveGame]);

  const getPlayerExileVotes = useCallback((playerId: string) => {
    if (!game) return [];
    return game.exileVotes.filter(e => e.travelerId === playerId);
  }, [game]);

  const setGameNotes = useCallback((notes: string) => {
    if (!game) return;
    saveGame({ ...game, gameNotes: notes });
  }, [game, saveGame]);

  const addPlayer = useCallback((name: string, insertAfterPlayerId: string | null) => {
    if (!game) return;
    
    const newPlayer: GamePlayer = {
      id: `player-${Date.now()}`,
      name: name || `Player ${game.players.length + 1}`,
      isAlive: true,
      status: 'alive',
      hasGhostVote: true, // New players start with ghost vote available (used when they die)
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
    
    // Clean up nominations: remove the player's votes and recalculate yesVotes
    const cleanedNominations = game.nominations.map(nom => {
      // Quick log nominations don't have individual votes
      if (!nom.votes || nom.isQuickLog) {
        return nom;
      }
      const filteredVotes = nom.votes.filter(v => v.playerId !== playerId);
      const newYesVotes = filteredVotes.filter(v => v.voted).length;
      // Keep the original votesNeeded/passed as historical record (reflects state at time of nomination)
      return {
        ...nom,
        votes: filteredVotes,
        yesVotes: newYesVotes,
      };
    });
    
    // Clean up exile votes: remove the player's votes
    const cleanedExileVotes = game.exileVotes.map(ev => {
      const filteredVotes = ev.votes.filter(v => v.playerId !== playerId);
      return {
        ...ev,
        votes: filteredVotes,
      };
    });
    
    // Clean up death records that reference the removed player
    const cleanedDeathRecords = (game.deathRecords || []).filter(dr => dr.playerId !== playerId);
    
    // Clean up ghost vote events for the removed player
    const cleanedGhostVoteEvents = (game.ghostVoteEvents || []).filter(gv => gv.playerId !== playerId);
    
    saveGame({ 
      ...game, 
      players: newPlayers,
      playerCount: newPlayers.filter(p => !p.isTraveler).length,
      nominations: cleanedNominations,
      exileVotes: cleanedExileVotes,
      deathRecords: cleanedDeathRecords,
      ghostVoteEvents: cleanedGhostVoteEvents,
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
    setPrimaryCandidate,
    toggleAlive,
    setPlayerStatus,
    toggleGhostVote,
    setNotes,
    nextDay,
    prevDay,
    advancePhase,
    regressPhase,
    reorderPlayers,
    reversePlayers,
    hasBeenNominatedToday,
    hasNominatedToday,
    getDayNominations,
    createNomination,
    createQuickNomination,
    deleteNomination,
    getChoppingBlock,
    clearChoppingBlock,
    skipExecutionAndAdvancePhase,
    executeFromBlock,
    clearScript,
    setScript,
    addTraveler,
    convertToTraveler,
    removeTraveler,
    createExileVote,
    getPlayerExileVotes,
    setGameNotes,
    addPlayer,
    removePlayer,
    setTrust,
    setCirclePosition,
    setMultipleCirclePositions,
    resetCirclePositions,
  };
}
