import { Layout } from "@/components/ui/Layout";
import { useState } from "react";
import { useGame } from "@/hooks/use-games";
import { useLocation } from "wouter";
import { ALL_CHARACTERS } from "@/lib/game-data";
import { Moon, Sun, Skull, Shield, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Types for local state
interface PlayerToken {
  id: string;
  name: string;
  characterId: string | null;
  isAlive: boolean;
  hasGhostVote: boolean;
  reminders: string[];
}

export default function GameTracker() {
  const [location] = useLocation();
  const gameId = parseInt(new URLSearchParams(location.split('?')[1]).get('id') || "0");
  
  const [phase, setPhase] = useState<'day' | 'night'>('setup');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  // Mock initial state since we don't have full backend persistence for complex game states yet
  const [players, setPlayers] = useState<PlayerToken[]>(
    Array(8).fill(null).map((_, i) => ({
      id: `p${i}`,
      name: `Player ${i+1}`,
      characterId: null,
      isAlive: true,
      hasGhostVote: true,
      reminders: []
    }))
  );

  const toggleAlive = (id: string) => {
    setPlayers(prev => prev.map(p => 
      p.id === id ? { ...p, isAlive: !p.isAlive } : p
    ));
  };

  const toggleGhostVote = (id: string) => {
    setPlayers(prev => prev.map(p => 
      p.id === id ? { ...p, hasGhostVote: !p.hasGhostVote } : p
    ));
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-140px)] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-card border border-amber-900/30 p-4 rounded-xl mb-6 shadow-lg">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setPhase(p => p === 'day' ? 'night' : 'day')}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                phase === 'day' 
                  ? "bg-amber-100 text-amber-600 shadow-[0_0_20px_rgba(251,191,36,0.4)]" 
                  : "bg-indigo-950 text-indigo-300 shadow-[0_0_20px_rgba(49,46,129,0.4)]"
              )}
            >
              {phase === 'day' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <div>
              <h1 className="text-xl font-display font-bold text-amber-500">
                {phase === 'day' ? "The Village Wakes" : "Night Falls"}
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                {phase === 'day' ? "Discussion Phase" : "Storyteller Phase"}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="text-right mr-4 hidden md:block">
              <div className="text-sm text-amber-200">Alive: {players.filter(p => p.isAlive).length}</div>
              <div className="text-xs text-muted-foreground">Votes: {players.filter(p => p.isAlive || p.hasGhostVote).length}</div>
            </div>
          </div>
        </div>

        {/* Main Grimoire Area */}
        <div className="flex-1 relative bg-black/40 rounded-3xl border border-amber-900/20 overflow-hidden shadow-inner">
          {/* Decorative Center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/7/70/Pentagram_interlaced.svg" 
              className="w-96 h-96 invert sepia"
              alt=""
            />
          </div>

          {/* Player Circle Layout */}
          <div className="absolute inset-0 m-8">
            {players.map((player, i) => {
              const angle = (i / players.length) * 2 * Math.PI - Math.PI / 2;
              const radius = 40; // percentage
              const left = 50 + radius * Math.cos(angle);
              const top = 50 + radius * Math.sin(angle);
              
              const character = ALL_CHARACTERS.find(c => c.id === player.characterId);
              
              return (
                <motion.div
                  key={player.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${left}%`, top: `${top}%` }}
                  layout
                >
                  <div 
                    onClick={() => setSelectedPlayer(player.id)}
                    className={cn(
                      "relative w-24 h-24 rounded-full border-4 transition-all cursor-pointer group hover:scale-105",
                      player.isAlive 
                        ? "bg-card border-amber-700 shadow-xl shadow-black/50" 
                        : "bg-gray-900 border-gray-700 grayscale opacity-80",
                      selectedPlayer === player.id && "ring-4 ring-amber-500/50 scale-110 z-10"
                    )}
                  >
                    {/* Character Token */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                      <span className="text-[10px] font-bold text-amber-200/80 uppercase tracking-wider truncate w-full mb-1">
                        {player.name}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-xs font-serif text-amber-500">
                        ?
                      </div>
                    </div>

                    {/* Shroud (Dead State Overlay) */}
                    {!player.isAlive && (
                      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                        <Skull className="w-8 h-8 text-gray-500" />
                      </div>
                    )}

                    {/* Vote Token */}
                    {!player.isAlive && player.hasGhostVote && (
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-900 rounded-full border-2 border-indigo-500 flex items-center justify-center shadow-lg">
                        <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Selected Player Drawer */}
        <AnimatePresence>
          {selectedPlayer && (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="absolute bottom-0 left-0 right-0 bg-card border-t border-amber-900/50 p-6 rounded-t-2xl shadow-2xl z-20 md:w-96 md:left-auto md:right-4 md:bottom-20 md:rounded-2xl md:border"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-display text-amber-500">
                  {players.find(p => p.id === selectedPlayer)?.name}
                </h3>
                <button 
                  onClick={() => setSelectedPlayer(null)}
                  className="text-muted-foreground hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                  onClick={() => toggleAlive(selectedPlayer)}
                  className={cn(
                    "p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors",
                    players.find(p => p.id === selectedPlayer)?.isAlive
                      ? "bg-red-950/30 border-red-900/50 text-red-400 hover:bg-red-900/40"
                      : "bg-emerald-950/30 border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/40"
                  )}
                >
                  {players.find(p => p.id === selectedPlayer)?.isAlive ? (
                    <>
                      <Skull className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase">Execute</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase">Revive</span>
                    </>
                  )}
                </button>

                <button 
                  onClick={() => toggleGhostVote(selectedPlayer)}
                  disabled={players.find(p => p.id === selectedPlayer)?.isAlive}
                  className={cn(
                    "p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
                    players.find(p => p.id === selectedPlayer)?.hasGhostVote
                      ? "bg-indigo-950/30 border-indigo-900/50 text-indigo-400"
                      : "bg-gray-800/30 border-gray-700 text-gray-400"
                  )}
                >
                  <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                    <div className="w-2 h-2 bg-current rounded-full" />
                  </div>
                  <span className="text-xs font-bold uppercase">Vote Token</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
