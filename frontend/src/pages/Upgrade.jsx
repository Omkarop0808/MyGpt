import React, { useContext, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MyContext } from "../MyContext";
import { apiRequest } from "../lib/api";
import { FiCheck } from "react-icons/fi";
import { ScaleLoader } from "react-spinners";
import "./Upgrade.css";

const Upgrade = () => {
  const { user, setUser, token } = useContext(MyContext);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);

  // Handle payment verification on return
  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");
    const canceled = searchParams.get("canceled");

    if (success === "true" && sessionId && !verifying) {
      verifyPayment(sessionId);
    } else if (canceled) {
      // Clean up URL
      navigate("/upgrade", { replace: true });
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId) => {
    try {
      setVerifying(true);
      const data = await apiRequest("/api/payment/verify-payment", {
        method: "POST",
        body: { sessionId },
        token
      });

      if (data.success) {
        // Update local user state
        setUser((prev) => ({ ...prev, subscriptionPlan: "pro" }));
        alert("Upgrade successful! You are now on the Pro plan.");
      }
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Failed to verify payment status. Please contact support.");
    } finally {
      setVerifying(false);
      // Clean URL
      navigate("/upgrade", { replace: true });
    }
  };

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/payment/create-checkout-session", {
        method: "POST",
        token
      });

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Failed to start checkout:", err);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isPro = user?.subscriptionPlan === "pro";

  if (verifying) {
    return (
      <div className="upgrade-container">
        <ScaleLoader color="#10a37f" />
        <p style={{ marginTop: "1rem" }}>Verifying your payment...</p>
      </div>
    );
  }

  return (
    <div className="upgrade-container">
      <h1 className="upgrade-title">Upgrade your plan</h1>
      <p className="upgrade-subtitle">Unlock the full power of AI with our Pro plan.</p>

      <div className="plan-grid">
        {/* Free Plan */}
        <div className={`plan-card ${!isPro ? "active" : ""}`}>
          {!isPro && <div className="current-badge">Current Plan</div>}
          <div className="plan-header">
            <h3>Free Plan</h3>
            <div className="plan-price">
              $0 <span>/mo</span>
            </div>
            {/* Indian Rupee fallback not strictly needed if showing USD, but per user request "any currency" */}
          </div>
          <ul className="plan-features">
            <li><FiCheck className="check-icon" /> Access to standard model</li>
            <li><FiCheck className="check-icon" /> Standard response speed</li>
            <li><FiCheck className="check-icon" /> Regular updates</li>
          </ul>
          <button className="upgrade-btn" disabled={!isPro}>
            {!isPro ? "Your Current Plan" : "Downgrade"}
          </button>
        </div>

        {/* Pro Plan */}
        <div className={`plan-card ${isPro ? "active" : ""}`}>
          {isPro && <div className="current-badge">Current Plan</div>}
          <div className="plan-header">
            <h3>Pro Plan</h3>
            <div className="plan-price">
              $10 <span>/mo</span>
            </div>
          </div>
          <ul className="plan-features">
            <li><FiCheck className="check-icon" /> Access to advanced AI models</li>
            <li><FiCheck className="check-icon" /> Faster response times</li>
            <li><FiCheck className="check-icon" /> 24/7 Priority Support</li>
            <li><FiCheck className="check-icon" /> Early access to new features</li>
          </ul>
          <button 
            className="upgrade-btn" 
            onClick={handleUpgrade}
            disabled={isPro || loading}
          >
            {loading ? "Processing..." : isPro ? "Active Plan" : "Upgrade to Pro"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
