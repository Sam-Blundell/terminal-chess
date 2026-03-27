import { beforeEach, describe, expect, test } from "bun:test";

import { initActions } from "../src/app/controller";
import { chessNotationToPosition } from "../src/engine/notation-helpers";
import { createMinimalAppState, placePieces } from "./test-helpers";

describe("controller gameover flow", () => {
  let gameState: ReturnType<typeof createMinimalAppState>;
  let actions: ReturnType<typeof initActions>;

  beforeEach(() => {
    gameState = createMinimalAppState();
    actions = initActions(
      gameState,
      () => {},
      () => {},
    );
  });

  test("a checkmating move sets gameover mode", () => {
    placePieces(gameState, ["K-f6", "Q-h7", "k-h8"]);
    gameState.game.currentTurn = "white";

    actions.onInteractWithSquare(chessNotationToPosition("h7"));
    actions.onInteractWithSquare(chessNotationToPosition("g7"));

    expect(gameState.ui.mode).toEqual({
      type: "gameover",
      result: "Checkmate",
      winner: "white",
    });
  });

  test("a stalemating move sets gameover mode", () => {
    placePieces(gameState, ["K-f7", "Q-f6", "k-h8"]);
    gameState.game.currentTurn = "white";

    actions.onInteractWithSquare(chessNotationToPosition("f6"));
    actions.onInteractWithSquare(chessNotationToPosition("g6"));

    expect(gameState.ui.mode).toEqual({
      type: "gameover",
      result: "Stalemate",
    });
  });

  test("promotion can result in checkmate after confirmation", () => {
    placePieces(gameState, ["K-f6", "R-g1", "P-g7", "k-h8"]);
    gameState.game.currentTurn = "white";

    actions.onInteractWithSquare(chessNotationToPosition("g7"));
    actions.onInteractWithSquare(chessNotationToPosition("g8"));

    // Enter promotion mode; game end is not evaluated yet.
    expect(gameState.ui.mode).toEqual({
      type: "promotion",
      position: chessNotationToPosition("g8"),
      colour: "white",
    });

    actions.onConfirmPromotion("queen");

    expect(gameState.ui.mode).toEqual({
      type: "gameover",
      result: "Checkmate",
      winner: "white",
    });
  });
});
