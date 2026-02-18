<?php

class AuthController {
    public static function register($input) {
        $required = ['email', 'password', 'first_name', 'last_name', 'role'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '$field' is required"]);
                return;
            }
        }

        $validRoles = ['student', 'supervisor', 'admin'];
        if (!in_array($input['role'], $validRoles)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid role']);
            return;
        }

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('SELECT id FROM users WHERE email = :email');
        $stmt->execute([':email' => $input['email']]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already registered']);
            return;
        }

        $passwordHash = password_hash($input['password'], PASSWORD_BCRYPT);

        $stmt = $db->prepare('
            INSERT INTO users (email, password_hash, first_name, last_name, role, department, matric_number, staff_id, phone)
            VALUES (:email, :password_hash, :first_name, :last_name, :role, :department, :matric_number, :staff_id, :phone)
            RETURNING id
        ');

        $stmt->execute([
            ':email' => $input['email'],
            ':password_hash' => $passwordHash,
            ':first_name' => $input['first_name'],
            ':last_name' => $input['last_name'],
            ':role' => $input['role'],
            ':department' => $input['department'] ?? null,
            ':matric_number' => $input['matric_number'] ?? null,
            ':staff_id' => $input['staff_id'] ?? null,
            ':phone' => $input['phone'] ?? null,
        ]);

        $userId = $stmt->fetchColumn();

        $token = JWTHandler::encode([
            'user_id' => $userId,
            'email' => $input['email'],
            'role' => $input['role'],
        ]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Registration successful',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'email' => $input['email'],
                'first_name' => $input['first_name'],
                'last_name' => $input['last_name'],
                'role' => $input['role'],
            ],
        ]);

        Logger::log($userId, 'REGISTER', ['email' => $input['email'], 'role' => $input['role']]);
    }

    public static function login($input) {
        if (empty($input['email']) || empty($input['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('SELECT * FROM users WHERE email = :email AND is_active = TRUE');
        $stmt->execute([':email' => $input['email']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($input['password'], $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            return;
        }

        $token = JWTHandler::encode([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
        ]);

        echo json_encode([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'role' => $user['role'],
                'department' => $user['department'],
                'avatar_url' => $user['avatar_url'],
            ],
        ]);

        Logger::log($user['id'], 'LOGIN', ['email' => $user['email']]);
    }

    public static function me() {
        $auth = AuthMiddleware::authenticate();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare('SELECT id, email, first_name, last_name, role, department, matric_number, staff_id, phone, avatar_url, created_at FROM users WHERE id = :id');
        $stmt->execute([':id' => $auth['user_id']]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }

        echo json_encode(['user' => $user]);
    }
}
