import { isCastleAttempt } from "./rules-helpers";

const SIZE = 8;

type PieceColour = "white" | "black";
type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
type Piece = {
  type: PieceType;
  colour: PieceColour;
};
type Square = Piece | null;
type Board = Square[][];
type Position = { x: number; y: number };
type Move = { from: Position; to: Position };
type GameState = {
  game: {
    board: Board;
    currentTurn: PieceColour;
    capturedPieces: {
      white: Piece[];
      black: Piece[];
    };
    kingPositions: {
      white: Position;
      black: Position;
    };
    castlingRights: {
      white: {
        kingHasMoved: boolean;
        kingsideRookHasMoved: boolean;
        queensideRookHasMoved: boolean;
      };
      black: {
        kingHasMoved: boolean;
        kingsideRookHasMoved: boolean;
        queensideRookHasMoved: boolean;
      };
    };
  };
  ui: {
    focusedSquare: Position | null;
    selectedSquare: Position | null;
  };
};

function createBoard(): Board {
  return [
    [
      { colour: "black", type: "rook" },
      { colour: "black", type: "knight" },
      { colour: "black", type: "bishop" },
      { colour: "black", type: "queen" },
      { colour: "black", type: "king" },
      { colour: "black", type: "bishop" },
      { colour: "black", type: "knight" },
      { colour: "black", type: "rook" },
    ],
    Array.from({ length: SIZE }, () => ({ colour: "black", type: "pawn" })),
    Array.from({ length: SIZE }, () => null),
    Array.from({ length: SIZE }, () => null),
    Array.from({ length: SIZE }, () => null),
    Array.from({ length: SIZE }, () => null),
    Array.from({ length: SIZE }, () => ({ colour: "white", type: "pawn" })),
    [
      { colour: "white", type: "rook" },
      { colour: "white", type: "knight" },
      { colour: "white", type: "bishop" },
      { colour: "white", type: "queen" },
      { colour: "white", type: "king" },
      { colour: "white", type: "bishop" },
      { colour: "white", type: "knight" },
      { colour: "white", type: "rook" },
    ],
  ];
}

function initGameState(): GameState {
  return {
    game: {
      board: createBoard(),
      currentTurn: "white",
      capturedPieces: {
        white: [],
        black: [],
      },
      kingPositions: {
        white: { x: 4, y: 7 },
        black: { x: 4, y: 0 },
      },
      castlingRights: {
        white: {
          kingHasMoved: false,
          kingsideRookHasMoved: false,
          queensideRookHasMoved: false,
        },
        black: {
          kingHasMoved: false,
          kingsideRookHasMoved: false,
          queensideRookHasMoved: false,
        },
      },
    },
    ui: {
      focusedSquare: null,
      selectedSquare: null,
    },
  };
}

function setFocusedSquare(gameState: GameState, position: Position): void {
  gameState.ui.focusedSquare = position;
}
function clearFocusedSquare(gameState: GameState): boolean {
  if (gameState.ui.focusedSquare) {
    gameState.ui.focusedSquare = null;
    return true;
  }
  return false;
}

function getSquare(board: Board, position: Position): Square {
  const { x, y } = position;
  const row = board[y];
  if (row === undefined) {
    throw new Error("Invalid board coordinates");
  }
  if (row[x] === undefined) {
    throw new Error("Invalid board coordinates");
  }
  return row[x];
}

function tryGetSquare(board: Board, position: Position): Square | undefined {
  const { x, y } = position;
  const row = board[y];
  if (row === undefined) return undefined;
  return row[x];
}

function setSquare(board: Board, position: Position, newValue: Square): void {
  const { x, y } = position;
  const row = board[y];
  if (row === undefined) {
    throw new Error("Invalid board coordinates");
  }
  if (row[x] === undefined) {
    throw new Error("Invalid board coordinates");
  }
  row[x] = newValue;
}

function trySelectSquare(gameState: GameState, position: Position): boolean {
  const square = getSquare(gameState.game.board, position);
  const pieceIsCurrentTurnColour =
    square !== null && gameState.game.currentTurn === square.colour;
  if (pieceIsCurrentTurnColour) {
    gameState.ui.selectedSquare = position;
    return true;
  }
  return false;
}

// Castling rights are invalidated when the king moves or
// when any move originates from an original rook square.
function updateCastlingRights(
  gameState: GameState,
  position: Position,
  piece: Piece,
) {
  if (piece.colour === "black") {
    if (piece.type === "king") {
      gameState.game.castlingRights.black.kingHasMoved = true;
      console.log(JSON.stringify(gameState.game.castlingRights));

      return;
    }
    if (position.x === 0 && position.y === 0) {
      gameState.game.castlingRights.black.queensideRookHasMoved = true;
      console.log(JSON.stringify(gameState.game.castlingRights));
    } else if (position.x === 7 && position.y === 0) {
      gameState.game.castlingRights.black.kingsideRookHasMoved = true;
      console.log(JSON.stringify(gameState.game.castlingRights));
    }
  } else {
    if (piece.type === "king") {
      gameState.game.castlingRights.white.kingHasMoved = true;
      console.log(JSON.stringify(gameState.game.castlingRights));
      return;
    }
    if (position.x === 0 && position.y === 7) {
      gameState.game.castlingRights.white.queensideRookHasMoved = true;
      console.log(JSON.stringify(gameState.game.castlingRights));
    } else if (position.x === 7 && position.y === 7) {
      gameState.game.castlingRights.white.kingsideRookHasMoved = true;
      console.log(JSON.stringify(gameState.game.castlingRights));
    }
  }
}

function applyCastling(gameState: GameState, piece: Piece, move: Move): void {
  const homeRank = piece.colour === "white" ? 7 : 0;
  const isKingside = move.to.x === move.from.x + 2;

  const rookPosition = isKingside
    ? { x: 7, y: homeRank }
    : { x: 0, y: homeRank };

  const rook = getSquare(gameState.game.board, rookPosition);
  if (!rook) {
    throw new Error("No rook at castling position");
  }

  const newRookPosition = isKingside
    ? { x: move.from.x + 1, y: homeRank }
    : { x: move.from.x - 1, y: homeRank };

  const newKingPosition = isKingside
    ? { x: move.from.x + 2, y: homeRank }
    : { x: move.from.x - 2, y: homeRank };

  setSquare(gameState.game.board, newKingPosition, piece);
  setSquare(gameState.game.board, move.from, null);
  setSquare(gameState.game.board, newRookPosition, rook);
  setSquare(gameState.game.board, rookPosition, null);
  gameState.game.kingPositions[piece.colour] = newKingPosition;
  gameState.game.castlingRights[piece.colour].kingHasMoved = true;
  gameState.game.castlingRights[piece.colour][
    isKingside ? "kingsideRookHasMoved" : "queensideRookHasMoved"
  ] = true;
}

function applyMove(gameState: GameState, move: Move): void {
  const { board } = gameState.game;
  const piece = getSquare(board, move.from);
  if (!piece) {
    throw new Error("No piece at the source square");
  }
  if (isCastleAttempt(piece, move)) {
    applyCastling(gameState, piece, move);
    return;
  }
  const targetPiece = getSquare(board, move.to);

  if (targetPiece) {
    gameState.game.capturedPieces[targetPiece.colour].push(targetPiece);
  }
  setSquare(board, move.to, piece);
  setSquare(board, move.from, null);
  if (piece.type === "king") {
    gameState.game.kingPositions[piece.colour] = move.to;
  }
  updateCastlingRights(gameState, move.from, piece);
}

function endTurn(gameState: GameState): void {
  // clear selected square
  gameState.ui.selectedSquare = null;
  // flip the turn colour
  gameState.game.currentTurn =
    gameState.game.currentTurn === "white" ? "black" : "white";
}

function applyOffset(position: Position, offset: Position) {
  return { x: position.x + offset.x, y: position.y + offset.y };
}

export {
  SIZE,
  initGameState,
  getSquare,
  tryGetSquare,
  trySelectSquare,
  applyMove,
  endTurn,
  setFocusedSquare,
  clearFocusedSquare,
  applyOffset,
  setSquare,
};
export type { PieceColour, Piece, Square, Board, GameState, Position, Move };
