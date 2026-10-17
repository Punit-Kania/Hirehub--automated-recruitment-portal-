<?php
require_once __DIR__ . '/../config/cors.php';
header("Content-Type: application/json");

$response = [
    "success" => true,
    "message" => "HireHub API is working successfully!"
];

echo json_encode($response);