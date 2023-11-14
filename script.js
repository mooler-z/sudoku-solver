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
let animationSpeed = 32;
// let animationSpeed = 6;

let solutionPath = {};
let totalMove = 0;

// events
window.addEventListener("load", function () {
  let randN = 0;
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

function getVerticalSingle(m, from) {
  let arr = [];
  for (let i = 0; i < from.length; i++) {
    arr.push(from[i][m]);
  }

  return arr;
}

function rearrVer(move) {
  let [ml, nl] = move.split("-");
  let ver = getVerticalSingle(+nl, sudoku);
  let ogver = getVerticalSingle(+nl, sudokuClone);
  let possibleVers = ver.filter((n) => !ogver.includes(n) || !n);

  for (let i = 0; i < possibleVers.length; i++) {
    for (let j = i + 1; j < possibleVers.length; j++) {
      let ipos = ver.indexOf(possibleVers[i]);
      let jpos = ver.indexOf(possibleVers[j]);
      let [qn, quad] = getWhichQuadrant(`${jpos}-${+nl}`, sudoku);
      let [qni, quadi] = getWhichQuadrant(`${ipos}-${+nl}`, sudoku);
      let [sqn, sameQuads] = getWhichQuadrant(move, sudoku);

      let hor = getHorizontalSingle(jpos, sudoku);
      let hori = getHorizontalSingle(ipos, sudoku);

      quad = quad.reduce((total, val) => total.concat(val), []);
      quadi = quadi.reduce((total, val) => total.concat(val), []);

      if (!possibleVers[i]) {
        let hbool = !hori.includes(possibleVers[j]);
        let qbool = qni !== sqn ? !quad.includes(possibleVers[j]) : true;
        if (hbool && qbool) {
          let temp = sudoku[ml][nl];
          sudoku[ml][nl] = possibleVers[j];
          sudoku[jpos][nl] = temp;
        }
      }
    }
  }
  console.log("END VER");
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

function getHorizontalSingle(n, from) {
  let arr = [];
  for (let i = 0; i < from.length; i++) {
    arr.push(from[n][i]);
  }

  return arr;
}

function dummyVertical(nl) {
  let ver = getVerticalSingle(+nl, sudoku);
  let ogver = getVerticalSingle(+nl, sudokuClone);
  let possibleVers = ver.filter((n) => !ogver.includes(n) || !n);

  debugger;

  for (let i = 0; i < ver.length; i++) {
    for (let j = i + 1; j < ver.length; j++) {
      let [qni, quadi] = getWhichQuadrant(`${i}-${+nl}`, sudoku);
      quadi = quadi.reduce((total, val) => total.concat(val), []);
      let hori = getHorizontalSingle(j, sudoku);
      const poss = possibleVers.includes(sudoku[i][+nl]);
      const qposs = !quadi.includes(sudoku[i][+nl]);
      const hposs = !hori.includes(sudoku[i][+nl]);
      if (poss && qposs && hposs || !sudoku[i][+nl]) {
        if (sudoku[i][+nl]) {
          let [qnj, quadj] = getWhichQuadrant(`${i}-${+nl}`, sudoku);
          quadj = quadj.reduce((total, val) => total.concat(val), []);
          let verj = getHorizontalSingle(i, sudoku);
          const qpossj = !quadj.includes(sudoku[j][+nl]);
          const hpossj = !verj.includes(sudoku[j][+nl]);
          const possj = possibleVers.includes(sudoku[j][+nl]);

          if (qpossj && hpossj && possj) {
            let tempNum = sudoku[i][+nl];
            sudoku[i][+nl] = sudoku[j][+nl];
            sudoku[j][+nl] = tempNum;
            i++;
          }
        } else {
          for (let z = 0; z < ver.length; z++) {
            let [qnz, quadz] = getWhichQuadrant(`${i}-${+nl}`, sudoku);
            quadz = quadz.reduce((total, val) => total.concat(val), []);
            quadz = quadz.filter((n) => n);
            let verz = getHorizontalSingle(i, sudoku);
            verz = verz.filter((n) => n);
            const qpossz = !quadz.includes(sudoku[z][+nl]);
            const hpossz = !verz.includes(sudoku[z][+nl]);
            const possz = possibleVers.includes(sudoku[z][+nl]);
            if (qpossz && hpossz && possz) {
              let tempNum = sudoku[i][+nl];
              sudoku[i][+nl] = sudoku[z][+nl];
              sudoku[z][+nl] = tempNum;
            }
          }
        }
      }
    }
  }
  markAll();
}

function dummy(ml) {
  let hor = getHorizontalSingle(+ml, sudoku);
  let oghor = getHorizontalSingle(+ml, sudokuClone);
  let possibleHors = hor.filter((n) => !oghor.includes(n) || !n);

  for (let i = 0; i < hor.length; i++) {
    for (let j = i + 1; j < hor.length; j++) {
      let [qni, quadi] = getWhichQuadrant(`${+ml}-${j}`, sudoku);
      quadi = quadi.reduce((total, val) => total.concat(val), []);
      let veri = getVerticalSingle(j, sudoku);
      const poss = possibleHors.includes(sudoku[+ml][i]);
      const qposs = !quadi.includes(sudoku[+ml][i]);
      const vposs = !veri.includes(sudoku[+ml][i]);
      if (poss && qposs && vposs || !sudoku[+ml][i]) {
        if (sudoku[+ml][i]) {
          let [qnj, quadj] = getWhichQuadrant(`${+ml}-${i}`, sudoku);
          quadj = quadj.reduce((total, val) => total.concat(val), []);
          let verj = getVerticalSingle(i, sudoku);
          const qpossj = !quadj.includes(sudoku[+ml][j]);
          const vpossj = !verj.includes(sudoku[+ml][j]);
          const possj = possibleHors.includes(sudoku[+ml][j]);

          if (qpossj && vpossj && possj) {
            let tempNum = sudoku[+ml][i];
            sudoku[+ml][i] = sudoku[+ml][j];
            sudoku[+ml][j] = tempNum;
            i++;
          }
        } else {
          for (let z = 0; z < hor.length; z++) {
            let [qnz, quadz] = getWhichQuadrant(`${+ml}-${i}`, sudoku);
            quadz = quadz.reduce((total, val) => total.concat(val), []);
            quadz = quadz.filter((n) => n);
            let verz = getVerticalSingle(i, sudoku);
            verz = verz.filter((n) => n);
            const qpossz = !quadz.includes(sudoku[+ml][z]);
            const vpossz = !verz.includes(sudoku[+ml][z]);
            const possz = possibleHors.includes(sudoku[+ml][z]);
            if (qpossz && vpossz && possz) {
              let tempNum = sudoku[+ml][i];
              sudoku[+ml][i] = sudoku[+ml][z];
              sudoku[+ml][z] = tempNum;
            }
          }
        }
      }
    }
  }
  markAll();
}

function dumbRearrHor(move) {
  for (let i = 0; i < sudoku.length; i++) {
    dummy(i);
  }
}

function dumbRearrVer(move) {
  for (let i = 0; i < sudoku.length; i++) {
    dummyVertical(i);
  }
}

function rearrHor(move) {
  let [ml, nl] = move.split("-");
  let hor = getHorizontalSingle(+ml, sudoku);
  let oghor = getHorizontalSingle(+ml, sudokuClone);
  let possibleHors = hor.filter((n) => !oghor.includes(n) || !n);

  for (let i = 0; i < possibleHors.length; i++) {
    for (let j = i + 1; j < possibleHors.length; j++) {
      let ipos = hor.indexOf(possibleHors[i]);
      let jpos = hor.indexOf(possibleHors[j]);
      let [qn, quad] = getWhichQuadrant(`${jpos}-${+nl}`, sudoku);
      let [qni, quadi] = getWhichQuadrant(`${ipos}-${+nl}`, sudoku);
      let [sqn, sameQuads] = getWhichQuadrant(move, sudoku);

      let ver = getVerticalSingle(jpos, sudoku);
      let veri = getVerticalSingle(ipos, sudoku);

      quad = quad.reduce((total, val) => total.concat(val), []);
      quadi = quadi.reduce((total, val) => total.concat(val), []);

      if (!possibleHors[i]) {
        let vbool = !veri.includes(possibleHors[j]);
        let qbool = qni !== sqn ? !quad.includes(possibleHors[j]) : true;
        if (vbool && qbool) {
          let temp = sudoku[ml][nl];
          sudoku[ml][nl] = possibleHors[j];
          sudoku[jpos][nl] = temp;
        }
      }
    }
  }
  console.log("END HOR");
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

function getQuadPossibleShuffles(move) {
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

  return possibleShuffles;
}

function rearrQuad(move) {
  console.log("START QUAD");
  let possibleShuffles = getQuadPossibleShuffles(move);

  let unoccupied = possibleShuffles.filter((x) => !x.num);
  possibleShuffles = possibleShuffles.filter((x) => x.num);

  if (unoccupied.length) {
    for (let j = 0; j < unoccupied.length; j++) {
      let [_m, _n] = unoccupied[j].move.split("-");

      let hor = getHorizontalSingle(+_m, sudoku);
      let ver = getVerticalSingle(+_n, sudoku);

      for (let i = 0; i < possibleShuffles.length; i++) {
        if (
          !hor.includes(possibleShuffles[i].num) &&
          !ver.includes(possibleShuffles[i].num)
        ) {
          console.log("SHUFFLE ZERO");
          let [pm, pn] = possibleShuffles[i].move.split("-");
          sudoku[pm][pn] = unoccupied[j].num;
          sudoku[_m][_n] = possibleShuffles[i].num;
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
        // console.log("VERTICAL");
        let ver1 = getVerticalSingle(+n1, sudoku);
        ver1[m1] = 0;
        let ver2 = getVerticalSingle(+n2, sudoku);
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
        //console.log("HORIZONTAL");
        let hor1 = getHorizontalSingle(+m1, sudoku);
        hor1[n1] = 0;
        let hor2 = getHorizontalSingle(+m2, sudoku);
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
        //console.log("BOTH");
      }
    }
  }
  console.log("END QUAD");
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
  // rearrQuad(move);
  // rearrVer(move);
  // rearrHor(move);
  dumbRearrHor();
  // dumbRearrVer();
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

function getUnfilled() {
  let move;
  for (let i = 0; i < sudoku.length; i++) {
    for (let j = 0; j < sudoku[i].length; j++) {
      if (!sudoku[i][j]) return `${i}-${j}`;
    }
  }
  return move;
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
  // let { move } = getOptimalIntersection();
  // move = !move ? getUnfilled() : move;
  let move = getUnfilled();
  let [qn, quad] = getWhichQuadrant(move, sudoku);
  quad = quad.reduce((merged, val) => merged.concat(val), []);
  let hor = getHorizontalSingle(+move.split("-")[0], sudoku);
  let ver = getVerticalSingle(+move.split("-")[1], sudoku);

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
    //console.log("STUCK AT", move, solutionPath);
    statusElt.innerText = "Rearraging logic...";
    handleRearranging(move);
  }
  //console.log("----------------");
  setTimeout(() => {
    document.querySelector(`span#col-${move}`).style.background = MOVE_COLOR;
    statusElt.innerText = `CELL - ${move} >>> ${bestNum}`;
    document.querySelector(`span#col-${move}`).innerText = bestNum;
  }, 4000 / animationSpeed);
}
