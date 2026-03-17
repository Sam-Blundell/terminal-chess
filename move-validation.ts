import type {
  Piece,
  Board,
  Move,
  Position,
  PieceColour,
  GameState,
} from "./game";
import { getSquare, tryGetSquare, applyOffset, applyMove } from "./game";
import { isCastleAttempt } from "./rules-helpers";

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

function wouldLeaveKingInCheck(
  gameState: GameState,
  move: Move,
  movingColour: PieceColour,
) {
  const simulatedGameState = structuredClone(gameState);
  applyMove(simulatedGameState, move);

  const opponentColour = movingColour === "white" ? "black" : "white";
  const kingPosition = simulatedGameState.game.kingPositions[movingColour];

  return isSquareAttacked(
    simulatedGameState.game.board,
    kingPosition,
    opponentColour,
  );
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

function isLegalCastlingMove(
  gameState: GameState,
  piece: Piece,
  move: Move,
): boolean {
  if (piece.type !== "king") return false;
  if (move.to.y !== move.from.y) return false;
  if (Math.abs(move.to.x - move.from.x) !== 2) return false;

  const { board, castlingRights } = gameState.game;
  const enemyColour = piece.colour === "white" ? "black" : "white";
  const homeRank = piece.colour === "white" ? 7 : 0;
  const isKingside = move.to.x === move.from.x + 2;

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

function isLegalMove(gameState: GameState, move: Move): boolean {
  const { board } = gameState.game;
  // common checks for all pieces
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

  // check special castling case
  if (isCastleAttempt(startingPiece, move)) {
    return isLegalCastlingMove(gameState, startingPiece, move);
  }

  if (targetIsEnemyKing || targetIsFriendly) return false;

  // specific piece movement checks
  let movementLegal: boolean;

  switch (startingPiece.type) {
    case "pawn":
      movementLegal = isLegalPawnMove(startingPiece, board, move);
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

  return !wouldLeaveKingInCheck(gameState, move, startingPiece.colour);
}

export { isLegalMove, isSquareAttacked };
