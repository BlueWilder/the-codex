import React, { useState } from "react";
import { 
  Search, Moon, Sun, Settings, AlertTriangle, 
  ChevronDown, Quote, Lightbulb, Sword, BookOpen, 
  ArrowDownAZ, LayoutList, Clock, Plus, ChevronUp
} from "lucide-react";

const FontInjection = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800&display=swap');
      
      .codex-root {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background-color: #0B0E14; /* Dark slate base */
        color: #E2E8F0;
        min-height: 100vh;
      }
      .font-display {
        font-family: 'Fraunces', serif;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `
  }} />
);

// Sample Data
const CHARACTERS = [
  {
    id: "washerwoman",
    name: "Washerwoman",
    team: "Townsfolk",
    script: "Trouble Brewing",
    firstNight: 32,
    otherNights: null,
    reminders: ["Townsfolk", "Wrong"],
    setup: null,
    jinxes: [],
    ability: "You start knowing that 1 of 2 players is a particular Townsfolk.",
    flavor: "Bloodstains on a dinner jacket? No, this is cooking sherry. How careless.",
    summary: "The Washerwoman learns that a specific Townsfolk is in play, but not exactly who is playing them. On the first night she is shown two players and learns the character of one.",
    tips: [
      "The Washerwoman is deceptively powerful — you can confirm the identity of a good player.",
      "Beware the Spy! They may register as a Townsfolk to you."
    ],
    bluffing: [
      "Claim Washerwoman and point to an evil player, then name a Townsfolk not in play."
    ],
    fighting: [],
    howToRun: "Place the TOWNSFOLK reminder by a Townsfolk token and WRONG by another. First night, wake the Washerwoman, point to both players, show the TOWNSFOLK character token."
  },
  {
    id: "fortune-teller",
    name: "Fortune Teller",
    team: "Townsfolk",
    script: "Trouble Brewing",
    firstNight: null,
    otherNights: 12,
    reminders: [],
    setup: null,
    jinxes: [],
    ability: "Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.",
    flavor: "I see a dark figure in your future... wait, no, that's just a smudge on my crystal ball.",
    summary: "The Fortune Teller points to two players each night and learns if either of them is the Demon. However, one good player is chosen by the Storyteller to register falsely as a Demon.",
    tips: [],
    bluffing: [],
    fighting: [],
    howToRun: ""
  },
  {
    id: "empath",
    name: "Empath",
    team: "Townsfolk",
    script: "Trouble Brewing",
    firstNight: 34,
    otherNights: 14,
    reminders: [],
    setup: null,
    jinxes: [],
    ability: "Each night, you learn how many of your 2 alive neighbours are evil.",
    flavor: "I feel your pain. Literally. Please step back.",
    summary: "The Empath senses the alignment of the alive players sitting immediately next to them.",
    tips: [],
    bluffing: [],
    fighting: [],
    howToRun: ""
  },
  {
    id: "poisoner",
    name: "Poisoner",
    team: "Minion",
    script: "Trouble Brewing",
    firstNight: 16,
    otherNights: 6,
    reminders: ["Poisoned"],
    setup: "Relevant",
    jinxes: [{ char: "Some Character", rule: "Rule here" }], // 1 jinx placeholder
    ability: "Each night, choose a player: they are poisoned tonight and tomorrow day.",
    flavor: "A drop of this, a dash of that... and you won't remember your own name.",
    summary: "The Poisoner secretly deranges other characters' abilities, causing them to malfunction.",
    tips: [],
    bluffing: [],
    fighting: [],
    howToRun: ""
  },
  {
    id: "imp",
    name: "Imp",
    team: "Demon",
    script: "Trouble Brewing",
    firstNight: null,
    otherNights: 22,
    reminders: ["Dead"],
    setup: null,
    jinxes: [],
    ability: "Each night*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.",
    flavor: "It's nothing personal. Well, maybe a little personal.",
    summary: "The Imp is the source of the town's nightly deaths. If the Imp is executed, the game usually ends and Good wins, unless the Imp passes their role to a Minion.",
    tips: [],
    bluffing: [],
    fighting: [
      "Track night deaths and look for patterns in who the Demon avoids. Remember the Imp can starpass."
    ],
    howToRun: ""
  },
  {
    id: "grandmother",
    name: "Grandmother",
    team: "Townsfolk",
    script: "Bad Moon Rising",
    firstNight: 39,
    otherNights: null,
    reminders: ["Grandchild"],
    setup: null,
    jinxes: [],
    ability: "You start knowing a good player & their character. If the Demon kills them, you die too.",
    flavor: "Eat your vegetables, dear. You never know when it might be your last meal.",
    summary: "The Grandmother knows the identity of one specific good player. They form a fragile bond.",
    tips: [],
    bluffing: [],
    fighting: [],
    howToRun: ""
  },
  {
    id: "baron",
    name: "Baron",
    team: "Minion",
    script: "Trouble Brewing",
    firstNight: null,
    otherNights: null,
    reminders: [],
    setup: "[+2 Outsiders]",
    jinxes: [],
    ability: "There are extra Outsiders in play. [+2 Outsiders]",
    flavor: "The more the merrier! Especially when they're inept, confused, or actively unhelpful.",
    summary: "The Baron adds extra Outsiders to the game, sowing confusion and chaos.",
    tips: [],
    bluffing: [],
    fighting: [],
    howToRun: ""
  },
  {
    id: "investigator",
    name: "Investigator",
    team: "Townsfolk",
    script: "Trouble Brewing",
    firstNight: 30,
    otherNights: null,
    reminders: ["Minion", "Wrong"],
    setup: null,
    jinxes: [],
    ability: "You start knowing that 1 of 2 players is a particular Minion.",
    flavor: "The clues are all here. The footprint, the torn fabric, the sudden lack of heartbeat.",
    summary: "The Investigator learns that a specific Minion is in play, and narrows down who it is to two players.",
    tips: [],
    bluffing: [],
    fighting: [],
    howToRun: ""
  },
  {
    id: "chef",
    name: "Chef",
    team: "Townsfolk",
    script: "Trouble Brewing",
    firstNight: 31,
    otherNights: null,
    reminders: [],
    setup: null,
    jinxes: [],
    ability: "You start knowing how many pairs of evil players there are.",
    flavor: "Needs more salt. And perhaps less poison.",
    summary: "The Chef learns how many pairs of evil players are sitting next to each other.",
    tips: [],
    bluffing: [],
    fighting: [],
    howToRun: ""
  },
  {
    id: "slayer",
    name: "Slayer",
    team: "Townsfolk",
    script: "Trouble Brewing",
    firstNight: null,
    otherNights: null,
    reminders: ["No Ability"],
    setup: null,
    jinxes: [],
    ability: "Once per game, during the day, publicly choose a player: if they are the Demon, they die.",
    flavor: "I have come to chew bubblegum and slay demons. And I'm all out of bubblegum.",
    summary: "The Slayer has a single, powerful attack that can end the game instantly if they correctly identify the Demon.",
    tips: [],
    bluffing: [],
    fighting: [],
    howToRun: ""
  },
  {
    id: "monk",
    name: "Monk",
    team: "Townsfolk",
    script: "Trouble Brewing",
    firstNight: null,
    otherNights: 10,
    reminders: ["Protected"],
    setup: null,
    jinxes: [],
    ability: "Each night, choose a player (not yourself): they are safe from the Demon tonight.",
    flavor: "Peace be with you. And maybe a very sturdy lock on your door.",
    summary: "The Monk protects one player each night from the Demon's attack.",
    tips: [],
    bluffing: [],
    fighting: [],
    howToRun: ""
  },
  {
    id: "ravenkeeper",
    name: "Ravenkeeper",
    team: "Townsfolk",
    script: "Trouble Brewing",
    firstNight: null,
    otherNights: 38,
    reminders: [],
    setup: null,
    jinxes: [],
    ability: "If you die at night, you are woken to choose a player: you learn their character.",
    flavor: "My birds see all. Except when it's dark. Then they mostly just sleep.",
    summary: "The Ravenkeeper learns the exact character of any one player, but only if the Demon kills them at night.",
    tips: [],
    bluffing: [],
    fighting: [],
    howToRun: ""
  }
];

const SCRIPTS = ["All", "Trouble Brewing", "Bad Moon Rising", "Sects & Violets", "The Wild Hunt", "The Ship of Theseus"];
const TEAMS = ["All", "Townsfolk", "Outsider", "Minion", "Demon", "Traveler"];
const SORTS = [
  { id: "az", icon: ArrowDownAZ, label: "A-Z" },
  { id: "sheet", icon: LayoutList, label: "Sheet" },
  { id: "night", icon: Clock, label: "Night" }
];

export default function Codex() {
  const [expandedId, setExpandedId] = useState<string | null>("washerwoman");
  const [activeScript, setActiveScript] = useState("All");
  const [activeTeam, setActiveTeam] = useState("All");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("az");

  const getTeamColors = (team: string) => {
    switch (team) {
      case "Townsfolk":
      case "Outsider":
        return "bg-[#1E293B] border-[#334155] text-[#93C5FD]"; // Blueish
      case "Minion":
      case "Demon":
        return "bg-[#2D1B1B] border-[#451A1A] text-[#FCA5A5]"; // Redish
      case "Traveler":
        return "bg-[#2D2411] border-[#453110] text-[#FCD34D]"; // Amber
      case "Fabled":
        return "bg-[#28183A] border-[#412066] text-[#D8B4FE]"; // Violet
      default:
        return "bg-slate-800 border-slate-700 text-slate-300";
    }
  };

  const getTeamAccent = (team: string) => {
    switch (team) {
      case "Townsfolk": case "Outsider": return "bg-blue-500";
      case "Minion": case "Demon": return "bg-red-500";
      case "Traveler": return "bg-amber-500";
      case "Fabled": return "bg-violet-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <div className="codex-root relative">
      <FontInjection />
      
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-[#0B0E14]/90 backdrop-blur-md border-b border-slate-800/80 pt-6 pb-4 px-6 md:px-8">
        <div className="max-w-[1280px] mx-auto space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-white tracking-wide">
              Character Reference
            </h1>
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search ability..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1A202C] border border-slate-700 text-slate-200 text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/50 transition-all placeholder-slate-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {/* Script Filter Row */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-6 px-6 md:mx-0 md:px-0">
              {SCRIPTS.map(script => (
                <button
                  key={script}
                  onClick={() => setActiveScript(script)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors border ${
                    activeScript === script 
                      ? "bg-amber-950/40 text-amber-400 border-amber-700/50" 
                      : "bg-transparent text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-300"
                  }`}
                >
                  {script}
                </button>
              ))}
              <div className="w-px h-5 bg-slate-800 mx-1 shrink-0" />
              <button className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-colors flex items-center gap-1.5 shrink-0">
                <Plus className="w-3 h-3" /> New Script
              </button>
            </div>

            {/* Team Filter & Sort */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
              <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                {TEAMS.map(team => (
                  <button
                    key={team}
                    onClick={() => setActiveTeam(team)}
                    className={`whitespace-nowrap text-xs font-bold tracking-wider uppercase transition-colors relative ${
                      activeTeam === team ? "text-slate-100" : "text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {team}
                    {activeTeam === team && (
                      <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-amber-500 rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="hidden sm:flex items-center bg-[#1A202C] rounded-lg p-0.5 border border-slate-800">
                {SORTS.map(sort => (
                  <button
                    key={sort.id}
                    onClick={() => setSortOrder(sort.id)}
                    className={`p-1.5 rounded-md transition-colors flex items-center gap-1.5 px-2 ${
                      sortOrder === sort.id ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-300"
                    }`}
                    title={sort.label}
                  >
                    <sort.icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold uppercase">{sort.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {CHARACTERS.map(char => {
            const isExpanded = expandedId === char.id;
            return (
              <div 
                key={char.id}
                className={`flex flex-col rounded-xl border transition-all duration-300 ${getTeamColors(char.team)} ${isExpanded ? "col-span-1 md:col-span-2 lg:col-span-3 shadow-xl ring-1 ring-amber-900/40" : "hover:border-slate-500 cursor-pointer shadow-sm"}`}
                onClick={() => !isExpanded && setExpandedId(char.id)}
              >
                {/* Card Header (Collapsed view) */}
                <div className="p-4 flex flex-col h-full gap-3 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${getTeamAccent(char.team)}`} />
                  
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <h3 className="font-display text-xl font-medium tracking-tight text-white mb-0.5">{char.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{char.team}</span>
                    </div>
                    {isExpanded ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                        className="p-1.5 rounded-full bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                    ) : (
                      <ChevronDown className="w-4 h-4 opacity-40 mt-1" />
                    )}
                  </div>
                  
                  <div className="pl-2 flex-grow">
                    <p className={`text-sm font-medium leading-snug ${isExpanded ? "opacity-100 text-slate-200" : "opacity-80"}`}>
                      {char.ability}
                    </p>
                  </div>
                  
                  <div className="pl-2 flex flex-wrap gap-1.5 mt-auto pt-1">
                    {char.firstNight && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0F172A] border border-slate-700/50 text-slate-300">
                        <Moon className="w-3 h-3 text-slate-400" /> {isExpanded ? `First Night #${char.firstNight}` : char.firstNight}
                      </span>
                    )}
                    {char.otherNights && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0F172A] border border-slate-700/50 text-slate-300">
                        <Sun className="w-3 h-3 text-amber-500" /> {isExpanded ? `Other Nights #${char.otherNights}` : char.otherNights}
                      </span>
                    )}
                    {char.setup && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-950/30 border border-violet-800/40 text-violet-300">
                        <Settings className="w-3 h-3" /> Setup
                      </span>
                    )}
                    {char.jinxes.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-950/30 border border-orange-800/40 text-orange-300">
                        <AlertTriangle className="w-3 h-3" /> {char.jinxes.length} Jinxes
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-0 pl-6 cursor-default border-t border-slate-800/50 mt-1">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
                      
                      {/* Left Column: Lore & Summary */}
                      <div className="lg:col-span-2 space-y-6">
                        {char.flavor && (
                          <div className="flex gap-3">
                            <Quote className="w-5 h-5 text-amber-600/50 shrink-0 mt-0.5" />
                            <p className="font-display italic text-lg text-slate-300/80 leading-snug">{char.flavor}</p>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Summary</h4>
                          <p className="text-sm text-slate-200 leading-relaxed bg-[#151A25] p-3 rounded-lg border border-slate-800">{char.summary}</p>
                        </div>
                        
                        {(char.tips?.length > 0 || char.bluffing?.length > 0) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {char.tips?.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                  <Lightbulb className="w-3.5 h-3.5 text-yellow-500" /> Tips & Tricks
                                </h4>
                                <ul className="space-y-2">
                                  {char.tips.map((tip, i) => (
                                    <li key={i} className="text-sm text-slate-300 pl-3 relative before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:bg-yellow-600/50 before:rounded-full">
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {char.bluffing?.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                  <Sword className="w-3.5 h-3.5 text-red-500" /> Bluffing
                                </h4>
                                <ul className="space-y-2">
                                  {char.bluffing.map((bluff, i) => (
                                    <li key={i} className="text-sm text-slate-300 pl-3 relative before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:bg-red-600/50 before:rounded-full">
                                      {bluff}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {char.fighting?.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                  <Sword className="w-3.5 h-3.5 text-blue-500" /> Fighting The {char.name}
                                </h4>
                                <ul className="space-y-2">
                                  {char.fighting.map((fight, i) => (
                                    <li key={i} className="text-sm text-slate-300 pl-3 relative before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:bg-blue-600/50 before:rounded-full">
                                      {fight}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Column: Mechanics */}
                      <div className="space-y-5 bg-[#0F131C] p-4 rounded-xl border border-slate-800">
                        {char.reminders?.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Reminder Tokens</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {char.reminders.map(rem => (
                                <span key={rem} className="px-2 py-1 bg-[#1A202C] border border-slate-700 rounded-md text-xs font-medium text-slate-300">
                                  {rem}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {char.setup && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <Settings className="w-3.5 h-3.5 text-violet-400" /> Setup Note
                            </h4>
                            <p className="text-sm text-slate-300">{char.setup}</p>
                          </div>
                        )}
                        
                        {char.jinxes?.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-orange-500" /> Jinxes
                            </h4>
                            <div className="space-y-2">
                              {char.jinxes.map((jinx, i) => (
                                <div key={i} className="bg-orange-950/20 border border-orange-900/30 p-2.5 rounded text-sm text-slate-300">
                                  <span className="font-bold text-orange-400">{jinx.char}:</span> {jinx.rule}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {char.howToRun && (
                          <div className="space-y-2 pt-2 border-t border-slate-800">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> How to Run
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed opacity-90 italic">
                              {char.howToRun}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
