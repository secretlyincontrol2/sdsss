<?php

class MessageController {
    public static function index() {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        // Get latest message per conversation partner
        $stmt = $db->prepare('
            SELECT DISTINCT ON (partner_id)
                m.*,
                CASE WHEN m.sender_id = :uid THEN m.receiver_id ELSE m.sender_id END AS partner_id,
                u.first_name AS partner_first, u.last_name AS partner_last, u.role AS partner_role, u.avatar_url AS partner_avatar
            FROM messages m
            JOIN users u ON u.id = CASE WHEN m.sender_id = :uid2 THEN m.receiver_id ELSE m.sender_id END
            WHERE m.sender_id = :uid3 OR m.receiver_id = :uid4
            ORDER BY partner_id, m.created_at DESC
        ');
        $stmt->execute([
            ':uid' => $auth['user_id'],
            ':uid2' => $auth['user_id'],
            ':uid3' => $auth['user_id'],
            ':uid4' => $auth['user_id'],
        ]);

        echo json_encode(['conversations' => $stmt->fetchAll()]);
    }

    public static function send($input) {
        $auth = AuthMiddleware::authenticate();

        if (empty($input['receiver_id']) || empty($input['body'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Receiver and message body are required']);
            return;
        }

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('
            INSERT INTO messages (sender_id, receiver_id, subject, body)
            VALUES (:sid, :rid, :subject, :body)
            RETURNING *
        ');
        $stmt->execute([
            ':sid' => $auth['user_id'],
            ':rid' => $input['receiver_id'],
            ':subject' => $input['subject'] ?? null,
            ':body' => $input['body'],
        ]);

        $message = $stmt->fetch();

        // Notify receiver
        $sender = $db->prepare('SELECT first_name, last_name FROM users WHERE id = :id');
        $sender->execute([':id' => $auth['user_id']]);
        $senderInfo = $sender->fetch();

        $db->prepare('
            INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
            VALUES (:uid, :type, :title, :msg, :rtype, :rid)
        ')->execute([
            ':uid' => $input['receiver_id'],
            ':type' => 'new_message',
            ':title' => 'New Message',
            ':msg' => "New message from {$senderInfo['first_name']} {$senderInfo['last_name']}",
            ':rtype' => 'message',
            ':rid' => $message['id'],
        ]);

        http_response_code(201);
        echo json_encode(['message' => $message]);
    }

    public static function conversation($partnerId) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('
            SELECT m.*, u.first_name AS sender_first, u.last_name AS sender_last
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = :uid AND m.receiver_id = :pid)
               OR (m.sender_id = :pid2 AND m.receiver_id = :uid2)
            ORDER BY m.created_at ASC
        ');
        $stmt->execute([
            ':uid' => $auth['user_id'],
            ':pid' => $partnerId,
            ':pid2' => $partnerId,
            ':uid2' => $auth['user_id'],
        ]);

        // Mark as read
        $db->prepare('
            UPDATE messages SET is_read = TRUE
            WHERE sender_id = :pid AND receiver_id = :uid AND is_read = FALSE
        ')->execute([':pid' => $partnerId, ':uid' => $auth['user_id']]);

        echo json_encode(['messages' => $stmt->fetchAll()]);
    }

    public static function markRead($id) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $db->prepare('UPDATE messages SET is_read = TRUE WHERE id = :id AND receiver_id = :uid')
           ->execute([':id' => $id, ':uid' => $auth['user_id']]);

        echo json_encode(['success' => true]);
    }
}
