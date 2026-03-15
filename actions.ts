import type { Position } from "./game";

type Direction = "up" | "down" | "left" | "right";

type Actions = {
  onSquareClick: (position: Position) => void;
  onMoveFocus: (direction: Direction) => void;
  onActivateFocusedSquare: () => void;
  onCancelSelection: () => void;
};

export type { Actions, Direction };
