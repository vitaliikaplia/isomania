<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Isomania</title>
  <link rel="stylesheet" href="css/style.min.css">
  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js"
    }
  }
  </script>
</head>
<body>
  <div id="loader">
    <div class="loader-content">
      <div class="loader-title">ISOMANIA</div>
      <div class="loader-bar"><div class="loader-fill"></div></div>
      <div class="loader-text">Loading...</div>
      <div class="loader-name" style="display:none">
        <input type="text" id="player-name" placeholder="Your name" maxlength="20" autocomplete="off">
      </div>
      <button id="loader-play" style="display:none">Play Game</button>
    </div>
  </div>
  <div id="wrap">
    <button id="btn-fs">&#x26F6; Fullscreen</button>
    <div id="hud"></div>
    <div id="hint">WASD / ← ↑ → ↓ &nbsp; Scroll to zoom</div>
  </div>
  <script type="module" src="js/game.min.js"></script>
</body>
</html>
