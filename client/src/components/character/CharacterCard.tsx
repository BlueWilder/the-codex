import { getJinxesForCharacter, type Character } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { teamCard } from "@/lib/team-style";
import { NightBadges } from "@/components/character/NightBadges";
import { JinxBadge } from "@/components/character/JinxBadge";
import { JinxList } from "@/components/character/JinxList";
import { TeamBadge } from "@/components/character/TeamBadge";
import { ChevronDown, Settings, Moon, Quote, Lightbulb, Sword, Eye, Wand2, Plus, Minus } from "lucide-react";

export function CharacterCard({ char, isExpanded, onToggle }: { 
  char: Character; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  const jinxes = getJinxesForCharacter(char.id);
  
  const getTeamColor = (team: string) => teamCard(team);

  return (
    <motion.div 
      id={char.id}
      layout
      onClick={onToggle}
      className={cn(
        "p-4 rounded-xl border transition-colors cursor-pointer select-none",
        getTeamColor(char.team),
        isExpanded && "ring-1 ring-amber-500/50"
      )}
      data-testid={`card-character-${char.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-fraunces text-xl font-bold tracking-normal">
          <a href={`#${char.id}`} onClick={(e) => e.stopPropagation()} className="hover:underline decoration-current/40">
            {char.name}
          </a>
        </h3>
        <div className="flex items-center gap-2">
          <TeamBadge team={char.team} variant="label" />
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 opacity-50" />
          </motion.div>
        </div>
      </div>
      
      <p className="text-base font-serif leading-[1.58] opacity-90 pl-3 border-l-2 border-amber-500/40">{char.ability}</p>
      
      <div className="mt-3 flex flex-wrap gap-2">
        <NightBadges char={char} />
        {char.setup && (
          <span className="text-[10px] bg-purple-900/40 px-2 py-0.5 rounded text-purple-300 border border-purple-700/30 flex items-center gap-1">
            <Settings className="w-3.5 h-3.5" /> Setup
          </span>
        )}
        <JinxBadge count={jinxes.length} />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-current/20 space-y-6 md:space-y-5">
              {(char.firstNightOrder !== null || char.otherNightOrder !== null) && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-fraunces font-semibold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                    <Moon className="w-4 h-4 md:w-3 md:h-3" /> Night Order
                  </h4>
                  <div className="flex flex-wrap gap-3 text-base md:text-sm">
                    {char.firstNightOrder !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">First Night:</span>
                        <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-amber-300">#{char.firstNightOrder}</span>
                      </div>
                    )}
                    {char.otherNightOrder !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Other Nights:</span>
                        <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-amber-300">#{char.otherNightOrder}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {char.reminders.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-fraunces font-semibold uppercase tracking-wider opacity-80">Reminder Tokens</h4>
                  <div className="flex flex-wrap gap-2">
                    {char.reminders.map((reminder, idx) => (
                      <span 
                        key={idx}
                        className="text-sm md:text-xs bg-black/40 px-3 py-1.5 md:px-2 md:py-1 rounded-full border border-current/20"
                      >
                        {reminder}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <JinxList char={char} jinxes={jinxes} />

              {char.setup && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-fraunces font-semibold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                    <Settings className="w-4 h-4 md:w-3 md:h-3 text-purple-400" /> Setup Effect
                  </h4>
                  <p className="text-sm md:text-xs opacity-80">
                    This character modifies the game setup. Check the ability for details.
                  </p>
                </div>
              )}

              {/* Flavor Quote */}
              {char.flavorQuote && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-fraunces font-semibold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                    <Quote className="w-4 h-4 md:w-3 md:h-3 text-amber-400" /> Flavor
                  </h4>
                  <p className="text-base md:text-sm font-serif italic opacity-80 pl-4 md:pl-3 border-l-2 border-amber-700/50">
                    {char.flavorQuote}
                  </p>
                </div>
              )}

              {/* Extended Summary */}
              {char.extendedSummary && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-fraunces font-semibold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 md:w-3 md:h-3 text-blue-400" /> How It Works
                  </h4>
                  <div className="text-base md:text-sm font-serif opacity-90 space-y-3 md:space-y-2 leading-relaxed">
                    {char.extendedSummary.split('\n\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips and Tricks */}
              {char.tipsAndTricks && char.tipsAndTricks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-fraunces font-semibold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 md:w-3 md:h-3 text-yellow-400" /> Tips & Tricks
                  </h4>
                  <ul className="text-sm md:text-xs space-y-2.5 md:space-y-1.5 opacity-90">
                    {char.tipsAndTricks.map((tip, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-yellow-500/70 shrink-0">-</span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bluffing As (for good characters to bluff) */}
              {char.bluffingAs && char.bluffingAs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-fraunces font-semibold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                    <Sword className="w-4 h-4 md:w-3 md:h-3 text-red-400" /> Bluffing as {char.name}
                  </h4>
                  <ul className="text-sm md:text-xs space-y-2.5 md:space-y-1.5 opacity-90">
                    {char.bluffingAs.map((tip, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-red-400/70 shrink-0">-</span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fighting The (for good characters fighting evil) */}
              {char.fightingThe && char.fightingThe.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-fraunces font-semibold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                    <Sword className="w-4 h-4 md:w-3 md:h-3 text-green-400" /> Fighting the {char.name}
                  </h4>
                  <ul className="text-sm md:text-xs space-y-2.5 md:space-y-1.5 opacity-90">
                    {char.fightingThe.map((tip, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-green-400/70 shrink-0">-</span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* How to Run (Storyteller instructions) - Collapsible Accordion */}
              {char.howToRun && (
                <Accordion type="single" collapsible className="w-full" onClick={(e) => e.stopPropagation()}>
                  <AccordionItem value="how-to-run" className="border-none">
                    <AccordionTrigger 
                      className="py-2 hover:no-underline [&>svg]:hidden"
                      data-testid={`accordion-how-to-run-${char.id}`}
                    >
                      <h4 className="text-sm md:text-xs font-fraunces font-semibold uppercase tracking-wider flex items-center gap-1.5 text-[#c79fe6]">
                        <Wand2 className="w-4 h-4 md:w-3 md:h-3 text-[#c79fe6]" /> How to Run
                        <span className="font-sans text-[9px] font-semibold normal-case tracking-wide px-1.5 py-0.5 rounded-full bg-[#3d2f57]/50 border border-[#3d2f57] text-[#c79fe6]">Storyteller</span>
                        <Plus className="w-4 h-4 md:w-3 md:h-3 text-[#c79fe6] transition-transform [[data-state=open]_&]:hidden" />
                        <Minus className="w-4 h-4 md:w-3 md:h-3 text-[#c79fe6] transition-transform [[data-state=closed]_&]:hidden" />
                      </h4>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm md:text-xs rounded-lg p-3 md:p-3 bg-[#1b1626] border border-[#3d2f57]">
                        <div className="space-y-2 leading-[1.58] text-[#c79fe6]">
                          {char.howToRun.split('\n\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph.replace(/\n/g, ' ')}</p>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
