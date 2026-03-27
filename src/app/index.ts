import type { CliRenderer } from "@opentui/core";
import type { Actions } from "./actions";
import type { AppState } from "./app-state";
import { createCliRenderer, ConsolePosition } from "@opentui/core";
import { initAppState } from "./app-state";
import { initActions } from "./controller";
import { buildApp } from "../ui/view";
import { initKeyboard } from "./keyboard";

function render(renderer: CliRenderer, actions: Actions, app: AppState): void {
  renderer.root.remove("app-root");
  renderer.root.add(buildApp(actions, app));
}

async function main() {
  const renderer = await createCliRenderer({
    useConsole: true,
    consoleOptions: {
      position: ConsolePosition.BOTTOM,
      sizePercent: 20,
    },
  });

  const app = initAppState();
  let actions: Actions;

  function reRender() {
    render(renderer, actions, app);
  }

  function quit() {
    renderer.destroy();
  }

  actions = initActions(app, reRender, quit);
  initKeyboard(renderer, actions);
  reRender();
}

main();
