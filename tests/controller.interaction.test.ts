import { beforeEach, describe, expect, test } from "bun:test";

import { initActions } from "../src/app/controller";
import { chessNotationToPosition } from "../src/engine/notation-helpers";
import { getSquare } from "../src/engine/game";
import { createMinimalAppState, placePieces } from "./test-helpers";

describe("controller", () => {
  let gameState: ReturnType<typeof createMinimalAppState>;
  let reRenderCount: number;
  let quitCount: number;
  let actions: ReturnType<typeof initActions>;

  beforeEach(() => {
    gameState = createMinimalAppState();
    reRenderCount = 0;
    quitCount = 0;
    actions = initActions(
      gameState,
      () => {
        reRenderCount++;
      },
      () => {
        quitCount++;
      },
    );
  });

  describe("focus", () => {
    test("defaults focus to {3,3} and moves within bounds", () => {
      expect(gameState.ui.focusedSquare).toBe(null);

      actions.onMoveFocus("up");
      expect(gameState.ui.focusedSquare).toEqual({ x: 3, y: 2 });
      expect(reRenderCount).toBe(1);

      actions.onMoveFocus("left");
      expect(gameState.ui.focusedSquare).toEqual({ x: 2, y: 2 });
      expect(reRenderCount).toBe(2);
    });

    test("does not move out of bounds and does not re-render", () => {
      gameState.ui.focusedSquare = { x: 0, y: 0 };
      actions.onMoveFocus("up");
      actions.onMoveFocus("left");
      expect(gameState.ui.focusedSquare).toEqual({ x: 0, y: 0 });
      expect(reRenderCount).toBe(0);
    });

    test("does nothing during promotion and gameover modes", () => {
      gameState.ui.mode = {
        type: "promotion",
        position: chessNotationToPosition("a8"),
        colour: "white",
      };
      actions.onMoveFocus("up");
      expect(gameState.ui.focusedSquare).toBe(null);
      expect(reRenderCount).toBe(0);

      gameState.ui.mode = { type: "gameover", result: "Stalemate", colour: null };
      actions.onMoveFocus("up");
      expect(gameState.ui.focusedSquare).toBe(null);
      expect(reRenderCount).toBe(0);
    });
  });

  describe("selection", () => {
    test("selects only the current player's pieces", () => {
      placePieces(gameState, ["K-e1", "k-e8", "R-a1", "r-a8"]);
      gameState.game.currentTurn = "white";

      actions.onInteractWithSquare(chessNotationToPosition("a8"));
      expect(gameState.ui.selectedSquare).toBe(null);

      actions.onInteractWithSquare(chessNotationToPosition("a1"));
      expect(gameState.ui.selectedSquare).toEqual(chessNotationToPosition("a1"));
    });

    test("cancel clears selection", () => {
      placePieces(gameState, ["K-e1", "k-e8", "R-a1"]);
      gameState.game.currentTurn = "white";

      actions.onInteractWithSquare(chessNotationToPosition("a1"));
      expect(gameState.ui.selectedSquare).toEqual(chessNotationToPosition("a1"));

      actions.onCancelSelection();
      expect(gameState.ui.selectedSquare).toBe(null);
      expect(reRenderCount).toBeGreaterThan(0);
    });
  });

  describe("focus clearing", () => {
    test("board interaction clears focused square even if selection fails", () => {
      gameState.ui.focusedSquare = chessNotationToPosition("d4");
      expect(gameState.ui.focusedSquare).not.toBe(null);

      // Click an empty square; nothing selectable, but focus should clear.
      actions.onInteractWithSquare(chessNotationToPosition("d4"));
      expect(gameState.ui.focusedSquare).toBeNull();
      expect(reRenderCount).toBe(1);
      expect(gameState.ui.selectedSquare).toBeNull();
    });
  });

  describe("gameover menu", () => {
    test("new game resets state", () => {
      placePieces(gameState, ["K-e1", "k-e8", "Q-a1"]);
      gameState.ui.mode = { type: "gameover", result: "Stalemate", colour: null };
      gameState.ui.selectedSquare = chessNotationToPosition("a1");
      gameState.ui.focusedSquare = chessNotationToPosition("b2");
      gameState.game.currentTurn = "black";

      actions.onConfirmGameOverChoice("newGame");

      expect((gameState.ui.mode as { type: string }).type).toBe("normal");
      expect(gameState.ui.selectedSquare).toBeNull();
      expect(gameState.ui.focusedSquare).toBeNull();
      expect((gameState.game.currentTurn as string) === "white").toBe(true);

      // Sanity check a couple of initial squares.
      expect(getSquare(gameState.game.board, chessNotationToPosition("e1"))).toEqual({
        type: "king",
        colour: "white",
      });
      expect(getSquare(gameState.game.board, chessNotationToPosition("e8"))).toEqual({
        type: "king",
        colour: "black",
      });
      expect(getSquare(gameState.game.board, chessNotationToPosition("a2"))).toEqual({
        type: "pawn",
        colour: "white",
      });
      expect(getSquare(gameState.game.board, chessNotationToPosition("a7"))).toEqual({
        type: "pawn",
        colour: "black",
      });
    });

    test("quit calls quit callback and does not re-render", () => {
      gameState.ui.mode = { type: "gameover", result: "Stalemate", colour: null };
      actions.onConfirmGameOverChoice("quit");

      expect(quitCount).toBe(1);
      expect(reRenderCount).toBe(0);
    });
  });
});
