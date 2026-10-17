import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthHeaders } from "../services/api";

function RecruiterJobs() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");

    const [editingJobId, setEditingJobId] =
        useState(null);


    const [formData, setFormData] = useState({

        title: "",

        company: "",

        description: "",

        location: "",

        jobType: "",

        salary: "",

        skills: ""

    });


    // ==========================================
    // LOAD LOGGED-IN RECRUITER
    // ==========================================

    useEffect(() => {

        const savedUser =
            localStorage.getItem(
                "hirehubUser"
            );


        if (!savedUser) {

            navigate("/login");

            return;

        }


        try {

            const loggedInUser =
                JSON.parse(
                    savedUser
                );


            const role =
                String(
                    loggedInUser.role || ""
                ).toLowerCase();


            if (
                role !== "recruiter"
            ) {

                navigate("/dashboard");

                return;

            }


            setUser(
                loggedInUser
            );


            const recruiterId =
                loggedInUser._id ||
                loggedInUser.id ||
                loggedInUser.userId;


            if (!recruiterId) {

                setError(
                    "Recruiter ID not found. Please login again."
                );

                setLoading(false);

                return;

            }


            loadJobs(
                recruiterId
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
    // LOAD JOBS
    // ==========================================

    const loadJobs = async (
        recruiterId
    ) => {

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


            const response =
                await fetch(

                    API.jobs,

                    {

                        method: "GET",

                        headers:
                            getAuthHeaders()

                    }

                );


            const data =
                await response.json();


            console.log(
                "Recruiter Jobs:",
                data
            );


            /*
            ==========================================
            AUTH ERROR
            ==========================================
            */

            if (
                response.status ===
                401
            ) {

                localStorage.removeItem(
                    "hirehubUser"
                );

                navigate("/login");

                return;

            }


            if (
                response.status ===
                403
            ) {

                setError(
                    data.message ||
                    "Access denied."
                );

                return;

            }


            if (!response.ok) {

                setError(
                    data.message ||
                    "Unable to load jobs."
                );

                return;

            }


            if (
                data.success
            ) {

                const allJobs =
                    Array.isArray(
                        data.jobs
                    )
                        ? data.jobs
                        : [];


                /*
                ==========================================
                ONLY THIS RECRUITER'S JOBS
                ==========================================
                */

                const myJobs =
                    allJobs.filter(
                        (job) =>

                            String(
                                job.recruiterId ||
                                ""
                            ) ===
                            String(
                                recruiterId
                            )
                    );


                setJobs(
                    myJobs
                );


            } else {

                setError(
                    data.message ||
                    "Unable to load jobs."
                );

            }


        } catch (err) {

            console.error(
                "Load jobs error:",
                err
            );


            setError(
                "Unable to connect to HireHub server."
            );


        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // FORM CHANGE
    // ==========================================

    const handleChange = (
        e
    ) => {

        setFormData({

            ...formData,

            [e.target.name]:
                e.target.value

        });

    };


    // ==========================================
    // CREATE / UPDATE JOB
    // ==========================================

    const handleSubmit = async (
        e
    ) => {

        e.preventDefault();


        setSaving(true);

        setError("");

        setMessage("");


        if (!user) {

            setError(
                "Recruiter information not found."
            );

            setSaving(false);

            return;

        }


        const recruiterId =
            user._id ||
            user.id ||
            user.userId;


        if (!recruiterId) {

            setError(
                "Recruiter ID not found."
            );

            setSaving(false);

            return;

        }


        const skillsArray =
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
        | IMPORTANT
        |--------------------------------------------------------------------------
        | recruiterId is NOT sent.
        |
        | jobs.php gets it from authentication headers.
        |
        */

        const jobData = {

            title:
                formData.title,

            company:
                formData.company,

            description:
                formData.description,

            location:
                formData.location,

            jobType:
                formData.jobType,

            salary:
                formData.salary,

            skills:
                skillsArray

        };


        try {

            let response;


            // ======================================
            // UPDATE
            // ======================================

            if (editingJobId) {

                response =
                    await fetch(

                        API.jobs,

                        {

                            method:
                                "PUT",

                            headers:
                                getAuthHeaders(),

                            body:
                                JSON.stringify({

                                    jobId:
                                        editingJobId,

                                    ...jobData

                                })

                        }

                    );

            }


            // ======================================
            // CREATE
            // ======================================

            else {

                response =
                    await fetch(

                        API.jobs,

                        {

                            method:
                                "POST",

                            headers:
                                getAuthHeaders(),

                            body:
                                JSON.stringify(
                                    jobData
                                )

                        }

                    );

            }


            const data =
                await response.json();


            console.log(
                "Job operation response:",
                data
            );


            if (
                response.status ===
                401
            ) {

                localStorage.removeItem(
                    "hirehubUser"
                );

                navigate("/login");

                return;

            }


            if (
                response.status ===
                403
            ) {

                setError(
                    data.message ||
                    "You are not authorized to modify this job."
                );

                return;

            }


            if (!response.ok) {

                setError(
                    data.message ||
                    "Job operation failed."
                );

                return;

            }


            if (
                data.success
            ) {

                setMessage(
                    data.message ||
                    "Job saved successfully."
                );


                resetForm();


                await loadJobs(
                    recruiterId
                );


            } else {

                setError(
                    data.message ||
                    "Job operation failed."
                );

            }


        } catch (err) {

            console.error(
                "Job operation error:",
                err
            );


            setError(
                "Unable to connect to HireHub server."
            );


        } finally {

            setSaving(false);

        }

    };


    // ==========================================
    // RESET FORM
    // ==========================================

    const resetForm = () => {

        setFormData({

            title: "",

            company: "",

            description: "",

            location: "",

            jobType: "",

            salary: "",

            skills: ""

        });


        setEditingJobId(
            null
        );

    };


    // ==========================================
    // EDIT JOB
    // ==========================================

    const handleEdit = (
        job
    ) => {

        setEditingJobId(
            job.id
        );


        setFormData({

            title:
                job.title ||
                "",

            company:
                job.company ||
                "",

            description:
                job.description ||
                "",

            location:
                job.location ||
                "",

            jobType:
                job.jobType ||
                "",

            salary:
                job.salary ||
                "",

            skills:
                (
                    job.skills ||
                    []
                ).join(", ")

        });


        setMessage("");

        setError("");


        window.scrollTo({

            top: 0,

            behavior:
                "smooth"

        });

    };


    // ==========================================
    // DELETE JOB
    // ==========================================

    const handleDelete = async (
        jobId
    ) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this job?"
            );


        if (!confirmDelete) {

            return;

        }


        if (!user) {

            setError(
                "Recruiter information not found."
            );

            return;

        }


        const recruiterId =
            user._id ||
            user.id ||
            user.userId;


        if (!recruiterId) {

            setError(
                "Recruiter ID not found."
            );

            return;

        }


        try {

            setError("");

            setMessage("");


            const response =
                await fetch(

                    `${API.jobs}?jobId=${encodeURIComponent(
                        jobId
                    )}`,

                    {

                        method:
                            "DELETE",

                        headers:
                            getAuthHeaders()

                    }

                );


            const data =
                await response.json();


            console.log(
                "Delete job response:",
                data
            );


            if (
                response.status ===
                401
            ) {

                localStorage.removeItem(
                    "hirehubUser"
                );

                navigate("/login");

                return;

            }


            if (
                response.status ===
                403
            ) {

                setError(
                    data.message ||
                    "You are not authorized to delete this job."
                );

                return;

            }


            if (!response.ok) {

                setError(
                    data.message ||
                    "Unable to delete job."
                );

                return;

            }


            if (
                data.success
            ) {

                setMessage(
                    data.message ||
                    "Job deleted successfully."
                );


                /*
                ==========================================
                REMOVE FROM CURRENT LIST
                ==========================================
                */

                setJobs(
                    previousJobs =>

                        previousJobs.filter(
                            job =>
                                job.id !==
                                jobId
                        )

                );


            } else {

                setError(
                    data.message ||
                    "Unable to delete job."
                );

            }


        } catch (err) {

            console.error(
                "Delete job error:",
                err
            );


            setError(
                "Unable to connect to HireHub server."
            );

        }

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="container py-5 text-center">

                <h4>

                    Loading Your Jobs...

                </h4>

            </div>

        );

    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="min-vh-100 bg-light">


            {/* ================================= */}
            {/* NAVBAR */}
            {/* ================================= */}

            <nav
                className="navbar navbar-dark bg-primary"
            >

                <div
                    className="container-fluid px-4"
                >

                    <span
                        className="navbar-brand fw-bold"
                    >

                        HireHub

                    </span>


                    <div>

                        <span
                            className="text-white me-3"
                        >

                            {
                                user?.name ||
                                "Recruiter"
                            }

                        </span>


                        <button

                            className="btn btn-light btn-sm"

                            onClick={() =>
                                navigate(
                                    "/recruiter/dashboard"
                                )
                            }

                        >

                            Dashboard

                        </button>

                    </div>

                </div>

            </nav>


            {/* ================================= */}
            {/* MAIN */}
            {/* ================================= */}

            <div className="container py-5">


                <div className="mb-4">

                    <h2 className="fw-bold">

                        Recruiter Job Management

                    </h2>


                    <p className="text-muted">

                        Create and manage your job
                        postings.

                    </p>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="alert alert-danger">

                        {error}

                    </div>

                )}


                {/* SUCCESS */}

                {message && (

                    <div className="alert alert-success">

                        {message}

                    </div>

                )}


                {/* ================================= */}
                {/* JOB FORM */}
                {/* ================================= */}

                <div
                    className="card shadow-sm border-0 mb-5"
                >

                    <div className="card-body p-4">


                        <h4 className="fw-bold mb-4">

                            {
                                editingJobId
                                    ? "Edit Job"
                                    : "Create New Job"
                            }

                        </h4>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >


                            {/* TITLE */}

                            <div className="mb-3">

                                <label
                                    className="form-label"
                                >

                                    Job Title

                                </label>


                                <input

                                    type="text"

                                    name="title"

                                    className="form-control"

                                    placeholder="e.g. PHP Developer"

                                    value={
                                        formData.title
                                    }

                                    onChange={
                                        handleChange
                                    }

                                    required

                                />

                            </div>


                            {/* COMPANY */}

                            <div className="mb-3">

                                <label
                                    className="form-label"
                                >

                                    Company

                                </label>


                                <input

                                    type="text"

                                    name="company"

                                    className="form-control"

                                    placeholder="Company name"

                                    value={
                                        formData.company
                                    }

                                    onChange={
                                        handleChange
                                    }

                                    required

                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="mb-3">

                                <label
                                    className="form-label"
                                >

                                    Job Description

                                </label>


                                <textarea

                                    name="description"

                                    className="form-control"

                                    rows="4"

                                    placeholder="Enter job description"

                                    value={
                                        formData.description
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

                                    placeholder="e.g. Surat"

                                    value={
                                        formData.location
                                    }

                                    onChange={
                                        handleChange
                                    }

                                    required

                                />

                            </div>


                            <div className="row">


                                {/* JOB TYPE */}

                                <div
                                    className="col-md-6 mb-3"
                                >

                                    <label
                                        className="form-label"
                                    >

                                        Job Type

                                    </label>


                                    <select

                                        name="jobType"

                                        className="form-select"

                                        value={
                                            formData.jobType
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        required

                                    >

                                        <option value="">

                                            Select Job Type

                                        </option>


                                        <option value="Full Time">

                                            Full Time

                                        </option>


                                        <option value="Part Time">

                                            Part Time

                                        </option>


                                        <option value="Internship">

                                            Internship

                                        </option>


                                        <option value="Contract">

                                            Contract

                                        </option>

                                    </select>

                                </div>


                                {/* SALARY */}

                                <div
                                    className="col-md-6 mb-3"
                                >

                                    <label
                                        className="form-label"
                                    >

                                        Salary

                                    </label>


                                    <input

                                        type="text"

                                        name="salary"

                                        className="form-control"

                                        placeholder="e.g. ₹4-6 LPA"

                                        value={
                                            formData.salary
                                        }

                                        onChange={
                                            handleChange
                                        }

                                    />

                                </div>

                            </div>


                            {/* SKILLS */}

                            <div className="mb-4">

                                <label
                                    className="form-label"
                                >

                                    Required Skills

                                </label>


                                <input

                                    type="text"

                                    name="skills"

                                    className="form-control"

                                    placeholder="Java, MongoDB, React"

                                    value={
                                        formData.skills
                                    }

                                    onChange={
                                        handleChange
                                    }

                                    required

                                />


                                <small
                                    className="text-muted"
                                >

                                    Separate skills with commas.

                                </small>

                            </div>


                            {/* BUTTON */}

                            <button

                                type="submit"

                                className="btn btn-primary me-2"

                                disabled={
                                    saving
                                }

                            >

                                {
                                    saving
                                        ? "Saving..."
                                        : editingJobId
                                        ? "Update Job"
                                        : "Create Job"
                                }

                            </button>


                            {editingJobId && (

                                <button

                                    type="button"

                                    className="btn btn-secondary"

                                    onClick={
                                        resetForm
                                    }

                                    disabled={
                                        saving
                                    }

                                >

                                    Cancel Edit

                                </button>

                            )}

                        </form>

                    </div>

                </div>


                {/* ================================= */}
                {/* MY JOBS */}
                {/* ================================= */}

                <h4 className="fw-bold mb-3">

                    My Jobs ({jobs.length})

                </h4>


                {jobs.length === 0 ? (

                    <div className="alert alert-info">

                        You have not posted any active jobs yet.

                    </div>

                ) : (

                    <div className="row">

                        {jobs.map(
                            (job) => (

                                <div
                                    className="col-md-6 mb-4"
                                    key={
                                        job.id
                                    }
                                >

                                    <div
                                        className="card shadow-sm border-0 h-100"
                                    >

                                        <div
                                            className="card-body"
                                        >

                                            <h5 className="fw-bold">

                                                {
                                                    job.title
                                                }

                                            </h5>


                                            <p className="mb-1">

                                                <strong>
                                                    Company:
                                                </strong>{" "}

                                                {
                                                    job.company
                                                }

                                            </p>


                                            <p className="mb-1">

                                                <strong>
                                                    Location:
                                                </strong>{" "}

                                                {
                                                    job.location
                                                }

                                            </p>


                                            <p className="mb-1">

                                                <strong>
                                                    Type:
                                                </strong>{" "}

                                                {
                                                    job.jobType
                                                }

                                            </p>


                                            <p className="mb-2">

                                                <strong>
                                                    Salary:
                                                </strong>{" "}

                                                {
                                                    job.salary ||
                                                    "Not specified"
                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Skills:
                                                </strong>{" "}

                                                {
                                                    (
                                                        job.skills ||
                                                        []
                                                    ).join(
                                                        ", "
                                                    )
                                                }

                                            </p>


                                            <div className="mt-3">


                                                <button

                                                    className="btn btn-warning btn-sm me-2"

                                                    onClick={() =>
                                                        handleEdit(
                                                            job
                                                        )
                                                    }

                                                >

                                                    Edit

                                                </button>


                                                <button

                                                    className="btn btn-danger btn-sm"

                                                    onClick={() =>
                                                        handleDelete(
                                                            job.id
                                                        )
                                                    }

                                                >

                                                    Delete

                                                </button>


                                            </div>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>

    );

}


export default RecruiterJobs;