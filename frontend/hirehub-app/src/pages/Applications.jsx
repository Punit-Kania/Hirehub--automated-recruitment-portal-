import { useEffect, useState } from "react";
import API, { getAuthHeaders } from "../services/api";

function Applications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            setLoading(true);
            setError("");

            /*
            ====================================================
            GET LOGGED-IN USER
            ====================================================
            */

            const storedUser =
                localStorage.getItem("hirehubUser") ||
                localStorage.getItem("user");

            if (!storedUser) {
                setError("User is not logged in.");
                setLoading(false);
                return;
            }

            let user;

            try {
                user = JSON.parse(storedUser);
            } catch (parseError) {
                console.error(
                    "Invalid user data:",
                    parseError
                );

                setError(
                    "Invalid login information. Please login again."
                );

                setLoading(false);
                return;
            }

            /*
            ====================================================
            GET USER ID
            ====================================================
            */

            let userId =
                user.id ||
                user._id ||
                user.userId ||
                null;

            /*
            ====================================================
            HANDLE MONGODB OBJECT ID
            ====================================================
            */

            if (
                userId &&
                typeof userId === "object" &&
                userId.$oid
            ) {
                userId = userId.$oid;
            }

            if (!userId) {
                setError(
                    "User ID not found. Please login again."
                );

                setLoading(false);
                return;
            }

            console.log(
                "Logged-in user:",
                user
            );

            console.log(
                "Loading applications for:",
                userId
            );

            /*
            ====================================================
            LOAD CANDIDATE APPLICATIONS
            ====================================================
            */

            const response = await fetch(
                `${API.applications}?userId=${encodeURIComponent(
                    userId
                )}`,
                {
                    method: "GET",
                    headers: getAuthHeaders()
                }
            );

            /*
            ====================================================
            CHECK HTTP RESPONSE
            ====================================================
            */

            const responseText =
                await response.text();

            console.log(
                "Applications raw response:",
                responseText
            );

            let data;

            try {
                data = JSON.parse(responseText);
            } catch (jsonError) {

                console.error(
                    "Applications JSON error:",
                    jsonError
                );

                throw new Error(
                    "Server returned an invalid response. Please check applications.php."
                );
            }

            console.log(
                "Applications response:",
                data
            );

            /*
            ====================================================
            HANDLE API ERROR
            ====================================================
            */

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    `Applications API error (${response.status})`
                );
            }

            /*
            ====================================================
            SUCCESS
            ====================================================
            */

            if (data.success) {

                setApplications(
                    data.applications || []
                );

            } else {

                setError(
                    data.message ||
                    "Unable to load applications."
                );
            }

        } catch (err) {

            console.error(
                "Applications error:",
                err
            );

            setError(
                err.message ||
                "Something went wrong while loading applications."
            );

        } finally {

            setLoading(false);
        }
    };

    /*
    ============================================================
    STATUS FORMAT
    ============================================================
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
    ============================================================
    STATUS CLASS
    ============================================================
    */

    const getStatusClass = (status) => {

        switch (status) {

            case "applied":
                return "bg-primary";

            case "shortlisted":
                return "bg-warning text-dark";

            case "interview":
                return "bg-info text-dark";

            case "selected":
                return "bg-success";

            case "rejected":
                return "bg-danger";

            default:
                return "bg-secondary";
        }
    };

    /*
    ============================================================
    LOADING
    ============================================================
    */

    if (loading) {

        return (
            <div className="container py-5 text-center">

                <h1>HireHub</h1>

                <hr />

                <h2>My Applications</h2>

                <p>
                    Loading applications...
                </p>

            </div>
        );
    }

    /*
    ============================================================
    PAGE
    ============================================================
    */

    return (

        <div className="container py-5">

            <h1 className="text-center">
                HireHub
            </h1>

            <hr />

            <h2 className="text-center">
                My Applications
            </h2>

            <p className="text-center">
                Here you can see the jobs you have applied for.
            </p>

            <hr />

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="alert alert-danger text-center">

                    <strong>Error:</strong>{" "}
                    {error}

                    <br />

                    <button
                        className="btn btn-primary mt-3"
                        onClick={loadApplications}
                    >
                        Try Again
                    </button>

                </div>
            )}

            {/* =================================================
                NO APPLICATIONS
            ================================================= */}

            {!error &&
                applications.length === 0 && (

                    <div className="alert alert-info text-center">

                        <h3>
                            No Applications Found
                        </h3>

                        <p>
                            You have not applied for any jobs yet.
                        </p>

                        <button
                            className="btn btn-primary"
                            onClick={() =>
                                window.location.href = "/jobs"
                            }
                        >
                            Browse Jobs
                        </button>

                    </div>
                )}

            {/* =================================================
                APPLICATIONS
            ================================================= */}

            {!error &&
                applications.length > 0 && (

                    <div>

                        <div className="alert alert-primary text-center">

                            <h3 className="mb-0">
                                Total Applications:{" "}
                                {applications.length}
                            </h3>

                        </div>

                        {applications.map(
                            (application, index) => (

                                <div
                                    key={
                                        application.id ||
                                        index
                                    }
                                    className="card mb-3 shadow-sm"
                                >

                                    <div className="card-body">

                                        {/* JOB TITLE */}

                                        <h3 className="card-title">

                                            {
                                                application.jobTitle
                                            }

                                        </h3>

                                        {/* COMPANY */}

                                        <p>
                                            <strong>
                                                Company:
                                            </strong>{" "}

                                            {
                                                application.company ||
                                                "N/A"
                                            }
                                        </p>

                                        {/* STATUS */}

                                        <p>

                                            <strong>
                                                Status:
                                            </strong>{" "}

                                            <span
                                                className={`badge ${getStatusClass(
                                                    application.status
                                                )}`}
                                            >
                                                {getStatus(
                                                    application.status
                                                )}
                                            </span>

                                        </p>

                                        {/* APPLIED DATE */}

                                        <p>
                                            <strong>
                                                Applied At:
                                            </strong>{" "}

                                            {
                                                application.appliedAt ||
                                                "N/A"
                                            }
                                        </p>

                                        {/* UPDATED DATE */}

                                        <p>
                                            <strong>
                                                Updated At:
                                            </strong>{" "}

                                            {
                                                application.updatedAt ||
                                                "N/A"
                                            }
                                        </p>

                                        {/* APPLICATION ID */}

                                        <p className="mb-0">

                                            <strong>
                                                Application ID:
                                            </strong>{" "}

                                            {
                                                application.id ||
                                                "N/A"
                                            }

                                        </p>

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

        </div>
    );
}

export default Applications;