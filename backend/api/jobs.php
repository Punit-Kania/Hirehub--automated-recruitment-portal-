<?php
require_once __DIR__ . '/../config/cors.php';
//header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
//header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id, X-User-Role");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';


try {

    $database = new Database();

    $collection =
        $database->getDatabase()->jobs;

    $method =
        $_SERVER['REQUEST_METHOD'];


    /*
    |--------------------------------------------------------------------------
    | GET JOBS
    |--------------------------------------------------------------------------
    |
    | All logged-in users can view active jobs.
    |
    */

    if ($method === 'GET') {

        /*
        |--------------------------------------------------------------------------
        | AUTHENTICATION
        |--------------------------------------------------------------------------
        */

        $auth =
            requireAuth();


        $jobs = $collection
            ->find(
                [
                    "status" => "active"
                ],
                [
                    "sort" => [
                        "createdAt" => -1
                    ]
                ]
            )
            ->toArray();


        $jobList = [];


        foreach ($jobs as $job) {

            $skills =
                $job['skills'] ?? [];


            if ($skills instanceof Traversable) {

                $skills =
                    iterator_to_array(
                        $skills
                    );

            }


            if (!is_array($skills)) {

                $skills = [];

            }


            $jobList[] = [

                "id" =>
                    (string) $job['_id'],

                "title" =>
                    $job['title'] ?? '',

                "company" =>
                    $job['company'] ?? '',

                "description" =>
                    $job['description'] ?? '',

                "location" =>
                    $job['location'] ?? '',

                "jobType" =>
                    $job['jobType'] ?? '',

                "salary" =>
                    $job['salary'] ?? '',

                "skills" =>
                    array_values(
                        $skills
                    ),

                "recruiterId" =>
                    $job['recruiterId'] ?? '',

                "status" =>
                    $job['status'] ?? '',

                "createdAt" =>
                    isset($job['createdAt'])
                        ? $job['createdAt']
                            ->toDateTime()
                            ->format(
                                'Y-m-d H:i:s'
                            )
                        : ''

            ];

        }


        echo json_encode([

            "success" =>
                true,

            "count" =>
                count($jobList),

            "jobs" =>
                $jobList

        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE JOB
    |--------------------------------------------------------------------------
    */

    if ($method === 'POST') {

        /*
        |--------------------------------------------------------------------------
        | ONLY RECRUITERS
        |--------------------------------------------------------------------------
        */

        $auth =
            requireRecruiter();


        $data =
            json_decode(
                file_get_contents(
                    "php://input"
                ),
                true
            );


        if (!is_array($data)) {

            http_response_code(400);

            echo json_encode([

                "success" =>
                    false,

                "message" =>
                    "Invalid JSON data"

            ]);

            exit;
        }


        $title =
            trim(
                (string) (
                    $data['title'] ?? ''
                )
            );


        $company =
            trim(
                (string) (
                    $data['company'] ?? ''
                )
            );


        $description =
            trim(
                (string) (
                    $data['description'] ?? ''
                )
            );


        $location =
            trim(
                (string) (
                    $data['location'] ?? ''
                )
            );


        $jobType =
            trim(
                (string) (
                    $data['jobType'] ?? ''
                )
            );


        $salary =
            trim(
                (string) (
                    $data['salary'] ?? ''
                )
            );


        $skills =
            $data['skills'] ?? [];


        /*
        |--------------------------------------------------------------------------
        | REQUIRED FIELDS
        |--------------------------------------------------------------------------
        */

        if (
            $title === '' ||
            $company === '' ||
            $description === '' ||
            $location === '' ||
            $jobType === ''
        ) {

            http_response_code(400);

            echo json_encode([

                "success" =>
                    false,

                "message" =>
                    "Required job fields are missing"

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | CLEAN SKILLS
        |--------------------------------------------------------------------------
        */

        if (!is_array($skills)) {

            $skills = [];

        }


        $cleanSkills = [];


        foreach ($skills as $skill) {

            $skill =
                trim(
                    (string) $skill
                );


            if ($skill !== '') {

                $cleanSkills[] =
                    $skill;

            }

        }


        $cleanSkills =
            array_values(
                array_unique(
                    $cleanSkills
                )
            );


        /*
        |--------------------------------------------------------------------------
        | AUTHENTICATED RECRUITER ID
        |--------------------------------------------------------------------------
        |
        | NEVER accept recruiterId from frontend.
        |
        */

        $recruiterId =
            $auth['userId'] ?? '';


        if ($recruiterId === '') {

            http_response_code(401);

            echo json_encode([

                "success" =>
                    false,

                "message" =>
                    "Recruiter ID not found"

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        $result =
            $collection->insertOne([

                "title" =>
                    $title,

                "company" =>
                    $company,

                "description" =>
                    $description,

                "location" =>
                    $location,

                "jobType" =>
                    $jobType,

                "salary" =>
                    $salary,

                "skills" =>
                    $cleanSkills,

                "recruiterId" =>
                    $recruiterId,

                "status" =>
                    "active",

                "createdAt" =>
                    new MongoDB\BSON\UTCDateTime()

            ]);


        echo json_encode([

            "success" =>
                true,

            "message" =>
                "Job created successfully",

            "jobId" =>
                (string)
                $result->getInsertedId()

        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE JOB
    |--------------------------------------------------------------------------
    |
    | Only the recruiter who owns the job can update it.
    |
    */

    if ($method === 'PUT') {

        $auth =
            requireRecruiter();


        $recruiterId =
            $auth['userId'] ?? '';


        $data =
            json_decode(
                file_get_contents(
                    "php://input"
                ),
                true
            );


        if (!is_array($data)) {

            http_response_code(400);

            echo json_encode([

                "success" =>
                    false,

                "message" =>
                    "Invalid JSON data"

            ]);

            exit;
        }


        $jobId =
            trim(
                (string) (
                    $data['jobId']
                    ??
                    $data['id']
                    ??
                    $data['_id']
                    ??
                    ''
                )
            );


        if ($jobId === '') {

            http_response_code(400);

            echo json_encode([

                "success" =>
                    false,

                "message" =>
                    "Job ID is required"

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | OBJECT ID VALIDATION
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

                "success" =>
                    false,

                "message" =>
                    "Invalid Job ID"

            ]);

            exit;
        }


        try {

            $jobObjectId =
                new MongoDB\BSON\ObjectId(
                    $jobId
                );

        } catch (Exception $e) {

            http_response_code(400);

            echo json_encode([

                "success" =>
                    false,

                "message" =>
                    "Invalid Job ID"

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | OWNERSHIP CHECK
        |--------------------------------------------------------------------------
        */

        $existingJob =
            $collection->findOne([

                "_id" =>
                    $jobObjectId,

                "recruiterId" =>
                    $recruiterId

            ]);


        if (!$existingJob) {

            http_response_code(403);

            echo json_encode([

                "success" =>
                    false,

                "message" =>
                    "Job not found or you are not authorized to update this job"

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE DATA
        |--------------------------------------------------------------------------
        */

        $updateData = [];


        if (isset($data['title'])) {

            $value =
                trim(
                    (string) $data['title']
                );


            if ($value !== '') {

                $updateData['title'] =
                    $value;

            }

        }


        if (isset($data['company'])) {

            $value =
                trim(
                    (string) $data['company']
                );


            if ($value !== '') {

                $updateData['company'] =
                    $value;

            }

        }


        if (isset($data['description'])) {

            $updateData['description'] =
                trim(
                    (string) $data['description']
                );

        }


        if (isset($data['location'])) {

            $updateData['location'] =
                trim(
                    (string) $data['location']
                );

        }


        if (isset($data['jobType'])) {

            $updateData['jobType'] =
                trim(
                    (string) $data['jobType']
                );

        }


        if (isset($data['salary'])) {

            $updateData['salary'] =
                trim(
                    (string) $data['salary']
                );

        }


        if (isset($data['skills'])) {

            $skills =
                $data['skills'];


            if (!is_array($skills)) {

                $skills = [];

            }


            $cleanSkills = [];


            foreach ($skills as $skill) {

                $skill =
                    trim(
                        (string) $skill
                    );


                if ($skill !== '') {

                    $cleanSkills[] =
                        $skill;

                }

            }


            $updateData['skills'] =
                array_values(
                    array_unique(
                        $cleanSkills
                    )
                );

        }


        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        if (isset($data['status'])) {

            $status =
                strtolower(
                    trim(
                        (string) $data['status']
                    )
                );


            if (
                in_array(
                    $status,
                    [
                        "active",
                        "inactive"
                    ],
                    true
                )
            ) {

                $updateData['status'] =
                    $status;

            }

        }


        /*
        |--------------------------------------------------------------------------
        | NOTHING TO UPDATE
        |--------------------------------------------------------------------------
        */

        if (
            count($updateData) === 0
        ) {

            http_response_code(400);

            echo json_encode([

                "success" =>
                    false,

                "message" =>
                    "No valid fields were provided for update"

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        $result =
            $collection->updateOne(

                [
                    "_id" =>
                        $jobObjectId,

                    "recruiterId" =>
                        $recruiterId
                ],

                [
                    '$set' =>
                        $updateData
                ]

            );


        echo json_encode([

            "success" =>
                true,

            "message" =>
                "Job updated successfully",

            "modifiedCount" =>
                $result->getModifiedCount()

        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE / DEACTIVATE JOB
    |--------------------------------------------------------------------------
    */

    if ($method === 'DELETE') {

        $auth =
            requireRecruiter();


        $recruiterId =
            $auth['userId'] ?? '';


        /*
        |--------------------------------------------------------------------------
        | READ JOB ID
        |--------------------------------------------------------------------------
        */

        $jobId =
            trim(
                (string) (
                    $_GET['jobId']
                    ??
                    $_GET['id']
                    ??
                    ''
                )
            );


        /*
        |--------------------------------------------------------------------------
        | ALSO SUPPORT JSON BODY
        |--------------------------------------------------------------------------
        */

        if ($jobId === '') {

            $body =
                file_get_contents(
                    "php://input"
                );


            if ($body !== '') {

                $data =
                    json_decode(
                        $body,
                        true
                    );


                if (is_array($data)) {

                    $jobId =
                        trim(
                            (string) (
                                $data['jobId']
                                ??
                                $data['id']
                                ??
                                $data['_id']
                                ??
                                ''
                            )
                        );

                }

            }

        }


        if ($jobId === '') {

            http_response_code(400);

            echo json_encode([

                "success" =>
                    false,

                "message" =>
                    "Job ID is required"

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE ID
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

                "success" =>
                    false,

                "message" =>
                    "Invalid Job ID"

            ]);

            exit;
        }


        try {

            $jobObjectId =
                new MongoDB\BSON\ObjectId(
                    $jobId
                );

        } catch (Exception $e) {

            http_response_code(400);

            echo json_encode([

                "success" =>
                    false,

                "message" =>
                    "Invalid Job ID"

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | OWNERSHIP CHECK
        |--------------------------------------------------------------------------
        */

        $existingJob =
            $collection->findOne([

                "_id" =>
                    $jobObjectId,

                "recruiterId" =>
                    $recruiterId

            ]);


        if (!$existingJob) {

            http_response_code(403);

            echo json_encode([

                "success" =>
                    false,

                "message" =>
                    "Job not found or you are not authorized to delete this job"

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | SOFT DELETE
        |--------------------------------------------------------------------------
        |
        | Do not physically remove the job because applications
        | may still reference it.
        |
        */

        $result =
            $collection->updateOne(

                [
                    "_id" =>
                        $jobObjectId,

                    "recruiterId" =>
                        $recruiterId
                ],

                [
                    '$set' => [

                        "status" =>
                            "inactive"

                    ]

                ]

            );


        echo json_encode([

            "success" =>
                true,

            "message" =>
                "Job deleted successfully",

            "modifiedCount" =>
                $result->getModifiedCount()

        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | INVALID METHOD
    |--------------------------------------------------------------------------
    */

    http_response_code(405);

    echo json_encode([

        "success" =>
            false,

        "message" =>
            "Method not allowed"

    ]);


} catch (MongoDB\Driver\Exception\Exception $e) {

    http_response_code(500);

    echo json_encode([

        "success" =>
            false,

        "message" =>
            "Database operation failed",

        "error" =>
            $e->getMessage()

    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([

        "success" =>
            false,

        "message" =>
            "Job operation failed",

        "error" =>
            $e->getMessage()

    ]);

}

?>
