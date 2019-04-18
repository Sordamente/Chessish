let posCount = 0;
let seenMoves = {};
function checkIfSeen (value){
  return seenMoves[value] === true;
}

function minimaxRoot(depth, game, isMaximisingPlayer) {
  let moves = game.moves({ verbose: true });
  let bestEval = -9999;
  let bestMove;

  for (var i = 0; i < moves.length; i++) {
    let tempMove = moves[i];
    game.move(tempMove);
    let val = minimax(depth - 1, game, !isMaximisingPlayer, -10000, 10000);
    game.undo();
    if (val >= bestEval) {
      bestEval = val;
      bestMove = tempMove;
    }
  }
  console.log(posCount)
  return bestMove;
}

function minimax(depth, game, isMaximisingPlayer, alpha, beta) {
  posCount++;
  if (depth === 0) {
    return -evaluateBoard(game);
  }

  let moves = game.moves({ verbose: true });

  if (isMaximisingPlayer) {
    let bestEval = -9999;
    for (let i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      if (checkIfSeen(game.fen())) {

        return bestEval;
      }
      seenMoves[game.fen()] == true;
      bestEval = Math.max(bestEval, minimax(depth - 1, game, !isMaximisingPlayer, alpha, beta));
      game.undo();
      alpha = Math.max(alpha, bestEval);
      if (beta <= alpha) {
        return bestEval;
      }
    }
    return bestEval;
  } else {
    let bestEval = 9999;
    for (let i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      if (checkIfSeen(game.fen())) {
        return;
      }
      seenMoves[game.fen()] == true;
      bestEval = Math.min(bestEval, minimax(depth - 1, game, !isMaximisingPlayer, alpha, beta));
      game.undo();
      beta = Math.min(beta, bestEval);
      if (beta <= alpha) {
        return bestEval;
      }
    }
    return bestEval;
  }
}

function calcBestMove(game, isWhite, depth) {
  /*const moves = game.moves({ verbose: true });
  console.log(moves)

  let bestMove = null;
  let bestEval = -9999;
  for (let i in moves) {
    const tempMove = moves[i];
    game.move(tempMove);
    let boardValue = evaluateBoard(game);
    boardValue = isWhite ? boardValue : -boardValue;
    game.undo();
    if (boardValue > bestEval) {
      bestEval = boardValue;
      bestMove = tempMove;
    }
  }
  movePiece(bestMove.from, bestMove.to, isWhite, bestMove.flags == "k", bestMove.flags == "q", bestMove.flags == "p" || bestMove.flags == "pc");*/

  let bestMove = minimaxRoot(depth, game, true);
  movePiece(bestMove.from, bestMove.to, isWhite, bestMove.flags == "k", bestMove.flags == "q", bestMove.flags == "p" || bestMove.flags == "pc");
}

function evaluateBoard(game) {
  let total = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      total += getEval(game.get(letters[i] + (j + 1)), i, j);
    }
  }
  return total;
}

function getEval(piece, x, y) {
  if (piece == null) return 0;
  let curr = 0;
  if (piece.type === 'p') {
    curr = 10 + ((piece.color === 'w') ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x]);
  } else if (piece.type === 'r') {
    curr = 50 + ((piece.color === 'w') ? rookEvalWhite[y][x] : rookEvalBlack[y][x]);
  } else if (piece.type === 'n') {
    curr = 30 + knightEval[y][x];
  } else if (piece.type === 'b') {
    curr = 30 + ((piece.color === 'w') ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x]);
  } else if (piece.type === 'q') {
    curr = 90 + evalQueen[y][x];
  } else if (piece.type === 'k') {
    curr = 900 + ((piece.color === 'w') ? kingEvalWhite[y][x] : kingEvalBlack[y][x]);
  }
  return (piece.color === 'w') ? curr : -curr;
}

const pawnEvalWhite =
  [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
    [1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
    [0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
    [0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
    [0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
    [0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
  ];

const pawnEvalBlack = pawnEvalWhite.reverse();

const knightEval =
  [
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
    [-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
    [-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
    [-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
    [-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
    [-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
    [-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
  ];

const bishopEvalWhite = [
  [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
  [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
  [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
  [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
  [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
  [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
  [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
  [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

const bishopEvalBlack = bishopEvalWhite.reverse();

const rookEvalWhite = [
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0]
];

const rookEvalBlack = rookEvalWhite.reverse();

const evalQueen =
  [
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
    [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
    [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
    [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
  ];

const kingEvalWhite = [

  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
  [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
  [2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
  [2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0]
];

const kingEvalBlack = kingEvalWhite.reverse();