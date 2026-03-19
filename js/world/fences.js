/* ── Fences and Gates ── */

const fenceMat = new THREE.MeshLambertMaterial({ color: 0x8B7355, transparent: true });
const fencePostGeo = new THREE.BoxGeometry(0.06, 0.6, 0.06);
const fenceRailGeo = new THREE.BoxGeometry(0.04, 0.04, 1);
const fenceRailGeoX = new THREE.BoxGeometry(1, 0.04, 0.04);
const wicketMat = new THREE.MeshLambertMaterial({ color: 0x6B5B45, transparent: true });
const wicketFrameMat = new THREE.MeshLambertMaterial({ color: 0x5A4A35, transparent: true });
const wicketBraceGeo = new THREE.BoxGeometry(0.04, 0.04, 0.78);
const wicketPostGeo = new THREE.BoxGeometry(0.05, 0.52, 0.05);
const wicketRailGeoX = new THREE.BoxGeometry(0.84, 0.04, 0.04);
const wicketRailGeoZ = new THREE.BoxGeometry(0.04, 0.04, 0.84);
const FENCE_COLLIDER_HALF_THICKNESS = 0.09;
const FENCE_POST_COLLIDER_HALF_SIZE = 0.08;

function addFencePost(group, x, z, height, material, geo = fencePostGeo) {
  const post = new THREE.Mesh(geo, material);
  post.position.set(x, height / 2, z);
  post.castShadow = true;
  group.add(post);
}

function addHorizontalFenceCollision(c, r) {
  addFenceCollider(c + 0.5, r, 0.5, FENCE_COLLIDER_HALF_THICKNESS);
}

function addVerticalFenceCollision(c, r) {
  addFenceCollider(c, r + 0.5, FENCE_COLLIDER_HALF_THICKNESS, 0.5);
}

function addFencePostCollision(c, r) {
  addFenceCollider(c, r, FENCE_POST_COLLIDER_HALF_SIZE, FENCE_POST_COLLIDER_HALF_SIZE);
}

function addHorizontalGate(group, fx, fz) {
  const postOffset = 0.46;

  addFencePost(group, fx - postOffset, fz, 0.52, wicketFrameMat, wicketPostGeo);
  addFencePost(group, fx + postOffset, fz, 0.52, wicketFrameMat, wicketPostGeo);

  for (const y of [0.18, 0.35]) {
    const rail = new THREE.Mesh(wicketRailGeoX, wicketMat);
    rail.position.set(fx, y, fz);
    group.add(rail);
  }

  const brace = new THREE.Mesh(wicketBraceGeo, wicketFrameMat);
  brace.position.set(fx, 0.265, fz);
  brace.rotation.x = Math.PI / 4;
  brace.rotation.y = Math.PI / 2;
  group.add(brace);
}

function addVerticalGate(group, fx, fz) {
  const postOffset = 0.46;

  addFencePost(group, fx, fz - postOffset, 0.52, wicketFrameMat, wicketPostGeo);
  addFencePost(group, fx, fz + postOffset, 0.52, wicketFrameMat, wicketPostGeo);

  for (const y of [0.18, 0.35]) {
    const rail = new THREE.Mesh(wicketRailGeoZ, wicketMat);
    rail.position.set(fx, y, fz);
    group.add(rail);
  }

  const brace = new THREE.Mesh(wicketBraceGeo, wicketFrameMat);
  brace.position.set(fx, 0.265, fz);
  brace.rotation.z = Math.PI / 4;
  group.add(brace);
}

for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) {
  const t = MAP[r][c];
  if (!isFenceTile(t)) continue;

  const fx = worldXFromCol(c);
  const fz = worldZFromRow(r);
  const fGroup = new THREE.Group();
  const hasRightNeighbor = c + 1 < MW && isFenceTile(MAP[r][c + 1]);
  const hasBottomNeighbor = r + 1 < MH && isFenceTile(MAP[r + 1][c]);

  addFencePostCollision(c, r);

  if (t === BUILDING_TILE.fence) {
    addFencePost(fGroup, fx, fz, 0.6, fenceMat);

    if (hasRightNeighbor) {
      const railTop = new THREE.Mesh(fenceRailGeoX, fenceMat);
      railTop.position.set(fx + 0.5, 0.5, fz);
      fGroup.add(railTop);

      const railBot = new THREE.Mesh(fenceRailGeoX, fenceMat);
      railBot.position.set(fx + 0.5, 0.2, fz);
      fGroup.add(railBot);
      addHorizontalFenceCollision(c, r);
    }

    if (hasBottomNeighbor) {
      const railTop = new THREE.Mesh(fenceRailGeo, fenceMat);
      railTop.position.set(fx, 0.5, fz + 0.5);
      fGroup.add(railTop);

      const railBot = new THREE.Mesh(fenceRailGeo, fenceMat);
      railBot.position.set(fx, 0.2, fz + 0.5);
      fGroup.add(railBot);
      addVerticalFenceCollision(c, r);
    }
  } else {
    if (hasRightNeighbor && !hasBottomNeighbor) {
      addHorizontalGate(fGroup, fx + 0.5, fz);
      addHorizontalFenceCollision(c, r);
    } else if (hasBottomNeighbor && !hasRightNeighbor) {
      addVerticalGate(fGroup, fx, fz + 0.5);
      addVerticalFenceCollision(c, r);
    } else {
      addFencePost(fGroup, fx, fz, 0.52, wicketFrameMat, wicketPostGeo);
    }
  }

  scene.add(fGroup);
  registerOccludable(fGroup);
}
