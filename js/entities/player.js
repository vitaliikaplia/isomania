/* ── Player Mesh ── */
/* PZ-style: adult proportions, muted colors, minimal face */
/* Mostly box shapes with slight rounding on head/hands only */

const playerGroup = new THREE.Group();
const playerScale = 0.55;

// ── Shoes ──
const shoeGeo = new THREE.BoxGeometry(0.13, 0.08, 0.2);
const shoeMat = new THREE.MeshLambertMaterial({ color: 0x2A2018 });
const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
shoeL.position.set(-0.08, 0.04, 0.02);
shoeL.castShadow = true;
playerGroup.add(shoeL);
const shoeR = new THREE.Mesh(shoeGeo, shoeMat);
shoeR.position.set(0.08, 0.04, 0.02);
shoeR.castShadow = true;
playerGroup.add(shoeR);

// ── Legs (jeans) ──
const legGeo = new THREE.BoxGeometry(0.13, 0.38, 0.14);
const legMat = new THREE.MeshLambertMaterial({ color: 0x3A4A5C });
const legL = new THREE.Mesh(legGeo, legMat);
legL.position.set(-0.08, 0.27, 0);
legL.castShadow = true;
playerGroup.add(legL);
const legR = new THREE.Mesh(legGeo, legMat);
legR.position.set(0.08, 0.27, 0);
legR.castShadow = true;
playerGroup.add(legR);

// ── Belt ──
const beltGeo = new THREE.BoxGeometry(0.32, 0.04, 0.17);
const beltMat = new THREE.MeshLambertMaterial({ color: 0x3A2A1A });
const belt = new THREE.Mesh(beltGeo, beltMat);
belt.position.y = 0.48;
playerGroup.add(belt);

// ── Torso (shirt) ──
const torsoGeo = new THREE.BoxGeometry(0.3, 0.38, 0.16);
const torsoMat = new THREE.MeshLambertMaterial({ color: 0x5A7044 });
const torso = new THREE.Mesh(torsoGeo, torsoMat);
torso.position.y = 0.69;
torso.castShadow = true;
playerGroup.add(torso);

// ── Collar ──
const collarGeo = new THREE.BoxGeometry(0.22, 0.03, 0.18);
const collarMat = new THREE.MeshLambertMaterial({ color: 0x4A6038 });
const collar = new THREE.Mesh(collarGeo, collarMat);
collar.position.y = 0.89;
playerGroup.add(collar);

// ── Shoulders ──
const shoulderGeo = new THREE.BoxGeometry(0.38, 0.06, 0.18);
const shoulderMat = new THREE.MeshLambertMaterial({ color: 0x526840 });
const shoulders = new THREE.Mesh(shoulderGeo, shoulderMat);
shoulders.position.y = 0.86;
shoulders.castShadow = true;
playerGroup.add(shoulders);

// ── Arms ──
const armGeo = new THREE.BoxGeometry(0.1, 0.34, 0.12);
const armMat = new THREE.MeshLambertMaterial({ color: 0x526840 });
const armL = new THREE.Mesh(armGeo, armMat);
armL.position.set(-0.2, 0.68, 0);
armL.castShadow = true;
playerGroup.add(armL);
const armR = new THREE.Mesh(armGeo, armMat);
armR.position.set(0.2, 0.68, 0);
armR.castShadow = true;
playerGroup.add(armR);

// ── Hands (slight rounding — spheres) ──
const handGeo = new THREE.SphereGeometry(0.04, 6, 6);
const skinMat = new THREE.MeshLambertMaterial({ color: 0xC49A6C });
const handL = new THREE.Mesh(handGeo, skinMat);
handL.position.set(-0.2, 0.49, 0);
playerGroup.add(handL);
const handR = new THREE.Mesh(handGeo, skinMat);
handR.position.set(0.2, 0.49, 0);
playerGroup.add(handR);

// ── Neck ──
const neckGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.06, 6);
const neckMat = new THREE.MeshLambertMaterial({ color: 0xC49A6C });
const neck = new THREE.Mesh(neckGeo, neckMat);
neck.position.y = 0.93;
playerGroup.add(neck);

// ── Head (slight rounding — sphere, not box) ──
const headGeo = new THREE.SphereGeometry(0.13, 8, 8);
const headMat = new THREE.MeshLambertMaterial({ color: 0xC49A6C });
const head = new THREE.Mesh(headGeo, headMat);
head.position.y = 1.08;
head.scale.set(1, 1.05, 0.95);
head.castShadow = true;
playerGroup.add(head);

// ── Hair ──
const hairMat = new THREE.MeshLambertMaterial({ color: 0x3A2A1A });
const hairTopGeo = new THREE.BoxGeometry(0.24, 0.06, 0.22);
const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
hairTop.position.y = 1.2;
playerGroup.add(hairTop);

const hairBackGeo = new THREE.BoxGeometry(0.24, 0.16, 0.04);
const hairBack = new THREE.Mesh(hairBackGeo, hairMat);
hairBack.position.set(0, 1.11, -0.1);
playerGroup.add(hairBack);

const hairSideGeo = new THREE.BoxGeometry(0.03, 0.1, 0.18);
const hairSideL = new THREE.Mesh(hairSideGeo, hairMat);
hairSideL.position.set(-0.12, 1.13, 0);
playerGroup.add(hairSideL);
const hairSideR = new THREE.Mesh(hairSideGeo, hairMat);
hairSideR.position.set(0.12, 1.13, 0);
playerGroup.add(hairSideR);

// ── Face (minimal PZ-style) ──
const eyeGeo = new THREE.BoxGeometry(0.035, 0.025, 0.01);
const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2A2015 });
const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
eyeL.position.set(-0.045, 1.09, 0.12);
playerGroup.add(eyeL);
const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
eyeR.position.set(0.045, 1.09, 0.12);
playerGroup.add(eyeR);

// Nose — subtle
const noseGeo = new THREE.BoxGeometry(0.03, 0.03, 0.02);
const noseMat = new THREE.MeshLambertMaterial({ color: 0xB8896A });
const nose = new THREE.Mesh(noseGeo, noseMat);
nose.position.set(0, 1.06, 0.125);
playerGroup.add(nose);

// Mouth
const mouthGeo = new THREE.BoxGeometry(0.06, 0.01, 0.01);
const mouthMat = new THREE.MeshBasicMaterial({ color: 0x8A5A4A });
const mouth = new THREE.Mesh(mouthGeo, mouthMat);
mouth.position.set(0, 1.025, 0.12);
playerGroup.add(mouth);

// Ears
const earGeo = new THREE.BoxGeometry(0.03, 0.06, 0.05);
const earMat = new THREE.MeshLambertMaterial({ color: 0xB88A60 });
const earL = new THREE.Mesh(earGeo, earMat);
earL.position.set(-0.125, 1.08, 0);
playerGroup.add(earL);
const earR = new THREE.Mesh(earGeo, earMat);
earR.position.set(0.125, 1.08, 0);
playerGroup.add(earR);

// ── Shadow blob ──
const shadowGeo = new THREE.CircleGeometry(0.18, 12);
const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
shadowMesh.rotation.x = -Math.PI / 2;
shadowMesh.position.y = 0.01;
playerGroup.add(shadowMesh);

// Apply scale
playerGroup.scale.set(playerScale, playerScale, playerScale);

scene.add(playerGroup);
