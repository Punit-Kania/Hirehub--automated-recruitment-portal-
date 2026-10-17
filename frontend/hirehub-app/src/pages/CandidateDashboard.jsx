import React from "react";
import { useNavigate } from "react-router-dom";

const CandidateDashboard = () => {
    const navigate = useNavigate();

    const storedUser = localStorage.getItem("hirehubUser");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const handleLogout = () => {
        localStorage.removeItem("hirehubUser");
        navigate("/login");
    };

    return (
        <div id="candidate-dashboard" className="hirehub-dashboard candidate-page">

            {/* Futuristic Background */}
            <div id="hirehub-grid-bg" className="hirehub-grid-bg"></div>

            {/* ================= TOP BAR ================= */}
            <header id="candidate-topbar" className="hirehub-topbar">

                <div id="candidate-brand" className="hirehub-brand">
                    <div id="candidate-logo-icon" className="hirehub-logo-icon">
                        H
                    </div>

                    <span className="hirehub-brand-name">
                        HireHub
                    </span>
                </div>

                <div id="candidate-user-area" className="hirehub-user-area">

                    <div id="candidate-profile" className="hirehub-user-profile">

                        <div id="candidate-avatar" className="hirehub-avatar">
                            {(user?.name || "Candidate")
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <span
                            id="candidate-profile-name"
                            className="hirehub-profile-name"
                        >
                            {user?.name || "Candidate"}
                        </span>

                    </div>

                    <button
                        id="candidate-logout-top"
                        className="hirehub-logout-top"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>
            </header>

            {/* ================= MAIN LAYOUT ================= */}
            <div id="candidate-layout" className="hirehub-layout">

                {/* ================= SIDEBAR ================= */}
                <aside
                    id="candidate-sidebar"
                    className="hirehub-sidebar"
                >

                    <div
                        id="candidate-menu-title"
                        className="hirehub-menu-title"
                    >
                        CANDIDATE MENU
                    </div>

                    <nav
                        id="candidate-menu"
                        className="hirehub-menu"
                    >

                        <button
                            id="candidate-menu-dashboard"
                            className="hirehub-menu-item active"
                        >
                            <span className="hirehub-menu-icon">🏠</span>
                            <span>Dashboard</span>
                        </button>

                        <button
                            id="candidate-menu-jobs"
                            className="hirehub-menu-item"
                            onClick={() => navigate("/jobs")}
                        >
                            <span className="hirehub-menu-icon">🔎</span>
                            <span>Browse Jobs</span>
                        </button>

                        <button
                            id="candidate-menu-applications"
                            className="hirehub-menu-item"
                            onClick={() => navigate("/applications")}
                        >
                            <span className="hirehub-menu-icon">📋</span>
                            <span>My Applications</span>
                        </button>

                        <button
                            id="candidate-menu-interviews"
                            className="hirehub-menu-item"
                            onClick={() => navigate("/interviews")}
                        >
                            <span className="hirehub-menu-icon">📅</span>
                            <span>My Interviews</span>
                        </button>

                        <button
                            id="candidate-menu-profile"
                            className="hirehub-menu-item"
                            onClick={() => navigate("/profile")}
                        >
                            <span className="hirehub-menu-icon">👤</span>
                            <span>My Profile</span>
                        </button>

                        <button
                            id="candidate-menu-resume"
                            className="hirehub-menu-item"
                            onClick={() => navigate("/resume")}
                        >
                            <span className="hirehub-menu-icon">📄</span>
                            <span>Resume</span>
                        </button>

                    </nav>

                    <div
                        id="candidate-sidebar-divider"
                        className="hirehub-sidebar-divider"
                    ></div>

                    {/* Sidebar logout */}
                    <button
                        id="candidate-menu-logout"
                        className="hirehub-menu-item logout"
                        onClick={handleLogout}
                    >
                        <span className="hirehub-menu-icon">↪</span>
                        <span>Logout</span>
                    </button>

                    {/* Optional promo area */}
                    <div
                        id="candidate-promo"
                        className="hirehub-promo"
                    >
                        <div className="hirehub-promo-glow"></div>

                        <div className="hirehub-promo-content">
                            <strong>Build Your Future</strong>
                            <span>Find your next opportunity.</span>
                        </div>
                    </div>

                </aside>

                {/* ================= CONTENT ================= */}
                <main
                    id="candidate-content"
                    className="hirehub-content"
                >

                    {/* PAGE HEADER */}
                    <section
                        id="candidate-page-header"
                        className="hirehub-page-header"
                    >

                        <div>
                            <span className="hirehub-eyebrow">
                                CANDIDATE PORTAL
                            </span>

                            <h1 id="candidate-heading">
                                Welcome back, {user?.name || "Candidate"}!
                            </h1>

                            <p id="candidate-subheading">
                                Track your applications and discover new
                                opportunities.
                            </p>
                        </div>

                        <div
                            id="candidate-date-card"
                            className="hirehub-date-card"
                        >
                            <span className="hirehub-date-icon">
                                📅
                            </span>

                            <div>
                                <small>Today<br></br></small>
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

                    {/* ================= STATS ================= */}
                    <section
                        id="candidate-stats"
                        className="hirehub-stats"
                    >

                        <article
                            id="candidate-stat-applications"
                            className="hirehub-stat-card"
                        >
                            <div className="hirehub-stat-icon blue">
                                📋
                            </div>

                            <div className="hirehub-stat-info">
                                <span>Applications</span>
                                <strong>1</strong>
                            </div>
                        </article>

                        <article
                            id="candidate-stat-shortlisted"
                            className="hirehub-stat-card"
                        >
                            <div className="hirehub-stat-icon purple">
                                ⭐
                            </div>

                            <div className="hirehub-stat-info">
                                <span>Shortlisted</span>
                                <strong>0</strong>
                            </div>
                        </article>

                        <article
                            id="candidate-stat-interviews"
                            className="hirehub-stat-card"
                        >
                            <div className="hirehub-stat-icon cyan">
                                📅
                            </div>

                            <div className="hirehub-stat-info">
                                <span>Interviews</span>
                                <strong>1</strong>
                            </div>
                        </article>

                        <article
                            id="candidate-stat-profile"
                            className="hirehub-stat-card"
                        >
                            <div className="hirehub-stat-icon green">
                                👤
                            </div>

                            <div className="hirehub-stat-info">
                                <span>Profile</span>
                                <strong>100%</strong>
                            </div>
                        </article>

                    </section>

                    {/* ================= QUICK ACTIONS ================= */}
                    <section
                        id="candidate-quick-actions"
                        className="hirehub-section"
                    >

                        <header className="hirehub-section-header">
                            <div>
                                <span className="hirehub-section-label">
                                    GET STARTED
                                </span>

                                <h2>
                                    Quick Actions
                                </h2>
                            </div>
                        </header>

                        <div
                            id="candidate-actions"
                            className="hirehub-actions"
                        >

                            <button
                                id="candidate-action-jobs"
                                className="hirehub-action"
                                onClick={() => navigate("/jobs")}
                            >
                                <span className="hirehub-action-icon">
                                    🔎
                                </span>

                                <span className="hirehub-action-content">
                                    <strong>Browse Jobs</strong>
                                    <small>
                                        Explore available opportunities
                                    </small>
                                </span>

                                <span className="hirehub-action-arrow">
                                    →
                                </span>
                            </button>

                            <button
                                id="candidate-action-applications"
                                className="hirehub-action"
                                onClick={() => navigate("/applications")}
                            >
                                <span className="hirehub-action-icon">
                                    📋
                                </span>

                                <span className="hirehub-action-content">
                                    <strong>My Applications</strong>
                                    <small>
                                        Track your applications
                                    </small>
                                </span>

                                <span className="hirehub-action-arrow">
                                    →
                                </span>
                            </button>

                            <button
                                id="candidate-action-profile"
                                className="hirehub-action"
                                onClick={() => navigate("/profile")}
                            >
                                <span className="hirehub-action-icon">
                                    👤
                                </span>

                                <span className="hirehub-action-content">
                                    <strong>Update Profile</strong>
                                    <small>
                                        Keep your profile updated
                                    </small>
                                </span>

                                <span className="hirehub-action-arrow">
                                    →
                                </span>
                            </button>

                        </div>

                    </section>

                    {/* ================= RECOMMENDED JOBS ================= */}
                    <section
                        id="candidate-recommended-jobs"
                        className="hirehub-section"
                    >

                        <header className="hirehub-section-header">

                            <div>
                                <span className="hirehub-section-label">
                                    OPPORTUNITIES
                                </span>

                                <h2>
                                    Recommended Jobs
                                </h2>
                            </div>

                            <button
                                id="candidate-view-all-jobs"
                                className="hirehub-view-all"
                                onClick={() => navigate("/jobs")}
                            >
                                View All →
                            </button>

                        </header>

                        <article
                            id="recommended-job-1"
                            className="hirehub-job-card"
                        >

                            <div className="hirehub-job-main">

                                <div
                                    className="hirehub-company-logo"
                                    id="recommended-job-logo"
                                >
                                    H
                                </div>

                                <div className="hirehub-job-info">

                                    <h3>
                                        PHP Developer
                                    </h3>

                                    <p>
                                        HireHub Technologies
                                    </p>

                                    <div className="hirehub-job-meta">
                                        <span>📍 Surat</span>
                                        <span>💼 Full Time</span>
                                    </div>

                                </div>

                            </div>

                            <div className="hirehub-job-match">
                                <span className="hirehub-match-badge">
                                    Excellent Match
                                </span>

                                <button
                                    id="candidate-view-job"
                                    className="hirehub-view-btn"
                                    onClick={() => navigate("/jobs")}
                                >
                                    View Job
                                </button>
                            </div>

                        </article>

                    </section>

                </main>

            </div>
        </div>
    );
};

export default CandidateDashboard;