/* ── Resize ── */

function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  aspect = w / h;
  cam.left = -frustum * aspect;
  cam.right = frustum * aspect;
  cam.top = frustum;
  cam.bottom = -frustum;
  cam.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);

/* ── Loading Screen ── */

const loaderEl = document.getElementById('loader');
const loaderBtn = document.getElementById('loader-play');
const loaderText = document.querySelector('.loader-text');
const loaderFill = document.querySelector('.loader-fill');
const loaderName = document.querySelector('.loader-name');
const playerNameInput = document.getElementById('player-name');
const bootstrap = window.ISOMANIA_BOOTSTRAP || {};
let playerName = localStorage.getItem(CONFIG.ui.playerNameStorageKey) || '';

function notifyGameJoin(name) {
  if (!bootstrap.notifyUrl || !bootstrap.gameToken) return;

  fetch(bootstrap.notifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Game-Token': bootstrap.gameToken,
    },
    body: JSON.stringify({ name }),
    keepalive: true,
  }).catch(() => {
    // Notification failures should not block game start.
  });
}

function showPlayButton() {
  loaderText.style.display = 'none';
  loaderFill.style.animation = 'none';
  loaderFill.style.width = '100%';
  loaderFill.style.marginLeft = '0';
  loaderName.style.display = 'block';
  loaderBtn.style.display = 'block';
  if (playerName) {
    playerNameInput.value = playerName;
    loaderBtn.disabled = false;
  } else {
    loaderBtn.disabled = true;
    loaderBtn.classList.add('disabled');
  }
  playerNameInput.focus();
}

// Enable play button only when name is entered
playerNameInput.addEventListener('input', () => {
  const hasName = playerNameInput.value.trim().length > 0;
  loaderBtn.disabled = !hasName;
  loaderBtn.classList.toggle('disabled', !hasName);
});

function hideLoader() {
  loaderEl.style.opacity = '0';
  setTimeout(() => { loaderEl.style.display = 'none'; }, 400);
}

/* ── Game Loop ── */

let prev = performance.now();
let gameStarted = false;

function loop(ts) {
  const dt = Math.min((ts - prev) / 1000, 0.05);
  prev = ts;
  if (gameStarted) {
    update(dt);
  }
  updateCamera();
  renderer.render(scene, cam);
  updateHud();
  requestAnimationFrame(loop);
}

// Scene is ready — show play button
showPlayButton();

// Render scene in background while waiting
requestAnimationFrame(loop);

// Start game on click
loaderBtn.addEventListener('click', () => {
  if (!playerNameInput.value.trim()) return;
  playerName = playerNameInput.value.trim();
  localStorage.setItem(CONFIG.ui.playerNameStorageKey, playerName);
  notifyGameJoin(playerName);
  clearKeys();
  gameStarted = true;
  prev = performance.now();
  hideLoader();
});

// Enter key in name input triggers play
playerNameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && playerNameInput.value.trim()) {
    loaderBtn.click();
  }
});
