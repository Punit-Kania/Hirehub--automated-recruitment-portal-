import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthHeaders } from "../services/api";

function RecruiterApplications() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState("");

    const [showInterviewForm, setShowInterviewForm] =
        useState(false);

    const [selectedApplication, setSelectedApplication] =
        useState(null);

    const [scheduling, setScheduling] =
        useState(false);

    const [interviewMessage, setInterviewMessage] =
        useState("");

    const [interviewForm, setInterviewForm] = useState({
        interviewDate: "",
        interviewTime: "",
        mode: "online",
        meetingLink: "",
        notes: ""
    });


    // ==========================================
    // LOAD PAGE
    // ==========================================

    useEffect(() => {

        const storedUser =
            localStorage.getItem("hirehubUser");

        if (!storedUser) {

            navigate("/login");

            return;
        }

        try {

            const loggedInUser =
                JSON.parse(storedUser);

            if (
                !loggedInUser.role ||
                loggedInUser.role.toLowerCase() !== "recruiter"
            ) {

                setError(
                    "Access denied. Recruiter account required."
                );

                setLoading(false);

                return;
            }

            setUser(loggedInUser);

            loadApplications(
                loggedInUser
            );

        } catch (err) {

            console.error(
                "Invalid user data:",
                err
            );

            localStorage.removeItem(
                "hirehubUser"
            );

            navigate("/login");

        }

    }, [navigate]);


    // ==========================================
    // GET RECRUITER ID
    // ==========================================

    const getRecruiterId = (loggedInUser = user) => {

        if (!loggedInUser) {
            return null;
        }

        return (
            loggedInUser._id ||
            loggedInUser.id ||
            loggedInUser.userId ||
            null
        );

    };


    // ==========================================
    // LOAD APPLICATIONS
    // ==========================================

    const loadApplications = async (
        loggedInUser = user
    ) => {

        try {

            setLoading(true);
            setError("");

            const recruiterId =
                getRecruiterId(loggedInUser);


            if (!recruiterId) {

                setError(
                    "Recruiter ID not found. Please login again."
                );

                setLoading(false);

                return;
            }


            console.log(
                "Loading applications for recruiter:",
                recruiterId
            );


            const response =
                await fetch(

                    `${API.applications}?recruiterId=${encodeURIComponent(
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
                "Recruiter applications response:",
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
                    "Unable to connect to Applications API"
                );

            }


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
                "Recruiter applications error:",
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


    // ==========================================
    // UPDATE APPLICATION STATUS
    // ==========================================

    const updateStatus = async (
        applicationId,
        status
    ) => {

        try {

            setUpdatingId(
                applicationId
            );

            setError("");


            const response =
                await fetch(

                    API.applications,

                    {
                        method: "PUT",

                        headers:
                            getAuthHeaders(),

                        body: JSON.stringify({

                            applicationId:
                                applicationId,

                            status:
                                status

                        })

                    }

                );


            const data =
                await response.json();


            console.log(
                "Status update response:",
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
                    "Unable to update application status"
                );

            }


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Application status update failed"
                );

            }


            setApplications(
                (previousApplications) =>

                    previousApplications.map(
                        (application) =>

                            application.id ===
                            applicationId

                                ? {
                                    ...application,
                                    status: status
                                }

                                : application
                    )

            );


        } catch (err) {

            console.error(
                "Status update error:",
                err
            );

            setError(
                err.message ||
                "Unable to update application status."
            );

        } finally {

            setUpdatingId("");

        }

    };


    // ==========================================
    // OPEN INTERVIEW FORM
    // ==========================================

    const openInterviewForm = (
        application
    ) => {

        setSelectedApplication(
            application
        );

        setInterviewMessage("");

        setInterviewForm({

            interviewDate: "",

            interviewTime: "",

            mode: "online",

            meetingLink: "",

            notes: ""

        });

        setShowInterviewForm(true);

    };


    // ==========================================
    // CLOSE INTERVIEW FORM
    // ==========================================

    const closeInterviewForm = () => {

        if (scheduling) {
            return;
        }

        setShowInterviewForm(false);

        setSelectedApplication(null);

        setInterviewMessage("");

    };


    // ==========================================
    // INTERVIEW FORM INPUT
    // ==========================================

    const handleInterviewChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setInterviewForm(
            (previous) => ({

                ...previous,

                [name]: value

            })
        );

    };


    // ==========================================
    // SCHEDULE INTERVIEW
    // ==========================================

    const scheduleInterview = async (
        event
    ) => {

        event.preventDefault();


        if (!selectedApplication) {
            return;
        }


        try {

            setScheduling(true);

            setInterviewMessage("");


            const storedUser =
                localStorage.getItem(
                    "hirehubUser"
                );


            if (!storedUser) {

                setInterviewMessage(
                    "Recruiter is not logged in."
                );

                navigate("/login");

                return;
            }


            const loggedInUser =
                JSON.parse(storedUser);


            if (
                !loggedInUser.role ||
                loggedInUser.role.toLowerCase() !==
                    "recruiter"
            ) {

                setInterviewMessage(
                    "Recruiter account required."
                );

                return;
            }


            const recruiterId =
                getRecruiterId(
                    loggedInUser
                );


            if (!recruiterId) {

                setInterviewMessage(
                    "Recruiter ID not found. Please login again."
                );

                return;
            }


            // ==================================
            // ONLINE MEETING LINK VALIDATION
            // ==================================

            if (
                interviewForm.mode === "online" &&
                interviewForm.meetingLink.trim() === ""
            ) {

                setInterviewMessage(
                    "Meeting link is required for online interviews."
                );

                return;
            }


            // ==================================
            // SCHEDULE INTERVIEW
            // ==================================

            const response =
                await fetch(

                    API.interviews,

                    {
                        method: "POST",

                        headers:
                            getAuthHeaders(),

                        body: JSON.stringify({

                            applicationId:
                                selectedApplication.id,

                            interviewerId:
                                recruiterId,

                            interviewDate:
                                interviewForm.interviewDate,

                            interviewTime:
                                interviewForm.interviewTime,

                            mode:
                                interviewForm.mode,

                            meetingLink:
                                interviewForm.meetingLink,

                            notes:
                                interviewForm.notes

                        })

                    }

                );


            const data =
                await response.json();


            console.log(
                "Schedule interview response:",
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
                    "Unable to connect to Interview API"
                );

            }


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Interview scheduling failed"
                );

            }


            // ==================================
            // SUCCESS
            // ==================================

            setInterviewMessage(

                `Interview scheduled successfully! Interview ID: ${data.interviewId}`

            );


            // ==================================
            // UPDATE APPLICATION STATUS
            // ==================================

            setApplications(
                (previousApplications) =>

                    previousApplications.map(
                        (application) =>

                            application.id ===
                            selectedApplication.id

                                ? {

                                    ...application,

                                    status:
                                        "interview"

                                }

                                : application
                    )

            );


        } catch (err) {

            console.error(
                "Schedule interview error:",
                err
            );

            setInterviewMessage(
                err.message ||
                "Unable to schedule interview."
            );

        } finally {

            setScheduling(false);

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
    // PAGE
    // ==========================================

    return (

        <div>

            <h1>HireHub</h1>

            <hr />

            <h2>
                Recruiter Applications
            </h2>

            <p>
                Review and manage applications
                submitted for your jobs.
            </p>

            <hr />


            {/* ================================= */}
            {/* LOADING */}
            {/* ================================= */}

            {loading && (

                <p>
                    Loading applications...
                </p>

            )}


            {/* ================================= */}
            {/* ERROR */}
            {/* ================================= */}

            {!loading && error && (

                <div>

                    <p>

                        <strong>
                            Error:
                        </strong>{" "}

                        {error}

                    </p>


                    <button
                        onClick={() =>
                            loadApplications()
                        }
                    >

                        Try Again

                    </button>

                </div>

            )}


            {/* ================================= */}
            {/* NO APPLICATIONS */}
            {/* ================================= */}

            {!loading &&
                !error &&
                applications.length === 0 && (

                    <div>

                        <h3>
                            No Applications Found
                        </h3>

                        <p>
                            There are currently no
                            applications for your jobs.
                        </p>

                    </div>

                )}


            {/* ================================= */}
            {/* APPLICATIONS */}
            {/* ================================= */}

            {!loading &&
                !error &&
                applications.length > 0 && (

                    <div>

                        <h3>

                            Total Applications:{" "}

                            {
                                applications.length
                            }

                        </h3>


                        {applications.map(
                            (application) => (

                                <div
                                    key={
                                        application.id
                                    }

                                    style={{
                                        border:
                                            "1px solid #ccc",

                                        padding:
                                            "20px",

                                        marginBottom:
                                            "15px"
                                    }}
                                >

                                    <h3>
                                        {
                                            application.jobTitle
                                        }
                                    </h3>


                                    <p>

                                        <strong>
                                            Company:
                                        </strong>{" "}

                                        {
                                            application.company
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Candidate ID:
                                        </strong>{" "}

                                        {
                                            application.userId
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Application ID:
                                        </strong>{" "}

                                        {
                                            application.id
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Applied At:
                                        </strong>{" "}

                                        {
                                            application.appliedAt ||
                                            "N/A"
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Current Status:
                                        </strong>{" "}

                                        {
                                            formatStatus(
                                                application.status
                                            )
                                        }

                                    </p>


                                    {/* STATUS */}

                                    <label>

                                        <strong>
                                            Change Status:
                                        </strong>{" "}


                                        <select

                                            value={
                                                application.status ||
                                                "applied"
                                            }

                                            disabled={
                                                updatingId ===
                                                application.id
                                            }

                                            onChange={(
                                                event
                                            ) =>
                                                updateStatus(
                                                    application.id,
                                                    event.target.value
                                                )
                                            }

                                        >

                                            <option value="applied">
                                                Applied
                                            </option>

                                            <option value="shortlisted">
                                                Shortlisted
                                            </option>

                                            <option value="interview">
                                                Interview
                                            </option>

                                            <option value="selected">
                                                Selected
                                            </option>

                                            <option value="rejected">
                                                Rejected
                                            </option>

                                        </select>

                                    </label>


                                    {updatingId ===
                                        application.id && (

                                            <p>
                                                Updating status...
                                            </p>

                                        )}


                                    {/* SCHEDULE BUTTON */}

                                    {(application.status ===
                                        "shortlisted" ||

                                        application.status ===
                                        "interview") && (

                                        <div>

                                            <br />

                                            <button
                                                onClick={() =>
                                                    openInterviewForm(
                                                        application
                                                    )
                                                }
                                            >

                                                Schedule Interview

                                            </button>

                                        </div>

                                    )}

                                </div>

                            )
                        )}

                    </div>

                )}


            {/* ================================= */}
            {/* INTERVIEW FORM */}
            {/* ================================= */}

            {showInterviewForm &&
                selectedApplication && (

                    <div>

                        <hr />

                        <h2>
                            Schedule Interview
                        </h2>


                        <p>

                            <strong>
                                Job:
                            </strong>{" "}

                            {
                                selectedApplication.jobTitle
                            }

                        </p>


                        <p>

                            <strong>
                                Candidate:
                            </strong>{" "}

                            {
                                selectedApplication.userId
                            }

                        </p>


                        <p>

                            <strong>
                                Application ID:
                            </strong>{" "}

                            {
                                selectedApplication.id
                            }

                        </p>


                        <form
                            onSubmit={
                                scheduleInterview
                            }
                        >

                            {/* DATE */}

                            <div>

                                <label>

                                    <strong>
                                        Interview Date:
                                    </strong>

                                </label>

                                <br />

                                <input
                                    type="date"
                                    name="interviewDate"
                                    value={
                                        interviewForm.interviewDate
                                    }
                                    onChange={
                                        handleInterviewChange
                                    }
                                    required
                                />

                            </div>


                            <br />


                            {/* TIME */}

                            <div>

                                <label>

                                    <strong>
                                        Interview Time:
                                    </strong>

                                </label>

                                <br />

                                <input
                                    type="time"
                                    name="interviewTime"
                                    value={
                                        interviewForm.interviewTime
                                    }
                                    onChange={
                                        handleInterviewChange
                                    }
                                    required
                                />

                            </div>


                            <br />


                            {/* MODE */}

                            <div>

                                <label>

                                    <strong>
                                        Interview Mode:
                                    </strong>

                                </label>

                                <br />

                                <select
                                    name="mode"
                                    value={
                                        interviewForm.mode
                                    }
                                    onChange={
                                        handleInterviewChange
                                    }
                                    required
                                >

                                    <option value="online">
                                        Online
                                    </option>

                                    <option value="offline">
                                        Offline
                                    </option>

                                </select>

                            </div>


                            <br />


                            {/* MEETING LINK */}

                            <div>

                                <label>

                                    <strong>
                                        Meeting Link:
                                    </strong>

                                </label>

                                <br />

                                <input
                                    type="text"
                                    name="meetingLink"
                                    value={
                                        interviewForm.meetingLink
                                    }
                                    onChange={
                                        handleInterviewChange
                                    }
                                    placeholder="https://meet.google.com/..."
                                />

                            </div>


                            <br />


                            {/* NOTES */}

                            <div>

                                <label>

                                    <strong>
                                        Notes:
                                    </strong>

                                </label>

                                <br />

                                <textarea
                                    name="notes"
                                    value={
                                        interviewForm.notes
                                    }
                                    onChange={
                                        handleInterviewChange
                                    }
                                    rows="4"
                                    cols="50"
                                    placeholder="Interview instructions or notes"
                                />

                            </div>


                            <br />


                            {/* MESSAGE */}

                            {interviewMessage && (

                                <div>

                                    <p>
                                        <strong>
                                            {
                                                interviewMessage
                                            }
                                        </strong>
                                    </p>

                                </div>

                            )}


                            {/* BUTTONS */}

                            <button
                                type="submit"
                                disabled={scheduling}
                            >

                                {scheduling
                                    ? "Scheduling..."
                                    : "Schedule Interview"}

                            </button>


                            {" "}


                            <button
                                type="button"
                                onClick={
                                    closeInterviewForm
                                }
                                disabled={scheduling}
                            >

                                Cancel

                            </button>

                        </form>

                    </div>

                )}

        </div>

    );

}

export default RecruiterApplications;