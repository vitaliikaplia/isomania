/* ── Map Data ── */
/* 0=grass, 1=building, 2=tree, 3=small structure, 4=road, 5=sidewalk */

const MW = 48, MH = 48;
const MAP = Array.from({ length: MH }, () => new Array(MW).fill(0));

/* ── Roads ── */
/* Horizontal roads (2 tiles asphalt + 1 tile sidewalk each side) */
const hRoads = [15, 33];
/* Vertical roads */
const vRoads = [11, 25, 39];

for (const row of hRoads) {
  for (let c = 0; c < MW; c++) {
    MAP[row][c] = 4;
    MAP[row + 1][c] = 4;
    if (MAP[row - 1][c] === 0) MAP[row - 1][c] = 5;
    if (MAP[row + 2][c] === 0) MAP[row + 2][c] = 5;
  }
}
for (const col of vRoads) {
  for (let r = 0; r < MH; r++) {
    MAP[r][col] = 4;
    MAP[r][col + 1] = 4;
    if (MAP[r][col - 1] === 0) MAP[r][col - 1] = 5;
    if (MAP[r][col + 2] === 0) MAP[r][col + 2] = 5;
  }
}

/* ── Buildings (placed in blocks between roads) ── */
const buildings = [
  // Block top-left
  { r: 3, c: 2, w: 3, d: 4 },
  { r: 3, c: 7, w: 2, d: 3 },
  { r: 8, c: 3, w: 4, d: 3 },
  // Block top-center
  { r: 2, c: 15, w: 4, d: 3 },
  { r: 7, c: 14, w: 3, d: 4 },
  { r: 3, c: 20, w: 3, d: 3 },
  { r: 8, c: 19, w: 4, d: 3 },
  // Block top-right
  { r: 2, c: 28, w: 5, d: 3 },
  { r: 7, c: 28, w: 3, d: 4 },
  { r: 3, c: 35, w: 3, d: 3 },
  { r: 8, c: 34, w: 4, d: 3 },
  // Block top-far-right
  { r: 3, c: 42, w: 3, d: 4 },
  { r: 9, c: 43, w: 3, d: 3 },
  // Block middle-left
  { r: 19, c: 2, w: 3, d: 4 },
  { r: 19, c: 7, w: 3, d: 3 },
  { r: 25, c: 3, w: 4, d: 3 },
  { r: 25, c: 8, w: 2, d: 3 },
  // Block middle-center
  { r: 19, c: 15, w: 5, d: 4 },
  { r: 26, c: 14, w: 3, d: 3 },
  { r: 19, c: 21, w: 3, d: 3 },
  { r: 25, c: 20, w: 4, d: 4 },
  // Block middle-right
  { r: 19, c: 28, w: 4, d: 3 },
  { r: 24, c: 29, w: 3, d: 4 },
  { r: 19, c: 34, w: 3, d: 4 },
  { r: 26, c: 34, w: 4, d: 3 },
  // Block middle-far-right
  { r: 20, c: 42, w: 3, d: 3 },
  { r: 25, c: 42, w: 4, d: 4 },
  // Block bottom-left
  { r: 36, c: 2, w: 4, d: 3 },
  { r: 36, c: 7, w: 3, d: 4 },
  { r: 42, c: 3, w: 3, d: 3 },
  // Block bottom-center
  { r: 36, c: 14, w: 5, d: 3 },
  { r: 36, c: 21, w: 3, d: 4 },
  { r: 42, c: 15, w: 4, d: 3 },
  { r: 42, c: 21, w: 3, d: 3 },
  // Block bottom-right
  { r: 36, c: 28, w: 3, d: 4 },
  { r: 36, c: 34, w: 4, d: 3 },
  { r: 42, c: 28, w: 5, d: 3 },
  { r: 43, c: 35, w: 3, d: 3 },
  // Block bottom-far-right
  { r: 36, c: 42, w: 4, d: 3 },
  { r: 42, c: 43, w: 3, d: 3 },
];

for (const b of buildings) {
  for (let dr = 0; dr < b.d; dr++) for (let dc = 0; dc < b.w; dc++) {
    const r = b.r + dr, c = b.c + dc;
    if (r >= 0 && r < MH && c >= 0 && c < MW && MAP[r][c] === 0) {
      MAP[r][c] = 1;
    }
  }
}

/* ── Trees (scattered in blocks, avoiding roads and buildings) ── */
const treeSeed = [
  [1,1],[1,6],[2,9],[5,5],[6,1],[9,8],
  [1,18],[4,23],[6,17],[9,22],
  [1,30],[5,37],[6,31],[10,36],
  [1,44],[5,46],[10,45],
  [18,1],[22,8],[24,5],[28,9],
  [18,16],[22,23],[24,19],[28,21],
  [18,30],[22,37],[28,31],[30,36],
  [18,44],[22,46],[28,44],
  [35,1],[40,8],[44,5],[46,1],
  [35,17],[40,22],[44,18],[46,23],
  [35,30],[40,36],[44,32],[46,37],
  [35,44],[44,46],[46,42],
];
for (const [r, c] of treeSeed) {
  if (r >= 0 && r < MH && c >= 0 && c < MW && MAP[r][c] === 0) {
    MAP[r][c] = 2;
  }
}

/* ── Small structures (crates, sheds) ── */
const smallSeed = [
  [5,9],[8,6],[12,2],[13,8],
  [5,22],[10,18],[12,23],
  [5,32],[10,30],[12,37],
  [22,2],[26,8],[30,5],
  [22,17],[26,22],[30,20],
  [22,32],[26,30],[30,37],
  [40,2],[44,9],[46,6],
  [40,17],[44,22],
  [40,30],[44,36],
];
for (const [r, c] of smallSeed) {
  if (r >= 0 && r < MH && c >= 0 && c < MW && MAP[r][c] === 0) {
    MAP[r][c] = 3;
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
    const h = area <= 6 ? 2.5 + (gid % 3) * 0.3 : 3.2 + (gid % 3) * 0.5;
    gInfo.push({
      pal: BPALS[gid % BPALS.length],
      h: h,
      minC: minC, maxC: maxC, minR: minR, maxR: maxR,
      w: w, d: d, area: area, cells: cells
    });
    gid++;
  }
}

/* ── Collision ── */
/* Collision matches actual mesh size, not full tile */
const COLLIDERS = {
  // type: { shape: 'circle'|'box', radius / hw,hd (half-width, half-depth) }
  1: { shape: 'box', hw: 0.5, hd: 0.5 },      // buildings — full tile
  2: { shape: 'circle', radius: 0.2 },           // trees — trunk only
  3: { shape: 'box', hw: 0.25, hd: 0.25 },      // crates — half tile
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
