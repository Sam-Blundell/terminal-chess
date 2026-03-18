import type { Piece, Position } from "./game";
import type { GameState, PromotionOptions } from "./state";
import type { Actions, Direction } from "./actions";
import { getSquare, setSquare } from "./game";
import { advanceTurn, setNormalMode, setPromotionMode } from "./state";
import { isLegalMove } from "./move-validation";
import { applyMove } from "./move-application";

function moveBoardFocus(gameState: GameState, direction: Direction): boolean {
  const focusedSquare = gameState.ui.focusedSquare
    ? { ...gameState.ui.focusedSquare }
    : { x: 3, y: 3 };

  let changedFlag = false;
  if (direction === "up" && focusedSquare.y > 0) {
    focusedSquare.y--;
    changedFlag = true;
  }
  if (direction === "left" && focusedSquare.x > 0) {
    focusedSquare.x--;
    changedFlag = true;
  }
  if (direction === "down" && focusedSquare.y < 7) {
    focusedSquare.y++;
    changedFlag = true;
  }
  if (direction === "right" && focusedSquare.x < 7) {
    focusedSquare.x++;
    changedFlag = true;
  }
  if (changedFlag) {
    gameState.ui.focusedSquare = focusedSquare;
  }
  return changedFlag;
}

function moveFocus(gameState: GameState, direction: Direction): boolean {
  switch (gameState.ui.mode.type) {
    case "normal":
      return moveBoardFocus(gameState, direction);
    case "promotion":
      return false;
  }
}

function trySelectSquare(gameState: GameState, position: Position): boolean {
  const square = getSquare(gameState.game.board, position);
  const pieceIsCurrentTurnColour =
    square !== null && gameState.game.currentTurn === square.colour;
  if (pieceIsCurrentTurnColour) {
    gameState.ui.selectedSquare = position;
    return true;
  }
  return false;
}

function isPromotionMove(piece: Piece, position: Position): boolean {
  if (piece.type !== "pawn") return false;
  return (
    (piece.colour === "white" && position.y === 0) ||
    (piece.colour === "black" && position.y === 7)
  );
}

function interactWithSquare(gameState: GameState, position: Position): boolean {
  const { selectedSquare } = gameState.ui;
  if (selectedSquare === null) {
    return trySelectSquare(gameState, position);
  }

  const clickedSameSquare =
    selectedSquare.x === position.x && selectedSquare.y === position.y;

  // deselect current square
  if (clickedSameSquare) {
    gameState.ui.selectedSquare = null;
    return true;
  }

  const { board } = gameState.game;
  const selectedPiece = getSquare(board, selectedSquare);
  if (selectedPiece === null) {
    throw new Error("interactWithSquare called on empty square");
  }
  const targetSquare = getSquare(board, position);
  const targetIsFriendly = targetSquare?.colour === selectedPiece.colour;

  // switch selected square
  if (targetIsFriendly) {
    gameState.ui.selectedSquare = position;
    return true;
  }

  if (!isLegalMove(gameState, { from: selectedSquare, to: position })) {
    return false;
  }
  applyMove(gameState, { from: selectedSquare, to: position });
  gameState.ui.selectedSquare = null;
  if (isPromotionMove(selectedPiece, position)) {
    setPromotionMode(gameState, position, selectedPiece.colour);
    return true;
  }
  advanceTurn(gameState);
  return true;
}

function clearFocusedSquare(gameState: GameState): boolean {
  if (gameState.ui.focusedSquare) {
    gameState.ui.focusedSquare = null;
    return true;
  }
  return false;
}

function interactAtPosition(gameState: GameState, position: Position): boolean {
  switch (gameState.ui.mode.type) {
    case "normal": {
      const stateUpdated = interactWithSquare(gameState, position);
      const focusCleared = clearFocusedSquare(gameState);
      return stateUpdated || focusCleared;
    }
    case "promotion":
      return false;
  }
}

function interactWithFocus(gameState: GameState): boolean {
  switch (gameState.ui.mode.type) {
    case "normal":
      if (!gameState.ui.focusedSquare) return false;
      return interactWithSquare(gameState, gameState.ui.focusedSquare);
    case "promotion":
      return false;
  }
}

function clearSelection(gameState: GameState): boolean {
  if (gameState.ui.selectedSquare) {
    gameState.ui.selectedSquare = null;
    return true;
  }
  return false;
}

function cancel(gameState: GameState): boolean {
  switch (gameState.ui.mode.type) {
    case "normal":
      return clearSelection(gameState);
    case "promotion":
      return false;
  }
}

function confirmPromotionSelection(
  gameState: GameState,
  selectedType: PromotionOptions,
): boolean {
  if (gameState.ui.mode.type !== "promotion") {
    throw new Error("confirmPromotionSelection called in wrong mode");
  }
  const { position, colour } = gameState.ui.mode;
  setSquare(gameState.game.board, position, { type: selectedType, colour });
  setNormalMode(gameState);
  advanceTurn(gameState);
  return true;
}

function initActions(gameState: GameState, reRender: () => void): Actions {
  const actions: Actions = {
    onMoveFocus: (direction: Direction) => {
      const uiUpdated = moveFocus(gameState, direction);
      if (uiUpdated) {
        reRender();
      }
    },
    onInteractWithSquare: (position: Position) => {
      const stateUpdated = interactAtPosition(gameState, position);
      if (stateUpdated) {
        reRender();
      }
    },
    onInteractWithFocusedSquare: () => {
      const stateUpdated = interactWithFocus(gameState);
      if (stateUpdated) {
        reRender();
      }
    },
    onCancelSelection: () => {
      const stateUpdated = cancel(gameState);
      if (stateUpdated) {
        reRender();
      }
    },
    onConfirmPromotion: (type: PromotionOptions) => {
      const stateUpdated = confirmPromotionSelection(gameState, type);
      if (stateUpdated) {
        reRender();
      }
    },
  };
  return actions;
}

export { initActions };
