import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(API.login, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            console.log("Login response:", data);

            if (data.success) {
    // Save logged-in user information
    localStorage.setItem(
        "hirehubUser",
        JSON.stringify(data.user)
    );

    setMessage(
        data.message || "Login successful"
    );

    // Role-based navigation
    if (data.user.role === "recruiter") {

        navigate("/recruiter/dashboard");

    } else if (data.user.role === "admin") {

        navigate("/admin/dashboard");

    } else {

        navigate("/dashboard");

    }
} else {
                setError(
                    data.message || "Invalid email or password"
                );
            }

        } catch (err) {
            console.error("Login error:", err);

            setError(
                "Unable to connect to HireHub server. Make sure XAMPP Apache is running."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light"
        >
            <div
                className="card shadow-lg border-0"
                style={{
                    maxWidth: "450px",
                    width: "100%"
                }}
            >
                <div className="card-body p-5">

                    {/* Logo / Title */}
                    <div className="text-center mb-4">
                        <h1 className="fw-bold text-primary">
                            HireHub
                        </h1>

                        <p className="text-muted mb-0">
                            Automated Recruitment Portal
                        </p>
                    </div>

                    {/* Login Heading */}
                    <h3 className="text-center mb-4">
                        Login
                    </h3>

                    {/* Success Message */}
                    {message && (
                        <div className="alert alert-success">
                            {message}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit}>

                        {/* Email */}
                        <div className="mb-3">
                            <label
                                htmlFor="email"
                                className="form-label"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                            <label
                                htmlFor="password"
                                className="form-label"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={loading}
                        >
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </button>

                    </form>

                    {/* Register */}
                    <div className="text-center mt-4">

                        <span className="text-muted">
                            Don't have an account?
                        </span>

                        <button
                            type="button"
                            className="btn btn-link"
                            onClick={() => navigate("/register")}
                        >
                            Register
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default Login;