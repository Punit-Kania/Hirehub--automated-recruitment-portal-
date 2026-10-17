import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthHeaders } from "../services/api";

function CandidateProfile() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        phone: "",
        location: "",
        education: "",
        skills: "",
        experience: ""
    });

    const [loading, setLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    /*
    |--------------------------------------------------------------------------
    | GET LOGGED-IN USER
    |--------------------------------------------------------------------------
    */

    const getLoggedInUser = () => {

        const savedUser =
            localStorage.getItem("hirehubUser");


        if (!savedUser) {
            return null;
        }


        try {

            return JSON.parse(savedUser);

        } catch (err) {

            console.error(
                "Invalid hirehubUser:",
                err
            );

            return null;
        }
    };


    /*
    |--------------------------------------------------------------------------
    | GET USER ID
    |--------------------------------------------------------------------------
    */

    const getUserId = (loggedInUser) => {

        return (
            loggedInUser?._id ||
            loggedInUser?.id ||
            loggedInUser?.userId ||
            ""
        );
    };


    /*
    |--------------------------------------------------------------------------
    | LOAD PROFILE
    |--------------------------------------------------------------------------
    */

    const loadProfile = async (userId) => {

        try {

            setLoadingProfile(true);
            setError("");


            console.log(
                "Loading profile for:",
                userId
            );


            const response =
                await fetch(

                    `${API.candidateProfile}?userId=${encodeURIComponent(userId)}`,

                    {
                        method: "GET",

                        headers:
                            getAuthHeaders()
                    }
                );


            console.log(
                "Profile API status:",
                response.status
            );


            const data =
                await response.json();


            console.log(
                "Profile GET response:",
                data
            );


            /*
            |--------------------------------------------------------------------------
            | AUTHENTICATION ERROR
            |--------------------------------------------------------------------------
            */

            if (response.status === 401) {

                setError(
                    "Authentication required. Please login again."
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | ACCESS DENIED
            |--------------------------------------------------------------------------
            */

            if (response.status === 403) {

                setError(
                    data.message ||
                    "Access denied."
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | SUCCESS
            |--------------------------------------------------------------------------
            */

            if (
                response.ok &&
                data.success &&
                data.profile
            ) {

                setFormData({

                    phone:
                        data.profile.phone || "",

                    location:
                        data.profile.location || "",

                    education:
                        data.profile.education || "",

                    skills:
                        Array.isArray(
                            data.profile.skills
                        )
                            ? data.profile.skills.join(", ")
                            : "",

                    experience:
                        data.profile.experience || ""
                });

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | PROFILE DOES NOT EXIST
            |--------------------------------------------------------------------------
            |
            | This is okay for a new candidate.
            |
            */

            if (
                data.message ===
                "Profile not found"
            ) {

                console.log(
                    "No existing profile found."
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | OTHER ERROR
            |--------------------------------------------------------------------------
            */

            setError(
                data.message ||
                "Unable to load profile."
            );


        } catch (err) {

            console.error(
                "Load profile error:",
                err
            );


            setError(
                "Unable to connect to HireHub server. Make sure XAMPP Apache is running."
            );


        } finally {

            setLoadingProfile(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | INITIALIZE PAGE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const loggedInUser =
            getLoggedInUser();


        /*
        |--------------------------------------------------------------------------
        | LOGIN CHECK
        |--------------------------------------------------------------------------
        */

        if (!loggedInUser) {

            navigate("/login");

            return;
        }


        console.log(
            "Logged-in user:",
            loggedInUser
        );


        /*
        |--------------------------------------------------------------------------
        | ROLE CHECK
        |--------------------------------------------------------------------------
        */

        const role =
            (
                loggedInUser.role ||
                ""
            ).toLowerCase();


        if (role !== "candidate") {

            setError(
                "Access denied. Only candidates can access this page."
            );

            setLoadingProfile(false);

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | STORE USER
        |--------------------------------------------------------------------------
        */

        setUser(loggedInUser);


        /*
        |--------------------------------------------------------------------------
        | GET USER ID
        |--------------------------------------------------------------------------
        */

        const userId =
            getUserId(loggedInUser);


        console.log(
            "Profile User ID:",
            userId
        );


        if (!userId) {

            setError(
                "User ID not found. Please login again."
            );

            setLoadingProfile(false);

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | LOAD PROFILE
        |--------------------------------------------------------------------------
        */

        loadProfile(userId);

    }, [navigate]);


    /*
    |--------------------------------------------------------------------------
    | HANDLE INPUT
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData(
            previous => ({

                ...previous,

                [name]:
                    value
            })
        );
    };


    /*
    |--------------------------------------------------------------------------
    | SAVE PROFILE
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {

        e.preventDefault();


        setLoading(true);
        setMessage("");
        setError("");


        try {

            /*
            |--------------------------------------------------------------------------
            | GET CURRENT USER
            |--------------------------------------------------------------------------
            */

            const loggedInUser =
                getLoggedInUser();


            if (!loggedInUser) {

                setError(
                    "Authentication required. Please login again."
                );

                navigate("/login");

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | ROLE CHECK
            |--------------------------------------------------------------------------
            */

            const role =
                (
                    loggedInUser.role ||
                    ""
                ).toLowerCase();


            if (role !== "candidate") {

                setError(
                    "Access denied. Only candidates can update profiles."
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | USER ID
            |--------------------------------------------------------------------------
            */

            const userId =
                getUserId(loggedInUser);


            console.log(
                "Saving profile for:",
                userId
            );


            if (!userId) {

                setError(
                    "User ID not found. Please login again."
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | CONVERT SKILLS TO ARRAY
            |--------------------------------------------------------------------------
            */

            const skills =
                formData.skills

                    .split(",")

                    .map(
                        skill =>
                            skill.trim()
                    )

                    .filter(
                        skill =>
                            skill !== ""
                    );


            /*
            |--------------------------------------------------------------------------
            | PROFILE DATA
            |--------------------------------------------------------------------------
            */

            const profileData = {

                /*
                | Sent for frontend/backend compatibility.
                | Backend does NOT trust this value.
                */

                userId:
                    userId,

                phone:
                    formData.phone.trim(),

                location:
                    formData.location.trim(),

                education:
                    formData.education.trim(),

                skills:
                    skills,

                experience:
                    formData.experience.trim()
            };


            console.log(
                "Profile data:",
                profileData
            );


            /*
            |--------------------------------------------------------------------------
            | SEND REQUEST
            |--------------------------------------------------------------------------
            */

            const response =
                await fetch(

                    API.candidateProfile,

                    {
                        method: "POST",

                        headers:
                            getAuthHeaders(),

                        body:
                            JSON.stringify(
                                profileData
                            )
                    }
                );


            console.log(
                "Profile API status:",
                response.status
            );


            const data =
                await response.json();


            console.log(
                "Profile POST response:",
                data
            );


            /*
            |--------------------------------------------------------------------------
            | AUTHENTICATION ERROR
            |--------------------------------------------------------------------------
            */

            if (response.status === 401) {

                setError(
                    "Authentication required. Please login again."
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | ACCESS DENIED
            |--------------------------------------------------------------------------
            */

            if (response.status === 403) {

                setError(
                    data.message ||
                    "Access denied."
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | SUCCESS
            |--------------------------------------------------------------------------
            */

            if (
                response.ok &&
                data.success
            ) {

                setMessage(
                    data.message ||
                    "Profile saved successfully."
                );

            } else {

                setError(
                    data.message ||
                    "Failed to save profile."
                );
            }


        } catch (err) {

            console.error(
                "Profile save error:",
                err
            );


            setError(
                "Unable to connect to HireHub server. Make sure XAMPP Apache is running."
            );


        } finally {

            setLoading(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | LOADING / ACCESS ERROR
    |--------------------------------------------------------------------------
    */

    if (!user) {

        return (

            <div className="container py-5">

                {error ? (

                    <div className="alert alert-danger">

                        <strong>
                            Error:
                        </strong>

                        {" "}

                        {error}


                        <div className="mt-3">

                            <button
                                className="btn btn-primary"
                                onClick={() =>
                                    navigate("/dashboard")
                                }
                            >
                                Back to Dashboard
                            </button>

                        </div>

                    </div>

                ) : (

                    <div className="text-center">

                        <h4>
                            Loading profile...
                        </h4>

                    </div>
                )}

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    return (

        <div className="min-vh-100 bg-light">


            {/* =========================================================
                NAVBAR
            ========================================================== */}

            <nav className="navbar navbar-dark bg-primary shadow-sm">

                <div className="container-fluid px-4">

                    <span className="navbar-brand fw-bold fs-4">
                        HireHub
                    </span>


                    <div className="d-flex align-items-center">

                        <span className="text-white me-3">

                            {user.name ||
                                "Candidate"}

                        </span>


                        <button
                            className="btn btn-light btn-sm"
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            Dashboard
                        </button>

                    </div>

                </div>

            </nav>


            {/* =========================================================
                MAIN CONTENT
            ========================================================== */}

            <div className="container py-5">

                <div className="row justify-content-center">

                    <div className="col-lg-8">

                        <div className="card shadow-sm border-0">

                            <div className="card-body p-4">


                                {/* TITLE */}

                                <h2 className="fw-bold mb-1">
                                    My Profile
                                </h2>


                                <p className="text-muted mb-4">
                                    Create or update your candidate
                                    profile.
                                </p>


                                {/* =================================================
                                    PROFILE LOADING
                                ================================================== */}

                                {loadingProfile && (

                                    <div className="alert alert-info">

                                        Loading existing profile...

                                    </div>
                                )}


                                {/* =================================================
                                    SUCCESS
                                ================================================== */}

                                {message && (

                                    <div
                                        className="alert alert-success"
                                        role="alert"
                                    >

                                        {message}

                                    </div>
                                )}


                                {/* =================================================
                                    ERROR
                                ================================================== */}

                                {error && (

                                    <div
                                        className="alert alert-danger"
                                        role="alert"
                                    >

                                        {error}

                                    </div>
                                )}


                                {/* =================================================
                                    ACCOUNT INFORMATION
                                ================================================== */}

                                <div className="alert alert-light border">

                                    <h5 className="mb-3">
                                        Account Information
                                    </h5>


                                    <div className="row">

                                        <div className="col-md-6 mb-2">

                                            <strong>
                                                Name:
                                            </strong>

                                            <div>
                                                {user.name ||
                                                    "Not available"}
                                            </div>

                                        </div>


                                        <div className="col-md-6 mb-2">

                                            <strong>
                                                Email:
                                            </strong>

                                            <div>
                                                {user.email ||
                                                    "Not available"}
                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {/* =================================================
                                    PROFILE FORM
                                ================================================== */}

                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                >


                                    {/* PHONE */}

                                    <div className="mb-3">

                                        <label
                                            className="form-label"
                                        >
                                            Phone Number
                                        </label>


                                        <input
                                            type="text"
                                            name="phone"
                                            className="form-control"
                                            placeholder="Enter phone number"
                                            value={
                                                formData.phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>


                                    {/* LOCATION */}

                                    <div className="mb-3">

                                        <label
                                            className="form-label"
                                        >
                                            Location
                                        </label>


                                        <input
                                            type="text"
                                            name="location"
                                            className="form-control"
                                            placeholder="e.g. Surat, Gujarat"
                                            value={
                                                formData.location
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>


                                    {/* EDUCATION */}

                                    <div className="mb-3">

                                        <label
                                            className="form-label"
                                        >
                                            Education
                                        </label>


                                        <input
                                            type="text"
                                            name="education"
                                            className="form-control"
                                            placeholder="e.g. TY BCA"
                                            value={
                                                formData.education
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>


                                    {/* SKILLS */}

                                    <div className="mb-3">

                                        <label
                                            className="form-label"
                                        >
                                            Skills
                                        </label>


                                        <input
                                            type="text"
                                            name="skills"
                                            className="form-control"
                                            placeholder="PHP, React, MongoDB, JavaScript"
                                            value={
                                                formData.skills
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />


                                        <small className="text-muted">

                                            Separate multiple
                                            skills with commas.

                                        </small>

                                    </div>


                                    {/* EXPERIENCE */}

                                    <div className="mb-4">

                                        <label
                                            className="form-label"
                                        >
                                            Experience
                                        </label>


                                        <textarea
                                            name="experience"
                                            className="form-control"
                                            rows="5"
                                            placeholder="Describe your experience..."
                                            value={
                                                formData.experience
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>


                                    {/* BUTTONS */}

                                    <div className="d-flex gap-2">

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={
                                                loading ||
                                                loadingProfile
                                            }
                                        >

                                            {loading
                                                ? "Saving..."
                                                : "Save Profile"}

                                        </button>


                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() =>
                                                navigate(
                                                    "/dashboard"
                                                )
                                            }
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>

                                    </div>

                                </form>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default CandidateProfile;