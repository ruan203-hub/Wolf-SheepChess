# 狼羊棋网页游戏 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local two-player 6x6 wolf-sheep chess browser game that follows the approved Chinese design spec.

**Architecture:** Use a dependency-free static frontend. Keep pure game rules in `game-core.js`, UI wiring in `game.js`, and tests in `tests/game-core.test.js` so rules can be verified without a browser.

**Tech Stack:** HTML, CSS, vanilla JavaScript ES modules, Node.js built-in test runner.

---

## File Structure

- Create `package.json`: project scripts for Node's built-in test runner.
- Create `index.html`: app shell, board container, status panel, and buttons.
- Create `styles.css`: responsive board layout, traditional line-board visual style, pieces, highlights, and panel.
- Create `game-core.js`: pure state and rules API.
- Create `game.js`: browser rendering and click handling.
- Create `tests/game-core.test.js`: rule-level tests for the approved gameplay.
- Modify `.gitignore`: add `.worktrees/` and test/runtime leftovers if needed.

## Task 1: Project Test Harness

**Files:**
- Create: `package.json`
- Create: `tests/game-core.test.js`

- [ ] **Step 1: Write failing test harness**

Create `package.json` with:

```json
{
  "name": "wolf-sheep-chess",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

Create `tests/game-core.test.js` with:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../game-core.js';

test('initial state has two wolves, twenty-four sheep, and wolf to move', () => {
  const state = createInitialState();

  assert.equal(state.turn, 'wolf');
  assert.equal(state.capturedSheep, 0);
  assert.equal(state.winner, null);
  assert.equal(state.board[0][2], 'wolf');
  assert.equal(state.board[0][3], 'wolf');
  assert.equal(state.board.flat().filter((piece) => piece === 'wolf').length, 2);
  assert.equal(state.board.flat().filter((piece) => piece === 'sheep').length, 24);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`

Expected: FAIL because `game-core.js` does not exist.

- [ ] **Step 3: Implement minimal core state**

Create `game-core.js` with constants and `createInitialState()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`

Expected: PASS.

## Task 2: Movement Rules

**Files:**
- Modify: `game-core.js`
- Modify: `tests/game-core.test.js`

- [ ] **Step 1: Add failing movement tests**

Add tests for wolf one-step moves, sheep one-step moves, no diagonal moves, occupied destinations, and sheep not capturing.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL because movement APIs are not implemented.

- [ ] **Step 3: Implement movement API**

Add `getLegalMoves(state, row, col)`, `applyMove(state, from, to)`, coordinate helpers, immutable state cloning, turn switching, and invalid move rejection.

- [ ] **Step 4: Run tests to verify pass**

Run: `npm test`

Expected: PASS.

## Task 3: Wolf Capture And Win Rules

**Files:**
- Modify: `game-core.js`
- Modify: `tests/game-core.test.js`

- [ ] **Step 1: Add failing capture and winner tests**

Add tests for wolf jump capture, optional capture, one capture per turn, wolves winning when sheep count reaches zero, and sheep winning when both wolves are blocked.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL because capture and winner handling is incomplete.

- [ ] **Step 3: Implement capture and winner rules**

Detect two-step orthogonal wolf jumps over sheep, remove captured sheep, increment capture count, prevent chained movement inside one move, and check both win conditions after each move.

- [ ] **Step 4: Run tests to verify pass**

Run: `npm test`

Expected: PASS.

## Task 4: Undo

**Files:**
- Modify: `game-core.js`
- Modify: `tests/game-core.test.js`

- [ ] **Step 1: Add failing undo test**

Add a test proving `undo(state)` restores board, turn, captured count, message, selected coordinate, and winner from the previous snapshot.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL because undo is not implemented.

- [ ] **Step 3: Implement history snapshots and undo**

Push snapshots before valid moves and expose `undo(state)`.

- [ ] **Step 4: Run tests to verify pass**

Run: `npm test`

Expected: PASS.

## Task 5: Browser UI

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `game.js`

- [ ] **Step 1: Build HTML shell**

Add the main game layout, board element, status values, hint area, restart button, and undo button.

- [ ] **Step 2: Build CSS**

Style a responsive 6x6 intersection board, circular wolf and sheep pieces, legal destination dots, selected state, and compact status panel.

- [ ] **Step 3: Wire browser interactions**

Render state from `game-core.js`, select pieces, highlight legal moves, apply moves on legal destinations, show invalid action hints, restart, and undo.

- [ ] **Step 4: Run rule tests**

Run: `npm test`

Expected: PASS.

## Task 6: Manual Verification And Commit

**Files:**
- All created implementation files.

- [ ] **Step 1: Run automated tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Start a static server**

Run: `python3 -m http.server 8000`

Expected: local app is available at `http://localhost:8000`.

- [ ] **Step 3: Browser smoke check**

Open the page, verify the board renders, pieces are visible, legal destinations highlight, a wolf move works, undo works, restart works, and the mobile layout does not overlap.

- [ ] **Step 4: Commit**

Run:

```bash
git add package.json index.html styles.css game.js game-core.js tests/game-core.test.js docs/superpowers/plans/2026-05-16-wolf-sheep-chess-web-game.md
git commit -m "feat: build wolf sheep chess game"
```
