import type { GameState } from "../engine/game-state";
import type { UIState } from "./ui-state";

import { initGameState } from "../engine/game-state";
import { initUIState } from "./ui-state";

type AppState = {
  game: GameState;
  ui: UIState;
};

function initAppState(): AppState {
  return {
    game: initGameState(),
    ui: initUIState(),
  };
}

export type { AppState };
export { initAppState };
