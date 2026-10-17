<?php
require_once __DIR__ . '/../config/cors.php';
//header("Access-Control-Allow-Methods: GET, OPTIONS");
//header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id, X-User-Role");
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
    | METHOD CHECK
    |--------------------------------------------------------------------------
    */

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {

        http_response_code(405);

        echo json_encode([
            "success" => false,
            "message" => "Only GET requests are allowed"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | RECRUITER AUTHENTICATION
    |--------------------------------------------------------------------------
    |
    | Smart Matching is available only to recruiters.
    |
    | requireRecruiter() reads:
    |
    | X-User-Id
    | X-User-Role
    |
    */

    $auth = requireRecruiter();


    $authenticatedUserId =
        trim((string) ($auth['userId'] ?? ''));


    if ($authenticatedUserId === '') {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Recruiter authentication information is missing"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | DATABASE
    |--------------------------------------------------------------------------
    */

    $database = new Database();

    $db =
        $database->getDatabase();


    $jobsCollection =
        $db->jobs;

    $profilesCollection =
        $db->profiles;

    $usersCollection =
        $db->users;


    /*
    |--------------------------------------------------------------------------
    | GET JOB ID
    |--------------------------------------------------------------------------
    */

    $jobId =
        trim(
            (string) (
                $_GET['jobId'] ?? ''
            )
        );


    if ($jobId === '') {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Job ID is required"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | VALIDATE JOB ID FORMAT
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
            "message" => "Invalid Job ID"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CONVERT JOB ID TO OBJECTID
    |--------------------------------------------------------------------------
    */

    try {

        $jobObjectId =
            new MongoDB\BSON\ObjectId(
                $jobId
            );

    } catch (Exception $e) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid Job ID"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | FIND JOB BELONGING TO AUTHENTICATED RECRUITER
    |--------------------------------------------------------------------------
    |
    | IMPORTANT SECURITY CHECK
    |
    | We DO NOT accept recruiterId from the URL.
    |
    | The recruiter identity comes from auth.php.
    |
    */

    $job =
        $jobsCollection->findOne([

            "_id" =>
                $jobObjectId,

            "recruiterId" =>
                $authenticatedUserId

        ]);


    /*
    |--------------------------------------------------------------------------
    | JOB AUTHORIZATION CHECK
    |--------------------------------------------------------------------------
    */

    if (!$job) {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" =>
                "Job not found or you are not authorized to use Smart Matching for this job"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | GET REQUIRED JOB SKILLS
    |--------------------------------------------------------------------------
    */

    $jobSkills =
        $job['skills'] ?? [];


    /*
    |--------------------------------------------------------------------------
    | HANDLE MONGODB ARRAY
    |--------------------------------------------------------------------------
    */

    if (
        $jobSkills instanceof Traversable
    ) {

        $jobSkills =
            iterator_to_array(
                $jobSkills
            );

    }


    if (!is_array($jobSkills)) {

        $jobSkills = [];

    }


    /*
    |--------------------------------------------------------------------------
    | CLEAN JOB SKILLS
    |--------------------------------------------------------------------------
    */

    $jobSkillsClean = [];


    foreach (
        $jobSkills
        as $skill
    ) {

        $skill =
            strtolower(
                trim(
                    (string) $skill
                )
            );


        if ($skill !== '') {

            $jobSkillsClean[] =
                $skill;

        }

    }


    /*
    |--------------------------------------------------------------------------
    | REMOVE DUPLICATE SKILLS
    |--------------------------------------------------------------------------
    */

    $jobSkillsClean =
        array_values(
            array_unique(
                $jobSkillsClean
            )
        );


    /*
    |--------------------------------------------------------------------------
    | CHECK REQUIRED SKILLS
    |--------------------------------------------------------------------------
    */

    if (
        count($jobSkillsClean) === 0
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "This job has no required skills"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | GET CANDIDATE PROFILES
    |--------------------------------------------------------------------------
    */

    $profiles =
        $profilesCollection
            ->find([])
            ->toArray();


    $matchedCandidates = [];


    /*
    |--------------------------------------------------------------------------
    | PROCESS EACH PROFILE
    |--------------------------------------------------------------------------
    */

    foreach (
        $profiles
        as $profile
    ) {


        /*
        |--------------------------------------------------------------------------
        | GET PROFILE USER ID
        |--------------------------------------------------------------------------
        */

        $userId =
            trim(
                (string) (
                    $profile['userId']
                    ?? ''
                )
            );


        /*
        |--------------------------------------------------------------------------
        | VALIDATE USER ID
        |--------------------------------------------------------------------------
        */

        if (
            $userId === '' ||
            !preg_match(
                '/^[a-f0-9]{24}$/i',
                $userId
            )
        ) {

            continue;
        }


        /*
        |--------------------------------------------------------------------------
        | CONVERT USER ID
        |--------------------------------------------------------------------------
        */

        try {

            $candidateObjectId =
                new MongoDB\BSON\ObjectId(
                    $userId
                );

        } catch (Exception $e) {

            continue;
        }


        /*
        |--------------------------------------------------------------------------
        | GET USER
        |--------------------------------------------------------------------------
        */

        $candidateUser =
            $usersCollection->findOne([

                "_id" =>
                    $candidateObjectId

            ]);


        /*
        |--------------------------------------------------------------------------
        | USER MUST EXIST
        |--------------------------------------------------------------------------
        */

        if (!$candidateUser) {

            continue;
        }


        /*
        |--------------------------------------------------------------------------
        | ONLY CANDIDATE USERS
        |--------------------------------------------------------------------------
        */

        $candidateRole =
            strtolower(
                trim(
                    (string) (
                        $candidateUser['role']
                        ?? 'candidate'
                    )
                )
            );


        if (
            $candidateRole !==
            'candidate'
        ) {

            continue;
        }


        /*
        |--------------------------------------------------------------------------
        | CANDIDATE INFORMATION
        |--------------------------------------------------------------------------
        */

        $candidateName =
            $candidateUser['name']
            ?? '';

        $candidateEmail =
            $candidateUser['email']
            ?? '';


        /*
        |--------------------------------------------------------------------------
        | GET CANDIDATE SKILLS
        |--------------------------------------------------------------------------
        */

        $candidateSkills =
            $profile['skills'] ?? [];


        /*
        |--------------------------------------------------------------------------
        | HANDLE MONGODB ARRAY
        |--------------------------------------------------------------------------
        */

        if (
            $candidateSkills instanceof Traversable
        ) {

            $candidateSkills =
                iterator_to_array(
                    $candidateSkills
                );

        }


        if (
            !is_array(
                $candidateSkills
            )
        ) {

            $candidateSkills = [];

        }


        /*
        |--------------------------------------------------------------------------
        | CLEAN CANDIDATE SKILLS
        |--------------------------------------------------------------------------
        */

        $candidateSkillsClean = [];


        foreach (
            $candidateSkills
            as $skill
        ) {

            $skill =
                strtolower(
                    trim(
                        (string) $skill
                    )
                );


            if ($skill !== '') {

                $candidateSkillsClean[] =
                    $skill;

            }

        }


        /*
        |--------------------------------------------------------------------------
        | REMOVE DUPLICATE CANDIDATE SKILLS
        |--------------------------------------------------------------------------
        */

        $candidateSkillsClean =
            array_values(
                array_unique(
                    $candidateSkillsClean
                )
            );


        /*
        |--------------------------------------------------------------------------
        | FIND MATCHED AND MISSING SKILLS
        |--------------------------------------------------------------------------
        */

        $matchedSkills = [];

        $missingSkills = [];


        foreach (
            $jobSkillsClean
            as $jobSkill
        ) {

            if (
                in_array(
                    $jobSkill,
                    $candidateSkillsClean,
                    true
                )
            ) {

                $matchedSkills[] =
                    $jobSkill;

            } else {

                $missingSkills[] =
                    $jobSkill;

            }

        }


        /*
        |--------------------------------------------------------------------------
        | CALCULATE MATCH PERCENTAGE
        |--------------------------------------------------------------------------
        */

        $totalJobSkills =
            count(
                $jobSkillsClean
            );


        $totalMatchedSkills =
            count(
                $matchedSkills
            );


        $matchPercentage =
            (
                $totalMatchedSkills /
                $totalJobSkills
            ) * 100;


        $matchPercentage =
            round(
                $matchPercentage,
                2
            );


        /*
        |--------------------------------------------------------------------------
        | MATCH LEVEL
        |--------------------------------------------------------------------------
        */

        if (
            $matchPercentage >= 80
        ) {

            $matchLevel =
                "Excellent Match";

        } elseif (
            $matchPercentage >= 60
        ) {

            $matchLevel =
                "Good Match";

        } elseif (
            $matchPercentage >= 40
        ) {

            $matchLevel =
                "Average Match";

        } else {

            $matchLevel =
                "Low Match";

        }


        /*
        |--------------------------------------------------------------------------
        | RECOMMENDATION
        |--------------------------------------------------------------------------
        |
        | 60% or higher = recommended
        |
        */

        $recommended =
            $matchPercentage >= 60;


        /*
        |--------------------------------------------------------------------------
        | STORE CANDIDATE RESULT
        |--------------------------------------------------------------------------
        */

        $matchedCandidates[] = [

            "userId" =>
                $userId,

            "candidateName" =>
                $candidateName,

            "email" =>
                $candidateEmail,

            "phone" =>
                $profile['phone']
                ?? '',

            "location" =>
                $profile['location']
                ?? '',

            "education" =>
                $profile['education']
                ?? '',

            "experience" =>
                $profile['experience']
                ?? '',

            "skills" =>
                $candidateSkillsClean,

            "matchedSkills" =>
                $matchedSkills,

            "missingSkills" =>
                $missingSkills,

            "matchPercentage" =>
                $matchPercentage,

            "matchLevel" =>
                $matchLevel,

            "recommended" =>
                $recommended

        ];

    }


    /*
    |--------------------------------------------------------------------------
    | SORT CANDIDATES
    |--------------------------------------------------------------------------
    |
    | 1. Recommended candidates first
    | 2. Highest match percentage first
    |
    */

    usort(

        $matchedCandidates,

        function (
            $a,
            $b
        ) {

            if (
                $a['recommended'] !==
                $b['recommended']
            ) {

                return
                    $b['recommended']
                    <=>
                    $a['recommended'];

            }


            return
                $b['matchPercentage']
                <=>
                $a['matchPercentage'];

        }

    );


    /*
    |--------------------------------------------------------------------------
    | ADD RANK
    |--------------------------------------------------------------------------
    */

    $rank = 1;


    foreach (
        $matchedCandidates
        as &$candidate
    ) {

        $candidate['rank'] =
            $rank;

        $rank++;

    }


    unset($candidate);


    /*
    |--------------------------------------------------------------------------
    | COUNT RECOMMENDED CANDIDATES
    |--------------------------------------------------------------------------
    */

    $recommendedCount = 0;


    foreach (
        $matchedCandidates
        as $candidate
    ) {

        if (
            $candidate['recommended'] === true
        ) {

            $recommendedCount++;

        }

    }


    /*
    |--------------------------------------------------------------------------
    | FINAL RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([

        "success" =>
            true,

        "job" => [

            "id" =>
                (string) $job['_id'],

            "title" =>
                $job['title']
                ?? '',

            "company" =>
                $job['company']
                ?? '',

            "requiredSkills" =>
                $jobSkillsClean

        ],

        "count" =>
            count(
                $matchedCandidates
            ),

        "recommendedCount" =>
            $recommendedCount,

        "candidates" =>
            $matchedCandidates

    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([

        "success" =>
            false,

        "message" =>
            "Smart matching failed",

        "error" =>
            $e->getMessage()

    ]);

}
?>
