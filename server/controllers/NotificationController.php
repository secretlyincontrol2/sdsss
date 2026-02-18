<?php

class NotificationController {
    public static function index() {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('
            SELECT * FROM notifications
            WHERE user_id = :uid
            ORDER BY created_at DESC
            LIMIT 50
        ');
        $stmt->execute([':uid' => $auth['user_id']]);

        $unread = $db->prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = :uid AND is_read = FALSE');
        $unread->execute([':uid' => $auth['user_id']]);

        echo json_encode([
            'notifications' => $stmt->fetchAll(),
            'unread_count' => (int)$unread->fetch()['count'],
        ]);
    }

    public static function markRead($id) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $db->prepare('UPDATE notifications SET is_read = TRUE WHERE id = :id AND user_id = :uid')
           ->execute([':id' => $id, ':uid' => $auth['user_id']]);

        echo json_encode(['success' => true]);
    }

    public static function markAllRead() {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $db->prepare('UPDATE notifications SET is_read = TRUE WHERE user_id = :uid AND is_read = FALSE')
           ->execute([':uid' => $auth['user_id']]);

        echo json_encode(['success' => true]);
    }
}
