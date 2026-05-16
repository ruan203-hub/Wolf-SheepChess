import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHEEP,
  WOLF,
  applyMove,
  createInitialState,
  getLegalMoves,
  undo
} from '../game-core.js';

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

test('wolf can move one orthogonal step to an empty point', () => {
  const state = createInitialState();

  const moves = getLegalMoves(state, 0, 2);

  assert.deepEqual(moves, [
    { row: 1, col: 2, type: 'move' },
    { row: 0, col: 1, type: 'move' },
    { row: 2, col: 2, type: 'capture', captured: { row: 2, col: 2 } }
  ]);

  const next = applyMove(state, { row: 0, col: 2 }, { row: 1, col: 2 });

  assert.equal(next.board[0][2], null);
  assert.equal(next.board[1][2], WOLF);
  assert.equal(next.turn, SHEEP);
});

test('sheep can move one orthogonal step to an empty point', () => {
  const state = createInitialState();
  const wolfMoved = applyMove(state, { row: 0, col: 2 }, { row: 1, col: 2 });

  const moves = getLegalMoves(wolfMoved, 2, 0);

  assert.deepEqual(moves, [{ row: 1, col: 0, type: 'move' }]);

  const next = applyMove(wolfMoved, { row: 2, col: 0 }, { row: 1, col: 0 });

  assert.equal(next.board[2][0], null);
  assert.equal(next.board[1][0], SHEEP);
  assert.equal(next.turn, WOLF);
});

test('pieces cannot move diagonally or onto occupied points', () => {
  const state = createInitialState();

  assert.throws(
    () => applyMove(state, { row: 0, col: 2 }, { row: 1, col: 3 }),
    /非法移动/
  );
  assert.throws(
    () => applyMove(state, { row: 0, col: 2 }, { row: 0, col: 3 }),
    /非法移动/
  );
});

test('sheep cannot move like a capture', () => {
  const state = {
    ...createInitialState(),
    board: [
      [null, null, null, null, null, null],
      [null, null, WOLF, null, null, null],
      [null, null, SHEEP, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null]
    ],
    turn: SHEEP
  };

  assert.deepEqual(getLegalMoves(state, 2, 2), [
    { row: 3, col: 2, type: 'move' },
    { row: 2, col: 3, type: 'move' },
    { row: 2, col: 1, type: 'move' }
  ]);
  assert.throws(
    () => applyMove(state, { row: 2, col: 2 }, { row: 0, col: 2 }),
    /非法移动/
  );
});

test('wolf can jump over an empty point and capture a sheep two points away', () => {
  const state = {
    ...createInitialState(),
    board: [
      [null, null, null, null, null, null],
      [null, null, WOLF, null, null, null],
      [null, null, null, null, null, null],
      [null, null, SHEEP, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null]
    ],
    turn: WOLF
  };

  assert.deepEqual(getLegalMoves(state, 1, 2), [
    { row: 0, col: 2, type: 'move' },
    { row: 2, col: 2, type: 'move' },
    { row: 1, col: 3, type: 'move' },
    { row: 1, col: 1, type: 'move' },
    { row: 3, col: 2, type: 'capture', captured: { row: 3, col: 2 } }
  ]);

  const next = applyMove(state, { row: 1, col: 2 }, { row: 3, col: 2 });

  assert.equal(next.board[1][2], null);
  assert.equal(next.board[2][2], null);
  assert.equal(next.board[3][2], WOLF);
  assert.equal(next.capturedSheep, 1);
  assert.equal(next.turn, SHEEP);
});

test('wolf capture is optional when a normal move is also legal', () => {
  const state = {
    ...createInitialState(),
    board: [
      [null, null, null, null, null, null],
      [null, null, WOLF, null, null, null],
      [null, null, null, null, null, null],
      [null, null, SHEEP, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null]
    ],
    turn: WOLF
  };

  const next = applyMove(state, { row: 1, col: 2 }, { row: 1, col: 3 });

  assert.equal(next.board[1][2], null);
  assert.equal(next.board[1][3], WOLF);
  assert.equal(next.board[3][2], SHEEP);
  assert.equal(next.capturedSheep, 0);
});

test('wolf cannot capture more than one sheep in a single move', () => {
  const state = {
    ...createInitialState(),
    board: [
      [null, null, WOLF, null, null, null],
      [null, null, null, null, null, null],
      [null, null, SHEEP, null, null, null],
      [null, null, null, null, null, null],
      [null, null, SHEEP, null, null, null],
      [null, null, null, null, null, null],
    ],
    turn: WOLF
  };

  const next = applyMove(state, { row: 0, col: 2 }, { row: 2, col: 2 });

  assert.equal(next.turn, SHEEP);
  assert.equal(next.capturedSheep, 1);
  assert.equal(next.board[4][2], SHEEP);
});

test('wolves win when all sheep have been captured', () => {
  const state = {
    ...createInitialState(),
    board: [
      [null, null, WOLF, null, null, null],
      [null, null, null, null, null, null],
      [null, null, SHEEP, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null]
    ],
    capturedSheep: 23,
    turn: WOLF
  };

  const next = applyMove(state, { row: 0, col: 2 }, { row: 2, col: 2 });

  assert.equal(next.capturedSheep, 24);
  assert.equal(next.winner, WOLF);
});

test('wolf cannot capture with the old adjacent-sheep-then-empty pattern', () => {
  const state = {
    ...createInitialState(),
    board: [
      [null, null, null, null, null, null],
      [null, null, WOLF, null, null, null],
      [null, null, SHEEP, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null]
    ],
    turn: WOLF
  };

  assert.deepEqual(getLegalMoves(state, 1, 2), [
    { row: 0, col: 2, type: 'move' },
    { row: 1, col: 3, type: 'move' },
    { row: 1, col: 1, type: 'move' }
  ]);
  assert.throws(
    () => applyMove(state, { row: 1, col: 2 }, { row: 3, col: 2 }),
    /非法移动/
  );
});

test('sheep win when both wolves have no legal moves', () => {
  const state = {
    ...createInitialState(),
    board: [
      [WOLF, SHEEP, WOLF, SHEEP, SHEEP, null],
      [SHEEP, SHEEP, SHEEP, SHEEP, null, null],
      [SHEEP, SHEEP, SHEEP, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, SHEEP, null],
      [null, null, null, null, null, null]
    ],
    turn: SHEEP
  };

  const next = applyMove(state, { row: 4, col: 4 }, { row: 5, col: 4 });

  assert.equal(next.winner, SHEEP);
});

test('undo restores the previous full state', () => {
  const state = {
    ...createInitialState(),
    selected: { row: 0, col: 2 },
    message: '准备移动。'
  };

  const next = applyMove(state, { row: 0, col: 2 }, { row: 1, col: 2 });
  const restored = undo(next);

  assert.deepEqual(restored.board, state.board);
  assert.equal(restored.turn, state.turn);
  assert.deepEqual(restored.selected, state.selected);
  assert.equal(restored.capturedSheep, state.capturedSheep);
  assert.equal(restored.winner, state.winner);
  assert.equal(restored.message, state.message);
  assert.equal(restored.history.length, 0);
});
