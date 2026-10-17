<?php
require_once __DIR__ . '/../config/cors.php';

/*
|--------------------------------------------------------------------------
| HireHub Admin API
|--------------------------------------------------------------------------
| Admin-only API for:
| - Dashboard Analytics
| - User Management
| - Job Management
| - Application Management
| - Interview Management
| - Analytics & Reports
| - Activity Logs / Notifications
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

header(
    "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"
);

header(
    "Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id, X-User-Role"
);

header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| OPTIONS / PREFLIGHT REQUEST
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);

    exit;
}


/*
|--------------------------------------------------------------------------
| LOAD CONFIGURATION
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';


/*
|--------------------------------------------------------------------------
| ADMIN AUTHENTICATION
|--------------------------------------------------------------------------
|
| Only users with role = admin can use this API.
|
*/

$auth = requireAdmin();


try {

    /*
    |--------------------------------------------------------------------------
    | DATABASE
    |--------------------------------------------------------------------------
    */

    $database = new Database();

    $db = $database->getDatabase();


    /*
    |--------------------------------------------------------------------------
    | COLLECTIONS
    |--------------------------------------------------------------------------
    */

    $usersCollection =
        $db->users;

    $jobsCollection =
        $db->jobs;

    $applicationsCollection =
        $db->applications;

    $interviewsCollection =
        $db->interviews;

    $activityCollection =
        $db->activity_logs;


    /*
    |--------------------------------------------------------------------------
    | REQUEST METHOD
    |--------------------------------------------------------------------------
    */

    $method =
        $_SERVER['REQUEST_METHOD'];


    /*
    |--------------------------------------------------------------------------
    | GET REQUESTS
    |--------------------------------------------------------------------------
    */

    if ($method === 'GET') {

        $action =
            $_GET['action'] ?? '';


        /*
        |--------------------------------------------------------------------------
        | 1. DASHBOARD ANALYTICS
        |--------------------------------------------------------------------------
        */

        if ($action === 'analytics') {

            $totalUsers =
                $usersCollection->countDocuments();


            $totalJobs =
                $jobsCollection->countDocuments();


            $activeJobs =
                $jobsCollection->countDocuments([
                    "status" => "active"
                ]);


            $totalApplications =
                $applicationsCollection->countDocuments();


            $shortlistedApplications =
                $applicationsCollection->countDocuments([
                    "status" => "shortlisted"
                ]);


            $selectedApplications =
                $applicationsCollection->countDocuments([
                    "status" => "selected"
                ]);


            $rejectedApplications =
                $applicationsCollection->countDocuments([
                    "status" => "rejected"
                ]);


            $totalInterviews =
                $interviewsCollection->countDocuments();


            $completedInterviews =
                $interviewsCollection->countDocuments([
                    "status" => "completed"
                ]);


            $scheduledInterviews =
                $interviewsCollection->countDocuments([
                    "status" => "scheduled"
                ]);


            echo json_encode([

                "success" => true,

                "analytics" => [

                    "users" => [

                        "total" =>
                            $totalUsers
                    ],

                    "jobs" => [

                        "total" =>
                            $totalJobs,

                        "active" =>
                            $activeJobs
                    ],

                    "applications" => [

                        "total" =>
                            $totalApplications,

                        "shortlisted" =>
                            $shortlistedApplications,

                        "selected" =>
                            $selectedApplications,

                        "rejected" =>
                            $rejectedApplications
                    ],

                    "interviews" => [

                        "total" =>
                            $totalInterviews,

                        "scheduled" =>
                            $scheduledInterviews,

                        "completed" =>
                            $completedInterviews
                    ]

                ]

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | 2. MANAGE USERS
        |--------------------------------------------------------------------------
        */

        if ($action === 'users') {

            $users =
                $usersCollection
                    ->find(
                        [],
                        [
                            "sort" => [
                                "createdAt" => -1
                            ]
                        ]
                    )
                    ->toArray();


            $userList = [];


            foreach ($users as $user) {

                $userList[] = [

                    "id" =>
                        (string) $user['_id'],

                    "name" =>
                        $user['name'] ?? '',

                    "email" =>
                        $user['email'] ?? '',

                    "role" =>
                        $user['role'] ?? 'candidate',

                    "status" =>
                        $user['status'] ?? 'active',

                    "createdAt" =>
                        isset($user['createdAt'])
                            ? $user['createdAt']
                                ->toDateTime()
                                ->format('Y-m-d H:i:s')
                            : ''

                ];
            }


            echo json_encode([

                "success" => true,

                "count" =>
                    count($userList),

                "users" =>
                    $userList

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | 3. MANAGE JOBS
        |--------------------------------------------------------------------------
        */

        if ($action === 'jobs') {

            $jobs =
                $jobsCollection
                    ->find(
                        [],
                        [
                            "sort" => [
                                "createdAt" => -1
                            ]
                        ]
                    )
                    ->toArray();


            $jobList = [];


            foreach ($jobs as $job) {

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
                        $job['skills'] ?? [],

                    "recruiterId" =>
                        $job['recruiterId'] ?? '',

                    "status" =>
                        $job['status'] ?? 'active',

                    "createdAt" =>
                        isset($job['createdAt'])
                            ? $job['createdAt']
                                ->toDateTime()
                                ->format('Y-m-d H:i:s')
                            : ''

                ];
            }


            echo json_encode([

                "success" => true,

                "count" =>
                    count($jobList),

                "jobs" =>
                    $jobList

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | 4. MANAGE APPLICATIONS
        |--------------------------------------------------------------------------
        */

        if ($action === 'applications') {

            $applications =
                $applicationsCollection
                    ->find(
                        [],
                        [
                            "sort" => [
                                "appliedAt" => -1
                            ]
                        ]
                    )
                    ->toArray();


            $applicationList = [];


            foreach ($applications as $application) {

                $applicationList[] = [

                    "id" =>
                        (string) $application['_id'],

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
                        $application['status'] ?? 'applied',

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
        | 5. MANAGE INTERVIEWS
        |--------------------------------------------------------------------------
        */

        if ($action === 'interviews') {

            $interviews =
                $interviewsCollection
                    ->find(
                        [],
                        [
                            "sort" => [
                                "createdAt" => -1
                            ]
                        ]
                    )
                    ->toArray();


            $interviewList = [];


            foreach ($interviews as $interview) {

                $interviewList[] = [

                    "id" =>
                        (string) $interview['_id'],

                    "userId" =>
                        $interview['userId'] ?? '',

                    "jobId" =>
                        $interview['jobId'] ?? '',

                    "recruiterId" =>
                        $interview['recruiterId'] ?? '',

                    "interviewerId" =>
                        $interview['interviewerId'] ?? '',

                    "jobTitle" =>
                        $interview['jobTitle'] ?? '',

                    "company" =>
                        $interview['company'] ?? '',

                    "interviewDate" =>
                        $interview['interviewDate'] ?? '',

                    "interviewTime" =>
                        $interview['interviewTime'] ?? '',

                    "mode" =>
                        $interview['mode'] ?? '',

                    "meetingLink" =>
                        $interview['meetingLink'] ?? '',

                    "notes" =>
                        $interview['notes'] ?? '',

                    "status" =>
                        $interview['status'] ?? 'scheduled',

                    "feedback" =>
                        $interview['feedback'] ?? '',

                    "createdAt" =>
                        isset($interview['createdAt'])
                            ? $interview['createdAt']
                                ->toDateTime()
                                ->format('Y-m-d H:i:s')
                            : '',

                    "updatedAt" =>
                        isset($interview['updatedAt'])
                            ? $interview['updatedAt']
                                ->toDateTime()
                                ->format('Y-m-d H:i:s')
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
        | 6. APPLICATION ANALYTICS
        |--------------------------------------------------------------------------
        */

        if ($action === 'application-analytics') {

            $total =
                $applicationsCollection
                    ->countDocuments();


            $applied =
                $applicationsCollection
                    ->countDocuments([
                        "status" => "applied"
                    ]);


            $shortlisted =
                $applicationsCollection
                    ->countDocuments([
                        "status" => "shortlisted"
                    ]);


            $selected =
                $applicationsCollection
                    ->countDocuments([
                        "status" => "selected"
                    ]);


            $rejected =
                $applicationsCollection
                    ->countDocuments([
                        "status" => "rejected"
                    ]);


            echo json_encode([

                "success" => true,

                "analytics" => [

                    "total" =>
                        $total,

                    "applied" =>
                        $applied,

                    "shortlisted" =>
                        $shortlisted,

                    "selected" =>
                        $selected,

                    "rejected" =>
                        $rejected

                ]

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | 7. JOB ANALYTICS
        |--------------------------------------------------------------------------
        */

        if ($action === 'job-analytics') {

            $totalJobs =
                $jobsCollection
                    ->countDocuments();


            $activeJobs =
                $jobsCollection
                    ->countDocuments([
                        "status" => "active"
                    ]);


            $inactiveJobs =
                $jobsCollection
                    ->countDocuments([
                        "status" => "inactive"
                    ]);


            echo json_encode([

                "success" => true,

                "analytics" => [

                    "total" =>
                        $totalJobs,

                    "active" =>
                        $activeJobs,

                    "inactive" =>
                        $inactiveJobs

                ]

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | 8. INTERVIEW ANALYTICS
        |--------------------------------------------------------------------------
        */

        if ($action === 'interview-analytics') {

            $total =
                $interviewsCollection
                    ->countDocuments();


            $scheduled =
                $interviewsCollection
                    ->countDocuments([
                        "status" => "scheduled"
                    ]);


            $rescheduled =
                $interviewsCollection
                    ->countDocuments([
                        "status" => "rescheduled"
                    ]);


            $completed =
                $interviewsCollection
                    ->countDocuments([
                        "status" => "completed"
                    ]);


            $cancelled =
                $interviewsCollection
                    ->countDocuments([
                        "status" => "cancelled"
                    ]);


            echo json_encode([

                "success" => true,

                "analytics" => [

                    "total" =>
                        $total,

                    "scheduled" =>
                        $scheduled,

                    "rescheduled" =>
                        $rescheduled,

                    "completed" =>
                        $completed,

                    "cancelled" =>
                        $cancelled

                ]

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | 9. ACTIVITY LOGS / NOTIFICATIONS
        |--------------------------------------------------------------------------
        */

        if ($action === 'activity-logs') {

            $logs =
                $activityCollection
                    ->find(
                        [],
                        [
                            "sort" => [
                                "createdAt" => -1
                            ],
                            "limit" => 50
                        ]
                    )
                    ->toArray();


            $logList = [];


            foreach ($logs as $log) {

                $logList[] = [

                    "id" =>
                        (string) $log['_id'],

                    "userId" =>
                        $log['userId'] ?? '',

                    "action" =>
                        $log['action'] ?? '',

                    "description" =>
                        $log['description'] ?? '',

                    "createdAt" =>
                        isset($log['createdAt'])
                            ? $log['createdAt']
                                ->toDateTime()
                                ->format('Y-m-d H:i:s')
                            : ''

                ];
            }


            echo json_encode([

                "success" => true,

                "count" =>
                    count($logList),

                "logs" =>
                    $logList

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | INVALID GET ACTION
        |--------------------------------------------------------------------------
        */

        echo json_encode([

            "success" => false,

            "message" =>
                "Invalid admin action"

        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | PUT REQUEST
    |--------------------------------------------------------------------------
    */

    if ($method === 'PUT') {

        $data =
            json_decode(
                file_get_contents("php://input"),
                true
            );


        if (!$data) {

            echo json_encode([

                "success" => false,

                "message" =>
                    "Invalid JSON data"

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE JOB STATUS
        |--------------------------------------------------------------------------
        */

        if (
            isset($data['jobId']) &&
            isset($data['status'])
        ) {

            $jobId =
                trim($data['jobId']);


            $status =
                trim($data['status']);


            if ($jobId === '') {

                echo json_encode([

                    "success" => false,

                    "message" =>
                        "Job ID is required"

                ]);

                exit;
            }


            if (
                !preg_match(
                    '/^[a-f0-9]{24}$/i',
                    $jobId
                )
            ) {

                echo json_encode([

                    "success" => false,

                    "message" =>
                        "Invalid Job ID"

                ]);

                exit;
            }


            $allowedJobStatus = [

                "active",
                "inactive"

            ];


            if (
                !in_array(
                    $status,
                    $allowedJobStatus
                )
            ) {

                echo json_encode([

                    "success" => false,

                    "message" =>
                        "Invalid job status"

                ]);

                exit;
            }


            $result =
                $jobsCollection->updateOne(

                    [

                        "_id" =>
                            new MongoDB\BSON\ObjectId(
                                $jobId
                            )

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


            if (
                $result->getMatchedCount() === 0
            ) {

                echo json_encode([

                    "success" => false,

                    "message" =>
                        "Job not found"

                ]);

                exit;
            }


            /*
            | Activity Log
            */

            $activityCollection->insertOne([

                "userId" => "",

                "action" =>
                    "JOB_STATUS_UPDATED",

                "description" =>
                    "Admin changed job status to "
                    . $status,

                "createdAt" =>
                    new MongoDB\BSON\UTCDateTime()

            ]);


            echo json_encode([

                "success" => true,

                "message" =>
                    "Job status updated successfully"

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE USER
        |--------------------------------------------------------------------------
        */

        $userId =
            trim($data['userId'] ?? '');


        $role =
            trim($data['role'] ?? '');


        $status =
            trim($data['status'] ?? '');


        if ($userId === '') {

            echo json_encode([

                "success" => false,

                "message" =>
                    "User ID is required"

            ]);

            exit;
        }


        if (
            !preg_match(
                '/^[a-f0-9]{24}$/i',
                $userId
            )
        ) {

            echo json_encode([

                "success" => false,

                "message" =>
                    "Invalid User ID"

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | BUILD USER UPDATE
        |--------------------------------------------------------------------------
        */

        $updateFields = [];


        /*
        |--------------------------------------------------------------------------
        | UPDATE ROLE
        |--------------------------------------------------------------------------
        */

        if ($role !== '') {

            $allowedRoles = [

                "candidate",
                "recruiter",
                "admin"

            ];


            if (
                !in_array(
                    $role,
                    $allowedRoles
                )
            ) {

                echo json_encode([

                    "success" => false,

                    "message" =>
                        "Invalid role"

                ]);

                exit;
            }


            $updateFields["role"] =
                $role;
        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE STATUS
        |--------------------------------------------------------------------------
        */

        if ($status !== '') {

            $allowedStatus = [

                "active",
                "inactive"

            ];


            if (
                !in_array(
                    $status,
                    $allowedStatus
                )
            ) {

                echo json_encode([

                    "success" => false,

                    "message" =>
                        "Invalid user status"

                ]);

                exit;
            }


            $updateFields["status"] =
                $status;
        }


        if (empty($updateFields)) {

            echo json_encode([

                "success" => false,

                "message" =>
                    "Nothing to update"

            ]);

            exit;
        }


        $updateFields["updatedAt"] =
            new MongoDB\BSON\UTCDateTime();


        /*
        |--------------------------------------------------------------------------
        | UPDATE USER
        |--------------------------------------------------------------------------
        */

        $result =
            $usersCollection->updateOne(

                [

                    "_id" =>
                        new MongoDB\BSON\ObjectId(
                            $userId
                        )

                ],

                [

                    '$set' =>
                        $updateFields

                ]

            );


        if (
            $result->getMatchedCount() === 0
        ) {

            echo json_encode([

                "success" => false,

                "message" =>
                    "User not found"

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | ACTIVITY LOG
        |--------------------------------------------------------------------------
        */

        $activityCollection->insertOne([

            "userId" =>
                $userId,

            "action" =>
                "USER_UPDATED",

            "description" =>
                "Admin updated user role/status",

            "createdAt" =>
                new MongoDB\BSON\UTCDateTime()

        ]);


        echo json_encode([

            "success" => true,

            "message" =>
                "User updated successfully"

        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE REQUEST
    |--------------------------------------------------------------------------
    */

    if ($method === 'DELETE') {


        /*
        |--------------------------------------------------------------------------
        | DELETE JOB
        |--------------------------------------------------------------------------
        */

        if (isset($_GET['jobId'])) {

            $jobId =
                trim($_GET['jobId']);


            if ($jobId === '') {

                echo json_encode([

                    "success" => false,

                    "message" =>
                        "Job ID is required"

                ]);

                exit;
            }


            if (
                !preg_match(
                    '/^[a-f0-9]{24}$/i',
                    $jobId
                )
            ) {

                echo json_encode([

                    "success" => false,

                    "message" =>
                        "Invalid Job ID"

                ]);

                exit;
            }


            $result =
                $jobsCollection->deleteOne([

                    "_id" =>
                        new MongoDB\BSON\ObjectId(
                            $jobId
                        )

                ]);


            if (
                $result->getDeletedCount() === 0
            ) {

                echo json_encode([

                    "success" => false,

                    "message" =>
                        "Job not found"

                ]);

                exit;
            }


            /*
            | Activity Log
            */

            $activityCollection->insertOne([

                "userId" => "",

                "action" =>
                    "JOB_DELETED",

                "description" =>
                    "Job deleted by admin",

                "createdAt" =>
                    new MongoDB\BSON\UTCDateTime()

            ]);


            echo json_encode([

                "success" => true,

                "message" =>
                    "Job deleted successfully"

            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | DELETE USER
        |--------------------------------------------------------------------------
        */

        $userId =
            $_GET['userId'] ?? '';


        if ($userId === '') {

            echo json_encode([

                "success" => false,

                "message" =>
                    "User ID is required"

            ]);

            exit;
        }


        if (
            !preg_match(
                '/^[a-f0-9]{24}$/i',
                $userId
            )
        ) {

            echo json_encode([

                "success" => false,

                "message" =>
                    "Invalid User ID"

            ]);

            exit;
        }


        $result =
            $usersCollection->deleteOne([

                "_id" =>
                    new MongoDB\BSON\ObjectId(
                        $userId
                    )

            ]);


        if (
            $result->getDeletedCount() === 0
        ) {

            echo json_encode([

                "success" => false,

                "message" =>
                    "User not found"

            ]);

            exit;
        }


        /*
        | Activity Log
        */

        $activityCollection->insertOne([

            "userId" =>
                $userId,

            "action" =>
                "USER_DELETED",

            "description" =>
                "User deleted by admin",

            "createdAt" =>
                new MongoDB\BSON\UTCDateTime()

        ]);


        echo json_encode([

            "success" => true,

            "message" =>
                "User deleted successfully"

        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | INVALID METHOD
    |--------------------------------------------------------------------------
    */

    echo json_encode([

        "success" => false,

        "message" =>
            "Method not allowed"

    ]);

} catch (
    MongoDB\Driver\Exception\Exception $e
) {

    echo json_encode([

        "success" => false,

        "message" =>
            "MongoDB operation failed",

        "error" =>
            $e->getMessage()

    ]);

} catch (Exception $e) {

    echo json_encode([

        "success" => false,

        "message" =>
            "Admin operation failed",

        "error" =>
            $e->getMessage()

    ]);
}
