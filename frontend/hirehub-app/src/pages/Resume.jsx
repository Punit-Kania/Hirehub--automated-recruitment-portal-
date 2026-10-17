import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Resume() {

    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    /*
    |--------------------------------------------------------------------------
    | GET LOGGED-IN USER
    |--------------------------------------------------------------------------
    */

    const getLoggedInUser = () => {

        const storedUser =
            localStorage.getItem("hirehubUser");

        if (!storedUser) {
            return null;
        }

        try {

            return JSON.parse(storedUser);

        } catch (err) {

            console.error(
                "Invalid stored user:",
                err
            );

            return null;
        }
    };


    /*
    |--------------------------------------------------------------------------
    | FILE CHANGE
    |--------------------------------------------------------------------------
    */

    const handleFileChange = (e) => {

        const selectedFile =
            e.target.files[0];

        setMessage("");
        setError("");

        if (!selectedFile) {

            setFile(null);

            return;
        }


        /*
        | Allowed MIME types
        */

        const allowedTypes = [

            "application/pdf",

            "application/msword",

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        ];


        /*
        | Maximum 5 MB
        */

        const maxSize =
            5 * 1024 * 1024;


        /*
        | Check file type
        */

        if (!allowedTypes.includes(selectedFile.type)) {

            setError(
                "Only PDF, DOC and DOCX files are allowed."
            );

            e.target.value = "";

            setFile(null);

            return;
        }


        /*
        | Check file size
        */

        if (selectedFile.size > maxSize) {

            setError(
                "File size must be less than 5 MB."
            );

            e.target.value = "";

            setFile(null);

            return;
        }


        setFile(selectedFile);
    };


    /*
    |--------------------------------------------------------------------------
    | UPLOAD RESUME
    |--------------------------------------------------------------------------
    */

    const handleUpload = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        /*
        | Check file
        */

        if (!file) {

            setError(
                "Please select a resume first."
            );

            return;
        }


        /*
        | Get logged-in user
        */

        const user =
            getLoggedInUser();


        if (!user) {

            setError(
                "Authentication required. Please login again."
            );

            navigate("/login");

            return;
        }


        /*
        | Get user ID
        */

        const userId =
            user._id ||
            user.id ||
            user.userId;


        /*
        | Get user role
        */

        const userRole =
            (user.role || "").toLowerCase();


        console.log(
            "Logged-in user:",
            user
        );

        console.log(
            "User ID:",
            userId
        );

        console.log(
            "User Role:",
            userRole
        );


        /*
        |--------------------------------------------------------------------------
        | CHECK USER ID
        |--------------------------------------------------------------------------
        */

        if (!userId) {

            setError(
                "User ID not found. Please login again."
            );

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK ROLE
        |--------------------------------------------------------------------------
        */

        if (userRole !== "candidate") {

            setError(
                "Access denied. Only candidates can upload resumes."
            );

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | CREATE FORM DATA
        |--------------------------------------------------------------------------
        */

        const formData =
            new FormData();

        formData.append(
            "userId",
            userId
        );

        formData.append(
            "resume",
            file
        );


        setLoading(true);


        try {

            /*
            |--------------------------------------------------------------------------
            | SEND REQUEST
            |--------------------------------------------------------------------------
            |
            | IMPORTANT:
            | Do NOT set Content-Type manually here.
            | Browser automatically creates multipart/form-data boundary.
            |
            */

            const response =
                await fetch(
                    API.resumeUpload,
                    {
                        method: "POST",

                        headers: {

                            "X-User-Id":
                                userId,

                            "X-User-Role":
                                userRole
                        },

                        body: formData
                    }
                );


            console.log(
                "Resume API status:",
                response.status
            );


            /*
            |--------------------------------------------------------------------------
            | READ RESPONSE
            |--------------------------------------------------------------------------
            */

            const data =
                await response.json();


            console.log(
                "Resume upload response:",
                data
            );


            /*
            |--------------------------------------------------------------------------
            | SUCCESS
            |--------------------------------------------------------------------------
            */

            if (data.success) {

                setMessage(
                    data.message ||
                    "Resume uploaded successfully."
                );

                setFile(null);


                const input =
                    document.getElementById(
                        "resumeInput"
                    );


                if (input) {

                    input.value = "";
                }


            } else {

                setError(
                    data.message ||
                    "Resume upload failed."
                );
            }


        } catch (err) {

            console.error(
                "Resume upload error:",
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
    | RENDER
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

                        <button
                            className="btn btn-light btn-sm me-2"
                            onClick={() =>
                                navigate("/profile")
                            }
                        >
                            My Profile
                        </button>


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

                    <div className="col-lg-7">


                        <div className="card shadow-sm border-0">

                            <div className="card-body p-4">


                                {/* TITLE */}

                                <h2 className="fw-bold mb-1">
                                    Resume Management
                                </h2>


                                <p className="text-muted mb-4">
                                    Upload your resume for job
                                    applications and smart matching.
                                </p>


                                {/* =================================================
                                    SUCCESS MESSAGE
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
                                    ERROR MESSAGE
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
                                    UPLOAD FORM
                                ================================================== */}

                                <form
                                    onSubmit={handleUpload}
                                >


                                    {/* FILE INPUT */}

                                    <div className="mb-3">

                                        <label
                                            htmlFor="resumeInput"
                                            className="form-label fw-semibold"
                                        >
                                            Select Resume
                                        </label>


                                        <input
                                            id="resumeInput"
                                            type="file"
                                            className="form-control"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                            disabled={loading}
                                        />

                                    </div>


                                    {/* FILE INFORMATION */}

                                    <div className="alert alert-info">

                                        <strong>
                                            Allowed formats:
                                        </strong>

                                        {" "}
                                        PDF, DOC, DOCX

                                        <br />

                                        <strong>
                                            Maximum size:
                                        </strong>

                                        {" "}
                                        5 MB

                                    </div>


                                    {/* SELECTED FILE */}

                                    {file && (

                                        <div
                                            className="border rounded p-3 mb-3"
                                        >

                                            <strong>
                                                Selected Resume
                                            </strong>


                                            <div className="mt-2">

                                                {file.name}

                                            </div>


                                            <small className="text-muted">

                                                {(
                                                    file.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}

                                                {" "}
                                                MB

                                            </small>

                                        </div>

                                    )}


                                    {/* BUTTONS */}

                                    <div className="d-flex gap-2">


                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={
                                                loading ||
                                                !file
                                            }
                                        >

                                            {loading
                                                ? "Uploading..."
                                                : "Upload Resume"}

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

export default Resume;