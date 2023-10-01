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
let sudokuClone;
let animationSpeed = 16;

let solutionPath = {};
let totalMove = 0;

// events
window.addEventListener("load", function () {
  let randN = 4;
  // let randN = Math.floor(Math.random() * 9);
  let sudo = sudokusList[randN];
  sudoku = JSON.parse(JSON.stringify(sudo));
  sudokuClone = JSON.parse(JSON.stringify(sudo));

  getToWorking();
});

////////////////////////////////////////
/////////////// STARTER ////////////////
////////////////////////////////////////
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

////////////////////////////////////////
//////// related to vertical /////////
////////////////////////////////////////
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

function getVerticalSingle(m) {
  let arr = [];
  for (let i = 0; i < sudoku.length; i++) {
    arr.push(sudoku[i][m]);
  }

  return arr;
}

////////////////////////////////////////
//////// related to horizontal /////////
////////////////////////////////////////
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

function getHorSqrt(sqrt, hor) {
  let twoD = [];
  for (let i = 0; i < sqrt; i++) {
    let start = i * sqrt;
    let end = sqrt * (i + 1);
    twoD.push(hor.slice(start, end));
  }
  return twoD;
}

function getHorizontalSingle(n) {
  let arr = [];
  for (let i = 0; i < sudoku.length; i++) {
    arr.push(sudoku[n][i]);
  }

  return arr;
}

////////////////////////////////////////
//////// related to quadrant /////////
////////////////////////////////////////

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
  let quadrants = getQuadrants(sudoku);

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

function getWhichQuadrant(move, arr) {
  let [n, m] = move.split("-");
  n = +n;
  m = +m;
  let sqrt = Math.floor(Math.sqrt(arr.length));
  let qn = Math.floor(n / sqrt) * sqrt + Math.floor(m / sqrt);
  return [qn, getQuadrants(arr)[qn]];
}

function getQuadrants(arr) {
  let quads = JSON.parse(JSON.stringify(arr));
  quads = quads.map(() => []);
  let sqrt = Math.floor(Math.sqrt(arr.length));

  for (let i = 0; i < arr.length; i++) {
    let twoD = getHorSqrt(sqrt, arr[i]);
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

function rearrQuad(move) {
  let [ml, nl] = move.split("-");
  const sudokuNums = getSudokuNums();
  let [qn, quad] = getWhichQuadrant(move, sudoku);
  let [ogqn, ogquad] = getWhichQuadrant(move, sudokuClone);
  let { sqrt, start, n, m } = getQuadLooping(qn);

  let possibleShuffles = [];
  for (let i = 0; i < quad.length; i++) {
    for (let j = 0; j < quad[i].length; j++) {
      if (!ogquad[i][j]) {
        possibleShuffles.push({
          move: `${n + i}-${m + j}`,
          num: quad[i][j],
        });
      }
    }
  }

  let unoccupied = possibleShuffles.filter((x) => !x.num);
  possibleShuffles = possibleShuffles.filter((x) => x.num);

  if (unoccupied.length) {
    for (let j = 0; j < unoccupied.length; j++) {
      let [_m, _n] = unoccupied[j].move.split("-");

      let hor = getHorizontalSingle(+_m);
      let ver = getVerticalSingle(+_n);

      for (let i = 0; i < possibleShuffles.length; i++) {
        if (
          !hor.includes(possibleShuffles[i].num) &&
          !ver.includes(possibleShuffles[i].num)
        ) {
          console.log("SHUFFLE ZERO");
          let [pm, pn] = possibleShuffles[i].move.split("-");
          sudoku[pm][pn] = unoccupied[j].num;
          sudoku[_m][_n] = possibleShuffles[i].num;
          sudokuClone[_m][_n] = possibleShuffles[i].num;
          return true;
        }
      }
    }
  }

  for (let i = 0; i < possibleShuffles.length; i++) {
    for (let j = i + 1; j < possibleShuffles.length; j++) {
      let [m1, n1] = possibleShuffles[i].move.split("-");
      let [m2, n2] = possibleShuffles[j].move.split("-");

      if (m1 === m2) {
        console.log("VERTICAL");
        let ver1 = getVerticalSingle(+n1);
        ver1[m1] = 0;
        let ver2 = getVerticalSingle(+n2);
        ver2[m2] = 0;

        let bool = !ver2.includes(possibleShuffles[i].num) &&
          !ver1.includes(possibleShuffles[j].num);

        if (bool) {
          console.log("V>>>> ", possibleShuffles[i], possibleShuffles[j]);
          sudoku[+m1][+n1] = possibleShuffles[j].num;
          sudoku[+m2][+n2] = possibleShuffles[i].num;
          return true;
        }
      } else if (n1 === n2) {
        console.log("HORIZONTAL");
        let hor1 = getHorizontalSingle(+m1);
        hor1[n1] = 0;
        let hor2 = getHorizontalSingle(+m2);
        hor2[n2] = 0;
        let bool = !hor2.includes(possibleShuffles[i].num) &&
          !hor1.includes(possibleShuffles[j].num);
        if (bool) {
          console.log("H>>>> ", possibleShuffles[i], possibleShuffles[j]);
          sudoku[+m1][+n1] = possibleShuffles[j].num;
          sudoku[+m2][+n2] = possibleShuffles[i].num;
          return true;
        }
      } else if (m1 !== m2 && n1 !== n2) {
        console.log("BOTH");
      }
    }
  }
}

////////////////////////////////////////
//////////////// MISC ////////////////
////////////////////////////////////////

function getSudokuNums() {
  let arr = [];
  for (let i = 1; i < sudoku.length; i++) arr.push(i);
  return arr;
}

function handleRearranging(move) {
  let [m, n] = move.split("-");
  let [qn, quad] = getWhichQuadrant(move, sudoku);
  let mergeQuad = quad.reduce((merged, val) => merged.concat(val), []);
  let quadMoves = getQuadMoves(qn);
  let hor = getHorizontalSingle(+m);
  let horMoves = getOptimalHorizontal(+m);
  let ver = getVerticalSingle(+n);
  let verMoves = getOptimalVertical(+n);

  const qlen = mergeQuad.filter((num) => num);
  const vlen = ver.filter((num) => num);
  const hlen = hor.filter((num) => num);

  console.log("QUAD REARRANGE");
  if (!rearrQuad(move)) return;

  if (qlen.length >= vlen.length && qlen.length >= hlen.length) {
  } else if (hlen.length >= qlen.length && hlen.length >= vlen.length) {
    console.log("REARRANGE HORIZONTAL");
  } else if (vlen.length >= qlen.length && vlen.length >= hlen.length) {
    console.log("REARRANGE VERTICAL");
  }
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

  return {
    max,
    move,
  };
}

function colorizeCell(arr, color) {
  for (let i = 0; i < arr.length; i++) {
    let elt = document.querySelector(`span#col-${arr[i]}`);
    elt.style.background = color;
  }
}

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
      if (sudokuClone[m][n]) colDiv.style.background = "#aaa";
      rowDiv.appendChild(colDiv);
    }
    parent.appendChild(rowDiv);
  }
}

function getAllSingles() {
  let { move } = getOptimalIntersection();
  let [qn, quad] = getWhichQuadrant(move, sudoku);
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
