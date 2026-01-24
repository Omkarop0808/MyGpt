import { useContext, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { MyContext } from "../MyContext";
import { apiRequest } from "../lib/api";
import "./AuthPage.css";
import { FiArrowRight, FiCheck, FiAlertCircle } from "react-icons/fi";

const AuthPage = ({ mode = "login" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, setUser, setToken } = useContext(MyContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const isSignup = mode === "signup";
  const redirectPath = location.state?.from?.pathname || "/";

  // Clear errors when switching modes
  useEffect(() => {
    setError("");
    setFieldErrors({});
    setFormData({ name: "", email: "", password: "" });
  }, [mode]);

  // If user is already authenticated, redirect
  if (user && token) {
    return <Navigate to={redirectPath} replace />;
  }

  const validateForm = () => {
    const errors = {};

    if (isSignup) {
      if (!formData.name.trim()) errors.name = "Name is required";
      else if (formData.name.length < 2) errors.name = "Name too short";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "At least 8 characters";
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const payload = isSignup
        ? {
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
          }
        : {
            email: formData.email.trim(),
            password: formData.password,
          };

      const { user: profile, token: authToken } = await apiRequest(endpoint, {
        method: "POST",
        body: payload,
      });

      setUser(profile);
      setToken(authToken);
      
      // Force reload to ensure all state and context is fresh
      window.location.href = redirectPath;
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-overlay"></div>
      
      <div className="auth-box">
        <div className="auth-header">
          <div className="logo-badge">AI</div>
          <h1>{isSignup ? "Create Account" : "Welcome Back"}</h1>
          <p className="auth-subtitle">
            {isSignup 
              ? "Join the intelligent workspace." 
              : "Sign in to continue your sessions."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <div className={`input-group ${fieldErrors.name ? "error" : ""}`}>
              <label>Full Name</label>
              <input
                name="name"
                type="text"
                placeholder="Ada Lovelace"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
              {fieldErrors.name && <span className="error-text">{fieldErrors.name}</span>}
            </div>
          )}

          <div className={`input-group ${fieldErrors.email ? "error" : ""}`}>
            <label>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
          </div>

          <div className={`input-group ${fieldErrors.password ? "error" : ""}`}>
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            {fieldErrors.password && <span className="error-text">{fieldErrors.password}</span>}
          </div>

          {error && (
            <div className="auth-error-banner">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <div className="spinner" /> : (
              <>
                {isSignup ? "Sign Up" : "Sign In"}
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link to={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

