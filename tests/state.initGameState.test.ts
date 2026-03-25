import { describe, expect, test } from "bun:test";

import { getSquare } from "../src/engine/game";
import { initGameState } from "../src/engine/state";
import { chessNotationToPosition } from "../src/engine/notation-helpers";

describe("initGameState", () => {
  test("initializes expected defaults", () => {
    const gameState = initGameState();

    expect(gameState.game.currentTurn).toBe("white");
    expect(gameState.game.enPassant).toBe(null);
    expect(gameState.ui.mode).toEqual({ type: "normal" });
    expect(gameState.ui.focusedSquare).toBe(null);
    expect(gameState.ui.selectedSquare).toBe(null);

    expect(getSquare(gameState.game.board, chessNotationToPosition("e1"))).toEqual({
      type: "king",
      colour: "white",
    });
    expect(getSquare(gameState.game.board, chessNotationToPosition("e8"))).toEqual({
      type: "king",
      colour: "black",
    });
  });
});
