<?php

class ProposalController {
    public static function create($input) {
        $auth = AuthMiddleware::requireRole('student');

        $required = ['project_id', 'title'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '$field' is required"]);
                return;
            }
        }

        $db = Database::getInstance()->getConnection();

        $check = $db->prepare('SELECT id FROM projects WHERE id = :pid AND student_id = :sid');
        $check->execute([':pid' => $input['project_id'], ':sid' => $auth['user_id']]);
        if (!$check->fetch()) {
            http_response_code(403);
            echo json_encode(['error' => 'Project not found or access denied']);
            return;
        }

        $stmt = $db->prepare('
            INSERT INTO proposals (project_id, title, abstract, objectives, methodology)
            VALUES (:project_id, :title, :abstract, :objectives, :methodology)
            RETURNING *
        ');
        $stmt->execute([
            ':project_id' => $input['project_id'],
            ':title' => $input['title'],
            ':abstract' => $input['abstract'] ?? null,
            ':objectives' => $input['objectives'] ?? null,
            ':methodology' => $input['methodology'] ?? null,
        ]);

        $proposal = $stmt->fetch();

        // Notify supervisor
        $proj = $db->prepare('SELECT supervisor_id, title FROM projects WHERE id = :id');
        $proj->execute([':id' => $input['project_id']]);
        $project = $proj->fetch();

        if ($project['supervisor_id']) {
            $notif = $db->prepare('
                INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
                VALUES (:user_id, :type, :title, :message, :ref_type, :ref_id)
            ');
            $notif->execute([
                ':user_id' => $project['supervisor_id'],
                ':type' => 'proposal_submitted',
                ':title' => 'New Proposal Submitted',
                ':message' => "A student has submitted a proposal for: {$project['title']}",
                ':ref_type' => 'proposal',
                ':ref_id' => $proposal['id'],
            ]);
        }

        http_response_code(201);
        echo json_encode(['proposal' => $proposal]);
    }

    public static function show($id) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('
            SELECT pr.*, p.student_id, p.supervisor_id
            FROM proposals pr
            JOIN projects p ON pr.project_id = p.id
            WHERE pr.id = :id
        ');
        $stmt->execute([':id' => $id]);
        $proposal = $stmt->fetch();

        if (!$proposal) {
            http_response_code(404);
            echo json_encode(['error' => 'Proposal not found']);
            return;
        }

        echo json_encode(['proposal' => $proposal]);
    }

    public static function getByProject($projectId) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('SELECT * FROM proposals WHERE project_id = :pid ORDER BY submitted_at DESC');
        $stmt->execute([':pid' => $projectId]);

        echo json_encode(['proposals' => $stmt->fetchAll()]);
    }

    public static function review($id, $input) {
        $auth = AuthMiddleware::requireRole('supervisor');

        if (empty($input['status']) || !in_array($input['status'], ['approved', 'rejected'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Status must be "approved" or "rejected"']);
            return;
        }

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('
            UPDATE proposals SET status = :status, feedback = :feedback, reviewed_at = CURRENT_TIMESTAMP
            WHERE id = :id
            RETURNING *
        ');
        $stmt->execute([
            ':status' => $input['status'],
            ':feedback' => $input['feedback'] ?? null,
            ':id' => $id,
        ]);
        $proposal = $stmt->fetch();

        if (!$proposal) {
            http_response_code(404);
            echo json_encode(['error' => 'Proposal not found']);
            return;
        }

        // Update project status if approved
        if ($input['status'] === 'approved') {
            $db->prepare('UPDATE projects SET status = \'in_progress\', updated_at = CURRENT_TIMESTAMP WHERE id = :id')
               ->execute([':id' => $proposal['project_id']]);
        }

        // Notify student
        $proj = $db->prepare('SELECT student_id FROM projects WHERE id = :id');
        $proj->execute([':id' => $proposal['project_id']]);
        $project = $proj->fetch();

        $statusText = ucfirst($input['status']);
        $notif = $db->prepare('
            INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
            VALUES (:user_id, :type, :title, :message, :ref_type, :ref_id)
        ');
        $notif->execute([
            ':user_id' => $project['student_id'],
            ':type' => 'proposal_reviewed',
            ':title' => "Proposal {$statusText}",
            ':message' => "Your proposal has been {$statusText}." . ($input['feedback'] ? " Feedback: {$input['feedback']}" : ''),
            ':ref_type' => 'proposal',
            ':ref_id' => $id,
        ]);

        echo json_encode(['proposal' => $proposal]);
    }
}
