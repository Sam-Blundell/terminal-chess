import { describe, expect, test } from "bun:test";

import { createBoard, getSquare } from "../src/engine/game";
import { chessNotationToPosition } from "../src/engine/notation-helpers";

describe("createBoard", () => {
  test("returns the standard starting layout (spot checks)", () => {
    const board = createBoard();

    expect(getSquare(board, chessNotationToPosition("a8"))).toEqual({
      type: "rook",
      colour: "black",
    });
    expect(getSquare(board, chessNotationToPosition("d8"))).toEqual({
      type: "queen",
      colour: "black",
    });
    expect(getSquare(board, chessNotationToPosition("e1"))).toEqual({
      type: "king",
      colour: "white",
    });
    expect(getSquare(board, chessNotationToPosition("a2"))).toEqual({
      type: "pawn",
      colour: "white",
    });
  });
});
