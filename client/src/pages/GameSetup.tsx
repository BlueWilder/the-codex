import { Layout } from "@/components/ui/Layout";
import { useState } from "react";
import { useCreateGame } from "@/hooks/use-games";
import { useScripts } from "@/hooks/use-scripts";
import { useLocation } from "wouter";
import { Users, ChevronRight, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GameSetup() {
  const [, setLocation] = useLocation();
  const { mutateAsync: createGame, isPending } = useCreateGame();
  const { data: scripts, isLoading: scriptsLoading } = useScripts();
  
  const [step, setStep] = useState(1);
  const [selectedScriptId, setSelectedScriptId] = useState<number | null>(null);
  const [playerCount, setPlayerCount] = useState(8);
  const [storytellerName, setStorytellerName] = useState("");
  
  const selectedScript = scripts?.find(s => s.id === selectedScriptId);

  const handleCreate = async () => {
    if (!selectedScriptId) return;
    
    try {
      // Create initial game state - in a real app this would be more complex
      const gameState = {
        phase: 'setup',
        players: Array(playerCount).fill(null).map((_, i) => ({
          id: `player-${i}`,
          name: `Player ${i+1}`,
          character: null,
          isAlive: true
        })),
        storyteller: storytellerName || "Storyteller"
      };

      const game = await createGame({
        scriptId: selectedScriptId,
        name: `${storytellerName ? storytellerName + "'s" : "New"} Game`,
        playerCount,
        gameState,
        isFinished: false
      });

      setLocation(`/game-tracker?id=${game.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-4xl font-display text-amber-500 mb-8 text-center">Ritual Preparation</h1>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12 space-x-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors",
                step === i ? "bg-amber-600 border-amber-600 text-black" : 
                step > i ? "bg-amber-900/40 border-amber-600 text-amber-500" :
                "bg-transparent border-gray-800 text-gray-600"
              )}>
                {i}
              </div>
              {i < 3 && <div className={cn("w-12 h-0.5 mx-2", step > i ? "bg-amber-800" : "bg-gray-800")} />}
            </div>
          ))}
        </div>

        <div className="bg-card border border-amber-900/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden min-h-[400px]">
          {/* STEP 1: Script Selection */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-display text-amber-100 text-center">Select a script</h2>
              {scriptsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {scripts?.map(script => (
                    <button
                      key={script.id}
                      onClick={() => setSelectedScriptId(script.id)}
                      className={cn(
                        "text-left p-4 rounded-xl border transition-all duration-200 w-full max-w-md",
                        selectedScriptId === script.id
                          ? "bg-amber-900/30 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                          : "bg-black/20 border-amber-900/20 hover:border-amber-700/50"
                      )}
                    >
                      <div className="font-bold text-lg text-amber-100 font-display">{script.name}</div>
                      <div className="text-sm text-muted-foreground">{script.description}</div>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-end pt-4">
                <button
                  disabled={!selectedScriptId}
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-amber-600 text-black font-bold rounded-lg hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Player Count */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-display text-amber-100 text-center">Gather the Souls</h2>
              
              <div className="space-y-4">
                <label className="text-muted-foreground block text-sm font-bold uppercase tracking-widest text-center">Number of Players</label>
                <div className="flex items-center gap-8 justify-center py-8">
                  <button 
                    onClick={() => setPlayerCount(Math.max(5, playerCount - 1))}
                    className="w-12 h-12 rounded-full border border-amber-900/50 hover:bg-amber-900/20 text-2xl text-amber-500 flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <div className="text-6xl font-display text-amber-100 w-24 text-center">
                    {playerCount}
                  </div>
                  <button 
                    onClick={() => setPlayerCount(Math.min(20, playerCount + 1))}
                    className="w-12 h-12 rounded-full border border-amber-900/50 hover:bg-amber-900/20 text-2xl text-amber-500 flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-center text-sm text-muted-foreground font-serif italic">
                  Recommended: 8-12 players. Up to 20 with Travellers.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-muted-foreground hover:text-amber-500 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 bg-amber-600 text-black font-bold rounded-lg hover:bg-amber-500 transition-colors flex items-center gap-2"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Final Details */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-display text-amber-100">The Storyteller</h2>
              
              <div className="space-y-2">
                <label className="text-muted-foreground block text-sm font-bold uppercase tracking-widest">Your Name</label>
                <input
                  type="text"
                  value={storytellerName}
                  onChange={(e) => setStorytellerName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-black/20 border border-amber-900/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="bg-black/20 p-4 rounded-lg border border-amber-900/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Script:</span>
                  <span className="text-amber-500 font-bold">{selectedScript?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Players:</span>
                  <span className="text-amber-500 font-bold">{playerCount}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="text-muted-foreground hover:text-amber-500 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isPending}
                  className="px-8 py-3 bg-red-800 text-white font-bold rounded-lg hover:bg-red-700 shadow-lg shadow-red-900/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isPending ? "Awakening..." : "Begin Game"} <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
