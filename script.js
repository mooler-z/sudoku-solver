//elements
const gridsElt = document.querySelector("div.grids");
const statusElt = document.querySelector("div#status");

const VER_COLOR = "#3a86ff";
const HOR_COLOR = "#ffbe0b";
const QUAD_COLOR = "#4ef316";
const ONE_COLOR = "#ff006e";
const MOVE_COLOR = "#33ffff";

// states
let sudoku;
let animationSpeed = 6;

let solutionPath = {};
let totalMove = 0;

// events
window.addEventListener("load", function () {
  let randN = 6;
  // let randN = Math.floor(Math.random() * 9);
  console.log(randN)
  let sudo = sudokusList[randN];
  sudoku = JSON.parse(JSON.stringify(sudo));

  getToWorking();
});

function checkFill() {
  for (let i = 0; i < sudoku.length; i++) {
    let count = sudoku[i].filter((n) => !n);
    if (count.length) return false;
  }
  return true;
}

function getToWorking() {
  gridsElt.innerHTML = "";
  createGrids(gridsElt, sudoku);
  markAll();

  setTimeout(() => {
    if (!checkFill()) {
      getAllSingles();
      setTimeout(() => {
        getToWorking();
      }, 6000 / animationSpeed);
    } else {
      alert("DONE");
    }
  }, 1000 / animationSpeed);
}

// monkeys
function createGrids(parent, sudoku) {
  let divide = Math.floor(Math.sqrt(sudoku.length));
  for (let m = 0; m < sudoku.length; m++) {
    let rowDiv = document.createElement("div");
    rowDiv.id = `row-${m}`;
    rowDiv.className = ((divide * (m + 1)) - 1) !== m ? `row divider` : `row`;
    for (let n = 0; n < sudoku[m].length; n++) {
      let colDiv = document.createElement("span");
      colDiv.id = `col-${m}-${n}`;
      colDiv.className = "grid";
      colDiv.innerText = `${sudoku[m][n]}`;
      rowDiv.appendChild(colDiv);
    }
    parent.appendChild(rowDiv);
  }
}

function getOptimalHorizontal(am = undefined) {
  let [count, m] = typeof am === "number" ? [0, am] : getHorizontal();

  let nxm = [];
  for (let i = 0; i < sudoku.length; i++) {
    let _ = `${m}-${i}`;
    nxm.push(_);
  }
  return nxm;
}
function getHorizontal() {
  let min = 0;
  let hor;

  for (m in sudoku) {
    let mHor = sudoku[m].filter((num) => num);
    if (mHor.length >= min && mHor.length < sudoku.length) {
      min = mHor.length;
      hor = m;
    }
  }

  return [min, +hor];
}

function getOptimalVertical(an = undefined) {
  let [count, n] = typeof an === "number" ? [0, an] : getVertical();

  let nxm = [];
  for (let i = 0; i < sudoku.length; i++) {
    let _ = `${i}-${n}`;
    nxm.push(_);
  }

  return nxm;
}
function getVertical() {
  let min = 0;
  let ver;

  for (m in sudoku) {
    let occupied = 0;
    for (n in sudoku[m]) {
      if (sudoku[n][m]) occupied++;
    }

    if (occupied >= min && occupied < sudoku.length) {
      min = occupied;
      ver = m;
    }
  }

  return [min, +ver];
}

function getQuadLooping(qn) {
  let sqrt = Math.floor(Math.sqrt(sudoku.length));

  let start = Math.floor(qn / sqrt);
  let n = start * sqrt;
  let m = (qn % sqrt) * sqrt;

  return {
    sqrt,
    start,
    n,
    m,
  };
}

function getOptimalQuadrant() {
  let [qn, arr] = getMaxQuadrant();
  let { sqrt, start, n, m } = getQuadLooping(qn);

  let nxm = [];

  for (let i = n; i < n + sqrt; i++) {
    for (let j = m; j < m + sqrt; j++) {
      let _ = `${i}-${j}`;
      nxm.push(_);
    }
  }

  return nxm;
}

function getQuadMoves(qn) {
  let { sqrt, start, n, m } = getQuadLooping(qn);

  let nxm = [];

  for (let i = n; i < n + sqrt; i++) {
    for (let j = m; j < m + sqrt; j++) {
      let _ = `${i}-${j}`;
      nxm.push(_);
    }
  }

  return nxm;
}

function getHorSqrt(sqrt, hor) {
  let twoD = [];
  for (let i = 0; i < sqrt; i++) {
    let start = i * sqrt;
    let end = sqrt * (i + 1);
    twoD.push(hor.slice(start, end));
  }
  return twoD;
}

function getSubSquare(arr, sqrt) {
  let quads = [];
  for (let i = 0; i < sqrt; i++) {
    quads.push([]);
  }

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < sqrt; j++) {
      let _ = arr[j][i];
      quads[i].push(_);
    }
  }

  return quads;
}

function getMaxQuadrant() {
  let quadrants = getQuadrants();

  let count = 0;
  let max;
  let quadN;

  for (let i = 0; i < quadrants.length; i++) {
    let merge = quadrants[i].reduce((merged, arr) => merged.concat(arr), []);
    merge = merge.filter((n) => n);
    if (merge.length >= count && merge.length < sudoku.length) {
      count = merge.length;
      max = quadrants[i];
      quadN = i;
    }
  }

  return [quadN, max];
}

function getWhichQuadrant(move) {
  let [n, m] = move.split("-");
  n = +n;
  m = +m;
  let sqrt = Math.floor(Math.sqrt(sudoku.length));
  let qn = Math.floor(n / sqrt) * sqrt + Math.floor(m / sqrt);
  return [qn, getQuadrants()[qn]];
}

function getQuadrants() {
  let quads = JSON.parse(JSON.stringify(sudoku));
  quads = quads.map(() => []);
  let sqrt = Math.floor(Math.sqrt(sudoku.length));

  for (let i = 0; i < sudoku.length; i++) {
    let twoD = getHorSqrt(sqrt, sudoku[i]);
    quads[i] = twoD;
  }

  let quadrants = [];
  for (let i = 0; i < sqrt; i++) {
    let start = i * sqrt;
    let end = sqrt * (i + 1);
    let res = getSubSquare(quads.slice(start, end), sqrt);
    quadrants = quadrants.concat(res);
  }

  return quadrants;
}

function colorizeCell(arr, color) {
  for (let i = 0; i < arr.length; i++) {
    let elt = document.querySelector(`span#col-${arr[i]}`);
    elt.style.background = color;
  }
}

function getOptimalIntersection() {
  let intersects = [];
  intersects = intersects.concat(getOptimalHorizontal());
  intersects = intersects.concat(getOptimalVertical());
  intersects = intersects.concat(getOptimalQuadrant());

  let max = 0;
  let move;
  for (let i = 0; i < intersects.length; i++) {
    let _ = intersects.filter((cell) => intersects[i] === cell);
    let [n, m] = intersects[i].split("-");
    let nonZero = sudoku[+n][+m];
    if (_.length === 1 && !nonZero) {
      max = _.length;
      move = intersects[i];
    }
  }

  // colorizeCell([move], "yellow");

  // getWhichQuadrant(move);

  return {
    max,
    move,
  };
}

function markAll() {
  let i = 0;
  statusElt.innerText = "thinking...";
  let drawing = setInterval(() => {
    let optimal;
    if (i === 0) {
      optimal = getOptimalHorizontal();
      let zeros = optimal.map((move) => {
        let [n, m] = move.split("-");
        return sudoku[+n][+m];
      });
      zeros = zeros.filter((n) => !n);

      colorizeCell(optimal, zeros.length === 1 ? ONE_COLOR : HOR_COLOR);
    } else if (i === 1) {
      optimal = getOptimalVertical();
      let zeros = optimal.map((move) => {
        let [n, m] = move.split("-");
        return sudoku[+n][+m];
      });
      zeros = zeros.filter((n) => !n);

      colorizeCell(optimal, zeros.length === 1 ? ONE_COLOR : VER_COLOR);
    } else if (i === 2) {
      optimal = getOptimalQuadrant();
      let zeros = optimal.map((move) => {
        let [n, m] = move.split("-");
        return sudoku[+n][+m];
      });
      zeros = zeros.filter((n) => !n);

      colorizeCell(optimal, zeros.length === 1 ? ONE_COLOR : QUAD_COLOR);
    }
    i++;

    if (i > 2) {
      clearInterval(drawing);
      setTimeout(() => {
        getOptimalIntersection();
      }, 1000 / animationSpeed);
    }
  }, 1000 / animationSpeed);
}

function getHorizontalSingle(n) {
  let arr = [];
  for (let i = 0; i < sudoku.length; i++) {
    arr.push(sudoku[n][i]);
  }

  return arr;
}

function getVerticalSingle(m) {
  let arr = [];
  for (let i = 0; i < sudoku.length; i++) {
    arr.push(sudoku[i][m]);
  }

  return arr;
}

function handleRearranging(move) {
  let [n, m] = move.split("-");
  let [qn, quad] = getWhichQuadrant(move);
  // let mergeQuad =
  let quadMoves = getQuadMoves(qn);
  let hor = getHorizontalSingle(+n);
  let horMoves = getOptimalHorizontal(+n);
  let ver = getVerticalSingle(+m);
  let verMoves = getOptimalVertical(+m);

  console.log(quadMoves);
  console.log(verMoves);
  console.log(horMoves);
}

function getAllSingles() {
  let { move } = getOptimalIntersection();
  let [qn, quad] = getWhichQuadrant(move);
  quad = quad.reduce((merged, val) => merged.concat(val), []);
  let hor = getHorizontalSingle(+move.split("-")[0]);
  let ver = getVerticalSingle(+move.split("-")[1]);

  let all = quad.concat(hor, ver);
  let bestNum = 0;
  for (let i = 1; i < sudoku.length + 1; i++) {
    if (!all.includes(i)) bestNum = i;
  }

  let [n, m] = move.split("-");

  if (bestNum) {
    sudoku[+n][+m] = bestNum;
    totalMove++;
    solutionPath[`move-${totalMove}`] = {
      move,
      n: bestNum,
    };
  } else {
    console.log("STUCK AT", move, solutionPath);
    statusElt.innerText = "Rearraging logic...";
    handleRearranging(move);
  }
  console.log("----------------");
  setTimeout(() => {
    document.querySelector(`span#col-${move}`).style.background = MOVE_COLOR;
    statusElt.innerText = `CELL - ${move} >>> ${bestNum}`;
    document.querySelector(`span#col-${move}`).innerText = bestNum;
  }, 4000 / animationSpeed);
}

function getMinUnknown() {
}
