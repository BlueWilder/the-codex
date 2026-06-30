import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  type PlayerGame, 
  type GamePlayer,
  type Nomination,
  type ClaimRecord,
  type DeathRecord,
  type TravelerEvent,
  type GhostVoteEvent,
  type ExileVote,
} from "@/hooks/use-player-game";
import { ALL_CHARACTERS } from "@/lib/game-data";
import { 
  Theater, 
  Scale, 
  Skull, 
  Ghost, 
  UserPlus, 
  UserMinus, 
  Sun, 
  Moon,
  Filter,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

type EventType = 'claim' | 'nomination' | 'death' | 'ghost_vote' | 'traveler';

interface GameEvent {
  id: string;
  type: EventType;
  day: number;
  isNight: boolean;
  timestamp: string;
  playerId: string;
  playerName: string;
  description: string;
  details?: string;
  icon: typeof Theater;
  iconColor: string;
}

interface GameLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: PlayerGame;
}

function getCharacterName(characterId: string): string {
  const char = ALL_CHARACTERS.find(c => c.id === characterId);
  return char?.name || characterId;
}

function getPlayerName(playerId: string, players: GamePlayer[]): string {
  const player = players.find(p => p.id === playerId);
  return player?.name || 'Unknown';
}

export function GameLogDialog({ open, onOpenChange, game }: GameLogDialogProps) {
  const [filter, setFilter] = useState<EventType | 'all'>('all');
  
  const events = useMemo(() => {
    const allEvents: GameEvent[] = [];
    const players = game.players;
    
    // Collect claim events from claimRecords
    players.forEach(player => {
      const records = player.claimRecords || [];
      records.forEach((record, idx) => {
        allEvents.push({
          id: `claim-${player.id}-${record.characterId}-${idx}`,
          type: 'claim',
          day: record.day,
          isNight: false,
          timestamp: record.addedAt,
          playerId: player.id,
          playerName: player.name,
          description: `claimed ${getCharacterName(record.characterId)}`,
          icon: Theater,
          iconColor: 'text-purple-400',
        });
      });
    });
    
    // Collect nomination events
    game.nominations.forEach(nom => {
      const nominee = players.find(p => p.id === nom.nomineeId);
      const nominator = players.find(p => p.id === nom.nominatorId);
      // Use persisted values if available, fallback to calculation for legacy data
      const yesVotes = nom.yesVotes ?? nom.votes?.filter(v => v.voted).length ?? 0;
      const passed = nom.passed ?? false;
      
      // Determine display text based on result
      let resultText = 'Failed';
      if (nom.result === 'executed') {
        resultText = 'Executed';
      } else if (nom.result === 'on_the_block') {
        resultText = 'On Block';
      } else if (nom.result === 'passed') {
        resultText = 'Passed (no exec)';
      } else if (passed) {
        resultText = 'Passed';
      }
      
      allEvents.push({
        id: `nom-${nom.id}`,
        type: 'nomination',
        day: nom.day,
        isNight: false,
        timestamp: '', // Nominations don't have timestamps yet
        playerId: nom.nomineeId,
        playerName: nominee?.name || 'Unknown',
        description: `nominated by ${nominator?.name || 'Unknown'}`,
        details: `${resultText} - ${yesVotes} votes`,
        icon: Scale,
        iconColor: passed ? 'text-red-400' : 'text-amber-400',
      });
    });
    
    // Collect exile vote events
    game.exileVotes.forEach(exile => {
      const traveler = players.find(p => p.id === exile.travelerId);
      const yesVotes = exile.votes.filter(v => v.voted).length;
      
      allEvents.push({
        id: `exile-vote-${exile.id}`,
        type: 'nomination',
        day: exile.day,
        isNight: false,
        timestamp: '',
        playerId: exile.travelerId,
        playerName: traveler?.name || 'Unknown',
        description: `exile vote`,
        details: `${exile.passed ? 'Exiled' : 'Failed'} - ${yesVotes} votes`,
        icon: Scale,
        iconColor: exile.passed ? 'text-red-400' : 'text-amber-400',
      });
    });
    
    // Collect death events
    const deathRecords = game.deathRecords || [];
    deathRecords.forEach(death => {
      const player = players.find(p => p.id === death.playerId);
      let description = '';
      let isNight = false;
      
      switch (death.type) {
        case 'execution':
          description = 'was executed';
          break;
        case 'night':
          description = 'died in the night';
          isNight = true;
          break;
        case 'exile':
          description = 'was exiled';
          break;
      }
      
      allEvents.push({
        id: `death-${death.playerId}-${death.timestamp}`,
        type: 'death',
        day: death.day,
        isNight,
        timestamp: death.timestamp,
        playerId: death.playerId,
        playerName: player?.name || 'Unknown',
        description,
        icon: Skull,
        iconColor: 'text-red-500',
      });
    });
    
    // Collect ghost vote events
    const ghostVoteEvents = game.ghostVoteEvents || [];
    ghostVoteEvents.forEach(gv => {
      const player = players.find(p => p.id === gv.playerId);
      
      allEvents.push({
        id: `ghost-${gv.playerId}-${gv.nominationId}`,
        type: 'ghost_vote',
        day: gv.day,
        isNight: false,
        timestamp: gv.timestamp,
        playerId: gv.playerId,
        playerName: player?.name || 'Unknown',
        description: 'used ghost vote',
        icon: Ghost,
        iconColor: 'text-blue-400',
      });
    });
    
    // Collect traveler events
    const travelerEvents = game.travelerEvents || [];
    travelerEvents.forEach(te => {
      let description = '';
      let icon = UserPlus;
      let iconColor = 'text-green-400';
      
      switch (te.type) {
        case 'joined':
          description = te.characterId 
            ? `joined as ${getCharacterName(te.characterId)}`
            : 'joined the game';
          icon = UserPlus;
          iconColor = 'text-green-400';
          break;
        case 'left':
          description = 'left the game';
          icon = UserMinus;
          iconColor = 'text-gray-400';
          break;
        case 'exiled':
          description = 'was exiled';
          icon = UserMinus;
          iconColor = 'text-red-400';
          break;
      }
      
      allEvents.push({
        id: `traveler-${te.playerId}-${te.timestamp}`,
        type: 'traveler',
        day: te.day,
        isNight: false,
        timestamp: te.timestamp,
        playerId: te.playerId,
        playerName: te.playerName,
        description,
        icon,
        iconColor,
      });
    });
    
    // Sort by day, then night/day, then timestamp
    allEvents.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      // Night events come after day events of the same day number
      if (a.isNight !== b.isNight) return a.isNight ? 1 : -1;
      // Sort by timestamp if available
      if (a.timestamp && b.timestamp) {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      return 0;
    });
    
    return allEvents;
  }, [game]);
  
  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter(e => e.type === filter);
  }, [events, filter]);
  
  // Group events by day
  const eventsByDay = useMemo(() => {
    const grouped: Map<number, { day: GameEvent[]; night: GameEvent[] }> = new Map();
    
    filteredEvents.forEach(event => {
      if (!grouped.has(event.day)) {
        grouped.set(event.day, { day: [], night: [] });
      }
      const dayGroup = grouped.get(event.day)!;
      if (event.isNight) {
        dayGroup.night.push(event);
      } else {
        dayGroup.day.push(event);
      }
    });
    
    return grouped;
  }, [filteredEvents]);
  
  const maxDay = Math.max(...Array.from(eventsByDay.keys()), game.currentDay);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  
  const filterButtons: { type: EventType | 'all'; label: string }[] = [
    { type: 'all', label: 'All' },
    { type: 'claim', label: 'Claims' },
    { type: 'nomination', label: 'Votes' },
    { type: 'death', label: 'Deaths' },
    { type: 'traveler', label: 'Travelers' },
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 border-b border-border">
          <DialogTitle className="font-display text-lg text-amber-500">
            Game Log
          </DialogTitle>
          
          <div className="flex flex-wrap gap-1 pt-2">
            {filterButtons.map(fb => (
              <Badge
                key={fb.type}
                variant={filter === fb.type ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-xs",
                  filter === fb.type && "bg-amber-900/50 text-amber-100 border-amber-600"
                )}
                onClick={() => setFilter(fb.type)}
                data-testid={`filter-${fb.type}`}
              >
                {fb.label}
              </Badge>
            ))}
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4">
          {events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Theater className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No events recorded yet.</p>
              <p className="text-xs mt-1 opacity-70">
                Start tracking claims and nominations!
              </p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No events match this filter.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {days.map(dayNum => {
                const dayEvents = eventsByDay.get(dayNum);
                if (!dayEvents || (dayEvents.day.length === 0 && dayEvents.night.length === 0)) {
                  return null;
                }
                
                return (
                  <div key={dayNum} className="space-y-3">
                    {dayEvents.day.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-display text-amber-400">
                            Day {dayNum}
                          </span>
                        </div>
                        <div className="ml-6 space-y-1.5">
                          {dayEvents.day.map(event => (
                            <EventRow key={event.id} event={event} />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {dayEvents.night.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-indigo-400" />
                          <span className="text-sm font-display text-indigo-400">
                            Night {dayNum}
                          </span>
                        </div>
                        <div className="ml-6 space-y-1.5">
                          {dayEvents.night.map(event => (
                            <EventRow key={event.id} event={event} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function EventRow({ event }: { event: GameEvent }) {
  const Icon = event.icon;
  
  return (
    <div 
      className="flex items-start gap-2 text-sm py-1"
      data-testid={`event-${event.id}`}
    >
      <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", event.iconColor)} />
      <div className="flex-1 min-w-0">
        <span className="font-medium">{event.playerName}</span>
        <span className="text-muted-foreground"> {event.description}</span>
        {event.details && (
          <span className="text-xs text-muted-foreground/70 ml-1">
            ({event.details})
          </span>
        )}
      </div>
    </div>
  );
}
