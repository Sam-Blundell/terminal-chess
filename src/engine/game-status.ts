import type { PieceColour } from "./game";
import type { GameState } from "./game-state";
import { getSquare, SIZE } from "./game";
import { isLegalMove, isSquareAttacked } from "./move-validation";

function kingIsInCheck(game: GameState, colour: PieceColour): boolean {
  const kingPos = game.kingPositions[colour];
  return isSquareAttacked(
    game.board,
    kingPos,
    colour === "white" ? "black" : "white",
  );
}

// super naive implementation, for every piece of the correct colour
// it scans every square on the board until it finds a legal move.
function legalMovesExist(game: GameState, colour: PieceColour): boolean {
  for (let fromX = 0; fromX < SIZE; fromX++) {
    for (let fromY = 0; fromY < SIZE; fromY++) {
      const from = { x: fromX, y: fromY };
      const piece = getSquare(game.board, from);

      if (!piece || piece.colour !== colour) continue;

      for (let toX = 0; toX < SIZE; toX++) {
        for (let toY = 0; toY < SIZE; toY++) {
          const to = { x: toX, y: toY };

          if (isLegalMove(game, { from, to })) return true;
        }
      }
    }
  }
  return false;
}

type GameEndStatus = "Checkmate" | "Stalemate" | false;

function getGameEndStatus(
  game: GameState,
  colour: PieceColour,
): GameEndStatus {
  if (legalMovesExist(game, colour)) return false;
  if (kingIsInCheck(game, colour)) return "Checkmate";
  return "Stalemate";
}

export { getGameEndStatus, kingIsInCheck, legalMovesExist };
export type { GameEndStatus };
