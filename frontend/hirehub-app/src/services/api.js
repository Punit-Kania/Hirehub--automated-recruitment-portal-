// Set VITE_API_BASE_URL in your hosting provider to your backend URL ending in /api.
// Example: https://your-hirehub-backend.onrender.com/api
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost/HireHub/backend/api").replace(/\/$/, "");

export const API = {
    register: `${API_BASE_URL}/register.php`,
    login: `${API_BASE_URL}/login.php`,

    candidateProfile: `${API_BASE_URL}/candidate-profile.php`,
    resumeUpload: `${API_BASE_URL}/resume-upload.php`,

    jobs: `${API_BASE_URL}/jobs.php`,
    applications: `${API_BASE_URL}/applications.php`,
    interviews: `${API_BASE_URL}/interviews.php`,

    smartMatch: `${API_BASE_URL}/smart-match.php`,

    admin: `${API_BASE_URL}/admin.php`
};


/*
|--------------------------------------------------------------------------
| Get currently logged-in HireHub user
|--------------------------------------------------------------------------
*/

export const getHireHubUser = () => {

    const storedUser = localStorage.getItem("hirehubUser");

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch (error) {
        console.error("Invalid hirehubUser:", error);
        return null;
    }
};


/*
|--------------------------------------------------------------------------
| Get authentication headers
|--------------------------------------------------------------------------
*/

export const getAuthHeaders = () => {

    const user = getHireHubUser();

    if (!user) {
        return {};
    }

    const userId =
        user._id ||
        user.id ||
        user.userId ||
        "";

    const role =
        user.role ||
        "candidate";

    return {
        "X-User-Id": String(userId),
        "X-User-Role": String(role),
        "Content-Type": "application/json"
    };
};


export default API;