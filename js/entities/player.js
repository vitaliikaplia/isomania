/* ── Player Mesh ── */
/* Shared rig factory for in-game player and start-screen preview. */

const playerScale = CONFIG.player.scale;
const PLAYER_STYLE_OPTIONS = CONFIG.ui.startScreen.appearance;
const PLAYER_STYLE_STATE = {
  hair: 0,
  shirt: 0,
  pants: 0,
  shoes: 0,
};
const PLAYER_STYLE_TARGETS = {
  hair: [],
  shirt: [],
  pants: [],
  shoes: [],
};

function registerStyleMaterial(part, material) {
  if (!PLAYER_STYLE_TARGETS[part]) return material;
  PLAYER_STYLE_TARGETS[part].push(material);
  return material;
}

function createStyleMaterial(part, fallbackColor) {
  const palette = PLAYER_STYLE_OPTIONS[part];
  const color = palette ? palette[PLAYER_STYLE_STATE[part]] : fallbackColor;
  return registerStyleMaterial(part, new THREE.MeshLambertMaterial({ color }));
}

function applyPlayerAppearance() {
  for (const part in PLAYER_STYLE_TARGETS) {
    const color = PLAYER_STYLE_OPTIONS[part][PLAYER_STYLE_STATE[part]];
    for (const material of PLAYER_STYLE_TARGETS[part]) {
      material.color.setHex(color);
    }
  }
}

function cyclePlayerAppearance(part, direction) {
  const palette = PLAYER_STYLE_OPTIONS[part];
  if (!palette || palette.length === 0) return PLAYER_STYLE_STATE[part];

  const total = palette.length;
  PLAYER_STYLE_STATE[part] = (PLAYER_STYLE_STATE[part] + direction + total) % total;
  applyPlayerAppearance();
  return PLAYER_STYLE_STATE[part];
}

function getPlayerAppearanceColor(part) {
  return PLAYER_STYLE_OPTIONS[part][PLAYER_STYLE_STATE[part]];
}

function createPlayerRig() {
  const group = new THREE.Group();

  const upperBody = new THREE.Group();
  upperBody.position.y = 0.46;
  group.add(upperBody);

  const torsoGeo = new THREE.BoxGeometry(0.3, 0.38, 0.16);
  const torso = new THREE.Mesh(torsoGeo, createStyleMaterial('shirt', 0x5A7044));
  torso.position.y = 0.23;
  torso.castShadow = true;
  upperBody.add(torso);

  const beltGeo = new THREE.BoxGeometry(0.32, 0.04, 0.17);
  const belt = new THREE.Mesh(beltGeo, new THREE.MeshLambertMaterial({ color: 0x3A2A1A }));
  belt.position.y = 0.02;
  upperBody.add(belt);

  const collarGeo = new THREE.BoxGeometry(0.22, 0.03, 0.18);
  const collar = new THREE.Mesh(collarGeo, createStyleMaterial('shirt', 0x4A6038));
  collar.position.y = 0.43;
  upperBody.add(collar);

  const shoulderGeo = new THREE.BoxGeometry(0.38, 0.06, 0.18);
  const shoulders = new THREE.Mesh(shoulderGeo, createStyleMaterial('shirt', 0x526840));
  shoulders.position.y = 0.40;
  shoulders.castShadow = true;
  upperBody.add(shoulders);

  const armGeo = new THREE.BoxGeometry(0.1, 0.34, 0.12);
  const handGeo = new THREE.SphereGeometry(0.04, 6, 6);
  const skinMat = new THREE.MeshLambertMaterial({ color: 0xC49A6C });

  const armPivotL = new THREE.Group();
  armPivotL.position.set(-0.2, 0.40, 0);
  upperBody.add(armPivotL);

  const armL = new THREE.Mesh(armGeo, createStyleMaterial('shirt', 0x526840));
  armL.position.y = -0.17;
  armL.castShadow = true;
  armPivotL.add(armL);

  const handL = new THREE.Mesh(handGeo, skinMat);
  handL.position.y = -0.36;
  armPivotL.add(handL);

  const armPivotR = new THREE.Group();
  armPivotR.position.set(0.2, 0.40, 0);
  upperBody.add(armPivotR);

  const armR = new THREE.Mesh(armGeo, createStyleMaterial('shirt', 0x526840));
  armR.position.y = -0.17;
  armR.castShadow = true;
  armPivotR.add(armR);

  const handR = new THREE.Mesh(handGeo, skinMat);
  handR.position.y = -0.36;
  armPivotR.add(handR);

  const neckGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.06, 6);
  const neck = new THREE.Mesh(neckGeo, new THREE.MeshLambertMaterial({ color: 0xC49A6C }));
  neck.position.y = 0.47;
  upperBody.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.y = 0.62;
  upperBody.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.13, 8, 8);
  const headMat = new THREE.MeshLambertMaterial({ color: 0xC49A6C });
  const head = new THREE.Mesh(headGeo, headMat);
  head.scale.set(1, 1.05, 0.95);
  head.castShadow = true;
  headGroup.add(head);

  const hairTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.06, 0.22),
    createStyleMaterial('hair', 0x3A2A1A)
  );
  hairTop.position.y = 0.12;
  headGroup.add(hairTop);

  const hairBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.16, 0.04),
    createStyleMaterial('hair', 0x3A2A1A)
  );
  hairBack.position.set(0, 0.03, -0.1);
  headGroup.add(hairBack);

  const hairSideL = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.1, 0.18),
    createStyleMaterial('hair', 0x3A2A1A)
  );
  hairSideL.position.set(-0.12, 0.05, 0);
  headGroup.add(hairSideL);

  const hairSideR = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.1, 0.18),
    createStyleMaterial('hair', 0x3A2A1A)
  );
  hairSideR.position.set(0.12, 0.05, 0);
  headGroup.add(hairSideR);

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2A2015 });
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.01), eyeMat);
  eyeL.position.set(-0.045, 0.01, 0.12);
  headGroup.add(eyeL);

  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.01), eyeMat);
  eyeR.position.set(0.045, 0.01, 0.12);
  headGroup.add(eyeR);

  const nose = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.03, 0.02),
    new THREE.MeshLambertMaterial({ color: 0xB8896A })
  );
  nose.position.set(0, -0.02, 0.125);
  headGroup.add(nose);

  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.01, 0.01),
    new THREE.MeshBasicMaterial({ color: 0x8A5A4A })
  );
  mouth.position.set(0, -0.055, 0.12);
  headGroup.add(mouth);

  const earMat = new THREE.MeshLambertMaterial({ color: 0xB88A60 });
  const earL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.05), earMat);
  earL.position.set(-0.125, 0, 0);
  headGroup.add(earL);

  const earR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.05), earMat);
  earR.position.set(0.125, 0, 0);
  headGroup.add(earR);

  const thighGeo = new THREE.BoxGeometry(0.13, 0.22, 0.14);
  const shinGeo = new THREE.BoxGeometry(0.12, 0.2, 0.13);
  const kneeCapGeo = new THREE.BoxGeometry(0.125, 0.05, 0.145);
  const ankleGeo = new THREE.BoxGeometry(0.115, 0.05, 0.12);
  const shoeGeo = new THREE.BoxGeometry(0.13, 0.08, 0.2);
  const soleGeo = new THREE.BoxGeometry(0.14, 0.025, 0.22);

  function createLeg(sideX) {
    const legPivot = new THREE.Group();
    legPivot.position.set(sideX, 0.46, 0);
    group.add(legPivot);

    const thigh = new THREE.Mesh(thighGeo, createStyleMaterial('pants', 0x3A4A5C));
    thigh.position.y = -0.11;
    thigh.castShadow = true;
    legPivot.add(thigh);

    const kneePivot = new THREE.Group();
    kneePivot.position.y = -0.22;
    legPivot.add(kneePivot);

    const kneeCap = new THREE.Mesh(kneeCapGeo, createStyleMaterial('pants', 0x3A4A5C));
    kneeCap.position.y = -0.01;
    kneeCap.castShadow = true;
    kneePivot.add(kneeCap);

    const shin = new THREE.Mesh(shinGeo, createStyleMaterial('pants', 0x3A4A5C));
    shin.position.y = -0.12;
    shin.castShadow = true;
    kneePivot.add(shin);

    const anklePivot = new THREE.Group();
    anklePivot.position.y = -0.22;
    kneePivot.add(anklePivot);

    const ankle = new THREE.Mesh(ankleGeo, createStyleMaterial('pants', 0x3A4A5C));
    ankle.position.y = 0.015;
    ankle.castShadow = true;
    anklePivot.add(ankle);

    const shoe = new THREE.Mesh(shoeGeo, createStyleMaterial('shoes', 0x2A2018));
    shoe.position.set(0, -0.03, 0.03);
    shoe.castShadow = true;
    anklePivot.add(shoe);

    const sole = new THREE.Mesh(soleGeo, createStyleMaterial('shoes', 0x16120f));
    sole.position.set(0, -0.07, 0.03);
    anklePivot.add(sole);

    return { legPivot, kneePivot, anklePivot };
  }

  const leftLeg = createLeg(-0.08);
  const rightLeg = createLeg(0.08);

  const shadowGeo = new THREE.CircleGeometry(0.18, 12);
  const shadowMesh = new THREE.Mesh(
    shadowGeo,
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 })
  );
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = CONFIG.player.shadowLocalY;
  group.add(shadowMesh);

  group.scale.set(playerScale, playerScale, playerScale);

  return {
    group,
    upperBody,
    headGroup,
    armPivotL,
    armPivotR,
    legPivotL: leftLeg.legPivot,
    legPivotR: rightLeg.legPivot,
    kneePivotL: leftLeg.kneePivot,
    kneePivotR: rightLeg.kneePivot,
    anklePivotL: leftLeg.anklePivot,
    anklePivotR: rightLeg.anklePivot,
  };
}

const MAIN_PLAYER_RIG = createPlayerRig();
const playerGroup = MAIN_PLAYER_RIG.group;
const upperBody = MAIN_PLAYER_RIG.upperBody;
const headGroup = MAIN_PLAYER_RIG.headGroup;
const armPivotL = MAIN_PLAYER_RIG.armPivotL;
const armPivotR = MAIN_PLAYER_RIG.armPivotR;
const legPivotL = MAIN_PLAYER_RIG.legPivotL;
const legPivotR = MAIN_PLAYER_RIG.legPivotR;
const kneePivotL = MAIN_PLAYER_RIG.kneePivotL;
const kneePivotR = MAIN_PLAYER_RIG.kneePivotR;
const anklePivotL = MAIN_PLAYER_RIG.anklePivotL;
const anklePivotR = MAIN_PLAYER_RIG.anklePivotR;

scene.add(playerGroup);
applyPlayerAppearance();
