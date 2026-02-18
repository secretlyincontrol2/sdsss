<?php
require_once __DIR__ . '/config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    echo "Connected to database!\n";
} catch (Exception $e) {
    die("Connection Error: " . $e->getMessage() . "\n");
}

$sqlFile = __DIR__ . '/../database/update_phase8.sql';
if (!file_exists($sqlFile)) die("update_phase8.sql not found!\n");

echo "Running update_phase8.sql...\n";
$sql = file_get_contents($sqlFile);

try {
    $db->exec($sql);
    echo "Migration applied successfully!\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'already exists') !== false) {
        echo "Table already exists (skipping).\n";
    } else {
        echo "Error applying migration: " . $e->getMessage() . "\n";
    }
}
