import type { Position } from "../engine/game";
import type { PromotionOptions } from "../engine/promotion";
import type { AppState } from "./app-state";
import type { GameOverOptions, UIState } from "./ui-state";
import type { Actions, Direction } from "./actions";
import { getSquare, setSquare } from "../engine/game";
import { initAppState } from "./app-state";
import { advanceTurn } from "../engine/game-state";
import { isLegalMove } from "../engine/move-validation";
import { applyMove } from "../engine/move-application";
import { isPromotionMove } from "../engine/special-moves";
import { getGameEndStatus } from "../engine/game-status";
import {
  setNormalMode,
  setPromotionMode,
  setCheckmateMode,
  setStalemateMode,
} from "./ui-state";

function moveBoardFocus(ui: UIState, direction: Direction): boolean {
  const focusedSquare = ui.focusedSquare
    ? { ...ui.focusedSquare }
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
    ui.focusedSquare = focusedSquare;
  }
  return changedFlag;
}

function moveFocus(ui: UIState, direction: Direction): boolean {
  switch (ui.mode.type) {
    case "normal":
      return moveBoardFocus(ui, direction);
    case "promotion":
    case "gameover":
      return false;
  }
}

function trySelectSquare(app: AppState, position: Position): boolean {
  const { game, ui } = app;
  const square = getSquare(game.board, position);
  const pieceIsCurrentTurnColour =
    square !== null && game.currentTurn === square.colour;
  if (!pieceIsCurrentTurnColour) return false;
  ui.selectedSquare = position;
  return true;
}

function finalizeTurn(app: AppState): void {
  const { game, ui } = app;
  advanceTurn(game);

  const gameOverState = getGameEndStatus(game, game.currentTurn);
  if (gameOverState) {
    if (gameOverState === "Checkmate") {
      const winner = game.currentTurn === "white" ? "black" : "white";
      setCheckmateMode(ui, winner);
    } else {
      setStalemateMode(ui);
    }
  }
}

function interactWithSquare(app: AppState, position: Position): boolean {
  const { game, ui } = app;

  if (ui.selectedSquare === null) {
    return trySelectSquare(app, position);
  }

  const clickedSameSquare =
    ui.selectedSquare.x === position.x && ui.selectedSquare.y === position.y;

  // deselect current square
  if (clickedSameSquare) {
    ui.selectedSquare = null;
    return true;
  }

  const selectedPiece = getSquare(game.board, ui.selectedSquare);
  if (selectedPiece === null) {
    throw new Error("interactWithSquare called on empty square");
  }
  const targetSquare = getSquare(game.board, position);
  const targetIsFriendly = targetSquare?.colour === selectedPiece.colour;

  // switch selected square
  if (targetIsFriendly) {
    ui.selectedSquare = position;
    return true;
  }

  const moveAttempt = { from: ui.selectedSquare, to: position };

  if (!isLegalMove(game, moveAttempt)) return false;

  applyMove(game, moveAttempt);
  ui.selectedSquare = null;

  if (isPromotionMove(selectedPiece, moveAttempt)) {
    setPromotionMode(ui, position, selectedPiece.colour);
    return true;
  }
  finalizeTurn(app);
  return true;
}

function clearFocusedSquare(ui: UIState): boolean {
  if (ui.focusedSquare === null) return false;
  ui.focusedSquare = null;
  return true;
}

function interactAtPosition(app: AppState, position: Position): boolean {
  switch (app.ui.mode.type) {
    case "normal": {
      const stateUpdated = interactWithSquare(app, position);
      const focusCleared = clearFocusedSquare(app.ui);
      return stateUpdated || focusCleared;
    }
    case "promotion":
    case "gameover":
      return false;
  }
}

function interactWithFocus(app: AppState): boolean {
  switch (app.ui.mode.type) {
    case "normal":
      if (!app.ui.focusedSquare) return false;
      return interactWithSquare(app, app.ui.focusedSquare);
    case "promotion":
    case "gameover":
      return false;
  }
}

function clearSelection(ui: UIState): boolean {
  if (ui.selectedSquare === null) return false;
  ui.selectedSquare = null;
  return true;
}

function cancel(ui: UIState): boolean {
  switch (ui.mode.type) {
    case "normal":
      return clearSelection(ui);
    case "promotion":
    case "gameover":
      return false;
  }
}

function confirmPromotionSelection(
  app: AppState,
  selectedType: PromotionOptions,
): boolean {
  if (app.ui.mode.type !== "promotion") {
    throw new Error("confirmPromotionSelection called in wrong mode");
  }
  const { game, ui } = app;
  const { position, colour } = app.ui.mode;
  setSquare(game.board, position, { type: selectedType, colour });
  setNormalMode(ui);
  finalizeTurn(app);
  return true;
}

function resetGame(app: AppState): void {
  const fresh = initAppState();
  app.game = fresh.game;
  app.ui = fresh.ui;
}

function confirmGameOverSelection(
  app: AppState,
  selection: GameOverOptions,
): boolean {
  if (app.ui.mode.type !== "gameover") {
    throw new Error("confirmGameOverSelection called in wrong mode");
  }
  if (selection === "quit") return false;
  resetGame(app);
  return true;
}

function initActions(
  app: AppState,
  reRender: () => void,
  quit: () => void,
): Actions {
  const actions: Actions = {
    onMoveFocus: (direction: Direction) => {
      const uiUpdated = moveFocus(app.ui, direction);
      if (uiUpdated) {
        reRender();
      }
    },
    onInteractWithSquare: (position: Position) => {
      const stateUpdated = interactAtPosition(app, position);
      if (stateUpdated) {
        reRender();
      }
    },
    onInteractWithFocusedSquare: () => {
      const stateUpdated = interactWithFocus(app);
      if (stateUpdated) {
        reRender();
      }
    },
    onCancelSelection: () => {
      const stateUpdated = cancel(app.ui);
      if (stateUpdated) {
        reRender();
      }
    },
    onConfirmPromotion: (type: PromotionOptions) => {
      const stateUpdated = confirmPromotionSelection(app, type);
      if (stateUpdated) {
        reRender();
      }
    },
    onConfirmGameOverChoice: (type: GameOverOptions) => {
      const continueGame = confirmGameOverSelection(app, type);
      if (continueGame) {
        reRender();
      } else {
        quit();
      }
    },
  };
  return actions;
}

export { initActions };
