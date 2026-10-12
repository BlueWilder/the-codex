import { AlertTriangle } from "lucide-react";

export function JinxBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="game-label flex items-center gap-1 rounded-full border border-[var(--attention)] px-2 py-0.5 text-[var(--attention)]">
      <AlertTriangle className="w-3.5 h-3.5" /> {count} Jinx{count > 1 ? 'es' : ''}
    </span>
  );
}
