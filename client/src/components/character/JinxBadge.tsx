import { AlertTriangle } from "lucide-react";

export function JinxBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="text-[10px] bg-orange-900/40 px-2 py-0.5 rounded text-orange-300 border border-orange-700/30 flex items-center gap-1">
      <AlertTriangle className="w-3 h-3" /> {count} Jinx{count > 1 ? 'es' : ''}
    </span>
  );
}
