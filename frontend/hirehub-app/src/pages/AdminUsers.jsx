import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthHeaders } from "../services/api";

function AdminUsers() {

    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
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

            loadUsers();

        } catch (err) {

            console.error("Invalid user:", err);
            navigate("/login");

        }

    }, [navigate]);


    const loadUsers = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                `${API.admin}?action=users`,
                {
                    headers: getAuthHeaders()
                }
            );

            const data = await response.json();

            console.log(
                "Admin users response:",
                data
            );

            if (data.success) {

                setUsers(data.users || []);

            } else {

                setError(
                    data.message ||
                    "Failed to load users."
                );
            }

        } catch (err) {

            console.error(
                "Load users error:",
                err
            );

            setError(
                "Unable to connect to Admin API."
            );

        } finally {

            setLoading(false);
        }
    };


    const updateUser = async (
        userId,
        role,
        status
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
                        userId,
                        role,
                        status
                    })
                }
            );

            const data =
                await response.json();

            console.log(
                "User update response:",
                data
            );

            if (data.success) {

                setMessage(
                    data.message ||
                    "User updated successfully."
                );

                loadUsers();

            } else {

                setError(
                    data.message ||
                    "Failed to update user."
                );
            }

        } catch (err) {

            console.error(
                "Update user error:",
                err
            );

            setError(
                "Unable to update user."
            );
        }
    };


    const deleteUser = async (userId) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this user?"
            );

        if (!confirmDelete) {
            return;
        }

        try {

            setMessage("");
            setError("");

            const response = await fetch(
                `${API.admin}?userId=${encodeURIComponent(userId)}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders()
                }
            );

            const data =
                await response.json();

            console.log(
                "Delete user response:",
                data
            );

            if (data.success) {

                setMessage(
                    data.message ||
                    "User deleted successfully."
                );

                loadUsers();

            } else {

                setError(
                    data.message ||
                    "Failed to delete user."
                );
            }

        } catch (err) {

            console.error(
                "Delete user error:",
                err
            );

            setError(
                "Unable to delete user."
            );
        }
    };


    const handleRoleChange = (
        user,
        newRole
    ) => {

        updateUser(
            user.id,
            newRole,
            user.status
        );
    };


    const handleStatusChange = (
        user,
        newStatus
    ) => {

        updateUser(
            user.id,
            user.role,
            newStatus
        );
    };


    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return date;
    };


    const getRoleBadge = (role) => {

        if (role === "admin") {
            return "bg-danger";
        }

        if (role === "recruiter") {
            return "bg-primary";
        }

        return "bg-success";
    };


    const getStatusBadge = (status) => {

        return status === "active"
            ? "bg-success"
            : "bg-secondary";
    };


    if (loading) {

        return (
            <div className="container py-5 text-center">

                <h2>Admin User Management</h2>

                <p>
                    Loading users...
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

                <div className="text-center mb-4">

                    <h1>
                        User Management
                    </h1>

                    <p className="text-muted">
                        View and manage HireHub users.
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


                {/* User Count */}

                <div className="card shadow-sm mb-4">

                    <div className="card-body">

                        <h4>
                            Total Users: {users.length}
                        </h4>

                    </div>

                </div>


                {/* Users */}

                {users.length === 0 ? (

                    <div className="alert alert-info">
                        No users found.
                    </div>

                ) : (

                    <div className="card shadow-sm">

                        <div className="table-responsive">

                            <table className="table table-bordered table-hover mb-0">

                                <thead className="table-dark">

                                    <tr>

                                        <th>#</th>

                                        <th>Name</th>

                                        <th>Email</th>

                                        <th>Role</th>

                                        <th>Status</th>

                                        <th>Created At</th>

                                        <th>Actions</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {users.map(
                                        (user, index) => (

                                            <tr
                                                key={user.id}
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    {user.name}
                                                </td>

                                                <td>
                                                    {user.email}
                                                </td>

                                                <td>

                                                    <select
                                                        className="form-select"
                                                        value={
                                                            user.role
                                                        }
                                                        onChange={
                                                            (e) =>
                                                                handleRoleChange(
                                                                    user,
                                                                    e.target.value
                                                                )
                                                        }
                                                    >

                                                        <option value="candidate">
                                                            Candidate
                                                        </option>

                                                        <option value="recruiter">
                                                            Recruiter
                                                        </option>

                                                        <option value="admin">
                                                            Admin
                                                        </option>

                                                    </select>

                                                </td>


                                                <td>

                                                    <select
                                                        className="form-select"
                                                        value={
                                                            user.status
                                                        }
                                                        onChange={
                                                            (e) =>
                                                                handleStatusChange(
                                                                    user,
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

                                                </td>


                                                <td>
                                                    {formatDate(
                                                        user.createdAt
                                                    )}
                                                </td>


                                                <td>

                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() =>
                                                            deleteUser(
                                                                user.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}


                <div className="mt-4">

                    <button
                        className="btn btn-primary me-2"
                        onClick={loadUsers}
                    >
                        Refresh Users
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

export default AdminUsers;