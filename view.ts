import type { PieceColour, Piece, Square, GameState, Position } from "./game";
import type { Actions } from "./actions";
import { Box, Text } from "@opentui/core";
import { SIZE, getSquare } from "./game";

const CELL_WIDTH = 7;
const CELL_HEIGHT = 3;
const selectedHighlight = "#ff3870";
const focusedHighlight = "#5e94ff";
const focusedAndSelectedHighlight = "#ac63ff";
const lightSquare = "#eeeed2";
const darkSquare = "#769656";
const white = "#FFFFFF";
const black = "#000000";
const grey = "#979797";

function pieceToGlyph(piece: Square): string {
  if (piece === null) return " ";

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

function getSquareBackgroundColour(
  gameState: GameState,
  position: Position,
  isDark: boolean,
) {
  const { selectedSquare, focusedSquare } = gameState.ui;
  const isSelected =
    selectedSquare?.x === position.x && selectedSquare?.y === position.y;
  const isFocused =
    focusedSquare?.x === position.x && focusedSquare?.y === position.y;
  if (isFocused && isSelected) return focusedAndSelectedHighlight;
  if (isFocused) return focusedHighlight;
  if (isSelected) return selectedHighlight;
  if (isDark) return darkSquare;
  return lightSquare;
}

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
      backgroundColor: getSquareBackgroundColour(gameState, position, isDark),
      onMouseDown: () => {
        actions.onInteractWithSquare(position);
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

function convertPieceArrayToString(pieces: Piece[]) {
  const stringArr = pieces.map((x) => pieceToGlyph(x));
  return stringArr.join(" ");
}

function capturedPieceBox(captures: Piece[], colour: PieceColour) {
  return Box(
    {
      id: `captured-${colour}-pieces`,
      width: 7,
      height: 5,
      paddingLeft: 1,
      margin: 5,
      flexDirection: "row",
      backgroundColor: grey,
    },
    Text({
      content: convertPieceArrayToString(captures),
      fg: colour === "white" ? white : black,
    }),
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
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    capturedPieceBox(gameState.game.capturedPieces.black, "black"),
    chessboard(actions, gameState),
    capturedPieceBox(gameState.game.capturedPieces.white, "white"),
  );
}

export { buildApp };
