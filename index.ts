import type { CliRenderer } from "@opentui/core";
import type { GameState, Position } from "./game";
import type { Actions } from "./view";
import { createCliRenderer, ConsolePosition } from "@opentui/core";
import {
  initGameState,
  applyMove,
  getSquare,
  trySelectSquare,
  endTurn,
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

async function main() {
  const renderer = await createCliRenderer({
    useConsole: true,
    consoleOptions: {
      position: ConsolePosition.BOTTOM,
      sizePercent: 20,
    },
  });
  initKeyboard(renderer);
  const gameState = initGameState();
  const actions: Actions = {
    onSquareClick: (position: Position) => {
      const stateUpdated = handleBoardClick(gameState, position);
      if (stateUpdated) {
        render(renderer, actions, gameState);
      }
    },
  };

  render(renderer, actions, gameState);
}

main();
