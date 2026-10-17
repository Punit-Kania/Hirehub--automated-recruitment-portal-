import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthHeaders } from "../services/api";

function AdminNotifications() {

    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ==========================================
    // CHECK ADMIN
    // ==========================================

    useEffect(() => {

        const storedUser =
            localStorage.getItem("hirehubUser");

        if (!storedUser) {
            navigate("/login");
            return;
        }

        try {

            const user = JSON.parse(storedUser);

            if (user.role !== "admin") {

                if (user.role === "recruiter") {
                    navigate("/recruiter/dashboard");
                } else {
                    navigate("/dashboard");
                }

                return;
            }

            loadNotifications();

        } catch (err) {

            console.error(
                "Invalid user data:",
                err
            );

            navigate("/login");
        }

    }, [navigate]);


    // ==========================================
    // LOAD NOTIFICATIONS
    // ==========================================

    const loadNotifications = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                usersResponse,
                jobsResponse,
                applicationsResponse,
                interviewsResponse
            ] = await Promise.all([

                fetch(
                    `${API.admin}?action=users`,
                    { headers: getAuthHeaders() }
                ),

                fetch(
                    `${API.admin}?action=jobs`,
                    {
                        headers: getAuthHeaders()
                    }
                ),

                fetch(
                    `${API.admin}?action=applications`,
                    {
                        headers: getAuthHeaders()
                    }
                ),

                fetch(
                    `${API.admin}?action=interviews`,
                    {
                        headers: getAuthHeaders()
                    }
                )

            ]);


            const usersData =
                await usersResponse.json();

            const jobsData =
                await jobsResponse.json();

            const applicationsData =
                await applicationsResponse.json();

            const interviewsData =
                await interviewsResponse.json();


            console.log(
                "Users:",
                usersData
            );

            console.log(
                "Jobs:",
                jobsData
            );

            console.log(
                "Applications:",
                applicationsData
            );

            console.log(
                "Interviews:",
                interviewsData
            );


            const generatedNotifications = [];


            // ======================================
            // USER NOTIFICATIONS
            // ======================================

            if (
                usersData.success &&
                Array.isArray(usersData.users)
            ) {

                usersData.users.forEach((user) => {

                    generatedNotifications.push({

                        id:
                            `user-${user.id}`,

                        type: "user",

                        title:
                            "New User Registered",

                        message:
                            `${user.name || "User"} registered as ${user.role || "candidate"}.`,

                        date:
                            user.createdAt || "",

                        priority:
                            "normal"

                    });

                });

            }


            // ======================================
            // JOB NOTIFICATIONS
            // ======================================

            if (
                jobsData.success &&
                Array.isArray(jobsData.jobs)
            ) {

                jobsData.jobs.forEach((job) => {

                    generatedNotifications.push({

                        id:
                            `job-${job.id}`,

                        type: "job",

                        title:
                            "Job Posted",

                        message:
                            `${job.title} was posted by ${job.company}.`,

                        date:
                            job.createdAt || "",

                        priority:
                            job.status === "active"
                                ? "normal"
                                : "low"

                    });

                });

            }


            // ======================================
            // APPLICATION NOTIFICATIONS
            // ======================================

            if (
                applicationsData.success &&
                Array.isArray(
                    applicationsData.applications
                )
            ) {

                applicationsData.applications.forEach(
                    (application) => {

                        let title =
                            "New Job Application";

                        let priority =
                            "normal";


                        if (
                            application.status ===
                            "shortlisted"
                        ) {

                            title =
                                "Candidate Shortlisted";

                            priority =
                                "high";

                        }

                        else if (
                            application.status ===
                            "rejected"
                        ) {

                            title =
                                "Application Rejected";

                            priority =
                                "low";

                        }

                        else if (
                            application.status ===
                            "selected"
                        ) {

                            title =
                                "Candidate Selected";

                            priority =
                                "high";

                        }

                        else if (
                            application.status ===
                            "interview"
                        ) {

                            title =
                                "Interview Stage Reached";

                            priority =
                                "high";

                        }


                        generatedNotifications.push({

                            id:
                                `application-${application.id}`,

                            type:
                                "application",

                            title:
                                title,

                            message:
                                `Application for ${application.jobTitle || "job"} is currently ${application.status}.`,

                            date:
                                application.updatedAt ||
                                application.appliedAt ||
                                "",

                            priority:
                                priority

                        });

                    }
                );

            }


            // ======================================
            // INTERVIEW NOTIFICATIONS
            // ======================================

            if (
                interviewsData.success &&
                Array.isArray(
                    interviewsData.interviews
                )
            ) {

                interviewsData.interviews.forEach(
                    (interview) => {

                        let title =
                            "Interview Scheduled";

                        let priority =
                            "high";


                        if (
                            interview.status ===
                            "completed"
                        ) {

                            title =
                                "Interview Completed";

                            priority =
                                "normal";

                        }

                        else if (
                            interview.status ===
                            "cancelled"
                        ) {

                            title =
                                "Interview Cancelled";

                            priority =
                                "low";

                        }

                        else if (
                            interview.status ===
                            "rescheduled"
                        ) {

                            title =
                                "Interview Rescheduled";

                            priority =
                                "high";

                        }


                        generatedNotifications.push({

                            id:
                                `interview-${interview.id}`,

                            type:
                                "interview",

                            title:
                                title,

                            message:
                                `${interview.jobTitle || "Job"} interview is ${interview.status}.`,

                            date:
                                interview.updatedAt ||
                                interview.createdAt ||
                                "",

                            priority:
                                priority

                        });

                    }
                );

            }


            // ======================================
            // SORT NEWEST FIRST
            // ======================================

            generatedNotifications.sort(
                (a, b) => {

                    const dateA =
                        new Date(a.date || 0);

                    const dateB =
                        new Date(b.date || 0);

                    return dateB - dateA;

                }
            );


            setNotifications(
                generatedNotifications
            );

        } catch (err) {

            console.error(
                "Notification loading error:",
                err
            );

            setError(
                "Unable to load admin notifications."
            );

        } finally {

            setLoading(false);
        }

    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {

        localStorage.removeItem(
            "hirehubUser"
        );

        navigate("/login");

    };


    // ==========================================
    // DATE FORMAT
    // ==========================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return date;

        }

        return parsedDate.toLocaleString();

    };


    // ==========================================
    // NOTIFICATION STYLE
    // ==========================================

    const getAlertClass = (priority) => {

        if (priority === "high") {
            return "alert alert-warning";
        }

        if (priority === "low") {
            return "alert alert-secondary";
        }

        return "alert alert-info";

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="container py-5 text-center">

                <h2>
                    HireHub Admin
                </h2>

                <p>
                    Loading notifications...
                </p>

            </div>

        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="container-fluid min-vh-100 bg-light">


            {/* HEADER */}

            <nav className="navbar navbar-dark bg-primary px-4">

                <span className="navbar-brand fw-bold">
                    HireHub Admin
                </span>

                <div>

                    <button
                        className="btn btn-light me-2"
                        onClick={() =>
                            navigate(
                                "/admin/dashboard"
                            )
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        className="btn btn-light"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* CONTENT */}

            <div className="container py-5">


                <div className="text-center mb-4">

                    <h1>
                        Admin Notifications
                    </h1>

                    <p className="text-muted">
                        Recent activities and important
                        events in HireHub.
                    </p>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="alert alert-danger">

                        <strong>
                            Error:
                        </strong>{" "}

                        {error}

                    </div>

                )}


                {/* SUMMARY */}

                {!error && (

                    <div className="card shadow-sm mb-4">

                        <div className="card-body text-center">

                            <h3>
                                Total Notifications
                            </h3>

                            <h2 className="text-primary">
                                {notifications.length}
                            </h2>

                        </div>

                    </div>

                )}


                {/* NO NOTIFICATIONS */}

                {!error &&
                    notifications.length === 0 && (

                    <div className="alert alert-info text-center">

                        No notifications available.

                    </div>

                )}


                {/* NOTIFICATIONS */}

                {!error &&
                    notifications.length > 0 && (

                    <div>

                        {notifications.map(
                            (notification) => (

                            <div
                                key={
                                    notification.id
                                }
                                className={
                                    getAlertClass(
                                        notification.priority
                                    )
                                }
                            >

                                <div className="d-flex justify-content-between">

                                    <div>

                                        <h5 className="mb-1">

                                            {notification.type ===
                                                "user" && "👤 "}

                                            {notification.type ===
                                                "job" && "💼 "}

                                            {notification.type ===
                                                "application" &&
                                                "📄 "}

                                            {notification.type ===
                                                "interview" &&
                                                "📅 "}

                                            {notification.title}

                                        </h5>

                                        <p className="mb-1">

                                            {
                                                notification.message
                                            }

                                        </p>

                                    </div>


                                    <small>

                                        {
                                            formatDate(
                                                notification.date
                                            )
                                        }

                                    </small>

                                </div>

                            </div>

                        ))}

                    </div>

                )}


                {/* QUICK ACTIONS */}

                <div className="card shadow-sm mt-4">

                    <div className="card-body text-center">

                        <h3>
                            Quick Actions
                        </h3>

                        <hr />

                        <button
                            className="btn btn-primary me-2 mb-2"
                            onClick={() =>
                                navigate(
                                    "/admin/users"
                                )
                            }
                        >
                            Manage Users
                        </button>

                        <button
                            className="btn btn-success me-2 mb-2"
                            onClick={() =>
                                navigate(
                                    "/admin/jobs"
                                )
                            }
                        >
                            Manage Jobs
                        </button>

                        <button
                            className="btn btn-warning me-2 mb-2"
                            onClick={() =>
                                navigate(
                                    "/admin/applications"
                                )
                            }
                        >
                            Manage Applications
                        </button>

                        <button
                            className="btn btn-info me-2 mb-2"
                            onClick={() =>
                                navigate(
                                    "/admin/interviews"
                                )
                            }
                        >
                            Manage Interviews
                        </button>

                        <button
                            className="btn btn-secondary mb-2"
                            onClick={
                                loadNotifications
                            }
                        >
                            🔄 Refresh Notifications
                        </button>

                    </div>

                </div>


                {/* BACK */}

                <div className="text-center mt-4">

                    <button
                        className="btn btn-dark"
                        onClick={() =>
                            navigate(
                                "/admin/dashboard"
                            )
                        }
                    >
                        ← Back to Admin Dashboard
                    </button>

                </div>

            </div>

        </div>

    );

}

export default AdminNotifications;