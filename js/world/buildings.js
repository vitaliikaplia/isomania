/* ── Buildings ── */

const ROOF_COLORS = CONFIG.world.roofColors;
const SMALL_STRUCTURE_COLORS = CONFIG.world.smallStructureColors;
const BUILDING_TILE = WORLD.tiles;
const WINDOW_FRAME_MAT = new THREE.MeshLambertMaterial({ color: 0x303030, transparent: true });
const WINDOW_GLASS_MAT = new THREE.MeshBasicMaterial({ color: 0xC8D8E8, transparent: true, opacity: 0.45 });
const WINDOW_GLOW_MAT = new THREE.MeshBasicMaterial({ color: 0xffdc64, transparent: true, opacity: 0.2 });
const WINDOW_SILL_MAT = new THREE.MeshLambertMaterial({ color: 0x888880, transparent: true });
const WINDOW_SIZE = { width: 0.22, height: 0.32, frame: 0.03 };
const WINDOW_GEOMETRIES = {
  glass: new THREE.PlaneGeometry(WINDOW_SIZE.width, WINDOW_SIZE.height),
  glow: new THREE.PlaneGeometry(WINDOW_SIZE.width - 0.02, WINDOW_SIZE.height - 0.02),
  top: new THREE.BoxGeometry(WINDOW_SIZE.width + WINDOW_SIZE.frame * 2, WINDOW_SIZE.frame, 0.02),
  side: new THREE.BoxGeometry(WINDOW_SIZE.frame, WINDOW_SIZE.height, 0.02),
  crossV: new THREE.BoxGeometry(0.015, WINDOW_SIZE.height, 0.015),
  crossH: new THREE.BoxGeometry(WINDOW_SIZE.width, 0.015, 0.015),
  sill: new THREE.BoxGeometry(WINDOW_SIZE.width + WINDOW_SIZE.frame * 2 + 0.04, 0.025, 0.04),
};

function addWindow(group, x, y, z, rotY) {
  const winGroup = new THREE.Group();
  winGroup.position.set(x, y, z);
  winGroup.rotation.y = rotY;

  const glass = new THREE.Mesh(WINDOW_GEOMETRIES.glass, WINDOW_GLASS_MAT);
  glass.position.z = 0.001;
  winGroup.add(glass);

  const glow = new THREE.Mesh(WINDOW_GEOMETRIES.glow, WINDOW_GLOW_MAT);
  glow.position.z = 0.0005;
  winGroup.add(glow);

  const top = new THREE.Mesh(WINDOW_GEOMETRIES.top, WINDOW_FRAME_MAT);
  top.position.set(0, WINDOW_SIZE.height / 2 + WINDOW_SIZE.frame / 2, 0.005);
  winGroup.add(top);

  const bot = new THREE.Mesh(WINDOW_GEOMETRIES.top, WINDOW_FRAME_MAT);
  bot.position.set(0, -WINDOW_SIZE.height / 2 - WINDOW_SIZE.frame / 2, 0.005);
  winGroup.add(bot);

  const left = new THREE.Mesh(WINDOW_GEOMETRIES.side, WINDOW_FRAME_MAT);
  left.position.set(-WINDOW_SIZE.width / 2 - WINDOW_SIZE.frame / 2, 0, 0.005);
  winGroup.add(left);

  const right = new THREE.Mesh(WINDOW_GEOMETRIES.side, WINDOW_FRAME_MAT);
  right.position.set(WINDOW_SIZE.width / 2 + WINDOW_SIZE.frame / 2, 0, 0.005);
  winGroup.add(right);

  const crossV = new THREE.Mesh(WINDOW_GEOMETRIES.crossV, WINDOW_FRAME_MAT);
  crossV.position.z = 0.005;
  winGroup.add(crossV);

  const crossH = new THREE.Mesh(WINDOW_GEOMETRIES.crossH, WINDOW_FRAME_MAT);
  crossH.position.set(0, 0.02, 0.005);
  winGroup.add(crossH);

  const sill = new THREE.Mesh(WINDOW_GEOMETRIES.sill, WINDOW_SILL_MAT);
  sill.position.set(0, -WINDOW_SIZE.height / 2 - WINDOW_SIZE.frame, 0.015);
  winGroup.add(sill);

  group.add(winGroup);
}

function addGableRoof(group, cx, cz, bw, bd, h, roofCol) {
  const roofMat = new THREE.MeshLambertMaterial({ color: roofCol, transparent: true, side: THREE.DoubleSide });
  const overhang = 0.15;
  const ridgeAlongX = bw >= bd;
  const spanW = ridgeAlongX ? bd : bw;
  const spanL = ridgeAlongX ? bw : bd;
  const roofH = 0.4 + spanW * 0.15;
  const hw = spanW / 2 + overhang;
  const hl = spanL / 2 + overhang;
  const vertices = [];
  const indices = [];

  if (ridgeAlongX) {
    vertices.push(
      cx - hl, h, cz - hw,
      cx - hl, h, cz + hw,
      cx - hl, h + roofH, cz,
      cx + hl, h, cz - hw,
      cx + hl, h, cz + hw,
      cx + hl, h + roofH, cz
    );
  } else {
    vertices.push(
      cx - hw, h, cz - hl,
      cx + hw, h, cz - hl,
      cx, h + roofH, cz - hl,
      cx - hw, h, cz + hl,
      cx + hw, h, cz + hl,
      cx, h + roofH, cz + hl
    );
  }

  indices.push(0, 3, 5, 0, 5, 2);
  indices.push(1, 2, 5, 1, 5, 4);
  indices.push(0, 2, 1);
  indices.push(3, 4, 5);

  const roofGeo = new THREE.BufferGeometry();
  roofGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  roofGeo.setIndex(indices);
  roofGeo.computeVertexNormals();

  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  const ridgeGeo = new THREE.BoxGeometry(
    ridgeAlongX ? spanL + overhang * 2 : 0.06,
    0.04,
    ridgeAlongX ? 0.06 : spanL + overhang * 2
  );
  const ridge = new THREE.Mesh(ridgeGeo, new THREE.MeshLambertMaterial({ color: 0x444440, transparent: true }));
  ridge.position.set(cx, h + roofH, cz);
  group.add(ridge);
}

for (let i = 0; i < gInfo.length; i++) {
  const g = gInfo[i];
  const pal = g.pal;
  const h = g.h;
  const bw = g.w;
  const bd = g.d;
  const floors = g.floors;
  const floorH = g.floorH;
  const cx = worldXFromCol((g.minC + g.maxC) / 2);
  const cz = worldZFromRow((g.minR + g.maxR) / 2);
  const bldGroup = new THREE.Group();

  const topMat = new THREE.MeshLambertMaterial({ color: pal.t, transparent: true });
  const leftMat = new THREE.MeshLambertMaterial({ color: pal.l, transparent: true });
  const rightMat = new THREE.MeshLambertMaterial({ color: pal.r, transparent: true });
  const mats = [rightMat, leftMat, topMat, topMat, rightMat, leftMat];

  const bld = new THREE.Mesh(new THREE.BoxGeometry(bw - 0.05, h, bd - 0.05), mats);
  bld.position.set(cx, h / 2, cz);
  bld.castShadow = true;
  bld.receiveShadow = true;
  bldGroup.add(bld);

  if (floors === 2) {
    const sepMat = new THREE.MeshLambertMaterial({ color: pal.l, transparent: true });
    for (const side of [-1, 1]) {
      const sep = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, bd - 0.03), sepMat);
      sep.position.set(cx + side * (bw / 2 - 0.01), floorH, cz);
      bldGroup.add(sep);
    }
    for (const side of [-1, 1]) {
      const sep = new THREE.Mesh(new THREE.BoxGeometry(bw - 0.03, 0.05, 0.02), sepMat);
      sep.position.set(cx, floorH, cz + side * (bd / 2 - 0.01));
      bldGroup.add(sep);
    }
  }

  const roofCol = ROOF_COLORS[i % ROOF_COLORS.length];
  if (g.roofType === 1) {
    addGableRoof(bldGroup, cx, cz, bw, bd, h, roofCol);
  } else {
    const roofMat = new THREE.MeshLambertMaterial({ color: roofCol, transparent: true });
    const parMat = new THREE.MeshLambertMaterial({ color: 0x888880, transparent: true });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.08, 0.06, bd + 0.08), roofMat);
    slab.position.set(cx, h + 0.03, cz);
    slab.castShadow = true;
    bldGroup.add(slab);

    const parH = 0.12;
    const parW = 0.06;
    const parFB = new THREE.BoxGeometry(bw + 0.08, parH, parW);
    const parLR = new THREE.BoxGeometry(parW, parH, bd + 0.08);
    for (const side of [-1, 1]) {
      const pf = new THREE.Mesh(parFB, parMat);
      pf.position.set(cx, h + 0.06 + parH / 2, cz + side * (bd / 2 + 0.04 - parW / 2));
      bldGroup.add(pf);

      const pl = new THREE.Mesh(parLR, parMat);
      pl.position.set(cx + side * (bw / 2 + 0.04 - parW / 2), h + 0.06 + parH / 2, cz);
      bldGroup.add(pl);
    }
  }

  for (let f = 0; f < floors; f++) {
    const winY = f * floorH + floorH * 0.55;
    const winCountZ = Math.max(1, Math.floor(bd / 1.2));
    const winSpacingZ = bd / (winCountZ + 1);

    for (let wi = 1; wi <= winCountZ; wi++) {
      const wz = worldZFromRow(g.minR) + wi * winSpacingZ - 0.5;
      for (const side of [-1, 1]) {
        addWindow(bldGroup, cx + side * (bw / 2), winY, wz, side > 0 ? Math.PI / 2 : -Math.PI / 2);
      }
    }

    const winCountX = Math.max(1, Math.floor(bw / 1.2));
    const winSpacingX = bw / (winCountX + 1);
    for (let wi = 1; wi <= winCountX; wi++) {
      const wx = worldXFromCol(g.minC) + wi * winSpacingX - 0.5;
      for (const side of [-1, 1]) {
        if (f === 0 && side === 1 && Math.abs(wx - cx) < 0.35) continue;
        addWindow(bldGroup, wx, winY, cz + side * (bd / 2), side > 0 ? 0 : Math.PI);
      }
    }
  }

  const doorH = Math.min(0.8, floorH * 0.6);
  const doorMat = new THREE.MeshLambertMaterial({ color: 0x3A2815, transparent: true });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.35, doorH), doorMat);
  door.position.set(cx, doorH / 2, cz + bd / 2 + 0.001);
  bldGroup.add(door);

  const dfMat = new THREE.MeshLambertMaterial({ color: 0x2A1A10, transparent: true });
  const dfTop = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.035, 0.02), dfMat);
  dfTop.position.set(cx, doorH + 0.015, cz + bd / 2 + 0.005);
  bldGroup.add(dfTop);

  for (const side of [-1, 1]) {
    const dfSide = new THREE.Mesh(new THREE.BoxGeometry(0.03, doorH - 0.05, 0.02), dfMat);
    dfSide.position.set(cx + side * 0.19, (doorH - 0.05) / 2 + 0.05, cz + bd / 2 + 0.005);
    bldGroup.add(dfSide);
  }

  const foundMat = new THREE.MeshLambertMaterial({ color: 0x666660, transparent: true });
  const found = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.02, 0.1, bd + 0.02), foundMat);
  found.position.set(cx, 0.05, cz);
  bldGroup.add(found);

  scene.add(bldGroup);
  registerOccludable(bldGroup);
}

/* ── Fences and gates (type 6, 7) ── */
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

/* ── Small structures (type 3) ── */
for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) {
  if (MAP[r][c] !== BUILDING_TILE.structure) continue;

  const sx = worldXFromCol(c);
  const sz = worldZFromRow(r);
  const sh = 0.35 + ((c * 7 + r * 3) % 5) * 0.06;
  const col = SMALL_STRUCTURE_COLORS[(c * 7 + r * 3) % SMALL_STRUCTURE_COLORS.length];
  const sGroup = new THREE.Group();
  const sMat = new THREE.MeshLambertMaterial({ color: col, transparent: true });
  const sMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, sh, 0.45), sMat);
  sMesh.position.set(sx, sh / 2, sz);
  sMesh.castShadow = true;
  sMesh.receiveShadow = true;
  sGroup.add(sMesh);
  scene.add(sGroup);
  registerOccludable(sGroup);
}
