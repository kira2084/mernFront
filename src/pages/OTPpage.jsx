import React, { useState } from "react";
import "./LoginPage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
function OtpPage() {
  const [otp, setOtp] = useState("");
  const { state } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleVerifyOTP = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        "https://mernback-2-x047.onrender.com/api/v1/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: state.resetEmail, otp }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        navigate("/reset-password");
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
            fontWeight: 700,
            lineHeight: "56px",
          }}
        >
          Enter Your OTP
        </h2>
        <p className="subtitle" style={{ color: "#667085" }}>
          We've sent a 6-digit OTP to your <br /> registered mail.
          <br />
          Please enter it below to sign in.
        </p>

        <label style={{ color: "#0C1421", fontWeight: 200 }}>OTP</label>
        <input
          type="text"
          placeholder="xxxx05"
          style={{ backgroundColor: "#f7fbff" }}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          className="signin-btn"
          style={{ marginTop: "30px" }}
          onClick={handleVerifyOTP}
          disabled={loading}
        >
          Confirm
        </button>
      </div>
      <div className="welcome-section">
        <div className="illustration">
          <img src="/otpimg.png" alt="Dashboard illustration" />
        </div>
      </div>
    </div>
  );
}

export default OtpPage;
