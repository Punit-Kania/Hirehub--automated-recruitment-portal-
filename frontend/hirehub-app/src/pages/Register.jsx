import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "candidate"
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

            const response = await fetch(API.register, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(formData)
            });


            const data = await response.json();

            console.log("Registration response:", data);


            if (data.success) {

                setMessage(
                    data.message || "Registration successful"
                );

                // Clear form
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    role: "candidate"
                });

                // Go to login after 1.5 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 1500);

            } else {

                setError(
                    data.message || "Registration failed"
                );

            }

        } catch (err) {

            console.error("Registration error:", err);

            setError(
                "Unable to connect to HireHub server. Make sure XAMPP Apache is running."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="container py-5">

            <div className="row justify-content-center">

                <div className="col-md-6">

                    <div className="card shadow-sm">

                        <div className="card-body p-4">

                            <h2 className="text-center mb-4">
                                HireHub Registration
                            </h2>


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


                            <form onSubmit={handleSubmit}>

                                {/* Name */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>


                                {/* Email */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>


                                {/* Password */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>


                                {/* Role */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Register As
                                    </label>

                                    <select
                                        name="role"
                                        className="form-select"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >

                                        <option value="candidate">
                                            Candidate
                                        </option>

                                        <option value="recruiter">
                                            Recruiter
                                        </option>

                                    </select>

                                </div>


                                {/* Register Button */}

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >

                                    {loading
                                        ? "Registering..."
                                        : "Register"}

                                </button>

                            </form>


                            {/* Login Link */}

                            <div className="text-center mt-3">

                                <span>
                                    Already have an account?{" "}
                                </span>

                                <Link to="/login">
                                    Login
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default Register;