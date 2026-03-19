<?php
session_start();

if (empty($_SESSION['game_token'])) {
    $_SESSION['game_token'] = bin2hex(random_bytes(16));
}

$siteUrl = 'https://isomania.online/';
$pageTitle = 'Isomania — ізометрична survival-гра у браузері';
$pageDescription = 'Isomania — браузерна ізометрична survival-гра з процедурним світом, атмосферними локаціями, парканами, будинками та дослідженням у стилі survival sandbox.';
$ogImage = $siteUrl . 'screenshot.png';
?>
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
  <meta name="description" content="<?= htmlspecialchars($pageDescription, ENT_QUOTES, 'UTF-8') ?>">
  <link rel="canonical" href="<?= htmlspecialchars($siteUrl, ENT_QUOTES, 'UTF-8') ?>">
  <meta name="robots" content="index, follow">

  <meta property="og:locale" content="uk_UA">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Isomania">
  <meta property="og:title" content="<?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:description" content="<?= htmlspecialchars($pageDescription, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:url" content="<?= htmlspecialchars($siteUrl, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:image" content="<?= htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:image:width" content="2838">
  <meta property="og:image:height" content="1594">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?>">
  <meta name="twitter:description" content="<?= htmlspecialchars($pageDescription, ENT_QUOTES, 'UTF-8') ?>">
  <meta name="twitter:image" content="<?= htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8') ?>">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Syne:wght@500;700;800&display=swap" rel="stylesheet">
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
    <div class="loader-shell">
      <div class="loader-panel loader-panel-form">
        <div class="loader-brand">
          <img src="favicon.svg?v=<?= filemtime('favicon.svg') ?>" class="loader-logo" alt="Isomania">
          <div class="loader-brand-copy">
            <div class="loader-title">ISOMANIA</div>
            <div class="loader-subtitle">Ізометрична survival-пригода з атмосферою тихого занепаду.</div>
          </div>
        </div>

        <div class="loader-copy">
          <div class="loader-kicker">Вхід у сесію</div>
          <h1>Створи свого персонажа і заходь у світ.</h1>
          <p>Обери зовнішність, введи ім’я і починай дослідження міських кварталів, дворів, доріг та закритих подвір’їв.</p>
        </div>

        <div class="loader-bar"><div class="loader-fill"></div></div>
        <div class="loader-text">Завантаження...</div>

        <div class="loader-name" style="display:none">
          <label class="loader-field">
            <span>Ім’я персонажа</span>
            <input type="text" id="player-name" placeholder="Ваше ім’я" maxlength="20" autocomplete="off">
          </label>
        </div>

        <button id="loader-play" style="display:none">Увійти в гру</button>
      </div>

      <div class="loader-panel loader-panel-preview">
        <div id="loader-preview-stage"></div>

        <div class="style-controls">
          <div class="style-row">
            <span>Волосся</span>
            <div class="style-row-controls">
              <button type="button" data-style-key="hair" data-style-dir="-1" aria-label="Попередній колір волосся">‹</button>
              <i data-style-swatch="hair"></i>
              <button type="button" data-style-key="hair" data-style-dir="1" aria-label="Наступний колір волосся">›</button>
            </div>
          </div>
          <div class="style-row">
            <span>Футболка</span>
            <div class="style-row-controls">
              <button type="button" data-style-key="shirt" data-style-dir="-1" aria-label="Попередній колір футболки">‹</button>
              <i data-style-swatch="shirt"></i>
              <button type="button" data-style-key="shirt" data-style-dir="1" aria-label="Наступний колір футболки">›</button>
            </div>
          </div>
          <div class="style-row">
            <span>Штани</span>
            <div class="style-row-controls">
              <button type="button" data-style-key="pants" data-style-dir="-1" aria-label="Попередній колір штанів">‹</button>
              <i data-style-swatch="pants"></i>
              <button type="button" data-style-key="pants" data-style-dir="1" aria-label="Наступний колір штанів">›</button>
            </div>
          </div>
          <div class="style-row">
            <span>Взуття</span>
            <div class="style-row-controls">
              <button type="button" data-style-key="shoes" data-style-dir="-1" aria-label="Попередній колір взуття">‹</button>
              <i data-style-swatch="shoes"></i>
              <button type="button" data-style-key="shoes" data-style-dir="1" aria-label="Наступний колір взуття">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div id="wrap">
    <button id="btn-fs">&#x26F6; На весь екран</button>
    <div id="hud"></div>
    <div id="hint">WASD / ← ↑ → ↓ &nbsp; Коліщатко миші для масштабу</div>
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
