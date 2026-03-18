/* ── World Helpers & Collision ── */

const MW = WORLD.width;
const MH = WORLD.height;
const MAP = WORLD.map;
const hRoads = WORLD.roads.rows;
const vRoads = WORLD.roads.cols;
const gInfo = WORLD.buildingGroups;
const COLLIDERS = WORLD.colliders;
const FENCE_COLLIDERS = [];

function worldXFromCol(col) {
  return col - MW / 2 + 0.5;
}

function worldZFromRow(row) {
  return row - MH / 2 + 0.5;
}

function isFenceTile(tile) {
  return tile === WORLD.tiles.fence || tile === WORLD.tiles.gate;
}

function addFenceCollider(cx, cz, hw, hd) {
  FENCE_COLLIDERS.push({ cx, cz, hw, hd });
}

function hitsFenceCollider(tx, ty) {
  for (const collider of FENCE_COLLIDERS) {
    if (Math.abs(tx - collider.cx) < collider.hw && Math.abs(ty - collider.cz) < collider.hd) {
      return true;
    }
  }

  return false;
}

function isSolid(tx, ty) {
  const c = Math.round(tx);
  const r = Math.round(ty);

  if (c < 0 || c >= MW || r < 0 || r >= MH) return true;
  if (hitsFenceCollider(tx, ty)) return true;

  for (const [dc, dr] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nc = c + dc;
    const nr = r + dr;

    if (nc < 0 || nc >= MW || nr < 0 || nr >= MH) continue;

    const collider = COLLIDERS[MAP[nr][nc]];
    if (!collider) continue;
    if (isFenceTile(MAP[nr][nc])) continue;

    const dx = tx - nc;
    const dy = ty - nr;

    if (collider.shape === 'circle') {
      if (dx * dx + dy * dy < collider.radius * collider.radius) return true;
      continue;
    }

    if (Math.abs(dx) < collider.hw && Math.abs(dy) < collider.hd) return true;
  }

  return false;
}
