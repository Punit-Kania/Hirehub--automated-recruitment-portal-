<?php
require_once __DIR__ . '/../config/cors.php';
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id, X-User-Role");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';


try {

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    $auth = requireAuth();


    /*
    |--------------------------------------------------------------------------
    | GET AUTHENTICATED USER ID
    |--------------------------------------------------------------------------
    */

    $authenticatedUserId = "";

    if (is_array($auth)) {

        $authenticatedUserId =
            $auth['_id'] ??
            $auth['id'] ??
            $auth['userId'] ??
            "";
    }

    $authenticatedUserId =
        trim((string) $authenticatedUserId);


    /*
    |--------------------------------------------------------------------------
    | GET AUTHENTICATED USER ROLE
    |--------------------------------------------------------------------------
    */

    $authenticatedRole = "";

    if (is_array($auth)) {

        $authenticatedRole =
            $auth['role'] ??
            "";
    }

    $authenticatedRole =
        strtolower(trim((string) $authenticatedRole));


    /*
    |--------------------------------------------------------------------------
    | CHECK AUTHENTICATED USER
    |--------------------------------------------------------------------------
    */

    if ($authenticatedUserId === "") {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication required."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | ONLY CANDIDATES
    |--------------------------------------------------------------------------
    */

    if ($authenticatedRole !== "candidate") {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" =>
                "Access denied. Only candidates can access candidate profiles."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | DATABASE CONNECTION
    |--------------------------------------------------------------------------
    */

    $database = new Database();

    $collection =
        $database->getDatabase()->profiles;


    /*
    |--------------------------------------------------------------------------
    | REQUEST METHOD
    |--------------------------------------------------------------------------
    */

    $method =
        $_SERVER['REQUEST_METHOD'];


    /*
    |--------------------------------------------------------------------------
    | GET PROFILE
    |--------------------------------------------------------------------------
    */

    if ($method === 'GET') {

        /*
        | Get requested user ID.
        |
        | If no userId is supplied, automatically use
        | the authenticated user's ID.
        */

        $requestedUserId =
            $_GET['userId'] ?? "";

        $requestedUserId =
            trim((string) $requestedUserId);


        if ($requestedUserId === "") {

            $requestedUserId =
                $authenticatedUserId;
        }


        /*
        |--------------------------------------------------------------------------
        | OWNERSHIP CHECK
        |--------------------------------------------------------------------------
        |
        | Candidate can only view their own profile.
        |
        */

        if ($requestedUserId !== $authenticatedUserId) {

            http_response_code(403);

            echo json_encode([
                "success" => false,
                "message" =>
                    "Access denied. You can only view your own profile."
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | FIND PROFILE
        |--------------------------------------------------------------------------
        */

        $profile =
            $collection->findOne([
                "userId" =>
                    $authenticatedUserId
            ]);


        /*
        |--------------------------------------------------------------------------
        | PROFILE FOUND
        |--------------------------------------------------------------------------
        */

        if ($profile) {

            echo json_encode([

                "success" => true,

                "profile" => [

                    "id" =>
                        (string) $profile['_id'],

                    "userId" =>
                        (string) $profile['userId'],

                    "phone" =>
                        $profile['phone'] ?? "",

                    "location" =>
                        $profile['location'] ?? "",

                    "education" =>
                        $profile['education'] ?? "",

                    "skills" =>
                        $profile['skills'] ?? [],

                    "experience" =>
                        $profile['experience'] ?? ""
                ]
            ]);

        } else {

            /*
            | Profile does not exist yet.
            |
            | This is not a server error.
            */

            echo json_encode([

                "success" => false,

                "message" =>
                    "Profile not found"
            ]);
        }

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | POST / CREATE OR UPDATE PROFILE
    |--------------------------------------------------------------------------
    */

    if ($method === 'POST') {

        /*
        |--------------------------------------------------------------------------
        | READ JSON DATA
        |--------------------------------------------------------------------------
        */

        $rawData =
            file_get_contents("php://input");


        $data =
            json_decode(
                $rawData,
                true
            );


        if (!is_array($data)) {

            http_response_code(400);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Invalid JSON data"
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | IMPORTANT SECURITY RULE
        |--------------------------------------------------------------------------
        |
        | DO NOT TRUST userId FROM FRONTEND.
        |
        | Always use the authenticated user's ID.
        |
        */

        $userId =
            $authenticatedUserId;


        /*
        |--------------------------------------------------------------------------
        | GET PROFILE DATA
        |--------------------------------------------------------------------------
        */

        $phone =
            trim((string) (
                $data['phone'] ?? ""
            ));


        $location =
            trim((string) (
                $data['location'] ?? ""
            ));


        $education =
            trim((string) (
                $data['education'] ?? ""
            ));


        $skills =
            $data['skills'] ?? [];


        $experience =
            trim((string) (
                $data['experience'] ?? ""
            ));


        /*
        |--------------------------------------------------------------------------
        | SKILLS MUST BE ARRAY
        |--------------------------------------------------------------------------
        */

        if (!is_array($skills)) {

            $skills = [];
        }


        /*
        |--------------------------------------------------------------------------
        | CLEAN SKILLS
        |--------------------------------------------------------------------------
        */

        $cleanSkills = [];

        foreach ($skills as $skill) {

            if (is_string($skill)) {

                $skill =
                    trim($skill);

                if ($skill !== "") {

                    $cleanSkills[] =
                        $skill;
                }
            }
        }


        /*
        | Remove duplicate skills
        */

        $cleanSkills =
            array_values(
                array_unique(
                    $cleanSkills
                )
            );


        /*
        |--------------------------------------------------------------------------
        | FIND EXISTING PROFILE
        |--------------------------------------------------------------------------
        */

        $existingProfile =
            $collection->findOne([

                "userId" =>
                    $userId
            ]);


        /*
        |--------------------------------------------------------------------------
        | UPDATE EXISTING PROFILE
        |--------------------------------------------------------------------------
        */

        if ($existingProfile) {

            $collection->updateOne(

                [
                    "userId" =>
                        $userId
                ],

                [
                    '$set' => [

                        "phone" =>
                            $phone,

                        "location" =>
                            $location,

                        "education" =>
                            $education,

                        "skills" =>
                            $cleanSkills,

                        "experience" =>
                            $experience,

                        "updatedAt" =>
                            new MongoDB\BSON\UTCDateTime()
                    ]
                ]
            );


            echo json_encode([

                "success" => true,

                "message" =>
                    "Profile updated successfully"
            ]);

        }


        /*
        |--------------------------------------------------------------------------
        | CREATE NEW PROFILE
        |--------------------------------------------------------------------------
        */

        else {

            $result =
                $collection->insertOne([

                    "userId" =>
                        $userId,

                    "phone" =>
                        $phone,

                    "location" =>
                        $location,

                    "education" =>
                        $education,

                    "skills" =>
                        $cleanSkills,

                    "experience" =>
                        $experience,

                    "createdAt" =>
                        new MongoDB\BSON\UTCDateTime()
                ]);


            echo json_encode([

                "success" => true,

                "message" =>
                    "Profile created successfully",

                "profileId" =>
                    (string)
                    $result->getInsertedId()
            ]);
        }

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | METHOD NOT ALLOWED
    |--------------------------------------------------------------------------
    */

    http_response_code(405);

    echo json_encode([

        "success" => false,

        "message" =>
            "Method not allowed"
    ]);


} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Profile operation failed",

        "error" =>
            $e->getMessage()
    ]);
}

?>