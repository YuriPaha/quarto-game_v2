// ✅ JavaScript: 콰르토 게임 전체 스크립트 (모바일 최적화, 멀티플레이 제외)

const allPieces = [];
let idCounter = 0;

const ATTRS = {
  height: ['tall', 'short'],
  color: ['dark', 'light'],
  shape: ['round', 'square'],
  hole: [true, false],
};

for (let h of ATTRS.height) {
  for (let c of ATTRS.color) {
    for (let s of ATTRS.shape) {
      for (let ho of ATTRS.hole) {
        allPieces.push({
          id: idCounter++, height: h, color: c, shape: s, hole: ho, used: false
        });
      }
    }
  }
}

const board = Array.from({ length: 4 }, () => Array(4).fill(null));
let selectedPiece = null;
let currentPlayer = 0;
let lastPlaced = null;
let isGameOver = false;
let winningCells = [];
let gameLog = [];
let turnCount = 1;
let historyStack = [];

function formatPiece(p) {
  const name = p.height[0] + p.color[0] + p.shape[0] + (p.hole ? 'o' : 'x');
  const img = document.createElement('img');
  img.src = `./pieces/${name}.png`;
  img.alt = name;
  img.title = `${p.height}, ${p.color}, ${p.shape}, ${p.hole ? 'hole' : 'solid'}`;
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'contain';
  img.style.display = 'block';
  img.onerror = () => {
    const fallback = document.createElement('div');
    fallback.innerText = name.toUpperCase();
    fallback.style.display = 'flex';
    fallback.style.alignItems = 'center';
    fallback.style.justifyContent = 'center';
    fallback.style.width = '100%';
    fallback.style.height = '100%';
    fallback.style.fontWeight = 'bold';
    fallback.style.color = '#999';
    fallback.style.border = '1px dashed #ccc';
    img.replaceWith(fallback);
  };
  return img;
}

// ✅ JavaScript: 콰르토 게임 전체 스크립트 (모바일 최적화, 멀티플레이 제외)

// [... 생략: 모든 변수 및 함수 정의는 기존 그대로 유지 ...]

// ✅ JavaScript: 콰르토 게임 전체 스크립트 (모바일 최적화, 멀티플레이 제외)

// [... 생략: 모든 변수 및 함수 정의는 기존 그대로 유지 ...]

function renderBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      // ✅ 승리한 셀 먼저 처리
      if (winningCells.some(([wr, wc]) => wr === r && wc === c)) {
        cell.classList.add("win");
      }

      // ✅ 선택된 셀은 마지막에만 추가 (승리 셀이 아닌 경우만)
      else if (lastPlaced && lastPlaced.row === r && lastPlaced.col === c) {
        cell.classList.add("selected-cell");
      }

      else if (!board[r][c]) {
        cell.classList.add("empty");
        const plus = document.createElement("div");
        plus.innerText = "+";
        plus.style.fontSize = "24px";
        plus.style.color = "#ccc";
        plus.style.display = "flex";
        plus.style.justifyContent = "center";
        plus.style.alignItems = "center";
        plus.style.width = "100%";
        plus.style.height = "100%";
        cell.appendChild(plus);
      }

      if (board[r][c]) {
        const img = formatPiece(board[r][c]);
        cell.appendChild(img);
      }

      cell.onclick = () => placePiece(r, c);
      boardDiv.appendChild(cell);
    }
  }
}

// [... 생략: 나머지 함수는 기존 그대로 유지 ...]

// ✅ 말 선택 UI에서 체크 아이콘 표시 추가
function renderPieceSelector() {
  const selector = document.getElementById("piece-selector");
  selector.innerHTML = "";
  allPieces.forEach(p => {
    if (p.used) return;
    const btn = document.createElement("div");
    btn.className = "piece";
    if (selectedPiece && selectedPiece.id === p.id) {
      btn.classList.add("selected");

      // ✅ 체크 아이콘 추가
      const check = document.createElement("div");
      check.innerText = "✔";
      check.style.position = "absolute";
      check.style.top = "4px";
      check.style.right = "4px";
      check.style.fontSize = "16px";
      check.style.color = "#2196f3";
      check.style.fontWeight = "bold";
      btn.appendChild(check);
      btn.style.position = "relative";
    }
    const img = formatPiece(p);
    btn.appendChild(img);
    btn.onclick = () => selectPiece(p.id);
    selector.appendChild(btn);
  });
}

// [... 생략: 나머지 함수는 기존 그대로 유지 ...]

// ✅ 말 선택 함수 수정: 선택 취소 없이 다른 말로 교체 가능 + 체크 아이콘 표시
function selectPiece(pieceId) {
  if (isGameOver) return;
  const piece = allPieces.find(p => p.id === pieceId && !p.used);
  if (!piece) return;

  if (selectedPiece && selectedPiece.id === piece.id) {
    // 같은 말 다시 누르면 취소
    selectedPiece = null;
    log(`선택 취소: ${getPieceCode(piece)}`);
  } else {
    selectedPiece = piece;
    log(`${turnCount}턴 - Player ${1 - currentPlayer + 1}: 말 ${getPieceCode(piece)} 선택`);
    if (navigator.vibrate) navigator.vibrate(50);
  }

  renderPieceSelector();
  updateTurnInfo();
}

function placePiece(row, col) {
  if (isGameOver || !selectedPiece || board[row][col]) return;
  if (navigator.vibrate) navigator.vibrate([100, 30, 50]);
  historyStack.push({
    board: JSON.parse(JSON.stringify(board)),
    usedPieces: allPieces.map(p => p.used),
    selectedPieceId: selectedPiece.id,
    currentPlayer,
    turnCount,
    lastPlaced: lastPlaced ? { ...lastPlaced } : null,
    gameLog: [...gameLog],
  });
  board[row][col] = selectedPiece;
  selectedPiece.used = true;
  lastPlaced = { row, col };
  log(`${turnCount}턴 - Player ${currentPlayer + 1}: ${getPieceCode(selectedPiece)} → (${row}, ${col})`);
  if (checkWin(row, col)) {
    const winningPieces = winningCells.map(([r, c]) => board[r][c]);
    const common = findWinningAttribute(winningPieces);
    isGameOver = true;
    renderBoard();
    if (common) {
      for (const [r, c] of winningCells) {
        addAttributeImageOverlay(r, c, common.attr, winningPieces[0][common.attr]);
      }
    }
    setTimeout(() => {
      let msg = `🎉 플레이어 ${currentPlayer + 1} 승리!`;
      if (common) msg += `\n공통 속성: ${common.attr}`;
      alert(msg);
      showRestartButton();
    }, 1500);
    return;
  }
  selectedPiece = null;
  currentPlayer = 1 - currentPlayer;
  turnCount++;
  renderBoard();
  renderPieceSelector();
  updateTurnInfo();
}

function updateTurnInfo() {
  const info = document.getElementById("turn-info");
  info.innerText = !selectedPiece ?
    `플레이어 ${(1 - currentPlayer) + 1}: 말 선택` :
    `플레이어 ${currentPlayer + 1}: 말을 보드에 놓으세요`;
}

function checkWin(row, col) {
  const lines = [
    { cells: board[row].map((_, c) => [row, c]) },
    { cells: board.map((_, r) => [r, col]) },
  ];
  if (row === col) lines.push({ cells: [0,1,2,3].map(i => [i, i]) });
  if (row + col === 3) lines.push({ cells: [0,1,2,3].map(i => [i, 3 - i]) });
  for (let line of lines) {
    const pieces = line.cells.map(([r, c]) => board[r][c]);
    if (isWinningLine(pieces)) {
      winningCells = line.cells;
      return true;
    }
  }
  return false;
}

function isWinningLine(line) {
  if (line.some(p => !p)) return false;
  return ['height', 'color', 'shape', 'hole'].some(attr =>
    line.every(p => p[attr] === line[0][attr])
  );
}

function getPieceCode(p) {
  return p.height[0] + p.color[0] + p.shape[0] + (p.hole ? 'o' : 'x');
}

function log(message) {
  gameLog.push(message);
  const logBox = document.getElementById("log-box");
  logBox.innerHTML = gameLog.map((msg) => `<div>${msg}</div>`).join('');
  logBox.scrollTop = logBox.scrollHeight;
}

function showRestartButton() {
  const ctrl = document.getElementById("controls");
  ctrl.innerHTML = "";
  const btn = document.createElement("button");
  btn.innerText = "🔄 다시 시작";
  btn.onclick = resetGame;
  ctrl.appendChild(btn);
}

function showUndoButton() {
  const ctrl = document.getElementById("controls");
  const undoBtn = document.createElement("button");
  undoBtn.innerText = "↩ 되감기";
  undoBtn.onclick = undoMove;
  undoBtn.style.marginRight = "10px";
  ctrl.appendChild(undoBtn);
}

function undoMove() {
  if (historyStack.length === 0 || isGameOver) {
    alert("되돌릴 수 있는 턴이 없습니다.");
    return;
  }
  const prev = historyStack.pop();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      board[r][c] = prev.board[r][c];
    }
  }
  allPieces.forEach((p, i) => p.used = prev.usedPieces[i]);
  selectedPiece = allPieces.find(p => p.id === prev.selectedPieceId);
  currentPlayer = prev.currentPlayer;
  turnCount = prev.turnCount;
  lastPlaced = prev.lastPlaced;
  gameLog = [...prev.gameLog];
  document.getElementById("log-box").innerHTML = gameLog.map((msg) => `<div>${msg}</div>`).join('');
  renderBoard();
  renderPieceSelector();
  updateTurnInfo();
}

function resetGame() {
  for (let p of allPieces) p.used = false;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      board[r][c] = null;
    }
  }
  selectedPiece = null;
  currentPlayer = 0;
  lastPlaced = null;
  isGameOver = false;
  winningCells = [];
  gameLog = [];
  turnCount = 1;
  historyStack = [];
  document.getElementById("log-box").innerHTML = "";
  document.getElementById("controls").innerHTML = "";
  renderBoard();
  renderPieceSelector();
  updateTurnInfo();
  showUndoButton();
}

function findWinningAttribute(pieces) {
  const ATTR_ICONS = {
    height: { tall: 'height-tall', short: 'height-short' },
    color: { dark: 'color-dark', light: 'color-light' },
    shape: { round: 'shape-round', square: 'shape-square' },
    hole: { true: 'hole-true', false: 'hole-false' },
  };
  const attributes = ['height', 'color', 'shape', 'hole'];
  for (let attr of attributes) {
    const firstValue = pieces[0][attr];
    if (pieces.every(p => p[attr] === firstValue)) {
      return { attr, icon: ATTR_ICONS[attr][firstValue] };
    }
  }
  return null;
}

function getWinningAttributeImagePath(attr, value) {
  return `./icons/${attr}-${String(value)}.png`;
}

function addAttributeImageOverlay(r, c, attr, value) {
  const boardDiv = document.getElementById("board");
  const index = r * 4 + c;
  const cell = boardDiv.children[index];
  const overlay = document.createElement("img");
  overlay.className = "attr-image-overlay";
  overlay.src = getWinningAttributeImagePath(attr, value);
  overlay.alt = `${attr}-${value}`;
  cell.appendChild(overlay);
}

// 초기 실행
renderBoard();
renderPieceSelector();
updateTurnInfo();
showUndoButton();
