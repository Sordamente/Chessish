let OUTSIDE, ORIGIN, OUTGIN, SIDE, SDIM, BACK;
const LMOUSE = { x: 0, y: 0 };
const CHESS = new Chess();
let gameOver = false;
let HOVERED = null;
const PIECES = [];
const ASSETS = {};
let PTURN = true;
let HELD;
let FONT;

function preload() {
  //FONT = loadFont('start.ttf');
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
  frameRate(30);
  //textFont(FONT);
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
}

function draw() {
  if (CHESS.game_over()) {
    gameOver = true;
  }
  //UPDATING VARS
  camera.position.x = SDIM * 4 - SDIM / 2;
  camera.position.y = SDIM * 4 - SDIM / 2;
  //console.log(PTURN)
  if (!CHESS.game_over() && !PTURN) {
    calcBestMove(CHESS, PTURN);
    PTURN = true;
  }

  for (let i in PIECES) {
    if (PIECES[i].overlapPoint(camera.mouseX, camera.mouseY) && HELD == null && PIECES[i].ident.color == 'w') {
      HOVERED = PIECES[i];
    }
  }

  //DRAWING
  background(51);
  drawStats();
  drawTodo();
  fill(100);
  rect(OUTGIN, OUTGIN, SDIM * 8 + SDIM / 4, SDIM * 8 + SDIM / 4);
  image(BACK, -SDIM / 2, -SDIM / 2, SDIM * 8, SDIM * 8);
  drawSprites();
  if (gameOver) {
    if (PTURN == true){
      let endtext = "YOU WIN!";
    } else{
      let endtext = "YOU SUCK BRUH!";
    }
    let quotenum = 0;
    for(let i=0; i<16; i++){
     quotenum += PIECES[i].morale;
     quotenum += PIECES[i].health;
     quotenum += PIECES[i].trust;
    }
    fill(0, 0, 255);
    textSize(96);
    if (CHESS.in_checkmate()) {
      text(endtext, 0, 0)
    } else {
      text("DRAW DUDE", 0, 0)
    }
  }
}

function drawTodo() {
  fill(100);
  rect(OUTGIN - 2 * SDIM - (SDIM / 6), OUTGIN, 2 * SDIM, SDIM * 8 + (SDIM / 4));
}

function drawStats() {
  fill(100);
  rect(OUTSIDE + (SDIM / 6), OUTGIN, 2.25 * SDIM, SDIM * 3.8);
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

    const health = getStat(HOVERED.health);
    fill(255)
    text('Health: ', OUTSIDE + (SDIM / 4), 9 * SDIM / 8);
    fill(health[1]);
    text(health[0], OUTSIDE + (SDIM / 4), 3 * SDIM / 2);

    const trust = getStat(HOVERED.trust);
    fill(255)
    text('Trust: ', OUTSIDE + (SDIM / 4), 2 * SDIM);
    fill(trust[1]);
    text(trust[0], OUTSIDE + (SDIM / 4), 19 * SDIM / 8);
  }
}

function getStat(num) {
  if (num > 50) {
    return ['Excellent', '#28a021'];
  } else if (num > 40) {
    return ['Good', '#5cea3c'];
  } else if (num > 30) {
    return ['OK', '#dbea3b'];
  } else if (num > 20) {
    return ['Poor', '#dd624f'];
  } else if (num > 10) {
    return ['Miserable', '#ad3927'];
  } else {
    return ['Dead', '#5b0c00'];
  }
}

function mousePressed() {
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
    console.log(origin[1], prime[1]);
    if (movePiece(origin, prime, true, HELD.ident.type == 'k' && origin == 'e1' && prime == 'g1', HELD.ident.type == 'k' && origin == 'e1' && prime == 'c1')) {
      HELD.position.x = Math.ceil((HELD.position.x - SDIM / 2) / SDIM) * SDIM;
      HELD.position.y = Math.ceil((HELD.position.y - SDIM / 2) / SDIM) * SDIM;
      HELD.row = currYSquare;
      HELD.col = currXSquare;
      PTURN = false;
    } else {
      HELD.position.x = HELD.col * SDIM;
      HELD.position.y = (7 - HELD.row) * SDIM;
    }

    HELD.scale = SDIM / 20;
    HELD = null;
  }

  console.log(PTURN)
}