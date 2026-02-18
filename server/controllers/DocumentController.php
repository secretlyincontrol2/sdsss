<?php

class DocumentController {
    private static $uploadDir;

    private static function getUploadDir() {
        if (!self::$uploadDir) {
            self::$uploadDir = __DIR__ . '/../storage/documents/';
            if (!is_dir(self::$uploadDir)) {
                mkdir(self::$uploadDir, 0755, true);
            }
        }
        return self::$uploadDir;
    }

    public static function upload() {
        $auth = AuthMiddleware::requireRole('student');

        if (empty($_FILES['file']) || empty($_POST['project_id']) || empty($_POST['document_type'])) {
            http_response_code(400);
            echo json_encode(['error' => 'File, project_id, and document_type are required']);
            return;
        }

        $file = $_FILES['file'];
        $projectId = (int)$_POST['project_id'];
        $docType = $_POST['document_type'];

        // Validate file size (50MB max)
        if ($file['size'] > 50 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['error' => 'File size exceeds 50MB limit']);
            return;
        }

        $db = Database::getInstance()->getConnection();

        // Verify project ownership
        $check = $db->prepare('SELECT id FROM projects WHERE id = :pid AND student_id = :sid');
        $check->execute([':pid' => $projectId, ':sid' => $auth['user_id']]);
        if (!$check->fetch()) {
            http_response_code(403);
            echo json_encode(['error' => 'Project not found or access denied']);
            return;
        }

        // Check for existing documents of same type — version control
        $existing = $db->prepare('
            SELECT MAX(version) as max_version FROM documents
            WHERE project_id = :pid AND document_type = :dtype
        ');
        $existing->execute([':pid' => $projectId, ':dtype' => $docType]);
        $result = $existing->fetch();
        $newVersion = ($result['max_version'] ?? 0) + 1;

        // Mark old versions as not current
        $db->prepare('UPDATE documents SET is_current = FALSE WHERE project_id = :pid AND document_type = :dtype')
           ->execute([':pid' => $projectId, ':dtype' => $docType]);

        // Save file
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = "project_{$projectId}_{$docType}_v{$newVersion}.{$ext}";
        $filePath = self::getUploadDir() . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save file']);
            return;
        }

        $stmt = $db->prepare('
            INSERT INTO documents (project_id, document_type, file_name, file_path, file_size, version, is_current)
            VALUES (:pid, :dtype, :fname, :fpath, :fsize, :version, TRUE)
            RETURNING *
        ');
        $stmt->execute([
            ':pid' => $projectId,
            ':dtype' => $docType,
            ':fname' => $file['name'],
            ':fpath' => $filePath,
            ':fsize' => $file['size'],
            ':version' => $newVersion,
        ]);

        $doc = $stmt->fetch();

        // Notify supervisor
        $proj = $db->prepare('SELECT supervisor_id, title FROM projects WHERE id = :id');
        $proj->execute([':id' => $projectId]);
        $project = $proj->fetch();

        if ($project['supervisor_id']) {
            $db->prepare('
                INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
                VALUES (:uid, :type, :title, :msg, :rtype, :rid)
            ')->execute([
                ':uid' => $project['supervisor_id'],
                ':type' => 'document_uploaded',
                ':title' => 'New Document Uploaded',
                ':msg' => "A new version of {$docType} (v{$newVersion}) has been uploaded for: {$project['title']}",
                ':rtype' => 'document',
                ':rid' => $doc['id'],
            ]);
        }

        http_response_code(201);
        echo json_encode(['document' => $doc]);
    }

    public static function getByProject($projectId) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('
            SELECT * FROM documents
            WHERE project_id = :pid AND is_current = TRUE
            ORDER BY document_type, uploaded_at DESC
        ');
        $stmt->execute([':pid' => $projectId]);

        echo json_encode(['documents' => $stmt->fetchAll()]);
    }

    public static function getVersions($documentId) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('
            SELECT d2.* FROM documents d2
            JOIN documents d1 ON d1.project_id = d2.project_id AND d1.document_type = d2.document_type
            WHERE d1.id = :did
            ORDER BY d2.version DESC
        ');
        $stmt->execute([':did' => $documentId]);

        echo json_encode(['versions' => $stmt->fetchAll()]);
    }

    public static function download($id) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('SELECT * FROM documents WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $doc = $stmt->fetch();

        if (!$doc || !file_exists($doc['file_path'])) {
            http_response_code(404);
            echo json_encode(['error' => 'Document not found']);
            return;
        }

        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $doc['file_name'] . '"');
        header('Content-Length: ' . filesize($doc['file_path']));
        readfile($doc['file_path']);
        exit;
    }

    public static function getComments($documentId) {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('
            SELECT dc.*, u.first_name, u.last_name, u.role
            FROM document_comments dc
            JOIN users u ON dc.user_id = u.id
            WHERE dc.document_id = :did
            ORDER BY dc.created_at ASC
        ');
        $stmt->execute([':did' => $documentId]);

        echo json_encode(['comments' => $stmt->fetchAll()]);
    }

    public static function addComment($documentId, $input) {
        $auth = AuthMiddleware::authenticate();

        if (empty($input['comment'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Comment is required']);
            return;
        }

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('
            INSERT INTO document_comments (document_id, user_id, comment)
            VALUES (:did, :uid, :comment)
            RETURNING *
        ');
        $stmt->execute([
            ':did' => $documentId,
            ':uid' => $auth['user_id'],
            ':comment' => $input['comment'],
        ]);

        http_response_code(201);
        echo json_encode(['comment' => $stmt->fetch()]);
    }
}
