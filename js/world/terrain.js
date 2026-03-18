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

/* ── Traffic signs — yield signs on secondary roads at intersections ── */
/* Main roads = horizontal (hRoads), secondary = vertical (vRoads) */

const signPoleMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
const signPoleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6);
const signBorderMat = new THREE.MeshLambertMaterial({ color: 0xCC2222 });
const signInnerMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });

function addYieldSign(x, z, facingAngle) {
  const signGroup = new THREE.Group();

  // Pole
  const pole = new THREE.Mesh(signPoleGeo, signPoleMat);
  pole.position.set(x, 0.6, z);
  pole.castShadow = true;
  signGroup.add(pole);

  // Sign — inverted triangle (yield)
  const triOuter = new THREE.Shape();
  triOuter.moveTo(0, -0.18);
  triOuter.lineTo(0.16, 0.12);
  triOuter.lineTo(-0.16, 0.12);
  triOuter.lineTo(0, -0.18);

  const triInner = new THREE.Shape();
  const inset = 0.04;
  triInner.moveTo(0, -0.18 + inset * 1.5);
  triInner.lineTo(0.16 - inset, 0.12 - inset);
  triInner.lineTo(-0.16 + inset, 0.12 - inset);
  triInner.lineTo(0, -0.18 + inset * 1.5);

  const outerGeo = new THREE.ShapeGeometry(triOuter);
  const innerGeo = new THREE.ShapeGeometry(triInner);

  const signOuter = new THREE.Mesh(outerGeo, signBorderMat);
  signOuter.position.set(x, 1.15, z);
  signOuter.rotation.y = facingAngle;
  signGroup.add(signOuter);

  const signInner = new THREE.Mesh(innerGeo, signInnerMat);
  signInner.position.set(x, 1.15, z);
  signInner.rotation.y = facingAngle;
  // Offset slightly in front to avoid z-fighting
  signInner.translateZ(0.002);
  signGroup.add(signInner);

  // Back of sign
  const backMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
  const backGeo = new THREE.ShapeGeometry(triOuter);
  const signBack = new THREE.Mesh(backGeo, backMat);
  signBack.position.set(x, 1.15, z);
  signBack.rotation.y = facingAngle + Math.PI;
  signBack.translateZ(0.002);
  signGroup.add(signBack);

  scene.add(signGroup);
}

// Place yield signs at each intersection where secondary (vertical) meets main (horizontal)
for (const row of hRoads) {
  for (const col of vRoads) {
    const hx = col - MW / 2;       // left edge of vertical road
    const hz = row - MH / 2;       // top edge of horizontal road

    // Sign on right sidewalk, before intersection (approaching from top)
    addYieldSign(hx + 2.8, hz - 1.2, 0);

    // Sign on left sidewalk, before intersection (approaching from bottom)
    addYieldSign(hx - 0.8, hz + 3.2, Math.PI);
  }
}
