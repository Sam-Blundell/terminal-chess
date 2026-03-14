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

function isStraightLine(x1: number, y1: number, x2: number, y2: number) {
  const xChanged = x1 !== x2;
  const yChanged = y1 !== y2;
  return (xChanged && !yChanged) || (yChanged && !xChanged);
}

function isDiagonalLine(x1: number, y1: number, x2: number, y2: number) {
  return Math.abs(x2 - x1) === Math.abs(y2 - y1);
}

function pathIsClear(
  board: Board,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): boolean {
  const xDiff = x2 - x1;
  const yDiff = y2 - y1;

  const xStep = xDiff === 0 ? 0 : xDiff > 0 ? 1 : -1;
  const yStep = yDiff === 0 ? 0 : yDiff > 0 ? 1 : -1;

  let xPointer = x1 + xStep;
  let yPointer = y1 + yStep;

  while (xPointer !== x2 || yPointer !== y2) {
    if (getSquare(board, xPointer, yPointer)) {
      return false;
    }
    xPointer += xStep;
    yPointer += yStep;
  }

  return true;
}

function isLegalPawnMove(
  piece: Piece,
  board: Board,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): boolean {
  const { colour } = piece;
  const deltaX = toX - fromX;
  const deltaY = toY - fromY;
  const forwardDistance = Math.abs(deltaY);
  const horizontalDistance = Math.abs(deltaX);
  const movingUp = deltaY <= 0;
  const movingDown = deltaY >= 0;
  const isFirstMove =
    (colour === "black" && fromY === 1) || (colour === "white" && fromY === 6);

  // check correct direction
  if ((colour === "black" && movingUp) || (colour === "white" && movingDown)) {
    return false;
  }

  if (forwardDistance > 2 || horizontalDistance > 1) return false;

  const targetSquare = getSquare(board, toX, toY);
  const targetSquareOccupied = !!targetSquare;
  const targetSquareIsEnemy =
    targetSquare !== null && targetSquare.colour !== colour;
  const clearPath = pathIsClear(board, fromX, fromY, toX, toY);

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

function isLegalRookMove(
  board: Board,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): boolean {
  if (!isStraightLine(fromX, fromY, toX, toY)) {
    return false;
  }
  return pathIsClear(board, fromX, fromY, toX, toY);
}

function isLegalKnightMove(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): boolean {
  const deltaX = Math.abs(toX - fromX);
  const deltaY = Math.abs(toY - fromY);
  return (deltaX === 1 && deltaY === 2) || (deltaX === 2 && deltaY === 1);
}

function isLegalBishopMove(
  board: Board,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): boolean {
  if (!isDiagonalLine(fromX, fromY, toX, toY)) {
    return false;
  }
  return pathIsClear(board, fromX, fromY, toX, toY);
}

function isLegalQueenMove(
  board: Board,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): boolean {
  if (
    !isDiagonalLine(fromX, fromY, toX, toY) &&
    !isStraightLine(fromX, fromY, toX, toY)
  ) {
    return false;
  }
  return pathIsClear(board, fromX, fromY, toX, toY);
}

function isLegalKingMove(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): boolean {
  const deltaX = Math.abs(toX - fromX);
  const deltaY = Math.abs(toY - fromY);
  return deltaX <= 1 && deltaY <= 1;
}

function isLegalMove(
  board: Board,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): boolean {
  // common checks for all pieces
  const startingPiece = getSquare(board, fromX, fromY);
  if (!startingPiece) {
    throw new Error("No piece at the source square");
  }
  const startAndTargetAreSame = fromX === toX && fromY === toY;
  if (startAndTargetAreSame) {
    return false;
  }
  const targetPiece = getSquare(board, toX, toY);
  const targetIsFriendly = targetPiece?.colour === startingPiece.colour;
  if (targetIsFriendly) {
    return false;
  }

  // specific piece checks

  switch (startingPiece.type) {
    case "pawn":
      return isLegalPawnMove(startingPiece, board, fromX, fromY, toX, toY);
    case "rook":
      return isLegalRookMove(board, fromX, fromY, toX, toY);
    case "knight":
      return isLegalKnightMove(fromX, fromY, toX, toY);
    case "bishop":
      return isLegalBishopMove(board, fromX, fromY, toX, toY);
    case "queen":
      return isLegalQueenMove(board, fromX, fromY, toX, toY);
    case "king":
      return isLegalKingMove(fromX, fromY, toX, toY);
  }
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

function trySelectSquare(gameState: GameState, x: number, y: number): boolean {
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
  const piece = getSquare(board, fromX, fromY);
  if (!piece) {
    throw new Error("No piece at the source square");
  }
  setSquare(board, toX, toY, piece);
  setSquare(board, fromX, fromY, null);
}

export {
  initGameState,
  getSquare,
  trySelectSquare,
  isLegalMove,
  movePiece,
  SIZE,
};
export type { Square, Board, SelectedSquare, GameState };
