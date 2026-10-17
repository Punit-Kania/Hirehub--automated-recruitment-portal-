import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthHeaders } from "../services/api";

function RecruiterInterviews() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [interviews, setInterviews] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [updatingId, setUpdatingId] =
        useState("");


    // ==========================================
    // LOAD LOGGED-IN RECRUITER
    // ==========================================

    useEffect(() => {

        const storedUser =
            localStorage.getItem(
                "hirehubUser"
            );


        if (!storedUser) {

            navigate("/login");

            return;

        }


        try {

            const loggedInUser =
                JSON.parse(
                    storedUser
                );


            if (
                !loggedInUser.role ||
                loggedInUser.role.toLowerCase() !==
                    "recruiter"
            ) {

                navigate("/dashboard");

                return;

            }


            setUser(
                loggedInUser
            );


            const recruiterId =
                loggedInUser._id ||
                loggedInUser.id ||
                loggedInUser.userId;


            if (!recruiterId) {

                setError(
                    "Recruiter ID not found. Please login again."
                );

                setLoading(false);

                return;

            }


            loadInterviews(
                recruiterId
            );


        } catch (err) {

            console.error(
                "Invalid user data:",
                err
            );

            navigate("/login");

        }

    }, [navigate]);


    // ==========================================
    // GET RECRUITER ID
    // ==========================================

    const getRecruiterId = () => {

        if (!user) {
            return null;
        }

        return (

            user._id ||
            user.id ||
            user.userId ||
            null

        );

    };


    // ==========================================
    // LOAD RECRUITER INTERVIEWS
    // ==========================================

    const loadInterviews = async (
        recruiterId
    ) => {

        try {

            setLoading(true);

            setError("");


            if (!recruiterId) {

                setError(
                    "Recruiter ID not found."
                );

                return;

            }


            console.log(
                "Loading interviews for recruiter:",
                recruiterId
            );


            const response =
                await fetch(

                    `${API.interviews}?recruiterId=${encodeURIComponent(
                        recruiterId
                    )}`,

                    {
                        method: "GET",

                        headers:
                            getAuthHeaders()

                    }

                );


            const data =
                await response.json();


            console.log(
                "Recruiter interviews response:",
                data
            );


            if (response.status === 401) {

                localStorage.removeItem(
                    "hirehubUser"
                );

                navigate("/login");

                return;

            }


            if (response.status === 403) {

                setError(
                    data.message ||
                    "Access denied. Recruiter permission required."
                );

                return;

            }


            if (!response.ok) {

                throw new Error(

                    data.message ||
                    "Unable to connect to Interview API"

                );

            }


            if (data.success) {

                setInterviews(
                    data.interviews || []
                );

            } else {

                setError(

                    data.message ||
                    "Unable to load interviews."

                );

            }


        } catch (err) {

            console.error(
                "Recruiter interview loading error:",
                err
            );


            setError(

                err.message ||
                "Failed to load interviews."

            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // UPDATE INTERVIEW
    // ==========================================

    const updateInterview = async (
        interview,
        status
    ) => {

        const recruiterId =
            getRecruiterId();


        if (!recruiterId) {

            setError(
                "Recruiter ID not found."
            );

            return;

        }


        try {

            setUpdatingId(
                interview.id
            );

            setError("");

            setMessage("");


            const response =
                await fetch(

                    API.interviews,

                    {

                        method: "PUT",

                        headers:
                            getAuthHeaders(),

                        body: JSON.stringify({

                            interviewId:
                                interview.id,

                            status:
                                status

                        })

                    }

                );


            const data =
                await response.json();


            console.log(
                "Interview update response:",
                data
            );


            if (response.status === 401) {

                localStorage.removeItem(
                    "hirehubUser"
                );

                navigate("/login");

                return;

            }


            if (response.status === 403) {

                throw new Error(

                    data.message ||
                    "Access denied."

                );

            }


            if (!response.ok) {

                throw new Error(

                    data.message ||
                    "Unable to update interview."

                );

            }


            if (!data.success) {

                throw new Error(

                    data.message ||
                    "Interview update failed."

                );

            }


            setMessage(

                data.message ||
                "Interview updated successfully."

            );


            await loadInterviews(
                recruiterId
            );


        } catch (err) {

            console.error(
                "Interview update error:",
                err
            );


            setError(

                err.message ||
                "Unable to update interview."

            );

        } finally {

            setUpdatingId("");

        }

    };


    // ==========================================
    // RESCHEDULE INTERVIEW
    // ==========================================

    const rescheduleInterview = async (
        interview
    ) => {

        const newDate =
            window.prompt(

                "Enter new interview date (YYYY-MM-DD):",

                interview.interviewDate

            );


        if (!newDate) {
            return;
        }


        const newTime =
            window.prompt(

                "Enter new interview time (HH:MM):",

                interview.interviewTime

            );


        if (!newTime) {
            return;
        }


        const recruiterId =
            getRecruiterId();


        if (!recruiterId) {

            setError(
                "Recruiter ID not found."
            );

            return;

        }


        try {

            setUpdatingId(
                interview.id
            );

            setError("");

            setMessage("");


            const response =
                await fetch(

                    API.interviews,

                    {

                        method: "PUT",

                        headers:
                            getAuthHeaders(),

                        body: JSON.stringify({

                            interviewId:
                                interview.id,

                            interviewDate:
                                newDate,

                            interviewTime:
                                newTime,

                            status:
                                "rescheduled"

                        })

                    }

                );


            const data =
                await response.json();


            console.log(
                "Reschedule response:",
                data
            );


            if (response.status === 401) {

                localStorage.removeItem(
                    "hirehubUser"
                );

                navigate("/login");

                return;

            }


            if (response.status === 403) {

                throw new Error(

                    data.message ||
                    "Access denied."

                );

            }


            if (!response.ok) {

                throw new Error(

                    data.message ||
                    "Unable to reschedule interview."

                );

            }


            if (!data.success) {

                throw new Error(

                    data.message ||
                    "Rescheduling failed."

                );

            }


            setMessage(

                data.message ||
                "Interview rescheduled successfully."

            );


            await loadInterviews(
                recruiterId
            );


        } catch (err) {

            console.error(
                "Reschedule error:",
                err
            );


            setError(

                err.message ||
                "Unable to reschedule interview."

            );

        } finally {

            setUpdatingId("");

        }

    };


    // ==========================================
    // FORMAT STATUS
    // ==========================================

    const formatStatus = (
        status
    ) => {

        if (!status) {
            return "Unknown";
        }

        return (

            status.charAt(0).toUpperCase() +
            status.slice(1)

        );

    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "-";
        }


        const parts =
            date.split("-");


        if (parts.length === 3) {

            return (

                `${parts[2]}/${parts[1]}/${parts[0]}`

            );

        }


        return date;

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="container py-5 text-center">

                <h4>
                    Loading Recruiter Interviews...
                </h4>

            </div>

        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="min-vh-100 bg-light">


            {/* ================================= */}
            {/* NAVBAR */}
            {/* ================================= */}

            <nav
                className="navbar navbar-dark bg-primary"
            >

                <div
                    className="container-fluid px-4"
                >

                    <span
                        className="navbar-brand fw-bold"
                    >

                        HireHub

                    </span>


                    <div>

                        <span
                            className="text-white me-3"
                        >

                            {user?.name ||
                                "Recruiter"}

                        </span>


                        <button

                            className="btn btn-light btn-sm"

                            onClick={() =>
                                navigate(
                                    "/recruiter/dashboard"
                                )
                            }

                        >

                            Dashboard

                        </button>

                    </div>

                </div>

            </nav>


            {/* ================================= */}
            {/* MAIN */}
            {/* ================================= */}

            <div className="container py-5">


                <h2 className="fw-bold">

                    Recruiter Interviews

                </h2>


                <p className="text-muted">

                    View and manage interviews
                    scheduled for your candidates.

                </p>


                {/* ERROR */}

                {error && (

                    <div className="alert alert-danger">

                        {error}

                    </div>

                )}


                {/* SUCCESS */}

                {message && (

                    <div className="alert alert-success">

                        {message}

                    </div>

                )}


                {/* NO INTERVIEWS */}

                {!error &&
                    interviews.length === 0 && (

                        <div className="alert alert-info">

                            No interviews found.

                        </div>

                    )}


                {/* ================================= */}
                {/* INTERVIEWS */}
                {/* ================================= */}

                {interviews.length > 0 && (

                    <div>

                        <h4 className="mb-4">

                            Total Interviews:{" "}

                            {
                                interviews.length
                            }

                        </h4>


                        {interviews.map(
                            (interview) => (

                                <div

                                    key={
                                        interview.id
                                    }

                                    className="card shadow-sm border-0 mb-4"

                                >

                                    <div className="card-body">


                                        <h4 className="fw-bold">

                                            {
                                                interview.jobTitle
                                            }

                                        </h4>


                                        <p>

                                            <strong>
                                                Company:
                                            </strong>{" "}

                                            {
                                                interview.company
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Candidate ID:
                                            </strong>{" "}

                                            {
                                                interview.userId
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Interview Date:
                                            </strong>{" "}

                                            {
                                                formatDate(
                                                    interview.interviewDate
                                                )
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Interview Time:
                                            </strong>{" "}

                                            {
                                                interview.interviewTime
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Mode:
                                            </strong>{" "}

                                            {
                                                interview.mode
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Status:
                                            </strong>{" "}

                                            {
                                                formatStatus(
                                                    interview.status
                                                )
                                            }

                                        </p>


                                        {/* MEETING LINK */}

                                        {interview.meetingLink &&
                                            interview.mode ===
                                                "online" && (

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

                                                        Open Meeting

                                                    </a>

                                                </p>

                                            )}


                                        {/* NOTES */}

                                        {interview.notes && (

                                            <p>

                                                <strong>
                                                    Notes:
                                                </strong>{" "}

                                                {
                                                    interview.notes
                                                }

                                            </p>

                                        )}


                                        {/* FEEDBACK */}

                                        {interview.feedback && (

                                            <p>

                                                <strong>
                                                    Feedback:
                                                </strong>{" "}

                                                {
                                                    interview.feedback
                                                }

                                            </p>

                                        )}


                                        {/* INTERVIEW ID */}

                                        <p>

                                            <strong>
                                                Interview ID:
                                            </strong>{" "}

                                            {
                                                interview.id
                                            }

                                        </p>


                                        {/* ================================= */}
                                        {/* ACTIONS */}
                                        {/* ================================= */}

                                        <div className="mt-3">


                                            {(interview.status ===
                                                "scheduled" ||

                                                interview.status ===
                                                "rescheduled") && (

                                                <>

                                                    {/* RESCHEDULE */}

                                                    <button

                                                        className="btn btn-warning btn-sm me-2"

                                                        disabled={
                                                            updatingId ===
                                                            interview.id
                                                        }

                                                        onClick={() =>
                                                            rescheduleInterview(
                                                                interview
                                                            )
                                                        }

                                                    >

                                                        Reschedule

                                                    </button>


                                                    {/* COMPLETE */}

                                                    <button

                                                        className="btn btn-success btn-sm me-2"

                                                        disabled={
                                                            updatingId ===
                                                            interview.id
                                                        }

                                                        onClick={() =>
                                                            updateInterview(
                                                                interview,
                                                                "completed"
                                                            )
                                                        }

                                                    >

                                                        Complete

                                                    </button>


                                                    {/* CANCEL */}

                                                    <button

                                                        className="btn btn-danger btn-sm"

                                                        disabled={
                                                            updatingId ===
                                                            interview.id
                                                        }

                                                        onClick={() =>
                                                            updateInterview(
                                                                interview,
                                                                "cancelled"
                                                            )
                                                        }

                                                    >

                                                        Cancel

                                                    </button>

                                                </>

                                            )}


                                            {updatingId ===
                                                interview.id && (

                                                    <span className="ms-2">

                                                        Updating...

                                                    </span>

                                                )}

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>

    );

}

export default RecruiterInterviews;