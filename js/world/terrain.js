/* ── Terrain ── */

const GRASS = [0x3E6B33, 0x427239, 0x3A6430, 0x477A38, 0x3F6735];
const ASPHALT = [0x3A3A3A, 0x383838, 0x3C3C3C, 0x353535];
const SIDEWALK = [0xA0A090, 0x989888, 0x9C9C8C, 0xA4A494];

const tileGeo = new THREE.BoxGeometry(1, 0.15, 1);

for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) {
  const t = MAP[r][c];
  let col;
  let yOff = -0.075;

  if (t === 4) {
    // Road — asphalt, slightly lower
    col = ASPHALT[(c + r * 3) % ASPHALT.length];
    yOff = -0.09;
  } else if (t === 5) {
    // Sidewalk — raised slightly
    col = SIDEWALK[(c * 5 + r * 2) % SIDEWALK.length];
    yOff = -0.04;
  } else {
    // Grass (default for all non-road tiles)
    col = GRASS[(c * 3 + r * 7 + c * r) % GRASS.length];
  }

  const mat = new THREE.MeshLambertMaterial({ color: col });
  const tile = new THREE.Mesh(tileGeo, mat);
  tile.position.set(c - MW / 2 + 0.5, yOff, r - MH / 2 + 0.5);
  tile.receiveShadow = true;
  scene.add(tile);
}

/* ── Road markings (center line) ── */
const markGeo = new THREE.PlaneGeometry(0.08, 0.6);
const markMat = new THREE.MeshBasicMaterial({ color: 0xCCCC88, transparent: true, opacity: 0.6 });

// Horizontal roads — dashed center line
for (const row of hRoads) {
  for (let c = 0; c < MW; c += 2) {
    if (MAP[row][c] !== 4) continue;
    const mark = new THREE.Mesh(markGeo, markMat);
    mark.rotation.x = -Math.PI / 2;
    mark.rotation.z = Math.PI / 2;
    mark.position.set(c - MW / 2 + 0.5, -0.005, (row + 0.5) - MH / 2 + 0.5);
    scene.add(mark);
  }
}

// Vertical roads — dashed center line
for (const col of vRoads) {
  for (let r = 0; r < MH; r += 2) {
    if (MAP[r][col] !== 4) continue;
    const mark = new THREE.Mesh(markGeo, markMat);
    mark.rotation.x = -Math.PI / 2;
    mark.position.set((col + 0.5) - MW / 2 + 0.5, -0.005, r - MH / 2 + 0.5);
    scene.add(mark);
  }
}

/* ── Curb edges (thin raised edge between sidewalk and road) ── */
const curbMat = new THREE.MeshLambertMaterial({ color: 0x888878 });

// Horizontal road curbs
for (const row of hRoads) {
  for (let c = 0; c < MW; c++) {
    if (MAP[row][c] !== 4) continue;
    // Top curb
    if (row > 0 && MAP[row - 1][c] === 5) {
      const curbGeo = new THREE.BoxGeometry(1, 0.08, 0.06);
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(c - MW / 2 + 0.5, 0.0, row - MH / 2);
      scene.add(curb);
    }
    // Bottom curb
    if (row + 2 < MH && MAP[row + 2][c] === 5) {
      const curbGeo = new THREE.BoxGeometry(1, 0.08, 0.06);
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(c - MW / 2 + 0.5, 0.0, row + 2 - MH / 2);
      scene.add(curb);
    }
  }
}

// Vertical road curbs
for (const col of vRoads) {
  for (let r = 0; r < MH; r++) {
    if (MAP[r][col] !== 4) continue;
    // Left curb
    if (col > 0 && MAP[r][col - 1] === 5) {
      const curbGeo = new THREE.BoxGeometry(0.06, 0.08, 1);
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(col - MW / 2, 0.0, r - MH / 2 + 0.5);
      scene.add(curb);
    }
    // Right curb
    if (col + 2 < MW && MAP[r][col + 2] === 5) {
      const curbGeo = new THREE.BoxGeometry(0.06, 0.08, 1);
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(col + 2 - MW / 2, 0.0, r - MH / 2 + 0.5);
      scene.add(curb);
    }
  }
}
