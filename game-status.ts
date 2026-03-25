import type { PieceColour } from "./game";
import type { GameState } from "./state";
import { getSquare, SIZE } from "./game";
import { isLegalMove, isSquareAttacked } from "./move-validation";

function kingIsInCheck(gameState: GameState, colour: PieceColour): boolean {
  const kingPos = gameState.game.kingPositions[colour];
  return isSquareAttacked(
    gameState.game.board,
    kingPos,
    colour === "white" ? "black" : "white",
  );
}

// super naive implementation, for every piece of the correct colour
// it scans every square on the board until it finds a legal move.
function legalMovesExist(gameState: GameState, colour: PieceColour): boolean {
  for (let fromX = 0; fromX < SIZE; fromX++) {
    for (let fromY = 0; fromY < SIZE; fromY++) {
      const from = { x: fromX, y: fromY };
      const piece = getSquare(gameState.game.board, from);

      if (!piece || piece.colour !== colour) continue;

      for (let toX = 0; toX < SIZE; toX++) {
        for (let toY = 0; toY < SIZE; toY++) {
          const to = { x: toX, y: toY };

          if (isLegalMove(gameState, { from, to })) return true;
        }
      }
    }
  }
  return false;
}

type GameEndStatus = "Checkmate" | "Stalemate" | false;

function getGameEndStatus(
  gameState: GameState,
  colour: PieceColour,
): GameEndStatus {
  if (legalMovesExist(gameState, colour)) return false;
  if (kingIsInCheck(gameState, colour)) return "Checkmate";
  return "Stalemate";
}

export { getGameEndStatus, kingIsInCheck, legalMovesExist };
export type { GameEndStatus };
