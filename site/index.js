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

async function startNewGame() {
  await fetch(`/start-game`);
  updateBoard(currentBoard);
}

document.getElementById('start-new-game-button').addEventListener('click', startNewGame);

async function movePiece(player, id) {
  const response = await fetch(`/move-piece`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ player, piece_id: id })
  });
}

async function placeNewPiece() {
  const response = await fetch(`/place-new-piece`, {
    method: 'POST',
  });
}

document.getElementById('place-new-piece-button').addEventListener('click', placeNewPiece);

async function roll() {
  const response = await fetch(`/roll`, { method: 'POST' });
  const result = await response.text();
  drawRoll(result);
}

drawRoll = function(result) {
  const rollElement = document.getElementById('roll-container');
  rollElement.innerHTML = result;
};

document.getElementById('roll-button').addEventListener('click', roll);

updateBoard = async function(previousBoard) {
  const { field: board } = await fetchGameState();
  const simplifiedBoard = simplifyBoardModel(board);
  Object.entries(simplifiedBoard).forEach(([square, state]) => {
    if (hasStateChanged(previousBoard[square], state)) {
      updateSquare(square, state);
    }
  })
  currentBoard = simplifiedBoard;
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
  const response = await fetch(`/game-state/v2`);
  const json = await response.json();
  return json;
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
  // Chess Piece
  piece: function(player, id) {
    let color = String(player) === '1' ? 'red' : 'blue';
    return `<div class="piece ${color}" data-id="${id}"></div>`;
  }
};


// Debug Mode
var debug_mode = true;
// JSON Database
var database = [];
// JSON Game Database
var game = [];
// JSON Moves Database
var moves = [];
// Register Pieces
const pieces = {
  black: {
    king: { pos: "D8", icon: "chess-king",},
    queen: { pos: "E8", icon: "chess-queen",},
    bishop_1: { pos: "C8", icon: "chess-bishop",},
    bishop_2: { pos: "F8", icon: "chess-bishop",},
    knight_1: { pos: "B8", icon: "chess-knight",},
    knight_2: { pos: "G8", icon: "chess-knight",},
    rook_1: { pos: "A8", icon: "chess-rook",},
    rook_2: { pos: "H8", icon: "chess-rook",},
    pawn_1: { pos: "A7", icon: "chess-pawn",},
    pawn_2: { pos: "B7", icon: "chess-pawn",},
    pawn_3: { pos: "C7", icon: "chess-pawn",},
    pawn_4: { pos: "D7", icon: "chess-pawn",},
    pawn_5: { pos: "E7", icon: "chess-pawn",},
    pawn_6: { pos: "F7", icon: "chess-pawn",},
    pawn_7: { pos: "G7", icon: "chess-pawn",},
    pawn_8: { pos: "H7", icon: "chess-pawn",},
  },
  white: {
    king: { pos: "D1", icon: "chess-king",},
    queen: { pos: "E1", icon: "chess-queen",},
    bishop_1: { pos: "C1", icon: "chess-bishop",},
    bishop_2: { pos: "F1", icon: "chess-bishop",},
    knight_1: { pos: "B1", icon: "chess-knight",},
    knight_2: { pos: "G1", icon: "chess-knight",},
    rook_1: { pos: "A1", icon: "chess-rook",},
    rook_2: { pos: "H1", icon: "chess-rook",},
    pawn_1: { pos: "A2", icon: "chess-pawn",},
    pawn_2: { pos: "B2", icon: "chess-pawn",},
    pawn_3: { pos: "C2", icon: "chess-pawn",},
    pawn_4: { pos: "D2", icon: "chess-pawn",},
    pawn_5: { pos: "E2", icon: "chess-pawn",},
    pawn_6: { pos: "F2", icon: "chess-pawn",},
    pawn_7: { pos: "G2", icon: "chess-pawn",},
    pawn_8: { pos: "H2", icon: "chess-pawn",},
  },
};

// Register Column Letters
const cols = ["H", "G", "F", "E", "D", "C", "B", "A"];

// Register Log
var log = {
  raw: [],
  listeners: {
    selectPieces: [],
    selectSquares: [],
  },
  actions: {
    createBoard: [],
    setPieces: [],
    mapPieces: [],
    clearPieceSelectors: [],
    clearSquareSelectors: [],
    clearCapturedSelectors: [],
    selectPiece: [],
    selectSquare: [],
    movePiece: [],
    recordBoard: [],
    recordMove: [],
    resetSelectors: [],
    takePiece: []
  }
}

// Register Event Listener Method Functions to Bind the Actions to the Event Triggering Elements
var listeners = {  
  // Listen For When a Chess Piece is Clicked
  selectPieces: function() { actions.consoleLog("[LISTENER] Select Pieces");
    let pieces = document.querySelectorAll('.chess-piece');
    pieces.forEach((piece, index) => {
      if(!piece.classList.contains('init')) {
        piece.classList.add('init');
        piece.addEventListener('click', function(e) {
          actions.selectPiece(e);
          actions.consoleLog("<<<<<<<>>>>>>>", "", false);
        });
      }
    });
  },
  
  // Listen for When an Empty Chess Square is Clicked
  selectSquares: function() { actions.consoleLog("[LISTENER] Select Squares")
    let squares = document.querySelectorAll('.square');
    squares.forEach((square, index) => {
      if(!square.querySelector('.chess-piece') && !square.classList.contains('selected') && !square.classList.contains('init')) {
        square.classList.add('init');
        square.addEventListener('click', function(e) {
          e.preventDefault();
          actions.selectSquare(e);
          actions.consoleLog("<<<<<<>>>>>>>", "", false);
        });
      } else {
        square.addEventListener('click', function(e) {e.preventDefault();});
      }
    });
  },
  
  // Listen for Record Board Button
  // recordBoard: function() {
  //   let button = document.querySelector('#record-board');
  //   button.addEventListener('click', function(e) {
  //     actions.recordBoard(e);
  //   });
  // },
  
  // Listen for Clicking the Orange Square to Move a Piece
  // movePieces: function() {
  //   document.querySelectorAll('.square-selected').forEach((square, index) => {
  //     if(!square.classList.contains('init')) {
  //       square.classList.add('init');
  //       actions.movePiece(e);
  //     }
  //   });
  //}
};

// Register Action Method Functions
var actions = {
  // Create And/Or Clear the Chess Board
  consoleLog: function(arg1 = "", arg2 = "", lines = false) {
    if(debug_mode === true) {
      var d = new Date(); 
      let t = {
        year: d.getFullYear(), 
        month: d.getMonth(), 
        day: d.getDate(), 
        hours: d.getHours(),
        seconds: d.getSeconds(),
        milliseconds: d.getMilliseconds()
      };
      log.raw.push({stamp: d.toString().split(' ')[4], arg1: arg1, arg2: arg2, time: t});;
      console.log(log);
      //console.log(lines ? '-------' : '');
    }
  },
  
  // Set the Pieces on the Chess Board
  setPieces: function(pieces) { actions.consoleLog("[ACTION] Set Pieces");
    let b = pieces.black;
    let w = pieces.white;
    actions.mapPieces(b, "black");
    actions.mapPieces(w, "white");
  },
  
  // Map the Pieces on the Chess Board for a Single Player
  mapPieces: function(p, color) {
    for(key in p) {
      let pos = p.hasOwnProperty(key) ? p[key].pos : false;
      //console.log({pos: pos});
      let square = document.querySelector('.square[data-cell="'+pos+'"]');
      if(square) {
        square.insertAdjacentHTML('beforeend', templates.piece(key, p[key], color));
      }
    }
    actions.consoleLog("[ACTION] Map Pieces", {color: color, pieces: p});
  },
  
  // Deselect All Chess Piecees
  clearPieceSelectors: function() { actions.consoleLog("[ACTION] Clear Piece Selectors");
    document.querySelectorAll('.square').forEach((p, j) => {
      p.classList.remove('piece-selected');
    });
  },
  
  // Deselect All Chess Squares
  clearSquareSelectors: function() { actions.consoleLog("[ACTION] Clear Square Selectors");
    document.querySelectorAll('.square').forEach((x, j) => {
      x.classList.remove('square-selected');
    });
  },
  
  clearCapturedSelectors: function() { actions.consoleLog("[ACTION] Clear Captured Selectors");
    document.querySelectorAll('.square').forEach((x, j) => {
      x.classList.remove('capturable-selected');
    });
  },
  
  // Select a Chess Piece
  selectPiece: function(e) {
      let piece = e.target.classList.contains('fa') ? e.target.parentNode : e.target;
      // Originally Selected Piece Already Chosen Before Choosing this Piece
      let origin = !piece.parentNode.classList.contains('piece-selected') ? document.querySelector('.piece-selected') : false;
      if(!origin) {
        actions.clearPieceSelectors();
        piece.parentNode.classList.toggle('piece-selected');
      } else {
        let pieceColor = piece.getAttribute('data-color');
        let originColor = origin.querySelector('.chess-piece').getAttribute('data-color');
        if(pieceColor != originColor) {
          if(!piece.classList.contains('capturable-selected')) {
            piece.parentNode.classList.add('capturable-selected');
          } else {
            actions.movePiece(origin.querySelector('.chess-piece'));
          }
        }
      }
      actions.clearSquareSelectors();
      listeners.selectSquares();
      actions.consoleLog("[ACTION] Select Piece", {piece: piece, origin: origin});
  },
  
  // Record A Chess Piece Move Once Completed
  recordMove: function(oldSquare, newSquare, piece) {
    let move = {timestamp: new Date().toString().split(' ')[4]};
    move.from = oldSquare.getAttribute('data-cell');
    move.to = newSquare.getAttribute('data-cell');
    move.piece = piece.getAttribute('data-piece');
    move.color = piece.getAttribute('data-color');
    moves.push(move);
    actions.recordBoard();
    actions.consoleLog("[ACTION] Record Move", {move: move, moves: moves});
  },
  
  // Reset Board and Chess Piece Selectors After a Piece Has Been Moved
  resetSelectors: function() {
    document.querySelectorAll('.square').forEach((square, i) => {
      let piece = square.querySelector('.chess-piece');
      if(piece.length > 0) {
        if(!piece.classList.contains('init')) {
          piece.addEventListener('click', function(e) {
            actions.selectPiece(e);
          });
        }
      } else {
        if(!square.classList.contains('init')) {
          square.addEventListener('click', function(e) {
            actions.selectSquare(e);
          });
        }
      }
    });
    actions.consoleLog("[ACTION] Reset Selectors");
  },
  
  // Take an Opponent's Piece on the Chess Board
  takePiece: function(opponentPiece) {
    actions.consoleLog("Take Piece", {opponentPiece: opponentPiece});
    let opponentColor = opponentPiece.getAttribute('data-color');
    let takerColor = opponentColor === "black" ? "white" : (opponentColor === "white" ? "black" : false);
    if(takerColor) {document.getElementById(takerColor+'-panel').querySelector('.taken-pieces').appendChild(opponentPiece);}
  }
};

// INIT ACTION: Create the Chess Board
createBoard();

setInterval(() => updateBoard(currentBoard), 1000)
