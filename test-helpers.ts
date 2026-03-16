import type { Board, GameState } from "./game";
import { setSquare, SIZE } from "./game";

function createEmptyBoard(): Board {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => null),
  );
}

function createMinimalGameState(): GameState {
  const board = createEmptyBoard();
  setSquare(board, { x: 4, y: 7 }, { colour: "white", type: "king" });
  setSquare(board, { x: 4, y: 0 }, { colour: "black", type: "king" });
  return {
    game: {
      board: board,
      currentTurn: "white",
      capturedPieces: {
        white: [],
        black: [],
      },
      kingPositions: {
        white: { x: 4, y: 7 },
        black: { x: 4, y: 0 },
      },
    },
    ui: {
      focusedSquare: null,
      selectedSquare: null,
    },
  };
}

export { createEmptyBoard, createMinimalGameState };
