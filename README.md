# Terminal Chess

A terminal-based chess game built with OpenTUI.

Offline, pass-and-play, and aiming for rules-complete chess (minus a few draw rules that require move history).

## Run

Requirements:

- Bun

Install and run:

```bash
bun install
bun run index.ts
```

## Play

This is a local pass-and-play game. There is no networking, AI, or engine search.

### Controls

Mouse:

- Click a piece to select it
- Click a destination square to attempt a move
- Click the selected piece again to deselect

Keyboard:

- Move focus: Arrow keys or WASD
- Interact (select/move): Enter or Space
- Cancel selection: q
- Toggle console: Ctrl+T

### Gameplay Notes

- Moves are validated and illegal moves are rejected.
- Check, checkmate, and stalemate are detected.
- Castling, en passant, and promotion are supported.

## Rules Implemented

- Standard piece movement rules
- Captures
- Check and king safety (moves that leave your own king in check are illegal)
- Checkmate and stalemate
- Castling (including: no moving through/into check, rook/king movement rights)
- En passant
- Promotion (to queen, rook, bishop, or knight)

## Draw Rules Not Implemented (Yet)

These require tracking move history and/or additional state:

- Threefold repetition
- 50-move rule
- Insufficient material

## Project Structure

- `src/engine/`: chess rules and domain state
- `src/app/`: orchestration (controller, actions, keyboard wiring, startup)
- `src/ui/`: rendering (OpenTUI components)
- `tests/`: unit tests for engine + controller wiring

## Development

Run tests:

```bash
bun test
```
