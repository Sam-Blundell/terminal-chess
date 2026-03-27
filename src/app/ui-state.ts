import type { PieceColour, Position } from "../engine/game";

type GameOverOptions = "newGame" | "quit";

type UIMode =
  | { type: "normal" }
  | { type: "promotion"; position: Position; colour: PieceColour }
  | { type: "gameover"; result: "Checkmate"; winner: PieceColour }
  | { type: "gameover"; result: "Stalemate" };

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

function setCheckmateMode(ui: UIState, winner: PieceColour): void {
  ui.mode = { type: "gameover", result: "Checkmate", winner };
}

function setStalemateMode(ui: UIState): void {
  ui.mode = { type: "gameover", result: "Stalemate" };
}

export type { UIState, UIMode, GameOverOptions };
export {
  initUIState,
  setNormalMode,
  setPromotionMode,
  setCheckmateMode,
  setStalemateMode,
};
