const SIZE = 8;

type PieceColour = "white" | "black";
type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
type Piece = {
  type: PieceType;
  colour: PieceColour;
};
type Square = Piece | null;
type Board = Square[][];
type SelectedSquare = { x: number; y: number } | null;
type GameState = {
  game: {
    board: Board;
  };
  ui: {
    selectedSquare: SelectedSquare;
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
    },
    ui: {
      selectedSquare: null,
    },
  };
}

function getSquare(board: Board, x: number, y: number): Square {
  const row = board[y];
  if (row === undefined) {
    throw new Error("Invalid board coordinates");
  }
  if (row[x] === undefined) {
    throw new Error("Invalid board coordinates");
  }
  return row[x];
}

function setSquare(board: Board, x: number, y: number, newValue: Square): void {
  const row = board[y];
  if (row === undefined) {
    throw new Error("Invalid board coordinates");
  }
  if (row[x] === undefined) {
    throw new Error("Invalid board coordinates");
  }
  row[x] = newValue;
}

function selectSquare(gameState: GameState, x: number, y: number): boolean {
  const square = getSquare(gameState.game.board, x, y);
  if (square) {
    gameState.ui.selectedSquare = { x, y };
    return true;
  }
  return false;
}

function movePiece(
  board: Board,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): void {
  if (fromX === toX && fromY === toY) {
    return;
  }
  const piece = getSquare(board, fromX, fromY);
  if (!piece) {
    throw new Error("No piece at the source square");
  }
  setSquare(board, toX, toY, piece);
  setSquare(board, fromX, fromY, null);
}

export { initGameState, getSquare, selectSquare, movePiece, SIZE };
export type { Square, Board, SelectedSquare, GameState };
