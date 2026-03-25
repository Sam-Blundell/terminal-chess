import type { PieceColour, Piece, Square, Position } from "./game";
import type { GameState, PromotionOptions, GameOverOptions } from "./state";
import type { Actions } from "./actions";
import { Box, Text, Select, SelectRenderableEvents } from "@opentui/core";
import { SIZE, getSquare } from "./game";
import { positionToChessNotation } from "./notation-helpers";

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
const yellow = "#fffb00";

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
      fg: piece?.colour === "white" ? white : black,
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

const promotionMenuOptions: {
  name: string;
  description: string;
  value: PromotionOptions;
}[] = [
  { name: "Queen", description: "", value: "queen" },
  { name: "Bishop", description: "", value: "bishop" },
  { name: "Rook", description: "", value: "rook" },
  { name: "Knight", description: "", value: "knight" },
];

function buildPromotionMenu(
  onConfirmPromotion: (type: PromotionOptions) => void,
) {
  const promotionMenu = Select({
    id: "promotionMenu",
    width: 30,
    height: 8,
    backgroundColor: black,
    selectedBackgroundColor: black,
    focusedBackgroundColor: black,
    selectedTextColor: yellow,
    options: promotionMenuOptions,
  });

  promotionMenu.on(SelectRenderableEvents.ITEM_SELECTED, (_, option) => {
    onConfirmPromotion(option.value);
  });

  promotionMenu.focus();

  return promotionMenu;
}

function promotionModal(
  gameState: GameState,
  onConfirmPromotion: (type: PromotionOptions) => void,
) {
  const { mode } = gameState.ui;
  if (mode.type !== "promotion") {
    throw new Error("promotion modal opened when not in promotion mode");
  }

  const promotionMenu = buildPromotionMenu(onConfirmPromotion);

  return Box(
    {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    Box(
      {
        width: 30,
        height: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: black,
      },
      Text({
        content: `Promote the pawn at ${positionToChessNotation(mode.position)}`,
      }),
      promotionMenu,
    ),
  );
}

const gameOverMenuOptions: {
  name: string;
  description: string;
  value: GameOverOptions;
}[] = [
  { name: "New Game", description: "", value: "newGame" },
  { name: "Quit", description: "", value: "quit" },
];

function buildGameOverMenu(onSelect: (type: GameOverOptions) => void) {
  const gameOverMenu = Select({
    id: "gameOverMenu",
    width: 12,
    height: 4,
    backgroundColor: black,
    selectedBackgroundColor: black,
    focusedBackgroundColor: black,
    selectedTextColor: yellow,
    options: gameOverMenuOptions,
  });

  gameOverMenu.on(SelectRenderableEvents.ITEM_SELECTED, (_, option) => {
    onSelect(option.value);
  });

  gameOverMenu.focus();

  return gameOverMenu;
}

function gameOverModal(
  gameState: GameState,
  onSelect: (type: GameOverOptions) => void,
) {
  const { mode } = gameState.ui;
  if (mode.type !== "gameover") {
    throw new Error("gameOver modal opened when not in gameover mode");
  }

  const gameOverMenu = buildGameOverMenu(onSelect);

  const contentString =
    mode.result === "Checkmate"
      ? `Game Over - ${mode.colour === "black" ? "White" : "Black"} wins by checkmate`
      : "Game over - Stalemate";

  return Box(
    {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    Box(
      {
        padding: 1,
        marginBottom: 1,
        justifyContent: "center",
        backgroundColor: white,
      },
      Text({
        content: contentString,
        fg: "black",
      }),
    ),
    Box(
      {
        width: 16,
        height: 6,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: black,
      },
      gameOverMenu,
    ),
  );
}

function boardLayout(actions: Actions, gameState: GameState) {
  return Box(
    {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    capturedPieceBox(gameState.game.capturedPieces.black, "black"),
    chessboard(actions, gameState),
    capturedPieceBox(gameState.game.capturedPieces.white, "white"),
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
    boardLayout(actions, gameState),
    gameState.ui.mode.type === "promotion"
      ? promotionModal(gameState, actions.onConfirmPromotion)
      : null,
    gameState.ui.mode.type === "gameover"
      ? gameOverModal(gameState, actions.onConfirmGameOverChoice)
      : null,
  );
}

export { buildApp };
