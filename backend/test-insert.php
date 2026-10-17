<?php

require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();

    $collection = $database->getDatabase()->system;

    $result = $collection->insertOne([
        'project' => 'HireHub',
        'message' => 'First MongoDB document',
        'createdAt' => new MongoDB\BSON\UTCDateTime()
    ]);

    echo "Document inserted successfully!<br>";
    echo "Inserted ID: " . $result->getInsertedId();

} catch (Exception $e) {
    echo "Insert Failed: " . $e->getMessage();
}