import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthHeaders } from "../services/api";

function AdminJobs() {

    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

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
                navigate("/dashboard");
                return;
            }

            loadJobs();

        } catch (err) {

            console.error("Invalid user:", err);
            navigate("/login");

        }

    }, [navigate]);


    const loadJobs = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                `${API.admin}?action=jobs`,
                {
                    headers: getAuthHeaders()
                }
            );

            const data = await response.json();

            console.log(
                "Admin jobs response:",
                data
            );

            if (data.success) {

                setJobs(data.jobs || []);

            } else {

                setError(
                    data.message ||
                    "Failed to load jobs."
                );
            }

        } catch (err) {

            console.error(
                "Load jobs error:",
                err
            );

            setError(
                "Unable to connect to Admin API."
            );

        } finally {

            setLoading(false);
        }
    };


    const updateJobStatus = async (
        jobId,
        newStatus
    ) => {

        try {

            setMessage("");
            setError("");

            const response = await fetch(
                API.admin,
                {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        jobId: jobId,
                        status: newStatus
                    })
                }
            );

            const data =
                await response.json();

            console.log(
                "Job status response:",
                data
            );

            if (data.success) {

                setMessage(
                    data.message ||
                    "Job status updated successfully."
                );

                loadJobs();

            } else {

                setError(
                    data.message ||
                    "Failed to update job status."
                );
            }

        } catch (err) {

            console.error(
                "Update job status error:",
                err
            );

            setError(
                "Unable to update job status."
            );
        }
    };


    const deleteJob = async (jobId) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this job?"
            );

        if (!confirmDelete) {
            return;
        }

        try {

            setMessage("");
            setError("");

            const response = await fetch(
                `${API.admin}?jobId=${encodeURIComponent(jobId)}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders()
                }
            );

            const data =
                await response.json();

            console.log(
                "Delete job response:",
                data
            );

            if (data.success) {

                setMessage(
                    data.message ||
                    "Job deleted successfully."
                );

                loadJobs();

            } else {

                setError(
                    data.message ||
                    "Failed to delete job."
                );
            }

        } catch (err) {

            console.error(
                "Delete job error:",
                err
            );

            setError(
                "Unable to delete job."
            );
        }
    };


    if (loading) {

        return (
            <div className="container py-5 text-center">

                <h2>Admin Job Management</h2>

                <p>
                    Loading jobs...
                </p>

            </div>
        );
    }


    return (
        <div className="container-fluid min-vh-100 bg-light">

            {/* Header */}

            <nav className="navbar navbar-dark bg-primary px-4">

                <span className="navbar-brand fw-bold">
                    HireHub Admin
                </span>

                <button
                    className="btn btn-light"
                    onClick={() =>
                        navigate("/admin/dashboard")
                    }
                >
                    Dashboard
                </button>

            </nav>


            <div className="container py-5">

                {/* Heading */}

                <div className="text-center mb-4">

                    <h1>
                        Job Management
                    </h1>

                    <p className="text-muted">
                        View and manage all HireHub job postings.
                    </p>

                </div>


                {/* Messages */}

                {message && (

                    <div className="alert alert-success">
                        {message}
                    </div>

                )}


                {error && (

                    <div className="alert alert-danger">
                        {error}
                    </div>

                )}


                {/* Job Count */}

                <div className="card shadow-sm mb-4">

                    <div className="card-body text-center">

                        <h4>
                            Total Jobs: {jobs.length}
                        </h4>

                        <p className="mb-0 text-muted">

                            Active Jobs:{" "}

                            {
                                jobs.filter(
                                    (job) =>
                                        job.status === "active"
                                ).length
                            }

                        </p>

                    </div>

                </div>


                {/* No Jobs */}

                {jobs.length === 0 ? (

                    <div className="alert alert-info">

                        No jobs found.

                    </div>

                ) : (

                    <div className="row g-4">

                        {jobs.map((job) => (

                            <div
                                className="col-12"
                                key={job.id}
                            >

                                <div className="card shadow-sm">

                                    <div className="card-body">

                                        <div className="d-flex justify-content-between align-items-start">

                                            <div>

                                                <h3>
                                                    {job.title}
                                                </h3>

                                                <h5 className="text-primary">
                                                    {job.company}
                                                </h5>

                                            </div>


                                            {/* Status */}

                                            <span
                                                className={
                                                    job.status === "active"
                                                        ? "badge bg-success"
                                                        : "badge bg-secondary"
                                                }
                                            >
                                                {job.status}
                                            </span>

                                        </div>


                                        <hr />


                                        {/* Job Information */}

                                        <div className="row">

                                            <div className="col-md-4 mb-2">

                                                <strong>
                                                    Location:
                                                </strong>

                                                <br />

                                                {job.location || "-"}

                                            </div>


                                            <div className="col-md-4 mb-2">

                                                <strong>
                                                    Job Type:
                                                </strong>

                                                <br />

                                                {job.jobType || "-"}

                                            </div>


                                            <div className="col-md-4 mb-2">

                                                <strong>
                                                    Salary:
                                                </strong>

                                                <br />

                                                {job.salary || "-"}

                                            </div>

                                        </div>


                                        {/* Description */}

                                        <div className="mt-3">

                                            <strong>
                                                Description:
                                            </strong>

                                            <p className="mt-1">
                                                {job.description || "-"}
                                            </p>

                                        </div>


                                        {/* Skills */}

                                        <div className="mt-3">

                                            <strong>
                                                Required Skills:
                                            </strong>

                                            <div className="mt-2">

                                                {job.skills &&
                                                job.skills.length > 0 ? (

                                                    job.skills.map(
                                                        (
                                                            skill,
                                                            index
                                                        ) => (

                                                            <span
                                                                key={index}
                                                                className="badge bg-primary me-2 mb-2"
                                                            >
                                                                {skill}
                                                            </span>

                                                        )
                                                    )

                                                ) : (

                                                    <span>
                                                        No skills specified
                                                    </span>

                                                )}

                                            </div>

                                        </div>


                                        {/* Recruiter */}

                                        <div className="mt-3">

                                            <strong>
                                                Recruiter ID:
                                            </strong>

                                            <br />

                                            {job.recruiterId || "-"}

                                        </div>


                                        {/* Created Date */}

                                        <div className="mt-2">

                                            <strong>
                                                Created At:
                                            </strong>

                                            <br />

                                            {job.createdAt || "-"}

                                        </div>


                                        {/* Actions */}

                                        <div className="mt-4">

                                            <select
                                                className="form-select d-inline-block me-2"
                                                style={{
                                                    width: "160px"
                                                }}
                                                value={job.status}
                                                onChange={(e) =>
                                                    updateJobStatus(
                                                        job.id,
                                                        e.target.value
                                                    )
                                                }
                                            >

                                                <option value="active">
                                                    Active
                                                </option>

                                                <option value="inactive">
                                                    Inactive
                                                </option>

                                            </select>


                                            <button
                                                className="btn btn-danger"
                                                onClick={() =>
                                                    deleteJob(
                                                        job.id
                                                    )
                                                }
                                            >
                                                Delete Job
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}


                {/* Bottom Buttons */}

                <div className="mt-5">

                    <button
                        className="btn btn-primary me-2"
                        onClick={loadJobs}
                    >
                        Refresh Jobs
                    </button>

                    <button
                        className="btn btn-secondary"
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        Back to Dashboard
                    </button>

                </div>

            </div>

        </div>
    );
}

export default AdminJobs;