<?php

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://localhost:5173',
    getenv('FRONTEND_URL') // Set this in Render
];

if (in_array($origin, $allowed_origins) || empty($origin)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Optional: Allow all for debugging? No, stick to security.
    // But if env var is missing, maybe default to localhost.
    header('Access-Control-Allow-Origin: http://localhost:5173');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
