import type { Square, Position } from "../game";
import { beforeEach, describe, expect, test } from "bun:test";
import { createMinimalGameState } from "./test-helpers";
import { setSquare } from "../game";
import { isLegalMove } from "../move-validation";

describe("isLegalMove", () => {
  let gameState: ReturnType<typeof createMinimalGameState>;

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
    gameState = createMinimalGameState();
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
  });
});
