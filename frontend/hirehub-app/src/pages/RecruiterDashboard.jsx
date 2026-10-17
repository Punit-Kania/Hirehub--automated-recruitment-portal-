import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthHeaders } from "../services/api";

function RecruiterDashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [stats, setStats] = useState({
        jobs: 0,
        applications: 0,
        shortlisted: 0,
        interviews: 0,
        selected: 0,
        rejected: 0
    });

    const [recentApplications, setRecentApplications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =====================================================
    // LOAD USER
    // =====================================================

    useEffect(() => {

        const savedUser =
            localStorage.getItem("hirehubUser");

        if (!savedUser) {
            navigate("/login");
            return;
        }

        try {

            const loggedInUser =
                JSON.parse(savedUser);

            if (
                !loggedInUser.role ||
                loggedInUser.role.toLowerCase() !== "recruiter"
            ) {
                navigate("/login");
                return;
            }

            setUser(loggedInUser);

            const recruiterId =
                loggedInUser._id ||
                loggedInUser.id ||
                loggedInUser.userId;

            loadDashboard(recruiterId);

        } catch (err) {

            console.error(
                "Unable to read logged-in user:",
                err
            );

            localStorage.removeItem(
                "hirehubUser"
            );

            navigate("/login");
        }

    }, [navigate]);


    // =====================================================
    // LOAD DASHBOARD DATA
    // =====================================================

    const loadDashboard = async (recruiterId) => {

        if (!recruiterId) {

            setError(
                "Recruiter ID not found. Please login again."
            );

            setLoading(false);

            return;
        }

        try {

            setLoading(true);
            setError("");

            const authHeaders =
                getAuthHeaders();


            // =================================================
            // JOBS
            // =================================================

            const jobsResponse =
                await fetch(
                    API.jobs,
                    {
                        method: "GET",
                        headers: authHeaders
                    }
                );

            const jobsData =
                await jobsResponse.json();


            // =================================================
            // APPLICATIONS
            // =================================================

            const applicationsResponse =
                await fetch(
                    `${API.applications}?recruiterId=${encodeURIComponent(
                        recruiterId
                    )}`,
                    {
                        method: "GET",
                        headers: authHeaders
                    }
                );

            const applicationsData =
                await applicationsResponse.json();


            // =================================================
            // INTERVIEWS
            // =================================================

            const interviewsResponse =
                await fetch(
                    `${API.interviews}?recruiterId=${encodeURIComponent(
                        recruiterId
                    )}`,
                    {
                        method: "GET",
                        headers: authHeaders
                    }
                );

            const interviewsData =
                await interviewsResponse.json();


            console.log(
                "Recruiter Jobs:",
                jobsData
            );

            console.log(
                "Recruiter Applications:",
                applicationsData
            );

            console.log(
                "Recruiter Interviews:",
                interviewsData
            );


            // =================================================
            // AUTH CHECK
            // =================================================

            if (
                jobsResponse.status === 401 ||
                applicationsResponse.status === 401 ||
                interviewsResponse.status === 401
            ) {

                localStorage.removeItem(
                    "hirehubUser"
                );

                navigate("/login");

                return;
            }


            if (
                jobsResponse.status === 403 ||
                applicationsResponse.status === 403 ||
                interviewsResponse.status === 403
            ) {

                setError(
                    "Access denied. Recruiter permission is required."
                );

                return;
            }


            // =================================================
            // JOBS
            // =================================================

            const allJobs =
                jobsData.success
                    ? jobsData.jobs || []
                    : [];


            const recruiterJobs =
                allJobs.filter(
                    (job) =>
                        String(
                            job.recruiterId || ""
                        ) ===
                        String(recruiterId)
                );


            // =================================================
            // APPLICATIONS
            // =================================================

            const applications =
                applicationsData.success
                    ? applicationsData.applications || []
                    : [];


            // =================================================
            // INTERVIEWS
            // =================================================

            const interviews =
                interviewsData.success
                    ? interviewsData.interviews || []
                    : [];


            // =================================================
            // COUNTS
            // =================================================

            const shortlisted =
                applications.filter(
                    (application) =>
                        application.status ===
                        "shortlisted"
                ).length;


            const selected =
                applications.filter(
                    (application) =>
                        application.status ===
                        "selected"
                ).length;


            const rejected =
                applications.filter(
                    (application) =>
                        application.status ===
                        "rejected"
                ).length;


            const activeInterviews =
                interviews.filter(
                    (interview) =>
                        interview.status ===
                            "scheduled" ||
                        interview.status ===
                            "rescheduled"
                ).length;


            setStats({

                jobs:
                    recruiterJobs.length,

                applications:
                    applications.length,

                shortlisted,

                interviews:
                    activeInterviews,

                selected,

                rejected

            });


            // =================================================
            // RECENT APPLICATIONS
            // =================================================

            const sortedApplications =
                [...applications].sort(
                    (a, b) =>
                        new Date(
                            b.appliedAt ||
                            b.createdAt ||
                            0
                        ) -
                        new Date(
                            a.appliedAt ||
                            a.createdAt ||
                            0
                        )
                );


            setRecentApplications(
                sortedApplications.slice(0, 5)
            );

        } catch (err) {

            console.error(
                "Recruiter dashboard error:",
                err
            );

            setError(
                "Unable to load recruiter dashboard."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem(
            "hirehubUser"
        );

        navigate("/login");
    };


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {

        switch (status) {

            case "shortlisted":
                return "recruiter-status shortlisted";

            case "selected":
                return "recruiter-status selected";

            case "rejected":
                return "recruiter-status rejected";

            case "interview":
                return "recruiter-status interview";

            default:
                return "recruiter-status applied";
        }
    };


    // =====================================================
    // CANDIDATE NAME
    // =====================================================

    const getCandidateName = (
        application
    ) => {

        return (
            application.candidateName ||
            application.userName ||
            application.candidate?.name ||
            application.user?.name ||
            "Candidate"
        );
    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        try {

            return new Date(
                date
            ).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        } catch {

            return date;
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div
                id="recruiter-loading"
                className="hirehub-state-page"
            >

                <div
                    className="hirehub-loading-card"
                >

                    <div
                        className="hirehub-loading-icon"
                    >
                        H
                    </div>

                    <h2>
                        HireHub Recruiter
                    </h2>

                    <p>
                        Loading recruiter dashboard...
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // DASHBOARD
    // =====================================================

    return (

        <div
            id="recruiter-dashboard"
            className="hirehub-dashboard recruiter-page"
        >

            {/* =================================================
                FUTURISTIC BACKGROUND
            ================================================= */}

            <div
                id="hirehub-grid-bg"
                className="hirehub-grid-bg"
            ></div>


            {/* =================================================
                TOP BAR
            ================================================= */}

            <header
                id="recruiter-topbar"
                className="hirehub-topbar"
            >

                {/* BRAND */}

                <div
                    id="recruiter-brand"
                    className="hirehub-brand"
                >

                    <div
                        id="recruiter-logo-icon"
                        className="hirehub-logo-icon"
                    >
                        H
                    </div>

                    <span
                        className="hirehub-brand-name"
                    >
                        HireHub
                    </span>

                    <span
                        className="hirehub-brand-label"
                    >
                        RECRUITER
                    </span>

                </div>


                {/* USER AREA */}

                <div
                    id="recruiter-user-area"
                    className="hirehub-user-area"
                >

                    {/* NOTIFICATION */}

                  

                    {/* PROFILE */}

                    <div
                        id="recruiter-profile"
                        className="hirehub-user-profile"
                    >

                        <div
                            id="recruiter-avatar"
                            className="hirehub-avatar"
                        >

                            {(
                                user?.name ||
                                "R"
                            )
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        <span
                            id="recruiter-profile-name"
                            className="hirehub-profile-name"
                        >

                            {user?.name ||
                                "Recruiter"}

                        </span>

                    </div>


                    {/* LOGOUT */}

                    <button
                        id="recruiter-logout-top"
                        className="hirehub-logout-top"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* =================================================
                MAIN LAYOUT
            ================================================= */}

            <div
                id="recruiter-layout"
                className="hirehub-layout"
            >


                {/* =================================================
                    SIDEBAR
                ================================================= */}

                <aside
                    id="recruiter-sidebar"
                    className="hirehub-sidebar"
                >

                    <div
                        id="recruiter-menu-title"
                        className="hirehub-menu-title"
                    >
                        RECRUITER MENU
                    </div>


                    <nav
                        id="recruiter-menu"
                        className="hirehub-menu"
                    >


                        {/* DASHBOARD */}

                        <button
                            id="menu-dashboard"
                            className="hirehub-menu-item active"
                            onClick={() =>
                                navigate(
                                    "/recruiter/dashboard"
                                )
                            }
                        >

                            <span
                                className="hirehub-menu-icon"
                            >
                                🏠
                            </span>

                            <span>
                                Dashboard
                            </span>

                        </button>


                        {/* JOBS */}

                        <button
                            id="menu-jobs"
                            className="hirehub-menu-item"
                            onClick={() =>
                                navigate(
                                    "/recruiter/jobs"
                                )
                            }
                        >

                            <span
                                className="hirehub-menu-icon"
                            >
                                💼
                            </span>

                            <span>
                                Manage Jobs
                            </span>

                        </button>


                        {/* APPLICATIONS */}

                        <button
                            id="menu-applications"
                            className="hirehub-menu-item"
                            onClick={() =>
                                navigate(
                                    "/recruiter/applications"
                                )
                            }
                        >

                            <span
                                className="hirehub-menu-icon"
                            >
                                📋
                            </span>

                            <span>
                                Applications
                            </span>

                        </button>


                        {/* INTERVIEWS */}

                        <button
                            id="menu-interviews"
                            className="hirehub-menu-item"
                            onClick={() =>
                                navigate(
                                    "/recruiter/interviews"
                                )
                            }
                        >

                            <span
                                className="hirehub-menu-icon"
                            >
                                📅
                            </span>

                            <span>
                                Interviews
                            </span>

                        </button>


                        {/* SMART MATCH */}

                        <button
                            id="menu-smart-match"
                            className="hirehub-menu-item"
                            onClick={() =>
                                navigate(
                                    "/recruiter/smart-match"
                                )
                            }
                        >

                            <span
                                className="hirehub-menu-icon"
                            >
                                ✨
                            </span>

                            <span>
                                Smart Match
                            </span>

                        </button>


                        {/* NOTIFICATIONS */}

                       
                    </nav>


                    {/* DIVIDER */}

                    <div
                        id="recruiter-sidebar-divider"
                        className="hirehub-sidebar-divider"
                    ></div>


                    {/* LOGOUT */}

                    <button
                        id="menu-logout"
                        className="hirehub-menu-item logout"
                        onClick={handleLogout}
                    >

                        <span
                            className="hirehub-menu-icon"
                        >
                            ↪
                        </span>

                        <span>
                            Logout
                        </span>

                    </button>


                    {/* =================================================
                        PROMO IMAGE
                    ================================================= */}

                   <div
                        id="admin-promo"
                        className="hirehub-promo"
                    >

                        <div className="hirehub-promo-glow"></div>

                        <div className="hirehub-promo-content">

                            <strong>
                                Judge Smarter
                            </strong>

                            <span>
                                Meet A Proper Man . 
                            </span>

                        </div>

                    </div>


                </aside>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <main
                    id="recruiter-content"
                    className="hirehub-content"
                >


                    {/* =================================================
                        PAGE HEADER
                    ================================================= */}

                    <section
                        id="recruiter-header"
                        className="hirehub-page-header"
                    >

                        <div
                            id="recruiter-welcome"
                        >

                            <span
                                className="hirehub-eyebrow"
                            >
                                RECRUITER CONTROL CENTER
                            </span>


                            <h1>
                                Welcome back,{" "}
                                {user?.name ||
                                    "Recruiter"}!
                                👋
                            </h1>


                            <p>
                                Manage your jobs,
                                candidates and
                                interviews with
                                HireHub.
                            </p>

                        </div>


                        {/* DATE */}

                        <div
                            id="recruiter-date"
                            className="hirehub-date-card"
                        >

                            <span
                                className="hirehub-date-icon"
                            >
                                📅
                            </span>


                            <div>

                                <small>
                                    Today <br></br>
                                </small>

                                <strong>
                                    {new Date().toLocaleDateString(
                                        "en-IN",
                                        {
                                            weekday:
                                                "short",
                                            day:
                                                "2-digit",
                                            month:
                                                "short",
                                            year:
                                                "numeric"
                                        }
                                    )}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (

                        <div
                            id="recruiter-error"
                            className="alert alert-danger"
                        >
                            {error}
                        </div>

                    )}


                    {/* =================================================
                        STATISTICS
                    ================================================= */}

                    <section
                        id="recruiter-stats"
                        className="hirehub-stats"
                    >


                        {/* JOBS */}

                        <article
                            id="stat-jobs"
                            className="hirehub-stat-card"
                        >

                            <div
                                className="hirehub-stat-icon blue"
                            >
                                💼
                            </div>


                            <div
                                className="hirehub-stat-info"
                            >

                                <span>
                                    Jobs
                                </span>

                                <strong>
                                    {stats.jobs}
                                </strong>

                                <small>
                                    Active jobs posted
                                </small>

                            </div>

                        </article>


                        {/* APPLICATIONS */}

                        <article
                            id="stat-applications"
                            className="hirehub-stat-card"
                        >

                            <div
                                className="hirehub-stat-icon purple"
                            >
                                📄
                            </div>


                            <div
                                className="hirehub-stat-info"
                            >

                                <span>
                                    Applications
                                </span>

                                <strong>
                                    {stats.applications}
                                </strong>

                                <small>
                                    Applications received
                                </small>

                            </div>

                        </article>


                        {/* SHORTLISTED */}

                        <article
                            id="stat-shortlisted"
                            className="hirehub-stat-card"
                        >

                            <div
                                className="hirehub-stat-icon green"
                            >
                                👥
                            </div>


                            <div
                                className="hirehub-stat-info"
                            >

                                <span>
                                    Shortlisted
                                </span>

                                <strong>
                                    {stats.shortlisted}
                                </strong>

                                <small>
                                    Candidates shortlisted
                                </small>

                            </div>

                        </article>


                        {/* INTERVIEWS */}

                        <article
                            id="stat-interviews"
                            className="hirehub-stat-card"
                        >

                            <div
                                className="hirehub-stat-icon cyan"
                            >
                                📅
                            </div>


                            <div
                                className="hirehub-stat-info"
                            >

                                <span>
                                    Interviews
                                </span>

                                <strong>
                                    {stats.interviews}
                                </strong>

                                <small>
                                    Active interviews
                                </small>

                            </div>

                        </article>


                        {/* SELECTED */}

                        <article
                            id="stat-selected"
                            className="hirehub-stat-card"
                        >

                            <div
                                className="hirehub-stat-icon green"
                            >
                                ✓
                            </div>


                            <div
                                className="hirehub-stat-info"
                            >

                                <span>
                                    Selected
                                </span>

                                <strong>
                                    {stats.selected}
                                </strong>

                                <small>
                                    Selected candidates
                                </small>

                            </div>

                        </article>


                        {/* REJECTED */}

                        <article
                            id="stat-rejected"
                            className="hirehub-stat-card"
                        >

                            <div
                                className="hirehub-stat-icon red"
                            >
                                ✕
                            </div>


                            <div
                                className="hirehub-stat-info"
                            >

                                <span>
                                    Rejected
                                </span>

                                <strong>
                                    {stats.rejected}
                                </strong>

                                <small>
                                    Rejected applications
                                </small>

                            </div>

                        </article>

                    </section>


                    {/* =================================================
                        RECENT APPLICATIONS
                    ================================================= */}

                    <section
                        id="recent-applications"
                        className="hirehub-section"
                    >

                        <header
                            id="recent-applications-header"
                            className="hirehub-section-header"
                        >

                            <div>

                                <span
                                    className="hirehub-section-label"
                                >
                                    CANDIDATE ACTIVITY
                                </span>


                                <h2>
                                    Recent Applications
                                </h2>

                            </div>


                            <button
                                id="view-all-applications"
                                className="hirehub-view-all"
                                onClick={() =>
                                    navigate(
                                        "/recruiter/applications"
                                    )
                                }
                            >
                                View All →
                            </button>

                        </header>


                        {/* =================================================
                            EMPTY
                        ================================================= */}

                        {recentApplications.length === 0 ? (

                            <div
                                id="no-recent-applications"
                                className="recruiter-empty"
                            >
                                No applications yet.
                            </div>

                        ) : (


                            /* =================================================
                               APPLICATION TABLE
                            ================================================= */

                            <div
                                id="applications-table-wrapper"
                                className="recruiter-table-wrap"
                            >

                                <table
                                    id="applications-table"
                                    className="recruiter-table"
                                >

                                    <thead>

                                        <tr>

                                            <th>
                                                #
                                            </th>

                                            <th>
                                                Candidate
                                            </th>

                                            <th>
                                                Job
                                            </th>

                                            <th>
                                                Applied
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {recentApplications.map(
                                            (
                                                application,
                                                index
                                            ) => (

                                                <tr
                                                    key={
                                                        application._id ||
                                                        application.id ||
                                                        index
                                                    }
                                                >

                                                    {/* NUMBER */}

                                                    <td>
                                                        {index + 1}
                                                    </td>


                                                    {/* CANDIDATE */}

                                                    <td>

                                                        <div
                                                            className="candidate-cell"
                                                        >

                                                            <div
                                                                className="candidate-avatar"
                                                            >

                                                                {getCandidateName(
                                                                    application
                                                                )
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}

                                                            </div>


                                                            <div>

                                                                <strong>
                                                                    {
                                                                        getCandidateName(
                                                                            application
                                                                        )
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    Candidate
                                                                </small>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* JOB */}

                                                    <td>

                                                        <strong>
                                                            {
                                                                application.jobTitle ||
                                                                "Job Application"
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                application.company ||
                                                                "HireHub"
                                                            }
                                                        </small>

                                                    </td>


                                                    {/* DATE */}

                                                    <td>

                                                        {formatDate(
                                                            application.appliedAt ||
                                                            application.createdAt
                                                        )}

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={
                                                                getStatusClass(
                                                                    application.status
                                                                )
                                                            }
                                                        >
                                                            {
                                                                application.status ||
                                                                "applied"
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        <button
                                                            className="hirehub-view-btn"
                                                            onClick={() =>
                                                                navigate(
                                                                    "/recruiter/applications"
                                                                )
                                                            }
                                                        >
                                                            View →
                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>

                </main>

            </div>

        </div>
    );
}

export default RecruiterDashboard;