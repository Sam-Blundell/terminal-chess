import type { Board, Piece, Position } from "../src/engine/game";
import type { GameState } from "../src/engine/game-state";
import type { AppState } from "../src/app/app-state";
import { setSquare, SIZE } from "../src/engine/game";
import { pieceMap, fileMap, rankToRow } from "../src/engine/notation-helpers";
import { initUIState } from "../src/app/ui-state";

function createEmptyBoard(): Board {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => null),
  );
}

function createMinimalGameState(): GameState {
  const board = createEmptyBoard();
  setSquare(board, { x: 4, y: 7 }, { colour: "white", type: "king" });
  setSquare(board, { x: 4, y: 0 }, { colour: "black", type: "king" });
  return {
    board: board,
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

function createMinimalAppState(): AppState {
  return {
    game: createMinimalGameState(),
    ui: initUIState(),
  };
}

function placePieces(gameState: GameState | AppState, pieces: string[]) {
  const game = "game" in gameState ? gameState.game : gameState;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      setSquare(game.board, { x, y }, null);
    }
  }

  pieces.forEach((piece) => {
    const [symbol, square] = piece.split("-");

    if (!symbol || !square || square.length !== 2) {
      throw new Error(`Invalid piece definition: ${piece}`);
    }

    const file = square.charAt(0).toLowerCase();
    const rank = Number(square.charAt(1));

    const colour = symbol === symbol.toUpperCase() ? "white" : "black";
    const type = pieceMap[symbol.toLowerCase() as keyof typeof pieceMap];

    if (!type) {
      throw new Error(`Invalid piece symbol: ${symbol}`);
    }

    const x = fileMap[file as keyof typeof fileMap];
    const y = rankToRow(rank);

    if (x === undefined || Number.isNaN(rank) || y < 0 || y > 7) {
      throw new Error(`Invalid square: ${square}`);
    }

    const parsedPosition: Position = { x, y };
    const parsedPiece: Piece = { type, colour };
    setSquare(game.board, parsedPosition, parsedPiece);

    if (type === "king") {
      game.kingPositions[colour] = parsedPosition;
    }
  });
}

export {
  createEmptyBoard,
  createMinimalGameState,
  createMinimalAppState,
  placePieces,
  rankToRow,
};
