import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  type PlayerGame, 
  type DeathRecord,
} from "@/hooks/use-player-game";
import { deathPhaseLabel } from "@/lib/death-phase";
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
  FileText,
  Plus,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

type EventType = 'claim' | 'nomination' | 'death' | 'ghost_vote' | 'traveler';
type Phase = 'day' | 'night';

interface GameEvent {
  id: string;
  type: EventType;
  day: number;
  phase: Phase;
  timestamp: string;
  playerId: string;
  playerName: string;
  description: string;
  details?: string;
  icon: typeof Theater;
  iconColor: string;
  deathRecord?: DeathRecord;
}

interface InlineGameLogProps {
  game: PlayerGame;
  onUpdateGameNotes: (notes: string) => void;
  onAddNotebookNote: (text: string) => void;
  onRemoveNotebookNote: (id: string) => void;
}

function getCharacterName(characterId: string): string {
  const char = ALL_CHARACTERS.find(c => c.id === characterId);
  return char?.name || characterId;
}

function chapterKey(day: number, phase: Phase): string {
  return `${phase === 'night' ? 'n' : 'd'}${day}`;
}

export function InlineGameLog({
  game,
  onUpdateGameNotes,
  onAddNotebookNote,
  onRemoveNotebookNote,
}: InlineGameLogProps) {
  const [filter, setFilter] = useState<EventType | 'all'>('all');
  const [noteDraft, setNoteDraft] = useState('');
  
  const events = useMemo(() => {
    const allEvents: GameEvent[] = [];
    const players = game.players;
    
    players.forEach(player => {
      const records = player.claimRecords || [];
      records.forEach((record, idx) => {
        allEvents.push({
          id: `claim-${player.id}-${record.characterId}-${idx}`,
          type: 'claim',
          day: record.day,
          phase: 'day',
          timestamp: record.addedAt,
          playerId: player.id,
          playerName: player.name,
          description: `claimed ${getCharacterName(record.characterId)}`,
          icon: Theater,
          iconColor: 'text-purple-400',
        });
      });
    });
    
    game.nominations.forEach(nom => {
      const nominee = players.find(p => p.id === nom.nomineeId);
      const nominator = players.find(p => p.id === nom.nominatorId);
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
        phase: 'day',
        timestamp: '',
        playerId: nom.nomineeId,
        playerName: nominee?.name || '[Removed]',
        description: `nominated by ${nominator?.name || '[Removed]'}`,
        details: `${resultText} - ${yesVotes} votes`,
        icon: Scale,
        iconColor: passed ? 'text-red-400' : 'text-amber-400',
      });
    });
    
    game.exileVotes.forEach(exile => {
      const traveler = players.find(p => p.id === exile.travelerId);
      const yesVotes = exile.votes.filter(v => v.voted).length;
      
      allEvents.push({
        id: `exile-vote-${exile.id}`,
        type: 'nomination',
        day: exile.day,
        phase: 'day',
        timestamp: '',
        playerId: exile.travelerId,
        playerName: traveler?.name || '[Removed]',
        description: `exile vote`,
        details: `${exile.passed ? 'Exiled' : 'Failed'} - ${yesVotes} votes`,
        icon: Scale,
        iconColor: exile.passed ? 'text-red-400' : 'text-amber-400',
      });
    });
    
    const deathRecords = game.deathRecords || [];
    deathRecords.forEach(death => {
      const player = players.find(p => p.id === death.playerId);
      let description = '';
      
      switch (death.type) {
        case 'execution':
          description = 'was executed';
          break;
        case 'night':
          description = 'died in the night';
          break;
        case 'exile':
          description = 'was exiled';
          break;
      }
      
      allEvents.push({
        id: `death-${death.playerId}-${death.timestamp}`,
        type: 'death',
        day: death.day,
        phase: death.phase,
        timestamp: death.timestamp,
        playerId: death.playerId,
        playerName: player?.name || '[Removed]',
        description,
        icon: Skull,
        iconColor: 'text-red-500',
        deathRecord: death,
      });
    });
    
    const ghostVoteEvents = game.ghostVoteEvents || [];
    ghostVoteEvents.forEach(gv => {
      const player = players.find(p => p.id === gv.playerId);
      
      allEvents.push({
        id: `ghost-${gv.playerId}-${gv.nominationId}`,
        type: 'ghost_vote',
        day: gv.day,
        phase: 'day',
        timestamp: gv.timestamp,
        playerId: gv.playerId,
        playerName: player?.name || '[Removed]',
        description: 'used ghost vote',
        icon: Ghost,
        iconColor: 'text-blue-400',
      });
    });
    
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
        phase: 'day',
        timestamp: te.timestamp,
        playerId: te.playerId,
        playerName: te.playerName,
        description,
        icon,
        iconColor,
      });
    });
    
    allEvents.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      // Night precedes Day within the same day number.
      if (a.phase !== b.phase) return a.phase === 'night' ? -1 : 1;
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
  
  const notebookNotes = game.notebookNotes ?? [];
  
  // Build the phase spine: Night 1, Day 1, Night 2, Day 2, ...
  const chapters = useMemo(() => {
    const eventDays = events.map(e => e.day);
    const noteDays = notebookNotes.map(n => n.day);
    const maxDay = Math.max(game.currentDay, ...eventDays, ...noteDays, 1);
    
    const spine: { day: number; phase: Phase }[] = [];
    for (let d = 1; d <= maxDay; d++) {
      spine.push({ day: d, phase: 'night' });
      spine.push({ day: d, phase: 'day' });
    }
    return spine;
  }, [events, notebookNotes, game.currentDay]);
  
  const isLiveChapter = (day: number, phase: Phase) =>
    day === game.currentDay && phase === game.phase;
  
  const visibleChapters = chapters.filter(({ day, phase }) => {
    const hasEvents = filteredEvents.some(e => e.day === day && e.phase === phase);
    const hasNotes = notebookNotes.some(n => n.day === day && n.phase === phase);
    return hasEvents || hasNotes || isLiveChapter(day, phase);
  });
  
  const handleAddNote = () => {
    if (!noteDraft.trim()) return;
    onAddNotebookNote(noteDraft);
    setNoteDraft('');
  };
  
  const filterButtons: { type: EventType | 'all'; label: string }[] = [
    { type: 'all', label: 'All' },
    { type: 'claim', label: 'Claims' },
    { type: 'nomination', label: 'Votes' },
    { type: 'death', label: 'Deaths' },
    { type: 'traveler', label: 'Travelers' },
  ];
  
  return (
    <Card className="p-4">
      {/* Game Notes Section - At the top */}
      <div className="mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-display text-muted-foreground">
            Notes
          </span>
        </div>
        <Textarea
          value={game.gameNotes || ''}
          onChange={(e) => onUpdateGameNotes(e.target.value)}
          placeholder="Add game notes... (demon bluffs, theories, whisper tracking)"
          className="min-h-[100px] bg-muted/30 border-border resize-none"
          data-testid="input-game-notes"
        />
      </div>
      
      <div className="flex flex-wrap gap-1 mb-4">
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
      
      <div className="space-y-6">
        {visibleChapters.map(({ day, phase }) => {
          const chapterEvents = filteredEvents.filter(
            e => e.day === day && e.phase === phase,
          );
          const chapterNotes = notebookNotes.filter(
            n => n.day === day && n.phase === phase,
          );
          const live = isLiveChapter(day, phase);
          const isNight = phase === 'night';
          
          return (
            <div
              key={chapterKey(day, phase)}
              className="space-y-2"
              data-testid={`notebook-chapter-${chapterKey(day, phase)}`}
            >
              <div className="flex items-center gap-2">
                {isNight ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                <span
                  className={cn(
                    "text-sm font-display",
                    isNight ? "text-indigo-400" : "text-amber-400",
                  )}
                >
                  {isNight ? 'Night' : 'Day'} {day}
                </span>
                {live && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-[#3d2f57] text-[#c79fe6]"
                    data-testid="badge-live-chapter"
                  >
                    Now
                  </Badge>
                )}
              </div>
              
              <div className="ml-6 space-y-1.5">
                {chapterEvents.map(event => (
                  <EventRow key={event.id} event={event} />
                ))}
                
                {chapterNotes.map(note => (
                  <NoteRow
                    key={note.id}
                    id={note.id}
                    text={note.text}
                    onRemove={onRemoveNotebookNote}
                  />
                ))}
                
                {chapterEvents.length === 0 && chapterNotes.length === 0 && (
                  <p className="text-xs text-muted-foreground/60 italic">
                    Nothing recorded for this phase yet.
                  </p>
                )}
                
                {live && (
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNote();
                        }
                      }}
                      placeholder="Add a note for this phase..."
                      className="h-8 text-sm bg-muted/30 border-border"
                      data-testid="input-notebook-note"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 shrink-0"
                      onClick={handleAddNote}
                      data-testid="button-add-notebook-note"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {events.length === 0 && notebookNotes.length === 0 && visibleChapters.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Theater className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No events recorded yet.</p>
            <p className="text-xs mt-1 opacity-70">
              Start tracking claims and nominations!
            </p>
          </div>
        )}
        
        {events.length > 0 && filteredEvents.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No events match this filter.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function EventRow({ event }: { event: GameEvent }) {
  const Icon = event.icon;
  const deathStamp = event.type === 'death' ? deathPhaseLabel(event.deathRecord) : null;
  
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
        {deathStamp && (
          <span className="text-xs text-[#c79fe6] ml-1">
            † {deathStamp}
          </span>
        )}
      </div>
    </div>
  );
}

function NoteRow({
  id,
  text,
  onRemove,
}: {
  id: string;
  text: string;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className="flex items-start gap-2 text-sm py-1 group"
      data-testid={`notebook-note-${id}`}
    >
      <FileText className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground/70" />
      <div className="flex-1 min-w-0 whitespace-pre-wrap break-words">
        {text}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-5 w-5 p-0 shrink-0 opacity-50 hover:opacity-100"
        onClick={() => onRemove(id)}
        data-testid={`button-remove-notebook-note-${id}`}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}
