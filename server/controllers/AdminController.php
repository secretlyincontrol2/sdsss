<?php

class AdminController {
    public static function listUsers() {
        $auth = AuthMiddleware::requireRole('admin');
        $db = Database::getInstance()->getConnection();

        $stmt = $db->query('
            SELECT id, email, first_name, last_name, role, department, matric_number, staff_id, phone, is_active, created_at
            FROM users
            ORDER BY role, last_name ASC
        ');

        echo json_encode(['users' => $stmt->fetchAll()]);
    }

    public static function updateUser($id, $input) {
        $auth = AuthMiddleware::requireRole('admin');
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('SELECT * FROM users WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }

        $stmt = $db->prepare('
            UPDATE users SET
                first_name = :first_name,
                last_name = :last_name,
                role = :role,
                department = :department,
                is_active = :is_active,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
            RETURNING id, email, first_name, last_name, role, department, is_active
        ');
        $stmt->execute([
            ':first_name' => $input['first_name'] ?? $user['first_name'],
            ':last_name' => $input['last_name'] ?? $user['last_name'],
            ':role' => $input['role'] ?? $user['role'],
            ':department' => $input['department'] ?? $user['department'],
            ':is_active' => isset($input['is_active']) ? (bool)$input['is_active'] : $user['is_active'],
            ':id' => $id,
        ]);

        echo json_encode(['user' => $stmt->fetch()]);
    }

    public static function deleteUser($id) {
        $auth = AuthMiddleware::requireRole('admin');
        $db = Database::getInstance()->getConnection();

        $db->prepare('DELETE FROM users WHERE id = :id')->execute([':id' => $id]);
        echo json_encode(['success' => true, 'message' => 'User deleted']);
    }

    public static function allocateSupervisor($input) {
        $auth = AuthMiddleware::requireRole('admin');

        if (empty($input['student_id']) || empty($input['supervisor_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'student_id and supervisor_id are required']);
            return;
        }

        $db = Database::getInstance()->getConnection();

        // Verify roles
        $student = $db->prepare('SELECT id, first_name, last_name FROM users WHERE id = :id AND role = \'student\'');
        $student->execute([':id' => $input['student_id']]);
        if (!$student->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid student ID']);
            return;
        }

        $supervisor = $db->prepare('SELECT id, first_name, last_name FROM users WHERE id = :id AND role = \'supervisor\'');
        $supervisor->execute([':id' => $input['supervisor_id']]);
        $supInfo = $supervisor->fetch();
        if (!$supInfo) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid supervisor ID']);
            return;
        }

        // Update project assignment
        $stmt = $db->prepare('
            UPDATE projects SET supervisor_id = :sid, updated_at = CURRENT_TIMESTAMP
            WHERE student_id = :stid AND status NOT IN (\'completed\', \'rejected\')
            RETURNING *
        ');
        $stmt->execute([':sid' => $input['supervisor_id'], ':stid' => $input['student_id']]);
        $project = $stmt->fetch();

        // Notify both parties
        $db->prepare('
            INSERT INTO notifications (user_id, type, title, message) VALUES (:uid, :type, :title, :msg)
        ')->execute([
            ':uid' => $input['student_id'],
            ':type' => 'supervisor_assigned',
            ':title' => 'Supervisor Assigned',
            ':msg' => "You have been assigned to {$supInfo['first_name']} {$supInfo['last_name']} as your project supervisor.",
        ]);

        $db->prepare('
            INSERT INTO notifications (user_id, type, title, message) VALUES (:uid, :type, :title, :msg)
        ')->execute([
            ':uid' => $input['supervisor_id'],
            ':type' => 'student_assigned',
            ':title' => 'New Student Assigned',
            ':msg' => 'A new student has been assigned to you for project supervision.',
        ]);

        echo json_encode(['success' => true, 'project' => $project]);
    }

    public static function analytics() {
        $auth = AuthMiddleware::requireRole('admin');
        $db = Database::getInstance()->getConnection();

        $totalUsers = $db->query('SELECT COUNT(*) as count FROM users')->fetch()['count'];
        $totalStudents = $db->query('SELECT COUNT(*) as count FROM users WHERE role = \'student\'')->fetch()['count'];
        $totalSupervisors = $db->query('SELECT COUNT(*) as count FROM users WHERE role = \'supervisor\'')->fetch()['count'];
        $totalProjects = $db->query('SELECT COUNT(*) as count FROM projects')->fetch()['count'];

        $projectsByStatus = $db->query('
            SELECT status, COUNT(*) as count FROM projects GROUP BY status
        ')->fetchAll();

        $supervisorWorkload = $db->query('
            SELECT u.id, u.first_name, u.last_name, COUNT(p.id) as project_count
            FROM users u
            LEFT JOIN projects p ON u.id = p.supervisor_id AND p.status NOT IN (\'completed\', \'rejected\')
            WHERE u.role = \'supervisor\'
            GROUP BY u.id, u.first_name, u.last_name
            ORDER BY project_count DESC
        ')->fetchAll();

        $recentActivity = $db->query('
            SELECT n.type, n.title, n.created_at, u.first_name, u.last_name
            FROM notifications n
            JOIN users u ON n.user_id = u.id
            ORDER BY n.created_at DESC
            LIMIT 20
        ')->fetchAll();

        echo json_encode([
            'stats' => [
                'total_users' => (int)$totalUsers,
                'total_students' => (int)$totalStudents,
                'total_supervisors' => (int)$totalSupervisors,
                'total_projects' => (int)$totalProjects,
            ],
            'projects_by_status' => $projectsByStatus,
            'supervisor_workload' => $supervisorWorkload,
            'recent_activity' => $recentActivity,
        ]);
    }
    public static function getLogs() {
        $auth = AuthMiddleware::requireRole('admin');
        $db = Database::getInstance()->getConnection();

        $stmt = $db->query("
            SELECT l.*, u.email, u.first_name, u.last_name 
            FROM audit_logs l 
            LEFT JOIN users u ON l.user_id = u.id 
            ORDER BY l.created_at DESC 
            LIMIT 100
        ");
        
        echo json_encode(['logs' => $stmt->fetchAll()]);
    }
}
