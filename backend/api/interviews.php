<?php
require_once __DIR__ . '/../config/cors.php';
/*
|--------------------------------------------------------------------------
| HireHub Interview API
|--------------------------------------------------------------------------
|
| Single shared API for:
|
| Candidate
| Recruiter
| Admin
|
| Candidate:
|   GET own interviews
|
| Recruiter:
|   GET own interviews
|   POST schedule interview
|   PUT update interview
|
| Admin:
|   GET all interviews
|   POST schedule interview
|   PUT update interview
|
|--------------------------------------------------------------------------
*/


header(
    "Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS"
);

header(
    "Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id, X-User-Role"
);

header("Access-Control-Allow-Credentials: true");

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

    /*
    |--------------------------------------------------------------------------
    | DATABASE
    |--------------------------------------------------------------------------
    */

    $database =
        new Database();


    $db =
        $database->getDatabase();


    $interviewsCollection =
        $db->interviews;


    $applicationsCollection =
        $db->applications;


    $method =
        $_SERVER['REQUEST_METHOD'];


    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION
    |--------------------------------------------------------------------------
    |
    | All interview operations require authentication.
    |
    */

    $auth =
        requireAuth();


    $currentUserId =
        $auth['userId'];


    $currentRole =
        $auth['role'];


    /*
    |--------------------------------------------------------------------------
    | POST - SCHEDULE INTERVIEW
    |--------------------------------------------------------------------------
    |
    | Recruiter/Admin only.
    |--------------------------------------------------------------------------
    */

    if ($method === 'POST') {


        if (
            $currentRole !== 'recruiter' &&
            $currentRole !== 'admin'
        ) {

            http_response_code(403);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Access denied. Only recruiters and administrators can schedule interviews."

            ]);

            exit;
        }


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


        $interviewerId =
            trim(
                (string) (
                    $data['interviewerId'] ?? ''
                )
            );


        $interviewDate =
            trim(
                (string) (
                    $data['interviewDate'] ?? ''
                )
            );


        $interviewTime =
            trim(
                (string) (
                    $data['interviewTime'] ?? ''
                )
            );


        $mode =
            strtolower(
                trim(
                    (string) (
                        $data['mode'] ?? ''
                    )
                )
            );


        $meetingLink =
            trim(
                (string) (
                    $data['meetingLink'] ?? ''
                )
            );


        $notes =
            trim(
                (string) (
                    $data['notes'] ?? ''
                )
            );


        /*
        |--------------------------------------------------------------------------
        | REQUIRED FIELDS
        |--------------------------------------------------------------------------
        */

        if (
            $applicationId === '' ||
            $interviewerId === '' ||
            $interviewDate === '' ||
            $interviewTime === '' ||
            $mode === ''
        ) {

            http_response_code(400);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Application ID, interviewer ID, date, time and mode are required."

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
            $applicationsCollection->findOne([

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
        | RECRUITER OWNERSHIP
        |--------------------------------------------------------------------------
        |
        | Recruiter can only schedule interviews for their own applications.
        |
        */

        if ($currentRole === 'recruiter') {

            $applicationRecruiterId =
                (string) (
                    $application['recruiterId']
                    ?? ''
                );


            if (
                $applicationRecruiterId !==
                $currentUserId
            ) {

                http_response_code(403);

                echo json_encode([

                    "success" => false,

                    "message" =>
                        "Access denied. You can only schedule interviews for your own applications."

                ]);

                exit;
            }

        }


        /*
        |--------------------------------------------------------------------------
        | CANDIDATE STATUS CHECK
        |--------------------------------------------------------------------------
        */

        $applicationStatus =
            strtolower(
                (string) (
                    $application['status']
                    ?? ''
                )
            );


        if (
            $applicationStatus !==
            'shortlisted' &&
            $applicationStatus !==
            'interview'
        ) {

            http_response_code(400);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Candidate must be shortlisted before scheduling an interview."

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE INTERVIEW MODE
        |--------------------------------------------------------------------------
        */

        $allowedModes = [

            "online",

            "offline"

        ];


        if (
            !in_array(
                $mode,
                $allowedModes,
                true
            )
        ) {

            http_response_code(400);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Interview mode must be online or offline."

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | PREVENT DUPLICATE ACTIVE INTERVIEW
        |--------------------------------------------------------------------------
        */

        $existingInterview =
            $interviewsCollection->findOne([

                "applicationId" =>
                    $applicationId,

                "status" => [

                    '$in' => [

                        "scheduled",

                        "rescheduled"

                    ]

                ]

            ]);


        if ($existingInterview) {

            http_response_code(409);

            echo json_encode([

                "success" => false,

                "message" =>
                    "An active interview already exists for this application."

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | CREATE INTERVIEW
        |--------------------------------------------------------------------------
        */

        $result =
            $interviewsCollection->insertOne([

                "applicationId" =>
                    $applicationId,

                "userId" =>
                    $application['userId']
                    ?? '',

                "jobId" =>
                    $application['jobId']
                    ?? '',

                "recruiterId" =>
                    $application['recruiterId']
                    ?? '',

                "interviewerId" =>
                    $interviewerId,

                "jobTitle" =>
                    $application['jobTitle']
                    ?? '',

                "company" =>
                    $application['company']
                    ?? '',

                "interviewDate" =>
                    $interviewDate,

                "interviewTime" =>
                    $interviewTime,

                "mode" =>
                    $mode,

                "meetingLink" =>
                    $meetingLink,

                "notes" =>
                    $notes,

                "status" =>
                    "scheduled",

                "feedback" =>
                    "",

                "createdAt" =>
                    new MongoDB\BSON\UTCDateTime(),

                "updatedAt" =>
                    new MongoDB\BSON\UTCDateTime()

            ]);


        /*
        |--------------------------------------------------------------------------
        | UPDATE APPLICATION STATUS
        |--------------------------------------------------------------------------
        */

        $applicationsCollection->updateOne(

            [
                "_id" =>
                    $applicationObjectId
            ],

            [
                '$set' => [

                    "status" =>
                        "interview",

                    "updatedAt" =>
                        new MongoDB\BSON\UTCDateTime()

                ]
            ]

        );


        echo json_encode([

            "success" => true,

            "message" =>
                "Interview scheduled successfully",

            "interviewId" =>
                (string)
                $result->getInsertedId()

        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | GET INTERVIEWS
    |--------------------------------------------------------------------------
    */

    if ($method === 'GET') {

        $userId =
            trim(
                (string) (
                    $_GET['userId'] ?? ''
                )
            );


        $recruiterId =
            trim(
                (string) (
                    $_GET['recruiterId'] ?? ''
                )
            );


        $applicationId =
            trim(
                (string) (
                    $_GET['applicationId'] ?? ''
                )
            );


        $interviews = [];


        /*
        |--------------------------------------------------------------------------
        | ADMIN
        |--------------------------------------------------------------------------
        */

        if ($currentRole === 'admin') {


            if ($applicationId !== '') {

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


                $interviews =
                    $interviewsCollection
                        ->find(

                            [
                                "applicationId" =>
                                    $applicationId
                            ],

                            [
                                "sort" => [

                                    "createdAt" =>
                                        -1

                                ]
                            ]

                        )
                        ->toArray();

            } elseif ($userId !== '') {

                $interviews =
                    $interviewsCollection
                        ->find(

                            [
                                "userId" =>
                                    $userId
                            ],

                            [
                                "sort" => [

                                    "interviewDate" =>
                                        1,

                                    "interviewTime" =>
                                        1

                                ]
                            ]

                        )
                        ->toArray();

            } elseif ($recruiterId !== '') {

                $interviews =
                    $interviewsCollection
                        ->find(

                            [
                                "recruiterId" =>
                                    $recruiterId
                            ],

                            [
                                "sort" => [

                                    "interviewDate" =>
                                        1,

                                    "interviewTime" =>
                                        1

                                ]
                            ]

                        )
                        ->toArray();

            } else {

                $interviews =
                    $interviewsCollection
                        ->find(

                            [],

                            [
                                "sort" => [

                                    "interviewDate" =>
                                        1,

                                    "interviewTime" =>
                                        1

                                ]
                            ]

                        )
                        ->toArray();

            }

        }


        /*
        |--------------------------------------------------------------------------
        | CANDIDATE
        |--------------------------------------------------------------------------
        */

        elseif ($currentRole === 'candidate') {


            /*
            |--------------------------------------------------------------------------
            | Candidate cannot request another user's interviews
            |--------------------------------------------------------------------------
            */

            if (
                $userId !== '' &&
                $userId !== $currentUserId
            ) {

                http_response_code(403);

                echo json_encode([

                    "success" => false,

                    "message" =>
                        "Access denied. You can only view your own interviews."

                ]);

                exit;
            }


            /*
            |--------------------------------------------------------------------------
            | Candidate cannot search recruiter interviews
            |--------------------------------------------------------------------------
            */

            if ($recruiterId !== '') {

                http_response_code(403);

                echo json_encode([

                    "success" => false,

                    "message" =>
                        "Access denied. Candidates cannot view recruiter interviews."

                ]);

                exit;
            }


            /*
            |--------------------------------------------------------------------------
            | Candidate application-specific request
            |--------------------------------------------------------------------------
            */

            if ($applicationId !== '') {


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


                $application =
                    $applicationsCollection
                        ->findOne([

                            "_id" =>
                                new MongoDB\BSON\ObjectId(
                                    $applicationId
                                )

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


                if (
                    ($application['userId'] ?? '')
                    !==
                    $currentUserId
                ) {

                    http_response_code(403);

                    echo json_encode([

                        "success" => false,

                        "message" =>
                            "Access denied. This application does not belong to you."

                    ]);

                    exit;
                }


                $interviews =
                    $interviewsCollection
                        ->find(

                            [
                                "applicationId" =>
                                    $applicationId,

                                "userId" =>
                                    $currentUserId

                            ],

                            [
                                "sort" => [

                                    "createdAt" =>
                                        -1

                                ]
                            ]

                        )
                        ->toArray();

            } else {


                /*
                |--------------------------------------------------------------------------
                | Candidate own interviews
                |--------------------------------------------------------------------------
                */

                $interviews =
                    $interviewsCollection
                        ->find(

                            [
                                "userId" =>
                                    $currentUserId
                            ],

                            [
                                "sort" => [

                                    "interviewDate" =>
                                        1,

                                    "interviewTime" =>
                                        1

                                ]
                            ]

                        )
                        ->toArray();

            }

        }


        /*
        |--------------------------------------------------------------------------
        | RECRUITER
        |--------------------------------------------------------------------------
        */

        elseif ($currentRole === 'recruiter') {


            /*
            |--------------------------------------------------------------------------
            | Recruiter cannot use userId filter
            |--------------------------------------------------------------------------
            */

            if ($userId !== '') {

                http_response_code(403);

                echo json_encode([

                    "success" => false,

                    "message" =>
                        "Access denied. Recruiters cannot view candidate interview lists."

                ]);

                exit;
            }


            /*
            |--------------------------------------------------------------------------
            | Application-specific interviews
            |--------------------------------------------------------------------------
            */

            if ($applicationId !== '') {


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


                $application =
                    $applicationsCollection
                        ->findOne([

                            "_id" =>
                                new MongoDB\BSON\ObjectId(
                                    $applicationId
                                )

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
                | Recruiter ownership
                |--------------------------------------------------------------------------
                */

                if (
                    ($application['recruiterId'] ?? '')
                    !==
                    $currentUserId
                ) {

                    http_response_code(403);

                    echo json_encode([

                        "success" => false,

                        "message" =>
                            "Access denied. This application does not belong to you."

                    ]);

                    exit;
                }


                $interviews =
                    $interviewsCollection
                        ->find(

                            [
                                "applicationId" =>
                                    $applicationId,

                                "recruiterId" =>
                                    $currentUserId

                            ],

                            [
                                "sort" => [

                                    "createdAt" =>
                                        -1

                                ]
                            ]

                        )
                        ->toArray();

            } else {


                /*
                |--------------------------------------------------------------------------
                | Recruiter's own interviews
                |--------------------------------------------------------------------------
                */

                $interviews =
                    $interviewsCollection
                        ->find(

                            [
                                "recruiterId" =>
                                    $currentUserId
                            ],

                            [
                                "sort" => [

                                    "interviewDate" =>
                                        1,

                                    "interviewTime" =>
                                        1

                                ]
                            ]

                        )
                        ->toArray();

            }

        }


        /*
        |--------------------------------------------------------------------------
        | FORMAT RESPONSE
        |--------------------------------------------------------------------------
        */

        $interviewList = [];


        foreach ($interviews as $interview) {

            $interviewList[] = [

                "id" =>
                    isset($interview['_id'])
                        ? (string)
                            $interview['_id']
                        : '',

                "applicationId" =>
                    $interview['applicationId']
                    ?? '',

                "userId" =>
                    $interview['userId']
                    ?? '',

                "jobId" =>
                    $interview['jobId']
                    ?? '',

                "recruiterId" =>
                    $interview['recruiterId']
                    ?? '',

                "interviewerId" =>
                    $interview['interviewerId']
                    ?? '',

                "jobTitle" =>
                    $interview['jobTitle']
                    ?? '',

                "company" =>
                    $interview['company']
                    ?? '',

                "interviewDate" =>
                    $interview['interviewDate']
                    ?? '',

                "interviewTime" =>
                    $interview['interviewTime']
                    ?? '',

                "mode" =>
                    $interview['mode']
                    ?? '',

                "meetingLink" =>
                    $interview['meetingLink']
                    ?? '',

                "notes" =>
                    $interview['notes']
                    ?? '',

                "status" =>
                    $interview['status']
                    ?? '',

                "feedback" =>
                    $interview['feedback']
                    ?? '',

                "createdAt" =>
                    isset($interview['createdAt'])
                        ? $interview['createdAt']
                            ->toDateTime()
                            ->format(
                                'Y-m-d H:i:s'
                            )
                        : '',

                "updatedAt" =>
                    isset($interview['updatedAt'])
                        ? $interview['updatedAt']
                            ->toDateTime()
                            ->format(
                                'Y-m-d H:i:s'
                            )
                        : ''

            ];

        }


        echo json_encode([

            "success" => true,

            "count" =>
                count($interviewList),

            "interviews" =>
                $interviewList

        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | PUT - UPDATE INTERVIEW
    |--------------------------------------------------------------------------
    |
    | Recruiter/Admin only.
    |--------------------------------------------------------------------------
    */

    if ($method === 'PUT') {


        if (
            $currentRole !== 'recruiter' &&
            $currentRole !== 'admin'
        ) {

            http_response_code(403);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Access denied. Only recruiters and administrators can update interviews."

            ]);

            exit;
        }


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


        $interviewId =
            trim(
                (string) (
                    $data['interviewId'] ?? ''
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


        $interviewDate =
            trim(
                (string) (
                    $data['interviewDate'] ?? ''
                )
            );


        $interviewTime =
            trim(
                (string) (
                    $data['interviewTime'] ?? ''
                )
            );


        $meetingLink =
            trim(
                (string) (
                    $data['meetingLink'] ?? ''
                )
            );


        $feedback =
            trim(
                (string) (
                    $data['feedback'] ?? ''
                )
            );


        $notes =
            trim(
                (string) (
                    $data['notes'] ?? ''
                )
            );


        /*
        |--------------------------------------------------------------------------
        | INTERVIEW ID REQUIRED
        |--------------------------------------------------------------------------
        */

        if ($interviewId === '') {

            http_response_code(400);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Interview ID is required."

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE INTERVIEW ID
        |--------------------------------------------------------------------------
        */

        if (
            !preg_match(
                '/^[a-f0-9]{24}$/i',
                $interviewId
            )
        ) {

            http_response_code(400);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Invalid Interview ID."

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE STATUS
        |--------------------------------------------------------------------------
        */

        $allowedStatuses = [

            "scheduled",

            "rescheduled",

            "completed",

            "cancelled"

        ];


        if (
            $status !== '' &&
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
                    "Invalid interview status."

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | FIND INTERVIEW
        |--------------------------------------------------------------------------
        */

        $interviewObjectId =
            new MongoDB\BSON\ObjectId(
                $interviewId
            );


        $interview =
            $interviewsCollection->findOne([

                "_id" =>
                    $interviewObjectId

            ]);


        if (!$interview) {

            http_response_code(404);

            echo json_encode([

                "success" => false,

                "message" =>
                    "Interview not found."

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | RECRUITER OWNERSHIP
        |--------------------------------------------------------------------------
        */

        if ($currentRole === 'recruiter') {

            if (
                ($interview['recruiterId'] ?? '')
                !==
                $currentUserId
            ) {

                http_response_code(403);

                echo json_encode([

                    "success" => false,

                    "message" =>
                        "Access denied. You can only update your own interviews."

                ]);

                exit;
            }

        }


        /*
        |--------------------------------------------------------------------------
        | BUILD UPDATE
        |--------------------------------------------------------------------------
        */

        $updateFields = [

            "updatedAt" =>
                new MongoDB\BSON\UTCDateTime()

        ];


        if ($status !== '') {

            $updateFields['status'] =
                $status;

        }


        if ($interviewDate !== '') {

            $updateFields['interviewDate'] =
                $interviewDate;

        }


        if ($interviewTime !== '') {

            $updateFields['interviewTime'] =
                $interviewTime;

        }


        if ($meetingLink !== '') {

            $updateFields['meetingLink'] =
                $meetingLink;

        }


        if ($feedback !== '') {

            $updateFields['feedback'] =
                $feedback;

        }


        if ($notes !== '') {

            $updateFields['notes'] =
                $notes;

        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        $filter = [

            "_id" =>
                $interviewObjectId

        ];


        /*
        |--------------------------------------------------------------------------
        | Recruiter ownership also included in DB update
        |--------------------------------------------------------------------------
        */

        if ($currentRole === 'recruiter') {

            $filter['recruiterId'] =
                $currentUserId;

        }


        $result =
            $interviewsCollection->updateOne(

                $filter,

                [
                    '$set' =>
                        $updateFields
                ]

            );


        echo json_encode([

            "success" => true,

            "message" =>
                "Interview updated successfully",

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
            "Interview operation failed.",

        "error" =>
            $e->getMessage()

    ]);

}

?>