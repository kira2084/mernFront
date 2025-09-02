import React, { useState } from "react";
import "./LoginPage.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
function NewPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [confirmshowPassword, setConfirmShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { state } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleResetPassword = async () => {
    if (loading) return;
    setLoading(true);
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    try {
      const res = await fetch(
        "https://mernback-2-x047.onrender.com/api/v1/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: state.resetEmail,
            newPassword,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Password reset successful! Please login again.");
        navigate("/login");
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
        <h2 style={{ color: "#2B2F38" }}>Create New Password</h2>
        <p
          className="subtitle"
          style={{ color: "#667085", lineHeight: "30px" }}
        >
          Today is a new day. it's your day. You shape it.
          <br />
          Sign in to start managing your projects.
        </p>

        <label style={{ color: "#0C1421", fontWeight: 200 }}>
          Enter New Passowrd
        </label>
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="at least 8 characters"
            className="password-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ backgroundColor: "#f7fbff", color: "#8897ad" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="toggle-btn"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <label style={{ color: "#0C1421", fontWeight: 200 }}>
          Confirm Password
        </label>
        <div className="password-container">
          <input
            type={confirmshowPassword ? "text" : "password"}
            placeholder="at least 8 characters"
            className="password-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ backgroundColor: "#f7fbff", color: "#8897ad" }}
          />
          <button
            type="button"
            onClick={() => setConfirmShowPassword((prev) => !prev)}
            className="toggle-btn"
          >
            {confirmshowPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div className="forgot">
          <a href="#">Forgot Password?</a>
        </div>

        <button
          className="signin-btn"
          disabled={loading}
          onClick={handleResetPassword}
        >
          Reset Password
        </button>
      </div>
      <div className="welcome-section">
        <div className="illustration">
          <img src="/newimg.png" alt="Dashboard illustration" />
        </div>
      </div>
    </div>
  );
}

export default NewPage;
