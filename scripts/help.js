const letters = 'abcdefgh';
const nameList = "Bella Xavier Samella Kendrick Lucas Charisse Gaynelle Jayne Tess Petronila Lisha Edwin Magaly Marceline Monte Maddie Essie Anitra Robert Alan Alice Casie India Monty Angela Tanja Pete Cleveland Tomas Darleen Celia Beryl Juan Hermila Armanda Loida Reginia Joleen Tomer Titus Michaela Refugio Georgiana Jaime Berta Martin Danae Lavonne Jenice Chara Maria Danny Dennise Lisabeth Nita Season Angie Cameron Hulda Ike Deane Tarra Shanta Inger Verla Kasi Terrence Tobias Ewa Rusty Malisa William Aja Roseanna Geri Yuk Ava Timmy Heidy Sanjuana Marylin Zina Ashly Gala Matthew Katerine Renata Lorenza Tiara Florentina Jeramy Eliza Aaryan Natalia Rossana Steffanie Franklyn Merideth Krysta Lorie Gaylene Cinthia Gino Hershel Guy Curtis Cleo Van Emile Charles Dorsey Rodger Eddie Jake Benedict Patricia Kelley Brett Lucius Tyrell Frances Bert Sid Kieth Alva Thaddeus Derek Jamel Colby Randall Hyman Grant Antony Willy Carey Ike Mitchell Tommy Gavin Osvaldo Jonathan Bart Harris Lemuel Alex Roman Rocky Thomas Elton Otis Abdul Jewel Carroll".split(" ");

function convertMove(row, col) {
  return letters[col] + (row + 1);
}

function movePossible(origin, prime, isPromote) {
  if (!isPromote) {
    if (CHESS.move({ from: origin, to: prime }) != null) {
      CHESS.undo();
      return true;
    }
  } else {
    if (CHESS.move({ from: origin, to: prime, promotion: 'q' }) != null) {
      CHESS.undo();
      return true;
    }
  }
  return false;
}

function movePiece(origin, prime, isWhite, isKCastle, isQCastle, isPromote) {
  if (movePossible(origin, prime, isPromote)) {
    let toBeSpliced = null;
    const color = isWhite ? 'w' : 'b';
    for (let i in PIECES) {
      if (PIECES[i].row + 1 == prime[1] && PIECES[i].col == prime.charCodeAt(0) - 97) {
        toBeSpliced = i;
        break;
      }
    }
    if (toBeSpliced != null) {
      PIECES[toBeSpliced].remove();
      PIECES.splice(toBeSpliced, 1);
    }
    
    if (isPromote) {
      for (let i in PIECES) {
        if (convertMove(PIECES[i].row, PIECES[i].col) == origin) {
          PIECES[i].addImage('queenPromote', ASSETS[(isWhite ? 'white' : 'black') + 'q']);
          PIECES[i].changeImage('queenPromote');
        }
      }
      CHESS.move({ from: origin, to: prime, promotion: 'q' });
    } else {
      CHESS.move({ from: origin, to: prime });
    }
    if (isKCastle) {
      for (let i in PIECES) {
        if (PIECES[i].ident.color == color && PIECES[i].ident.type == 'r') {
          if ((PIECES[i].row == 0 || PIECES[i].row == 7) && PIECES[i].col == 7) {
            if (color == 'b' && PIECES[i].row == 7) {
              PIECES[i].col = 5;
              PIECES[i].position.x = PIECES[i].col * SDIM;
            } else if (color == 'w' && PIECES[i].row == 0) {
              PIECES[i].col = 5;
              PIECES[i].position.x = PIECES[i].col * SDIM;
            }
          }
        }
      }
    }
    if (isQCastle) {
      for (let i in PIECES) {
        if (PIECES[i].ident.color == color && PIECES[i].ident.type == 'r') {
          if ((PIECES[i].row == 0 || PIECES[i].row == 7) && PIECES[i].col == 0) {
            if (color == 'b' && PIECES[i].row == 7) {
              PIECES[i].col = 3;
              PIECES[i].position.x = PIECES[i].col * SDIM;
            } else if (color == 'w' && PIECES[i].row == 0) {
              PIECES[i].col = 3;
              PIECES[i].position.x = PIECES[i].col * SDIM;
            }
          }
        }
      }
    }
    for (let i in PIECES) {
      if (PIECES[i].row + 1 == origin[1] && PIECES[i].col == origin.charCodeAt(0) - 97) {
        PIECES[i].row = prime[1] - 1;
        PIECES[i].col = prime.charCodeAt(0) - 97;
        PIECES[i].position.x = PIECES[i].col * SDIM;
        PIECES[i].position.y = (7 - PIECES[i].row) * SDIM;
        break;
      }
    }
    return true;
  }
  return false;
}

function createPieces() {
  const rows = [7, 6, 1, 0];
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 8; i++) {
      const spr = createSprite(i * SDIM, (7 - rows[j]) * SDIM);
      //spr.debug = true;
      spr.ident = CHESS.get(convertMove(rows[j], i));
      const ind = Math.floor(Math.random() * nameList.length);
      spr.name = nameList[ind];
      nameList.splice(ind, 1);
      spr.morale = Math.round(Math.random()) + 2;
      spr.trust = Math.round(Math.random()) + 2;
      spr.health = Math.round(Math.random()) + 2;
      spr.row = rows[j];
      spr.col = i;
      spr.addImage(ASSETS[(j < 2 ? 'black' : 'white') + spr.ident.type]);
      spr.setCollider('rectangle', 0, 0, 20, 20);
      spr.scale = SDIM / 20;
      PIECES.push(spr);
    }
  }
}