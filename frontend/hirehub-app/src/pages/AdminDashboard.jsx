import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthHeaders } from "../services/api";

function AdminDashboard() {

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

            console.log("Admin user:", user);

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
    // LOAD ADMIN ANALYTICS
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
                "Admin analytics response:",
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
                "Admin analytics error:",
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

            <div
                id="admin-loading"
                className="hirehub-state-page"
            >

                <div className="hirehub-loading-card">

                    <div className="hirehub-loading-icon">
                        H
                    </div>

                    <h2>
                        HireHub Admin
                    </h2>

                    <p>
                        Loading dashboard...
                    </p>

                </div>

            </div>
        );
    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {

        return (

            <div
                id="admin-error"
                className="hirehub-state-page"
            >

                <div className="hirehub-error-card">

                    <div className="hirehub-error-icon">
                        !
                    </div>

                    <h2>
                        Unable to Load Dashboard
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        id="admin-error-retry"
                        className="hirehub-primary-btn"
                        onClick={loadAnalytics}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    // ==========================================
    // ADMIN DASHBOARD
    // ==========================================

    return (

        <div
            id="admin-dashboard"
            className="hirehub-dashboard admin-page"
        >

            {/* FUTURISTIC BACKGROUND */}

            <div
                id="hirehub-grid-bg"
                className="hirehub-grid-bg"
            ></div>


            {/* ==================================
                TOP BAR
            ================================== */}

            <header
                id="admin-topbar"
                className="hirehub-topbar"
            >

                <div
                    id="admin-brand"
                    className="hirehub-brand"
                >

                    <div
                        id="admin-logo-icon"
                        className="hirehub-logo-icon"
                    >
                        H
                    </div>

                    <span className="hirehub-brand-name">
                        HireHub
                    </span>

                    <span
                        id="admin-brand-label"
                        className="hirehub-brand-label"
                    >
                        ADMIN
                    </span>

                </div>


                <div
                    id="admin-user-area"
                    className="hirehub-user-area"
                >

                    <div
                        id="admin-profile"
                        className="hirehub-user-profile"
                    >

                        <div
                            id="admin-avatar"
                            className="hirehub-avatar"
                        >
                            A
                        </div>

                        <span
                            id="admin-profile-name"
                            className="hirehub-profile-name"
                        >
                            Administrator
                        </span>

                    </div>


                    <button
                        id="admin-logout-top"
                        className="hirehub-logout-top"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* ==================================
                MAIN LAYOUT
            ================================== */}

            <div
                id="admin-layout"
                className="hirehub-layout"
            >


                {/* ==================================
                    SIDEBAR
                ================================== */}

                <aside
                    id="admin-sidebar"
                    className="hirehub-sidebar"
                >

                    <div
                        id="admin-menu-title"
                        className="hirehub-menu-title"
                    >
                        ADMIN MENU
                    </div>


                    <nav
                        id="admin-menu"
                        className="hirehub-menu"
                    >

                        <button
                            id="admin-menu-dashboard"
                            className="hirehub-menu-item active"
                        >
                            <span className="hirehub-menu-icon">
                                🏠
                            </span>

                            <span>
                                Dashboard
                            </span>
                        </button>


                        <button
                            id="admin-menu-users"
                            className="hirehub-menu-item"
                            onClick={() =>
                                navigate("/admin/users")
                            }
                        >
                            <span className="hirehub-menu-icon">
                                👥
                            </span>

                            <span>
                                Users
                            </span>
                        </button>


                        <button
                            id="admin-menu-jobs"
                            className="hirehub-menu-item"
                            onClick={() =>
                                navigate("/admin/jobs")
                            }
                        >
                            <span className="hirehub-menu-icon">
                                💼
                            </span>

                            <span>
                                Jobs
                            </span>
                        </button>


                        <button
                            id="admin-menu-applications"
                            className="hirehub-menu-item"
                            onClick={() =>
                                navigate("/admin/applications")
                            }
                        >
                            <span className="hirehub-menu-icon">
                                📋
                            </span>

                            <span>
                                Applications
                            </span>
                        </button>


                        <button
                            id="admin-menu-interviews"
                            className="hirehub-menu-item"
                            onClick={() =>
                                navigate("/admin/interviews")
                            }
                        >
                            <span className="hirehub-menu-icon">
                                📅
                            </span>

                            <span>
                                Interviews
                            </span>
                        </button>


                        <button
                            id="admin-menu-analytics"
                            className="hirehub-menu-item"
                            onClick={() =>
                                navigate("/admin/analytics")
                            }
                        >
                            <span className="hirehub-menu-icon">
                                📊
                            </span>

                            <span>
                                Analytics
                            </span>
                        </button>


                        
                    </nav>


                    <div
                        id="admin-sidebar-divider"
                        className="hirehub-sidebar-divider"
                    ></div>


                    <button
                        id="admin-menu-logout"
                        className="hirehub-menu-item logout"
                        onClick={handleLogout}
                    >
                        <span className="hirehub-menu-icon">
                            ↪
                        </span>

                        <span>
                            Logout
                        </span>
                    </button>


                    {/* ADMIN PROMO */}

                    <div
                        id="admin-promo"
                        className="hirehub-promo"
                    >

                        <div className="hirehub-promo-glow"></div>

                        <div className="hirehub-promo-content">

                            <strong>
                                Manage Smarter
                            </strong>

                            <span>
                                Control your recruitment platform.
                            </span>

                        </div>

                    </div>

                </aside>


                {/* ==================================
                    CONTENT
                ================================== */}

                <main
                    id="admin-content"
                    className="hirehub-content"
                >


                    {/* ==================================
                        PAGE HEADER
                    ================================== */}

                    <section
                        id="admin-page-header"
                        className="hirehub-page-header"
                    >

                        <div>

                            <span className="hirehub-eyebrow">
                                ADMIN CONTROL CENTER
                            </span>

                            <h1 id="admin-heading">
                                Admin Dashboard
                            </h1>

                            <p id="admin-subheading">
                                Manage and monitor the HireHub
                                recruitment system.
                            </p>

                        </div>


                        <div
                            id="admin-date-card"
                            className="hirehub-date-card"
                        >

                            <span className="hirehub-date-icon">
                                📅
                            </span>

                            <div>

                                <small>
                                    Today  <br></br>
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


                    {/* ==================================
                        MAIN STATISTICS
                    ================================== */}

                    <section
                        id="admin-main-stats"
                        className="hirehub-stats"
                    >


                        {/* USERS */}

                        <article
                            id="admin-stat-users"
                            className="hirehub-stat-card"
                        >

                            <div className="hirehub-stat-icon blue">
                                👥
                            </div>

                            <div className="hirehub-stat-info">

                                <span>
                                    Total Users
                                </span>

                                <strong>
                                    {
                                        analytics?.users?.total
                                        ?? 0
                                    }
                                </strong>

                                <small>
                                    Registered users
                                </small>

                            </div>

                        </article>


                        {/* JOBS */}

                        <article
                            id="admin-stat-jobs"
                            className="hirehub-stat-card"
                        >

                            <div className="hirehub-stat-icon purple">
                                💼
                            </div>

                            <div className="hirehub-stat-info">

                                <span>
                                    Total Jobs
                                </span>

                                <strong>
                                    {
                                        analytics?.jobs?.total
                                        ?? 0
                                    }
                                </strong>

                                <small>
                                    Active:{" "}
                                    {
                                        analytics?.jobs?.active
                                        ?? 0
                                    }
                                </small>

                            </div>

                        </article>


                        {/* APPLICATIONS */}

                        <article
                            id="admin-stat-applications"
                            className="hirehub-stat-card"
                        >

                            <div className="hirehub-stat-icon cyan">
                                📋
                            </div>

                            <div className="hirehub-stat-info">

                                <span>
                                    Applications
                                </span>

                                <strong>
                                    {
                                        analytics?.applications?.total
                                        ?? 0
                                    }
                                </strong>

                                <small>
                                    Total applications
                                </small>

                            </div>

                        </article>


                        {/* INTERVIEWS */}

                        <article
                            id="admin-stat-interviews"
                            className="hirehub-stat-card"
                        >

                            <div className="hirehub-stat-icon green">
                                📅
                            </div>

                            <div className="hirehub-stat-info">

                                <span>
                                    Interviews
                                </span>

                                <strong>
                                    {
                                        analytics?.interviews?.total
                                        ?? 0
                                    }
                                </strong>

                                <small>
                                    Total interviews
                                </small>

                            </div>

                        </article>

                    </section>


                    {/* ==================================
                        APPLICATION STATUS
                    ================================== */}

                    <section
                        id="admin-application-status"
                        className="hirehub-stats hirehub-stats-secondary"
                    >


                        {/* SHORTLISTED */}

                        <article
                            id="admin-stat-shortlisted"
                            className="hirehub-stat-card"
                        >

                            <div className="hirehub-stat-icon orange">
                                ⭐
                            </div>

                            <div className="hirehub-stat-info">

                                <span>
                                    Shortlisted
                                </span>

                                <strong>
                                    {
                                        analytics?.applications?.shortlisted
                                        ?? 0
                                    }
                                </strong>

                            </div>

                        </article>


                        {/* SELECTED */}

                        <article
                            id="admin-stat-selected"
                            className="hirehub-stat-card"
                        >

                            <div className="hirehub-stat-icon green">
                                ✓
                            </div>

                            <div className="hirehub-stat-info">

                                <span>
                                    Selected
                                </span>

                                <strong>
                                    {
                                        analytics?.applications?.selected
                                        ?? 0
                                    }
                                </strong>

                            </div>

                        </article>


                        {/* REJECTED */}

                        <article
                            id="admin-stat-rejected"
                            className="hirehub-stat-card"
                        >

                            <div className="hirehub-stat-icon red">
                                ✕
                            </div>

                            <div className="hirehub-stat-info">

                                <span>
                                    Rejected
                                </span>

                                <strong>
                                    {
                                        analytics?.applications?.rejected
                                        ?? 0
                                    }
                                </strong>

                            </div>

                        </article>

                    </section>


                    {/* ==================================
                        LOWER GRID
                    ================================== */}

                    <section
                        id="admin-lower-section"
                        className="hirehub-dashboard-grid"
                    >


                        {/* ==================================
                            INTERVIEW STATISTICS
                        ================================== */}

                        <article
                            id="admin-interview-statistics"
                            className="hirehub-section"
                        >

                            <header className="hirehub-section-header">

                                <div>

                                    <span className="hirehub-section-label">
                                        INTERVIEWS
                                    </span>

                                    <h2>
                                        Interview Statistics
                                    </h2>

                                </div>

                            </header>


                            <div
                                id="admin-interview-data"
                                className="hirehub-detail-list"
                            >

                                <div
                                    id="admin-scheduled-interviews"
                                    className="hirehub-detail-item"
                                >

                                    <span>
                                        Scheduled
                                    </span>

                                    <strong>
                                        {
                                            analytics?.interviews?.scheduled
                                            ?? 0
                                        }
                                    </strong>

                                </div>


                                <div
                                    id="admin-completed-interviews"
                                    className="hirehub-detail-item"
                                >

                                    <span>
                                        Completed
                                    </span>

                                    <strong>
                                        {
                                            analytics?.interviews?.completed
                                            ?? 0
                                        }
                                    </strong>

                                </div>

                            </div>

                        </article>


                        {/* ==================================
                            QUICK ACTIONS
                        ================================== */}

                        <article
                            id="admin-quick-actions"
                            className="hirehub-section"
                        >

                            <header className="hirehub-section-header">

                                <div>

                                    <span className="hirehub-section-label">
                                        ADMIN TOOLS
                                    </span>

                                    <h2>
                                        Quick Actions
                                    </h2>

                                </div>

                            </header>


                            <div
                                id="admin-actions"
                                className="hirehub-actions admin-actions"
                            >

                                <button
                                    id="admin-action-users"
                                    className="hirehub-action"
                                    onClick={() =>
                                        navigate(
                                            "/admin/users"
                                        )
                                    }
                                >

                                    <span className="hirehub-action-icon">
                                        👥
                                    </span>

                                    <span className="hirehub-action-content">

                                        <strong>
                                            Manage Users
                                        </strong>

                                        <small>
                                            View and manage users
                                        </small>

                                    </span>

                                    <span className="hirehub-action-arrow">
                                        →
                                    </span>

                                </button>


                                <button
                                    id="admin-action-jobs"
                                    className="hirehub-action"
                                    onClick={() =>
                                        navigate(
                                            "/admin/jobs"
                                        )
                                    }
                                >

                                    <span className="hirehub-action-icon">
                                        💼
                                    </span>

                                    <span className="hirehub-action-content">

                                        <strong>
                                            Manage Jobs
                                        </strong>

                                        <small>
                                            Manage job postings
                                        </small>

                                    </span>

                                    <span className="hirehub-action-arrow">
                                        →
                                    </span>

                                </button>


                                <button
                                    id="admin-action-applications"
                                    className="hirehub-action"
                                    onClick={() =>
                                        navigate(
                                            "/admin/applications"
                                        )
                                    }
                                >

                                    <span className="hirehub-action-icon">
                                        📋
                                    </span>

                                    <span className="hirehub-action-content">

                                        <strong>
                                            Manage Applications
                                        </strong>

                                        <small>
                                            Review applications
                                        </small>

                                    </span>

                                    <span className="hirehub-action-arrow">
                                        →
                                    </span>

                                </button>


                                <button
                                    id="admin-action-interviews"
                                    className="hirehub-action"
                                    onClick={() =>
                                        navigate(
                                            "/admin/interviews"
                                        )
                                    }
                                >

                                    <span className="hirehub-action-icon">
                                        📅
                                    </span>

                                    <span className="hirehub-action-content">

                                        <strong>
                                            Manage Interviews
                                        </strong>

                                        <small>
                                            Manage interviews
                                        </small>

                                    </span>

                                    <span className="hirehub-action-arrow">
                                        →
                                    </span>

                                </button>


                                <button
                                    id="admin-action-analytics"
                                    className="hirehub-action"
                                    onClick={() =>
                                        navigate(
                                            "/admin/analytics"
                                        )
                                    }
                                >

                                    <span className="hirehub-action-icon">
                                        📊
                                    </span>

                                    <span className="hirehub-action-content">

                                        <strong>
                                            Analytics & Reports
                                        </strong>

                                        <small>
                                            View system analytics
                                        </small>

                                    </span>

                                    <span className="hirehub-action-arrow">
                                        →
                                    </span>

                                </button>


                                <button
                                    id="admin-action-notifications"
                                    className="hirehub-action"
                                    onClick={() =>
                                        navigate(
                                            "/admin/notifications"
                                        )
                                    }
                                >

                                    <span className="hirehub-action-icon">
                                        🔔
                                    </span>

                                    <span className="hirehub-action-content">

                                        <strong>
                                            Notifications
                                        </strong>

                                        <small>
                                            View system notifications
                                        </small>

                                    </span>

                                    <span className="hirehub-action-arrow">
                                        →
                                    </span>

                                </button>

                            </div>

                        </article>

                    </section>


                    {/* ==================================
                        ADMIN MANAGEMENT
                    ================================== */}

                    <section
                        id="admin-management"
                        className="hirehub-section"
                    >

                        <header className="hirehub-section-header">

                            <div>

                                <span className="hirehub-section-label">
                                    SYSTEM MANAGEMENT
                                </span>

                                <h2>
                                    Admin Management
                                </h2>

                            </div>

                        </header>


                        <div
                            id="admin-management-grid"
                            className="hirehub-management-grid"
                        >

                            <button
                                id="admin-management-users"
                                className="hirehub-management-card"
                                onClick={() =>
                                    navigate(
                                        "/admin/users"
                                    )
                                }
                            >

                                <span className="hirehub-management-icon">
                                    👥
                                </span>

                                <strong>
                                    User Management
                                </strong>

                            </button>


                            <button
                                id="admin-management-jobs"
                                className="hirehub-management-card"
                                onClick={() =>
                                    navigate(
                                        "/admin/jobs"
                                    )
                                }
                            >

                                <span className="hirehub-management-icon">
                                    💼
                                </span>

                                <strong>
                                    Job Management
                                </strong>

                            </button>


                            <button
                                id="admin-management-applications"
                                className="hirehub-management-card"
                                onClick={() =>
                                    navigate(
                                        "/admin/applications"
                                    )
                                }
                            >

                                <span className="hirehub-management-icon">
                                    📄
                                </span>

                                <strong>
                                    Application Management
                                </strong>

                            </button>


                            <button
                                id="admin-management-interviews"
                                className="hirehub-management-card"
                                onClick={() =>
                                    navigate(
                                        "/admin/interviews"
                                    )
                                }
                            >

                                <span className="hirehub-management-icon">
                                    📅
                                </span>

                                <strong>
                                    Interview Management
                                </strong>

                            </button>


                            <button
                                id="admin-management-analytics"
                                className="hirehub-management-card"
                                onClick={() =>
                                    navigate(
                                        "/admin/analytics"
                                    )
                                }
                            >

                                <span className="hirehub-management-icon">
                                    📊
                                </span>

                                <strong>
                                    Analytics & Reports
                                </strong>

                            </button>


                            <button
                                id="admin-management-notifications"
                                className="hirehub-management-card"
                                onClick={() =>
                                    navigate(
                                        "/admin/notifications"
                                    )
                                }
                            >

                                <span className="hirehub-management-icon">
                                    🔔
                                </span>

                                <strong>
                                    Notifications
                                </strong>

                            </button>

                        </div>

                    </section>


                    {/* ==================================
                        REFRESH
                    ================================== */}

                    <div
                        id="admin-refresh"
                        className="hirehub-refresh-area"
                    >

                        <button
                            id="admin-refresh-button"
                            className="hirehub-secondary-btn"
                            onClick={loadAnalytics}
                        >
                            🔄 Refresh Dashboard
                        </button>

                    </div>

                </main>

            </div>

        </div>
    );
}

export default AdminDashboard;