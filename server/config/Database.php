<?php

class Database {
    private static $instance = null;
    private $conn;

    private function __construct() {
        $host = getenv('DB_HOST') ?: 'dpg-d6aamu6mcj7s73dscrsg-a.oregon-postgres.render.com';
        $port = getenv('DB_PORT') ?: '5432';
        $dbname = getenv('DB_NAME') ?: 'group_7_p';
        $user = getenv('DB_USER') ?: 'group_7_p_user';
        $password = getenv('DB_PASSWORD') ?: 'ofVKfQ6CaF02GlPM1Vuh0IcxowDs7mCV';

        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";

        try {
            $this->conn = new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }
}
