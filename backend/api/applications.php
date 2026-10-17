<?php
require_once __DIR__ . '/../config/cors.php';
//header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
//header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id, X-User-Role");
header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| CORS PREFLIGHT
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);

    exit;
}


require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';


try {

    $database = new Database();

    $db = $database->getDatabase();

    $collection = $db->applications;

    $jobsCollection = $db->jobs;

    $method = $_SERVER['REQUEST_METHOD'];


    /*
    |--------------------------------------------------------------------------
    | GET APPLICATIONS
    |--------------------------------------------------------------------------
    |
    | Candidate:
    |   View only own applications.
    |
    | Recruiter:
    |   View only applications belonging to own jobs.
    |
    |--------------------------------------------------------------------------
    */

    if ($method === 'GET') {

        $auth = requireAuth();

        $role = $auth['role'];
        $userId = $auth['userId'];


        /*
        |--------------------------------------------------------------------------
        | CANDIDATE - OWN APPLICATIONS
        |--------------------------------------------------------------------------
        */

        if (isset($_GET['userId'])) {

            if ($role !== 'candidate') {

                http_response_code(403);

                echo json_encode([
                    "success" => false,
                    "message" =>
                        "Access denied. Only candidates can view candidate applications."
                ]);

                exit;
            }


            $requestedUserId =
                trim(
                    (string) $_GET['userId']
                );


            /*
            |--------------------------------------------------------------------------
            | OWNERSHIP CHECK
            |--------------------------------------------------------------------------
            */

            if ($requestedUserId !== $userId) {

                http_response_code(403);

                echo json_encode([
                    "success" => false,
                    "message" =>
                        "Access denied. You can only view your own applications."
                ]);

                exit;
            }


            $applications =
                $collection->find(
                    [
                        "userId" => $userId
                    ],
                    [
                        "sort" => [
                            "appliedAt" => -1
                        ]
                    ]
                )->toArray();


            $applicationList = [];


            foreach ($applications as $application) {

                $applicationList[] = [

                    "id" =>
                        isset($application['_id'])
                            ? (string) $application['_id']
                            : '',

                    "userId" =>
                        $application['userId'] ?? '',

                    "jobId" =>
                        $application['jobId'] ?? '',

                    "recruiterId" =>
                        $application['recruiterId'] ?? '',

                    "jobTitle" =>
                        $application['jobTitle'] ?? '',

                    "company" =>
                        $application['company'] ?? '',

                    "status" =>
                        $application['status'] ?? '',

                    "appliedAt" =>
                        isset($application['appliedAt'])
                            ? $application['appliedAt']
                                ->toDateTime()
                                ->format('Y-m-d H:i:s')
                            : '',

                    "updatedAt" =>
                        isset($application['updatedAt'])
                            ? $application['updatedAt']
                                ->toDateTime()
                                ->format('Y-m-d H:i:s')
                            : ''

                ];

            }


            echo json_encode([

                "success" => true,

                "count" =>
                    count($applicationList),

                "applications" =>
                    $applicationList

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | RECRUITER - OWN JOB APPLICATIONS
        |--------------------------------------------------------------------------
        */

        if (isset($_GET['recruiterId'])) {

            if ($role !== 'recruiter') {

                http_response_code(403);

                echo json_encode([
                    "success" => false,
                    "message" =>
                        "Access denied. Only recruiters can view recruiter applications."
                ]);

                exit;
            }


            $requestedRecruiterId =
                trim(
                    (string) $_GET['recruiterId']
                );


            /*
            |--------------------------------------------------------------------------
            | OWNERSHIP CHECK
            |--------------------------------------------------------------------------
            */

            if (
                $requestedRecruiterId !==
                $userId
            ) {

                http_response_code(403);

                echo json_encode([
                    "success" => false,
                    "message" =>
                        "Access denied. You can only view your own applications."
                ]);

                exit;
            }


            $applications =
                $collection->find(
                    [
                        "recruiterId" => $userId
                    ],
                    [
                        "sort" => [
                            "appliedAt" => -1
                        ]
                    ]
                )->toArray();


            $applicationList = [];


            foreach ($applications as $application) {

                $applicationList[] = [

                    "id" =>
                        isset($application['_id'])
                            ? (string) $application['_id']
                            : '',

                    "userId" =>
                        $application['userId'] ?? '',

                    "jobId" =>
                        $application['jobId'] ?? '',

                    "recruiterId" =>
                        $application['recruiterId'] ?? '',

                    "jobTitle" =>
                        $application['jobTitle'] ?? '',

                    "company" =>
                        $application['company'] ?? '',

                    "status" =>
                        $application['status'] ?? '',

                    "appliedAt" =>
                        isset($application['appliedAt'])
                            ? $application['appliedAt']
                                ->toDateTime()
                                ->format('Y-m-d H:i:s')
                            : '',

                    "updatedAt" =>
                        isset($application['updatedAt'])
                            ? $application['updatedAt']
                                ->toDateTime()
                                ->format('Y-m-d H:i:s')
                            : ''

                ];

            }


            echo json_encode([

                "success" => true,

                "count" =>
                    count($applicationList),

                "applications" =>
                    $applicationList

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | NO QUERY
        |--------------------------------------------------------------------------
        */

        http_response_code(400);

        echo json_encode([

            "success" => false,

            "message" =>
                "Please provide userId or recruiterId."

        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | POST - APPLY FOR JOB
    |--------------------------------------------------------------------------
    |
    | Candidate only.
    |--------------------------------------------------------------------------
    */

    if ($method === 'POST') {

        $auth =
            requireCandidate();


        $userId =
            $auth['userId'];


        /*
        |--------------------------------------------------------------------------
        | READ JSON
        |--------------------------------------------------------------------------
        */

        $data =
            json_decode(
                file_get_contents("php://input"),
                true
            );


        if (!is_array($data)) {

            http_response_code(400);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Invalid JSON data."

            ]);

            exit;
        }


        $jobId =
            trim(
                (string) (
                    $data['jobId'] ?? ''
                )
            );


        if ($jobId === '') {

            http_response_code(400);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Job ID is required."

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE JOB ID
        |--------------------------------------------------------------------------
        */

        if (
            !preg_match(
                '/^[a-f0-9]{24}$/i',
                $jobId
            )
        ) {

            http_response_code(400);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Invalid Job ID."

            ]);

            exit;
        }


        $jobObjectId =
            new MongoDB\BSON\ObjectId(
                $jobId
            );


        /*
        |--------------------------------------------------------------------------
        | FIND ACTIVE JOB
        |--------------------------------------------------------------------------
        */

        $job =
            $jobsCollection->findOne([

                "_id" =>
                    $jobObjectId,

                "status" =>
                    "active"

            ]);


        if (!$job) {

            http_response_code(404);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Job not found or inactive."

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | PREVENT DUPLICATE APPLICATION
        |--------------------------------------------------------------------------
        */

        $existingApplication =
            $collection->findOne([

                "userId" =>
                    $userId,

                "jobId" =>
                    $jobId

            ]);


        if ($existingApplication) {

            http_response_code(409);

            echo json_encode([

                "success" => false,

                "message" =>
                    "You have already applied for this job."

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | CREATE APPLICATION
        |--------------------------------------------------------------------------
        */

        $result =
            $collection->insertOne([

                "userId" =>
                    $userId,

                "jobId" =>
                    $jobId,

                "recruiterId" =>
                    $job['recruiterId'] ?? '',

                "jobTitle" =>
                    $job['title'] ?? '',

                "company" =>
                    $job['company'] ?? '',

                "status" =>
                    "applied",

                "appliedAt" =>
                    new MongoDB\BSON\UTCDateTime(),

                "updatedAt" =>
                    new MongoDB\BSON\UTCDateTime()

            ]);


        echo json_encode([

            "success" => true,

            "message" =>
                "Application submitted successfully",

            "applicationId" =>
                (string)
                $result->getInsertedId()

        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | PUT - UPDATE APPLICATION STATUS
    |--------------------------------------------------------------------------
    |
    | Recruiter only.
    |
    | Recruiter can only update applications belonging
    | to their own jobs.
    |--------------------------------------------------------------------------
    */

    if ($method === 'PUT') {

        $auth =
            requireRecruiter();


        $recruiterId =
            $auth['userId'];


        /*
        |--------------------------------------------------------------------------
        | READ JSON
        |--------------------------------------------------------------------------
        */

        $data =
            json_decode(
                file_get_contents("php://input"),
                true
            );


        if (!is_array($data)) {

            http_response_code(400);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Invalid JSON data."

            ]);

            exit;
        }


        $applicationId =
            trim(
                (string) (
                    $data['applicationId'] ?? ''
                )
            );


        $status =
            strtolower(
                trim(
                    (string) (
                        $data['status'] ?? ''
                    )
                )
            );


        if (
            $applicationId === '' ||
            $status === ''
        ) {

            http_response_code(400);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Application ID and status are required."

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | VALID STATUSES
        |--------------------------------------------------------------------------
        */

        $allowedStatuses = [

            "applied",

            "shortlisted",

            "rejected",

            "interview",

            "selected"

        ];


        if (
            !in_array(
                $status,
                $allowedStatuses,
                true
            )
        ) {

            http_response_code(400);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Invalid application status."

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE APPLICATION ID
        |--------------------------------------------------------------------------
        */

        if (
            !preg_match(
                '/^[a-f0-9]{24}$/i',
                $applicationId
            )
        ) {

            http_response_code(400);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Invalid Application ID."

            ]);

            exit;
        }


        $applicationObjectId =
            new MongoDB\BSON\ObjectId(
                $applicationId
            );


        /*
        |--------------------------------------------------------------------------
        | FIND APPLICATION
        |--------------------------------------------------------------------------
        */

        $application =
            $collection->findOne([

                "_id" =>
                    $applicationObjectId

            ]);


        if (!$application) {

            http_response_code(404);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Application not found."

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | VERIFY RECRUITER OWNERSHIP
        |--------------------------------------------------------------------------
        */

        $applicationRecruiterId =
            (string) (
                $application['recruiterId']
                ?? ''
            );


        if (
            $applicationRecruiterId !==
            $recruiterId
        ) {

            http_response_code(403);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Access denied. This application does not belong to your job."

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE APPLICATION
        |--------------------------------------------------------------------------
        */

        $result =
            $collection->updateOne(

                [
                    "_id" =>
                        $applicationObjectId,

                    "recruiterId" =>
                        $recruiterId

                ],

                [
                    '$set' => [

                        "status" =>
                            $status,

                        "updatedAt" =>
                            new MongoDB\BSON\UTCDateTime()

                    ]

                ]

            );


        echo json_encode([

            "success" => true,

            "message" =>
                "Application status updated successfully",

            "modifiedCount" =>
                $result->getModifiedCount()

        ]);

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
            "Method not allowed."

    ]);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Application operation failed.",

        "error" =>
            $e->getMessage()

    ]);

}

?>
