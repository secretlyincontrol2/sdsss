<?php
require_once __DIR__ . '/config/Database.php';

$db = Database::getInstance()->getConnection();

$sqlFile = __DIR__ . '/../database/update_phase9.sql';
$sql = file_get_contents($sqlFile);

if ($sql === false) {
    die("Error reading SQL file");
}

try {
    $db->exec($sql);
    echo "Phase 9 Migration (Audit Logs) applied successfully!\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
