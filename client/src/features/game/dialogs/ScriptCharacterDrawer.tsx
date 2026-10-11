import { CharacterCard } from "@/components/character/CharacterCard";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { type Character } from "@/lib/game-data";

/**
 * Full character card for a character tapped on the Script tab's sheet.
 * Opens whenever `character` is set; closing calls onClose.
 */
export function ScriptCharacterDrawer({
  character,
  onClose,
}: {
  character: Character | null;
  onClose: () => void;
}) {
  return (
    <Drawer
      open={!!character}
      onOpenChange={(open) => { if (!open) onClose(); }}
    >
      <DrawerContent
        className="max-h-[85vh]"
        data-testid={character ? `drawer-character-${character.id}` : undefined}
      >
        <DrawerHeader className="sr-only">
          <DrawerTitle>{character?.name ?? "Character"}</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-8">
          {character && (
            <CharacterCard char={character} isExpanded onToggle={() => {}} />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
