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
    },
    ui: {
      focusedSquare: null,
      selectedSquare: null,
    },
  };
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

function applyMove(gameState: GameState, move: Move): void {
  const { board } = gameState.game;
  const piece = getSquare(board, move.from);
  if (!piece) {
    throw new Error("No piece at the source square");
  }
  const targetPiece = getSquare(board, move.to);
  if (targetPiece) {
    gameState.game.capturedPieces[targetPiece.colour].push(targetPiece);
  }
  setSquare(board, move.to, piece);
  setSquare(board, move.from, null);
}

function endTurn(gameState: GameState): void {
  // clear selected square
  gameState.ui.selectedSquare = null;
  // flip the turn colour
  gameState.game.currentTurn =
    gameState.game.currentTurn === "white" ? "black" : "white";
}

export { initGameState, getSquare, trySelectSquare, applyMove, endTurn, SIZE };
export type { PieceColour, Piece, Square, Board, GameState, Position, Move };
