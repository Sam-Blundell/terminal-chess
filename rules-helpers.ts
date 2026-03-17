import type { Piece, Move } from "./game";

function isCastleAttempt(piece: Piece, move: Move): boolean {
  return (
    piece.type === "king" &&
    move.from.y === move.to.y &&
    Math.abs(move.to.x - move.from.x) === 2
  );
}

export { isCastleAttempt };
