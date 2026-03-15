import type { GameState, Position } from "./game";
import type { Actions, Direction } from "./actions";
import {
  getSquare,
  trySelectSquare,
  applyMove,
  endTurn,
  setFocusedSquare,
  clearFocusedSquare,
} from "./game";
import { isLegalMove } from "./move-validation";

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
  const targetSquare = getSquare(board, position);
  const targetIsFriendly = targetSquare?.colour === selectedPiece?.colour;

  // switch selected square
  if (targetIsFriendly) {
    gameState.ui.selectedSquare = position;
    return true;
  }

  if (!isLegalMove(board, { from: selectedSquare, to: position })) {
    return false;
  }
  applyMove(gameState, { from: selectedSquare, to: position });
  endTurn(gameState);
  return true;
}

function moveFocus(gameState: GameState, direction: Direction): boolean {
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
    setFocusedSquare(gameState, focusedSquare);
  }
  return changedFlag;
}

function clearSelection(gameState: GameState): boolean {
  if (gameState.ui.selectedSquare) {
    gameState.ui.selectedSquare = null;
    return true;
  }
  return false;
}

function initActions(gameState: GameState, reRender: () => void): Actions {
  const actions: Actions = {
    onInteractWithSquare: (position: Position) => {
      const stateUpdated = interactWithSquare(gameState, position);
      const focusCleared = clearFocusedSquare(gameState);
      if (stateUpdated || focusCleared) {
        reRender();
      }
    },
    onMoveFocus: (direction: Direction) => {
      const uiUpdated = moveFocus(gameState, direction);
      if (uiUpdated) {
        reRender();
      }
    },
    onInteractWithFocusedSquare: () => {
      if (!gameState.ui.focusedSquare) return;
      const stateUpdated = interactWithSquare(
        gameState,
        gameState.ui.focusedSquare,
      );
      if (stateUpdated) {
        reRender();
      }
    },
    onCancelSelection: () => {
      const stateUpdated = clearSelection(gameState);
      if (stateUpdated) {
        reRender();
      }
    },
  };
  return actions;
}

export { initActions };
