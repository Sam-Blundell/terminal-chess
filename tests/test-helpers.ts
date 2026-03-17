import type { Board, Piece, Position } from "../game";
import type { GameState } from "../state";
import { setSquare, SIZE } from "../game";

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
    game: {
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
    },
    ui: {
      focusedSquare: null,
      selectedSquare: null,
    },
  };
}

const pieceMap = {
  p: "pawn",
  r: "rook",
  n: "knight",
  b: "bishop",
  q: "queen",
  k: "king",
} as const;

const fileMap = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 5,
  g: 6,
  h: 7,
} as const;

type PieceName = (typeof pieceMap)[keyof typeof pieceMap];
type FileCol = (typeof fileMap)[keyof typeof fileMap];

const abbrToPiece = (abbr: keyof typeof pieceMap): PieceName => pieceMap[abbr];
const fileToCol = (file: keyof typeof fileMap): FileCol => fileMap[file];
const rankToRow = (rank: number): number => 8 - rank;

const chessNotationToPosition = (note: string): Position => {
  const file = note.charAt(0).toLowerCase();
  const rank = Number(note.charAt(1));

  if (!(file in fileMap) || Number.isNaN(rank) || rank < 1 || rank > 8) {
    throw new Error(`Invalid chess notation: ${note}`);
  }

  const x = fileToCol(file as keyof typeof fileMap);
  const y = rankToRow(rank);

  return { x, y };
};

function placePieces(gameState: GameState, pieces: string[]) {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      setSquare(gameState.game.board, { x, y }, null);
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
    setSquare(gameState.game.board, parsedPosition, parsedPiece);

    if (type === "king") {
      gameState.game.kingPositions[colour] = parsedPosition;
    }
  });
}

export {
  createEmptyBoard,
  createMinimalGameState,
  placePieces,
  abbrToPiece,
  fileToCol,
  rankToRow,
  chessNotationToPosition,
};
