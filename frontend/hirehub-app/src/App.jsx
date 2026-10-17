import { Routes, Route, Navigate } from "react-router-dom";

/* =========================================================
   AUTH PAGES
   ========================================================= */

import Login from "./pages/Login";
import Register from "./pages/Register";


/* =========================================================
   CANDIDATE PAGES
   ========================================================= */

import CandidateDashboard from "./pages/CandidateDashboard";
import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import Interviews from "./pages/interviews";
import CandidateProfile from "./pages/CandidateProfile";
import Resume from "./pages/Resume";


/* =========================================================
   RECRUITER PAGES
   ========================================================= */

import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterJobs from "./pages/RecruiterJobs";
import RecruiterApplications from "./pages/RecruiterApplications";
import RecruiterInterviews from "./pages/RecruiterInterviews";
import SmartMatch from "./pages/SmartMatch";


/* =========================================================
   ADMIN PAGES
   ========================================================= */

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminJobs from "./pages/AdminJobs";
import AdminApplications from "./pages/AdminApplications";
import AdminInterviews from "./pages/AdminInterviews";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminNotifications from "./pages/AdminNotifications";


function App() {

    return (

        <Routes>

            {/* =================================================
                ROOT
                localhost:5173/
                automatically opens LOGIN
                ================================================= */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />


            {/* =================================================
                AUTHENTICATION
                ================================================= */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />


            {/* =================================================
                CANDIDATE
                ================================================= */}

            <Route
                path="/dashboard"
                element={<CandidateDashboard />}
            />

            <Route
                path="/jobs"
                element={<Jobs />}
            />

            <Route
                path="/applications"
                element={<Applications />}
            />

            <Route
                path="/interviews"
                element={<Interviews />}
            />

            <Route
                path="/profile"
                element={<CandidateProfile />}
            />

            <Route
                path="/resume"
                element={<Resume />}
            />


            {/* =================================================
                RECRUITER
                ================================================= */}

            <Route
                path="/recruiter/dashboard"
                element={<RecruiterDashboard />}
            />

            <Route
                path="/recruiter/jobs"
                element={<RecruiterJobs />}
            />

            <Route
                path="/recruiter/applications"
                element={<RecruiterApplications />}
            />

            <Route
                path="/recruiter/interviews"
                element={<RecruiterInterviews />}
            />

            <Route
                path="/recruiter/smart-match"
                element={<SmartMatch />}
            />


            {/* =================================================
                ADMIN
                ================================================= */}

            <Route
                path="/admin/dashboard"
                element={<AdminDashboard />}
            />

            <Route
                path="/admin/users"
                element={<AdminUsers />}
            />

            <Route
                path="/admin/jobs"
                element={<AdminJobs />}
            />

            <Route
                path="/admin/applications"
                element={<AdminApplications />}
            />

            <Route
                path="/admin/interviews"
                element={<AdminInterviews />}
            />

            <Route
                path="/admin/analytics"
                element={<AdminAnalytics />}
            />

            <Route
                path="/admin/notifications"
                element={<AdminNotifications />}
            />


            {/* =================================================
                UNKNOWN URL
                ================================================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

        </Routes>

    );
}


export default App;