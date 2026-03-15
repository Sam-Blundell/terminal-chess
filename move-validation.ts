import type { Piece, Board, Move } from "./game";
import { getSquare } from "./game";

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

export { isLegalMove };
