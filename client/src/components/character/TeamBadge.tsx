import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { teamBadge } from "@/lib/team-style";

export function TeamBadge({ team, variant }: { team: string; variant: "label" | "pill" }) {
  if (variant === "label") {
    return <span className="text-[10px] uppercase tracking-wider opacity-60 font-bold">{team}</span>;
  }
  return (
    <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", teamBadge(team))}>
      {team}
    </Badge>
  );
}
