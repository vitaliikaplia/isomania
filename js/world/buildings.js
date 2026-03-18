/* ── Buildings ── */

const occludables = [];
const ROOF_COLORS = [0x8B4513, 0x6B3A2A, 0x5C4033, 0x7A5530, 0x4A3628, 0x6E4B3A];

function addWindow(group, x, y, z, rotY) {
  const frameMat = new THREE.MeshLambertMaterial({ color: 0x303030, transparent: true });
  const glassMat = new THREE.MeshBasicMaterial({ color: 0xC8D8E8, transparent: true, opacity: 0.45 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffdc64, transparent: true, opacity: 0.2 });
  const sillMat = new THREE.MeshLambertMaterial({ color: 0x888880, transparent: true });

  const wW = 0.22, wH = 0.32;
  const frameW = 0.03;

  const winGroup = new THREE.Group();
  winGroup.position.set(x, y, z);
  winGroup.rotation.y = rotY;

  // Glass
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(wW, wH), glassMat);
  glass.position.z = 0.001;
  winGroup.add(glass);

  // Warm glow behind glass
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(wW - 0.02, wH - 0.02), glowMat);
  glow.position.z = 0.0005;
  winGroup.add(glow);

  // Frame — 4 sides
  const top = new THREE.Mesh(new THREE.BoxGeometry(wW + frameW * 2, frameW, 0.02), frameMat);
  top.position.set(0, wH / 2 + frameW / 2, 0.005);
  winGroup.add(top);

  const bot = new THREE.Mesh(new THREE.BoxGeometry(wW + frameW * 2, frameW, 0.02), frameMat);
  bot.position.set(0, -wH / 2 - frameW / 2, 0.005);
  winGroup.add(bot);

  const left = new THREE.Mesh(new THREE.BoxGeometry(frameW, wH, 0.02), frameMat);
  left.position.set(-wW / 2 - frameW / 2, 0, 0.005);
  winGroup.add(left);

  const right = new THREE.Mesh(new THREE.BoxGeometry(frameW, wH, 0.02), frameMat);
  right.position.set(wW / 2 + frameW / 2, 0, 0.005);
  winGroup.add(right);

  // Center cross
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.015, wH, 0.015), frameMat);
  crossV.position.z = 0.005;
  winGroup.add(crossV);

  const crossH = new THREE.Mesh(new THREE.BoxGeometry(wW, 0.015, 0.015), frameMat);
  crossH.position.set(0, 0.02, 0.005);
  winGroup.add(crossH);

  // Sill
  const sill = new THREE.Mesh(new THREE.BoxGeometry(wW + frameW * 2 + 0.04, 0.025, 0.04), sillMat);
  sill.position.set(0, -wH / 2 - frameW, 0.015);
  winGroup.add(sill);

  group.add(winGroup);
}

function addGableRoof(group, cx, cz, bw, bd, h, roofCol) {
  const roofMat = new THREE.MeshLambertMaterial({ color: roofCol, transparent: true, side: THREE.DoubleSide });
  const overhang = 0.15;

  // Ridge along longer side
  const ridgeAlongX = bw >= bd;
  const spanW = ridgeAlongX ? bd : bw;
  const spanL = ridgeAlongX ? bw : bd;
  const roofH = 0.4 + spanW * 0.15;
  const hw = spanW / 2 + overhang;
  const hl = spanL / 2 + overhang;

  // Build roof from BufferGeometry — two slopes + two gable triangles
  // All positions relative to (cx, h, cz)
  const vertices = [];
  const indices = [];

  if (ridgeAlongX) {
    // Ridge along X axis
    // 0: front-left-bottom, 1: front-right-bottom, 2: front-ridge-top
    // 3: back-left-bottom, 4: back-right-bottom, 5: back-ridge-top
    vertices.push(
      cx - hl, h, cz - hw,  // 0
      cx - hl, h, cz + hw,  // 1
      cx - hl, h + roofH, cz,  // 2
      cx + hl, h, cz - hw,  // 3
      cx + hl, h, cz + hw,  // 4
      cx + hl, h + roofH, cz   // 5
    );
  } else {
    // Ridge along Z axis
    vertices.push(
      cx - hw, h, cz - hl,  // 0
      cx + hw, h, cz - hl,  // 1
      cx, h + roofH, cz - hl,  // 2
      cx - hw, h, cz + hl,  // 3
      cx + hw, h, cz + hl,  // 4
      cx, h + roofH, cz + hl   // 5
    );
  }

  // Left slope: 0,3,5,2
  indices.push(0, 3, 5, 0, 5, 2);
  // Right slope: 1,2,5,4 -> but need correct winding
  indices.push(1, 2, 5, 1, 5, 4);
  // Front gable triangle: 0,1,2
  indices.push(0, 2, 1);
  // Back gable triangle: 3,4,5
  indices.push(3, 4, 5);

  const roofGeo = new THREE.BufferGeometry();
  roofGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  roofGeo.setIndex(indices);
  roofGeo.computeVertexNormals();

  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  // Ridge cap
  const ridgeGeo = new THREE.BoxGeometry(
    ridgeAlongX ? spanL + overhang * 2 : 0.06,
    0.04,
    ridgeAlongX ? 0.06 : spanL + overhang * 2
  );
  const ridgeMat = new THREE.MeshLambertMaterial({ color: 0x444440, transparent: true });
  const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
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
  const cx = (g.minC + g.maxC) / 2 - MW / 2 + 0.5;
  const cz = (g.minR + g.maxR) / 2 - MH / 2 + 0.5;

  const bldGroup = new THREE.Group();
  bldGroup.userData.occludable = true;

  const topMat = new THREE.MeshLambertMaterial({ color: pal.t, transparent: true });
  const leftMat = new THREE.MeshLambertMaterial({ color: pal.l, transparent: true });
  const rightMat = new THREE.MeshLambertMaterial({ color: pal.r, transparent: true });
  const mats = [rightMat, leftMat, topMat, topMat, rightMat, leftMat];

  // ── Main body ──
  const bld = new THREE.Mesh(new THREE.BoxGeometry(bw - 0.05, h, bd - 0.05), mats);
  bld.position.set(cx, h / 2, cz);
  bld.castShadow = true;
  bld.receiveShadow = true;
  bldGroup.add(bld);

  // ── Floor separator ──
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

  // ── Roof ──
  const roofCol = ROOF_COLORS[i % ROOF_COLORS.length];

  if (g.roofType === 1) {
    // Gable roof
    addGableRoof(bldGroup, cx, cz, bw, bd, h, roofCol);
  } else {
    // Flat roof with parapet
    const roofMat = new THREE.MeshLambertMaterial({ color: roofCol, transparent: true });
    const parMat = new THREE.MeshLambertMaterial({ color: 0x888880, transparent: true });
    // Roof slab
    const slab = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.08, 0.06, bd + 0.08), roofMat);
    slab.position.set(cx, h + 0.03, cz);
    slab.castShadow = true;
    bldGroup.add(slab);
    // Parapet walls
    const parH = 0.12, parW = 0.06;
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

  // ── Windows per floor ──
  for (let f = 0; f < floors; f++) {
    const winY = f * floorH + floorH * 0.55;

    // Side walls (along Z)
    const winCountZ = Math.max(1, Math.floor(bd / 1.2));
    const winSpacingZ = bd / (winCountZ + 1);
    for (let wi = 1; wi <= winCountZ; wi++) {
      const wz = g.minR - MH / 2 + 0.5 + wi * winSpacingZ - 0.5;
      for (const side of [-1, 1]) {
        addWindow(bldGroup, cx + side * (bw / 2), winY, wz, side > 0 ? Math.PI / 2 : -Math.PI / 2);
      }
    }

    // Front/back walls (along X)
    const winCountX = Math.max(1, Math.floor(bw / 1.2));
    const winSpacingX = bw / (winCountX + 1);
    for (let wi = 1; wi <= winCountX; wi++) {
      const wx = g.minC - MW / 2 + 0.5 + wi * winSpacingX - 0.5;
      for (const side of [-1, 1]) {
        // Skip window near door (front wall, ground floor)
        if (f === 0 && side === 1 && Math.abs(wx - cx) < 0.35) continue;
        addWindow(bldGroup, wx, winY, cz + side * (bd / 2), side > 0 ? 0 : Math.PI);
      }
    }
  }

  // ── Door ──
  const doorH = Math.min(0.8, floorH * 0.6);
  const doorMat = new THREE.MeshLambertMaterial({ color: 0x3A2815, transparent: true });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.35, doorH), doorMat);
  door.position.set(cx, doorH / 2, cz + bd / 2 + 0.001);
  bldGroup.add(door);

  // Door frame (top + two sides, no bottom threshold)
  const dfMat = new THREE.MeshLambertMaterial({ color: 0x2A1A10, transparent: true });
  const dfTop = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.035, 0.02), dfMat);
  dfTop.position.set(cx, doorH + 0.015, cz + bd / 2 + 0.005);
  bldGroup.add(dfTop);
  for (const side of [-1, 1]) {
    const dfSide = new THREE.Mesh(new THREE.BoxGeometry(0.03, doorH - 0.05, 0.02), dfMat);
    dfSide.position.set(cx + side * 0.19, (doorH - 0.05) / 2 + 0.05, cz + bd / 2 + 0.005);
    bldGroup.add(dfSide);
  }

  // ── Foundation ──
  const foundMat = new THREE.MeshLambertMaterial({ color: 0x666660, transparent: true });
  const found = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.02, 0.1, bd + 0.02), foundMat);
  found.position.set(cx, 0.05, cz);
  bldGroup.add(found);

  scene.add(bldGroup);
  occludables.push(bldGroup);
}

// ── Fences and gates (type 6, 7) ──
const fenceMat = new THREE.MeshLambertMaterial({ color: 0x8B7355, transparent: true });
const fencePostGeo = new THREE.BoxGeometry(0.06, 0.6, 0.06);
const fenceRailGeo = new THREE.BoxGeometry(0.04, 0.04, 1);
const fenceRailGeoX = new THREE.BoxGeometry(1, 0.04, 0.04);
const gateMat = new THREE.MeshLambertMaterial({ color: 0x6B5B45, transparent: true });

for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) {
  const t = MAP[r][c];
  if (t !== 6 && t !== 7) continue;
  const fx = c - MW / 2 + 0.5;
  const fz = r - MH / 2 + 0.5;

  const fGroup = new THREE.Group();
  fGroup.userData.occludable = true;

  // Fence post
  const post = new THREE.Mesh(fencePostGeo, fenceMat);
  post.position.set(fx, 0.3, fz);
  post.castShadow = true;
  fGroup.add(post);

  // Connect rails to adjacent fence tiles
  // Check right neighbor
  if (c + 1 < MW && (MAP[r][c + 1] === 6 || MAP[r][c + 1] === 7)) {
    const railTop = new THREE.Mesh(fenceRailGeoX, fenceMat);
    railTop.position.set(fx + 0.5, 0.5, fz);
    fGroup.add(railTop);
    const railBot = new THREE.Mesh(fenceRailGeoX, fenceMat);
    railBot.position.set(fx + 0.5, 0.2, fz);
    fGroup.add(railBot);
  }
  // Check bottom neighbor
  if (r + 1 < MH && (MAP[r + 1][c] === 6 || MAP[r + 1][c] === 7)) {
    const railTop = new THREE.Mesh(fenceRailGeo, fenceMat);
    railTop.position.set(fx, 0.5, fz + 0.5);
    fGroup.add(railTop);
    const railBot = new THREE.Mesh(fenceRailGeo, fenceMat);
    railBot.position.set(fx, 0.2, fz + 0.5);
    fGroup.add(railBot);
  }

  // Gate marker — slightly different look
  if (t === 7) {
    const gateTop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), gateMat);
    gateTop.position.set(fx, 0.64, fz);
    fGroup.add(gateTop);
  }

  scene.add(fGroup);
  occludables.push(fGroup);
}

// ── Small structures (type 3) ──
const smallPals = [0x8B7355, 0x6B6B6B, 0x7A6040, 0x556B55];
for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) {
  if (MAP[r][c] !== 3) continue;
  const sx = c - MW / 2 + 0.5;
  const sz = r - MH / 2 + 0.5;
  const sh = 0.35 + ((c * 7 + r * 3) % 5) * 0.06;
  const col = smallPals[(c * 7 + r * 3) % smallPals.length];

  const sGroup = new THREE.Group();
  sGroup.userData.occludable = true;
  const sMat = new THREE.MeshLambertMaterial({ color: col, transparent: true });
  const sMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, sh, 0.45), sMat);
  sMesh.position.set(sx, sh / 2, sz);
  sMesh.castShadow = true;
  sMesh.receiveShadow = true;
  sGroup.add(sMesh);
  scene.add(sGroup);
  occludables.push(sGroup);
}
