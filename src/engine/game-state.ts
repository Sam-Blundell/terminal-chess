import type { Board, PieceColour, Piece, Position } from "./game";
import { createBoard } from "./game";

type CastlingRights = {
  white: {
    kingHasMoved: boolean;
    kingsideRookHasMoved: boolean;
    queensideRookHasMoved: boolean;
  };
  black: {
    kingHasMoved: boolean;
    kingsideRookHasMoved: boolean;
    queensideRookHasMoved: boolean;
  };
};

type CapturedPieces = {
  white: Piece[];
  black: Piece[];
};

type KingPositions = {
  white: Position;
  black: Position;
};

type GameState = {
  board: Board;
  currentTurn: PieceColour;
  capturedPieces: CapturedPieces;
  kingPositions: KingPositions;
  castlingRights: CastlingRights;
  enPassant: Position | null;
};

function initGameState(): GameState {
  return {
    board: createBoard(),
    currentTurn: "white",
    capturedPieces: {
      white: [],
      black: [],
    },
    kingPositions: {
      white: { x: 4, y: 7 },
      black: { x: 4, y: 0 },
    },
    castlingRights: {
      white: {
        kingHasMoved: false,
        kingsideRookHasMoved: false,
        queensideRookHasMoved: false,
      },
      black: {
        kingHasMoved: false,
        kingsideRookHasMoved: false,
        queensideRookHasMoved: false,
      },
    },
    enPassant: null,
  };
}

function advanceTurn(game: GameState): void {
  game.currentTurn = game.currentTurn === "white" ? "black" : "white";
}

export type { GameState, CastlingRights, CapturedPieces, KingPositions };
export { initGameState, advanceTurn };
