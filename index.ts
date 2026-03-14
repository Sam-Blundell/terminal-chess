import { createCliRenderer, type CliRenderer } from "@opentui/core";
import {
  initGameState,
  movePiece,
  getSquare,
  trySelectSquare,
  isLegalMove,
  type GameState,
  type Position,
} from "./game";
import { buildApp, type Actions } from "./view";

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

  // clear selected square
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
  movePiece(board, { from: selectedSquare, to: position });
  gameState.ui.selectedSquare = null;
  return true;
}

async function main() {
  const renderer = await createCliRenderer();
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
