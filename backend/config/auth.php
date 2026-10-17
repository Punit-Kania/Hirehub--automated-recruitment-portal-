<?php

/*
|--------------------------------------------------------------------------
| HireHub Authentication Helper
|--------------------------------------------------------------------------
|
| React sends:
|
| X-User-Id
| X-User-Role
|
| This file reads those headers and provides:
|
| requireAuth()
| requireAdmin()
| requireRecruiter()
| requireCandidate()
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| GET REQUEST HEADER
|--------------------------------------------------------------------------
*/

function getRequestHeader($headerName)
{
    /*
    |--------------------------------------------------------------------------
    | Method 1 - $_SERVER
    |--------------------------------------------------------------------------
    */

    $serverKey =
        'HTTP_' .
        strtoupper(
            str_replace(
                '-',
                '_',
                $headerName
            )
        );


    if (
        isset($_SERVER[$serverKey]) &&
        trim((string) $_SERVER[$serverKey]) !== ''
    ) {

        return trim(
            (string) $_SERVER[$serverKey]
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Method 2 - getallheaders()
    |--------------------------------------------------------------------------
    */

    if (
        function_exists('getallheaders')
    ) {

        $headers = getallheaders();


        if (is_array($headers)) {

            foreach (
                $headers as $key => $value
            ) {

                if (
                    strtolower(trim($key)) ===
                    strtolower(trim($headerName))
                ) {

                    return trim(
                        (string) $value
                    );

                }

            }

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Method 3 - Apache specific
    |--------------------------------------------------------------------------
    */

    if (
        function_exists('apache_request_headers')
    ) {

        $headers =
            apache_request_headers();


        if (is_array($headers)) {

            foreach (
                $headers as $key => $value
            ) {

                if (
                    strtolower(trim($key)) ===
                    strtolower(trim($headerName))
                ) {

                    return trim(
                        (string) $value
                    );

                }

            }

        }

    }


    return '';
}


/*
|--------------------------------------------------------------------------
| GET AUTHENTICATED USER
|--------------------------------------------------------------------------
*/

function requireAuth()
{
    /*
    |--------------------------------------------------------------------------
    | READ USER ID
    |--------------------------------------------------------------------------
    */

    $userId =
        getRequestHeader(
            'X-User-Id'
        );


    /*
    |--------------------------------------------------------------------------
    | READ ROLE
    |--------------------------------------------------------------------------
    */

    $role =
        getRequestHeader(
            'X-User-Role'
        );


    $userId =
        trim(
            (string) $userId
        );


    $role =
        strtolower(
            trim(
                (string) $role
            )
        );


    /*
    |--------------------------------------------------------------------------
    | USER ID REQUIRED
    |--------------------------------------------------------------------------
    */

    if ($userId === '') {

        http_response_code(401);

        echo json_encode([

            "success" => false,

            "message" =>
                "Authentication required. User ID header is missing."

        ]);

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | ROLE REQUIRED
    |--------------------------------------------------------------------------
    */

    if ($role === '') {

        http_response_code(401);

        echo json_encode([

            "success" => false,

            "message" =>
                "Authentication required. User role header is missing."

        ]);

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | VALIDATE USER ID
    |--------------------------------------------------------------------------
    |
    | HireHub MongoDB users use 24-character ObjectIds.
    |
    |--------------------------------------------------------------------------
    */

    if (
        !preg_match(
            '/^[a-f0-9]{24}$/i',
            $userId
        )
    ) {

        http_response_code(401);

        echo json_encode([

            "success" => false,

            "message" =>
                "Invalid authenticated user ID."

        ]);

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | VALIDATE ROLE
    |--------------------------------------------------------------------------
    */

    $allowedRoles = [

        'candidate',
        'recruiter',
        'admin'

    ];


    if (
        !in_array(
            $role,
            $allowedRoles,
            true
        )
    ) {

        http_response_code(403);

        echo json_encode([

            "success" => false,

            "message" =>
                "Invalid user role."

        ]);

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION SUCCESSFUL
    |--------------------------------------------------------------------------
    */

    return [

        "userId" => $userId,

        "role" => $role

    ];

}


/*
|--------------------------------------------------------------------------
| REQUIRE ADMIN
|--------------------------------------------------------------------------
*/

function requireAdmin()
{
    $auth =
        requireAuth();


    if (
        ($auth['role'] ?? '') !==
        'admin'
    ) {

        http_response_code(403);

        echo json_encode([

            "success" => false,

            "message" =>
                "Access denied. Admin permission required."

        ]);

        exit;

    }


    return $auth;

}


/*
|--------------------------------------------------------------------------
| REQUIRE RECRUITER
|--------------------------------------------------------------------------
*/

function requireRecruiter()
{
    $auth =
        requireAuth();


    if (
        ($auth['role'] ?? '') !==
        'recruiter'
    ) {

        http_response_code(403);

        echo json_encode([

            "success" => false,

            "message" =>
                "Access denied. Recruiter permission required."

        ]);

        exit;

    }


    return $auth;

}


/*
|--------------------------------------------------------------------------
| REQUIRE CANDIDATE
|--------------------------------------------------------------------------
*/

function requireCandidate()
{
    $auth =
        requireAuth();


    if (
        ($auth['role'] ?? '') !==
        'candidate'
    ) {

        http_response_code(403);

        echo json_encode([

            "success" => false,

            "message" =>
                "Access denied. Candidate permission required."

        ]);

        exit;

    }


    return $auth;

}

?>