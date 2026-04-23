<?php

function loadWorldEnvironment(): array
{
    $envPath = __DIR__ . '/.env';
    if (!file_exists($envPath)) {
        return [];
    }

    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (!is_array($lines)) {
        return [];
    }

    $env = [];

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
          continue;
        }

        if (str_starts_with($trimmed, 'export ')) {
            $trimmed = trim(substr($trimmed, 7));
        }

        $delimiterPos = strpos($trimmed, '=');
        if ($delimiterPos === false) {
            continue;
        }

        $key = trim(substr($trimmed, 0, $delimiterPos));
        $value = trim(substr($trimmed, $delimiterPos + 1));

        if ($key === '') {
            continue;
        }

        if (
            (str_starts_with($value, '"') && str_ends_with($value, '"'))
            || (str_starts_with($value, "'") && str_ends_with($value, "'"))
        ) {
            $value = substr($value, 1, -1);
        }

        $env[$key] = $value;
    }

    return $env;
}

function envString(array $env, string $key, string $default = ''): string
{
    if (!array_key_exists($key, $env)) {
        return $default;
    }

    return trim((string)$env[$key]);
}

function envFloat(array $env, string $key, float $default): float
{
    if (!array_key_exists($key, $env)) {
        return $default;
    }

    $value = filter_var($env[$key], FILTER_VALIDATE_FLOAT);
    return $value === false ? $default : (float)$value;
}

function envInt(array $env, string $key, int $default): int
{
    if (!array_key_exists($key, $env)) {
        return $default;
    }

    $value = filter_var($env[$key], FILTER_VALIDATE_INT);
    return $value === false ? $default : (int)$value;
}

function httpJsonRequest(string $url, array $options = []): ?array
{
    $method = strtoupper($options['method'] ?? 'GET');
    $headers = $options['headers'] ?? [];
    $body = $options['body'] ?? null;
    $timeout = (int)($options['timeout'] ?? 12);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, min(5, $timeout));
    curl_setopt($ch, CURLOPT_USERAGENT, 'IsomaniaLocalWorldLoader/1.0');

    if ($method !== 'GET') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    }

    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }

    $raw = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($raw === false || $raw === '' || $status >= 400) {
        return null;
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : null;
}

function ensureWorldCacheDirectory(): string
{
    $dir = __DIR__ . '/cache';
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }

    return $dir;
}

function getWorldCacheFile(string $bucket, string $key): string
{
    $safeBucket = preg_replace('/[^a-z0-9_-]+/i', '-', $bucket) ?: 'world';
    return ensureWorldCacheDirectory() . '/' . $safeBucket . '-' . md5($key) . '.json';
}

function readJsonCache(string $bucket, string $key, int $ttlSeconds): ?array
{
    $path = getWorldCacheFile($bucket, $key);
    if (!is_file($path)) {
        return null;
    }

    if ((time() - filemtime($path)) > $ttlSeconds) {
        return null;
    }

    $raw = file_get_contents($path);
    if ($raw === false || $raw === '') {
        return null;
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : null;
}

function writeJsonCache(string $bucket, string $key, array $payload): void
{
    $path = getWorldCacheFile($bucket, $key);
    @file_put_contents(
        $path,
        json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );
}

function isRemoteWorldCacheUsable(?array $world): bool
{
    if (!is_array($world)) {
        return false;
    }

    if (!isset($world['source']) || !isset($world['width']) || !isset($world['height']) || !isset($world['map'])) {
        return false;
    }

    if (($world['source'] ?? 'procedural') === 'procedural') {
        return true;
    }

    $meta = $world['meta'] ?? [];
    $roads = (int)($meta['roadCount'] ?? 0);
    $buildings = (int)($meta['buildingCount'] ?? 0);
    $trees = (int)($meta['treeCount'] ?? 0);
    $green = (int)($meta['greenAreas'] ?? 0);

    return ($roads + $buildings + $trees + $green) > 0;
}

function cachedHttpJsonRequest(string $bucket, string $cacheKey, string $url, array $options, int $ttlSeconds): ?array
{
    $cached = readJsonCache($bucket, $cacheKey, $ttlSeconds);
    if ($cached !== null) {
        return $cached;
    }

    $fresh = httpJsonRequest($url, $options);
    if ($fresh !== null) {
        writeJsonCache($bucket, $cacheKey, $fresh);
    }

    return $fresh;
}

function createEmptyRemoteMap(int $width, int $height): array
{
    return array_fill(0, $height, array_fill(0, $width, 0));
}

function geoToMeters(float $lat, float $lng, float $centerLat, float $centerLng): array
{
    $metersPerDegLat = 111320.0;
    $metersPerDegLng = cos(deg2rad($centerLat)) * 111320.0;

    $x = ($lng - $centerLng) * $metersPerDegLng;
    $z = -($lat - $centerLat) * $metersPerDegLat;

    return [$x, $z];
}

function metersToTile(float $xMeters, float $zMeters, float $radiusMeters, int $width, int $height): array
{
    $span = max(1.0, $radiusMeters * 2.0);
    $col = (($xMeters + $radiusMeters) / $span) * ($width - 1);
    $row = (($zMeters + $radiusMeters) / $span) * ($height - 1);

    return [$col, $row];
}

function inBounds(int $col, int $row, int $width, int $height): bool
{
    return $col >= 0 && $col < $width && $row >= 0 && $row < $height;
}

function markDisk(array &$map, int $col, int $row, int $radius, int $tileType, array $protectedTiles = []): void
{
    $height = count($map);
    $width = count($map[0] ?? []);
    $radiusSq = $radius * $radius;

    for ($dr = -$radius; $dr <= $radius; $dr++) {
        for ($dc = -$radius; $dc <= $radius; $dc++) {
            if (($dc * $dc + $dr * $dr) > $radiusSq) {
                continue;
            }

            $rr = $row + $dr;
            $cc = $col + $dc;
            if (!inBounds($cc, $rr, $width, $height)) {
                continue;
            }

            if (in_array($map[$rr][$cc], $protectedTiles, true)) {
                continue;
            }

            $map[$rr][$cc] = $tileType;
        }
    }
}

function drawLineOnMap(array &$map, array $from, array $to, int $tileType, int $thickness, array $protectedTiles = []): void
{
    [$x1, $y1] = $from;
    [$x2, $y2] = $to;

    $steps = max(abs($x2 - $x1), abs($y2 - $y1), 1);

    for ($step = 0; $step <= $steps; $step++) {
        $t = $step / $steps;
        $col = (int)round($x1 + ($x2 - $x1) * $t);
        $row = (int)round($y1 + ($y2 - $y1) * $t);
        markDisk($map, $col, $row, $thickness, $tileType, $protectedTiles);
    }
}

function pointInPolygon(float $x, float $y, array $polygon): bool
{
    $inside = false;
    $count = count($polygon);
    if ($count < 3) {
        return false;
    }

    for ($i = 0, $j = $count - 1; $i < $count; $j = $i++) {
        $xi = $polygon[$i][0];
        $yi = $polygon[$i][1];
        $xj = $polygon[$j][0];
        $yj = $polygon[$j][1];

        $intersects = (($yi > $y) !== ($yj > $y))
            && ($x < (($xj - $xi) * ($y - $yi) / (($yj - $yi) ?: 0.000001) + $xi));

        if ($intersects) {
            $inside = !$inside;
        }
    }

    return $inside;
}

function fillPolygonOnMap(array &$map, array $polygon, int $tileType, array $protectedTiles = []): void
{
    $height = count($map);
    $width = count($map[0] ?? []);
    if (count($polygon) < 3) {
        return;
    }

    $cols = array_column($polygon, 0);
    $rows = array_column($polygon, 1);
    $minCol = max(0, (int)floor(min($cols)));
    $maxCol = min($width - 1, (int)ceil(max($cols)));
    $minRow = max(0, (int)floor(min($rows)));
    $maxRow = min($height - 1, (int)ceil(max($rows)));

    for ($row = $minRow; $row <= $maxRow; $row++) {
        for ($col = $minCol; $col <= $maxCol; $col++) {
            if (in_array($map[$row][$col], $protectedTiles, true)) {
                continue;
            }

            if (pointInPolygon($col + 0.5, $row + 0.5, $polygon)) {
                $map[$row][$col] = $tileType;
            }
        }
    }
}

function roadThicknessForHighway(?string $highway): int
{
    return match ($highway) {
        'motorway', 'trunk', 'primary' => 2,
        'secondary', 'tertiary' => 2,
        'residential', 'service', 'living_street', 'unclassified' => 1,
        default => 1,
    };
}

function fetchOsmFeatures(float $lat, float $lng, int $radiusMeters, string $overpassUrl, int $ttlSeconds): ?array
{
    $query = <<<QL
[out:json][timeout:25];
(
  way["highway"](around:$radiusMeters,$lat,$lng);
  way["building"](around:$radiusMeters,$lat,$lng);
  node["natural"="tree"](around:$radiusMeters,$lat,$lng);
  way["natural"="wood"](around:$radiusMeters,$lat,$lng);
  way["landuse"="forest"](around:$radiusMeters,$lat,$lng);
  way["leisure"="park"](around:$radiusMeters,$lat,$lng);
);
out geom;
QL;

    $cacheKey = implode('|', [$lat, $lng, $radiusMeters, $overpassUrl, 'base-osm']);

    return cachedHttpJsonRequest('osm', $cacheKey, $overpassUrl, [
        'method' => 'POST',
        'headers' => ['Content-Type: application/x-www-form-urlencoded; charset=UTF-8'],
        'body' => http_build_query(['data' => $query]),
        'timeout' => 18,
    ], $ttlSeconds);
}

function fetchGoogleElevation(string $apiKey, float $lat, float $lng, int $ttlSeconds): ?float
{
    if ($apiKey === '') {
        return null;
    }

    $url = sprintf(
        'https://maps.googleapis.com/maps/api/elevation/json?locations=%F,%F&key=%s',
        $lat,
        $lng,
        rawurlencode($apiKey)
    );

    $cacheKey = implode('|', [$lat, $lng, 'elevation']);
    $json = cachedHttpJsonRequest('google-elevation', $cacheKey, $url, ['timeout' => 8], $ttlSeconds);
    if (!$json || ($json['status'] ?? '') !== 'OK' || empty($json['results'][0]['elevation'])) {
        return null;
    }

    return (float)$json['results'][0]['elevation'];
}

function fetchGooglePlaces(string $apiKey, float $lat, float $lng, int $radiusMeters, int $ttlSeconds): array
{
    if ($apiKey === '') {
        return [];
    }

    $payload = json_encode([
        'includedTypes' => ['park', 'cafe', 'restaurant', 'school', 'store', 'supermarket'],
        'maxResultCount' => 20,
        'locationRestriction' => [
            'circle' => [
                'center' => [
                    'latitude' => $lat,
                    'longitude' => $lng,
                ],
                'radius' => $radiusMeters,
            ],
        ],
    ]);

    if ($payload === false) {
        return [];
    }

    $cacheKey = implode('|', [$lat, $lng, $radiusMeters, 'nearby-places']);
    $json = cachedHttpJsonRequest('google-places', $cacheKey, 'https://places.googleapis.com/v1/places:searchNearby', [
        'method' => 'POST',
        'headers' => [
            'Content-Type: application/json',
            'X-Goog-Api-Key: ' . $apiKey,
            'X-Goog-FieldMask: places.displayName,places.location,places.primaryType',
        ],
        'body' => $payload,
        'timeout' => 10,
    ], $ttlSeconds);

    return is_array($json['places'] ?? null) ? $json['places'] : [];
}

function addSidewalksAroundRoads(array &$map): void
{
    $height = count($map);
    $width = count($map[0] ?? []);
    $toSidewalk = [];

    for ($row = 0; $row < $height; $row++) {
        for ($col = 0; $col < $width; $col++) {
            if ($map[$row][$col] !== 4) {
                continue;
            }

            for ($dr = -1; $dr <= 1; $dr++) {
                for ($dc = -1; $dc <= 1; $dc++) {
                    $rr = $row + $dr;
                    $cc = $col + $dc;
                    if (!inBounds($cc, $rr, $width, $height)) {
                        continue;
                    }

                    if ($map[$rr][$cc] === 0) {
                        $toSidewalk[] = [$rr, $cc];
                    }
                }
            }
        }
    }

    foreach ($toSidewalk as [$row, $col]) {
        $map[$row][$col] = 5;
    }
}

function findSpawnTile(array $map, int $width, int $height): array
{
    $centerCol = (int)floor($width / 2);
    $centerRow = (int)floor($height / 2);
    $preferred = [4, 5, 0];

    for ($radius = 0; $radius < max($width, $height); $radius++) {
        for ($row = max(0, $centerRow - $radius); $row <= min($height - 1, $centerRow + $radius); $row++) {
            for ($col = max(0, $centerCol - $radius); $col <= min($width - 1, $centerCol + $radius); $col++) {
                foreach ($preferred as $tileType) {
                    if ($map[$row][$col] === $tileType) {
                        return ['x' => $col + 0.5, 'y' => $row + 0.5];
                    }
                }
            }
        }
    }

    return ['x' => $centerCol + 0.5, 'y' => $centerRow + 0.5];
}

function buildRemoteWorldBootstrap(array $env): ?array
{
    $source = strtolower(envString($env, 'WORLD_SOURCE', 'procedural'));
    if (!in_array($source, ['osm', 'hybrid', 'google'], true)) {
        return null;
    }
    $effectiveSource = $source === 'google' ? 'hybrid' : $source;

    $lat = envFloat($env, 'MAP_CENTER_LAT', 0.0);
    $lng = envFloat($env, 'MAP_CENTER_LNG', 0.0);
    if ($lat === 0.0 && $lng === 0.0) {
        return null;
    }

    $radiusMeters = max(80, envInt($env, 'MAP_RADIUS_METERS', 350));
    $width = max(96, envInt($env, 'MAP_GRID_WIDTH', 192));
    $height = max(96, envInt($env, 'MAP_GRID_HEIGHT', 192));
    $overpassUrl = envString($env, 'OSM_OVERPASS_URL', 'https://overpass-api.de/api/interpreter');
    $googleKey = envString($env, 'GOOGLE_MAPS_API_KEY', '');
    $cacheTtl = max(3600, envInt($env, 'WORLD_CACHE_TTL_SECONDS', 31536000));
    $worldCacheKey = implode('|', [$source, $lat, $lng, $radiusMeters, $width, $height]);

    $cachedWorld = readJsonCache('world-final', $worldCacheKey, $cacheTtl);
    if (isRemoteWorldCacheUsable($cachedWorld)) {
        return $cachedWorld;
    }

    $osm = fetchOsmFeatures($lat, $lng, $radiusMeters, $overpassUrl, $cacheTtl);
    if (!$osm || empty($osm['elements'])) {
        return null;
    }

    $map = createEmptyRemoteMap($width, $height);
    $roadCount = 0;
    $buildingCount = 0;
    $treeCount = 0;
    $greenCount = 0;

    foreach ($osm['elements'] as $element) {
        $tags = $element['tags'] ?? [];
        $geom = $element['geometry'] ?? [];

        if (($element['type'] ?? '') === 'way' && isset($tags['highway']) && count($geom) >= 2) {
            $roadCount++;
            $thickness = roadThicknessForHighway((string)$tags['highway']);
            $points = [];

            foreach ($geom as $point) {
                [$mx, $mz] = geoToMeters((float)$point['lat'], (float)$point['lon'], $lat, $lng);
                [$col, $row] = metersToTile($mx, $mz, $radiusMeters, $width, $height);
                $points[] = [(int)round($col), (int)round($row)];
            }

            for ($i = 1, $count = count($points); $i < $count; $i++) {
                drawLineOnMap($map, $points[$i - 1], $points[$i], 4, $thickness);
            }

            continue;
        }

        if (($element['type'] ?? '') === 'way' && isset($tags['building']) && count($geom) >= 3) {
            $buildingCount++;
            $polygon = [];

            foreach ($geom as $point) {
                [$mx, $mz] = geoToMeters((float)$point['lat'], (float)$point['lon'], $lat, $lng);
                [$col, $row] = metersToTile($mx, $mz, $radiusMeters, $width, $height);
                $polygon[] = [$col, $row];
            }

            fillPolygonOnMap($map, $polygon, 1, [4]);
            continue;
        }

        if (($element['type'] ?? '') === 'node'
            && (($tags['natural'] ?? '') === 'tree')
            && isset($element['lat'], $element['lon'])) {
            [$mx, $mz] = geoToMeters((float)$element['lat'], (float)$element['lon'], $lat, $lng);
            [$col, $row] = metersToTile($mx, $mz, $radiusMeters, $width, $height);
            $col = (int)round($col);
            $row = (int)round($row);
            if (inBounds($col, $row, $width, $height) && $map[$row][$col] === 0) {
                $map[$row][$col] = 2;
                $treeCount++;
            }
            continue;
        }

        $isGreenWay = ($element['type'] ?? '') === 'way' && count($geom) >= 3 && (
            ($tags['natural'] ?? '') === 'wood'
            || ($tags['landuse'] ?? '') === 'forest'
            || ($tags['leisure'] ?? '') === 'park'
        );

        if ($isGreenWay) {
            $greenCount++;
            $polygon = [];

            foreach ($geom as $point) {
                [$mx, $mz] = geoToMeters((float)$point['lat'], (float)$point['lon'], $lat, $lng);
                [$col, $row] = metersToTile($mx, $mz, $radiusMeters, $width, $height);
                $polygon[] = [$col, $row];
            }

            $cols = array_column($polygon, 0);
            $rows = array_column($polygon, 1);
            $minCol = max(0, (int)floor(min($cols)));
            $maxCol = min($width - 1, (int)ceil(max($cols)));
            $minRow = max(0, (int)floor(min($rows)));
            $maxRow = min($height - 1, (int)ceil(max($rows)));

            for ($row = $minRow; $row <= $maxRow; $row++) {
                for ($col = $minCol; $col <= $maxCol; $col++) {
                    if (!pointInPolygon($col + 0.5, $row + 0.5, $polygon)) {
                        continue;
                    }
                    if ($map[$row][$col] !== 0) {
                        continue;
                    }

                    if ((($row * 17 + $col * 31) % 9) === 0) {
                        $map[$row][$col] = 2;
                        $treeCount++;
                    } elseif ((($row * 11 + $col * 7) % 17) === 0) {
                        $map[$row][$col] = 3;
                    }
                }
            }
        }
    }

    addSidewalksAroundRoads($map);

    $googlePlaces = [];
    $centerElevation = null;

    if ($effectiveSource === 'hybrid' && $googleKey !== '') {
        $googlePlaces = fetchGooglePlaces($googleKey, $lat, $lng, $radiusMeters, $cacheTtl);
        $centerElevation = fetchGoogleElevation($googleKey, $lat, $lng, $cacheTtl);

        foreach ($googlePlaces as $place) {
            $placeLat = $place['location']['latitude'] ?? null;
            $placeLng = $place['location']['longitude'] ?? null;
            if ($placeLat === null || $placeLng === null) {
                continue;
            }

            [$mx, $mz] = geoToMeters((float)$placeLat, (float)$placeLng, $lat, $lng);
            [$col, $row] = metersToTile($mx, $mz, $radiusMeters, $width, $height);
            $col = (int)round($col);
            $row = (int)round($row);

            if (!inBounds($col, $row, $width, $height)) {
                continue;
            }

            $primaryType = (string)($place['primaryType'] ?? '');
            if ($primaryType === 'park') {
                for ($dr = -1; $dr <= 1; $dr++) {
                    for ($dc = -1; $dc <= 1; $dc++) {
                        $rr = $row + $dr;
                        $cc = $col + $dc;
                        if (inBounds($cc, $rr, $width, $height) && $map[$rr][$cc] === 0 && (($rr + $cc) % 2 === 0)) {
                            $map[$rr][$cc] = 2;
                        }
                    }
                }
            } elseif ($map[$row][$col] === 0 || $map[$row][$col] === 5) {
                $map[$row][$col] = 3;
            }
        }
    }

    $spawn = findSpawnTile($map, $width, $height);
    $metersPerTile = ($radiusMeters * 2) / max(1, $width);

    $world = [
        'source' => $source,
        'width' => $width,
        'height' => $height,
        'map' => $map,
        'roads' => ['rows' => [], 'cols' => []],
        'spawn' => $spawn,
        'meta' => [
            'center' => ['lat' => $lat, 'lng' => $lng],
            'radiusMeters' => $radiusMeters,
            'metersPerTile' => $metersPerTile,
            'roadCount' => $roadCount,
            'buildingCount' => $buildingCount,
            'treeCount' => $treeCount,
            'greenAreas' => $greenCount,
            'placeCount' => count($googlePlaces),
            'centerElevationMeters' => $centerElevation,
        ],
    ];

    writeJsonCache('world-final', $worldCacheKey, $world);
    return $world;
}

function buildWorldBootstrapConfig(array $env): array
{
    $source = strtolower(envString($env, 'WORLD_SOURCE', 'procedural'));
    $width = max(96, envInt($env, 'MAP_GRID_WIDTH', 192));
    $height = max(96, envInt($env, 'MAP_GRID_HEIGHT', 192));

    return [
        'source' => $source,
        'width' => $width,
        'height' => $height,
    ];
}
