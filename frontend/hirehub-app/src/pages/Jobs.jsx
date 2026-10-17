import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthHeaders } from "../services/api";

function Jobs() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");

    const [selectedJob, setSelectedJob] = useState(null);
    const [applying, setApplying] = useState(false);
    const [applicationMessage, setApplicationMessage] = useState("");

    useEffect(() => {
        fetchJobs();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | GET JOBS
    |--------------------------------------------------------------------------
    */

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API.jobs, {
                method: "GET",
                headers: getAuthHeaders()
            });

            if (response.status === 401 || response.status === 403) {
                const data = await response.json();

                setError(
                    data.message ||
                    "You are not authorized to view jobs."
                );

                return;
            }

            if (!response.ok) {
                throw new Error("Failed to connect to Jobs API");
            }

            const data = await response.json();

            console.log("Jobs response:", data);

            if (data.success) {
                setJobs(data.jobs || []);
            } else {
                setError(data.message || "Unable to load jobs");
            }

        } catch (err) {
            console.error("Jobs error:", err);

            setError(
                "Unable to load jobs. Please make sure XAMPP Apache is running."
            );

        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | VIEW JOB
    |--------------------------------------------------------------------------
    */

    const handleViewJob = (job) => {
        setSelectedJob(job);
        setApplicationMessage("");
    };

    /*
    |--------------------------------------------------------------------------
    | APPLY FOR JOB
    |--------------------------------------------------------------------------
    */

    const handleApply = async () => {

        const savedUser = localStorage.getItem("hirehubUser");

        if (!savedUser) {
            alert("Please login before applying for a job.");
            navigate("/login");
            return;
        }

        let user;

        try {
            user = JSON.parse(savedUser);
        } catch (error) {
            console.error("Invalid saved user:", error);

            localStorage.removeItem("hirehubUser");

            alert("Your login session is invalid. Please login again.");
            navigate("/login");

            return;
        }

        const userId =
            user?._id ||
            user?.id ||
            user?.userId ||
            "";

        if (!userId) {
            alert("User information is missing. Please login again.");
            navigate("/login");
            return;
        }

        if (!selectedJob?.id) {
            alert("Please select a job first.");
            return;
        }

        try {

            setApplying(true);
            setApplicationMessage("");

            const response = await fetch(API.applications, {
                method: "POST",

                headers: getAuthHeaders(),

                body: JSON.stringify({
                    userId: userId,
                    jobId: selectedJob.id
                })
            });

            const data = await response.json();

            console.log("Application response:", data);

            if (response.status === 401 || response.status === 403) {
                setApplicationMessage(
                    data.message ||
                    "You are not authorized to apply for this job."
                );
                return;
            }

            if (data.success) {

                setApplicationMessage(
                    `Application submitted successfully! Application ID: ${data.applicationId}`
                );

            } else {

                setApplicationMessage(
                    data.message || "Unable to submit application."
                );
            }

        } catch (error) {

            console.error("Application error:", error);

            setApplicationMessage(
                "Unable to submit application. Please check your backend connection."
            );

        } finally {

            setApplying(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | FILTER JOBS
    |--------------------------------------------------------------------------
    */

    const filteredJobs = jobs.filter((job) => {

        const searchText = search.toLowerCase().trim();

        const matchesSearch =
            searchText === "" ||
            job.title?.toLowerCase().includes(searchText) ||
            job.company?.toLowerCase().includes(searchText) ||
            job.description?.toLowerCase().includes(searchText) ||
            job.skills?.some((skill) =>
                skill.toLowerCase().includes(searchText)
            );

        const matchesLocation =
            location.trim() === "" ||
            job.location
                ?.toLowerCase()
                .includes(location.toLowerCase().trim());

        return matchesSearch && matchesLocation;
    });

    return (
        <div className="min-vh-100 bg-light">

            {/* Navbar */}
            <nav className="navbar navbar-dark bg-primary shadow-sm">

                <div className="container-fluid px-4">

                    <button
                        className="btn btn-link text-white text-decoration-none fs-4 fw-bold"
                        onClick={() => navigate("/dashboard")}
                    >
                        HireHub
                    </button>

                    <button
                        className="btn btn-light btn-sm"
                        onClick={() => navigate("/dashboard")}
                    >
                        Dashboard
                    </button>

                </div>

            </nav>


            {/* Main */}
            <main className="container py-4">

                {/* Header */}
                <div className="mb-4">

                    <h2 className="fw-bold">
                        Browse Jobs
                    </h2>

                    <p className="text-muted">
                        Find your next career opportunity.
                    </p>

                </div>


                {/* Search */}
                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-body">

                        <div className="row g-3">

                            <div className="col-md-7">

                                <label className="form-label fw-semibold">
                                    Search Jobs
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by title, company or skill..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                />

                            </div>


                            <div className="col-md-5">

                                <label className="form-label fw-semibold">
                                    Location
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Surat"
                                    value={location}
                                    onChange={(e) =>
                                        setLocation(e.target.value)
                                    }
                                />

                            </div>

                        </div>

                    </div>

                </div>


                {/* Loading */}
                {loading && (

                    <div className="text-center py-5">

                        <div
                            className="spinner-border text-primary"
                            role="status"
                        ></div>

                        <p className="mt-3 text-muted">
                            Loading jobs...
                        </p>

                    </div>

                )}


                {/* Error */}
                {!loading && error && (

                    <div className="alert alert-danger">

                        <strong>Error:</strong> {error}

                        <div className="mt-3">

                            <button
                                className="btn btn-danger btn-sm"
                                onClick={fetchJobs}
                            >
                                Try Again
                            </button>

                        </div>

                    </div>

                )}


                {/* Job Results */}
                {!loading && !error && (

                    <>

                        <div className="d-flex justify-content-between align-items-center mb-3">

                            <h5 className="fw-bold mb-0">
                                Available Jobs
                            </h5>

                            <span className="badge bg-primary">
                                {filteredJobs.length} Jobs
                            </span>

                        </div>


                        {filteredJobs.length === 0 ? (

                            <div className="card border-0 shadow-sm">

                                <div className="card-body text-center py-5">

                                    <h5>
                                        No jobs found
                                    </h5>

                                    <p className="text-muted">
                                        Try changing your search or location.
                                    </p>

                                </div>

                            </div>

                        ) : (

                            <div className="row g-4">

                                {filteredJobs.map((job) => (

                                    <div
                                        className="col-md-6 col-xl-4"
                                        key={job.id}
                                    >

                                        <div className="card border-0 shadow-sm h-100">

                                            <div className="card-body d-flex flex-column">

                                                <div className="mb-3">

                                                    <h4 className="fw-bold mb-1">
                                                        {job.title}
                                                    </h4>

                                                    <div className="text-primary fw-semibold">
                                                        {job.company}
                                                    </div>

                                                </div>


                                                <div className="mb-3">

                                                    <div className="mb-2">
                                                        📍 {job.location || "Not specified"}
                                                    </div>

                                                    <div className="mb-2">
                                                        💼 {job.jobType || "Not specified"}
                                                    </div>

                                                    {job.salary && (
                                                        <div className="mb-2">
                                                            💰 {job.salary}
                                                        </div>
                                                    )}

                                                </div>


                                                <p className="text-muted flex-grow-1">
                                                    {job.description}
                                                </p>


                                                <div className="mb-3">

                                                    {job.skills?.map(
                                                        (skill, index) => (

                                                            <span
                                                                key={index}
                                                                className="badge bg-light text-dark border me-1 mb-1"
                                                            >
                                                                {skill}
                                                            </span>

                                                        )
                                                    )}

                                                </div>


                                                <button
                                                    className="btn btn-primary w-100"
                                                    onClick={() =>
                                                        handleViewJob(job)
                                                    }
                                                >
                                                    View & Apply
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </>

                )}

            </main>


            {/* Job Details Modal */}
            {selectedJob && (

                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: "rgba(0, 0, 0, 0.5)"
                    }}
                >

                    <div className="modal-dialog modal-lg modal-dialog-centered">

                        <div className="modal-content">

                            <div className="modal-header">

                                <div>

                                    <h4 className="modal-title fw-bold">
                                        {selectedJob.title}
                                    </h4>

                                    <div className="text-primary fw-semibold">
                                        {selectedJob.company}
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() =>
                                        setSelectedJob(null)
                                    }
                                ></button>

                            </div>


                            <div className="modal-body">

                                <div className="row g-3 mb-4">

                                    <div className="col-md-4">

                                        <div className="border rounded p-3">

                                            <small className="text-muted">
                                                Location
                                            </small>

                                            <div className="fw-semibold">
                                                📍 {selectedJob.location || "Not specified"}
                                            </div>

                                        </div>

                                    </div>


                                    <div className="col-md-4">

                                        <div className="border rounded p-3">

                                            <small className="text-muted">
                                                Job Type
                                            </small>

                                            <div className="fw-semibold">
                                                💼 {selectedJob.jobType || "Not specified"}
                                            </div>

                                        </div>

                                    </div>


                                    <div className="col-md-4">

                                        <div className="border rounded p-3">

                                            <small className="text-muted">
                                                Salary
                                            </small>

                                            <div className="fw-semibold">
                                                💰 {selectedJob.salary || "Not specified"}
                                            </div>

                                        </div>

                                    </div>

                                </div>


                                <h5 className="fw-bold">
                                    Job Description
                                </h5>

                                <p className="text-muted">
                                    {selectedJob.description}
                                </p>


                                <h5 className="fw-bold mt-4">
                                    Required Skills
                                </h5>

                                <div>

                                    {selectedJob.skills?.map(
                                        (skill, index) => (

                                            <span
                                                key={index}
                                                className="badge bg-primary me-2 mb-2"
                                            >
                                                {skill}
                                            </span>

                                        )
                                    )}

                                </div>


                                {applicationMessage && (

                                    <div
                                        className={`alert mt-4 ${
                                            applicationMessage.includes(
                                                "successfully"
                                            )
                                                ? "alert-success"
                                                : "alert-warning"
                                        }`}
                                    >
                                        {applicationMessage}
                                    </div>

                                )}

                            </div>


                            <div className="modal-footer">

                                <button
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setSelectedJob(null)
                                    }
                                >
                                    Close
                                </button>

                                <button
                                    className="btn btn-primary"
                                    onClick={handleApply}
                                    disabled={applying}
                                >

                                    {applying
                                        ? "Submitting..."
                                        : "Apply Now"}

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Jobs;