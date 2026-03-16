import { beforeEach, describe, expect, test } from "bun:test";
import { createMinimalGameState } from "./test-helpers";
import { setSquare } from "./game";
import { isLegalMove } from "./move-validation";

describe("isLegalMove", () => {
  let gameState: ReturnType<typeof createMinimalGameState>;
  beforeEach(() => {
    gameState = createMinimalGameState();
  });
  test("throws when from square has no piece", () => {
    const start = { x: 4, y: 4 };
    const end = { x: 5, y: 4 };
    expect(() => isLegalMove(gameState, { from: start, to: end })).toThrow(
      "Missing piece at the from square",
    );
  });
  test("rejects moving to the same square", () => {
    const start = { x: 4, y: 4 };
    const end = { x: 4, y: 4 };
    setSquare(gameState.game.board, start, { type: "pawn", colour: "black" });
    expect(isLegalMove(gameState, { from: start, to: end })).toBe(false);
  });
  test("rejects moving to a square with a friendly piece", () => {
    const start = { x: 4, y: 4 };
    const end = { x: 6, y: 4 };
    setSquare(gameState.game.board, start, { type: "rook", colour: "black" });
    setSquare(gameState.game.board, end, { type: "pawn", colour: "black" });
    expect(isLegalMove(gameState, { from: start, to: end })).toBe(false);
  });
  describe("white pawns", () => {
    test("cannot move backwards", () => {
      const start = { x: 4, y: 4 };
      const end = { x: 4, y: 5 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "white" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(false);
    });
    test("can move forward one space into an empty square", () => {
      const start = { x: 4, y: 6 };
      const end = { x: 4, y: 5 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "white" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(true);
    });
    test("cannot move forward one space into an occupied square", () => {
      const start = { x: 4, y: 6 };
      const end = { x: 4, y: 5 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "white" });
      setSquare(gameState.game.board, end, { type: "queen", colour: "black" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(false);
    });
    test("can move forward two empty spaces from starting rank", () => {
      const start = { x: 4, y: 6 };
      const end = { x: 4, y: 4 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "white" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(true);
    });
    test("cannot move forward two empty spaces if not on starting rank", () => {
      const start = { x: 4, y: 5 };
      const end = { x: 4, y: 3 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "white" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(false);
    });
    test("cannot move forward two spaces from starting rank if path is blocked", () => {
      const start = { x: 4, y: 6 };
      const end = { x: 4, y: 4 };
      const blockerPosition = { x: 4, y: 5 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "white" });
      setSquare(gameState.game.board, blockerPosition, {
        type: "queen",
        colour: "black",
      });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(false);
    });
    test("cannot move forward two spaces from starting rank if end is occupied", () => {
      const start = { x: 4, y: 6 };
      const end = { x: 4, y: 4 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "white" });
      setSquare(gameState.game.board, end, { type: "queen", colour: "black" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(false);
    });
    test("can capture diagonally forward-left", () => {
      const start = { x: 4, y: 4 };
      const end = { x: 3, y: 3 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "white" });
      setSquare(gameState.game.board, end, { type: "queen", colour: "black" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(true);
    });
    test("can capture diagonally forward-right", () => {
      const start = { x: 4, y: 4 };
      const end = { x: 5, y: 3 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "white" });
      setSquare(gameState.game.board, end, { type: "queen", colour: "black" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(true);
    });
    test("cannot move diagonally forward-left into empty square", () => {
      const start = { x: 4, y: 4 };
      const end = { x: 3, y: 3 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "white" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(false);
    });
    test("cannot move diagonally forward-right into empty square", () => {
      const start = { x: 4, y: 4 };
      const end = { x: 5, y: 3 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "white" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(false);
    });
  });
  describe("black pawns", () => {
    test("cannot move backwards", () => {
      const start = { x: 4, y: 4 };
      const end = { x: 4, y: 3 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "black" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(false);
    });
    test("can move forward one space into an empty square", () => {
      const start = { x: 4, y: 1 };
      const end = { x: 4, y: 2 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "black" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(true);
    });
    test("can move forward two empty spaces from starting rank", () => {
      const start = { x: 4, y: 1 };
      const end = { x: 4, y: 3 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "black" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(true);
    });
    test("can capture diagonally forward-left", () => {
      const start = { x: 4, y: 4 };
      const end = { x: 3, y: 5 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "black" });
      setSquare(gameState.game.board, end, { type: "queen", colour: "white" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(true);
    });
    test("can capture diagonally forward-right", () => {
      const start = { x: 4, y: 4 };
      const end = { x: 5, y: 5 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "black" });
      setSquare(gameState.game.board, end, { type: "queen", colour: "white" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(true);
    });
    test("cannot move diagonally forward-left into empty square", () => {
      const start = { x: 4, y: 4 };
      const end = { x: 3, y: 5 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "black" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(false);
    });
    test("cannot move diagonally forward-right into empty square", () => {
      const start = { x: 4, y: 4 };
      const end = { x: 5, y: 5 };
      setSquare(gameState.game.board, start, { type: "pawn", colour: "black" });
      expect(isLegalMove(gameState, { from: start, to: end })).toBe(false);
    });
  });
  describe("knights", () => {
    const start = { x: 4, y: 4 };
    beforeEach(() => {
      setSquare(gameState.game.board, start, {
        type: "knight",
        colour: "black",
      });
    });
    test("can move in any L shape", () => {
      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 2 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 2 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 3 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 5 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 6 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 6 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 2, y: 3 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 2, y: 5 } })).toBe(
        true,
      );
    });
    test("cannot move in any non-L shape", () => {
      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 2 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 2 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 4 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 6 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 6 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 2, y: 6 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 2, y: 4 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 2, y: 2 } })).toBe(
        false,
      );
    });
    test("can jump over blocking pieces", () => {
      setSquare(
        gameState.game.board,
        { x: 4, y: 3 },
        { type: "pawn", colour: "black" },
      );
      setSquare(
        gameState.game.board,
        { x: 5, y: 3 },
        { type: "pawn", colour: "black" },
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 2 } })).toBe(
        true,
      );
    });
  });
  describe("rooks", () => {
    const start = { x: 4, y: 4 };

    beforeEach(() => {
      setSquare(gameState.game.board, start, { type: "rook", colour: "black" });
    });

    test("can move any number of squares along a file or rank", () => {
      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 1 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 3 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 6 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 0, y: 4 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 4 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 7, y: 4 } })).toBe(
        true,
      );
    });

    test("cannot move diagonally", () => {
      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 3 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 3 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 5 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 5 } })).toBe(
        false,
      );
    });

    test("cannot move through a blocking piece on a rank", () => {
      setSquare(
        gameState.game.board,
        { x: 2, y: 4 },
        {
          type: "pawn",
          colour: "white",
        },
      );

      expect(isLegalMove(gameState, { from: start, to: { x: 1, y: 4 } })).toBe(
        false,
      );
    });

    test("cannot move through a blocking piece on a file", () => {
      setSquare(
        gameState.game.board,
        { x: 4, y: 5 },
        {
          type: "pawn",
          colour: "white",
        },
      );

      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 6 } })).toBe(
        false,
      );
    });

    test("can move up to a blocking piece", () => {
      setSquare(
        gameState.game.board,
        { x: 2, y: 4 },
        {
          type: "pawn",
          colour: "white",
        },
      );
      setSquare(
        gameState.game.board,
        { x: 4, y: 6 },
        {
          type: "pawn",
          colour: "white",
        },
      );

      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 4 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 5 } })).toBe(
        true,
      );
    });

    test("can capture an enemy piece on a clear rank", () => {
      setSquare(
        gameState.game.board,
        { x: 1, y: 4 },
        {
          type: "pawn",
          colour: "white",
        },
      );

      expect(isLegalMove(gameState, { from: start, to: { x: 1, y: 4 } })).toBe(
        true,
      );
    });

    test("can capture an enemy piece on a clear file", () => {
      setSquare(
        gameState.game.board,
        { x: 4, y: 6 },
        {
          type: "pawn",
          colour: "white",
        },
      );

      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 6 } })).toBe(
        true,
      );
    });
  });
  describe("bishops", () => {
    const start = { x: 5, y: 4 };

    beforeEach(() => {
      setSquare(gameState.game.board, start, {
        type: "bishop",
        colour: "black",
      });
    });

    test("can move any number of squares along a clear diagonal", () => {
      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 3 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 2 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 2, y: 1 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 1, y: 0 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 3 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 7, y: 2 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 5 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 6 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 2, y: 7 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 5 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 7, y: 6 } })).toBe(
        true,
      );
    });

    test("cannot move horizontally or vertically", () => {
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 3 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 6 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 4 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 7, y: 4 } })).toBe(
        false,
      );
    });

    test("cannot move through a blocking piece on a diagonal", () => {
      setSquare(
        gameState.game.board,
        { x: 4, y: 3 },
        {
          type: "pawn",
          colour: "white",
        },
      );
      setSquare(
        gameState.game.board,
        { x: 6, y: 5 },
        {
          type: "pawn",
          colour: "white",
        },
      );

      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 2 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 7, y: 6 } })).toBe(
        false,
      );
    });

    test("can move up to a blocking piece", () => {
      setSquare(
        gameState.game.board,
        { x: 3, y: 2 },
        {
          type: "pawn",
          colour: "white",
        },
      );
      setSquare(
        gameState.game.board,
        { x: 7, y: 6 },
        {
          type: "pawn",
          colour: "white",
        },
      );

      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 3 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 5 } })).toBe(
        true,
      );
    });

    test("can capture an enemy piece on a clear diagonal", () => {
      setSquare(
        gameState.game.board,
        { x: 3, y: 2 },
        {
          type: "pawn",
          colour: "white",
        },
      );

      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 2 } })).toBe(
        true,
      );
    });
  });

  describe("queens", () => {
    const start = { x: 5, y: 4 };

    beforeEach(() => {
      setSquare(gameState.game.board, start, {
        type: "queen",
        colour: "black",
      });
    });

    test("can move any number of squares along a clear straight line", () => {
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 3 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 1 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 7 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 0, y: 4 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 7, y: 4 } })).toBe(
        true,
      );
    });

    test("can move any number of squares along a clear diagonal", () => {
      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 3 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 2 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 2, y: 1 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 1, y: 0 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 3 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 7, y: 2 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 5 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 6 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 2, y: 7 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 5 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 7, y: 6 } })).toBe(
        true,
      );
    });

    test("cannot move in a non-straight non-diagonal shape", () => {
      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 6 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 5 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 7, y: 5 } })).toBe(
        false,
      );
    });

    test("cannot move through a blocking piece on a straight line", () => {
      setSquare(
        gameState.game.board,
        { x: 3, y: 4 },
        {
          type: "pawn",
          colour: "white",
        },
      );
      setSquare(
        gameState.game.board,
        { x: 5, y: 6 },
        {
          type: "pawn",
          colour: "white",
        },
      );

      expect(isLegalMove(gameState, { from: start, to: { x: 2, y: 4 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 7 } })).toBe(
        false,
      );
    });

    test("cannot move through a blocking piece on a diagonal", () => {
      setSquare(
        gameState.game.board,
        { x: 4, y: 3 },
        {
          type: "pawn",
          colour: "white",
        },
      );
      setSquare(
        gameState.game.board,
        { x: 6, y: 5 },
        {
          type: "pawn",
          colour: "white",
        },
      );

      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 2 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 7, y: 6 } })).toBe(
        false,
      );
    });

    test("can move up to a blocking piece on a straight line", () => {
      setSquare(
        gameState.game.board,
        { x: 2, y: 4 },
        {
          type: "pawn",
          colour: "white",
        },
      );
      setSquare(
        gameState.game.board,
        { x: 5, y: 7 },
        {
          type: "pawn",
          colour: "white",
        },
      );

      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 4 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 6 } })).toBe(
        true,
      );
    });

    test("can move up to a blocking piece on a diagonal", () => {
      setSquare(
        gameState.game.board,
        { x: 3, y: 2 },
        {
          type: "pawn",
          colour: "white",
        },
      );
      setSquare(
        gameState.game.board,
        { x: 7, y: 6 },
        {
          type: "pawn",
          colour: "white",
        },
      );

      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 3 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 5 } })).toBe(
        true,
      );
    });

    test("can capture an enemy piece on a clear straight line", () => {
      setSquare(
        gameState.game.board,
        { x: 2, y: 4 },
        {
          type: "pawn",
          colour: "white",
        },
      );

      expect(isLegalMove(gameState, { from: start, to: { x: 2, y: 4 } })).toBe(
        true,
      );
    });

    test("can capture an enemy piece on a clear diagonal", () => {
      setSquare(
        gameState.game.board,
        { x: 3, y: 2 },
        {
          type: "pawn",
          colour: "white",
        },
      );

      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 2 } })).toBe(
        true,
      );
    });
  });
  describe("kings", () => {
    const start = { x: 5, y: 4 };

    beforeEach(() => {
      setSquare(gameState.game.board, start, { type: "king", colour: "black" });
      setSquare(gameState.game.board, { x: 4, y: 0 }, null);
      gameState.game.kingPositions.black = start;
    });

    test("can move one square in any direction", () => {
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 3 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 3 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 4 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 5 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 5 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 5 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 4 } })).toBe(
        true,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 4, y: 3 } })).toBe(
        true,
      );
    });

    test("cannot move more than one square vertically", () => {
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 2 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 5, y: 6 } })).toBe(
        false,
      );
    });

    test("cannot move more than one square horizontally", () => {
      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 4 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 7, y: 4 } })).toBe(
        false,
      );
    });

    test("cannot move more than one square diagonally", () => {
      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 2 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 7, y: 2 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 3, y: 6 } })).toBe(
        false,
      );
      expect(isLegalMove(gameState, { from: start, to: { x: 7, y: 6 } })).toBe(
        false,
      );
    });

    test("can capture an enemy piece one square away", () => {
      setSquare(
        gameState.game.board,
        { x: 6, y: 5 },
        {
          type: "pawn",
          colour: "white",
        },
      );

      expect(isLegalMove(gameState, { from: start, to: { x: 6, y: 5 } })).toBe(
        true,
      );
    });
  });
  describe("king safety", () => {
    const blackKingStart = { x: 3, y: 3 };

    beforeEach(() => {
      setSquare(gameState.game.board, { x: 4, y: 0 }, null);
      setSquare(gameState.game.board, blackKingStart, {
        type: "king",
        colour: "black",
      });
      gameState.game.kingPositions.black = blackKingStart;
    });

    test("cannot move into check", () => {
      setSquare(
        gameState.game.board,
        { x: 4, y: 4 },
        { type: "rook", colour: "white" },
      );
      expect(
        isLegalMove(gameState, { from: blackKingStart, to: { x: 4, y: 3 } }),
      ).toBe(false);
    });

    test("a pinned piece cannot move away and expose its king", () => {
      setSquare(
        gameState.game.board,
        { x: 4, y: 3 },
        {
          type: "rook",
          colour: "black",
        },
      );
      setSquare(
        gameState.game.board,
        { x: 7, y: 3 },
        {
          type: "rook",
          colour: "white",
        },
      );

      expect(
        isLegalMove(gameState, {
          from: { x: 4, y: 3 },
          to: { x: 4, y: 4 },
        }),
      ).toBe(false);
    });

    test("a pinned piece can move while still shielding its king", () => {
      setSquare(
        gameState.game.board,
        { x: 4, y: 3 },
        {
          type: "rook",
          colour: "black",
        },
      );
      setSquare(
        gameState.game.board,
        { x: 7, y: 3 },
        {
          type: "rook",
          colour: "white",
        },
      );

      expect(
        isLegalMove(gameState, {
          from: { x: 4, y: 3 },
          to: { x: 5, y: 3 },
        }),
      ).toBe(true);
    });

    test("a piece can capture the attacker to resolve danger", () => {
      setSquare(
        gameState.game.board,
        { x: 4, y: 3 },
        {
          type: "rook",
          colour: "black",
        },
      );
      setSquare(
        gameState.game.board,
        { x: 7, y: 3 },
        {
          type: "rook",
          colour: "white",
        },
      );

      expect(
        isLegalMove(gameState, {
          from: { x: 4, y: 3 },
          to: { x: 7, y: 3 },
        }),
      ).toBe(true);
    });

    test("a piece can block a sliding attack", () => {
      setSquare(
        gameState.game.board,
        { x: 7, y: 3 },
        {
          type: "rook",
          colour: "white",
        },
      );
      setSquare(
        gameState.game.board,
        { x: 5, y: 2 },
        {
          type: "bishop",
          colour: "black",
        },
      );

      expect(
        isLegalMove(gameState, {
          from: { x: 5, y: 2 },
          to: { x: 4, y: 3 },
        }),
      ).toBe(true);
    });

    test("a king can move out of attack to a safe square", () => {
      setSquare(
        gameState.game.board,
        { x: 7, y: 3 },
        {
          type: "rook",
          colour: "white",
        },
      );

      expect(
        isLegalMove(gameState, {
          from: blackKingStart,
          to: { x: 2, y: 2 },
        }),
      ).toBe(true);
    });

    test("a king cannot capture a defended piece", () => {
      setSquare(
        gameState.game.board,
        { x: 4, y: 3 },
        {
          type: "rook",
          colour: "white",
        },
      );
      setSquare(
        gameState.game.board,
        { x: 6, y: 1 },
        {
          type: "bishop",
          colour: "white",
        },
      );

      expect(
        isLegalMove(gameState, {
          from: blackKingStart,
          to: { x: 4, y: 3 },
        }),
      ).toBe(false);
    });

    test("a king cannot move adjacent to the opposing king", () => {
      setSquare(gameState.game.board, { x: 4, y: 7 }, null);
      setSquare(
        gameState.game.board,
        { x: 5, y: 4 },
        {
          type: "king",
          colour: "white",
        },
      );
      gameState.game.kingPositions.white = { x: 5, y: 4 };

      expect(
        isLegalMove(gameState, {
          from: blackKingStart,
          to: { x: 4, y: 4 },
        }),
      ).toBe(false);
    });

    test("while in check, an irrelevant move is illegal", () => {
      setSquare(
        gameState.game.board,
        { x: 7, y: 3 },
        {
          type: "rook",
          colour: "white",
        },
      );
      setSquare(
        gameState.game.board,
        { x: 1, y: 1 },
        {
          type: "knight",
          colour: "black",
        },
      );

      expect(
        isLegalMove(gameState, {
          from: { x: 1, y: 1 },
          to: { x: 2, y: 3 },
        }),
      ).toBe(false);
    });
  });
});
