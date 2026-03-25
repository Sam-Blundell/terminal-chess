import { describe, expect, test } from "bun:test";

import { getGameEndStatus } from "../src/engine/game-status";
import { createMinimalGameState, placePieces } from "./test-helpers";

describe("getGameEndStatus", () => {
  test("returns Checkmate when side to move is in check and has no legal moves", () => {
    const gameState = createMinimalGameState();
    placePieces(gameState, ["K-f6", "Q-g7", "k-h8"]);

    expect(getGameEndStatus(gameState, "black")).toBe("Checkmate");
  });

  test("returns Stalemate when side to move is not in check and has no legal moves", () => {
    const gameState = createMinimalGameState();
    placePieces(gameState, ["K-f7", "Q-g6", "k-h8"]);

    expect(getGameEndStatus(gameState, "black")).toBe("Stalemate");
  });

  test("returns false when side to move is in check but has at least one legal move", () => {
    const gameState = createMinimalGameState();
    placePieces(gameState, ["K-a1", "Q-e7", "k-e8"]);

    expect(getGameEndStatus(gameState, "black")).toBe(false);
  });
});
