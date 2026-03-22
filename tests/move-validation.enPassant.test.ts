import { beforeEach, describe, expect, test } from "bun:test";
import { isLegalMove } from "../move-validation";
import { applyMove } from "../move-application";
import { chessNotationToPosition } from "../notation-helpers";
import { createMinimalGameState, placePieces } from "./test-helpers";

describe("isLegalMove en passant", () => {
  let gameState: ReturnType<typeof createMinimalGameState>;

  beforeEach(() => {
    gameState = createMinimalGameState();
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
