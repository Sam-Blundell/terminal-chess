import type { Board, PieceColour, Piece, Position } from "./game";
import { createBoard } from "./game";

type GameData = {
  board: Board;
  currentTurn: PieceColour;
  capturedPieces: {
    white: Piece[];
    black: Piece[];
  };
  kingPositions: {
    white: Position;
    black: Position;
  };
  castlingRights: {
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
};

type UIState = {
  focusedSquare: Position | null;
  selectedSquare: Position | null;
};

type GameState = {
  game: GameData;
  ui: UIState;
};

function initGameState(): GameState {
  return {
    game: {
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
    },
    ui: {
      focusedSquare: null,
      selectedSquare: null,
    },
  };
}

function advanceTurn(gameState: GameState): void {
  gameState.game.currentTurn =
    gameState.game.currentTurn === "white" ? "black" : "white";
}

export type { GameState };
export { initGameState, advanceTurn };
