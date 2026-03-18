<?php
session_start();

require_once __DIR__ . '/vendor/autoload.php';

header('Content-Type: application/json');

if (!isset($_GET['action']) || $_GET['action'] !== 'join') {
    http_response_code(400);
    echo json_encode(['error' => 'Unknown action']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$token = $_SERVER['HTTP_X_GAME_TOKEN'] ?? '';
if (empty($token) || empty($_SESSION['game_token']) || !hash_equals($_SESSION['game_token'], $token)) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$envPath = __DIR__ . '/.env';
$env = file_exists($envPath) ? (parse_ini_file($envPath) ?: []) : [];
$input = json_decode(file_get_contents('php://input'), true) ?: [];
$playerName = trim((string)($input['name'] ?? 'Unknown survivor'));

if ($playerName === '') {
    $playerName = 'Unknown survivor';
}

if (mb_strlen($playerName) > 40) {
    $playerName = mb_substr($playerName, 0, 40);
}

function getUserIp() {
    if (isset($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return $_SERVER['HTTP_CF_CONNECTING_IP'];
    }

    $client = $_SERVER['HTTP_CLIENT_IP'] ?? '';
    if (filter_var($client, FILTER_VALIDATE_IP)) {
        return $client;
    }

    $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if ($forwarded) {
        $parts = explode(',', $forwarded);
        $candidate = trim($parts[0]);
        if (filter_var($candidate, FILTER_VALIDATE_IP)) {
            return $candidate;
        }
    }

    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function getPlatformInfo() {
    $agent = $_SERVER['HTTP_USER_AGENT'] ?? '';

    if (preg_match('/linux/i', $agent)) return 'Linux';
    if (preg_match('/macintosh|mac os x/i', $agent)) return 'macOS';
    if (preg_match('/windows|win32/i', $agent)) return 'Windows';
    if (preg_match('/android/i', $agent)) return 'Android';
    if (preg_match('/iphone|ipad|ipod/i', $agent)) return 'iOS';

    return 'Unknown OS';
}

function getBrowserInfo() {
    $agent = $_SERVER['HTTP_USER_AGENT'] ?? '';

    if (preg_match('/Edg/i', $agent)) return 'Microsoft Edge';
    if (preg_match('/Firefox/i', $agent)) return 'Mozilla Firefox';
    if (preg_match('/Chrome/i', $agent)) return 'Google Chrome';
    if (preg_match('/Safari/i', $agent)) return 'Apple Safari';
    if (preg_match('/Opera|OPR/i', $agent)) return 'Opera';

    return 'Unknown Browser';
}

function getIpInfo($ipAddress) {
    if (!$ipAddress || $ipAddress === '::1' || $ipAddress === '127.0.0.1') {
        return 'Localhost';
    }

    try {
        $geoDir = __DIR__ . '/geo';
        $countryReader = new GeoIp2\Database\Reader($geoDir . '/country.mmdb');
        $countryRecord = $countryReader->country($ipAddress);

        $cityReader = new GeoIp2\Database\Reader($geoDir . '/city.mmdb');
        $cityRecord = $cityReader->city($ipAddress);

        $parts = array_filter([
            $countryRecord->country->name,
            $cityRecord->mostSpecificSubdivision->name,
            $cityRecord->city->name,
        ]);

        return implode(', ', $parts) . ' (' . $ipAddress . ')';
    } catch (Exception $e) {
        return $ipAddress;
    }
}

function getSessionInfo() {
    $host = $_SERVER['HTTP_HOST'] ?? 'unknown-host';
    $ip = getIpInfo(getUserIp());
    $platform = getPlatformInfo();
    $browser = getBrowserInfo();

    return "{$host}, {$ip}, {$platform}, {$browser}";
}

function sendTelegramMessage($message, $env) {
    $token = $env['TELEGRAM_TOKEN'] ?? '';
    $chatId = $env['TELEGRAM_CHAT_ID'] ?? '';
    $threadId = $env['TELEGRAM_THREAD_ID'] ?? '';

    if (!$token || !$chatId) {
        return false;
    }

    $params = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'HTML',
    ];

    if ($threadId) {
        $params['message_thread_id'] = $threadId;
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.telegram.org/bot{$token}/sendMessage");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $result = curl_exec($ch);
    curl_close($ch);

    return $result ? json_decode($result, true) : false;
}

$safeName = htmlspecialchars($playerName, ENT_QUOTES, 'UTF-8');
$sessionInfo = htmlspecialchars(getSessionInfo(), ENT_QUOTES, 'UTF-8');
$message = "🎮 <b>Isomania login</b>\n"
    . "Name: <b>{$safeName}</b>\n"
    . "📍 {$sessionInfo}";

sendTelegramMessage($message, $env);

echo json_encode(['ok' => true]);
