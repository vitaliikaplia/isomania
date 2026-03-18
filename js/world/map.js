/* ── Map Data ── */
/* 0=grass, 1=building, 2=tree, 3=small structure, 4=road, 5=sidewalk */

const MW = 192, MH = 192;
const MAP = Array.from({ length: MH }, () => new Array(MW).fill(0));

/* ── Seeded random for consistent map ── */
let _seed = 12345;
function srand(s) { _seed = s; }
function rand() {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return (_seed & 0x7fffffff) / 0x7fffffff;
}
function randInt(min, max) { return min + Math.floor(rand() * (max - min + 1)); }

/* ── Roads ── */
const hRoads = [30, 62, 94, 126, 158];
const vRoads = [24, 56, 88, 120, 152];

for (const row of hRoads) {
  for (let c = 0; c < MW; c++) {
    MAP[row][c] = 4;
    MAP[row + 1][c] = 4;
    if (row > 0 && MAP[row - 1][c] === 0) MAP[row - 1][c] = 5;
    if (row + 2 < MH && MAP[row + 2][c] === 0) MAP[row + 2][c] = 5;
  }
}
for (const col of vRoads) {
  for (let r = 0; r < MH; r++) {
    MAP[r][col] = 4;
    MAP[r][col + 1] = 4;
    if (col > 0 && MAP[r][col - 1] === 0) MAP[r][col - 1] = 5;
    if (col + 2 < MW && MAP[r][col + 2] === 0) MAP[r][col + 2] = 5;
  }
}

/* ── Procedural buildings ── */
/* 6=fence, 7=fence gate (wicket) */
const buildings = [];
srand(42);

// Block boundaries from road grid
const hBounds = [0, ...hRoads.map(r => r - 1), MH - 1];
const vBounds = [0, ...vRoads.map(c => c - 1), MW - 1];

// Lot size: building + yard + fence = ~10 tiles wide
const LOT_W = 10;
const LOT_D = 9;
const YARD_SETBACK = 3; // tiles from road to building

function canPlace(r, c, w, d, margin) {
  for (let dr = -margin; dr < d + margin; dr++) {
    for (let dc = -margin; dc < w + margin; dc++) {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || rr >= MH || cc < 0 || cc >= MW) return false;
      if (MAP[rr][cc] !== 0) return false;
    }
  }
  return true;
}

function placeBuilding(r, c, w, d) {
  for (let dr = 0; dr < d; dr++) for (let dc = 0; dc < w; dc++) {
    MAP[r + dr][c + dc] = 1;
  }
  buildings.push({ r: r, c: c, w: w, d: d });
  return { r: r, c: c, w: w, d: d };
}

// roadSide: 'top','bottom','left','right' — which road the fence gate faces
function addFence(br, bc, bw, bd, roadSide) {
  const pad = 2; // fence distance from building
  const fTop = br - pad, fBot = br + bd + pad - 1;
  const fLeft = bc - pad, fRight = bc + bw + pad - 1;

  const gateC = bc + Math.floor(bw / 2);
  const gateR = br + Math.floor(bd / 2);

  for (let r = fTop; r <= fBot; r++) {
    for (let c = fLeft; c <= fRight; c++) {
      if (r < 0 || r >= MH || c < 0 || c >= MW) continue;
      if (MAP[r][c] !== 0) continue;
      const isEdge = r === fTop || r === fBot || c === fLeft || c === fRight;
      if (!isEdge) continue;

      // Gate placement based on road side
      let isGate = false;
      if (roadSide === 'bottom' && r === fBot && Math.abs(c - gateC) <= 0) isGate = true;
      if (roadSide === 'top' && r === fTop && Math.abs(c - gateC) <= 0) isGate = true;
      if (roadSide === 'right' && c === fRight && Math.abs(r - gateR) <= 0) isGate = true;
      if (roadSide === 'left' && c === fLeft && Math.abs(r - gateR) <= 0) isGate = true;

      MAP[r][c] = isGate ? 7 : 6;
    }
  }
}

// Place buildings in rows along each road edge
for (let bi = 0; bi < hBounds.length - 1; bi++) {
  for (let bj = 0; bj < vBounds.length - 1; bj++) {
    const blockTop = hBounds[bi] + 3;
    const blockBot = hBounds[bi + 1] - 2;
    const blockLeft = vBounds[bj] + 3;
    const blockRight = vBounds[bj + 1] - 2;

    const blockW = blockRight - blockLeft;
    const blockH = blockBot - blockTop;
    if (blockW < 10 || blockH < 10) continue;

    // Row along top road (buildings face top/north)
    for (let col = blockLeft; col + 5 <= blockRight; col += LOT_W + randInt(0, 2)) {
      const bw = randInt(3, 5);
      const bd = randInt(3, 4);
      const br = blockTop + YARD_SETBACK;
      const bc = col + randInt(0, 1);
      if (canPlace(br, bc, bw, bd, 3)) {
        const b = placeBuilding(br, bc, bw, bd);
        if (rand() < 0.45) addFence(b.r, b.c, b.w, b.d, 'top');
      }
    }

    // Row along bottom road (buildings face bottom/south)
    for (let col = blockLeft; col + 5 <= blockRight; col += LOT_W + randInt(0, 2)) {
      const bw = randInt(3, 5);
      const bd = randInt(3, 4);
      const br = blockBot - YARD_SETBACK - bd;
      const bc = col + randInt(0, 1);
      if (canPlace(br, bc, bw, bd, 3)) {
        const b = placeBuilding(br, bc, bw, bd);
        if (rand() < 0.45) addFence(b.r, b.c, b.w, b.d, 'bottom');
      }
    }
  }
}

/* ── Trees ── */
srand(777);
for (let r = 1; r < MH - 1; r += 2) {
  for (let c = 1; c < MW - 1; c += 2) {
    if (MAP[r][c] !== 0) continue;
    if (rand() < 0.06) {
      const tr = r + randInt(0, 1);
      const tc = c + randInt(0, 1);
      if (tr < MH && tc < MW && MAP[tr][tc] === 0) {
        MAP[tr][tc] = 2;
      }
    }
  }
}

/* ── Small structures ── */
srand(333);
for (let r = 2; r < MH - 2; r += 3) {
  for (let c = 2; c < MW - 2; c += 3) {
    if (MAP[r][c] !== 0) continue;
    if (rand() < 0.02) {
      MAP[r][c] = 3;
    }
  }
}

/* ── Building Groups (BFS) ── */

const bG = Array.from({ length: MH }, () => new Array(MW).fill(-1));
const gInfo = [];
const BPALS = [
  { t: 0xC8A87A, l: 0x5C3518, r: 0x8A5428 },
  { t: 0xA8B898, l: 0x284818, r: 0x3A6828 },
  { t: 0x9AB0C8, l: 0x1E3050, r: 0x304868 },
  { t: 0xC8B880, l: 0x585020, r: 0x887838 },
  { t: 0xD4B090, l: 0x6B3820, r: 0x955838 },
  { t: 0xB8C0A0, l: 0x2A5020, r: 0x407030 },
];

let gid = 0;
for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) {
  if (MAP[r][c] === 1 && bG[r][c] === -1) {
    const cells = [];
    const q = [{ r, c }]; bG[r][c] = gid;
    while (q.length) {
      const { r: cr, c: cc } = q.shift();
      cells.push({ r: cr, c: cc });
      for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        const nr = cr + dr, nc = cc + dc;
        if (nr >= 0 && nr < MH && nc >= 0 && nc < MW && MAP[nr][nc] === 1 && bG[nr][nc] === -1) {
          bG[nr][nc] = gid; q.push({ r: nr, c: nc });
        }
      }
    }
    let minC = MW, maxC = 0, minR = MH, maxR = 0;
    for (const cell of cells) {
      if (cell.c < minC) minC = cell.c;
      if (cell.c > maxC) maxC = cell.c;
      if (cell.r < minR) minR = cell.r;
      if (cell.r > maxR) maxR = cell.r;
    }
    const w = maxC - minC + 1;
    const d = maxR - minR + 1;
    const area = cells.length;
    const floors = area <= 6 ? (gid % 3 === 0 ? 2 : 1) : (gid % 2 === 0 ? 2 : 1);
    const floorH = 1.4 + (gid % 3) * 0.15;
    const h = floors * floorH;
    const roofType = gid % 3;
    gInfo.push({
      pal: BPALS[gid % BPALS.length],
      h: h, floors: floors, floorH: floorH, roofType: roofType,
      minC: minC, maxC: maxC, minR: minR, maxR: maxR,
      w: w, d: d, area: area, cells: cells
    });
    gid++;
  }
}

/* ── Collision ── */
const COLLIDERS = {
  1: { shape: 'box', hw: 0.5, hd: 0.5 },
  2: { shape: 'circle', radius: 0.2 },
  3: { shape: 'box', hw: 0.25, hd: 0.25 },
  6: { shape: 'circle', radius: 0.15 },  // fence — thin post collision
};

function isSolid(tx, ty) {
  const c = Math.round(tx), r = Math.round(ty);
  if (c < 0 || c >= MW || r < 0 || r >= MH) return true;
  for (const [dc, dr] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]) {
    const nc = c + dc, nr = r + dr;
    if (nc < 0 || nc >= MW || nr < 0 || nr >= MH) continue;
    const col = COLLIDERS[MAP[nr][nc]];
    if (!col) continue;
    const dx = tx - nc, dy = ty - nr;
    if (col.shape === 'circle') {
      if (dx * dx + dy * dy < col.radius * col.radius) return true;
    } else {
      if (Math.abs(dx) < col.hw && Math.abs(dy) < col.hd) return true;
    }
  }
  return false;
}
