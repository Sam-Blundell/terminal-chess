import { createCliRenderer, type CliRenderer } from "@opentui/core";
import {
  initGameState,
  movePiece,
  getSquare,
  trySelectSquare,
  type GameState,
} from "./game";
import { buildApp, type Actions } from "./view";

function render(renderer: CliRenderer, actions: Actions, gameState: GameState) {
  renderer.root.remove("app-root");
  renderer.root.add(buildApp(actions, gameState));
}

function handleBoardClick(gameState: GameState, x: number, y: number): boolean {
  const { selectedSquare } = gameState.ui;
  if (selectedSquare === null) {
    return trySelectSquare(gameState, x, y);
  }

  const clickedSameSquare = selectedSquare.x === x && selectedSquare.y === y;
  if (clickedSameSquare) {
    gameState.ui.selectedSquare = null;
    return true;
  }

  const { board } = gameState.game;
  const selectedPiece = getSquare(board, selectedSquare.x, selectedSquare.y);
  const targetSquare = getSquare(board, x, y);
  const targetIsFriendly = targetSquare?.colour === selectedPiece?.colour;

  if (targetIsFriendly) {
    gameState.ui.selectedSquare = { x, y };
    return true;
  }

  movePiece(board, selectedSquare.x, selectedSquare.y, x, y);
  gameState.ui.selectedSquare = null;
  return true;
}

async function main() {
  const renderer = await createCliRenderer();
  const gameState = initGameState();
  const actions: Actions = {
    onSquareClick: (x: number, y: number) => {
      const stateUpdated = handleBoardClick(gameState, x, y);
      if (stateUpdated) {
        render(renderer, actions, gameState);
      }
    },
  };

  render(renderer, actions, gameState);
}

main();
