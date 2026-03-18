/* ── Terrain (instanced for performance) ── */

const GRASS = CONFIG.terrain.grassColors;
const ASPHALT = CONFIG.terrain.asphaltColors;
const SIDEWALK = CONFIG.terrain.sidewalkColors;
const TERRAIN_TILE = WORLD.tiles;

const tileGeo = new THREE.BoxGeometry(1, 0.15, 1);
const dummy = new THREE.Object3D();

const colorBuckets = {};
for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) {
  const t = MAP[r][c];
  let col;
  let yOff = -0.075;

  if (t === TERRAIN_TILE.road) {
    col = ASPHALT[(c + r * 3) % ASPHALT.length];
    yOff = -0.09;
  } else if (t === TERRAIN_TILE.sidewalk) {
    col = SIDEWALK[(c * 5 + r * 2) % SIDEWALK.length];
    yOff = -0.04;
  } else {
    col = GRASS[(c * 3 + r * 7 + c * r) % GRASS.length];
  }

  const key = col + '|' + yOff;
  if (!colorBuckets[key]) colorBuckets[key] = { col, yOff, tiles: [] };
  colorBuckets[key].tiles.push({ c, r });
}

for (const key in colorBuckets) {
  const bucket = colorBuckets[key];
  const mat = new THREE.MeshLambertMaterial({ color: bucket.col });
  const mesh = new THREE.InstancedMesh(tileGeo, mat, bucket.tiles.length);
  mesh.receiveShadow = true;

  for (let i = 0; i < bucket.tiles.length; i++) {
    const tile = bucket.tiles[i];
    dummy.position.set(worldXFromCol(tile.c), bucket.yOff, worldZFromRow(tile.r));
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);
}

/* ── Road markings (center line) ── */
const markGeo = new THREE.PlaneGeometry(0.08, 0.6);
const markMat = new THREE.MeshBasicMaterial({ color: 0xCCCC88, transparent: true, opacity: 0.6 });

for (const row of hRoads) {
  for (let c = 0; c < MW; c += 2) {
    if (MAP[row][c] !== TERRAIN_TILE.road) continue;
    const mark = new THREE.Mesh(markGeo, markMat);
    mark.rotation.x = -Math.PI / 2;
    mark.rotation.z = Math.PI / 2;
    mark.position.set(worldXFromCol(c), -0.005, worldZFromRow(row) + 0.5);
    scene.add(mark);
  }
}

for (const col of vRoads) {
  for (let r = 0; r < MH; r += 2) {
    if (MAP[r][col] !== TERRAIN_TILE.road) continue;
    const mark = new THREE.Mesh(markGeo, markMat);
    mark.rotation.x = -Math.PI / 2;
    mark.position.set(worldXFromCol(col) + 0.5, -0.005, worldZFromRow(r));
    scene.add(mark);
  }
}

/* ── Curb edges ── */
const curbMat = new THREE.MeshLambertMaterial({ color: 0x888878 });

for (const row of hRoads) {
  for (let c = 0; c < MW; c++) {
    if (MAP[row][c] !== TERRAIN_TILE.road) continue;

    if (row > 0 && MAP[row - 1][c] === TERRAIN_TILE.sidewalk) {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(1, 0.08, 0.06), curbMat);
      curb.position.set(worldXFromCol(c), 0.0, row - MH / 2);
      scene.add(curb);
    }

    if (row + 2 < MH && MAP[row + 2][c] === TERRAIN_TILE.sidewalk) {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(1, 0.08, 0.06), curbMat);
      curb.position.set(worldXFromCol(c), 0.0, row + 2 - MH / 2);
      scene.add(curb);
    }
  }
}

for (const col of vRoads) {
  for (let r = 0; r < MH; r++) {
    if (MAP[r][col] !== TERRAIN_TILE.road) continue;

    if (col > 0 && MAP[r][col - 1] === TERRAIN_TILE.sidewalk) {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 1), curbMat);
      curb.position.set(col - MW / 2, 0.0, worldZFromRow(r));
      scene.add(curb);
    }

    if (col + 2 < MW && MAP[r][col + 2] === TERRAIN_TILE.sidewalk) {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 1), curbMat);
      curb.position.set(col + 2 - MW / 2, 0.0, worldZFromRow(r));
      scene.add(curb);
    }
  }
}

/* ── Traffic signs — yield signs on secondary roads at intersections ── */

const signPoleMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
const signPoleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6);
const signBorderMat = new THREE.MeshLambertMaterial({ color: 0xCC2222 });
const signInnerMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
const signBackMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
const yieldOuterShape = new THREE.Shape();
yieldOuterShape.moveTo(0, -0.18);
yieldOuterShape.lineTo(0.16, 0.12);
yieldOuterShape.lineTo(-0.16, 0.12);
yieldOuterShape.lineTo(0, -0.18);

const yieldInnerShape = new THREE.Shape();
const yieldInset = 0.04;
yieldInnerShape.moveTo(0, -0.18 + yieldInset * 1.5);
yieldInnerShape.lineTo(0.16 - yieldInset, 0.12 - yieldInset);
yieldInnerShape.lineTo(-0.16 + yieldInset, 0.12 - yieldInset);
yieldInnerShape.lineTo(0, -0.18 + yieldInset * 1.5);

const signOuterGeo = new THREE.ShapeGeometry(yieldOuterShape);
const signInnerGeo = new THREE.ShapeGeometry(yieldInnerShape);

function addYieldSign(x, z, facingAngle) {
  const signGroup = new THREE.Group();

  const pole = new THREE.Mesh(signPoleGeo, signPoleMat);
  pole.position.set(x, 0.6, z);
  pole.castShadow = true;
  signGroup.add(pole);

  const signOuter = new THREE.Mesh(signOuterGeo, signBorderMat);
  signOuter.position.set(x, 1.15, z);
  signOuter.rotation.y = facingAngle;
  signGroup.add(signOuter);

  const signInner = new THREE.Mesh(signInnerGeo, signInnerMat);
  signInner.position.set(x, 1.15, z);
  signInner.rotation.y = facingAngle;
  signInner.translateZ(0.002);
  signGroup.add(signInner);

  const signBack = new THREE.Mesh(signOuterGeo, signBackMat);
  signBack.position.set(x, 1.15, z);
  signBack.rotation.y = facingAngle + Math.PI;
  signBack.translateZ(0.002);
  signGroup.add(signBack);

  scene.add(signGroup);
}

for (const row of hRoads) {
  for (const col of vRoads) {
    const hx = col - MW / 2;
    const hz = row - MH / 2;
    addYieldSign(hx + 2.8, hz - 1.2, 0);
    addYieldSign(hx - 0.8, hz + 3.2, Math.PI);
  }
}
