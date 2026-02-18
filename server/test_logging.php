<?php
require_once __DIR__ . '/utils/Logger.php';

try {
    Logger::log(1, 'TEST_LOG', 'Testing audit logs from script');
    echo "Log created successfully\n";
} catch (Exception $e) {
    echo "Log failed: " . $e->getMessage() . "\n";
}
