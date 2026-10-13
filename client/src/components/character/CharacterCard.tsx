import { getJinxesForCharacter, type Character } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { teamParchment } from "@/lib/team-style";
import { CharacterMedallion } from "@/components/character/CharacterMedallion";
import { NightBadges } from "@/components/character/NightBadges";
import { JinxBadge } from "@/components/character/JinxBadge";
import { JinxList } from "@/components/character/JinxList";
import { TeamBadge } from "@/components/character/TeamBadge";
import { ChevronDown, Settings, Wand2, Plus, Minus } from "lucide-react";

export function CharacterCard({ char, isExpanded, onToggle }: { 
  char: Character; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  const jinxes = getJinxesForCharacter(char.id);
  
  const team = teamParchment(char.team);
  const label = "section-label";

  return (
    <motion.div 
      id={char.id}
      layout
      onClick={onToggle}
      className={cn(
        "game-card cursor-pointer select-none p-3 text-[var(--parchment-ink)] transition-colors",
        isExpanded && cn("border-[1.5px]", team.border)
      )}
      data-testid={`card-character-${char.id}`}
    >
      <div className="flex items-center gap-3">
        <CharacterMedallion characterId={char.id} team={char.team} size={40} />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl font-semibold leading-tight tracking-normal">
            <a href={`#${char.id}`} onClick={(e) => e.stopPropagation()} className="hover:underline decoration-current/40">
              {char.name}
            </a>
          </h3>
          <TeamBadge team={char.team} variant="label" />
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-[var(--parchment-ink-faint)]" />
        </motion.div>
      </div>

      <p className="mt-2 font-serif text-[15px] leading-[1.5] text-[var(--parchment-ink-body)]">{char.ability}</p>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <NightBadges char={char} />
        {char.setup && (
          <span className="game-label flex items-center gap-1 rounded-full border border-[var(--parchment-control-border)] bg-[var(--parchment-control)] px-2 py-0.5 text-[var(--parchment-ink-link)]">
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
            <div className="mt-3 space-y-4 border-t border-[var(--parchment-rule)] pt-3">
              {(char.firstNightOrder !== null || char.otherNightOrder !== null) && (
                <div className="space-y-2">
                  <h4 className={label}>Night Order</h4>
                  <div className="flex flex-wrap gap-3 font-serif text-[15px]">
                    {char.firstNightOrder !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--parchment-ink-muted)]">First Night:</span>
                        <span className="rounded-md border border-[var(--parchment-border)] bg-[var(--parchment-panel)] px-2 py-0.5 font-display font-semibold tabular-nums text-[var(--parchment-ink)]">#{char.firstNightOrder}</span>
                      </div>
                    )}
                    {char.otherNightOrder !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--parchment-ink-muted)]">Other Nights:</span>
                        <span className="rounded-md border border-[var(--parchment-border)] bg-[var(--parchment-panel)] px-2 py-0.5 font-display font-semibold tabular-nums text-[var(--parchment-ink)]">#{char.otherNightOrder}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {char.reminders.length > 0 && (
                <div className="space-y-2">
                  <h4 className={label}>Reminder Tokens</h4>
                  <div className="flex flex-wrap gap-2">
                    {char.reminders.map((reminder, idx) => (
                      <span 
                        key={idx}
                        className="rounded-full border border-[var(--parchment-control-border)] bg-[var(--parchment-panel)] px-2.5 py-1 font-serif text-sm text-[var(--parchment-ink)]"
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
                  <h4 className={label}>Setup Effect</h4>
                  <p className="font-serif text-[15px] text-[var(--parchment-ink-body)]">
                    This character modifies the game setup. Check the ability for details.
                  </p>
                </div>
              )}

              {/* Flavor Quote */}
              {char.flavorQuote && (
                <div className="space-y-2">
                  <h4 className={label}>Flavor</h4>
                  <p className="border-l-2 border-[var(--parchment-control-border)] pl-3 font-serif text-[15px] italic text-[var(--parchment-ink-muted)]">
                    {char.flavorQuote}
                  </p>
                </div>
              )}

              {/* Extended Summary */}
              {char.extendedSummary && (
                <div className="space-y-2">
                  <h4 className={label}>How It Works</h4>
                  <div className="space-y-2 font-serif text-[15px] leading-relaxed text-[var(--parchment-ink-body)]">
                    {char.extendedSummary.split('\n\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips and Tricks */}
              {char.tipsAndTricks && char.tipsAndTricks.length > 0 && (
                <div className="space-y-2">
                  <h4 className={label}>Tips & Tricks</h4>
                  <ul className="space-y-1.5 font-serif text-[15px] text-[var(--parchment-ink-body)]">
                    {char.tipsAndTricks.map((tip, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="shrink-0 text-[var(--parchment-ink-faint)]">-</span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bluffing As (for good characters to bluff) */}
              {char.bluffingAs && char.bluffingAs.length > 0 && (
                <div className="space-y-2">
                  <h4 className={label}>Bluffing as {char.name}</h4>
                  <ul className="space-y-1.5 font-serif text-[15px] text-[var(--parchment-ink-body)]">
                    {char.bluffingAs.map((tip, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="shrink-0 text-[var(--parchment-ink-faint)]">-</span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fighting The (for good characters fighting evil) */}
              {char.fightingThe && char.fightingThe.length > 0 && (
                <div className="space-y-2">
                  <h4 className={label}>Fighting the {char.name}</h4>
                  <ul className="space-y-1.5 font-serif text-[15px] text-[var(--parchment-ink-body)]">
                    {char.fightingThe.map((tip, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="shrink-0 text-[var(--parchment-ink-faint)]">-</span>
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
