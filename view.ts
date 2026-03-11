import { Box, Text } from "@opentui/core";
import { SIZE, getSquare, type Square, type GameState } from "./game";

const CELL_WIDTH = 7;
const CELL_HEIGHT = 3;

function pieceToGlyph(piece: Square): string {
  if (piece === null) return " ";

  if (piece.colour === "white") {
    switch (piece.type) {
      case "king":
        return "♔";
      case "queen":
        return "♕";
      case "rook":
        return "♖";
      case "bishop":
        return "♗";
      case "knight":
        return "♘";
      case "pawn":
        return "♙";
    }
  }

  switch (piece.type) {
    case "king":
      return "♚";
    case "queen":
      return "♛";
    case "rook":
      return "♜";
    case "bishop":
      return "♝";
    case "knight":
      return "♞";
    case "pawn":
      return "♟";
  }
}

type Actions = {
  onSquareClick: (x: number, y: number) => void;
};

function cell(
  actions: Actions,
  gameState: GameState,
  isDark: boolean,
  piece: Square,
  x: number,
  y: number,
) {
  return Box(
    {
      width: CELL_WIDTH,
      height: CELL_HEIGHT,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        gameState.ui.selectedSquare?.x === x &&
        gameState.ui.selectedSquare?.y === y
          ? "#FF00FF"
          : isDark
            ? "#769656"
            : "#eeeed2",
      onMouseDown: () => {
        actions.onSquareClick(x, y);
      },
    },
    Text({
      content: pieceToGlyph(piece),
      fg: piece?.colour === "white" ? "#ffffff" : "#000000",
    }),
  );
}

function row(actions: Actions, gameState: GameState, y: number) {
  return Box(
    { flexDirection: "row" },
    ...Array.from({ length: SIZE }, (_, x) => {
      const isDark = (x + y) % 2 === 1;
      const piece = getSquare(gameState.game.board, x, y);
      return cell(actions, gameState, isDark, piece, x, y);
    }),
  );
}

function chessboard(actions: Actions, gameState: GameState) {
  return Box(
    {
      padding: 1,
      flexDirection: "column",
    },
    ...Array.from({ length: SIZE }, (_, y) => row(actions, gameState, y)),
  );
}

function buildApp(
  actions: Actions,
  gameState: GameState,
): ReturnType<typeof Box> {
  return Box(
    {
      id: "app-root",
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    chessboard(actions, gameState),
  );
}

export { buildApp };
export type { Actions };
