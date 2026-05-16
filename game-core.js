export const BOARD_SIZE = 6;
export const WOLF = 'wolf';
export const SHEEP = 'sheep';
export const DIRECTIONS = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: 1 },
  { row: 0, col: -1 }
];

export function createInitialState() {
  const board = createEmptyBoard();

  board[0][2] = WOLF;
  board[0][3] = WOLF;

  for (let row = 2; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      board[row][col] = SHEEP;
    }
  }

  return {
    board,
    turn: WOLF,
    selected: null,
    capturedSheep: 0,
    winner: null,
    message: '狼方先走。',
    history: []
  };
}

export function getLegalMoves(state, row, col) {
  if (!isInsideBoard(row, col)) {
    return [];
  }

  const piece = state.board[row][col];
  if (!piece || piece !== state.turn || state.winner) {
    return [];
  }

  const stepMoves = [];
  const captureMoves = [];

  DIRECTIONS.forEach((direction) => {
    const nextRow = row + direction.row;
    const nextCol = col + direction.col;

    if (isInsideBoard(nextRow, nextCol) && !state.board[nextRow][nextCol]) {
      stepMoves.push({ row: nextRow, col: nextCol, type: 'move' });
    }

    if (piece === WOLF && state.board[nextRow]?.[nextCol] === SHEEP) {
      const jumpRow = row + direction.row * 2;
      const jumpCol = col + direction.col * 2;

      if (isInsideBoard(jumpRow, jumpCol) && !state.board[jumpRow][jumpCol]) {
        captureMoves.push({
          row: jumpRow,
          col: jumpCol,
          type: 'capture',
          captured: { row: nextRow, col: nextCol }
        });
      }
    }
  });

  return [...stepMoves, ...captureMoves];
}

export function applyMove(state, from, to) {
  const legalMove = getLegalMoves(state, from.row, from.col).find(
    (move) => move.row === to.row && move.col === to.col
  );

  if (!legalMove) {
    throw new Error('非法移动');
  }

  const next = cloneState(state);
  const piece = next.board[from.row][from.col];

  next.history = [...state.history, createSnapshot(state)];
  next.board[from.row][from.col] = null;
  next.board[to.row][to.col] = piece;

  if (legalMove.type === 'capture') {
    next.board[legalMove.captured.row][legalMove.captured.col] = null;
    next.capturedSheep += 1;
  }

  next.turn = piece === WOLF ? SHEEP : WOLF;
  next.selected = null;
  next.message = next.turn === WOLF ? '轮到狼方。' : '轮到羊方。';
  next.winner = getWinner(next);

  if (next.winner === WOLF) {
    next.message = '狼方获胜：羊已被吃光。';
  }

  if (next.winner === SHEEP) {
    next.message = '羊方获胜：两只狼都无路可走。';
  }

  return next;
}

export function undo(state) {
  if (state.history.length === 0) {
    return state;
  }

  const previous = state.history[state.history.length - 1];

  return {
    board: previous.board.map((row) => [...row]),
    turn: previous.turn,
    selected: previous.selected ? { ...previous.selected } : null,
    capturedSheep: previous.capturedSheep,
    winner: previous.winner,
    message: previous.message,
    history: state.history.slice(0, -1)
  };
}

export function getWinner(state) {
  const remainingSheep = countPieces(state.board, SHEEP);

  if (remainingSheep === 0) {
    return WOLF;
  }

  const wolfMoves = findPieces(state.board, WOLF).flatMap(({ row, col }) =>
    getLegalMoves({ ...state, turn: WOLF, winner: null }, row, col)
  );

  if (wolfMoves.length === 0) {
    return SHEEP;
  }

  return null;
}

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function cloneState(state) {
  return {
    ...state,
    board: state.board.map((row) => [...row]),
    selected: state.selected ? { ...state.selected } : null,
    history: [...state.history]
  };
}

function createSnapshot(state) {
  return {
    board: state.board.map((row) => [...row]),
    turn: state.turn,
    selected: state.selected ? { ...state.selected } : null,
    capturedSheep: state.capturedSheep,
    winner: state.winner,
    message: state.message
  };
}

function isInsideBoard(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function countPieces(board, piece) {
  return board.flat().filter((cell) => cell === piece).length;
}

function findPieces(board, piece) {
  const pieces = [];

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (board[row][col] === piece) {
        pieces.push({ row, col });
      }
    }
  }

  return pieces;
}
