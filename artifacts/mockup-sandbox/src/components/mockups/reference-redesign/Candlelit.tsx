import React, { useState } from 'react';
import { Search, Moon, Sun, Settings, AlertTriangle, ChevronDown, Plus, Quote, Lightbulb, Sword, BookOpen, ArrowDownAZ, LayoutList, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATA ---
const CHARACTERS = [
  {
    id: 'washerwoman',
    name: 'Washerwoman',
    team: 'Townsfolk',
    script: 'Trouble Brewing',
    ability: 'You start knowing that 1 of 2 players is a particular Townsfolk.',
    firstNight: 32,
    otherNight: null,
    setup: false,
    reminders: ['Townsfolk', 'Wrong'],
    jinxes: [],
    flavor: 'Bloodstains on a dinner jacket? No, this is cooking sherry. How careless.',
    summary: 'The Washerwoman learns that a specific Townsfolk is in play, but not exactly who is playing them. On the first night she is shown two players and learns the character of one.',
    tips: [
      'The Washerwoman is deceptively powerful — you can confirm the identity of a good player.',
      'Beware the Spy! They may register as a Townsfolk to you.'
    ],
    bluffing: [
      'Claim Washerwoman and point to an evil player, then name a Townsfolk not in play.'
    ],
    fighting: [],
    howToRun: 'Place the TOWNSFOLK reminder by a Townsfolk token and WRONG by another. First night, wake the Washerwoman, point to both players, show the TOWNSFOLK character token.'
  },
  {
    id: 'fortune_teller',
    name: 'Fortune Teller',
    team: 'Townsfolk',
    script: 'Trouble Brewing',
    ability: 'Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.',
    firstNight: null,
    otherNight: 41,
    setup: false,
    reminders: [],
    jinxes: [],
  },
  {
    id: 'empath',
    name: 'Empath',
    team: 'Townsfolk',
    script: 'Trouble Brewing',
    ability: 'Each night, you learn how many of your 2 alive neighbours are evil.',
    firstNight: 37,
    otherNight: 53,
    setup: false,
    reminders: [],
    jinxes: [],
  },
  {
    id: 'poisoner',
    name: 'Poisoner',
    team: 'Minion',
    script: 'Trouble Brewing',
    ability: 'Each night, choose a player: they are poisoned tonight and tomorrow day.',
    firstNight: 17,
    otherNight: 8,
    setup: true,
    reminders: ['Poisoned'],
    jinxes: [{ char: 'Snitch', rule: 'The Snitch is a jinx.' }],
  },
  {
    id: 'imp',
    name: 'Imp',
    team: 'Demon',
    script: 'Trouble Brewing',
    ability: 'Each night*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.',
    firstNight: null,
    otherNight: 24,
    setup: false,
    reminders: ['Dead'],
    jinxes: [],
    fighting: [
      'Track night deaths and look for patterns in who the Demon avoids. Remember the Imp can starpass.'
    ]
  },
  {
    id: 'grandmother',
    name: 'Grandmother',
    team: 'Townsfolk',
    script: 'Bad Moon Rising',
    ability: 'You start knowing a good player & their character. If the Demon kills them, you die too.',
    firstNight: 39,
    otherNight: null,
    setup: false,
    reminders: ['Grandchild'],
    jinxes: [],
  },
  {
    id: 'baron',
    name: 'Baron',
    team: 'Minion',
    script: 'Trouble Brewing',
    ability: 'There are extra Outsiders in play. [+2 Outsiders]',
    firstNight: null,
    otherNight: null,
    setup: true,
    reminders: [],
    jinxes: [],
  },
  {
    id: 'investigator',
    name: 'Investigator',
    team: 'Townsfolk',
    script: 'Trouble Brewing',
    ability: 'You start knowing that 1 of 2 players is a particular Minion.',
    firstNight: 34,
    otherNight: null,
    setup: false,
    reminders: ['Minion', 'Wrong'],
    jinxes: [],
  },
  {
    id: 'chef',
    name: 'Chef',
    team: 'Townsfolk',
    script: 'Trouble Brewing',
    ability: 'You start knowing how many pairs of evil players there are.',
    firstNight: 35,
    otherNight: null,
    setup: false,
    reminders: [],
    jinxes: [],
  },
  {
    id: 'scarlet_woman',
    name: 'Scarlet Woman',
    team: 'Minion',
    script: 'Trouble Brewing',
    ability: 'If there are 5 or more players alive & the Demon dies, you become the Demon. (Travellers don’t count)',
    firstNight: null,
    otherNight: 19,
    setup: false,
    reminders: ['Demon'],
    jinxes: [],
  },
  {
    id: 'spy',
    name: 'Spy',
    team: 'Minion',
    script: 'Trouble Brewing',
    ability: 'Each night, you see the Grimoire. You might register as a good player & as a Townsfolk or Outsider, even if dead.',
    firstNight: 48,
    otherNight: 67,
    setup: false,
    reminders: [],
    jinxes: [],
  },
  {
    id: 'gunslinger',
    name: 'Gunslinger',
    team: 'Traveler',
    script: 'All',
    ability: 'Each day, after the 1st vote has been tallied, you may choose a player that voted: they die.',
    firstNight: null,
    otherNight: null,
    setup: false,
    reminders: [],
    jinxes: [],
  }
];

// --- COMPONENTS ---

const getTeamColors = (team: string) => {
  switch (team.toLowerCase()) {
    case 'townsfolk':
    case 'outsider':
      return { border: 'border-blue-900/50', bg: 'bg-blue-950/20', text: 'text-blue-300', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.1)]' };
    case 'minion':
    case 'demon':
      return { border: 'border-red-900/50', bg: 'bg-red-950/20', text: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.1)]' };
    case 'traveler':
      return { border: 'border-amber-700/50', bg: 'bg-amber-950/20', text: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]' };
    case 'fabled':
      return { border: 'border-purple-900/50', bg: 'bg-purple-950/20', text: 'text-purple-300', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.1)]' };
    default:
      return { border: 'border-neutral-800', bg: 'bg-neutral-900/40', text: 'text-neutral-400', glow: '' };
  }
};

const CharacterCard = ({ char, isExpanded, onToggle }: { char: any, isExpanded: boolean, onToggle: () => void }) => {
  const colors = getTeamColors(char.team);
  const jinxCount = char.jinxes?.length || 0;

  return (
    <motion.div
      layout
      onClick={onToggle}
      className={`relative rounded-xl border ${colors.border} ${colors.bg} backdrop-blur-md overflow-hidden cursor-pointer transition-all duration-300 ${isExpanded ? 'ring-1 ring-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : 'hover:border-amber-700/50'}`}
    >
      {/* Subtle top inner glow for candlelit feel */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/20 to-transparent"></div>
      
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className={`font-cinzel text-xl md:text-2xl font-bold tracking-wide ${colors.text} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>{char.name}</h3>
          <div className="flex items-center gap-3">
            <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-neutral-400 opacity-80">{char.team}</span>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-amber-600/60">
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </div>
        </div>

        <p className="font-sans text-sm text-neutral-300 leading-relaxed mb-4">
          {char.ability}
        </p>

        <div className="flex flex-wrap gap-2">
          {char.firstNight !== null && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 border border-neutral-800 font-sans text-[10px] font-medium text-neutral-400">
              <Moon className="w-3 h-3 text-blue-300/70" /> First Night
            </span>
          )}
          {char.otherNight !== null && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 border border-neutral-800 font-sans text-[10px] font-medium text-neutral-400">
              <Sun className="w-3 h-3 text-amber-300/70" /> Other Nights
            </span>
          )}
          {char.setup && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-purple-950/30 border border-purple-900/50 font-sans text-[10px] font-medium text-purple-300/80">
              <Settings className="w-3 h-3" /> Setup
            </span>
          )}
          {jinxCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-orange-950/30 border border-orange-900/50 font-sans text-[10px] font-medium text-orange-300/80">
              <AlertTriangle className="w-3 h-3" /> {jinxCount} Jinx{jinxCount > 1 ? 'es' : ''}
            </span>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-5 border-t border-amber-900/20 space-y-6">
                
                {/* Night Order & Reminders */}
                <div className="flex flex-wrap gap-x-6 gap-y-4">
                  {(char.firstNight !== null || char.otherNight !== null) && (
                    <div className="space-y-2">
                      <h4 className="font-cinzel text-xs font-bold text-amber-600 tracking-wider">Night Order</h4>
                      <div className="flex gap-2">
                        {char.firstNight !== null && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-950/40 border border-blue-900/40 font-sans text-xs text-blue-200">
                            <Moon className="w-3 h-3" /> {char.firstNight}
                          </span>
                        )}
                        {char.otherNight !== null && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/40 border border-amber-900/40 font-sans text-xs text-amber-200">
                            <Sun className="w-3 h-3" /> {char.otherNight}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {char.reminders?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-cinzel text-xs font-bold text-amber-600 tracking-wider">Reminders</h4>
                      <div className="flex gap-2">
                        {char.reminders.map((r: string) => (
                          <span key={r} className="px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 font-sans text-xs text-neutral-300">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Jinxes */}
                {jinxCount > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-cinzel text-xs font-bold text-orange-500 tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5" /> Jinxes
                    </h4>
                    <div className="space-y-2">
                      {char.jinxes.map((j: any, i: number) => (
                        <div key={i} className="px-3 py-2 rounded bg-orange-950/20 border border-orange-900/30 font-sans text-sm text-neutral-300">
                          <strong className="text-orange-300 font-medium">{j.char}:</strong> {j.rule}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flavor & Summary */}
                {char.flavor && (
                  <div className="pl-4 border-l-2 border-amber-800/40 py-1">
                    <p className="font-serif italic text-amber-200/60 text-sm leading-relaxed">"{char.flavor}"</p>
                  </div>
                )}

                {char.summary && (
                  <div className="space-y-2">
                    <h4 className="font-cinzel text-xs font-bold text-amber-600 tracking-wider flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5" /> Summary
                    </h4>
                    <p className="font-sans text-sm text-neutral-300 leading-relaxed">
                      {char.summary}
                    </p>
                  </div>
                )}

                {/* Tips & Tricks */}
                {char.tips?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-cinzel text-xs font-bold text-amber-600 tracking-wider flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5" /> Tips & Tricks
                    </h4>
                    <ul className="space-y-1.5">
                      {char.tips.map((tip: string, i: number) => (
                        <li key={i} className="flex gap-2 font-sans text-sm text-neutral-300">
                          <span className="text-amber-700/50 mt-1">•</span>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bluffing */}
                {char.bluffing?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-cinzel text-xs font-bold text-amber-600 tracking-wider flex items-center gap-2">
                      <Sword className="w-3.5 h-3.5" /> Bluffing Advice
                    </h4>
                    <ul className="space-y-1.5">
                      {char.bluffing.map((tip: string, i: number) => (
                        <li key={i} className="flex gap-2 font-sans text-sm text-neutral-300">
                          <span className="text-amber-700/50 mt-1">•</span>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fighting */}
                {char.fighting?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-cinzel text-xs font-bold text-amber-600 tracking-wider flex items-center gap-2">
                      <Sword className="w-3.5 h-3.5" /> Fighting the {char.name}
                    </h4>
                    <ul className="space-y-1.5">
                      {char.fighting.map((tip: string, i: number) => (
                        <li key={i} className="flex gap-2 font-sans text-sm text-neutral-300">
                          <span className="text-amber-700/50 mt-1">•</span>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* How to Run */}
                {char.howToRun && (
                  <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800 shadow-inner">
                    <h4 className="font-cinzel text-xs font-bold text-neutral-400 tracking-wider mb-2">STORYTELLER: HOW TO RUN</h4>
                    <p className="font-sans text-sm text-neutral-400 leading-relaxed italic">
                      {char.howToRun}
                    </p>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function Candlelit() {
  const [search, setSearch] = useState('');
  const [activeScript, setActiveScript] = useState('Trouble Brewing');
  const [activeTeam, setActiveTeam] = useState('All');
  const [sortOrder, setSortOrder] = useState('A–Z');
  const [expandedId, setExpandedId] = useState<string | null>('washerwoman');

  const scripts = ['All', 'Trouble Brewing', 'Bad Moon Rising', 'Sects & Violets', 'The Wild Hunt', 'The Ship of Theseus'];
  const teams = ['All', 'Townsfolk', 'Outsider', 'Minion', 'Demon', 'Traveler'];
  const sorts = [
    { label: 'A–Z', icon: ArrowDownAZ },
    { label: 'Sheet', icon: LayoutList },
    { label: 'Night', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-[#0a0808] text-neutral-200 font-sans selection:bg-amber-900/50 relative overflow-hidden">
      {/* Styles for fonts */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Lora:ital@0;1&display=swap');
        
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
        .font-serif { font-family: 'Lora', serif; }
        
        /* Subtle noise texture */
        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
        }
      `}} />

      {/* Atmospheric Background Layers */}
      <div className="fixed inset-0 noise-bg z-0" />
      <div className="fixed top-[-20%] left-[-10%] w-[70%] h-[70%] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none z-10" />

      <div className="relative z-20 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-amber-900/30 relative">
          {/* Hairline accent */}
          <div className="absolute bottom-0 left-0 w-1/3 h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
          
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-amber-500 drop-shadow-md">
            Character Reference
          </h1>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600/80" />
            <input 
              type="text" 
              placeholder="Search by name or ability..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-amber-900/40 rounded-full py-2.5 pl-11 pr-4 font-sans text-sm text-amber-100 placeholder:text-amber-700/70 focus:outline-none focus:border-amber-600/50 focus:ring-1 focus:ring-amber-600/30 transition-all shadow-inner"
            />
          </div>
        </header>

        {/* Filters */}
        <div className="space-y-6 mb-10">
          
          {/* Script Pills */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
            <span className="font-cinzel text-xs font-bold text-amber-500/90 tracking-widest uppercase mr-2">Script</span>
            {scripts.map(script => {
              const isActive = activeScript === script;
              const isCommunity = script === 'The Wild Hunt' || script === 'The Ship of Theseus';
              return (
                <button
                  key={script}
                  onClick={() => setActiveScript(script)}
                  className={`flex-none px-4 py-2 rounded-full font-sans text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-amber-900/40 border-amber-700/50 text-amber-300 shadow-[0_0_15px_rgba(180,83,9,0.2)]' 
                      : 'bg-black/20 border-neutral-800 text-neutral-400 hover:border-amber-900/40 hover:text-amber-200/70'
                  } border`}
                >
                  {script} {isCommunity && <span className="ml-1.5 opacity-50 text-[10px]">♦</span>}
                </button>
              );
            })}
            <button className="flex-none px-4 py-2 rounded-full font-sans text-sm font-medium border border-dashed border-neutral-700 text-neutral-400 hover:border-amber-700/50 hover:text-amber-500/80 transition-all flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" /> New Script
            </button>
          </div>

          {/* Team Pills & Sort */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t border-amber-900/10 pt-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className="font-cinzel text-xs font-bold text-amber-500/90 tracking-widest uppercase mr-3">Team</span>
              {teams.map(team => (
                <button
                  key={team}
                  onClick={() => setActiveTeam(team)}
                  className={`flex-none px-3.5 py-1.5 rounded bg-transparent font-sans text-sm font-medium transition-all border-b-2 ${
                    activeTeam === team 
                      ? 'border-amber-600 text-amber-400' 
                      : 'border-transparent text-neutral-400 hover:text-neutral-300'
                  }`}
                >
                  {team}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-neutral-800/80">
              {sorts.map(s => {
                const Icon = s.icon;
                const isActive = sortOrder === s.label;
                return (
                  <button
                    key={s.label}
                    onClick={() => setSortOrder(s.label)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded font-sans text-xs font-medium transition-all ${
                      isActive ? 'bg-amber-900/30 text-amber-300 shadow-sm' : 'text-neutral-400 hover:text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {CHARACTERS.map(char => (
            <CharacterCard 
              key={char.id} 
              char={char} 
              isExpanded={expandedId === char.id}
              onToggle={() => setExpandedId(expandedId === char.id ? null : char.id)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
