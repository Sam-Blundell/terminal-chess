import type { Board, Move, Piece } from "../game";
import type { GameState } from "../game-state";
import { getSquare } from "../game";
import { isEnPassantCapture } from "../special-moves";
import { isDiagonalLine, isStraightLine, pathIsClear } from "./geometry";

function isLegalPawnMove(game: GameState, piece: Piece, move: Move): boolean {
  const { board } = game;
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

  if (isEnPassantCapture(game, piece, move)) return true;

  const targetSquare = getSquare(board, move.to);
  const targetSquareOccupied = !!targetSquare;
  const targetSquareIsEnemy =
    targetSquare !== null && targetSquare.colour !== colour;

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
      pathIsClear(board, move)
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

export {
  isLegalPawnMove,
  isLegalRookMove,
  isLegalKnightMove,
  isLegalBishopMove,
  isLegalQueenMove,
  isLegalKingMove,
};
