import { createCliRenderer, type CliRenderer } from "@opentui/core";
import { initGameState, movePiece, selectSquare, type GameState } from "./game";
import { buildApp, type Actions } from "./view";

function render(renderer: CliRenderer, actions: Actions, gameState: GameState) {
  renderer.root.remove("app-root");
  renderer.root.add(buildApp(actions, gameState));
}

function handleSquareClick(
  gameState: GameState,
  x: number,
  y: number,
): boolean {
  if (!gameState.ui.selectedSquare) {
    return selectSquare(gameState, x, y);
  }
  const { x: selectedX, y: selectedY } = gameState.ui.selectedSquare;
  movePiece(gameState.game.board, selectedX, selectedY, x, y);
  gameState.ui.selectedSquare = null;
  return true;
}

async function main() {
  const renderer = await createCliRenderer();
  const gameState = initGameState();
  const actions: Actions = {
    onSquareClick: (x: number, y: number) => {
      const stateUpdated = handleSquareClick(gameState, x, y);
      if (stateUpdated) {
        render(renderer, actions, gameState);
      }
    },
  };

  render(renderer, actions, gameState);
}

main();
