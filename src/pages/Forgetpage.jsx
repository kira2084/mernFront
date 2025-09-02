import React, { useState } from "react";
import "./LoginPage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
function ForgotPage() {
  const [email, setEmail] = useState("");
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleSendOTP = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        "https://mernback-2-x047.onrender.com/api/v1/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        dispatch({ type: "SET_RESET_EMAIL", payload: email });
        navigate("/otp");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container">
      <div className="login-section">
        <h2
          style={{
            color: "#2B2F38",
            fontFamily: "sans-serif",
            fontWeight: 400,
            lineHeight: "56px",
          }}
        >
          Company name
        </h2>
        <p className="subtitle" style={{ color: "#667085" }}>
          Please enter your registered email ID to <br /> receive an OTP
        </p>

        <label style={{ color: "#0C1421" }}>E-mail</label>
        <input
          type="email"
          placeholder="Example@email.com"
          style={{ backgroundColor: "#f7fbff" }}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          className="signin-btn"
          style={{ marginTop: "30px" }}
          onClick={handleSendOTP}
          disabled={loading}
        >
          Send Mail
        </button>
      </div>
      <div className="welcome-section">
        <div className="illustration">
          <img src="/forget.png" alt="Dashboard illustration" />
        </div>
      </div>
    </div>
  );
}

export default ForgotPage;
