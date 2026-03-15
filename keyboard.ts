import type { KeyEvent, KeyHandler, CliRenderer } from "@opentui/core";

function initKeyboard(renderer: CliRenderer): KeyHandler {
  const keyHandler = renderer.keyInput;
  keyHandler.on("keypress", (key: KeyEvent) => {
    if (key.ctrl && key.name === "t") {
      renderer.console.toggle();
    }
  });
  return keyHandler;
}

export { initKeyboard };
