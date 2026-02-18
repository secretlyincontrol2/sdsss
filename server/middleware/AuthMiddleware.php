<?php

require_once __DIR__ . '/../utils/JWTHandler.php';

class AuthMiddleware {
    public static function authenticate() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit;
        }

        $token = substr($authHeader, 7);
        $payload = JWTHandler::decode($token);

        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            exit;
        }

        return $payload;
    }

    public static function requireRole($allowedRoles) {
        $user = self::authenticate();

        if (!in_array($user['role'], (array)$allowedRoles)) {
            http_response_code(403);
            echo json_encode(['error' => 'Insufficient permissions']);
            exit;
        }

        return $user;
    }
}
