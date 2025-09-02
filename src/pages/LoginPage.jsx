import React, { useState } from "react";
import "./LoginPage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);

    if (!email || !password) {
      alert("Email or  password Missing");
      return;
    }
    try {
      const res = await fetch(
        "https://mernback-2-x047.onrender.com/api/v1/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        dispatch({
          type: "LOGIN",
          payload: { user: data.user, token: data.token },
        }); // save user
        navigate("/"); // go to home
      } else {
        alert("Entered Wrong Password");
      }
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container">
      <div className="login-section">
        <h2 style={{ color: "#2B2F38" }}>Log in to your account</h2>
        <p className="subtitle" style={{ color: "#667085" }}>
          Welcome back! Please enter your details.
        </p>

        <label style={{ color: "#0C1421" }}>Email</label>
        <input
          type="email"
          placeholder="Example@email.com"
          style={{ backgroundColor: "#f7fbff" }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label style={{ color: "#0C1421" }}>Password</label>
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="at least 8 characters"
            className="password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <div className="forgot">
          <Link to="/forget"> Forgot Password?</Link>
        </div>

        <button className="signin-btn" disabled={loading} onClick={handleLogin}>
          Sign in
        </button>

        <p className="signup-text">
          Don’t have an account?
          <Link to="/signup"> Sign up</Link>
        </p>
      </div>
      <div className="welcome-section">
        <div className="welcome-top">
          <h1>
            Welcome to <br /> Company Name
          </h1>
          <img className="brand-icon" src="/icon.png" alt="Brand icon" />
        </div>

        <div className="illustration">
          <img src="/loginpage.png" alt="Dashboard illustration" />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
