<?php

class ProjectController {
    public static function index() {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        if ($auth['role'] === 'student') {
            // Get projects where user is owner OR member
            $stmt = $db->prepare('
                SELECT DISTINCT p.*, u.first_name AS supervisor_first, u.last_name AS supervisor_last
                FROM projects p
                LEFT JOIN users u ON p.supervisor_id = u.id
                LEFT JOIN project_members pm ON p.id = pm.project_id
                WHERE p.student_id = :user_id OR pm.user_id = :user_id
                ORDER BY p.created_at DESC
            ');
            $stmt->execute([':user_id' => $auth['user_id']]);
        } elseif ($auth['role'] === 'supervisor') {
            $stmt = $db->prepare('
                SELECT p.*, s.first_name AS student_first, s.last_name AS student_last, s.matric_number
                FROM projects p
                JOIN users s ON p.student_id = s.id
                WHERE p.supervisor_id = :user_id
                ORDER BY p.created_at DESC
            ');
            $stmt->execute([':user_id' => $auth['user_id']]);
        } else {
            $stmt = $db->query('
                SELECT p.*,
                    s.first_name AS student_first, s.last_name AS student_last, s.matric_number,
                    sv.first_name AS supervisor_first, sv.last_name AS supervisor_last
                FROM projects p
                JOIN users s ON p.student_id = s.id
                LEFT JOIN users sv ON p.supervisor_id = sv.id
                ORDER BY p.created_at DESC
            ');
        }

        echo json_encode(['projects' => $stmt->fetchAll()]);
    }

    public static function create($input) {
        $auth = AuthMiddleware::requireRole('student');

        if (empty($input['title'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Project title is required']);
            return;
        }

        $db = Database::getInstance()->getConnection();

        // Check if user is already a lead or member of an active project
        $check = $db->prepare('
            SELECT p.id FROM projects p
            LEFT JOIN project_members pm ON p.id = pm.project_id
            WHERE (p.student_id = :sid OR pm.user_id = :sid)
            AND p.status NOT IN (\'completed\', \'rejected\')
        ');
        $check->execute([':sid' => $auth['user_id']]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'You already have an active project']);
            return;
        }

        $stmt = $db->prepare('
            INSERT INTO projects (student_id, title, description)
            VALUES (:student_id, :title, :description)
            RETURNING id, student_id, title, description, status, created_at
        ');
        $stmt->execute([
            ':student_id' => $auth['user_id'],
            ':title' => $input['title'],
            ':description' => $input['description'] ?? null,
        ]);
        
        $project = $stmt->fetch();
        
        // Add creator as a member too (role=leader) for consistency, although student_id column exists
        // This is optional but good for querying "all members"
        $stm = $db->prepare("INSERT INTO project_members (project_id, user_id, role) VALUES (:pid, :uid, 'leader')");
        $stm->execute([':pid' => $project['id'], ':uid' => $auth['user_id']]);

        http_response_code(201);
        echo json_encode(['project' => $project]);

        Logger::log($auth['user_id'], 'CREATE_PROJECT', ['project_id' => $project['id'], 'title' => $project['title']]);
    }

    public static function show($id) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('
            SELECT p.*,
                s.first_name AS student_first, s.last_name AS student_last, s.email AS student_email, s.matric_number,
                sv.first_name AS supervisor_first, sv.last_name AS supervisor_last, sv.email AS supervisor_email
            FROM projects p
            JOIN users s ON p.student_id = s.id
            LEFT JOIN users sv ON p.supervisor_id = sv.id
            WHERE p.id = :id
        ');
        $stmt->execute([':id' => $id]);
        $project = $stmt->fetch();

        if (!$project) {
            http_response_code(404);
            echo json_encode(['error' => 'Project not found']);
            return;
        }

        // Check access: Owner, Supervisor, Admin, or Member
        $hasAccess = false;
        if ($auth['role'] === 'admin') $hasAccess = true;
        if ($auth['role'] === 'supervisor' && $project['supervisor_id'] == $auth['user_id']) $hasAccess = true;
        if ($auth['role'] === 'student') {
            if ($project['student_id'] == $auth['user_id']) {
                $hasAccess = true;
            } else {
                // Check membership
                $mem = $db->prepare('SELECT 1 FROM project_members WHERE project_id = :pid AND user_id = :uid');
                $mem->execute([':pid' => $id, ':uid' => $auth['user_id']]);
                if ($mem->fetch()) $hasAccess = true;
            }
        }

        if (!$hasAccess) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }
        
        // Fetch members
        $mStmt = $db->prepare('
            SELECT u.id, u.first_name, u.last_name, u.email, u.matric_number, pm.role 
            FROM project_members pm
            JOIN users u ON pm.user_id = u.id
            WHERE pm.project_id = :pid
        ');
        $mStmt->execute([':pid' => $id]);
        $project['members'] = $mStmt->fetchAll();

        echo json_encode(['project' => $project]);
    }

    public static function update($id, $input) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        // Check ownership (Only Leader can update details?)
        // Or any member? Let's say any member for collaboration.
        
        $check = $db->prepare('
            SELECT p.* FROM projects p
            LEFT JOIN project_members pm ON p.id = pm.project_id
            WHERE p.id = :id AND (p.student_id = :uid OR pm.user_id = :uid)
        ');
        $check->execute([':id' => $id, ':uid' => $auth['user_id']]);
        $project = $check->fetch();

        if (!$project && $auth['role'] !== 'admin') { // Admins can probably update too
             http_response_code(403);
             echo json_encode(['error' => 'Access denied']);
             return;
        }

        $title = $input['title'] ?? $project['title'];
        $description = $input['description'] ?? $project['description'];
        $status = $input['status'] ?? $project['status'];

        $stmt = $db->prepare('
            UPDATE projects SET title = :title, description = :description, status = :status, updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
            RETURNING *
        ');
        $stmt->execute([':title' => $title, ':description' => $description, ':status' => $status, ':id' => $id]);

        echo json_encode(['project' => $stmt->fetch()]);
    }

    public static function addMember($projectId, $input) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        // 1. Check if requester is the project leader
        $p = $db->prepare("SELECT student_id FROM projects WHERE id = ?");
        $p->execute([$projectId]);
        $project = $p->fetch();

        if (!$project || $project['student_id'] != $auth['user_id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Only the project leader can add members']);
            return;
        }

        $email = $input['email'] ?? '';
        if (!$email) {
            http_response_code(400);
            echo json_encode(['error' => 'Email is required']);
            return;
        }

        // 2. Find user by email
        $u = $db->prepare("SELECT id, role FROM users WHERE email = ?");
        $u->execute([$email]);
        $userToAdd = $u->fetch();

        if (!$userToAdd) {
             http_response_code(404);
             echo json_encode(['error' => 'User not found']);
             return;
        }
        
        if ($userToAdd['role'] !== 'student') {
             http_response_code(400);
             echo json_encode(['error' => 'Only students can be added to projects']);
             return;
        }

        // 3. Check if they are already in a project
        // (Optional strict rule: student can only be in one project)
        $chk = $db->prepare('
            SELECT p.id FROM projects p
            LEFT JOIN project_members pm ON p.id = pm.project_id
            WHERE (p.student_id = :uid OR pm.user_id = :uid)
            AND p.status NOT IN (\'completed\', \'rejected\')
        ');
        $chk->execute([':uid' => $userToAdd['id']]);
        if ($chk->fetch()) {
             http_response_code(409);
             echo json_encode(['error' => 'This student is already in an active project']);
             return;
        }

        // 4. Add member
        try {
            $ins = $db->prepare("INSERT INTO project_members (project_id, user_id) VALUES (?, ?)");
            $ins->execute([$projectId, $userToAdd['id']]);
            echo json_encode(['success' => true, 'message' => 'Member added successfully']);
            Logger::log($auth['user_id'], 'ADD_MEMBER', ['project_id' => $projectId, 'added_user_id' => $userToAdd['id']]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Could not add member: ' . $e->getMessage()]);
        }
    }
    
    public static function removeMember($projectId, $userId) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        // Check ownership
        $p = $db->prepare("SELECT student_id FROM projects WHERE id = ?");
        $p->execute([$projectId]);
        $project = $p->fetch();

        if (!$project || $project['student_id'] != $auth['user_id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Only project leader can remove members']);
            return;
        }
        
        if ($userId == $project['student_id']) {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot remove the project leader']);
            return;
        }

        $del = $db->prepare("DELETE FROM project_members WHERE project_id = ? AND user_id = ?");
        $del->execute([$projectId, $userId]);

        echo json_encode(['success' => true]);
    }
}
