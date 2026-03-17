import type { CliRenderer } from "@opentui/core";
import type { GameState } from "./state";
import type { Actions } from "./actions";
import { createCliRenderer, ConsolePosition } from "@opentui/core";
import { initGameState } from "./state";
import { initActions } from "./controller";
import { buildApp } from "./view";
import { initKeyboard } from "./keyboard";

function render(
  renderer: CliRenderer,
  actions: Actions,
  gameState: GameState,
): void {
  renderer.root.remove("app-root");
  renderer.root.add(buildApp(actions, gameState));
}

async function main() {
  const renderer = await createCliRenderer({
    useConsole: true,
    consoleOptions: {
      position: ConsolePosition.BOTTOM,
      sizePercent: 20,
    },
  });

  const gameState = initGameState();
  let actions: Actions;

  function reRender() {
    render(renderer, actions, gameState);
  }

  actions = initActions(gameState, reRender);
  initKeyboard(renderer, actions);
  reRender();
}

main();
