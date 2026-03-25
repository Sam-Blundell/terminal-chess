import type { KeyEvent, CliRenderer } from "@opentui/core";
import type { Actions } from "./actions";

function initKeyboard(renderer: CliRenderer, actions: Actions): void {
  const keyHandler = renderer.keyInput;
  keyHandler.on("keypress", (key: KeyEvent) => {
    if (key.ctrl && key.name === "t") {
      renderer.console.toggle();
      return;
    }
    if (key.name === "up" || key.name === "w") {
      actions.onMoveFocus("up");
      return;
    }
    if (key.name === "left" || key.name === "a") {
      actions.onMoveFocus("left");
      return;
    }
    if (key.name === "down" || key.name === "s") {
      actions.onMoveFocus("down");
      return;
    }
    if (key.name === "right" || key.name === "d") {
      actions.onMoveFocus("right");
      return;
    }
    if (key.name === "return" || key.name === "space") {
      actions.onInteractWithFocusedSquare();
      return;
    }
    if (key.name === "q") {
      actions.onCancelSelection();
      return;
    }
  });
}

export { initKeyboard };
