<?php
/**
 * Shared CORS configuration for HireHub API.
 * Set FRONTEND_URL to your deployed frontend origin, e.g. https://hirehub.vercel.app.
 * FRONTEND_URLS may contain a comma-separated list of allowed origins.
 */
$allowedOrigins = [];
foreach (['FRONTEND_URL', 'FRONTEND_URLS'] as $envName) {
    $configured = getenv($envName);
    if ($configured !== false && trim($configured) !== '') {
        foreach (explode(',', $configured) as $origin) {
            $origin = rtrim(trim($origin), '/');
            if ($origin !== '') $allowedOrigins[] = $origin;
        }
    }
}
// Local development remains supported when no production origins are configured.
if (!$allowedOrigins) {
    $allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array(rtrim($origin, '/'), $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . rtrim($origin, '/'));
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id, X-User-Role');
header('Access-Control-Max-Age: 86400');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
