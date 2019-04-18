let OUTSIDE, ORIGIN, OUTGIN, SIDE, SDIM, BACK;
const LMOUSE = { x: 0, y: 0 };
const CHESS = new Chess();
let HOVERED = null;
const PIECES = [];
const ASSETS = {};
const LAYERS = 2;
let SUPP = 20;
let ROUND = 0;
let FEEDBTN;
let HELD;
let FONT;

function preload() {
  FONT = loadFont('start.ttf');
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
  textFont(FONT);
  noSmooth();
  noStroke();
  textAlign(LEFT, TOP);
  (height < width ? SDIM = height / 10 : SDIM = width / 10);
  camera.position.x = SDIM * 4 - SDIM / 2;
  camera.position.y = SDIM * 4 - SDIM / 2;
  ORIGIN = -SDIM / 2;
  SIDE = ORIGIN + SDIM * 8;
  OUTGIN = ORIGIN - SDIM / 8;
  OUTSIDE = SIDE + SDIM / 8
  createPieces();
  FEEDBTN = createSprite(OUTSIDE + 1.4 * SDIM, OUTGIN + SDIM * 3.8, 100, 40);
}

function draw() {
  console.log(CHESS.moves({verbose: true}))
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

  fill(255)
  textSize(28)
  text("Supplies: " + SUPP, OUTGIN - 4 * SDIM - (SDIM / 6) + 20, OUTGIN + 20)
}

function drawStats() {
  fill(100);
  rect(OUTSIDE + (SDIM / 6), OUTGIN, 2.5 * SDIM, SDIM * 4.2);
  if (HOVERED != null) {
    fill(255);
    textSize(28);
    text(HOVERED.name, OUTSIDE + (SDIM / 4), OUTGIN + (SDIM / 8));

    //stats
    textSize(22);
    const morale = getStat(HOVERED.morale);
    fill(255);
    text('Morale: ', OUTSIDE + (SDIM / 4), SDIM / 4);
    fill(morale[1]);
    text(morale[0], OUTSIDE + (SDIM / 4), 5 * SDIM / 8);

    const trust = getStat(HOVERED.trust);
    fill(255)
    text('Trust: ', OUTSIDE + (SDIM / 4), 9 * SDIM / 8);
    fill(trust[1]);
    text(trust[0], OUTSIDE + (SDIM / 4), 3 * SDIM / 2);

    const health = getStat(HOVERED.health);
    fill(255)
    text('Health: ', OUTSIDE + (SDIM / 4), 2 * SDIM);
    fill(health[1]);
    text(health[0], OUTSIDE + (SDIM / 4), 19 * SDIM / 8);
  }
}

function giveFood(piece) {
  if (SUPP > 0 && piece.health < 4) {
    SUPP--;
    piece.health += Math.round(Math.random());
  }
}

function getStat(num) {
  const table = [
    ['Miserable', '#ad3927'],
    ['Poor', '#dd624f'],
    ['OK', '#dbea3b'],
    ['Good', '#5cea3c'],
    ['Excellent', '#28a021']
  ];
  return table[num];
}

function mouseMoved() {
  for (let i in PIECES) {
    if (PIECES[i].overlapPoint(camera.mouseX, camera.mouseY) && HELD == null && PIECES[i].ident.color == 'w') {
      HOVERED = PIECES[i];
      break;
    }
  }
}

function mousePressed() {
  if (FEEDBTN.overlapPoint(camera.mouseX, camera.mouseY) && HOVERED != null) {
    giveFood(HOVERED);
  }

  for (let i in PIECES) {
    if (PIECES[i].overlapPoint(camera.mouseX, camera.mouseY) && PIECES[i].ident.color == 'w') {
      HELD = PIECES[i];
      HELD.scale = SDIM / 15;
      LMOUSE.x = camera.mouseX;
      LMOUSE.y = camera.mouseY;
    }
  }
}

function mouseDragged() {
  if (HELD != null) {
    HELD.position.x -= LMOUSE.x - camera.mouseX;
    HELD.position.y -= LMOUSE.y - camera.mouseY;
    LMOUSE.x = camera.mouseX;
    LMOUSE.y = camera.mouseY;
  }

  return false;
}

function mouseReleased() {
  if (HELD != null) {
    const currXSquare = Math.ceil(Math.ceil(HELD.position.x - SDIM / 2) / SDIM);
    const currYSquare = 6 - Math.floor(Math.ceil(HELD.position.y - SDIM / 2) / SDIM);
    const origin = convertMove(HELD.row, HELD.col);
    const prime = convertMove(currYSquare, currXSquare);
    if (movePiece(origin, prime, true, HELD.ident.type == 'k' && origin == 'e1' && prime == 'g1', HELD.ident.type == 'k' && origin == 'e1' && prime == 'c1', HELD.ident.type == 'p' && origin[1] == 7)) {
      HELD.position.x = Math.ceil((HELD.position.x - SDIM / 2) / SDIM) * SDIM;
      HELD.position.y = Math.ceil((HELD.position.y - SDIM / 2) / SDIM) * SDIM;
      HELD.row = currYSquare;
      HELD.col = currXSquare;
      checkLowStats();
      calcBestMove(CHESS, false, LAYERS);
      ROUND++;
      SUPP = Math.max(20 - ROUND, 5);
    } else {
      HELD.position.x = HELD.col * SDIM;
      HELD.position.y = (7 - HELD.row) * SDIM;
    }
    HELD.scale = SDIM / 20;
    HELD = null;
  }
}

function checkLowStats() {
  for (let i in PIECES) {
    if (ROUND > 4 && PIECES[i].ident.color == 'w' && PIECES[i].ident.type != 'k') {
      let rolls = 0;
      rolls += PIECES[i].morale + PIECES[i].trust + PIECES[i].health;
      let num = Math.floor(Math.random() * 24);
      if (num < 12 - rolls) {
        //REMOVE PIECE
        console.log(PIECES[i].ident, PIECES[i].name)
        CHESS.put({ type: PIECES[i].ident.type, color: 'b' }, convertMove(PIECES[i].row, PIECES[i].col));
        //create the new piece
        const spr = createSprite(PIECES[i].col * SDIM, (7 - PIECES[i].row) * SDIM);
        spr.ident = {type: PIECES[i].ident.type, color: 'b'};
        const ind = Math.floor(Math.random() * nameList.length);
        spr.name = nameList[ind];
        nameList.splice(ind, 1);
        spr.morale = Math.round(Math.random()) + 2;
        spr.trust = Math.round(Math.random()) + 2;
        spr.health = Math.round(Math.random()) + 2;
        spr.row = PIECES[i].row;
        spr.col = PIECES[i].col;
        spr.addImage(ASSETS['black' + spr.ident.type]);
        spr.setCollider('rectangle', 0, 0, 20, 20);
        spr.scale = SDIM / 20;
        PIECES.push(spr);
        PIECES[i].remove();
        PIECES.splice(i, 1);
        console.log(CHESS.ascii())
      }
      /*
      rolls = 0 (all miserable) 50% chance
      rolls = 3 (all poor) 37.5% chance
      rolls = 6 (all ok) 25% chance
      rolls = 9 (all good) 12.5% chance
      rolls = 12 (all excellent) 0% chance
      */
    }
  }
}
