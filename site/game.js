// Register Vanilla JS Shortcut Functions
function DQS(val) {return document.querySelector(val);}
function DQSA(val) {return document.querySelectorAll(val);}
function DID(val) {return document.getElementById(val);}
function DCN(val) {return document.getElementsByClassName(val);}
function DCE(val) {return document.createElement(val);}
function DCTN(val) {return document.createTextNode(val);}
function DPFS(val) {return new DOMParser().parseFromString(val, 'text/html');}

// piecePositions = {
//   'L1': 'Start',
//   'L2': 'Start',
//   'L3': 'Start',
//   'L4': 'L01',
//   'L5': 'C09',
//   'L6': 'Start',
//   'L7': 'Start',
//   'R1': 'Start',
//   'R2': 'Start',
//   'R3': 'Finish',
//   'R4': 'Start',
//   'R5': 'Start',
//   'R6': 'Start',
//   'R7': 'Start',
// }

boardModel = [
  ['L04', 'C05', 'R04'],
  ['L03', 'C06', 'R03'],
  ['L02', 'C07', 'R02'],
  ['L01', 'C08', 'R01'],
  [       'C09',      ],
  [       'C10',      ],
  ['L14', 'C11', 'R14'],
  ['L13', 'C12', 'R13'],
];

rosettes = [
  'L04',         'R04',

  
          'C08',


  'L14',         'R14',

]

let currentBoard = {};

async function movePiece(player, id) {
  const game_id = getGameId();
  const response = await fetch(`/move-piece/${game_id}`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ player, piece_id: id })
  });
  updateBoard(currentBoard);
}

async function placeNewPiece() {
  const game_id = getGameId();
  const response = await fetch(`/place-new-piece/${game_id}`, {
    method: 'POST',
  });
  updateBoard(currentBoard);
}

document.getElementById('place-new-piece-button').addEventListener('click', placeNewPiece);

async function roll() {
  const id = getGameId();
  const response = await fetch(`/roll/${id}`, { method: 'POST' });
  const { roll: result } = await response.json();
  drawRoll(result);
}

drawRoll = function(result) {
  const rollElement = document.getElementById('roll-container');
  rollElement.innerHTML = result;
};

document.getElementById('roll-button').addEventListener('click', roll);

updateBoard = async function(previousBoard) {
  const {
    field: board,
    current_turn: current_player,
    finished_pieces_player_0: player1FinishedPieces,
    finished_pieces_player_1: player2FinishedPieces,
  } = await fetchGameState();
  updateMessage(getCurrentMessage(
    current_player,
    player1FinishedPieces,
    player2FinishedPieces
  ));
  updateScore(player1FinishedPieces, player2FinishedPieces)
  const simplifiedBoard = simplifyBoardModel(board);
  Object.entries(simplifiedBoard).forEach(([square, state]) => {
    if (hasStateChanged(previousBoard[square], state)) {
      updateSquare(square, state);
    }
  })
  currentBoard = simplifiedBoard;
}

updateScore = function(player1FinishedPieces, player2FinishedPieces) {
  score1 = templates.score('0', player1FinishedPieces);
  score2 = templates.score('1', player2FinishedPieces);
  document.getElementById('scores').innerHTML = score2 + score1;
}

getCurrentMessage = function(
  currentPlayer,
  player1FinishedPieces,
  player2FinishedPieces,
) {
  if (Number(player1FinishedPieces) === 7) {
    return templates.winMessageText('0');
  } else if (Number(player2FinishedPieces) === 7) {
    return templates.winMessageText('1');
  } else {
    return templates.moveMessageText(currentPlayer);
  }
}

updateMessage = function(message) {
  if (message !== document.getElementById('message').innerHTML) {
    document.getElementById('message').innerHTML = message;
  }
}

hasStateChanged = function(oldState, newState) {
  return (!newState && oldState)
      || ( newState && (!oldState || oldState.id !== newState.id || oldState.player !== newState.player))
}

updateSquare = function(square, state) {
  const squareElement = document.querySelector(`.square[data-id="${square}"]`);
  if (state === null) {
    squareElement.innerHTML = '';
  } else {
    placePiece(squareElement, piece=state)
  }
}

function placePiece(squareElement, piece) {
  squareElement.innerHTML = templates.piece(piece.player, piece.id);
  const pieceElement = squareElement.querySelector(`.piece[data-id="${piece.id}"]`);
  pieceElement.addEventListener('click', () => movePiece(piece.player, piece.id));
}

function simplifyBoardModel(board) {
  positions = {}
  board = Object.values(board);
  board.slice(1, 5).forEach((position, index) => {
    positions[`R0${index + 1}`] = position[0];
    positions[`L0${index + 1}`] = position[1];
  })
  board.slice(5, 13).forEach((position, index) => {
    commonPositionNumber = String(index + 5).padStart(2, '0');
    positions[`C${commonPositionNumber}`] = position;
  })
  board.slice(13, 15).forEach((position, index) => {
    positions[`R${index + 13}`] = position[0];
    positions[`L${index + 13}`] = position[1];
  })
  return positions;
}

async function fetchGameState() {
  const id = getGameId();
  const response = await fetch(`/game-state/${id}`);
  const json = await response.json();
  return json;
}

function getGameId() {
  return window.location.href.substring(window.location.href.lastIndexOf('/') + 1)
}


createBoard = function() {
  let board = document.querySelector('#board');
  boardModel.forEach((row, index) => {
    board.insertAdjacentHTML('beforeend', templates.row(index));
    let rowElement = document.querySelector(`.row[data-row="${index}"]`);
    row.forEach(square => {
      rosettes.includes(square)
        ? rowElement.insertAdjacentHTML('beforeend', templates.rosetteSquare(square))
        : rowElement.insertAdjacentHTML('beforeend', templates.simpleSquare(square));
    })
  })
}


// Register Reusable Markup Templates as Method Functions and Using Argument Interpolation
var templates = {
  row: function(index) {
    return `<div class="row" data-row="${index}"></div>`;
  },
  simpleSquare: function(id) {
    return `<div class="square" data-id="${id}"></div>`;
  },
  rosetteSquare: function(id) {
    return `<div class="square rosette" data-id="${id}"></div>`;
  },
  piece: function(player, id) {
    let color = getPlayerColor(player);
    return `<div class="piece ${color}" data-id="${id}"></div>`;
  },
  winMessageText: function(player) {
    let color = getPlayerColor(player);
    return `<div class="win-message-text message-${color}">${color} player wins!</div>`;
  },
  moveMessageText: function(player) {
    let color = getPlayerColor(player);
    return `<div class="move-message-text message-${color}">${color} player moves</div>`;
  },
  score: function(player, score) {
    let color = getPlayerColor(player);
    return `<div class="score-message message-${color}">${color} player score: ${score}</div>`;
  }
};

function getPlayerColor(player) {
  return String(player) === '1' ? 'red' : 'blue';
}

// INIT ACTION: Create the Chess Board
createBoard();

setInterval(() => updateBoard(currentBoard), 1000)
