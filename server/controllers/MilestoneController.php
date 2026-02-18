<?php

class MilestoneController {
    public static function create($input) {
        $auth = AuthMiddleware::requireRole('supervisor');

        $required = ['project_id', 'title', 'due_date'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '$field' is required"]);
                return;
            }
        }

        $db = Database::getInstance()->getConnection();

        $check = $db->prepare('SELECT student_id FROM projects WHERE id = :pid AND supervisor_id = :sid');
        $check->execute([':pid' => $input['project_id'], ':sid' => $auth['user_id']]);
        $project = $check->fetch();

        if (!$project) {
            http_response_code(403);
            echo json_encode(['error' => 'Project not found or not your assigned project']);
            return;
        }

        $stmt = $db->prepare('
            INSERT INTO milestones (project_id, assigned_by, title, description, due_date)
            VALUES (:pid, :assigned_by, :title, :description, :due_date)
            RETURNING *
        ');
        $stmt->execute([
            ':pid' => $input['project_id'],
            ':assigned_by' => $auth['user_id'],
            ':title' => $input['title'],
            ':description' => $input['description'] ?? null,
            ':due_date' => $input['due_date'],
        ]);

        $milestone = $stmt->fetch();

        $db->prepare('
            INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
            VALUES (:uid, :type, :title, :msg, :rtype, :rid)
        ')->execute([
            ':uid' => $project['student_id'],
            ':type' => 'milestone_assigned',
            ':title' => 'New Task Assigned',
            ':msg' => "You have a new task: {$input['title']} — Due: {$input['due_date']}",
            ':rtype' => 'milestone',
            ':rid' => $milestone['id'],
        ]);

        http_response_code(201);
        echo json_encode(['milestone' => $milestone]);
    }

    public static function getByProject($projectId) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('
            SELECT m.*, u.first_name AS assigned_by_first, u.last_name AS assigned_by_last
            FROM milestones m
            LEFT JOIN users u ON m.assigned_by = u.id
            WHERE m.project_id = :pid
            ORDER BY m.due_date ASC
        ');
        $stmt->execute([':pid' => $projectId]);

        echo json_encode(['milestones' => $stmt->fetchAll()]);
    }

    public static function update($id, $input) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('SELECT * FROM milestones WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $milestone = $stmt->fetch();

        if (!$milestone) {
            http_response_code(404);
            echo json_encode(['error' => 'Milestone not found']);
            return;
        }

        $status = $input['status'] ?? $milestone['status'];
        $title = $input['title'] ?? $milestone['title'];
        $description = $input['description'] ?? $milestone['description'];
        $dueDate = $input['due_date'] ?? $milestone['due_date'];

        $stmt = $db->prepare('
            UPDATE milestones SET title = :title, description = :description, due_date = :due_date, status = :status
            WHERE id = :id
            RETURNING *
        ');
        $stmt->execute([
            ':title' => $title,
            ':description' => $description,
            ':due_date' => $dueDate,
            ':status' => $status,
            ':id' => $id,
        ]);

        echo json_encode(['milestone' => $stmt->fetch()]);
    }
}
