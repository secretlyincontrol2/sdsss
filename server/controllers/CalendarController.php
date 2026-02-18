<?php

class CalendarController {
    public static function index() {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->query('
            SELECT ac.*, u.first_name AS created_by_first, u.last_name AS created_by_last
            FROM academic_calendar ac
            LEFT JOIN users u ON ac.created_by = u.id
            ORDER BY ac.start_date ASC
        ');

        echo json_encode(['events' => $stmt->fetchAll()]);
    }

    public static function create($input) {
        $auth = AuthMiddleware::requireRole('admin');

        if (empty($input['event_name']) || empty($input['start_date'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Event name and start date are required']);
            return;
        }

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('
            INSERT INTO academic_calendar (event_name, description, start_date, end_date, created_by)
            VALUES (:name, :description, :start_date, :end_date, :created_by)
            RETURNING *
        ');
        $stmt->execute([
            ':name' => $input['event_name'],
            ':description' => $input['description'] ?? null,
            ':start_date' => $input['start_date'],
            ':end_date' => $input['end_date'] ?? null,
            ':created_by' => $auth['user_id'],
        ]);

        http_response_code(201);
        echo json_encode(['event' => $stmt->fetch()]);
    }

    public static function update($id, $input) {
        $auth = AuthMiddleware::requireRole('admin');
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('SELECT * FROM academic_calendar WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $event = $stmt->fetch();

        if (!$event) {
            http_response_code(404);
            echo json_encode(['error' => 'Event not found']);
            return;
        }

        $stmt = $db->prepare('
            UPDATE academic_calendar SET
                event_name = :name, description = :description,
                start_date = :start_date, end_date = :end_date
            WHERE id = :id
            RETURNING *
        ');
        $stmt->execute([
            ':name' => $input['event_name'] ?? $event['event_name'],
            ':description' => $input['description'] ?? $event['description'],
            ':start_date' => $input['start_date'] ?? $event['start_date'],
            ':end_date' => $input['end_date'] ?? $event['end_date'],
            ':id' => $id,
        ]);

        echo json_encode(['event' => $stmt->fetch()]);
    }

    public static function delete($id) {
        $auth = AuthMiddleware::requireRole('admin');
        $db = Database::getInstance()->getConnection();

        $db->prepare('DELETE FROM academic_calendar WHERE id = :id')->execute([':id' => $id]);
        echo json_encode(['success' => true]);
    }
}
