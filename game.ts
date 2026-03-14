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
type SelectedSquare = Position | null;
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
  if (square) {
    gameState.ui.selectedSquare = position;
    return true;
  }
  return false;
}

function isStraightLine(move: Move): boolean {
  const xChanged = move.from.x !== move.to.x;
  const yChanged = move.from.y !== move.to.y;
  return (xChanged && !yChanged) || (yChanged && !xChanged);
}

function isDiagonalLine(move: Move): boolean {
  return (
    Math.abs(move.to.x - move.from.x) === Math.abs(move.to.y - move.from.y)
  );
}

function pathIsClear(board: Board, move: Move): boolean {
  const xDiff = move.to.x - move.from.x;
  const yDiff = move.to.y - move.from.y;

  const xStep = xDiff === 0 ? 0 : xDiff > 0 ? 1 : -1;
  const yStep = yDiff === 0 ? 0 : yDiff > 0 ? 1 : -1;

  const pointer = { x: move.from.x + xStep, y: move.from.y + yStep };

  while (pointer.x !== move.to.x || pointer.y !== move.to.y) {
    if (getSquare(board, pointer)) {
      return false;
    }
    pointer.x += xStep;
    pointer.y += yStep;
  }

  return true;
}

function isLegalPawnMove(piece: Piece, board: Board, move: Move): boolean {
  const { colour } = piece;
  const deltaX = move.to.x - move.from.x;
  const deltaY = move.to.y - move.from.y;
  const forwardDistance = Math.abs(deltaY);
  const horizontalDistance = Math.abs(deltaX);
  const movingUp = deltaY <= 0;
  const movingDown = deltaY >= 0;
  const isFirstMove =
    (colour === "black" && move.from.y === 1) ||
    (colour === "white" && move.from.y === 6);

  // check correct direction
  if ((colour === "black" && movingUp) || (colour === "white" && movingDown)) {
    return false;
  }

  if (forwardDistance > 2 || horizontalDistance > 1) return false;

  const targetSquare = getSquare(board, move.to);
  const targetSquareOccupied = !!targetSquare;
  const targetSquareIsEnemy =
    targetSquare !== null && targetSquare.colour !== colour;
  const clearPath = pathIsClear(board, move);

  // moving diagonally
  if (horizontalDistance === 1) {
    return forwardDistance === 1 && targetSquareIsEnemy;
  }

  // moving straight
  if (horizontalDistance === 0) {
    // one square
    if (forwardDistance === 1 && !targetSquareOccupied) return true;
    // two squares
    if (
      forwardDistance === 2 &&
      isFirstMove &&
      !targetSquareOccupied &&
      clearPath
    ) {
      return true;
    }
  }

  return false;
}

function isLegalRookMove(board: Board, move: Move): boolean {
  if (!isStraightLine(move)) {
    return false;
  }
  return pathIsClear(board, move);
}

function isLegalKnightMove(move: Move): boolean {
  const deltaX = Math.abs(move.to.x - move.from.x);
  const deltaY = Math.abs(move.to.y - move.from.y);
  return (deltaX === 1 && deltaY === 2) || (deltaX === 2 && deltaY === 1);
}

function isLegalBishopMove(board: Board, move: Move): boolean {
  if (!isDiagonalLine(move)) {
    return false;
  }
  return pathIsClear(board, move);
}

function isLegalQueenMove(board: Board, move: Move): boolean {
  if (!isDiagonalLine(move) && !isStraightLine(move)) {
    return false;
  }
  return pathIsClear(board, move);
}

function isLegalKingMove(move: Move): boolean {
  const deltaX = Math.abs(move.to.x - move.from.x);
  const deltaY = Math.abs(move.to.y - move.from.y);
  return deltaX <= 1 && deltaY <= 1;
}

function isLegalMove(board: Board, move: Move): boolean {
  // common checks for all pieces
  const startingPiece = getSquare(board, move.from);
  if (!startingPiece) {
    throw new Error("No piece at the source square");
  }
  const startAndTargetAreSame =
    move.from.x === move.to.x && move.from.y === move.to.y;
  if (startAndTargetAreSame) {
    return false;
  }
  const targetPiece = getSquare(board, move.to);
  const targetIsFriendly = targetPiece?.colour === startingPiece.colour;
  if (targetIsFriendly) {
    return false;
  }

  // specific piece checks

  switch (startingPiece.type) {
    case "pawn":
      return isLegalPawnMove(startingPiece, board, move);
    case "rook":
      return isLegalRookMove(board, move);
    case "knight":
      return isLegalKnightMove(move);
    case "bishop":
      return isLegalBishopMove(board, move);
    case "queen":
      return isLegalQueenMove(board, move);
    case "king":
      return isLegalKingMove(move);
  }
}

function movePiece(board: Board, move: Move): void {
  const piece = getSquare(board, move.from);
  if (!piece) {
    throw new Error("No piece at the source square");
  }
  setSquare(board, move.to, piece);
  setSquare(board, move.from, null);
}

export {
  initGameState,
  getSquare,
  trySelectSquare,
  isLegalMove,
  movePiece,
  SIZE,
};
export type { Square, Board, SelectedSquare, GameState, Position };
