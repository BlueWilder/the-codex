// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ScriptSheet } from "@/components/character/ScriptSheet";
import { OFFICIAL_SCRIPTS } from "@/lib/game-data";
import { resolveScriptCharacters } from "@/lib/script-resolve";

afterEach(cleanup);

const TB = OFFICIAL_SCRIPTS.find(s => s.id === "tb")!;
const TB_CHARS = resolveScriptCharacters(
  { id: TB.id, name: TB.name, isOfficial: true, characterIds: TB.characters } as any,
  { includeTravellers: false, includeFabled: false },
);

describe("ScriptSheet onCharacterSelect", () => {
  it("renders static rows (no buttons) when onCharacterSelect is absent", () => {
    render(<ScriptSheet characters={TB_CHARS} scriptName={TB.name} />);
    expect(screen.getAllByTestId(/^script-sheet-char-/).length).toBeGreaterThan(0);
    expect(screen.queryAllByTestId(/^button-script-char-/).length).toBe(0);
  });

  it("renders tappable buttons that call onCharacterSelect with the character id (team view)", () => {
    const onSelect = vi.fn();
    render(
      <ScriptSheet characters={TB_CHARS} scriptName={TB.name} onCharacterSelect={onSelect} />,
    );
    const buttons = screen.getAllByTestId(/^button-script-char-/);
    expect(buttons.length).toBe(TB_CHARS.length);
    expect(screen.queryAllByTestId(/^script-sheet-char-/).length).toBe(0);

    const imp = screen.getByTestId("button-script-char-imp");
    fireEvent.click(imp);
    expect(onSelect).toHaveBeenCalledWith("imp");
  });

  it("renders tappable night rows that call onCharacterSelect (night view)", () => {
    const onSelect = vi.fn();
    render(
      <ScriptSheet characters={TB_CHARS} scriptName={TB.name} onCharacterSelect={onSelect} />,
    );
    fireEvent.click(screen.getByTestId("button-sheet-sort-night"));
    const nightButtons = screen.getAllByTestId(/^button-script-char-/);
    expect(nightButtons.length).toBeGreaterThan(0);
    expect(screen.queryAllByTestId(/^script-sheet-nightrow-/).length).toBe(0);
    fireEvent.click(nightButtons[0]);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
