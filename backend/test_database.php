<?php

require_once __DIR__ . '/config/Database.php';

try {
    $db = new Database();

    $database = $db->getDatabase();

    echo "<h2>HireHub Database Test</h2>";
    echo "Database Connection: WORKING ✅<br>";
    echo "Database Name: " . $database->getDatabaseName() . "<br>";

} catch (Throwable $e) {

    echo "<h2>Database Connection: FAILED ❌</h2>";
    echo "<pre>";
    echo $e->getMessage();
    echo "</pre>";
}