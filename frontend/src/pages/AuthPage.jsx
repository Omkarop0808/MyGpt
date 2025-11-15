import { useContext, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { MyContext } from "../MyContext";
import { apiRequest, getApiBaseUrl } from "../lib/api";
import "./AuthPage.css";

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

  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  // If user is already authenticated, redirect
  if (user && token) {
    return <Navigate to={redirectPath} replace />;
  }

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (isSignup) {
      if (!formData.name.trim()) {
        errors.name = "Name is required";
      } else if (formData.name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters";
      } else if (formData.name.trim().length > 60) {
        errors.name = "Name cannot exceed 60 characters";
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address";
      }
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (isSignup) {
      if (!/[A-Z]/.test(formData.password)) {
        errors.password = "Password must contain an uppercase letter";
      } else if (!/[a-z]/.test(formData.password)) {
        errors.password = "Password must contain a lowercase letter";
      } else if (!/[0-9]/.test(formData.password)) {
        errors.password = "Password must contain a number";
      }
    }

    return errors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("");
      return;
    }

    setFieldErrors({});
    setError("");
    setLoading(true);

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

      if (!profile || !authToken) {
        throw new Error("Invalid response from server");
      }

      setUser(profile);
      setToken(authToken);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const errorMessage = err.message || "Something went wrong. Please try again.";
      setError(errorMessage);
      console.error(`${isSignup ? "Signup" : "Login"} error:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <h1>MYGPT</h1>
          <p>Your personal AI workspace. Crafted for clarity, privacy, and speed.</p>
          <div className="auth-meta">
            <span>API base: {apiBaseUrl.replace("https://", "").replace("http://", "")}</span>
            <span>Encryption: bcrypt + JWT</span>
          </div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-card-header">
          <h2>{isSignup ? "Create your account" : "Welcome back"}</h2>
          <p>
            {isSignup
              ? "Join the workspace to start your smart conversations."
              : "Sign in to resume your conversations and threads."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isSignup && (
            <label className="auth-field">
              <span>Name</span>
              <input
                name="name"
                type="text"
                placeholder="Ada Lovelace"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
                minLength={2}
                maxLength={60}
                disabled={loading}
                className={fieldErrors.name ? "error" : ""}
              />
              {fieldErrors.name && (
                <span className="auth-field-error">{fieldErrors.name}</span>
              )}
            </label>
          )}

          <label className="auth-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              disabled={loading}
              className={fieldErrors.email ? "error" : ""}
            />
            {fieldErrors.email && (
              <span className="auth-field-error">{fieldErrors.email}</span>
            )}
          </label>

          <label className="auth-field">
            <div className="auth-field-label">
              <span>Password</span>
              <Link to={isSignup ? "/login" : "/signup"}>
                {isSignup ? "Already have an account?" : "Need an account?"}
              </Link>
            </div>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={8}
              disabled={loading}
              className={fieldErrors.password ? "error" : ""}
            />
            {fieldErrors.password && (
              <span className="auth-field-error">{fieldErrors.password}</span>
            )}
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Processing…" : isSignup ? "Sign up" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;

