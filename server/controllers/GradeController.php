<?php

class GradeController {
    public static function create($input) {
        $auth = AuthMiddleware::requireRole('supervisor');

        $required = ['project_id', 'component', 'score'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || $input[$field] === '') {
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

        // Upsert: update if same component already graded
        $existing = $db->prepare('SELECT id FROM grades WHERE project_id = :pid AND component = :comp AND graded_by = :gid');
        $existing->execute([':pid' => $input['project_id'], ':comp' => $input['component'], ':gid' => $auth['user_id']]);

        if ($existing->fetch()) {
            $stmt = $db->prepare('
                UPDATE grades SET score = :score, max_score = :max_score, remarks = :remarks, graded_at = CURRENT_TIMESTAMP
                WHERE project_id = :pid AND component = :comp AND graded_by = :gid
                RETURNING *
            ');
        } else {
            $stmt = $db->prepare('
                INSERT INTO grades (project_id, graded_by, component, score, max_score, remarks)
                VALUES (:pid, :gid, :comp, :score, :max_score, :remarks)
                RETURNING *
            ');
        }

        $stmt->execute([
            ':pid' => $input['project_id'],
            ':gid' => $auth['user_id'],
            ':comp' => $input['component'],
            ':score' => $input['score'],
            ':max_score' => $input['max_score'] ?? 100,
            ':remarks' => $input['remarks'] ?? null,
        ]);

        $grade = $stmt->fetch();

        // Notify student
        $db->prepare('
            INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
            VALUES (:uid, :type, :title, :msg, :rtype, :rid)
        ')->execute([
            ':uid' => $project['student_id'],
            ':type' => 'grade_posted',
            ':title' => 'Grade Posted',
            ':msg' => "Your {$input['component']} has been graded: {$input['score']}/{$grade['max_score']}",
            ':rtype' => 'grade',
            ':rid' => $grade['id'],
        ]);

        http_response_code(201);
        echo json_encode(['grade' => $grade]);
    }

    public static function getByProject($projectId) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('
            SELECT g.*, u.first_name AS grader_first, u.last_name AS grader_last
            FROM grades g
            JOIN users u ON g.graded_by = u.id
            WHERE g.project_id = :pid
            ORDER BY g.graded_at DESC
        ');
        $stmt->execute([':pid' => $projectId]);

        $grades = $stmt->fetchAll();

        // Calculate totals
        $totalScore = 0;
        $totalMax = 0;
        foreach ($grades as $g) {
            $totalScore += (float)$g['score'];
            $totalMax += (float)$g['max_score'];
        }

        echo json_encode([
            'grades' => $grades,
            'summary' => [
                'total_score' => $totalScore,
                'total_max' => $totalMax,
                'percentage' => $totalMax > 0 ? round(($totalScore / $totalMax) * 100, 2) : 0,
            ],
        ]);
    }
}
