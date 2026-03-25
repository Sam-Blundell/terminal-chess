import { beforeEach, describe, expect, test } from "bun:test";
import { createEmptyBoard } from "./test-helpers";
import { setSquare } from "../src/engine/game";
import { isSquareAttacked } from "../src/engine/move-validation";

describe("isSquareAttacked", () => {
  let board: ReturnType<typeof createEmptyBoard>;
  beforeEach(() => {
    board = createEmptyBoard();
  });

  describe("pawns", () => {
    test("white pawn attacks diagonally upward", () => {
      setSquare(board, { x: 4, y: 4 }, { type: "pawn", colour: "white" });

      expect(isSquareAttacked(board, { x: 3, y: 3 }, "white")).toBe(true);
      expect(isSquareAttacked(board, { x: 5, y: 3 }, "white")).toBe(true);
    });
    test("white pawn does not attack diagonally downward", () => {
      setSquare(board, { x: 4, y: 4 }, { type: "pawn", colour: "white" });

      expect(isSquareAttacked(board, { x: 3, y: 5 }, "white")).toBe(false);
      expect(isSquareAttacked(board, { x: 5, y: 5 }, "white")).toBe(false);
    });
    test("black pawn attacks diagonally downward", () => {
      setSquare(board, { x: 4, y: 4 }, { type: "pawn", colour: "black" });

      expect(isSquareAttacked(board, { x: 3, y: 5 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 5, y: 5 }, "black")).toBe(true);
    });
    test("black pawn does not attack diagonally upward", () => {
      setSquare(board, { x: 4, y: 4 }, { type: "pawn", colour: "black" });

      expect(isSquareAttacked(board, { x: 3, y: 3 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 5, y: 3 }, "black")).toBe(false);
    });
    test("white pawn does not attack non-capture squares", () => {
      setSquare(board, { x: 4, y: 4 }, { type: "pawn", colour: "white" });

      expect(isSquareAttacked(board, { x: 4, y: 3 }, "white")).toBe(false); // north
      expect(isSquareAttacked(board, { x: 5, y: 4 }, "white")).toBe(false); // east
      expect(isSquareAttacked(board, { x: 4, y: 5 }, "white")).toBe(false); // south
      expect(isSquareAttacked(board, { x: 3, y: 4 }, "white")).toBe(false); // west
    });
    test("black pawn does not attack non-capture squares", () => {
      setSquare(board, { x: 4, y: 4 }, { type: "pawn", colour: "black" });

      expect(isSquareAttacked(board, { x: 4, y: 3 }, "black")).toBe(false); // north
      expect(isSquareAttacked(board, { x: 5, y: 4 }, "black")).toBe(false); // east
      expect(isSquareAttacked(board, { x: 4, y: 5 }, "black")).toBe(false); // south
      expect(isSquareAttacked(board, { x: 3, y: 4 }, "black")).toBe(false); // west
    });
  });
  describe("knights", () => {
    beforeEach(() => {
      setSquare(board, { x: 4, y: 4 }, { type: "knight", colour: "black" });
    });
    test("attacks all squares on an L move", () => {
      expect(isSquareAttacked(board, { x: 6, y: 3 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 6, y: 5 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 2, y: 3 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 2, y: 5 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 3, y: 6 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 5, y: 6 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 3, y: 2 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 5, y: 2 }, "black")).toBe(true);
    });
    test("does not attack adjacent", () => {
      expect(isSquareAttacked(board, { x: 4, y: 3 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 5, y: 3 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 5, y: 4 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 5, y: 5 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 4, y: 5 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 3, y: 5 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 3, y: 4 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 3, y: 3 }, "black")).toBe(false);
    });
    test("does not attack just two squares away alone", () => {
      expect(isSquareAttacked(board, { x: 6, y: 4 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 4, y: 6 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 2, y: 4 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 4, y: 2 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 6, y: 6 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 2, y: 6 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 6, y: 2 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 2, y: 2 }, "black")).toBe(false);
    });
  });
  describe("rooks", () => {
    beforeEach(() => {
      setSquare(board, { x: 4, y: 4 }, { type: "rook", colour: "black" });
    });
    test("attacks along straight-line paths", () => {
      expect(isSquareAttacked(board, { x: 4, y: 5 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 4, y: 7 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 4, y: 3 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 4, y: 0 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 3, y: 4 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 0, y: 4 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 5, y: 4 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 7, y: 4 }, "black")).toBe(true);
    });
    test("does not attack along diagonal paths", () => {
      expect(isSquareAttacked(board, { x: 5, y: 5 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 5, y: 3 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 3, y: 5 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 3, y: 3 }, "black")).toBe(false);
    });
    test("does not attack past a blocking piece", () => {
      setSquare(board, { x: 2, y: 4 }, { type: "pawn", colour: "white" });
      setSquare(board, { x: 4, y: 6 }, { type: "pawn", colour: "black" });
      expect(isSquareAttacked(board, { x: 1, y: 4 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 4, y: 7 }, "black")).toBe(false);
    });
    test("attacks up to a blocking piece", () => {
      setSquare(board, { x: 2, y: 4 }, { type: "pawn", colour: "white" });
      setSquare(board, { x: 4, y: 6 }, { type: "pawn", colour: "black" });
      expect(isSquareAttacked(board, { x: 3, y: 4 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 4, y: 5 }, "black")).toBe(true);
    });
  });
  describe("bishops", () => {
    beforeEach(() => {
      setSquare(board, { x: 4, y: 4 }, { type: "bishop", colour: "black" });
    });
    test("does not attack along straight-line paths", () => {
      expect(isSquareAttacked(board, { x: 4, y: 5 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 4, y: 3 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 3, y: 4 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 5, y: 4 }, "black")).toBe(false);
    });
    test("attacks along diagonal paths", () => {
      expect(isSquareAttacked(board, { x: 5, y: 5 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 7, y: 7 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 5, y: 3 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 7, y: 1 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 3, y: 5 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 1, y: 7 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 3, y: 3 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 0, y: 0 }, "black")).toBe(true);
    });
    test("does not attack past a blocking piece", () => {
      setSquare(board, { x: 2, y: 2 }, { type: "pawn", colour: "black" });
      setSquare(board, { x: 6, y: 6 }, { type: "pawn", colour: "white" });
      expect(isSquareAttacked(board, { x: 1, y: 1 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 7, y: 7 }, "black")).toBe(false);
    });
    test("attacks up to a blocking piece", () => {
      setSquare(board, { x: 2, y: 2 }, { type: "pawn", colour: "white" });
      setSquare(board, { x: 6, y: 6 }, { type: "pawn", colour: "black" });
      expect(isSquareAttacked(board, { x: 3, y: 3 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 5, y: 5 }, "black")).toBe(true);
    });
  });
  describe("queens", () => {
    beforeEach(() => {
      setSquare(board, { x: 4, y: 4 }, { type: "queen", colour: "black" });
    });
    test("attacks along diagonal paths", () => {
      expect(isSquareAttacked(board, { x: 5, y: 5 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 7, y: 7 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 5, y: 3 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 7, y: 1 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 3, y: 5 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 1, y: 7 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 3, y: 3 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 0, y: 0 }, "black")).toBe(true);
    });
    test("attacks along straight-line paths", () => {
      expect(isSquareAttacked(board, { x: 4, y: 5 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 4, y: 7 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 4, y: 3 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 4, y: 0 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 3, y: 4 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 0, y: 4 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 5, y: 4 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 7, y: 4 }, "black")).toBe(true);
    });
    test("does not attack past a straight-line blocking piece", () => {
      setSquare(board, { x: 2, y: 4 }, { type: "pawn", colour: "white" });
      setSquare(board, { x: 4, y: 6 }, { type: "pawn", colour: "black" });
      expect(isSquareAttacked(board, { x: 1, y: 4 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 4, y: 7 }, "black")).toBe(false);
    });
    test("does not attack past a diagonal blocking piece", () => {
      setSquare(board, { x: 2, y: 2 }, { type: "pawn", colour: "black" });
      setSquare(board, { x: 6, y: 6 }, { type: "pawn", colour: "white" });
      expect(isSquareAttacked(board, { x: 1, y: 1 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 7, y: 7 }, "black")).toBe(false);
    });
    test("attacks up to a straight-line blocking piece", () => {
      setSquare(board, { x: 2, y: 4 }, { type: "pawn", colour: "white" });
      setSquare(board, { x: 4, y: 6 }, { type: "pawn", colour: "black" });
      expect(isSquareAttacked(board, { x: 3, y: 4 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 4, y: 5 }, "black")).toBe(true);
    });
    test("attacks up to a diagonal blocking piece", () => {
      setSquare(board, { x: 2, y: 2 }, { type: "pawn", colour: "white" });
      setSquare(board, { x: 6, y: 6 }, { type: "pawn", colour: "black" });
      expect(isSquareAttacked(board, { x: 3, y: 3 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 5, y: 5 }, "black")).toBe(true);
    });
  });
  describe("kings", () => {
    beforeEach(() => {
      setSquare(board, { x: 4, y: 4 }, { type: "king", colour: "black" });
    });
    test("attacks all adjacent squares", () => {
      expect(isSquareAttacked(board, { x: 4, y: 3 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 5, y: 3 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 5, y: 4 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 5, y: 5 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 4, y: 5 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 3, y: 5 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 3, y: 4 }, "black")).toBe(true);
      expect(isSquareAttacked(board, { x: 3, y: 3 }, "black")).toBe(true);
    });
    test("does not attack further than 1 square", () => {
      expect(isSquareAttacked(board, { x: 4, y: 6 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 2, y: 4 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 2, y: 2 }, "black")).toBe(false);
      expect(isSquareAttacked(board, { x: 6, y: 6 }, "black")).toBe(false);
    });
  });
});
