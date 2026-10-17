<?php
require_once __DIR__ . '/../config/cors.php';
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id, X-User-Role");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

try {

    /*
    |--------------------------------------------------------------------------
    | METHOD CHECK
    |--------------------------------------------------------------------------
    */

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

        http_response_code(405);

        echo json_encode([
            "success" => false,
            "message" => "Only POST requests are allowed"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION
    |--------------------------------------------------------------------------
    |
    | Resume upload is only available to candidates.
    |
    */

    $userId = $_SERVER['HTTP_X_USER_ID'] ?? '';
    $userRole = $_SERVER['HTTP_X_USER_ROLE'] ?? '';

    $userId = trim($userId);
    $userRole = strtolower(trim($userRole));


    /*
    |--------------------------------------------------------------------------
    | CHECK LOGIN
    |--------------------------------------------------------------------------
    */

    if ($userId === '' || $userRole === '') {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication required"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CHECK ROLE
    |--------------------------------------------------------------------------
    */

    if ($userRole !== 'candidate') {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Access denied. Only candidates can upload resumes."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CONNECT TO DATABASE
    |--------------------------------------------------------------------------
    */

    $database = new Database();

    $collection = $database->getDatabase()->resumes;


    /*
    |--------------------------------------------------------------------------
    | CHECK USER ID
    |--------------------------------------------------------------------------
    */

    if (!isset($_POST['userId']) || empty($_POST['userId'])) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "User ID is required"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | SECURITY CHECK
    |--------------------------------------------------------------------------
    |
    | The userId sent in FormData must match the authenticated user ID.
    |
    */

    $formUserId = trim($_POST['userId']);

    if ($formUserId !== $userId) {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "User ID does not match authenticated user"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CHECK RESUME FILE
    |--------------------------------------------------------------------------
    */

    if (!isset($_FILES['resume'])) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Resume file is required"
        ]);

        exit;
    }


    $file = $_FILES['resume'];


    /*
    |--------------------------------------------------------------------------
    | CHECK UPLOAD ERROR
    |--------------------------------------------------------------------------
    */

    if ($file['error'] !== UPLOAD_ERR_OK) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "File upload failed"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | FILE INFORMATION
    |--------------------------------------------------------------------------
    */

    $fileName = $file['name'];
    $fileSize = $file['size'];
    $tmpName = $file['tmp_name'];


    /*
    |--------------------------------------------------------------------------
    | FILE EXTENSION
    |--------------------------------------------------------------------------
    */

    $fileExtension = strtolower(
        pathinfo($fileName, PATHINFO_EXTENSION)
    );


    /*
    |--------------------------------------------------------------------------
    | ALLOWED FILE TYPES
    |--------------------------------------------------------------------------
    */

    $allowedExtensions = [
        'pdf',
        'doc',
        'docx'
    ];

    if (!in_array($fileExtension, $allowedExtensions, true)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Only PDF, DOC and DOCX files are allowed"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | MAXIMUM FILE SIZE
    |--------------------------------------------------------------------------
    */

    $maxSize = 5 * 1024 * 1024;

    if ($fileSize > $maxSize) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "File size must be less than 5 MB"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE UNIQUE FILE NAME
    |--------------------------------------------------------------------------
    */

    $newFileName =
        uniqid('resume_', true) .
        '.' .
        $fileExtension;


    /*
    |--------------------------------------------------------------------------
    | UPLOAD DIRECTORY
    |--------------------------------------------------------------------------
    */

    $uploadDirectory =
        __DIR__ . '/../../uploads/resumes/';


    /*
    |--------------------------------------------------------------------------
    | CREATE DIRECTORY
    |--------------------------------------------------------------------------
    */

    if (!is_dir($uploadDirectory)) {

        if (!mkdir($uploadDirectory, 0777, true)) {

            http_response_code(500);

            echo json_encode([
                "success" => false,
                "message" => "Unable to create resume upload directory"
            ]);

            exit;
        }
    }


    /*
    |--------------------------------------------------------------------------
    | FINAL FILE PATH
    |--------------------------------------------------------------------------
    */

    $filePath =
        $uploadDirectory .
        $newFileName;


    /*
    |--------------------------------------------------------------------------
    | MOVE FILE
    |--------------------------------------------------------------------------
    */

    if (!move_uploaded_file($tmpName, $filePath)) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Unable to save uploaded file"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | SAVE RESUME INFORMATION IN MONGODB
    |--------------------------------------------------------------------------
    */

    $result = $collection->insertOne([

        "userId" => $userId,

        "fileName" => $fileName,

        "storedFileName" => $newFileName,

        "fileType" => $fileExtension,

        "fileSize" => $fileSize,

        "filePath" =>
            "uploads/resumes/" .
            $newFileName,

        "uploadedAt" =>
            new MongoDB\BSON\UTCDateTime()

    ]);


    /*
    |--------------------------------------------------------------------------
    | SUCCESS RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([

        "success" => true,

        "message" =>
            "Resume uploaded successfully",

        "resumeId" =>
            (string) $result->getInsertedId(),

        "fileName" =>
            $fileName

    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Resume upload failed",

        "error" =>
            $e->getMessage()

    ]);
}