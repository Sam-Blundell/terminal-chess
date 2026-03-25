import type { Position } from "./game";
import type { PromotionOptions, GameOverOptions } from "./state";

type Direction = "up" | "down" | "left" | "right";

type Actions = {
  onMoveFocus: (direction: Direction) => void;
  onInteractWithSquare: (position: Position) => void;
  onInteractWithFocusedSquare: () => void;
  onCancelSelection: () => void;
  onConfirmPromotion: (type: PromotionOptions) => void;
  onConfirmGameOverChoice: (type: GameOverOptions) => void;
};

export type { Actions, Direction };
