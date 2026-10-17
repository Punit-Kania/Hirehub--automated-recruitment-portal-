import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthHeaders } from "../services/api";

function AdminAnalytics() {

    const navigate = useNavigate();

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ==========================================
    // CHECK ADMIN LOGIN
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

            console.log("Analytics admin user:", user);

            if (user.role !== "admin") {

                if (user.role === "recruiter") {
                    navigate("/recruiter/dashboard");
                } else {
                    navigate("/dashboard");
                }

                return;
            }

            loadAnalytics();

        } catch (err) {

            console.error(
                "Invalid user data:",
                err
            );

            navigate("/login");
        }

    }, [navigate]);


    // ==========================================
    // LOAD ANALYTICS
    // ==========================================

    const loadAnalytics = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                `${API.admin}?action=analytics`,
                {
                    headers: getAuthHeaders()
                }
            );

            const data = await response.json();

            console.log(
                "Analytics response:",
                data
            );

            if (data.success) {

                setAnalytics(data.analytics);

            } else {

                setError(
                    data.message ||
                    "Failed to load analytics."
                );
            }

        } catch (err) {

            console.error(
                "Analytics loading error:",
                err
            );

            setError(
                "Unable to connect to Admin API."
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
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="container py-5 text-center">

                <h2>
                    HireHub Admin
                </h2>

                <p>
                    Loading analytics...
                </p>

            </div>
        );
    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {

        return (

            <div className="container py-5">

                <div className="alert alert-danger">
                    {error}
                </div>

                <button
                    className="btn btn-primary"
                    onClick={loadAnalytics}
                >
                    Try Again
                </button>

                <button
                    className="btn btn-secondary ms-2"
                    onClick={() =>
                        navigate("/admin/dashboard")
                    }
                >
                    Back to Dashboard
                </button>

            </div>
        );
    }


    // ==========================================
    // SAFE VALUES
    // ==========================================

    const totalUsers =
        analytics?.users?.total ?? 0;

    const totalJobs =
        analytics?.jobs?.total ?? 0;

    const activeJobs =
        analytics?.jobs?.active ?? 0;

    const totalApplications =
        analytics?.applications?.total ?? 0;

    const shortlisted =
        analytics?.applications?.shortlisted ?? 0;

    const selected =
        analytics?.applications?.selected ?? 0;

    const rejected =
        analytics?.applications?.rejected ?? 0;

    const totalInterviews =
        analytics?.interviews?.total ?? 0;

    const scheduledInterviews =
        analytics?.interviews?.scheduled ?? 0;

    const completedInterviews =
        analytics?.interviews?.completed ?? 0;


    // ==========================================
    // CALCULATIONS
    // ==========================================

    const inactiveJobs =
        Math.max(totalJobs - activeJobs, 0);

    const pendingApplications =
        Math.max(
            totalApplications -
            shortlisted -
            selected -
            rejected,
            0
        );


    // ==========================================
    // DASHBOARD
    // ==========================================

    return (

        <div className="container-fluid min-vh-100 bg-light">


            {/* ==================================
                HEADER
            ================================== */}

            <nav className="navbar navbar-dark bg-primary px-4">

                <span className="navbar-brand fw-bold">
                    HireHub Admin
                </span>

                <div>

                    <button
                        className="btn btn-light me-2"
                        onClick={() =>
                            navigate("/admin/dashboard")
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


            {/* ==================================
                MAIN CONTENT
            ================================== */}

            <div className="container py-5">


                {/* ==================================
                    PAGE TITLE
                ================================== */}

                <div className="text-center mb-5">

                    <h1>
                        Analytics & Reports
                    </h1>

                    <p className="text-muted">
                        Analyze HireHub recruitment
                        system performance.
                    </p>

                </div>


                {/* ==================================
                    USER ANALYTICS
                ================================== */}

                <div className="row g-4 mb-4">

                    <div className="col-md-4">

                        <div className="card shadow-sm h-100">

                            <div className="card-body text-center">

                                <h5>
                                    Total Users
                                </h5>

                                <h2 className="text-primary">
                                    {totalUsers}
                                </h2>

                                <p className="text-muted">
                                    Registered users
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="col-md-4">

                        <div className="card shadow-sm h-100">

                            <div className="card-body text-center">

                                <h5>
                                    Total Jobs
                                </h5>

                                <h2 className="text-success">
                                    {totalJobs}
                                </h2>

                                <p className="text-muted">
                                    All job postings
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="col-md-4">

                        <div className="card shadow-sm h-100">

                            <div className="card-body text-center">

                                <h5>
                                    Active Jobs
                                </h5>

                                <h2 className="text-success">
                                    {activeJobs}
                                </h2>

                                <p className="text-muted">
                                    Currently active
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    JOB STATISTICS
                ================================== */}

                <div className="card shadow-sm mb-4">

                    <div className="card-body">

                        <h3 className="text-center">
                            Job Statistics
                        </h3>

                        <hr />

                        <div className="row text-center">

                            <div className="col-md-6">

                                <h5>
                                    Active Jobs
                                </h5>

                                <h2 className="text-success">
                                    {activeJobs}
                                </h2>

                            </div>

                            <div className="col-md-6">

                                <h5>
                                    Inactive Jobs
                                </h5>

                                <h2 className="text-secondary">
                                    {inactiveJobs}
                                </h2>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    APPLICATION ANALYTICS
                ================================== */}

                <div className="card shadow-sm mb-4">

                    <div className="card-body">

                        <h3 className="text-center">
                            Application Analytics
                        </h3>

                        <hr />

                        <div className="row g-4">


                            {/* TOTAL */}

                            <div className="col-md-3">

                                <div className="card border-primary">

                                    <div className="card-body text-center">

                                        <h6>
                                            Total
                                        </h6>

                                        <h2 className="text-primary">
                                            {totalApplications}
                                        </h2>

                                    </div>

                                </div>

                            </div>


                            {/* SHORTLISTED */}

                            <div className="col-md-3">

                                <div className="card border-warning">

                                    <div className="card-body text-center">

                                        <h6>
                                            Shortlisted
                                        </h6>

                                        <h2 className="text-warning">
                                            {shortlisted}
                                        </h2>

                                    </div>

                                </div>

                            </div>


                            {/* SELECTED */}

                            <div className="col-md-3">

                                <div className="card border-success">

                                    <div className="card-body text-center">

                                        <h6>
                                            Selected
                                        </h6>

                                        <h2 className="text-success">
                                            {selected}
                                        </h2>

                                    </div>

                                </div>

                            </div>


                            {/* REJECTED */}

                            <div className="col-md-3">

                                <div className="card border-danger">

                                    <div className="card-body text-center">

                                        <h6>
                                            Rejected
                                        </h6>

                                        <h2 className="text-danger">
                                            {rejected}
                                        </h2>

                                    </div>

                                </div>

                            </div>

                        </div>


                        <div className="text-center mt-4">

                            <h5>
                                Pending / Applied Applications
                            </h5>

                            <h3 className="text-secondary">
                                {pendingApplications}
                            </h3>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    INTERVIEW ANALYTICS
                ================================== */}

                <div className="card shadow-sm mb-4">

                    <div className="card-body">

                        <h3 className="text-center">
                            Interview Analytics
                        </h3>

                        <hr />

                        <div className="row g-4">


                            {/* TOTAL INTERVIEWS */}

                            <div className="col-md-4">

                                <div className="card border-info">

                                    <div className="card-body text-center">

                                        <h6>
                                            Total Interviews
                                        </h6>

                                        <h2 className="text-info">
                                            {totalInterviews}
                                        </h2>

                                    </div>

                                </div>

                            </div>


                            {/* SCHEDULED */}

                            <div className="col-md-4">

                                <div className="card border-primary">

                                    <div className="card-body text-center">

                                        <h6>
                                            Scheduled
                                        </h6>

                                        <h2 className="text-primary">
                                            {scheduledInterviews}
                                        </h2>

                                    </div>

                                </div>

                            </div>


                            {/* COMPLETED */}

                            <div className="col-md-4">

                                <div className="card border-success">

                                    <div className="card-body text-center">

                                        <h6>
                                            Completed
                                        </h6>

                                        <h2 className="text-success">
                                            {completedInterviews}
                                        </h2>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    RECRUITMENT SUMMARY
                ================================== */}

                <div className="card shadow-sm mb-4">

                    <div className="card-body">

                        <h3 className="text-center">
                            Recruitment Summary
                        </h3>

                        <hr />

                        <div className="table-responsive">

                            <table className="table table-bordered text-center">

                                <thead className="table-dark">

                                    <tr>
                                        <th>Category</th>
                                        <th>Total</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    <tr>
                                        <td>Total Users</td>
                                        <td>
                                            <strong>
                                                {totalUsers}
                                            </strong>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>Total Jobs</td>
                                        <td>
                                            <strong>
                                                {totalJobs}
                                            </strong>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>Active Jobs</td>
                                        <td>
                                            <strong>
                                                {activeJobs}
                                            </strong>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>Total Applications</td>
                                        <td>
                                            <strong>
                                                {totalApplications}
                                            </strong>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>Shortlisted</td>
                                        <td>
                                            <strong>
                                                {shortlisted}
                                            </strong>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>Selected</td>
                                        <td>
                                            <strong>
                                                {selected}
                                            </strong>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>Rejected</td>
                                        <td>
                                            <strong>
                                                {rejected}
                                            </strong>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>Total Interviews</td>
                                        <td>
                                            <strong>
                                                {totalInterviews}
                                            </strong>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>Completed Interviews</td>
                                        <td>
                                            <strong>
                                                {completedInterviews}
                                            </strong>
                                        </td>
                                    </tr>

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    QUICK ACTIONS
                ================================== */}

                <div className="card shadow-sm">

                    <div className="card-body text-center">

                        <h3>
                            Quick Actions
                        </h3>

                        <hr />

                        <button
                            className="btn btn-primary me-2 mb-2"
                            onClick={() =>
                                navigate("/admin/users")
                            }
                        >
                            Manage Users
                        </button>

                        <button
                            className="btn btn-success me-2 mb-2"
                            onClick={() =>
                                navigate("/admin/jobs")
                            }
                        >
                            Manage Jobs
                        </button>

                        <button
                            className="btn btn-warning me-2 mb-2"
                            onClick={() =>
                                navigate("/admin/applications")
                            }
                        >
                            Manage Applications
                        </button>

                        <button
                            className="btn btn-info me-2 mb-2"
                            onClick={() =>
                                navigate("/admin/interviews")
                            }
                        >
                            Manage Interviews
                        </button>

                        <button
                            className="btn btn-secondary mb-2"
                            onClick={loadAnalytics}
                        >
                            🔄 Refresh Analytics
                        </button>

                    </div>

                </div>


                {/* ==================================
                    BACK TO DASHBOARD
                ================================== */}

                <div className="text-center mt-4">

                    <button
                        className="btn btn-dark"
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        ← Back to Admin Dashboard
                    </button>

                </div>

            </div>

        </div>
    );
}

export default AdminAnalytics;