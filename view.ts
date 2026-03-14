import { Box, Text } from "@opentui/core";
import {
  SIZE,
  getSquare,
  type Square,
  type GameState,
  type Position,
} from "./game";

const CELL_WIDTH = 7;
const CELL_HEIGHT = 3;
const highlight = "#FF00FF";
const light = "#eeeed2";
const dark = "#769656";

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
  onSquareClick: (position: Position) => void;
};

function cell(
  actions: Actions,
  gameState: GameState,
  isDark: boolean,
  piece: Square,
  position: Position,
) {
  return Box(
    {
      width: CELL_WIDTH,
      height: CELL_HEIGHT,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        gameState.ui.selectedSquare?.x === position.x &&
        gameState.ui.selectedSquare?.y === position.y
          ? highlight
          : isDark
            ? dark
            : light,
      onMouseDown: () => {
        actions.onSquareClick(position);
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
      const position = { x, y };
      const isDark = (x + y) % 2 === 1;
      const piece = getSquare(gameState.game.board, position);
      return cell(actions, gameState, isDark, piece, position);
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
