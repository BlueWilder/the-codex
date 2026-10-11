// Shared types for the game tracker. The game model types are defined beside
// the state hook that persists them, and re-exported here so the rest of the
// feature has one place to import them from.
export type {
  PlayerStatus,
  ClaimRecord,
  DeathRecord,
  TravelerEvent,
  NotebookNote,
  GamePlayer,
  GameScriptRef,
  PlayerGame,
} from "@/features/game/state/use-player-game";
