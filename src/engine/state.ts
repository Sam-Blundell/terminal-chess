import type { Board, PieceColour, Piece, Position } from "./game";
import type { GameEndStatus } from "./game-status";
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
  enPassant: Position | null;
};

type PromotionOptions = "rook" | "knight" | "bishop" | "queen";
type GameOverOptions = "newGame" | "quit";

type UIMode =
  | { type: "normal" }
  | {
      type: "promotion";
      position: Position;
      colour: PieceColour;
    }
  | {
      type: "gameover";
      result: GameEndStatus;
      colour: PieceColour | null;
    };

type UIState = {
  mode: UIMode;
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
      enPassant: null,
    },
    ui: {
      mode: { type: "normal" },
      focusedSquare: null,
      selectedSquare: null,
    },
  };
}

function setNormalMode(gameState: GameState): void {
  gameState.ui.mode = { type: "normal" };
}

function setPromotionMode(
  gameState: GameState,
  position: Position,
  colour: PieceColour,
): void {
  gameState.ui.mode = {
    type: "promotion",
    position,
    colour,
  };
}

function setGameOverMode(
  gameState: GameState,
  result: GameEndStatus,
  colour: PieceColour,
): void {
  gameState.ui.mode = { type: "gameover", result, colour };
}

function advanceTurn(gameState: GameState): void {
  gameState.game.currentTurn =
    gameState.game.currentTurn === "white" ? "black" : "white";
}

export type { GameState, UIMode, PromotionOptions, GameOverOptions };
export {
  initGameState,
  advanceTurn,
  setNormalMode,
  setPromotionMode,
  setGameOverMode,
};
