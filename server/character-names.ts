import { ALL_CHARACTERS } from "../client/src/lib/game-data";

// Canonical, server-owned list of valid character names. The scan endpoint
// constrains Claude to these names instead of trusting a client-supplied list,
// so the route can't be abused as a general-purpose extraction tool.
export const VALID_CHARACTER_NAMES: string[] = ALL_CHARACTERS.map((c) => c.name);
