/* ── Street Props ── */

const BIN_COLORS = CONFIG.world.binColors;
const BIN_COLLIDER = CONFIG.world.propColliders.trashBin;
const binBodyGeo = new THREE.BoxGeometry(0.26, 0.42, 0.22);
const binLidGeo = new THREE.BoxGeometry(0.29, 0.05, 0.25);
const binWheelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.03, 10);
const binBodyMats = BIN_COLORS.body.map(color => new THREE.MeshLambertMaterial({ color, transparent: true }));
const binLidMats = BIN_COLORS.lid.map(color => new THREE.MeshLambertMaterial({ color, transparent: true }));
const binWheelMat = new THREE.MeshLambertMaterial({ color: BIN_COLORS.wheel, transparent: true });

function createTrashBin(variantIndex) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(binBodyGeo, binBodyMats[variantIndex % binBodyMats.length]);
  body.position.y = 0.21;
  body.castShadow = true;
  group.add(body);

  const lid = new THREE.Mesh(binLidGeo, binLidMats[variantIndex % binLidMats.length]);
  lid.position.set(0, 0.445, 0);
  lid.rotation.z = -0.08;
  group.add(lid);

  for (const side of [-1, 1]) {
    const wheel = new THREE.Mesh(binWheelGeo, binWheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(side * 0.09, 0.05, -0.08);
    group.add(wheel);
  }

  return group;
}

function tryFindSidewalkSpot(samples, dirCol, dirRow, rotY) {
  for (const sample of samples) {
    for (let step = 1; step <= 6; step++) {
      const col = sample.col + dirCol * step;
      const row = sample.row + dirRow * step;
      if (col < 0 || col >= MW || row < 0 || row >= MH) break;

      const tile = MAP[row][col];
      if (tile === BUILDING_TILE.building) break;
      if (tile === BUILDING_TILE.sidewalk) {
        return {
          x: worldXFromCol(col) + dirCol * 0.08 + dirRow * 0.06,
          z: worldZFromRow(row) + dirRow * 0.08 + dirCol * 0.06,
          rotY,
        };
      }
    }
  }

  return null;
}

function getTrashBinSpot(groupInfo) {
  const sampleCols = [
    groupInfo.minC + 1,
    Math.round((groupInfo.minC + groupInfo.maxC) / 2),
    groupInfo.maxC - 1,
  ].filter((value, index, list) => value >= 0 && value < MW && list.indexOf(value) === index);
  const sampleRows = [
    groupInfo.minR + 1,
    Math.round((groupInfo.minR + groupInfo.maxR) / 2),
    groupInfo.maxR - 1,
  ].filter((value, index, list) => value >= 0 && value < MH && list.indexOf(value) === index);

  const candidates = [
    tryFindSidewalkSpot(sampleCols.map(col => ({ col, row: groupInfo.minR })), 0, -1, 0.18),
    tryFindSidewalkSpot(sampleCols.map(col => ({ col, row: groupInfo.maxR })), 0, 1, Math.PI + 0.18),
    tryFindSidewalkSpot(sampleRows.map(row => ({ col: groupInfo.minC, row })), -1, 0, Math.PI / 2),
    tryFindSidewalkSpot(sampleRows.map(row => ({ col: groupInfo.maxC, row })), 1, 0, -Math.PI / 2),
  ];

  return candidates.find(Boolean) || null;
}

for (let i = 0; i < gInfo.length; i++) {
  const groupInfo = gInfo[i];
  if ((i + groupInfo.area) % 3 === 0) continue;

  const spot = getTrashBinSpot(groupInfo);
  if (!spot) continue;

  const bin = createTrashBin(i);
  bin.position.set(spot.x, 0, spot.z);
  bin.rotation.y = spot.rotY;
  scene.add(bin);
  addWorldPropCollider(spot.x, spot.z, BIN_COLLIDER.hw, BIN_COLLIDER.hd);
}
