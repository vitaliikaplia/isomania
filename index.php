<?php
session_start();

if (empty($_SESSION['game_token'])) {
    $_SESSION['game_token'] = bin2hex(random_bytes(16));
}

$siteUrl = 'https://isomania.online/';
$pageTitle = 'Isomania — ізометрична survival-гра у браузері';
$pageDescription = 'Isomania — браузерна ізометрична survival-гра з процедурним світом, атмосферними локаціями, парканами, будинками та дослідженням у стилі survival sandbox.';
$ogImage = $siteUrl . 'screenshot.png?v=' . filemtime('screenshot.png');
?>
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
  <meta name="description" content="<?= htmlspecialchars($pageDescription, ENT_QUOTES, 'UTF-8') ?>">
  <meta name="theme-color" content="#081117">
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
  <link rel="manifest" href="manifest.webmanifest?v=<?= filemtime('manifest.webmanifest') ?>">
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
  <?php
  $footerLinks = [
      [
          'href' => 'https://vitaliikaplia.com/',
          'label' => 'vitaliikaplia.com',
          'type' => 'image',
          'src' => 'https://vitaliikaplia.com/apple-touch-icon.png',
      ],
      [
          'href' => 'https://kaplia.pro/',
          'label' => 'kaplia.pro',
          'type' => 'image',
          'src' => 'https://kaplia.pro/icon.svg',
      ],
      [
          'href' => 'https://github.com/vitaliikaplia/isomania',
          'label' => 'GitHub',
          'type' => 'github',
      ],
  ];
  ?>
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
        <div class="footer-links footer-links-loader" aria-label="Project links">
          <?php foreach ($footerLinks as $link): ?>
            <a href="<?= htmlspecialchars($link['href'], ENT_QUOTES, 'UTF-8') ?>" target="_blank" rel="noreferrer" aria-label="<?= htmlspecialchars($link['label'], ENT_QUOTES, 'UTF-8') ?>">
              <?php if ($link['type'] === 'github'): ?>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.2.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.6-1.4-5.6-6.1 0-1.4.5-2.6 1.2-3.5-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.4 1.3a11.7 11.7 0 0 1 6.2 0c2.3-1.6 3.4-1.3 3.4-1.3.6 1.6.2 2.9.1 3.2.8.9 1.2 2.1 1.2 3.5 0 4.8-2.9 5.8-5.7 6.1.4.4.8 1.1.8 2.3v3.3c0 .4.2.7.8.6A12 12 0 0 0 12 .5Z"/>
                </svg>
              <?php else: ?>
                <img src="<?= htmlspecialchars($link['src'], ENT_QUOTES, 'UTF-8') ?>" alt="<?= htmlspecialchars($link['label'], ENT_QUOTES, 'UTF-8') ?>">
              <?php endif; ?>
            </a>
          <?php endforeach; ?>
        </div>
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
    <div id="hint">WASD / ← ↑ → ↓ &nbsp; Q для дій &nbsp; C для скрадання &nbsp; Коліщатко миші для масштабу</div>
    <div class="footer-links footer-links-game" aria-label="Project links">
      <?php foreach ($footerLinks as $link): ?>
        <a href="<?= htmlspecialchars($link['href'], ENT_QUOTES, 'UTF-8') ?>" target="_blank" rel="noreferrer" aria-label="<?= htmlspecialchars($link['label'], ENT_QUOTES, 'UTF-8') ?>">
          <?php if ($link['type'] === 'github'): ?>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.2.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.6-1.4-5.6-6.1 0-1.4.5-2.6 1.2-3.5-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.4 1.3a11.7 11.7 0 0 1 6.2 0c2.3-1.6 3.4-1.3 3.4-1.3.6 1.6.2 2.9.1 3.2.8.9 1.2 2.1 1.2 3.5 0 4.8-2.9 5.8-5.7 6.1.4.4.8 1.1.8 2.3v3.3c0 .4.2.7.8.6A12 12 0 0 0 12 .5Z"/>
            </svg>
          <?php else: ?>
            <img src="<?= htmlspecialchars($link['src'], ENT_QUOTES, 'UTF-8') ?>" alt="<?= htmlspecialchars($link['label'], ENT_QUOTES, 'UTF-8') ?>">
          <?php endif; ?>
        </a>
      <?php endforeach; ?>
    </div>
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
