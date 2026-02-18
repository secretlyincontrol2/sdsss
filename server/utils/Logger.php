<?php
require_once __DIR__ . '/../config/Database.php';

class Logger {
    public static function log($userId, $action, $details = null) {
        try {
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)");
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            // If details is array/object, json_encode it
            if (is_array($details) || is_object($details)) {
                $details = json_encode($details);
            }
            $stmt->execute([$userId, $action, $details, $ip]);
        } catch (Exception $e) {
            // Silently fail logging to avoid breaking app flow
            error_log("Logging failed: " . $e->getMessage());
        }
    }
}
