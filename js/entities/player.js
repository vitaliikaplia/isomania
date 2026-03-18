/* ── Player Mesh ── */
/* PZ-style with pivot groups for proper limb rotation */

const playerGroup = new THREE.Group();
const playerScale = 0.55;

// ── Upper body group (bobs up/down during walk) ──
const upperBody = new THREE.Group();
upperBody.position.y = 0.46;
playerGroup.add(upperBody);

// Torso
const torsoGeo = new THREE.BoxGeometry(0.3, 0.38, 0.16);
const torsoMat = new THREE.MeshLambertMaterial({ color: 0x5A7044 });
const torso = new THREE.Mesh(torsoGeo, torsoMat);
torso.position.y = 0.23;
torso.castShadow = true;
upperBody.add(torso);

// Belt
const beltGeo = new THREE.BoxGeometry(0.32, 0.04, 0.17);
const beltMat = new THREE.MeshLambertMaterial({ color: 0x3A2A1A });
const belt = new THREE.Mesh(beltGeo, beltMat);
belt.position.y = 0.02;
upperBody.add(belt);

// Collar
const collarGeo = new THREE.BoxGeometry(0.22, 0.03, 0.18);
const collarMat = new THREE.MeshLambertMaterial({ color: 0x4A6038 });
const collar = new THREE.Mesh(collarGeo, collarMat);
collar.position.y = 0.43;
upperBody.add(collar);

// Shoulders
const shoulderGeo = new THREE.BoxGeometry(0.38, 0.06, 0.18);
const shoulderMat = new THREE.MeshLambertMaterial({ color: 0x526840 });
const shoulders = new THREE.Mesh(shoulderGeo, shoulderMat);
shoulders.position.y = 0.40;
shoulders.castShadow = true;
upperBody.add(shoulders);

// ── Left arm pivot (at shoulder) ──
const armPivotL = new THREE.Group();
armPivotL.position.set(-0.2, 0.40, 0);
upperBody.add(armPivotL);

const armGeo = new THREE.BoxGeometry(0.1, 0.34, 0.12);
const armMat = new THREE.MeshLambertMaterial({ color: 0x526840 });
const armL = new THREE.Mesh(armGeo, armMat);
armL.position.y = -0.17;
armL.castShadow = true;
armPivotL.add(armL);

const handGeo = new THREE.SphereGeometry(0.04, 6, 6);
const skinMat = new THREE.MeshLambertMaterial({ color: 0xC49A6C });
const handL = new THREE.Mesh(handGeo, skinMat);
handL.position.y = -0.36;
armPivotL.add(handL);

// ── Right arm pivot (at shoulder) ──
const armPivotR = new THREE.Group();
armPivotR.position.set(0.2, 0.40, 0);
upperBody.add(armPivotR);

const armR = new THREE.Mesh(armGeo, armMat);
armR.position.y = -0.17;
armR.castShadow = true;
armPivotR.add(armR);

const handR = new THREE.Mesh(handGeo, skinMat);
handR.position.y = -0.36;
armPivotR.add(handR);

// ── Neck ──
const neckGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.06, 6);
const neckMat = new THREE.MeshLambertMaterial({ color: 0xC49A6C });
const neck = new THREE.Mesh(neckGeo, neckMat);
neck.position.y = 0.47;
upperBody.add(neck);

// ── Head group (for subtle bob) ──
const headGroup = new THREE.Group();
headGroup.position.y = 0.62;
upperBody.add(headGroup);

const headGeo = new THREE.SphereGeometry(0.13, 8, 8);
const headMat = new THREE.MeshLambertMaterial({ color: 0xC49A6C });
const head = new THREE.Mesh(headGeo, headMat);
head.scale.set(1, 1.05, 0.95);
head.castShadow = true;
headGroup.add(head);

// Hair
const hairMat = new THREE.MeshLambertMaterial({ color: 0x3A2A1A });
const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.22), hairMat);
hairTop.position.y = 0.12;
headGroup.add(hairTop);
const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.04), hairMat);
hairBack.position.set(0, 0.03, -0.1);
headGroup.add(hairBack);
const hairSideL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.18), hairMat);
hairSideL.position.set(-0.12, 0.05, 0);
headGroup.add(hairSideL);
const hairSideR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.18), hairMat);
hairSideR.position.set(0.12, 0.05, 0);
headGroup.add(hairSideR);

// Face
const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2A2015 });
const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.01), eyeMat);
eyeL.position.set(-0.045, 0.01, 0.12);
headGroup.add(eyeL);
const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.01), eyeMat);
eyeR.position.set(0.045, 0.01, 0.12);
headGroup.add(eyeR);

const nose = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.02), new THREE.MeshLambertMaterial({ color: 0xB8896A }));
nose.position.set(0, -0.02, 0.125);
headGroup.add(nose);

const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.01), new THREE.MeshBasicMaterial({ color: 0x8A5A4A }));
mouth.position.set(0, -0.055, 0.12);
headGroup.add(mouth);

const earMat = new THREE.MeshLambertMaterial({ color: 0xB88A60 });
const earL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.05), earMat);
earL.position.set(-0.125, 0, 0);
headGroup.add(earL);
const earR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.05), earMat);
earR.position.set(0.125, 0, 0);
headGroup.add(earR);

// ── Left leg pivot (at hip) ──
const legPivotL = new THREE.Group();
legPivotL.position.set(-0.08, 0.46, 0);
playerGroup.add(legPivotL);

const legGeo = new THREE.BoxGeometry(0.13, 0.38, 0.14);
const legMat = new THREE.MeshLambertMaterial({ color: 0x3A4A5C });
const legL = new THREE.Mesh(legGeo, legMat);
legL.position.y = -0.19;
legL.castShadow = true;
legPivotL.add(legL);

const shoeGeo = new THREE.BoxGeometry(0.13, 0.08, 0.2);
const shoeMat = new THREE.MeshLambertMaterial({ color: 0x2A2018 });
const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
shoeL.position.set(0, -0.4, 0.02);
shoeL.castShadow = true;
legPivotL.add(shoeL);

// ── Right leg pivot (at hip) ──
const legPivotR = new THREE.Group();
legPivotR.position.set(0.08, 0.46, 0);
playerGroup.add(legPivotR);

const legR = new THREE.Mesh(legGeo, legMat);
legR.position.y = -0.19;
legR.castShadow = true;
legPivotR.add(legR);

const shoeR = new THREE.Mesh(shoeGeo, shoeMat);
shoeR.position.set(0, -0.4, 0.02);
shoeR.castShadow = true;
legPivotR.add(shoeR);

// ── Shadow blob ──
const shadowGeo = new THREE.CircleGeometry(0.18, 12);
const shadowMeshMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
const shadowMesh = new THREE.Mesh(shadowGeo, shadowMeshMat);
shadowMesh.rotation.x = -Math.PI / 2;
shadowMesh.position.y = 0.01;
playerGroup.add(shadowMesh);

// Apply scale
playerGroup.scale.set(playerScale, playerScale, playerScale);
scene.add(playerGroup);
