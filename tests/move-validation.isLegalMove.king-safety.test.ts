import { beforeEach, describe, expect, test } from "bun:test";
import { createMinimalAppState } from "./test-helpers";
import { setSquare } from "../src/engine/game";
import { isLegalMove as isLegalMoveEngine } from "../src/engine/move-validation";

function isLegalMove(
  gameState: ReturnType<typeof createMinimalAppState>,
  move: Parameters<typeof isLegalMoveEngine>[1],
): boolean {
  return isLegalMoveEngine(gameState.game, move);
}

describe("isLegalMove", () => {
  let gameState: ReturnType<typeof createMinimalAppState>;
  beforeEach(() => {
    gameState = createMinimalAppState();
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
