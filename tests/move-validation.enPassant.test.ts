import { beforeEach, describe, expect, test } from "bun:test";
import { isLegalMove as isLegalMoveEngine } from "../src/engine/move-validation";
import { applyMove as applyMoveEngine } from "../src/engine/move-application";
import { chessNotationToPosition } from "../src/engine/notation-helpers";
import { createMinimalAppState, placePieces } from "./test-helpers";

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

describe("isLegalMove en passant", () => {
  let gameState: ReturnType<typeof createMinimalAppState>;

  beforeEach(() => {
    gameState = createMinimalAppState();
  });

  test("white pawn can capture en passant immediately after black double pawn move", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-e5", "p-d7"]);

    applyMove(gameState, {
      from: chessNotationToPosition("d7"),
      to: chessNotationToPosition("d5"),
    });

    expect(
      isLegalMove(gameState, {
        from: chessNotationToPosition("e5"),
        to: chessNotationToPosition("d6"),
      }),
    ).toBe(true);
  });

  test("black pawn can capture en passant immediately after white double pawn move", () => {
    placePieces(gameState, ["K-e1", "k-e8", "p-e4", "P-d2"]);

    applyMove(gameState, {
      from: chessNotationToPosition("d2"),
      to: chessNotationToPosition("d4"),
    });

    expect(
      isLegalMove(gameState, {
        from: chessNotationToPosition("e4"),
        to: chessNotationToPosition("d3"),
      }),
    ).toBe(true);
  });

  test("en passant is illegal after one intervening move", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-e5", "p-d7", "R-h1"]);

    applyMove(gameState, {
      from: chessNotationToPosition("d7"),
      to: chessNotationToPosition("d5"),
    });

    applyMove(gameState, {
      from: chessNotationToPosition("h1"),
      to: chessNotationToPosition("h2"),
    });

    expect(
      isLegalMove(gameState, {
        from: chessNotationToPosition("e5"),
        to: chessNotationToPosition("d6"),
      }),
    ).toBe(false);
  });

  test("diagonal pawn move into empty square is illegal when en passant is not available", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-e5"]);

    expect(
      isLegalMove(gameState, {
        from: chessNotationToPosition("e5"),
        to: chessNotationToPosition("d6"),
      }),
    ).toBe(false);
  });

  test("en passant is illegal if destination is not the en passant square", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-e5", "p-d7"]);

    applyMove(gameState, {
      from: chessNotationToPosition("d7"),
      to: chessNotationToPosition("d5"),
    });

    expect(
      isLegalMove(gameState, {
        from: chessNotationToPosition("e5"),
        to: chessNotationToPosition("f6"),
      }),
    ).toBe(false);
  });

  test("en passant is illegal if it would leave king in check", () => {
    placePieces(gameState, ["K-e5", "k-h8", "P-d5", "p-c7", "r-a5"]);

    applyMove(gameState, {
      from: chessNotationToPosition("c7"),
      to: chessNotationToPosition("c5"),
    });

    expect(
      isLegalMove(gameState, {
        from: chessNotationToPosition("d5"),
        to: chessNotationToPosition("c6"),
      }),
    ).toBe(false);
  });
});
