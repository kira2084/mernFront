import { Link, Outlet, useLocation } from "react-router-dom";
import "./Layout.css";
import { GoHome } from "react-icons/go";
import { FaInbox } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";

const Layout = () => {
  const location = useLocation();
  const username = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      <div className="app-layout">
        <aside className="sidebar">
          <img src="/icon.png" alt="" className="logoo" />{" "}
          <hr className="styled-hrs" />
          <nav>
            <ul>
              <li className={location.pathname === "/" ? "active" : ""}>
                <Link to="/">
                  <GoHome /> Home
                </Link>
              </li>
              <li className={location.pathname === "/products" ? "active" : ""}>
                <Link to="/products">
                  <FaInbox /> Product
                </Link>
              </li>
              <li className={location.pathname === "/invoice" ? "active" : ""}>
                <Link to="/invoice">
                  <img src="/invoice.png" alt="" /> Invoice
                </Link>
              </li>
              <li
                className={location.pathname === "/statistics" ? "active" : ""}
              >
                <Link to="/statistics">
                  <img src="/stat.png" alt="" /> Statistics
                </Link>
              </li>
              <li className={location.pathname === "/settings" ? "active" : ""}>
                <Link to="/settings">
                  <CiSettings /> Setting
                </Link>
              </li>
            </ul>
          </nav>
          <hr className="styled-hr" />
          <div className="profile-section">
            <img src="/profile.png" alt="Profile" className="profile-img" />
            <span>{username.name}</span>
          </div>
        </aside>

        {/* Main Content */}

        <main className="main-content">
          <div className="mobile-icon">
            <div className="icn">
              <img src="/icon.png" alt="" className="icn" />
            </div>
            <div className="setting">
              <Link
                to="/settings"
                className={location.pathname === "/settings" ? "active" : ""}
              >
                <img src="/logosetting.png" alt="" />
              </Link>
            </div>
          </div>
          <Outlet />
        </main>

        {/* Bottom Navigation (Mobile only) */}
        <nav className="bottom-nav">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            <GoHome />
          </Link>
          <Link
            to="/products"
            className={location.pathname === "/products" ? "active" : ""}
          >
            <FaInbox />
          </Link>
          <Link
            to="/invoice"
            className={location.pathname === "/invoice" ? "active" : ""}
          >
            <img src="/invoice.png" alt="" />
          </Link>
          <Link
            to="/statistics"
            className={location.pathname === "/statistics" ? "active" : ""}
          >
            <img src="/stat.png" alt="" />
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Layout;
