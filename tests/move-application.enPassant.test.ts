import { beforeEach, describe, expect, test } from "bun:test";
import { applyMove } from "../src/engine/move-application";
import { getSquare } from "../src/engine/game";
import { chessNotationToPosition } from "../src/engine/notation-helpers";
import { createMinimalGameState, placePieces } from "./test-helpers";

describe("applyMove en passant", () => {
  let gameState: ReturnType<typeof createMinimalGameState>;

  beforeEach(() => {
    gameState = createMinimalGameState();
  });

  test("double pawn move sets en passant square for black pawn", () => {
    placePieces(gameState, ["K-e1", "k-e8", "p-d7"]);

    applyMove(gameState, {
      from: chessNotationToPosition("d7"),
      to: chessNotationToPosition("d5"),
    });

    expect(gameState.game.enPassant).toEqual(chessNotationToPosition("d6"));
  });

  test("double pawn move sets en passant square for white pawn", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-d2"]);

    applyMove(gameState, {
      from: chessNotationToPosition("d2"),
      to: chessNotationToPosition("d4"),
    });

    expect(gameState.game.enPassant).toEqual(chessNotationToPosition("d3"));
  });

  test("non-double move clears existing en passant square", () => {
    placePieces(gameState, ["K-e1", "k-e8", "p-d7", "R-h1"]);

    applyMove(gameState, {
      from: chessNotationToPosition("d7"),
      to: chessNotationToPosition("d5"),
    });

    expect(gameState.game.enPassant).toEqual(chessNotationToPosition("d6"));

    applyMove(gameState, {
      from: chessNotationToPosition("h1"),
      to: chessNotationToPosition("h2"),
    });

    expect(gameState.game.enPassant).toBe(null);
  });

  test("castling clears existing en passant square", () => {
    placePieces(gameState, ["K-e1", "R-h1", "k-e8", "p-d7"]);

    applyMove(gameState, {
      from: chessNotationToPosition("d7"),
      to: chessNotationToPosition("d5"),
    });

    expect(gameState.game.enPassant).toEqual(chessNotationToPosition("d6"));

    applyMove(gameState, {
      from: chessNotationToPosition("e1"),
      to: chessNotationToPosition("g1"),
    });

    expect(gameState.game.enPassant).toBe(null);
  });

  test("en passant capture removes the passed pawn", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-e5", "p-d7"]);

    applyMove(gameState, {
      from: chessNotationToPosition("d7"),
      to: chessNotationToPosition("d5"),
    });

    applyMove(gameState, {
      from: chessNotationToPosition("e5"),
      to: chessNotationToPosition("d6"),
    });

    expect(getSquare(gameState.game.board, chessNotationToPosition("d5"))).toBe(
      null,
    );
    expect(
      getSquare(gameState.game.board, chessNotationToPosition("d6")),
    ).toEqual({
      type: "pawn",
      colour: "white",
    });
  });

  test("en passant capture records the captured pawn", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-e5", "p-d7"]);

    applyMove(gameState, {
      from: chessNotationToPosition("d7"),
      to: chessNotationToPosition("d5"),
    });

    applyMove(gameState, {
      from: chessNotationToPosition("e5"),
      to: chessNotationToPosition("d6"),
    });

    expect(gameState.game.capturedPieces.black).toContainEqual({
      type: "pawn",
      colour: "black",
    });
  });

  test("en passant capture clears en passant square", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-e5", "p-d7"]);

    applyMove(gameState, {
      from: chessNotationToPosition("d7"),
      to: chessNotationToPosition("d5"),
    });

    expect(gameState.game.enPassant).toEqual(chessNotationToPosition("d6"));

    applyMove(gameState, {
      from: chessNotationToPosition("e5"),
      to: chessNotationToPosition("d6"),
    });

    expect(gameState.game.enPassant).toBe(null);
  });

  test("black en passant capture removes the passed pawn and moves correctly", () => {
    placePieces(gameState, ["K-e1", "k-e8", "p-e4", "P-d2"]);

    applyMove(gameState, {
      from: chessNotationToPosition("d2"),
      to: chessNotationToPosition("d4"),
    });

    applyMove(gameState, {
      from: chessNotationToPosition("e4"),
      to: chessNotationToPosition("d3"),
    });

    expect(getSquare(gameState.game.board, chessNotationToPosition("d4"))).toBe(
      null,
    );
    expect(
      getSquare(gameState.game.board, chessNotationToPosition("d3")),
    ).toEqual({
      type: "pawn",
      colour: "black",
    });
  });
});
