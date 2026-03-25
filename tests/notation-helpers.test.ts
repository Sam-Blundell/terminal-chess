import { describe, expect, test } from "bun:test";

import {
  chessNotationToPosition,
  positionToChessNotation,
} from "../src/engine/notation-helpers";

describe("notation-helpers", () => {
  test("chessNotationToPosition and positionToChessNotation round-trip", () => {
    expect(positionToChessNotation(chessNotationToPosition("a1"))).toBe("a1");
    expect(positionToChessNotation(chessNotationToPosition("h8"))).toBe("h8");
  });

  test("chessNotationToPosition rejects invalid notation", () => {
    expect(() => chessNotationToPosition("i9")).toThrow("Invalid chess notation");
  });

  test("positionToChessNotation rejects invalid positions", () => {
    expect(() => positionToChessNotation({ x: 8, y: 0 })).toThrow(
      "Invalid position",
    );
  });
});
