const BOARD_SIZE = 6;
const WOLF = 'wolf';
const SHEEP = 'sheep';
const DIRECTIONS = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: 1 },
  { row: 0, col: -1 }
];
const WOLF_ICON_SVG = `
  <svg class="wolf-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <path class="wolf-icon__head" d="M12 34 17 10l13 12h4l13-12 5 24c2 12-6 22-20 22S10 46 12 34Z"/>
    <path class="wolf-icon__muzzle" d="M22 39c2-8 18-8 20 0 1 6-4 12-10 12S21 45 22 39Z"/>
    <path class="wolf-icon__snout" d="M26 41h12l-6 6-6-6Z"/>
    <circle class="wolf-icon__eye" cx="25" cy="33" r="3"/>
    <circle class="wolf-icon__eye" cx="39" cy="33" r="3"/>
    <path class="wolf-icon__brow" d="M20 28 28 25"/>
    <path class="wolf-icon__brow" d="M44 28 36 25"/>
    <path class="wolf-icon__cheek" d="M17 39 27 42"/>
    <path class="wolf-icon__cheek" d="M47 39 37 42"/>
  </svg>
`;

function createInitialState() {
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

function getLegalMoves(state, row, col) {
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

    if (piece === WOLF && isInsideBoard(nextRow, nextCol) && !state.board[nextRow][nextCol]) {
      const sheepRow = row + direction.row * 2;
      const sheepCol = col + direction.col * 2;

      if (isInsideBoard(sheepRow, sheepCol) && state.board[sheepRow][sheepCol] === SHEEP) {
        captureMoves.push({
          row: sheepRow,
          col: sheepCol,
          type: 'capture',
          captured: { row: sheepRow, col: sheepCol }
        });
      }
    }
  });

  return [...stepMoves, ...captureMoves];
}

function applyMove(state, from, to) {
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

  if (legalMove.type === 'capture') {
    next.board[legalMove.captured.row][legalMove.captured.col] = null;
    next.capturedSheep += 1;
  }

  next.board[to.row][to.col] = piece;
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

function undo(state) {
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

function getWinner(state) {
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

const boardEl = document.querySelector('#board');
const turnTextEl = document.querySelector('#turnText');
const remainingSheepEl = document.querySelector('#remainingSheep');
const capturedSheepEl = document.querySelector('#capturedSheep');
const messageEl = document.querySelector('#message');
const undoButton = document.querySelector('#undoButton');
const restartButton = document.querySelector('#restartButton');

let state = createInitialState();

function render() {
  boardEl.innerHTML = '';

  const legalMoves = state.selected
    ? getLegalMoves(state, state.selected.row, state.selected.col)
    : [];

  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      const point = document.createElement('button');
      const piece = state.board[row][col];
      const isSelected = state.selected?.row === row && state.selected?.col === col;
      const legalMove = legalMoves.find((move) => move.row === row && move.col === col);

      point.type = 'button';
      point.className = [
        'point',
        isSelected ? 'selected' : '',
        legalMove ? 'legal' : '',
        legalMove?.type === 'capture' ? 'capture-target' : ''
      ].filter(Boolean).join(' ');
      point.style.setProperty('--row', row);
      point.style.setProperty('--col', col);
      point.setAttribute('role', 'gridcell');
      point.setAttribute('aria-label', getPointLabel(row, col, piece, legalMove));
      point.addEventListener('click', () => handlePointClick(row, col));

      if (piece) {
        const pieceEl = document.createElement('span');
        pieceEl.className = `piece ${piece}`;
        if (piece === WOLF) {
          pieceEl.innerHTML = WOLF_ICON_SVG;
        } else {
          pieceEl.textContent = '羊';
        }
        point.append(pieceEl);
      }

      boardEl.append(point);
    }
  }

  const remainingSheep = state.board.flat().filter((piece) => piece === SHEEP).length;
  turnTextEl.textContent = state.winner ? getWinnerText(state.winner) : getTurnText(state.turn);
  remainingSheepEl.textContent = String(remainingSheep);
  capturedSheepEl.textContent = String(state.capturedSheep);
  messageEl.textContent = state.message;
  undoButton.disabled = state.history.length === 0;
}

function handlePointClick(row, col) {
  if (state.winner) {
    state = { ...state, message: '胜负已定，请重新开始或撤销一步。' };
    render();
    return;
  }

  const piece = state.board[row][col];

  if (!state.selected) {
    selectPiece(row, col, piece);
    return;
  }

  const legalMove = getLegalMoves(state, state.selected.row, state.selected.col).find(
    (move) => move.row === row && move.col === col
  );

  if (legalMove) {
    state = applyMove(state, state.selected, { row, col });
    render();
    return;
  }

  if (piece === state.turn) {
    selectPiece(row, col, piece);
    return;
  }

  state = { ...state, message: '这个位置不能走，请选择高亮落点。' };
  render();
}

function selectPiece(row, col, piece) {
  if (!piece) {
    state = { ...state, selected: null, message: '请先选择当前行动方的棋子。' };
    render();
    return;
  }

  if (piece !== state.turn) {
    state = { ...state, selected: null, message: `现在轮到${getTurnText(state.turn)}。` };
    render();
    return;
  }

  const legalMoves = getLegalMoves(state, row, col);
  const hasCapture = legalMoves.some((move) => move.type === 'capture');
  state = {
    ...state,
    selected: { row, col },
    message: getSelectionMessage(legalMoves.length, hasCapture)
  };
  render();
}

undoButton.addEventListener('click', () => {
  state = undo(state);
  render();
});

restartButton.addEventListener('click', () => {
  state = createInitialState();
  render();
});

function getTurnText(turn) {
  return turn === WOLF ? '狼方' : '羊方';
}

function getWinnerText(winner) {
  return winner === WOLF ? '狼方获胜' : '羊方获胜';
}

function getPointLabel(row, col, piece, legalMove) {
  const position = `第${row + 1}行第${col + 1}列`;
  const pieceText = piece ? getTurnText(piece) : '空点';
  const moveText = legalMove?.type === 'capture' ? '，可跳吃' : legalMove ? '，可走' : '';

  return `${position}，${pieceText}${moveText}`;
}

function getSelectionMessage(moveCount, hasCapture) {
  if (moveCount === 0) {
    return '这枚棋子暂时无路可走。';
  }

  if (hasCapture) {
    return '可跳吃：点击隔一个空点后的红色羊棋。';
  }

  return '请选择一个绿色高亮落点。';
}

render();
