import type { Square, Position } from "../src/engine/game";
import { beforeEach, describe, expect, test } from "bun:test";
import { createMinimalAppState, placePieces } from "./test-helpers";
import { setSquare } from "../src/engine/game";
import { applyMove as applyMoveEngine } from "../src/engine/move-application";
import { isLegalMove as isLegalMoveEngine } from "../src/engine/move-validation";
import { chessNotationToPosition } from "../src/engine/notation-helpers";

function applyMove(
  gameState: ReturnType<typeof createMinimalAppState>,
  move: Parameters<typeof applyMoveEngine>[1],
): void {
  applyMoveEngine(gameState.game, move);
}

function isLegalMove(
  gameState: ReturnType<typeof createMinimalAppState>,
  move: Parameters<typeof isLegalMoveEngine>[1],
): boolean {
  return isLegalMoveEngine(gameState.game, move);
}

describe("isLegalMove", () => {
  let gameState: ReturnType<typeof createMinimalAppState>;

  const whiteRook: Square = { type: "rook", colour: "white" };
  const blackRook: Square = { type: "rook", colour: "black" };
  const whiteBishop: Square = { type: "bishop", colour: "white" };
  const blackBishop: Square = { type: "bishop", colour: "black" };
  const whiteRookAttacker: Square = { type: "rook", colour: "white" };
  const blackRookAttacker: Square = { type: "rook", colour: "black" };

  const whiteKingPos: Position = { x: 4, y: 7 };
  const blackKingPos: Position = { x: 4, y: 0 };

  const whiteKSRookPos: Position = { x: 7, y: 7 };
  const whiteQSRookPos: Position = { x: 0, y: 7 };
  const blackKSRookPos: Position = { x: 7, y: 0 };
  const blackQSRookPos: Position = { x: 0, y: 0 };

  beforeEach(() => {
    gameState = createMinimalAppState();
  });

  describe("castling", () => {
    test("white kingside castling is legal", () => {
      setSquare(gameState.game.board, whiteKSRookPos, whiteRook);

      expect(
        isLegalMove(gameState, { from: whiteKingPos, to: { x: 6, y: 7 } }),
      ).toBe(true);
    });

    test("white queenside castling is legal", () => {
      setSquare(gameState.game.board, whiteQSRookPos, whiteRook);

      expect(
        isLegalMove(gameState, { from: whiteKingPos, to: { x: 2, y: 7 } }),
      ).toBe(true);
    });

    test("black kingside castling is legal", () => {
      setSquare(gameState.game.board, blackKSRookPos, blackRook);

      expect(
        isLegalMove(gameState, { from: blackKingPos, to: { x: 6, y: 0 } }),
      ).toBe(true);
    });

    test("black queenside castling is legal", () => {
      setSquare(gameState.game.board, blackQSRookPos, blackRook);

      expect(
        isLegalMove(gameState, { from: blackKingPos, to: { x: 2, y: 0 } }),
      ).toBe(true);
    });

    test("white kingside castling is illegal if the rook is missing", () => {
      expect(
        isLegalMove(gameState, { from: whiteKingPos, to: { x: 6, y: 7 } }),
      ).toBe(false);
    });

    test("white queenside castling is illegal if the rook is missing", () => {
      expect(
        isLegalMove(gameState, { from: whiteKingPos, to: { x: 2, y: 7 } }),
      ).toBe(false);
    });

    test("black kingside castling is illegal if the rook is missing", () => {
      expect(
        isLegalMove(gameState, { from: blackKingPos, to: { x: 6, y: 0 } }),
      ).toBe(false);
    });

    test("black queenside castling is illegal if the rook is missing", () => {
      expect(
        isLegalMove(gameState, { from: blackKingPos, to: { x: 2, y: 0 } }),
      ).toBe(false);
    });

    test("white kingside castling is illegal if path is blocked", () => {
      setSquare(gameState.game.board, whiteKSRookPos, whiteRook);
      setSquare(gameState.game.board, { x: 5, y: 7 }, whiteBishop);

      expect(
        isLegalMove(gameState, { from: whiteKingPos, to: { x: 6, y: 7 } }),
      ).toBe(false);
    });

    test("white queenside castling is illegal if path is blocked", () => {
      setSquare(gameState.game.board, whiteQSRookPos, whiteRook);
      setSquare(gameState.game.board, { x: 3, y: 7 }, whiteBishop);

      expect(
        isLegalMove(gameState, { from: whiteKingPos, to: { x: 2, y: 7 } }),
      ).toBe(false);
    });

    test("black kingside castling is illegal if path is blocked", () => {
      setSquare(gameState.game.board, blackKSRookPos, blackRook);
      setSquare(gameState.game.board, { x: 5, y: 0 }, blackBishop);

      expect(
        isLegalMove(gameState, { from: blackKingPos, to: { x: 6, y: 0 } }),
      ).toBe(false);
    });

    test("black queenside castling is illegal if path is blocked", () => {
      setSquare(gameState.game.board, blackQSRookPos, blackRook);
      setSquare(gameState.game.board, { x: 3, y: 0 }, blackBishop);

      expect(
        isLegalMove(gameState, { from: blackKingPos, to: { x: 2, y: 0 } }),
      ).toBe(false);
    });

    test("white kingside castling is illegal if the king is in check", () => {
      setSquare(gameState.game.board, whiteKSRookPos, whiteRook);
      setSquare(gameState.game.board, { x: 4, y: 0 }, blackRookAttacker);

      expect(
        isLegalMove(gameState, { from: whiteKingPos, to: { x: 6, y: 7 } }),
      ).toBe(false);
    });

    test("white kingside castling is illegal if the king passes through check", () => {
      setSquare(gameState.game.board, whiteKSRookPos, whiteRook);
      setSquare(gameState.game.board, { x: 5, y: 0 }, blackRookAttacker);

      expect(
        isLegalMove(gameState, { from: whiteKingPos, to: { x: 6, y: 7 } }),
      ).toBe(false);
    });

    test("white kingside castling is illegal if the king lands in check", () => {
      setSquare(gameState.game.board, whiteKSRookPos, whiteRook);
      setSquare(gameState.game.board, { x: 6, y: 0 }, blackRookAttacker);

      expect(
        isLegalMove(gameState, { from: whiteKingPos, to: { x: 6, y: 7 } }),
      ).toBe(false);
    });

    test("black queenside castling is illegal if the king is in check", () => {
      setSquare(gameState.game.board, blackQSRookPos, blackRook);
      setSquare(gameState.game.board, { x: 4, y: 7 }, whiteRookAttacker);

      expect(
        isLegalMove(gameState, { from: blackKingPos, to: { x: 2, y: 0 } }),
      ).toBe(false);
    });

    test("black queenside castling is illegal if the king passes through check", () => {
      setSquare(gameState.game.board, blackQSRookPos, blackRook);
      setSquare(gameState.game.board, { x: 3, y: 7 }, whiteRookAttacker);

      expect(
        isLegalMove(gameState, { from: blackKingPos, to: { x: 2, y: 0 } }),
      ).toBe(false);
    });

    test("black queenside castling is illegal if the king lands in check", () => {
      setSquare(gameState.game.board, blackQSRookPos, blackRook);
      setSquare(gameState.game.board, { x: 2, y: 7 }, whiteRookAttacker);

      expect(
        isLegalMove(gameState, { from: blackKingPos, to: { x: 2, y: 0 } }),
      ).toBe(false);
    });

    test("white kingside castling is illegal if the king has moved", () => {
      setSquare(gameState.game.board, whiteKSRookPos, whiteRook);
      gameState.game.castlingRights.white.kingHasMoved = true;

      expect(
        isLegalMove(gameState, { from: whiteKingPos, to: { x: 6, y: 7 } }),
      ).toBe(false);
    });

    test("white kingside castling is illegal if the kingside rook has moved", () => {
      setSquare(gameState.game.board, whiteKSRookPos, whiteRook);
      gameState.game.castlingRights.white.kingsideRookHasMoved = true;

      expect(
        isLegalMove(gameState, { from: whiteKingPos, to: { x: 6, y: 7 } }),
      ).toBe(false);
    });

    test("black queenside castling is illegal if the queenside rook has moved", () => {
      setSquare(gameState.game.board, blackQSRookPos, blackRook);
      gameState.game.castlingRights.black.queensideRookHasMoved = true;

      expect(
        isLegalMove(gameState, { from: blackKingPos, to: { x: 2, y: 0 } }),
      ).toBe(false);
    });

    describe("regressions", () => {
      test("castling is illegal if the original rook is captured (even if another rook later occupies the corner)", () => {
        placePieces(gameState, ["K-e1", "k-e8", "R-h1", "R-h2", "r-h8"]);

        // Black captures the original white rook on h1.
        applyMove(gameState, {
          from: chessNotationToPosition("h8"),
          to: chessNotationToPosition("h1"),
        });

        // A different white rook captures onto h1.
        applyMove(gameState, {
          from: chessNotationToPosition("h2"),
          to: chessNotationToPosition("h1"),
        });

        expect(
          isLegalMove(gameState, {
            from: chessNotationToPosition("e1"),
            to: chessNotationToPosition("g1"),
          }),
        ).toBe(false);
      });

      test("castling is illegal when the king does not start on e1/e8", () => {
        placePieces(gameState, ["K-d1", "k-e8", "R-h1"]);

        // This is an illegal castle attempt from d1 -> f1.
        expect(
          isLegalMove(gameState, {
            from: chessNotationToPosition("d1"),
            to: chessNotationToPosition("f1"),
          }),
        ).toBe(false);
      });
    });
  });
});
