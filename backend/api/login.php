<?php
require_once __DIR__ . '/../config/cors.php';
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';


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

    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if ($email === '' || $password === '') {
        echo json_encode([
            "success" => false,
            "message" => "Email and password are required"
        ]);
        exit;
    }

    $user = $collection->findOne([
        "email" => $email
    ]);

    if (!$user) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password"
        ]);
        exit;
    }

    if (!password_verify($password, $user['password'])) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password"
        ]);
        exit;
    }

    // Existing old users may not have a role.
    // Treat them as candidate for backward compatibility.
    $role = $user['role'] ?? 'candidate';

    $userId = (string) $user['_id'];

    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "user" => [
            "_id" => $userId,
            "id" => $userId,
            "name" => $user['name'],
            "email" => $user['email'],
            "role" => $role
        ]
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => "Login failed",
        "error" => $e->getMessage()
    ]);
}
