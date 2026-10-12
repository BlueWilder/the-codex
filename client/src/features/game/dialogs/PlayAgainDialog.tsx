import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

/** Confirms resetting the game for another round with the same players. */
export function PlayAgainDialog({
  open,
  onOpenChange,
  onPlayAgain,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlayAgain: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="parchment-scope rounded-[14px] border-[var(--parchment-border)] bg-[var(--parchment-panel)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-2xl font-semibold text-[var(--parchment-ink)]">Start a new game with the same players?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>This will reset:</p>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>All claims</li>
                <li>All deaths</li>
                <li>Day counter</li>
                <li>Game notes</li>
                <li>All travelers will be removed</li>
              </ul>
              <p className="text-sm">Player names and script selection will be kept.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-play-again">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onPlayAgain}
            data-testid="button-confirm-play-again"
          >
            Play Again
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
