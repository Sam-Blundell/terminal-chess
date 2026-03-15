import type { CliRenderer } from "@opentui/core";
import type { GameState, Position } from "./game";
import type { Actions, Direction } from "./actions";
import { createCliRenderer, ConsolePosition } from "@opentui/core";
import {
  initGameState,
  applyMove,
  getSquare,
  trySelectSquare,
  endTurn,
  setFocusedSquare,
  clearFocusedSquare,
} from "./game";
import { isLegalMove } from "./move-validation";
import { buildApp } from "./view";
import { initKeyboard } from "./keyboard";

function render(renderer: CliRenderer, actions: Actions, gameState: GameState) {
  renderer.root.remove("app-root");
  renderer.root.add(buildApp(actions, gameState));
}

function handleBoardClick(gameState: GameState, position: Position): boolean {
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

function handleFocusMove(gameState: GameState, direction: Direction): boolean {
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

function handleCancelSelection(gameState: GameState): boolean {
  if (gameState.ui.selectedSquare) {
    gameState.ui.selectedSquare = null;
    return true;
  }
  return false;
}

async function main() {
  const renderer = await createCliRenderer({
    useConsole: true,
    consoleOptions: {
      position: ConsolePosition.BOTTOM,
      sizePercent: 20,
    },
  });
  const gameState = initGameState();
  const actions: Actions = {
    onSquareClick: (position: Position) => {
      const stateUpdated = handleBoardClick(gameState, position);
      const focusCleared = clearFocusedSquare(gameState);
      if (stateUpdated || focusCleared) {
        render(renderer, actions, gameState);
      }
    },
    onMoveFocus: (direction: Direction) => {
      const uiUpdated = handleFocusMove(gameState, direction);
      if (uiUpdated) {
        render(renderer, actions, gameState);
      }
    },
    onActivateFocusedSquare: () => {
      if (!gameState.ui.focusedSquare) return;
      const stateUpdated = handleBoardClick(
        gameState,
        gameState.ui.focusedSquare,
      );
      if (stateUpdated) {
        render(renderer, actions, gameState);
      }
    },
    onCancelSelection: () => {
      const stateUpdated = handleCancelSelection(gameState);
      if (stateUpdated) {
        render(renderer, actions, gameState);
      }
    },
  };

  initKeyboard(renderer, actions);

  render(renderer, actions, gameState);
}

main();
