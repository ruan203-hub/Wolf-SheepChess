import {
  SHEEP,
  WOLF,
  applyMove,
  createInitialState,
  getLegalMoves,
  undo
} from './game-core.js';
import { WOLF_ICON_SVG } from './piece-icons.js';

const boardEl = document.querySelector('#board');
const turnTextEl = document.querySelector('#turnText');
const remainingSheepEl = document.querySelector('#remainingSheep');
const capturedSheepEl = document.querySelector('#capturedSheep');
const messageEl = document.querySelector('#message');
const undoButton = document.querySelector('#undoButton');
const restartButton = document.querySelector('#restartButton');
const themeToggle = document.querySelector('#themeToggle');

let state = createInitialState();
let theme = getSavedTheme();

applyTheme(theme);

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

themeToggle.addEventListener('click', () => {
  theme = theme === 'day' ? 'night' : 'day';
  applyTheme(theme);
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
    return '可跳吃：点击羊后方的红色空点，不是点击羊。';
  }

  return '请选择一个绿色高亮落点。';
}

function getSavedTheme() {
  try {
    return localStorage.getItem('boardTheme') === 'night' ? 'night' : 'day';
  } catch {
    return 'day';
  }
}

function applyTheme(nextTheme) {
  document.body.dataset.theme = nextTheme;
  themeToggle.textContent = nextTheme === 'night' ? '白天模式' : '晚上模式';
  themeToggle.setAttribute('aria-pressed', String(nextTheme === 'night'));

  try {
    localStorage.setItem('boardTheme', nextTheme);
  } catch {
    // Theme switching should still work when browser storage is unavailable.
  }
}

render();
