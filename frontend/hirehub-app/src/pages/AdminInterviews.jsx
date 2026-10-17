import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthHeaders } from "../services/api";

function AdminInterviews() {
    const navigate = useNavigate();

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

            loadInterviews();

        } catch (err) {
            console.error("Invalid user data:", err);
            navigate("/login");
        }
    }, [navigate]);

    const loadInterviews = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API.admin}?action=interviews`,
                {
                    headers: getAuthHeaders()
                }
            );
            const data = await response.json();

            console.log("Admin Interviews response:", data);

            if (data.success) {
                setInterviews(data.interviews || []);
            } else {
                setError(
                    data.message || "Failed to load interviews."
                );
            }
        } catch (err) {
            console.error("Admin interviews error:", err);
            setError("Failed to connect to HireHub server.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";

        const parts = date.split("-");

        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        return date;
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "scheduled":
                return "bg-primary";

            case "rescheduled":
                return "bg-warning text-dark";

            case "completed":
                return "bg-success";

            case "cancelled":
                return "bg-danger";

            default:
                return "bg-secondary";
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <h1>HireHub Admin</h1>
                <h2 className="mt-4">
                    Interview Management
                </h2>
                <p className="mt-3">
                    Loading interviews...
                </p>
            </div>
        );
    }

    return (
        <div className="container py-4">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1>Interview Management</h1>

                    <p className="text-muted mb-0">
                        View and monitor all HireHub interviews.
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() =>
                        navigate("/admin/dashboard")
                    }
                >
                    Dashboard
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="alert alert-danger">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Statistics */}
            {!error && (
                <div className="card mb-4">
                    <div className="card-body text-center">
                        <h2>
                            Total Interviews:{" "}
                            {interviews.length}
                        </h2>
                    </div>
                </div>
            )}

            {/* No Interviews */}
            {!error && interviews.length === 0 && (
                <div className="card">
                    <div className="card-body text-center py-5">
                        <h3>No Interviews Found</h3>

                        <p className="text-muted">
                            There are currently no interviews
                            scheduled in the system.
                        </p>
                    </div>
                </div>
            )}

            {/* Interviews */}
            {!error && interviews.length > 0 && (
                <div className="card">
                    <div className="card-body">

                        <div className="table-responsive">

                            <table className="table table-bordered table-hover align-middle">

                                <thead className="table-dark">
                                    <tr>
                                        <th>#</th>
                                        <th>Candidate ID</th>
                                        <th>Job</th>
                                        <th>Company</th>
                                        <th>Recruiter ID</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Mode</th>
                                        <th>Status</th>
                                        <th>Meeting Link</th>
                                        <th>Notes</th>
                                        <th>Feedback</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {interviews.map(
                                        (interview, index) => (
                                            <tr
                                                key={
                                                    interview.id ||
                                                    index
                                                }
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    {interview.userId ||
                                                        "-"}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            interview.jobTitle
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        interview.company
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        interview.recruiterId ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        interview.interviewDate
                                                    )}
                                                </td>

                                                <td>
                                                    {
                                                        interview.interviewTime ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        interview.mode ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    <span
                                                        className={`badge ${getStatusClass(
                                                            interview.status
                                                        )}`}
                                                    >
                                                        {
                                                            interview.status
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {interview.meetingLink ? (
                                                        <a
                                                            href={
                                                                interview.meetingLink
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm btn-primary"
                                                        >
                                                            Open Meeting
                                                        </a>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>

                                                <td>
                                                    {
                                                        interview.notes ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        interview.feedback ||
                                                        "-"
                                                    }
                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>
                </div>
            )}

            {/* Bottom Buttons */}
            <div className="mt-4 text-center">

                <button
                    className="btn btn-primary me-2"
                    onClick={loadInterviews}
                >
                    Refresh Interviews
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

export default AdminInterviews;