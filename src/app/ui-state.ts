import type { PieceColour, Position } from "../engine/game";
import type { GameEndStatus } from "../engine/game-status";

type GameOverOptions = "newGame" | "quit";

type UIMode =
  | { type: "normal" }
  | {
      type: "promotion";
      position: Position;
      colour: PieceColour;
    }
  | {
      type: "gameover";
      result: GameEndStatus;
      colour: PieceColour | null;
    };

type UIState = {
  mode: UIMode;
  focusedSquare: Position | null;
  selectedSquare: Position | null;
};

function initUIState(): UIState {
  return {
    mode: { type: "normal" },
    focusedSquare: null,
    selectedSquare: null,
  };
}

function setNormalMode(ui: UIState): void {
  ui.mode = { type: "normal" };
}

function setPromotionMode(
  ui: UIState,
  position: Position,
  colour: PieceColour,
): void {
  ui.mode = {
    type: "promotion",
    position,
    colour,
  };
}

function setGameOverMode(
  ui: UIState,
  result: GameEndStatus,
  colour: PieceColour,
): void {
  ui.mode = { type: "gameover", result, colour };
}

export type { UIState, UIMode, GameOverOptions };
export { initUIState, setNormalMode, setPromotionMode, setGameOverMode };
