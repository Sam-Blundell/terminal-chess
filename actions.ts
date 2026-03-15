import type { Position } from "./game";

type Direction = "up" | "down" | "left" | "right";

type Actions = {
  onInteractWithSquare: (position: Position) => void;
  onMoveFocus: (direction: Direction) => void;
  onInteractWithFocusedSquare: () => void;
  onCancelSelection: () => void;
};

export type { Actions, Direction };
