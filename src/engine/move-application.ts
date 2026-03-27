import type { Position, Piece, Move } from "./game";
import type { CastlingRights, GameState } from "./game-state";
import { getSquare, setSquare } from "./game";
import {
  isCastleAttempt,
  isEnPassantCapture,
  isPawnDoubleMove,
} from "./special-moves";

function updateCastlingRights(
  castlingRights: CastlingRights,
  position: Position,
  piece: Piece,
): void {
  if (piece.colour === "black") {
    if (piece.type === "king") {
      castlingRights.black.kingHasMoved = true;
      return;
    }
    if (position.x === 0 && position.y === 0) {
      castlingRights.black.queensideRookHasMoved = true;
    } else if (position.x === 7 && position.y === 0) {
      castlingRights.black.kingsideRookHasMoved = true;
    }
  } else {
    if (piece.type === "king") {
      castlingRights.white.kingHasMoved = true;
      return;
    }
    if (position.x === 0 && position.y === 7) {
      castlingRights.white.queensideRookHasMoved = true;
    } else if (position.x === 7 && position.y === 7) {
      castlingRights.white.kingsideRookHasMoved = true;
    }
  }
}

function updateCastlingRightsOnCapture(
  castlingRights: CastlingRights,
  capturedPosition: Position,
  capturedPiece: Piece,
): void {
  if (capturedPiece.type !== "rook") return;

  const { x, y } = capturedPosition;

  if (capturedPiece.colour === "black") {
    if (x === 0 && y === 0) {
      castlingRights.black.queensideRookHasMoved = true;
    } else if (x === 7 && y === 0) {
      castlingRights.black.kingsideRookHasMoved = true;
    }
  } else {
    if (x === 0 && y === 7) {
      castlingRights.white.queensideRookHasMoved = true;
    } else if (x === 7 && y === 7) {
      castlingRights.white.kingsideRookHasMoved = true;
    }
  }
}

function applyCastling(game: GameState, piece: Piece, move: Move): void {
  const homeRank = piece.colour === "white" ? 7 : 0;
  const isKingside = move.to.x === move.from.x + 2;

  const rookPosition = isKingside
    ? { x: 7, y: homeRank }
    : { x: 0, y: homeRank };

  const rook = getSquare(game.board, rookPosition);
  if (!rook) {
    throw new Error("No rook at castling position");
  }

  const newRookPosition = isKingside
    ? { x: move.from.x + 1, y: homeRank }
    : { x: move.from.x - 1, y: homeRank };

  const newKingPosition = isKingside
    ? { x: move.from.x + 2, y: homeRank }
    : { x: move.from.x - 2, y: homeRank };

  setSquare(game.board, newKingPosition, piece);
  setSquare(game.board, move.from, null);
  setSquare(game.board, newRookPosition, rook);
  setSquare(game.board, rookPosition, null);
  game.kingPositions[piece.colour] = newKingPosition;
  game.castlingRights[piece.colour].kingHasMoved = true;
  game.castlingRights[piece.colour][
    isKingside ? "kingsideRookHasMoved" : "queensideRookHasMoved"
  ] = true;
}

function setEnPassant(game: GameState, move: Move): void {
  const yPos = (move.from.y + move.to.y) / 2;
  game.enPassant = { x: move.from.x, y: yPos };
}

function applyEnPassantCapture(game: GameState, move: Move): void {
  const { board } = game;
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

  game.capturedPieces[enemyPawn.colour].push(enemyPawn);

  setSquare(board, move.from, null);
  setSquare(board, enemyPawnPosition, null);
  setSquare(board, move.to, piece);
}

function applyMove(game: GameState, move: Move): void {
  const { board, castlingRights } = game;
  const piece = getSquare(board, move.from);
  if (!piece) {
    throw new Error("No piece at the source square");
  }

  if (isCastleAttempt(piece.type, move)) {
    game.enPassant = null;
    applyCastling(game, piece, move);
    return;
  }

  if (isEnPassantCapture(game, piece, move)) {
    game.enPassant = null;
    applyEnPassantCapture(game, move);
    return;
  }

  game.enPassant = null;

  if (isPawnDoubleMove(piece.type, move)) {
    setEnPassant(game, move);
  }
  const targetPiece = getSquare(board, move.to);

  if (targetPiece) {
    game.capturedPieces[targetPiece.colour].push(targetPiece);
    updateCastlingRightsOnCapture(castlingRights, move.to, targetPiece);
  }
  setSquare(board, move.to, piece);
  setSquare(board, move.from, null);
  if (piece.type === "king") {
    game.kingPositions[piece.colour] = move.to;
  }
  updateCastlingRights(castlingRights, move.from, piece);
}

export { applyMove };
