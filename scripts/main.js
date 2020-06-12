let OUTSIDE, ORIGIN, OUTGIN, SIDE, SDIM, BACK;
const LMOUSE = { x: 0, y: 0 };
const CHESS = new Chess();
let SELECTED = null;
const PIECES = [];
const ASSETS = {};
let PTURN = true;
let SUPP = 20;
let ROUND = 0;
let FEEDBTN;

function preload() {
  const colors = ['black', 'white'];
  const pieces = 'bknpqr';
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 6; j++) {
      ASSETS[colors[i] + pieces[j]] = loadImage('assets/' + colors[i] + '_' + pieces[j] + '.png');
    }
  }
  BACK = loadImage('/assets/board.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(20);
  noSmooth();
  noStroke();
  textAlign(LEFT, TOP);
  (height < width ? SDIM = height / 10 : SDIM = width / 10);
  camera.position.x = SDIM * 4 - SDIM / 2;
  camera.position.y = SDIM * 4 - SDIM / 2;
  ORIGIN = -SDIM / 2;
  SIDE = ORIGIN + SDIM * 8;
  OUTGIN = ORIGIN - SDIM / 8;
  OUTSIDE = SIDE + SDIM / 8;
  FEEDBTN = createSprite(OUTSIDE + 1.4 * SDIM, OUTGIN + SDIM * 3.8, 100, 40);
  createPieces();
}

function draw() {
  background(51);
  drawStats();
  drawSupplies();
  fill(100);
  rect(OUTGIN, OUTGIN, SDIM * 8 + SDIM / 4, SDIM * 8 + SDIM / 4);
  image(BACK, -SDIM / 2, -SDIM / 2, SDIM * 8, SDIM * 8);
  drawSprites();
  if (CHESS.game_over()) {
    fill(0, 0, 255);
    textSize(96);
    if (CHESS.in_checkmate()) {
      text("CHECKMATE DUDE", 0, 0)
    } else {
      text("DRAW DUDE", 0, 0)
    }
  }
}

function drawSupplies() {
  fill(100);
  rect(OUTGIN - 4 * SDIM - (SDIM / 6), OUTGIN, 4 * SDIM, SDIM * 8 + (SDIM / 4));

  fill(255);
  textSize(28);
  text("Supplies: " + SUPP, OUTGIN - 4 * SDIM - (SDIM / 6) + 20, OUTGIN + 20)
}

function drawStats() {
  fill(100);
  rect(OUTSIDE + (SDIM / 6), OUTGIN, 2.5 * SDIM, SDIM * 4.2);
  if (SELECTED != null) {
    fill(255);
    textSize(28);
    text(SELECTED.name, OUTSIDE + (SDIM / 4), OUTGIN + (SDIM / 8));

    textSize(22);
    const morale = getStat(SELECTED.morale);
    fill(255);
    text('Morale: ', OUTSIDE + (SDIM / 4), SDIM / 4);
    fill(morale[1]);
    text(morale[0], OUTSIDE + (SDIM / 4), 5 * SDIM / 8);

    const trust = getStat(SELECTED.trust);
    fill(255);
    text('Trust: ', OUTSIDE + (SDIM / 4), 9 * SDIM / 8);
    fill(trust[1]);
    text(trust[0], OUTSIDE + (SDIM / 4), 3 * SDIM / 2);

    const health = getStat(SELECTED.health);
    fill(255);
    text('Health: ', OUTSIDE + (SDIM / 4), 2 * SDIM);
    fill(health[1]);
    text(health[0], OUTSIDE + (SDIM / 4), 19 * SDIM / 8);
  }
}

function mousePressed() {
  if (FEEDBTN.overlapPoint(camera.mouseX, camera.mouseY) && SELECTED != null) {
    giveFood(SELECTED);
    return;
  }

  for (let i in PIECES) {
    if (PIECES[i].overlapPoint(camera.mouseX, camera.mouseY) && PIECES[i].ident.color == 'w') {
      SELECTED = PIECES[i];
      return;
    }
  }

  if (SELECTED != null && mouseOnBoard()) {
    const currXSquare = Math.ceil(Math.ceil(camera.mouseX - SDIM / 2) / SDIM);
    const currYSquare = 6 - Math.floor(Math.ceil(camera.mouseY - SDIM / 2) / SDIM);
    const origin = convertMove(SELECTED.row, SELECTED.col);
    const prime = convertMove(currYSquare, currXSquare);
    if (movePiece(origin, prime, true, SELECTED.ident.type == 'k' && origin == 'e1' && prime == 'g1', SELECTED.ident.type == 'k' && origin == 'e1' && prime == 'c1', SELECTED.ident.type == 'p' && origin[1] == 7)) {
      SELECTED.position.x = Math.ceil((camera.mouseX - SDIM / 2) / SDIM) * SDIM;
      SELECTED.position.y = Math.ceil((camera.mouseY - SDIM / 2) / SDIM) * SDIM;
      SELECTED.row = currYSquare;
      SELECTED.col = currXSquare;
      calcBestMove(CHESS, 3);
      checkLowStats();
      ROUND++;
      SUPP = Math.max(20 - ROUND, 5);
    }
    SELECTED = null;
  }
}
