import React, { useState } from "react";
import "./LoginPage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
function Signup() {
  const navigation = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setconfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (password !== confirmpassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const res = await fetch(
        "https://mernback-2-x047.onrender.com/api/v1/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("Signup successful");
        navigation("/login");
      } else {
        setMessage(data.message || "Signup failed");
      }
    } catch (err) {
      setMessage("Error connecting to server");
    }
  };
  return (
    <div className="container">
      <div className="login-section">
        <h2 style={{ color: "#2B2F38" }}>Create an account</h2>
        <p className="subtitle" style={{ color: "#667085" }}>
          Start inventory management.
        </p>

        <label style={{ color: "#0C1421" }}>Name</label>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ backgroundColor: "#f7fbff" }}
          required
        />

        <label style={{ color: "#0C1421" }}>Email</label>
        <input
          type="email"
          placeholder="Example@email.com"
          style={{ backgroundColor: "#f7fbff" }}
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
        />
        <label style={{ color: "#0C1421" }}>Create Password</label>
        <input
          type="password"
          placeholder="at least 8 characters"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
          style={{ backgroundColor: "#f7fbff", color: "#8897ad" }}
        />
        <label style={{ color: "#0C1421" }}>Confirm Password</label>
        <input
          type="password"
          placeholder="at least 8 characters"
          onChange={(e) => setconfirmPassword(e.target.value)}
          value={confirmpassword}
          required
          style={{ backgroundColor: "#f7fbff", color: "#8897ad" }}
        />

        <button
          type="submit"
          onClick={handleSubmit}
          className="signin-btn"
          style={{ marginTop: "30px" }}
        >
          Sign in
        </button>
        {message && <p>{message}</p>}
        <p className="signup-text">
          Do you have an account?<Link to="/login"> Sign in</Link>
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
          <img src="./loginpage.png" alt="Dashboard illustration" />
        </div>
      </div>
    </div>
  );
}

export default Signup;
