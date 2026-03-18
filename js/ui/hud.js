/* ── HUD & Fullscreen ── */

const hud = document.getElementById('hud');
const btnFs = document.getElementById('btn-fs');
const wrap = document.getElementById('wrap');

btnFs.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    (wrap.requestFullscreen || wrap.webkitRequestFullscreen || wrap.mozRequestFullScreen).call(wrap);
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen).call(document);
  }
});

document.addEventListener('fullscreenchange', () => {
  btnFs.textContent = document.fullscreenElement ? '✕ Exit' : '⛶ Fullscreen';
  setTimeout(onResize, 100);
});

function updateHud() {
  hud.textContent = `pos: ${pl.x.toFixed(1)}, ${pl.y.toFixed(1)}  zoom: ${cam.zoom.toFixed(2)}x`;
}
