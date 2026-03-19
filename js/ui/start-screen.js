/* ── Start Screen Experience ── */

const START_SCREEN_CFG = CONFIG.ui.startScreen;
const START_SCREEN_ANIM = START_SCREEN_CFG.animation;
const START_SCREEN = {
  initialized: false,
  previewScene: null,
  previewCamera: null,
  previewRenderer: null,
  previewRig: null,
  previewTime: 0,
  previewRoot: document.getElementById('loader-preview-stage'),
  music: null,
  musicStarted: false,
  musicUnlocked: false,
  musicDisabled: false,
  musicRequestId: 0,
  swatches: {},
  pointerTargetX: 0,
  pointerTargetY: 0,
  pointerX: 0,
  pointerY: 0,
  bodyLookX: 0,
  bodyLookY: 0,
};

function updateAppearanceUI() {
  for (const part in START_SCREEN.swatches) {
    START_SCREEN.swatches[part].style.background = `#${getPlayerAppearanceColor(part).toString(16).padStart(6, '0')}`;
  }
}

function cycleAppearanceFromControl(part, direction) {
  cyclePlayerAppearance(part, direction);
  updateAppearanceUI();
}

function bindAppearanceControls() {
  const buttons = document.querySelectorAll('[data-style-key][data-style-dir]');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      cycleAppearanceFromControl(
        button.getAttribute('data-style-key'),
        Number(button.getAttribute('data-style-dir'))
      );
    });
  });

  document.querySelectorAll('[data-style-swatch]').forEach(swatch => {
    START_SCREEN.swatches[swatch.getAttribute('data-style-swatch')] = swatch;
  });

  updateAppearanceUI();
}

function resizeStartScreenPreview() {
  if (!START_SCREEN.previewRenderer || !START_SCREEN.previewRoot) return;

  const bounds = START_SCREEN.previewRoot.getBoundingClientRect();
  const width = Math.max(240, Math.floor(bounds.width));
  const height = Math.max(300, Math.floor(bounds.height));
  START_SCREEN.previewRenderer.setSize(width, height, false);
  START_SCREEN.previewCamera.aspect = width / height;
  START_SCREEN.previewCamera.updateProjectionMatrix();
}

function bindStartScreenPointer() {
  document.addEventListener('pointermove', event => {
    const nx = (event.clientX / window.innerWidth) * 2 - 1;
    const ny = (event.clientY / window.innerHeight) * 2 - 1;
    START_SCREEN.pointerTargetX = Math.max(-1, Math.min(1, nx));
    START_SCREEN.pointerTargetY = Math.max(-1, Math.min(1, ny));
  });

  document.addEventListener('pointerleave', () => {
    START_SCREEN.pointerTargetX = 0;
    START_SCREEN.pointerTargetY = 0;
  });
}

function initStartScreenPreview() {
  if (!START_SCREEN.previewRoot || START_SCREEN.previewRenderer) return;

  const previewScene = new THREE.Scene();
  const previewCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  previewCamera.position.set(0, 0.85, 3.6);
  previewCamera.lookAt(0, 0.95, 0);

  const previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  previewRenderer.domElement.className = 'loader-preview-canvas';
  START_SCREEN.previewRoot.appendChild(previewRenderer.domElement);

  const amb = new THREE.AmbientLight(0xf0eee4, 1.2);
  previewScene.add(amb);

  const keyLight = new THREE.DirectionalLight(0xfff3d6, 1.25);
  keyLight.position.set(3.5, 4.2, 2.4);
  previewScene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x87b5ff, 0.65);
  rimLight.position.set(-2.2, 2.4, -3.1);
  previewScene.add(rimLight);

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.02, 1.18, 0.28, 24),
    new THREE.MeshLambertMaterial({ color: 0x1f2a30 })
  );
  pedestal.position.y = -0.16;
  previewScene.add(pedestal);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.045, 10, 40),
    new THREE.MeshBasicMaterial({ color: 0x8ee7c3, transparent: true, opacity: 0.3 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.005;
  previewScene.add(ring);

  const previewRig = createPlayerRig();
  previewRig.group.position.y = 0.12;
  previewRig.group.rotation.y = 0.52;
  previewScene.add(previewRig.group);

  START_SCREEN.previewScene = previewScene;
  START_SCREEN.previewCamera = previewCamera;
  START_SCREEN.previewRenderer = previewRenderer;
  START_SCREEN.previewRig = previewRig;

  applyPlayerAppearance();
  resizeStartScreenPreview();
}

function attemptStartScreenMusic() {
  if (START_SCREEN.musicStarted || START_SCREEN.musicDisabled || !START_SCREEN.music) return;

  const requestId = ++START_SCREEN.musicRequestId;

  START_SCREEN.music.play()
    .then(() => {
      if (START_SCREEN.musicDisabled || requestId !== START_SCREEN.musicRequestId) {
        START_SCREEN.music.pause();
        START_SCREEN.music.currentTime = 0;
        return;
      }
      START_SCREEN.musicStarted = true;
      START_SCREEN.musicUnlocked = true;
    })
    .catch(() => {
      if (requestId !== START_SCREEN.musicRequestId) return;
      START_SCREEN.musicStarted = false;
    });
}

function initStartScreenMusic() {
  if (START_SCREEN.music) return;

  const music = new Audio(START_SCREEN_CFG.musicPath);
  music.loop = true;
  music.preload = 'auto';
  music.volume = 0.45;
  START_SCREEN.music = music;

  const unlock = () => {
    attemptStartScreenMusic();
    if (START_SCREEN.musicUnlocked) {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
    }
  };

  document.addEventListener('pointerdown', unlock);
  document.addEventListener('keydown', unlock);
  document.addEventListener('touchstart', unlock);
}

function stopStartScreenMusic() {
  START_SCREEN.musicDisabled = true;
  START_SCREEN.musicRequestId++;
  if (!START_SCREEN.music) return;
  START_SCREEN.music.pause();
  START_SCREEN.music.currentTime = 0;
  START_SCREEN.musicStarted = false;
}

function initStartScreen() {
  if (START_SCREEN.initialized) return;
  START_SCREEN.initialized = true;
  bindAppearanceControls();
  initStartScreenPreview();
  bindStartScreenPointer();
  initStartScreenMusic();
}

function updateStartScreen(dt) {
  if (!START_SCREEN.previewRig || !loaderEl || loaderEl.style.display === 'none') return;

  START_SCREEN.previewTime += dt;
  const t = START_SCREEN.previewTime;
  const rig = START_SCREEN.previewRig;
  const jumpHz = START_SCREEN_ANIM.jumpsPerMinute / 60;
  const jumpPhase = t * Math.PI * 2 * jumpHz;
  const bounceWave = Math.sin(jumpPhase);
  const hop = Math.max(0, bounceWave);
  const crouch = Math.max(0, -bounceWave);
  const sway = Math.sin(jumpPhase * 0.5);
  const twist = Math.sin(jumpPhase * 0.32);
  const armSwing = Math.sin(jumpPhase + 0.45);
  const legSwing = Math.sin(jumpPhase + Math.PI * 0.5);
  START_SCREEN.pointerX += (START_SCREEN.pointerTargetX - START_SCREEN.pointerX) * Math.min(1, START_SCREEN_ANIM.pointerFollow * dt);
  START_SCREEN.pointerY += (START_SCREEN.pointerTargetY - START_SCREEN.pointerY) * Math.min(1, START_SCREEN_ANIM.pointerFollow * dt);
  START_SCREEN.bodyLookX += (START_SCREEN.pointerX - START_SCREEN.bodyLookX) * Math.min(1, START_SCREEN_ANIM.pointerFollow * 0.6 * dt);
  START_SCREEN.bodyLookY += (START_SCREEN.pointerY - START_SCREEN.bodyLookY) * Math.min(1, START_SCREEN_ANIM.pointerFollow * 0.6 * dt);
  const pointerYaw = START_SCREEN.bodyLookX * START_SCREEN_ANIM.pointerBodyYaw;
  const pointerHeadYaw = START_SCREEN.pointerX * START_SCREEN_ANIM.pointerHeadYaw;
  const pointerPitch = START_SCREEN.pointerY * START_SCREEN_ANIM.pointerPitch;

  rig.group.rotation.y = START_SCREEN_ANIM.baseYaw + twist * START_SCREEN_ANIM.yawSwing + pointerYaw;
  rig.group.position.y = 0.12 + hop * START_SCREEN_ANIM.hopHeight;

  START_SCREEN.previewCamera.position.x = START_SCREEN.pointerX * START_SCREEN_ANIM.pointerCameraX;
  START_SCREEN.previewCamera.position.y = 0.85 - START_SCREEN.pointerY * START_SCREEN_ANIM.pointerCameraY;
  START_SCREEN.previewCamera.lookAt(START_SCREEN.bodyLookX * 0.08, 0.95 - pointerPitch * 0.18, 0);

  rig.upperBody.position.y = ANIM_CFG.upperBodyY + hop * START_SCREEN_ANIM.bodyBob - crouch * 0.022;
  rig.headGroup.position.y = ANIM_CFG.headY + hop * START_SCREEN_ANIM.headBob - crouch * 0.014;
  rig.upperBody.rotation.x = 0.1 + crouch * 0.2 - hop * 0.04 - START_SCREEN.bodyLookY * 0.16;
  rig.upperBody.rotation.y = sway * 0.08 + pointerYaw * 0.52;
  rig.upperBody.rotation.z = Math.sin(jumpPhase * 0.75) * 0.06;
  rig.headGroup.rotation.y = pointerHeadYaw * 0.68;
  rig.headGroup.rotation.z = -Math.sin(jumpPhase * 0.75) * 0.04;
  rig.headGroup.rotation.x = 0.03 + crouch * 0.04 - hop * 0.015 - START_SCREEN.pointerY * 0.2;

  rig.armPivotL.rotation.x = -0.12 + armSwing * 0.34 + hop * 0.12;
  rig.armPivotR.rotation.x = -0.08 - armSwing * 0.34 + hop * 0.12;
  rig.armPivotL.rotation.z = 0.14 + sway * 0.05;
  rig.armPivotR.rotation.z = -0.14 - sway * 0.05;

  rig.legPivotL.rotation.x = -0.14 + legSwing * 0.08 - crouch * 0.1;
  rig.legPivotR.rotation.x = -0.14 - legSwing * 0.08 - crouch * 0.1;
  rig.kneePivotL.rotation.x = 0.3 + crouch * 0.16 + hop * 0.04;
  rig.kneePivotR.rotation.x = 0.3 + crouch * 0.16 + hop * 0.04;
  rig.anklePivotL.rotation.x = -0.05 - rig.legPivotL.rotation.x * 0.74;
  rig.anklePivotR.rotation.x = -0.05 - rig.legPivotR.rotation.x * 0.74;

  rig.legPivotL.position.x = -0.08 + Math.sin(jumpPhase * 0.9) * 0.005;
  rig.legPivotR.position.x = 0.08 - Math.sin(jumpPhase * 0.9) * 0.005;

  START_SCREEN.previewRenderer.render(START_SCREEN.previewScene, START_SCREEN.previewCamera);
}
