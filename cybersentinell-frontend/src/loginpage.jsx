// src/loginpage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import ShieldIcon from "@mui/icons-material/Security"; 
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  // 🚀 Auto-redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Login failed.");
      } else {
        // Save login session
        localStorage.setItem("authToken", data.token || "dummy-token");
        localStorage.setItem("userEmail", data.email || form.email);
        localStorage.setItem("isLoggedIn", "true");

        // Remember email
        if (rememberMe) {
          localStorage.setItem("rememberEmail", form.email);
        } else {
          localStorage.removeItem("rememberEmail");
        }

        // 🔥 Trigger sidebar + app to re-render instantly
        window.dispatchEvent(new Event("loginStateChanged"));

        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("Cannot connect to server.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page-pro">

      {/* BRAND LOGO + TITLE */}
      <div className="auth-brand-box">
        <ShieldIcon style={{ fontSize: "3rem", color: "#2979FF" }} />
        <h1 className="main-title-pro">Welcome back</h1>
        <p className="auth-subtitle">
          Log in to access the Cyber Sentinel dashboard and email analyzer.
        </p>
      </div>

      {/* FORM */}
      <form className="auth-form-pro" onSubmit={handleLogin}>
        {error && <div className="auth-error">{error}</div>}

        {/* EMAIL */}
        <div className="auth-field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* PASSWORD */}
        <div className="auth-field">
          <label>Password</label>

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />

            <span
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <VisibilityOffIcon style={{ fontSize: "1.2rem" }} />
              ) : (
                <VisibilityIcon style={{ fontSize: "1.2rem" }} />
              )}
            </span>
          </div>
        </div>

        {/* OPTIONS */}
        <div className="auth-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe((p) => !p)}
            />
            Remember me
          </label>

          <Link to="#" className="forgot-link">
            Forgot Password?
          </Link>
        </div>

        {/* SUBMIT BUTTON */}
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      {/* SIGNUP LINK */}
      <p className="auth-footer-text">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="auth-link">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
