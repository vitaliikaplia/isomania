<?php
session_start();

if (empty($_SESSION['game_token'])) {
    $_SESSION['game_token'] = bin2hex(random_bytes(16));
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Isomania</title>
  <link rel="icon" href="favicon.ico?v=<?= filemtime('favicon.ico') ?>" sizes="48x48">
  <link rel="icon" href="favicon.svg?v=<?= filemtime('favicon.svg') ?>" type="image/svg+xml">
  <link rel="apple-touch-icon" href="favicon.png?v=<?= filemtime('favicon.png') ?>">
  <link rel="stylesheet" href="css/style.min.css?v=<?= filemtime('css/style.min.css') ?>">
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
      <img src="favicon.svg?v=<?= filemtime('favicon.svg') ?>" class="loader-logo" alt="Isomania">
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
  <script>
    window.ISOMANIA_BOOTSTRAP = {
      gameToken: '<?= htmlspecialchars($_SESSION['game_token'], ENT_QUOTES, 'UTF-8') ?>',
      notifyUrl: 'notify.php?action=join'
    };
  </script>
  <script type="module" src="js/game.min.js?v=<?= filemtime('js/game.min.js') ?>"></script>
</body>
</html>
