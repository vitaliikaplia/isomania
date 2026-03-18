/* ── World Data Generation ── */

function createSeededRandom(initialSeed) {
  let seed = initialSeed;

  return {
    setSeed(nextSeed) {
      seed = nextSeed;
    },
    next() {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed & 0x7fffffff) / 0x7fffffff;
    },
    int(min, max) {
      return min + Math.floor(this.next() * (max - min + 1));
    },
  };
}

function createWorldData() {
  const width = CONFIG.world.width;
  const height = CONFIG.world.height;
  const map = Array.from({ length: height }, () => new Array(width).fill(CONFIG.world.tiles.grass));
  const buildings = [];
  const buildingGroups = [];
  const buildingGroupMap = Array.from({ length: height }, () => new Array(width).fill(-1));
  const random = createSeededRandom(CONFIG.world.seeds.buildings);
  const roads = {
    rows: [...CONFIG.world.roadRows],
    cols: [...CONFIG.world.roadCols],
  };
  const generation = CONFIG.world.generation;
  const tiles = CONFIG.world.tiles;

  function fillRoads() {
    for (const row of roads.rows) {
      for (let c = 0; c < width; c++) {
        map[row][c] = tiles.road;
        map[row + 1][c] = tiles.road;
        if (row > 0 && map[row - 1][c] === tiles.grass) map[row - 1][c] = tiles.sidewalk;
        if (row + 2 < height && map[row + 2][c] === tiles.grass) map[row + 2][c] = tiles.sidewalk;
      }
    }

    for (const col of roads.cols) {
      for (let r = 0; r < height; r++) {
        map[r][col] = tiles.road;
        map[r][col + 1] = tiles.road;
        if (col > 0 && map[r][col - 1] === tiles.grass) map[r][col - 1] = tiles.sidewalk;
        if (col + 2 < width && map[r][col + 2] === tiles.grass) map[r][col + 2] = tiles.sidewalk;
      }
    }
  }

  function canPlace(r, c, w, d, margin) {
    for (let dr = -margin; dr < d + margin; dr++) {
      for (let dc = -margin; dc < w + margin; dc++) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr < 0 || rr >= height || cc < 0 || cc >= width) return false;
        if (map[rr][cc] !== tiles.grass) return false;
      }
    }

    return true;
  }

  function placeBuilding(r, c, w, d) {
    for (let dr = 0; dr < d; dr++) {
      for (let dc = 0; dc < w; dc++) {
        map[r + dr][c + dc] = tiles.building;
      }
    }

    const building = { r, c, w, d };
    buildings.push(building);
    return building;
  }

  function addFence(br, bc, bw, bd, roadSide) {
    const pad = generation.fencePadding;
    const fTop = br - pad;
    const fBot = br + bd + pad - 1;
    const fLeft = bc - pad;
    const fRight = bc + bw + pad - 1;
    const gateC = bc + Math.floor(bw / 2);
    const gateR = br + Math.floor(bd / 2);

    for (let r = fTop; r <= fBot; r++) {
      for (let c = fLeft; c <= fRight; c++) {
        if (r < 0 || r >= height || c < 0 || c >= width) continue;
        if (map[r][c] !== tiles.grass) continue;

        const isEdge = r === fTop || r === fBot || c === fLeft || c === fRight;
        if (!isEdge) continue;

        let isGate = false;
        if (roadSide === 'bottom' && r === fBot && c === gateC) isGate = true;
        if (roadSide === 'top' && r === fTop && c === gateC) isGate = true;
        if (roadSide === 'right' && c === fRight && r === gateR) isGate = true;
        if (roadSide === 'left' && c === fLeft && r === gateR) isGate = true;

        map[r][c] = isGate ? tiles.gate : tiles.fence;
      }
    }
  }

  function placeBuildings() {
    const hBounds = [0, ...roads.rows.map(row => row - 1), height - 1];
    const vBounds = [0, ...roads.cols.map(col => col - 1), width - 1];

    for (let blockRow = 0; blockRow < hBounds.length - 1; blockRow++) {
      for (let blockCol = 0; blockCol < vBounds.length - 1; blockCol++) {
        const blockTop = hBounds[blockRow] + generation.blockInset;
        const blockBottom = hBounds[blockRow + 1] - generation.blockBottomInset;
        const blockLeft = vBounds[blockCol] + generation.blockInset;
        const blockRight = vBounds[blockCol + 1] - generation.blockBottomInset;
        const blockW = blockRight - blockLeft;
        const blockH = blockBottom - blockTop;

        if (blockW < generation.lotWidth || blockH < generation.lotDepth) continue;

        for (
          let col = blockLeft;
          col + 5 <= blockRight;
          col += generation.lotWidth + random.int(0, generation.lotJitterMax)
        ) {
          const bw = random.int(3, 5);
          const bd = random.int(3, 4);
          const br = blockTop + generation.yardSetback;
          const bc = col + random.int(0, 1);

          if (canPlace(br, bc, bw, bd, generation.yardSetback)) {
            const building = placeBuilding(br, bc, bw, bd);
            if (random.next() < generation.fenceChance) addFence(building.r, building.c, building.w, building.d, 'top');
          }
        }

        for (
          let col = blockLeft;
          col + 5 <= blockRight;
          col += generation.lotWidth + random.int(0, generation.lotJitterMax)
        ) {
          const bw = random.int(3, 5);
          const bd = random.int(3, 4);
          const br = blockBottom - generation.yardSetback - bd;
          const bc = col + random.int(0, 1);

          if (canPlace(br, bc, bw, bd, generation.yardSetback)) {
            const building = placeBuilding(br, bc, bw, bd);
            if (random.next() < generation.fenceChance) addFence(building.r, building.c, building.w, building.d, 'bottom');
          }
        }
      }
    }
  }

  function placeTrees() {
    random.setSeed(CONFIG.world.seeds.trees);

    for (let r = 1; r < height - 1; r += 2) {
      for (let c = 1; c < width - 1; c += 2) {
        if (map[r][c] !== tiles.grass) continue;
        if (random.next() >= generation.treeChance) continue;

        const tr = r + random.int(0, 1);
        const tc = c + random.int(0, 1);
        if (tr < height && tc < width && map[tr][tc] === tiles.grass) {
          map[tr][tc] = tiles.tree;
        }
      }
    }
  }

  function placeStructures() {
    random.setSeed(CONFIG.world.seeds.structures);

    for (let r = 2; r < height - 2; r += 3) {
      for (let c = 2; c < width - 2; c += 3) {
        if (map[r][c] !== tiles.grass) continue;
        if (random.next() < generation.structureChance) {
          map[r][c] = tiles.structure;
        }
      }
    }
  }

  function buildBuildingGroups() {
    let groupId = 0;

    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (map[r][c] !== tiles.building || buildingGroupMap[r][c] !== -1) continue;

        const cells = [];
        const queue = [{ r, c }];
        buildingGroupMap[r][c] = groupId;

        while (queue.length) {
          const current = queue.shift();
          cells.push(current);

          for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
            const nr = current.r + dr;
            const nc = current.c + dc;

            if (nr < 0 || nr >= height || nc < 0 || nc >= width) continue;
            if (map[nr][nc] !== tiles.building || buildingGroupMap[nr][nc] !== -1) continue;

            buildingGroupMap[nr][nc] = groupId;
            queue.push({ r: nr, c: nc });
          }
        }

        let minC = width;
        let maxC = 0;
        let minR = height;
        let maxR = 0;

        for (const cell of cells) {
          if (cell.c < minC) minC = cell.c;
          if (cell.c > maxC) maxC = cell.c;
          if (cell.r < minR) minR = cell.r;
          if (cell.r > maxR) maxR = cell.r;
        }

        const w = maxC - minC + 1;
        const d = maxR - minR + 1;
        const area = cells.length;
        const floors = area <= 6 ? (groupId % 3 === 0 ? 2 : 1) : (groupId % 2 === 0 ? 2 : 1);
        const floorH = 1.4 + (groupId % 3) * 0.15;

        buildingGroups.push({
          pal: CONFIG.world.buildingPalettes[groupId % CONFIG.world.buildingPalettes.length],
          h: floors * floorH,
          floors,
          floorH,
          roofType: groupId % 3,
          minC,
          maxC,
          minR,
          maxR,
          w,
          d,
          area,
          cells,
        });

        groupId++;
      }
    }
  }

  fillRoads();
  placeBuildings();
  placeTrees();
  placeStructures();
  buildBuildingGroups();

  return {
    width,
    height,
    map,
    roads,
    tiles,
    buildings,
    buildingGroups,
    buildingGroupMap,
    colliders: CONFIG.world.colliders,
  };
}

const WORLD = createWorldData();
