<?php
require_once __DIR__ . '/config/Database.php';

$db = Database::getInstance()->getConnection();

$email = 'admin@babcock.edu.ng';
$password = 'password123';
$hash = password_hash($password, PASSWORD_BCRYPT);

// Check if admin exists
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
    // Update password
    $update = $db->prepare('UPDATE users SET password_hash = ?, role = \'admin\', is_active = true WHERE email = ?');
    $update->execute([$hash, $email]);
    echo "Admin password reset successfully for $email\n";
} else {
    // Create admin
    $insert = $db->prepare('
        INSERT INTO users (email, password_hash, first_name, last_name, role, department, staff_id, is_active)
        VALUES (?, ?, \'System\', \'Admin\', \'admin\', \'IT\', \'ADMIN01\', true)
    ');
    $insert->execute([$email, $hash]);
    echo "Admin account created successfully for $email\n";
}

echo "New Password: $password\n";
