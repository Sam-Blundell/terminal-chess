import type { Position } from "./game";

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

const positionToChessNotation = (position: Position): string => {
  const { x, y } = position;

  if (x < 0 || x > 7 || y < 0 || y > 7) {
    throw new Error(`Invalid position: ${JSON.stringify(position)}`);
  }

  const file = "abcdefgh"[x];
  const rank = 8 - y;

  if (!file) {
    throw new Error(`Invalid file for position: ${JSON.stringify(position)}`);
  }

  return `${file}${rank}`;
};

export {
  pieceMap,
  fileMap,
  abbrToPiece,
  rankToRow,
  fileToCol,
  chessNotationToPosition,
  positionToChessNotation,
};
