import { describe, expect, test } from "bun:test";

import { initKeyboard } from "../src/app/keyboard";

type KeypressHandler = (key: { name: string; ctrl?: boolean }) => void;

function createFakeRenderer() {
  let handler: KeypressHandler | null = null;
  let toggleCount = 0;

  const renderer = {
    keyInput: {
      on: (event: string, cb: KeypressHandler) => {
        if (event !== "keypress") {
          throw new Error(`Unexpected event: ${event}`);
        }
        handler = cb;
      },
    },
    console: {
      toggle: () => {
        toggleCount++;
      },
    },
  };

  return {
    renderer,
    emitKeypress: (key: { name: string; ctrl?: boolean }) => {
      if (!handler) throw new Error("keypress handler not registered");
      handler(key);
    },
    getToggleCount: () => toggleCount,
  };
}

describe("initKeyboard", () => {
  test("ctrl+t toggles the console", () => {
    const { renderer, emitKeypress, getToggleCount } = createFakeRenderer();

    initKeyboard(renderer as any, {
      onMoveFocus: () => {},
      onInteractWithSquare: () => {},
      onInteractWithFocusedSquare: () => {},
      onCancelSelection: () => {},
      onConfirmPromotion: () => {},
      onConfirmGameOverChoice: () => {},
    });

    emitKeypress({ name: "t", ctrl: true });
    expect(getToggleCount()).toBe(1);
  });

  test("movement keys call onMoveFocus", () => {
    const { renderer, emitKeypress } = createFakeRenderer();
    const calls: string[] = [];

    initKeyboard(renderer as any, {
      onMoveFocus: (direction) => calls.push(direction),
      onInteractWithSquare: () => {},
      onInteractWithFocusedSquare: () => {},
      onCancelSelection: () => {},
      onConfirmPromotion: () => {},
      onConfirmGameOverChoice: () => {},
    });

    emitKeypress({ name: "up" });
    emitKeypress({ name: "a" });
    emitKeypress({ name: "s" });
    emitKeypress({ name: "d" });

    expect(calls).toEqual(["up", "left", "down", "right"]);
  });

  test("return/space triggers interact and q triggers cancel", () => {
    const { renderer, emitKeypress } = createFakeRenderer();

    let interactCount = 0;
    let cancelCount = 0;

    initKeyboard(renderer as any, {
      onMoveFocus: () => {},
      onInteractWithSquare: () => {},
      onInteractWithFocusedSquare: () => {
        interactCount++;
      },
      onCancelSelection: () => {
        cancelCount++;
      },
      onConfirmPromotion: () => {},
      onConfirmGameOverChoice: () => {},
    });

    emitKeypress({ name: "return" });
    emitKeypress({ name: "space" });
    emitKeypress({ name: "q" });

    expect(interactCount).toBe(2);
    expect(cancelCount).toBe(1);
  });
});
