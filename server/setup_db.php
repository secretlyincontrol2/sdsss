<?php
require_once __DIR__ . '/config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    echo "Connected to database!\n\n";
} catch (Exception $e) {
    die("Connection Error: " . $e->getMessage() . "\n");
}

// Run schema.sql
$schemaFile = __DIR__ . '/../database/schema.sql';
if (!file_exists($schemaFile)) die("schema.sql not found!\n");

echo "Running schema.sql...\n";
$sql = file_get_contents($schemaFile);

try {
    $db->exec($sql);
    echo "Schema created!\n";
} catch (PDOException $e) {
    echo "Multi-statement failed, trying one by one...\n";
    $statements = array_filter(array_map('trim', explode(';', $sql)), function($s) {
        $s = trim($s);
        if (empty($s)) return false;
        $lines = array_filter(explode("\n", $s), function($l) {
            $l = trim($l); return $l !== '' && strpos($l, '--') !== 0;
        });
        return !empty($lines);
    });
    $ok = 0;
    foreach ($statements as $stmt) {
        try { $db->exec($stmt); $ok++; }
        catch (PDOException $ex) {
            if (strpos($ex->getMessage(), 'already exists') === false)
                echo "  ERR: " . $ex->getMessage() . "\n";
        }
    }
    echo "Schema: $ok statements executed\n";
}

// Run seed.sql
$seedFile = __DIR__ . '/../database/seed.sql';
if (file_exists($seedFile)) {
    echo "\nRunning seed.sql...\n";
    $sql = file_get_contents($seedFile);
    try {
        $db->exec($sql);
        echo "Seed data inserted!\n";
    } catch (PDOException $e) {
        $statements = array_filter(array_map('trim', explode(';', $sql)), 'strlen');
        $ok = 0;
        foreach ($statements as $stmt) {
            try { $db->exec(trim($stmt)); $ok++; }
            catch (PDOException $ex) { /* skip duplicates */ }
        }
        echo "Seed: $ok statements executed\n";
    }
}

echo "\nDone!\n";
