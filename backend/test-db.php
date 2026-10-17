<?php

require_once __DIR__ . '/config/database.php';

try {
    $db = new Database();

    echo "MongoDB Connected Successfully!";
} catch (Exception $e) {
    echo "Database Connection Failed: " . $e->getMessage();
}