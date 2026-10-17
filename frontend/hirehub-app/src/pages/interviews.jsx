import { useEffect, useState } from "react";
import API, { getAuthHeaders } from "../services/api";

function Interviews() {

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadInterviews = async () => {

        try {

            setLoading(true);
            setError("");

            /*
            |--------------------------------------------------------------------------
            | Get logged-in user
            |--------------------------------------------------------------------------
            */

            const storedUser =
                localStorage.getItem("hirehubUser") ||
                localStorage.getItem("user");

            if (!storedUser) {

                setError("User is not logged in.");
                setLoading(false);

                return;
            }

            const user = JSON.parse(storedUser);

            console.log("Logged-in user:", user);


            /*
            |--------------------------------------------------------------------------
            | Get User ID
            |--------------------------------------------------------------------------
            */

            const userId =
                user._id ||
                user.id ||
                user.userId;

            console.log("User ID:", userId);


            if (!userId) {

                setError(
                    "User ID not found. Please login again."
                );

                setLoading(false);

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | Candidate only sees own interviews
            |--------------------------------------------------------------------------
            */

            console.log(
                "Loading interviews for:",
                userId
            );


            /*
            |--------------------------------------------------------------------------
            | IMPORTANT
            |--------------------------------------------------------------------------
            | Send authentication headers
            |--------------------------------------------------------------------------
            */

            const response = await fetch(
                `${API.interviews}?userId=${encodeURIComponent(userId)}`,
                {
                    method: "GET",
                    headers: getAuthHeaders()
                }
            );


            console.log(
                "Interview API status:",
                response.status
            );


            /*
            |--------------------------------------------------------------------------
            | Read response
            |--------------------------------------------------------------------------
            */

            const data = await response.json();

            console.log(
                "Interviews response:",
                data
            );


            /*
            |--------------------------------------------------------------------------
            | Handle API error
            |--------------------------------------------------------------------------
            */

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Unable to load interviews."
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Save interviews
            |--------------------------------------------------------------------------
            */

            setInterviews(
                data.interviews || []
            );

        } catch (err) {

            console.error(
                "Interviews error:",
                err
            );

            setError(
                err.message ||
                "Something went wrong while loading interviews."
            );

        } finally {

            setLoading(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | Load on page open
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadInterviews();

    }, []);


    /*
    |--------------------------------------------------------------------------
    | Status formatting
    |--------------------------------------------------------------------------
    */

    const getStatus = (status) => {

        if (!status) {
            return "Unknown";
        }

        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );

    };


    /*
    |--------------------------------------------------------------------------
    | Status class
    |--------------------------------------------------------------------------
    */

    const getStatusClass = (status) => {

        switch (status) {

            case "scheduled":
                return "text-primary";

            case "rescheduled":
                return "text-warning";

            case "completed":
                return "text-success";

            case "cancelled":
                return "text-danger";

            default:
                return "text-secondary";
        }

    };


    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    return (

        <div className="container py-5">

            <h1 className="text-center">
                HireHub
            </h1>

            <hr />

            <h2 className="text-center">
                My Interviews
            </h2>

            <p className="text-center">
                Here you can see your scheduled interviews.
            </p>

            <hr />


            {/* -------------------------------------------------------------- */}
            {/* Loading */}
            {/* -------------------------------------------------------------- */}

            {loading && (

                <div className="text-center py-4">

                    <p>
                        Loading interviews...
                    </p>

                </div>

            )}


            {/* -------------------------------------------------------------- */}
            {/* Error */}
            {/* -------------------------------------------------------------- */}

            {!loading && error && (

                <div className="alert alert-danger text-center">

                    <strong>
                        Error:
                    </strong>{" "}

                    {error}

                    <br />

                    <button
                        className="btn btn-primary mt-3"
                        onClick={loadInterviews}
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* -------------------------------------------------------------- */}
            {/* No Interviews */}
            {/* -------------------------------------------------------------- */}

            {!loading &&
                !error &&
                interviews.length === 0 && (

                    <div className="alert alert-info text-center">

                        <h4>
                            No Interviews Found
                        </h4>

                        <p>
                            You currently have no scheduled interviews.
                        </p>

                    </div>

                )}


            {/* -------------------------------------------------------------- */}
            {/* Interviews */}
            {/* -------------------------------------------------------------- */}

            {!loading &&
                !error &&
                interviews.length > 0 && (

                    <div>

                        <div className="alert alert-primary text-center">

                            <h4>
                                Total Interviews:{" "}
                                {interviews.length}
                            </h4>

                        </div>


                        {interviews.map((interview) => (

                            <div
                                key={interview.id}
                                className="card mb-3"
                            >

                                <div className="card-body text-center">

                                    {/* Job */}

                                    <h3>
                                        {interview.jobTitle ||
                                            "Job Title Not Available"}
                                    </h3>


                                    {/* Company */}

                                    <p>

                                        <strong>
                                            Company:
                                        </strong>{" "}

                                        {interview.company ||
                                            "N/A"}

                                    </p>


                                    {/* Date */}

                                    <p>

                                        <strong>
                                            Interview Date:
                                        </strong>{" "}

                                        {interview.interviewDate ||
                                            "N/A"}

                                    </p>


                                    {/* Time */}

                                    <p>

                                        <strong>
                                            Interview Time:
                                        </strong>{" "}

                                        {interview.interviewTime ||
                                            "N/A"}

                                    </p>


                                    {/* Mode */}

                                    <p>

                                        <strong>
                                            Mode:
                                        </strong>{" "}

                                        {interview.mode ||
                                            "N/A"}

                                    </p>


                                    {/* Status */}

                                    <p>

                                        <strong>
                                            Status:
                                        </strong>{" "}

                                        <span
                                            className={
                                                getStatusClass(
                                                    interview.status
                                                )
                                            }
                                        >

                                            {getStatus(
                                                interview.status
                                            )}

                                        </span>

                                    </p>


                                    {/* Meeting Link */}

                                    {interview.meetingLink && (

                                        <p>

                                            <strong>
                                                Meeting Link:
                                            </strong>{" "}

                                            <a
                                                href={
                                                    interview.meetingLink
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Join Interview
                                            </a>

                                        </p>

                                    )}


                                    {/* Notes */}

                                    {interview.notes && (

                                        <p>

                                            <strong>
                                                Notes:
                                            </strong>{" "}

                                            {interview.notes}

                                        </p>

                                    )}


                                    {/* Feedback */}

                                    {interview.feedback && (

                                        <p>

                                            <strong>
                                                Feedback:
                                            </strong>{" "}

                                            {interview.feedback}

                                        </p>

                                    )}


                                    {/* Interview ID */}

                                    <p>

                                        <strong>
                                            Interview ID:
                                        </strong>{" "}

                                        {interview.id}

                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

        </div>

    );

}

export default Interviews;