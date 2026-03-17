import type { Position, Square } from "../game";
import { beforeEach, describe, expect, test } from "bun:test";
import { createMinimalGameState } from "./test-helpers";
import { setSquare, getSquare } from "../game";
import { applyMove } from "../move-application";

describe("applyMove castling", () => {
  let gameState: ReturnType<typeof createMinimalGameState>;

  const whiteKingStart: Position = { x: 4, y: 7 };
  const blackKingStart: Position = { x: 4, y: 0 };

  const whiteKingsideRookStart: Position = { x: 7, y: 7 };
  const whiteQueensideRookStart: Position = { x: 0, y: 7 };
  const blackKingsideRookStart: Position = { x: 7, y: 0 };
  const blackQueensideRookStart: Position = { x: 0, y: 0 };

  const whiteRook: Square = { type: "rook", colour: "white" };
  const blackRook: Square = { type: "rook", colour: "black" };

  beforeEach(() => {
    gameState = createMinimalGameState();
  });

  test("applies white kingside castling by moving king and rook", () => {
    setSquare(gameState.game.board, whiteKingsideRookStart, whiteRook);

    applyMove(gameState, {
      from: whiteKingStart,
      to: { x: 6, y: 7 },
    });

    expect(getSquare(gameState.game.board, { x: 6, y: 7 })).toEqual({
      type: "king",
      colour: "white",
    });
    expect(getSquare(gameState.game.board, { x: 5, y: 7 })).toEqual({
      type: "rook",
      colour: "white",
    });

    expect(getSquare(gameState.game.board, whiteKingStart)).toBe(null);
    expect(getSquare(gameState.game.board, whiteKingsideRookStart)).toBe(null);
  });

  test("applies white queenside castling by moving king and rook", () => {
    setSquare(gameState.game.board, whiteQueensideRookStart, whiteRook);

    applyMove(gameState, {
      from: whiteKingStart,
      to: { x: 2, y: 7 },
    });

    expect(getSquare(gameState.game.board, { x: 2, y: 7 })).toEqual({
      type: "king",
      colour: "white",
    });
    expect(getSquare(gameState.game.board, { x: 3, y: 7 })).toEqual({
      type: "rook",
      colour: "white",
    });

    expect(getSquare(gameState.game.board, whiteKingStart)).toBe(null);
    expect(getSquare(gameState.game.board, whiteQueensideRookStart)).toBe(null);
  });

  test("applies black kingside castling by moving king and rook", () => {
    setSquare(gameState.game.board, blackKingsideRookStart, blackRook);

    applyMove(gameState, {
      from: blackKingStart,
      to: { x: 6, y: 0 },
    });

    expect(getSquare(gameState.game.board, { x: 6, y: 0 })).toEqual({
      type: "king",
      colour: "black",
    });
    expect(getSquare(gameState.game.board, { x: 5, y: 0 })).toEqual({
      type: "rook",
      colour: "black",
    });

    expect(getSquare(gameState.game.board, blackKingStart)).toBe(null);
    expect(getSquare(gameState.game.board, blackKingsideRookStart)).toBe(null);
  });

  test("applies black queenside castling by moving king and rook", () => {
    setSquare(gameState.game.board, blackQueensideRookStart, blackRook);

    applyMove(gameState, {
      from: blackKingStart,
      to: { x: 2, y: 0 },
    });

    expect(getSquare(gameState.game.board, { x: 2, y: 0 })).toEqual({
      type: "king",
      colour: "black",
    });
    expect(getSquare(gameState.game.board, { x: 3, y: 0 })).toEqual({
      type: "rook",
      colour: "black",
    });

    expect(getSquare(gameState.game.board, blackKingStart)).toBe(null);
    expect(getSquare(gameState.game.board, blackQueensideRookStart)).toBe(null);
  });

  test("updates white king position after kingside castling", () => {
    setSquare(gameState.game.board, whiteKingsideRookStart, whiteRook);

    applyMove(gameState, {
      from: whiteKingStart,
      to: { x: 6, y: 7 },
    });

    expect(gameState.game.kingPositions.white).toEqual({ x: 6, y: 7 });
  });

  test("updates black king position after queenside castling", () => {
    setSquare(gameState.game.board, blackQueensideRookStart, blackRook);

    applyMove(gameState, {
      from: blackKingStart,
      to: { x: 2, y: 0 },
    });

    expect(gameState.game.kingPositions.black).toEqual({ x: 2, y: 0 });
  });

  test("marks white king and kingside rook as moved after white kingside castling", () => {
    setSquare(gameState.game.board, whiteKingsideRookStart, whiteRook);

    applyMove(gameState, {
      from: whiteKingStart,
      to: { x: 6, y: 7 },
    });

    expect(gameState.game.castlingRights.white.kingHasMoved).toBe(true);
    expect(gameState.game.castlingRights.white.kingsideRookHasMoved).toBe(true);
    expect(gameState.game.castlingRights.white.queensideRookHasMoved).toBe(
      false,
    );
  });

  test("marks black king and queenside rook as moved after black queenside castling", () => {
    setSquare(gameState.game.board, blackQueensideRookStart, blackRook);

    applyMove(gameState, {
      from: blackKingStart,
      to: { x: 2, y: 0 },
    });

    expect(gameState.game.castlingRights.black.kingHasMoved).toBe(true);
    expect(gameState.game.castlingRights.black.queensideRookHasMoved).toBe(
      true,
    );
    expect(gameState.game.castlingRights.black.kingsideRookHasMoved).toBe(
      false,
    );
  });

  test("does not add any captured pieces when castling", () => {
    setSquare(gameState.game.board, whiteKingsideRookStart, whiteRook);

    applyMove(gameState, {
      from: whiteKingStart,
      to: { x: 6, y: 7 },
    });

    expect(gameState.game.capturedPieces.white).toEqual([]);
    expect(gameState.game.capturedPieces.black).toEqual([]);
  });
});
