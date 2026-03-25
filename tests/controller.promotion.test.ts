import { beforeEach, describe, expect, test } from "bun:test";
import { getSquare } from "../game";
import { initActions } from "../controller";
import { chessNotationToPosition } from "../notation-helpers";
import { createMinimalGameState, placePieces } from "./test-helpers";

describe("promotion flow", () => {
  let gameState: ReturnType<typeof createMinimalGameState>;
  let actions: ReturnType<typeof initActions>;

  beforeEach(() => {
    gameState = createMinimalGameState();
    actions = initActions(
      gameState,
      () => {},
      () => {},
    );
  });

  test("white pawn reaching back rank enters promotion mode", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-a7"]);
    gameState.game.currentTurn = "white";

    actions.onInteractWithSquare(chessNotationToPosition("a7"));
    actions.onInteractWithSquare(chessNotationToPosition("a8"));

    expect(gameState.ui.mode).toEqual({
      type: "promotion",
      position: chessNotationToPosition("a8"),
      colour: "white",
    });
  });

  test("black pawn reaching back rank enters promotion mode", () => {
    placePieces(gameState, ["K-e1", "k-e8", "p-a2"]);
    gameState.game.currentTurn = "black";

    actions.onInteractWithSquare(chessNotationToPosition("a2"));
    actions.onInteractWithSquare(chessNotationToPosition("a1"));

    expect(gameState.ui.mode).toEqual({
      type: "promotion",
      position: chessNotationToPosition("a1"),
      colour: "black",
    });
  });

  test("turn does not advance when promotion mode opens", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-a7"]);
    gameState.game.currentTurn = "white";

    actions.onInteractWithSquare(chessNotationToPosition("a7"));
    actions.onInteractWithSquare(chessNotationToPosition("a8"));

    expect(gameState.game.currentTurn).toBe("white");
  });

  test("promoted pawn remains a pawn until confirmation", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-a7"]);
    gameState.game.currentTurn = "white";

    actions.onInteractWithSquare(chessNotationToPosition("a7"));
    actions.onInteractWithSquare(chessNotationToPosition("a8"));

    expect(
      getSquare(gameState.game.board, chessNotationToPosition("a8")),
    ).toEqual({
      type: "pawn",
      colour: "white",
    });
  });

  test("confirming queen promotion replaces pawn with queen", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-a7"]);
    gameState.game.currentTurn = "white";

    actions.onInteractWithSquare(chessNotationToPosition("a7"));
    actions.onInteractWithSquare(chessNotationToPosition("a8"));
    actions.onConfirmPromotion("queen");

    expect(
      getSquare(gameState.game.board, chessNotationToPosition("a8")),
    ).toEqual({
      type: "queen",
      colour: "white",
    });
  });

  test("confirming rook promotion replaces pawn with rook", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-a7"]);
    gameState.game.currentTurn = "white";

    actions.onInteractWithSquare(chessNotationToPosition("a7"));
    actions.onInteractWithSquare(chessNotationToPosition("a8"));
    actions.onConfirmPromotion("rook");

    expect(
      getSquare(gameState.game.board, chessNotationToPosition("a8")),
    ).toEqual({
      type: "rook",
      colour: "white",
    });
  });

  test("confirming bishop promotion replaces pawn with bishop", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-a7"]);
    gameState.game.currentTurn = "white";

    actions.onInteractWithSquare(chessNotationToPosition("a7"));
    actions.onInteractWithSquare(chessNotationToPosition("a8"));
    actions.onConfirmPromotion("bishop");

    expect(
      getSquare(gameState.game.board, chessNotationToPosition("a8")),
    ).toEqual({
      type: "bishop",
      colour: "white",
    });
  });

  test("confirming knight promotion replaces pawn with knight", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-a7"]);
    gameState.game.currentTurn = "white";

    actions.onInteractWithSquare(chessNotationToPosition("a7"));
    actions.onInteractWithSquare(chessNotationToPosition("a8"));
    actions.onConfirmPromotion("knight");

    expect(
      getSquare(gameState.game.board, chessNotationToPosition("a8")),
    ).toEqual({
      type: "knight",
      colour: "white",
    });
  });

  test("confirming promotion returns ui mode to normal", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-a7"]);
    gameState.game.currentTurn = "white";

    actions.onInteractWithSquare(chessNotationToPosition("a7"));
    actions.onInteractWithSquare(chessNotationToPosition("a8"));
    actions.onConfirmPromotion("queen");

    expect(gameState.ui.mode).toEqual({ type: "normal" });
  });

  test("confirming promotion advances the turn", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-a7"]);

    actions.onInteractWithSquare(chessNotationToPosition("a7"));
    actions.onInteractWithSquare(chessNotationToPosition("a8"));
    actions.onConfirmPromotion("queen");

    expect(gameState.game.currentTurn).toBe("black");
  });

  test("board interaction does nothing during promotion mode", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-a7", "R-h1"]);
    gameState.game.currentTurn = "white";

    actions.onInteractWithSquare(chessNotationToPosition("a7"));
    actions.onInteractWithSquare(chessNotationToPosition("a8"));

    actions.onInteractWithSquare(chessNotationToPosition("h1"));

    expect(gameState.ui.mode).toEqual({
      type: "promotion",
      position: chessNotationToPosition("a8"),
      colour: "white",
    });
    expect(gameState.ui.selectedSquare).toBe(null);
    expect(
      getSquare(gameState.game.board, chessNotationToPosition("h1")),
    ).toEqual({
      type: "rook",
      colour: "white",
    });
  });

  test("keyboard interact does nothing during promotion mode", () => {
    placePieces(gameState, ["K-e1", "k-e8", "P-a7"]);
    gameState.game.currentTurn = "white";

    actions.onInteractWithSquare(chessNotationToPosition("a7"));
    actions.onInteractWithSquare(chessNotationToPosition("a8"));

    gameState.ui.focusedSquare = chessNotationToPosition("e1");
    actions.onInteractWithFocusedSquare();

    expect(gameState.ui.mode).toEqual({
      type: "promotion",
      position: chessNotationToPosition("a8"),
      colour: "white",
    });
    expect(
      getSquare(gameState.game.board, chessNotationToPosition("a8")),
    ).toEqual({
      type: "pawn",
      colour: "white",
    });
    expect(gameState.game.currentTurn).toBe("white");
  });
});
