import type { Position } from "../engine/game";
import type { PromotionOptions } from "../engine/promotion";
import type { GameOverOptions } from "./ui-state";

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
