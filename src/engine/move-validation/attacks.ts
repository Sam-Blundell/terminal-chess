import type { Board, PieceColour, Position } from "../game";
import { applyOffset, tryGetSquare } from "../game";
import { searchRay } from "./geometry";

const offsets = {
  straight: [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ],
  diagonal: [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: 1 },
  ],
  knight: [
    { x: 1, y: -2 },
    { x: 2, y: -1 },
    { x: 2, y: 1 },
    { x: 1, y: 2 },
    { x: -1, y: 2 },
    { x: -2, y: 1 },
    { x: -2, y: -1 },
    { x: -1, y: -2 },
  ],
  blackPawn: [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
  ],
  whitePawn: [
    { x: -1, y: 1 },
    { x: 1, y: 1 },
  ],
} as const;

function isPawnAttacking(
  board: Board,
  position: Position,
  colour: PieceColour,
): boolean {
  const offsetsForColour =
    colour === "white" ? offsets.whitePawn : offsets.blackPawn;
  const attackers = offsetsForColour.map((offset) =>
    tryGetSquare(board, applyOffset(position, offset)),
  );
  return attackers.some((piece) => {
    return piece?.colour === colour && piece.type === "pawn";
  });
}

function isKnightAttacking(
  board: Board,
  position: Position,
  colour: PieceColour,
): boolean {
  const attackers = offsets.knight.map((offset) =>
    tryGetSquare(board, applyOffset(position, offset)),
  );
  return attackers.some((piece) => {
    return piece?.colour === colour && piece.type === "knight";
  });
}

function isKingAttacking(
  board: Board,
  position: Position,
  colour: PieceColour,
): boolean {
  const offsetsForKing = [...offsets.straight, ...offsets.diagonal];
  const attackers = offsetsForKing.map((offset) =>
    tryGetSquare(board, applyOffset(position, offset)),
  );
  return attackers.some((piece) => {
    return piece?.colour === colour && piece.type === "king";
  });
}

function isBishopOrQueenAttacking(
  board: Board,
  position: Position,
  colour: PieceColour,
): boolean {
  const attackers = offsets.diagonal.map((offset) =>
    searchRay(board, position, offset),
  );
  return attackers.some((piece) => {
    return (
      piece?.colour === colour &&
      (piece.type === "bishop" || piece.type === "queen")
    );
  });
}

function isRookOrQueenAttacking(
  board: Board,
  position: Position,
  colour: PieceColour,
): boolean {
  const attackers = offsets.straight.map((offset) =>
    searchRay(board, position, offset),
  );
  return attackers.some((piece) => {
    return (
      piece?.colour === colour &&
      (piece.type === "rook" || piece.type === "queen")
    );
  });
}

function isSquareAttacked(
  board: Board,
  position: Position,
  byColour: PieceColour,
): boolean {
  if (isPawnAttacking(board, position, byColour)) return true;
  if (isKnightAttacking(board, position, byColour)) return true;
  if (isKingAttacking(board, position, byColour)) return true;
  if (isBishopOrQueenAttacking(board, position, byColour)) return true;
  if (isRookOrQueenAttacking(board, position, byColour)) return true;
  return false;
}

export { isSquareAttacked };
