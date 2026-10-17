import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthHeaders } from "../services/api";

function SmartMatch() {

    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [user, setUser] = useState(null);

    const [selectedJob, setSelectedJob] =
        useState("");

    const [candidates, setCandidates] =
        useState([]);

    const [jobInfo, setJobInfo] =
        useState(null);

    const [recommendedCount, setRecommendedCount] =
        useState(0);

    const [loadingJobs, setLoadingJobs] =
        useState(true);

    const [loadingMatch, setLoadingMatch] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    // =========================================================
    // LOAD LOGGED-IN RECRUITER
    // =========================================================

    useEffect(() => {

        const storedUser =
            localStorage.getItem(
                "hirehubUser"
            );


        if (!storedUser) {

            navigate("/login");

            return;

        }


        try {

            const loggedInUser =
                JSON.parse(
                    storedUser
                );


            const userRole =
                String(
                    loggedInUser.role || ""
                ).toLowerCase();


            /*
            =====================================================
            ONLY RECRUITERS CAN ACCESS SMART MATCH
            =====================================================
            */

            if (
                userRole !==
                "recruiter"
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

                setLoadingJobs(false);

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


    // =========================================================
    // LOAD RECRUITER JOBS
    // =========================================================

    const loadJobs = async (
        recruiterId
    ) => {

        try {

            setLoadingJobs(true);

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
                "Smart Match Jobs response:",
                data
            );


            /*
            =====================================================
            AUTHENTICATION ERROR
            =====================================================
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


            /*
            =====================================================
            PERMISSION ERROR
            =====================================================
            */

            if (
                response.status ===
                403
            ) {

                setError(
                    data.message ||
                    "Access denied. Recruiter permission required."
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


            if (!data.success) {

                setError(
                    data.message ||
                    "Unable to load jobs."
                );

                return;

            }


            const allJobs =
                Array.isArray(
                    data.jobs
                )
                    ? data.jobs
                    : [];


            /*
            =====================================================
            ONLY SHOW THIS RECRUITER'S JOBS
            =====================================================
            */

            const recruiterJobs =
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
                recruiterJobs
            );


            /*
            =====================================================
            NO JOBS
            =====================================================
            */

            if (
                recruiterJobs.length ===
                0
            ) {

                setError(
                    "You have not created any jobs yet."
                );

            }


        } catch (err) {

            console.error(
                "Load Smart Match jobs error:",
                err
            );


            setError(
                "Unable to connect to HireHub server."
            );


        } finally {

            setLoadingJobs(
                false
            );

        }

    };


    // =========================================================
    // SMART MATCH
    // =========================================================

    const handleSmartMatch =
        async () => {

            setMessage("");

            setError("");

            setCandidates([]);

            setJobInfo(null);

            setRecommendedCount(0);


            /*
            =====================================================
            JOB VALIDATION
            =====================================================
            */

            if (!selectedJob) {

                setError(
                    "Please select a job first."
                );

                return;

            }


            /*
            =====================================================
            CHECK RECRUITER
            =====================================================
            */

            const recruiterId =
                user?._id ||
                user?.id ||
                user?.userId;


            if (!recruiterId) {

                setError(
                    "Recruiter ID not found. Please login again."
                );

                return;

            }


            try {

                setLoadingMatch(
                    true
                );


                /*
                =================================================
                SMART MATCH URL
                =================================================
                */

                const url =
                    `${API.smartMatch}?jobId=${encodeURIComponent(
                        selectedJob
                    )}`;


                console.log(
                    "Smart Match URL:",
                    url
                );


                /*
                =================================================
                AUTHENTICATED REQUEST
                =================================================
                */

                const response =
                    await fetch(

                        url,

                        {
                            method: "GET",

                            headers:
                                getAuthHeaders()

                        }

                    );


                const data =
                    await response.json();


                console.log(
                    "Smart Match response:",
                    data
                );


                /*
                =================================================
                AUTH ERROR
                =================================================
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


                /*
                =================================================
                PERMISSION ERROR
                =================================================
                */

                if (
                    response.status ===
                    403
                ) {

                    setError(
                        data.message ||
                        "You are not authorized to use Smart Matching for this job."
                    );

                    return;

                }


                /*
                =================================================
                OTHER ERROR
                =================================================
                */

                if (!response.ok) {

                    setError(
                        data.message ||
                        "Smart matching failed."
                    );

                    return;

                }


                /*
                =================================================
                SUCCESS
                =================================================
                */

                if (
                    data.success
                ) {

                    setJobInfo(
                        data.job
                    );


                    setCandidates(
                        Array.isArray(
                            data.candidates
                        )
                            ? data.candidates
                            : []
                    );


                    setRecommendedCount(
                        Number(
                            data.recommendedCount ||
                            0
                        )
                    );


                    setMessage(

                        `${data.count || 0} candidates matched successfully.`

                    );

                } else {

                    setError(
                        data.message ||
                        "Smart matching failed."
                    );

                }


            } catch (err) {

                console.error(
                    "Smart Match error:",
                    err
                );


                setError(
                    "Unable to connect to Smart Matching API."
                );


            } finally {

                setLoadingMatch(
                    false
                );

            }

        };


    // =========================================================
    // MATCH BADGE
    // =========================================================

    const getMatchClass = (
        percentage
    ) => {

        const score =
            Number(
                percentage
            );


        if (
            score >= 80
        ) {

            return "bg-success";

        }


        if (
            score >= 60
        ) {

            return "bg-primary";

        }


        if (
            score >= 40
        ) {

            return "bg-warning text-dark";

        }


        return "bg-danger";

    };


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="min-vh-100 bg-light">


            {/* ================================================= */}
            {/* NAVBAR */}
            {/* ================================================= */}

            <nav
                className="navbar navbar-dark bg-primary shadow-sm"
            >

                <div
                    className="container-fluid px-4"
                >

                    <span
                        className="navbar-brand fw-bold fs-4"
                    >

                        HireHub

                    </span>


                    <div>

                        <button
                            className="btn btn-light btn-sm me-2"

                            onClick={() =>
                                navigate(
                                    "/recruiter/dashboard"
                                )
                            }
                        >

                            Dashboard

                        </button>


                        <button
                            className="btn btn-light btn-sm"

                            onClick={() =>
                                navigate(
                                    "/recruiter/applications"
                                )
                            }
                        >

                            Applications

                        </button>

                    </div>

                </div>

            </nav>


            {/* ================================================= */}
            {/* MAIN */}
            {/* ================================================= */}

            <div className="container py-5">

                <div className="row justify-content-center">

                    <div className="col-lg-10">


                        <div className="card shadow-sm border-0">

                            <div className="card-body p-4">


                                <h2 className="fw-bold mb-1">

                                    Smart Candidate Matching

                                </h2>


                                <p className="text-muted mb-4">

                                    Find candidates whose skills
                                    best match your job requirements.

                                </p>


                                {/* ================================================= */}
                                {/* JOB SELECTION */}
                                {/* ================================================= */}

                                <div className="row align-items-end">


                                    <div className="col-md-8 mb-3">

                                        <label
                                            className="form-label fw-semibold"
                                        >

                                            Select Job

                                        </label>


                                        <select
                                            className="form-select"

                                            value={
                                                selectedJob
                                            }

                                            onChange={(e) => {

                                                setSelectedJob(
                                                    e.target.value
                                                );

                                                setMessage("");

                                                setError("");

                                                setCandidates([]);

                                                setJobInfo(null);

                                                setRecommendedCount(
                                                    0
                                                );

                                            }}

                                            disabled={
                                                loadingJobs
                                            }
                                        >

                                            <option value="">

                                                {loadingJobs
                                                    ? "Loading jobs..."
                                                    : "Select a job"}

                                            </option>


                                            {jobs.map(
                                                (job) => (

                                                    <option

                                                        key={
                                                            job.id ||
                                                            job._id
                                                        }

                                                        value={
                                                            job.id ||
                                                            job._id
                                                        }

                                                    >

                                                        {
                                                            job.title
                                                        }

                                                        {" - "}

                                                        {
                                                            job.company
                                                        }

                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="col-md-4 mb-3">

                                        <button

                                            className="btn btn-primary w-100"

                                            onClick={
                                                handleSmartMatch
                                            }

                                            disabled={
                                                loadingMatch ||
                                                loadingJobs ||
                                                !selectedJob
                                            }

                                        >

                                            {loadingMatch
                                                ? "Matching..."
                                                : "Find Matching Candidates"}

                                        </button>

                                    </div>

                                </div>


                                {/* ================================================= */}
                                {/* ERROR */}
                                {/* ================================================= */}

                                {error && (

                                    <div className="alert alert-danger mt-3">

                                        {error}

                                    </div>

                                )}


                                {/* ================================================= */}
                                {/* SUCCESS */}
                                {/* ================================================= */}

                                {message && (

                                    <div className="alert alert-success mt-3">

                                        {message}

                                    </div>

                                )}


                                {/* ================================================= */}
                                {/* JOB INFORMATION */}
                                {/* ================================================= */}

                                {jobInfo && (

                                    <div className="alert alert-info mt-4">


                                        <h5 className="fw-bold">

                                            {
                                                jobInfo.title
                                            }

                                        </h5>


                                        <div>

                                            Company:{" "}

                                            {
                                                jobInfo.company
                                            }

                                        </div>


                                        <div className="mt-2">

                                            <strong>
                                                Required Skills:
                                            </strong>

                                            {" "}

                                            {
                                                jobInfo.requiredSkills?.length
                                                    ? jobInfo.requiredSkills.join(
                                                        ", "
                                                    )
                                                    : "None"
                                            }

                                        </div>

                                    </div>

                                )}


                                {/* ================================================= */}
                                {/* SUMMARY */}
                                {/* ================================================= */}

                                {jobInfo && (

                                    <div className="row mt-3">


                                        <div className="col-md-6 mb-3">

                                            <div className="card border-success">

                                                <div className="card-body">

                                                    <h6 className="text-muted">

                                                        Recommended Candidates

                                                    </h6>


                                                    <h2 className="fw-bold text-success">

                                                        {
                                                            recommendedCount
                                                        }

                                                    </h2>


                                                    <small>

                                                        Match score 60% or higher

                                                    </small>

                                                </div>

                                            </div>

                                        </div>


                                        <div className="col-md-6 mb-3">

                                            <div className="card border-primary">

                                                <div className="card-body">

                                                    <h6 className="text-muted">

                                                        Total Candidates

                                                    </h6>


                                                    <h2 className="fw-bold text-primary">

                                                        {
                                                            candidates.length
                                                        }

                                                    </h2>


                                                    <small>

                                                        Candidates analyzed

                                                    </small>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                )}


                                {/* ================================================= */}
                                {/* RANKED CANDIDATES */}
                                {/* ================================================= */}

                                {candidates.length > 0 && (

                                    <div className="mt-4">


                                        <h4 className="fw-bold mb-3">

                                            Ranked Candidates

                                        </h4>


                                        {candidates.map(
                                            (candidate) => (

                                                <div

                                                    key={
                                                        candidate.userId
                                                    }

                                                    className="card mb-3 border"

                                                >

                                                    <div className="card-body">


                                                        <div className="row">


                                                            {/* ================================= */}
                                                            {/* CANDIDATE INFORMATION */}
                                                            {/* ================================= */}

                                                            <div className="col-md-7">


                                                                <h5 className="fw-bold mb-1">

                                                                    #
                                                                    {
                                                                        candidate.rank
                                                                    }

                                                                    {" "}

                                                                    {
                                                                        candidate.candidateName ||
                                                                        "Unknown Candidate"
                                                                    }

                                                                </h5>


                                                                <div className="text-muted">

                                                                    {
                                                                        candidate.email ||
                                                                        "Email not available"
                                                                    }

                                                                </div>


                                                                {candidate.location && (

                                                                    <div className="mt-1">

                                                                        📍{" "}

                                                                        {
                                                                            candidate.location
                                                                        }

                                                                    </div>

                                                                )}


                                                                {candidate.education && (

                                                                    <div className="mt-3">

                                                                        <strong>
                                                                            Education:
                                                                        </strong>

                                                                        {" "}

                                                                        {
                                                                            candidate.education
                                                                        }

                                                                    </div>

                                                                )}


                                                                {candidate.experience && (

                                                                    <div className="mt-2">

                                                                        <strong>
                                                                            Experience:
                                                                        </strong>

                                                                        {" "}

                                                                        {
                                                                            candidate.experience
                                                                        }

                                                                    </div>

                                                                )}

                                                            </div>


                                                            {/* ================================= */}
                                                            {/* MATCH SCORE */}
                                                            {/* ================================= */}

                                                            <div className="col-md-5 text-md-end mt-3 mt-md-0">


                                                                <span

                                                                    className={`badge ${getMatchClass(
                                                                        candidate.matchPercentage
                                                                    )} fs-6`}

                                                                >

                                                                    {
                                                                        candidate.matchPercentage
                                                                    }%

                                                                </span>


                                                                <div className="fw-bold mt-2">

                                                                    {
                                                                        candidate.matchLevel
                                                                    }

                                                                </div>


                                                                {candidate.recommended && (

                                                                    <div className="text-success fw-semibold mt-1">

                                                                        ✓ Recommended Candidate

                                                                    </div>

                                                                )}

                                                            </div>

                                                        </div>


                                                        <hr />


                                                        {/* ================================= */}
                                                        {/* MATCHED / MISSING SKILLS */}
                                                        {/* ================================= */}

                                                        <div className="row">


                                                            <div className="col-md-6">


                                                                <h6 className="fw-bold text-success">

                                                                    Matched Skills

                                                                </h6>


                                                                {candidate.matchedSkills?.length > 0 ? (

                                                                    <div>

                                                                        {candidate.matchedSkills.map(
                                                                            (
                                                                                skill
                                                                            ) => (

                                                                                <span

                                                                                    key={
                                                                                        skill
                                                                                    }

                                                                                    className="badge bg-success me-1 mb-1"

                                                                                >

                                                                                    ✓{" "}

                                                                                    {
                                                                                        skill
                                                                                    }

                                                                                </span>

                                                                            )
                                                                        )}

                                                                    </div>

                                                                ) : (

                                                                    <span className="text-muted">

                                                                        No matching skills

                                                                    </span>

                                                                )}

                                                            </div>


                                                            <div className="col-md-6 mt-3 mt-md-0">


                                                                <h6 className="fw-bold text-danger">

                                                                    Missing Skills

                                                                </h6>


                                                                {candidate.missingSkills?.length > 0 ? (

                                                                    <div>

                                                                        {candidate.missingSkills.map(
                                                                            (
                                                                                skill
                                                                            ) => (

                                                                                <span

                                                                                    key={
                                                                                        skill
                                                                                    }

                                                                                    className="badge bg-danger me-1 mb-1"

                                                                                >

                                                                                    {
                                                                                        skill
                                                                                    }

                                                                                </span>

                                                                            )
                                                                        )}

                                                                    </div>

                                                                ) : (

                                                                    <span className="text-success">

                                                                        ✓ No missing skills

                                                                    </span>

                                                                )}

                                                            </div>

                                                        </div>


                                                        {/* ================================= */}
                                                        {/* CANDIDATE SKILLS */}
                                                        {/* ================================= */}

                                                        <div className="mt-3">


                                                            <h6 className="fw-bold">

                                                                Candidate Skills

                                                            </h6>


                                                            {candidate.skills?.length > 0 ? (

                                                                candidate.skills.map(
                                                                    (
                                                                        skill
                                                                    ) => (

                                                                        <span

                                                                            key={
                                                                                skill
                                                                            }

                                                                            className="badge bg-secondary me-1 mb-1"

                                                                        >

                                                                            {
                                                                                skill
                                                                            }

                                                                        </span>

                                                                    )
                                                                )

                                                            ) : (

                                                                <span className="text-muted">

                                                                    No skills listed

                                                                </span>

                                                            )}

                                                        </div>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}


                                {/* ================================================= */}
                                {/* NO CANDIDATE PROFILES */}
                                {/* ================================================= */}

                                {jobInfo &&
                                    candidates.length === 0 && (

                                        <div className="alert alert-warning mt-4">

                                            No candidate profiles were found.

                                        </div>

                                    )}


                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default SmartMatch;