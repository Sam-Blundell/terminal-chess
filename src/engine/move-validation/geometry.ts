import type { Board, Move, Piece, Position } from "../game";
import { applyOffset, getSquare, tryGetSquare } from "../game";

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

  if (!isStraightLine(move) && !isDiagonalLine(move)) {
    throw new Error("pathIsClear called with non-linear move");
  }

  const step = {
    x: xDiff === 0 ? 0 : xDiff > 0 ? 1 : -1,
    y: yDiff === 0 ? 0 : yDiff > 0 ? 1 : -1,
  };

  let pointer = applyOffset(move.from, step);

  while (pointer.x !== move.to.x || pointer.y !== move.to.y) {
    if (getSquare(board, pointer)) {
      return false;
    }
    pointer = applyOffset(pointer, step);
  }

  return true;
}

function searchRay(
  board: Board,
  position: Position,
  direction: Position,
): Piece | null {
  let pointer = applyOffset(position, direction);

  while (true) {
    const square = tryGetSquare(board, pointer);
    if (square === undefined) return null;
    if (square !== null) return square;
    pointer = applyOffset(pointer, direction);
  }
}

export { isStraightLine, isDiagonalLine, pathIsClear, searchRay };
