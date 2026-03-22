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

function applyOffset(position: Position, offset: Position): Position {
  return { x: position.x + offset.x, y: position.y + offset.y };
}

export { SIZE, createBoard, getSquare, tryGetSquare, applyOffset, setSquare };
export type { PieceColour, PieceType, Piece, Square, Board, Position, Move };
