import { describe, expect, test } from "bun:test";
import { createEmptyBoard } from "./test-helpers";
import { setSquare } from "./game";
import { isSquareAttacked } from "./move-validation";

describe("isSquareAttacked", () => {
  test("white pawn attacks one square diagonally upward-left", () => {
    const board = createEmptyBoard();
    setSquare(board, { x: 4, y: 4 }, { type: "pawn", colour: "white" });

    expect(isSquareAttacked(board, { x: 3, y: 3 }, "white")).toBe(true);
  });
});
