<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {

    $database = new Database();
    $collection = $database->getDatabase()->users;

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON data"
        ]);
        exit;
    }

    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    // Default role
    $role = strtolower(trim($data['role'] ?? 'candidate'));

    if ($name === '' || $email === '' || $password === '') {
        echo json_encode([
            "success" => false,
            "message" => "Name, email and password are required"
        ]);
        exit;
    }

    // Only candidate and recruiter can register normally
    if (!in_array($role, ['candidate', 'recruiter'])) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid role"
        ]);
        exit;
    }

    $existingUser = $collection->findOne([
        "email" => $email
    ]);

    if ($existingUser) {
        echo json_encode([
            "success" => false,
            "message" => "Email already registered"
        ]);
        exit;
    }

    $hashedPassword = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    $result = $collection->insertOne([
        "name" => $name,
        "email" => $email,
        "password" => $hashedPassword,
        "role" => $role,
        "createdAt" => new MongoDB\BSON\UTCDateTime()
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Registration successful",
        "userId" => (string) $result->getInsertedId(),
        "role" => $role
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => "Registration failed",
        "error" => $e->getMessage()
    ]);
}