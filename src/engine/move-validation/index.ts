import type { Move, Piece, PieceColour } from "../game";
import type { GameState } from "../game-state";

import { getSquare } from "../game";
import { isCastleAttempt } from "../special-moves";
import { applyMove } from "../move-application";
import { isSquareAttacked } from "./attacks";
import { pathIsClear } from "./geometry";
import {
  isLegalPawnMove,
  isLegalRookMove,
  isLegalKnightMove,
  isLegalBishopMove,
  isLegalQueenMove,
  isLegalKingMove,
} from "./piece-moves";

// This is one of the most expensive parts of the
// application as it creates a atructured clone
function wouldLeaveKingInCheck(
  game: GameState,
  move: Move,
  movingColour: PieceColour,
): boolean {
  const simulatedGame = structuredClone(game);
  applyMove(simulatedGame, move);

  const opponentColour = movingColour === "white" ? "black" : "white";
  const kingPosition = simulatedGame.kingPositions[movingColour];

  return isSquareAttacked(simulatedGame.board, kingPosition, opponentColour);
}

function isLegalCastlingMove(
  game: GameState,
  piece: Piece,
  move: Move,
): boolean {
  if (piece.type !== "king") return false;
  if (move.to.y !== move.from.y) return false;
  if (Math.abs(move.to.x - move.from.x) !== 2) return false;

  const { board, castlingRights } = game;
  const enemyColour = piece.colour === "white" ? "black" : "white";
  const homeRank = piece.colour === "white" ? 7 : 0;
  const isKingside = move.to.x === move.from.x + 2;

  if (move.from.x !== 4 || move.from.y !== homeRank) {
    return false;
  }

  const rookPosition = isKingside
    ? { x: 7, y: homeRank }
    : { x: 0, y: homeRank };

  const transitSquare = isKingside
    ? { x: move.from.x + 1, y: homeRank }
    : { x: move.from.x - 1, y: homeRank };

  const rook = getSquare(board, rookPosition);
  if (!rook || rook.type !== "rook" || rook.colour !== piece.colour) {
    return false;
  }

  const rights = castlingRights[piece.colour];
  if (rights.kingHasMoved) return false;
  if (isKingside && rights.kingsideRookHasMoved) return false;
  if (!isKingside && rights.queensideRookHasMoved) return false;

  if (isSquareAttacked(board, move.from, enemyColour)) return false;
  if (isSquareAttacked(board, transitSquare, enemyColour)) return false;
  if (isSquareAttacked(board, move.to, enemyColour)) return false;

  return pathIsClear(board, { from: move.from, to: rookPosition });
}

function isLegalMove(game: GameState, move: Move): boolean {
  const { board } = game;

  const startingPiece = getSquare(board, move.from);
  if (!startingPiece) {
    throw new Error("Missing piece at the from square");
  }

  const startAndTargetAreSame =
    move.from.x === move.to.x && move.from.y === move.to.y;
  if (startAndTargetAreSame) {
    return false;
  }

  const targetPiece = getSquare(board, move.to);
  const targetIsFriendly = targetPiece?.colour === startingPiece.colour;
  const targetIsEnemyKing = targetPiece?.type === "king" && !targetIsFriendly;

  if (isCastleAttempt(startingPiece.type, move)) {
    return isLegalCastlingMove(game, startingPiece, move);
  }

  if (targetIsEnemyKing || targetIsFriendly) return false;

  let movementLegal: boolean;
  switch (startingPiece.type) {
    case "pawn":
      movementLegal = isLegalPawnMove(game, startingPiece, move);
      break;
    case "rook":
      movementLegal = isLegalRookMove(board, move);
      break;
    case "knight":
      movementLegal = isLegalKnightMove(move);
      break;
    case "bishop":
      movementLegal = isLegalBishopMove(board, move);
      break;
    case "queen":
      movementLegal = isLegalQueenMove(board, move);
      break;
    case "king":
      movementLegal = isLegalKingMove(move);
      break;
  }

  if (!movementLegal) return false;

  return !wouldLeaveKingInCheck(game, move, startingPiece.colour);
}

export { isLegalMove, isSquareAttacked };
