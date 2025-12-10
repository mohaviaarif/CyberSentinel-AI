// src/signuppage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SecurityIcon from "@mui/icons-material/Security";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Simple password strength logic
  const getPasswordStrength = (pw) => {
    if (!pw) return { label: "", level: "" };

    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 2) return { label: "Weak", level: "weak" };
    if (score === 3 || score === 4) return { label: "Medium", level: "medium" };
    return { label: "Strong", level: "strong" };
  };

  const { label: pwLabel, level: pwLevel } = getPasswordStrength(form.password);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Signup failed.");
      } else {
        setSuccessMsg("Signup successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      console.error(err);
      setError("Cannot connect to server.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page-pro">
      {/* Branding section – same style as login */}
      <div className="auth-brand-box">
        <SecurityIcon style={{ fontSize: "3rem", color: "#2979FF" }} />
        <h1 className="main-title-pro">Create your account</h1>
        <p className="auth-subtitle">
          Get started with Cyber Sentinel in a few seconds.
        </p>
      </div>

      {/* Card */}
      <form className="auth-form-pro" onSubmit={handleSignup}>
        {error && <div className="auth-error animate-pop">{error}</div>}
        {successMsg && (
          <div className="auth-success animate-pop">{successMsg}</div>
        )}

        {/* Email */}
        <div className="auth-field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div className="auth-field password-field">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPw ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
            />
            <span
              className="password-toggle"
              onClick={() => setShowPw((v) => !v)}
            >
              {showPw ? (
                <VisibilityOffIcon style={{ fontSize: "1.2rem" }} />
              ) : (
                <VisibilityIcon style={{ fontSize: "1.2rem" }} />
              )}
            </span>
          </div>

          {/* Password strength */}
          {pwLabel && (
            <div className={`pw-strength pw-${pwLevel}`}>
              Password strength: <span>{pwLabel}</span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="auth-field password-field">
          <label>Confirm Password</label>
          <div className="password-wrapper">
            <input
              type={showPw2 ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
            />
            <span
              className="password-toggle"
              onClick={() => setShowPw2((v) => !v)}
            >
              {showPw2 ? (
                <VisibilityOffIcon style={{ fontSize: "1.2rem" }} />
              ) : (
                <VisibilityIcon style={{ fontSize: "1.2rem" }} />
              )}
            </span>
          </div>
        </div>

        <button className="auth-btn" disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>

      <p className="auth-footer-text">
        Already have an account?{" "}
        <Link to="/login" className="auth-link">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default SignupPage;
