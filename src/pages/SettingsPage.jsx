import React, { useEffect, useState } from "react";
import "./setting.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SettingsPage = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile"); // profile | account
  const [user, setUser] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    verified: false,
    password: "********",
    confirmPassword: "********",
  });

  // 🔹 Fetch user details
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser._id) return;

    fetch(`https://mernback-2-x047.onrender.com/api/v1/${storedUser._id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => {
        const [firstName, ...rest] = data.name.split(" ");
        const lastName = rest.join(" ");

        setUser((prev) => ({
          ...prev,
          _id: data._id,
          firstName,
          lastName,
          email: data.email,
          verified: true,
        }));
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  // 🔹 Save profile (only first & last name editable)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `https://mernback-2-x047.onrender.com/api/v1/${user._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: `${user.firstName} ${user.lastName}`,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to save user");
      const updated = await res.json();

      // 🔹 Update localStorage

      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, name: updated.name })
      );

      alert("Profile saved successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  // 🔹 Logout
  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <div className="main-content">
      <div className="title-set">
        <h3 style={{ color: "#fff", marginTop: "0", marginBottom: "9px" }}>
          Settings
        </h3>
        <hr className="styled-hrp"></hr>
      </div>
      <div className="settings-page">
        <button className="close-btn" onClick={() => navigate("/")}>
          ✕
        </button>
        <div className="settings-form-container">
          {/* Tabs */}
          <div className="tabs">
            <div
              className={`tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              Edit Profile
            </div>
            <div
              className={`tab ${activeTab === "account" ? "active" : ""}`}
              onClick={() => setActiveTab("account")}
            >
              Account Management
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "profile" && (
            <form className="settings-form" onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="firstName">First name</label>
                <input
                  type="text"
                  id="firstName"
                  value={user.firstName}
                  onChange={(e) =>
                    setUser((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last name</label>
                <input
                  type="text"
                  id="lastName"
                  value={user.lastName}
                  onChange={(e) =>
                    setUser((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" value={user.email} readOnly />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={"**********"}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={"**********"}
                  readOnly
                />
              </div>

              <button
                type="submit"
                className="save-button"
                onClick={(e) => handleSave(e)}
              >
                Save
              </button>
            </form>
          )}

          {activeTab === "account" && (
            <div className="account-management">
              <div className="account-info">
                <p>Identity Verification</p>
                <p style={{ marginTop: "15px" }}>
                  <span
                    style={{ color: user.verified ? "#333333" : "#333333" }}
                  >
                    {user.verified ? "Verified" : "Not Verified"}
                  </span>
                </p>
              </div>
              <p>Add Accounts</p>
              <div style={{ display: "flex", gap: "20px" }}>
                <input type="radio" name="account" id="acc1" />
                <p>Account01_gmail.com</p>
              </div>
              <div style={{ display: "flex", gap: "20px" }}>
                <input type="radio" name="account" id="acc2" />
                <p>Account02_gmail.com</p>
              </div>
              <div className="btn">
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
