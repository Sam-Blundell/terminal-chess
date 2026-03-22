import type { Position, Piece, Move } from "./game";
import type { GameState } from "./state";
import { getSquare, setSquare } from "./game";
import {
  isCastleAttempt,
  isEnPassantCapture,
  isPawnDoubleMove,
} from "./special-moves";

// Castling rights are invalidated when the king moves or
// when any move originates from an original rook square.
function updateCastlingRights(
  gameState: GameState,
  position: Position,
  piece: Piece,
): void {
  if (piece.colour === "black") {
    if (piece.type === "king") {
      gameState.game.castlingRights.black.kingHasMoved = true;
      return;
    }
    if (position.x === 0 && position.y === 0) {
      gameState.game.castlingRights.black.queensideRookHasMoved = true;
    } else if (position.x === 7 && position.y === 0) {
      gameState.game.castlingRights.black.kingsideRookHasMoved = true;
    }
  } else {
    if (piece.type === "king") {
      gameState.game.castlingRights.white.kingHasMoved = true;
      return;
    }
    if (position.x === 0 && position.y === 7) {
      gameState.game.castlingRights.white.queensideRookHasMoved = true;
    } else if (position.x === 7 && position.y === 7) {
      gameState.game.castlingRights.white.kingsideRookHasMoved = true;
    }
  }
}

function applyCastling(gameState: GameState, piece: Piece, move: Move): void {
  const homeRank = piece.colour === "white" ? 7 : 0;
  const isKingside = move.to.x === move.from.x + 2;

  const rookPosition = isKingside
    ? { x: 7, y: homeRank }
    : { x: 0, y: homeRank };

  const rook = getSquare(gameState.game.board, rookPosition);
  if (!rook) {
    throw new Error("No rook at castling position");
  }

  const newRookPosition = isKingside
    ? { x: move.from.x + 1, y: homeRank }
    : { x: move.from.x - 1, y: homeRank };

  const newKingPosition = isKingside
    ? { x: move.from.x + 2, y: homeRank }
    : { x: move.from.x - 2, y: homeRank };

  setSquare(gameState.game.board, newKingPosition, piece);
  setSquare(gameState.game.board, move.from, null);
  setSquare(gameState.game.board, newRookPosition, rook);
  setSquare(gameState.game.board, rookPosition, null);
  gameState.game.kingPositions[piece.colour] = newKingPosition;
  gameState.game.castlingRights[piece.colour].kingHasMoved = true;
  gameState.game.castlingRights[piece.colour][
    isKingside ? "kingsideRookHasMoved" : "queensideRookHasMoved"
  ] = true;
}

function setEnPassant(gameState: GameState, move: Move): void {
  const yPos = (move.from.y + move.to.y) / 2;
  gameState.game.enPassant = { x: move.from.x, y: yPos };
}

function applyEnPassantCapture(gameState: GameState, move: Move): void {
  const { board } = gameState.game;
  const piece = getSquare(board, move.from);

  if (!piece) {
    throw new Error("origin square empty inside applyEnPassantCapture");
  }

  if (piece.type !== "pawn") {
    throw new Error("non-pawn passed to applyEnPassantCapture");
  }

  const capturedPawnYOffset = piece.colour === "black" ? -1 : 1;
  const enemyPawnPosition = {
    x: move.to.x,
    y: move.to.y + capturedPawnYOffset,
  };

  const enemyPawn = getSquare(board, enemyPawnPosition);
  if (
    !enemyPawn ||
    enemyPawn.type !== "pawn" ||
    enemyPawn.colour === piece.colour
  ) {
    throw new Error("invalid captured pawn inside applyEnPassantCapture");
  }

  gameState.game.capturedPieces[enemyPawn.colour].push(enemyPawn);

  setSquare(board, move.from, null);
  setSquare(board, enemyPawnPosition, null);
  setSquare(board, move.to, piece);
}

function applyMove(gameState: GameState, move: Move): void {
  const { board } = gameState.game;
  const piece = getSquare(board, move.from);
  if (!piece) {
    throw new Error("No piece at the source square");
  }

  if (isCastleAttempt(piece, move)) {
    gameState.game.enPassant = null;
    applyCastling(gameState, piece, move);
    return;
  }

  if (isEnPassantCapture(gameState, piece, move)) {
    gameState.game.enPassant = null;
    applyEnPassantCapture(gameState, move);
    return;
  }

  gameState.game.enPassant = null;

  if (isPawnDoubleMove(piece, move)) {
    setEnPassant(gameState, move);
  }
  const targetPiece = getSquare(board, move.to);

  if (targetPiece) {
    gameState.game.capturedPieces[targetPiece.colour].push(targetPiece);
  }
  setSquare(board, move.to, piece);
  setSquare(board, move.from, null);
  if (piece.type === "king") {
    gameState.game.kingPositions[piece.colour] = move.to;
  }
  updateCastlingRights(gameState, move.from, piece);
}

export { applyMove };
