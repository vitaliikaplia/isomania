/* ── HUD & Fullscreen ── */

const hud = document.getElementById('hud');
const btnFs = document.getElementById('btn-fs');
const wrap = document.getElementById('wrap');
const worldMeta = WORLD.meta || null;
const worldSourceLabel = (WORLD.source || 'procedural').toUpperCase();

btnFs.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    (wrap.requestFullscreen || wrap.webkitRequestFullscreen || wrap.mozRequestFullScreen).call(wrap);
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen).call(document);
  }
});

document.addEventListener('fullscreenchange', () => {
  btnFs.textContent = document.fullscreenElement ? '✕ Вийти' : '⛶ На весь екран';
  setTimeout(onResize, 100);
});

function updateHud() {
  const radiusPart = worldMeta && Number.isFinite(worldMeta.radiusMeters)
    ? `  radius: ${Math.round(worldMeta.radiusMeters)}m`
    : '';
  hud.textContent = `${worldSourceLabel}  pos: ${pl.x.toFixed(1)}, ${pl.y.toFixed(1)}  zoom: ${cam.zoom.toFixed(2)}x${radiusPart}`;
}
