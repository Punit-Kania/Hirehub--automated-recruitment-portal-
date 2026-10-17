import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthHeaders } from "../services/api";

function AdminApplications() {

    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadApplications = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                `${API.admin}?action=applications`,
                {
                    headers: getAuthHeaders()
                }
            );

            const data = await response.json();

            console.log("Admin applications response:", data);

            if (data.success) {

                setApplications(
                    data.applications || []
                );

            } else {

                setError(
                    data.message ||
                    "Failed to load applications."
                );
            }

        } catch (err) {

            console.error(
                "Application loading error:",
                err
            );

            setError(
                "Unable to connect to HireHub server."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        const storedUser = localStorage.getItem("hirehubUser");

        if (!storedUser) {
            navigate("/login");
            return;
        }

        try {
            const user = JSON.parse(storedUser);

            if (user.role !== "admin") {
                if (user.role === "recruiter") {
                    navigate("/recruiter/dashboard");
                } else {
                    navigate("/dashboard");
                }
                return;
            }

            loadApplications();

        } catch (err) {
            console.error("Invalid user data:", err);
            navigate("/login");
        }

    }, [navigate]);


    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return date;
    };


    const getStatusClass = (status) => {

        switch (status) {

            case "applied":
                return "badge bg-primary";

            case "shortlisted":
                return "badge bg-warning text-dark";

            case "interview":
                return "badge bg-info text-dark";

            case "selected":
                return "badge bg-success";

            case "rejected":
                return "badge bg-danger";

            default:
                return "badge bg-secondary";
        }
    };


    return (

        <div className="container py-4">

            {/* Header */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h1>
                        Application Management
                    </h1>

                    <p className="text-muted">
                        View and monitor all HireHub applications.
                    </p>

                </div>

                <button
                    className="btn btn-secondary"
                    onClick={() =>
                        navigate("/admin/dashboard")
                    }
                >
                    Dashboard
                </button>

            </div>


            {/* Total */}

            <div className="card mb-4">

                <div className="card-body text-center">

                    <h3>
                        Total Applications:{" "}
                        {applications.length}
                    </h3>

                </div>

            </div>


            {/* Loading */}

            {loading && (

                <div className="text-center">

                    <p>
                        Loading applications...
                    </p>

                </div>

            )}


            {/* Error */}

            {!loading && error && (

                <div className="alert alert-danger">

                    {error}

                </div>

            )}


            {/* No Applications */}

            {!loading &&
                !error &&
                applications.length === 0 && (

                    <div className="alert alert-info">

                        No applications found.

                    </div>

                )}


            {/* Applications Table */}

            {!loading &&
                !error &&
                applications.length > 0 && (

                    <div className="table-responsive">

                        <table className="table table-bordered table-striped">

                            <thead className="table-dark">

                                <tr>

                                    <th>#</th>

                                    <th>Candidate ID</th>

                                    <th>Job</th>

                                    <th>Company</th>

                                    <th>Recruiter ID</th>

                                    <th>Status</th>

                                    <th>Applied At</th>

                                    <th>Updated At</th>

                                </tr>

                            </thead>


                            <tbody>

                                {applications.map(
                                    (application, index) => (

                                        <tr
                                            key={
                                                application.id
                                            }
                                        >

                                            <td>
                                                {index + 1}
                                            </td>

                                            <td>
                                                {application.userId}
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        application.jobTitle
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    application.company
                                                }
                                            </td>

                                            <td>
                                                {
                                                    application.recruiterId
                                                }
                                            </td>

                                            <td>

                                                <span
                                                    className={getStatusClass(
                                                        application.status
                                                    )}
                                                >
                                                    {
                                                        application.status
                                                    }
                                                </span>

                                            </td>

                                            <td>
                                                {formatDate(
                                                    application.appliedAt
                                                )}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    application.updatedAt
                                                )}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}


            {/* Buttons */}

            <div className="mt-4">

                <button
                    className="btn btn-primary me-2"
                    onClick={loadApplications}
                >
                    Refresh Applications
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

    );
}

export default AdminApplications;