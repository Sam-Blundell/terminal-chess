import type { Piece, Move, PieceType } from "./game";
import type { GameState } from "./game-state";
import { getSquare } from "./game";

function isCastleAttempt(type: PieceType, move: Move): boolean {
  return (
    type === "king" &&
    move.from.y === move.to.y &&
    Math.abs(move.to.x - move.from.x) === 2
  );
}

function isPawnDoubleMove(type: PieceType, move: Move): boolean {
  return (
    type === "pawn" &&
    move.from.x === move.to.x &&
    Math.abs(move.to.y - move.from.y) === 2
  );
}

function isPromotionMove(piece: Piece, move: Move): boolean {
  if (piece.type !== "pawn") return false;
  return (
    (piece.colour === "white" && move.to.y === 0) ||
    (piece.colour === "black" && move.to.y === 7)
  );
}

function isEnPassantCapture(
  game: GameState,
  piece: Piece,
  move: Move,
): boolean {
  if (piece.type !== "pawn") return false;

  const enPassant = game.enPassant;
  if (!enPassant) return false;

  const xDiff = Math.abs(move.to.x - move.from.x);
  const yDiff = Math.abs(move.to.y - move.from.y);
  if (xDiff !== 1 || yDiff !== 1) return false;

  if (enPassant.x !== move.to.x || enPassant.y !== move.to.y) {
    return false;
  }

  if (getSquare(game.board, move.to) !== null) return false;

  const capturedPawnYOffset = piece.colour === "black" ? -1 : 1;
  const enemyPawn = getSquare(game.board, {
    x: move.to.x,
    y: move.to.y + capturedPawnYOffset,
  });

  if (enemyPawn?.type !== "pawn") return false;
  if (enemyPawn.colour === piece.colour) return false;

  return true;
}

export {
  isCastleAttempt,
  isPromotionMove,
  isPawnDoubleMove,
  isEnPassantCapture,
};
