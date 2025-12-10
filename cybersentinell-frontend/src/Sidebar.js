import React from "react";
import { NavLink } from "react-router-dom";

/* Icons */
import HomeIcon from "@mui/icons-material/Home";                 // HEADER toggle button
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize"; // NEW dashboard icon
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import InfoIcon from "@mui/icons-material/Info";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PageviewIcon from "@mui/icons-material/Pageview";
import LogoutIcon from "@mui/icons-material/Logout";

export function Sidebar({ collapsed, setCollapsed }) {

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");

    window.dispatchEvent(new Event("storage"));
    window.location.href = "/login";
  };

  return (
    <aside className={`sidebar-pro sidebar-ent-pro ${collapsed ? "collapsed" : ""}`}>

      {/* HEADER */}
      <div className="sidebar-header-ent">

        {/* HOME ICON = TOGGLE BUTTON */}
        <div
          className="sidebar-logo-circle toggle-home-btn"
          onClick={() => setCollapsed(!collapsed)}
          style={{ cursor: "pointer" }}
        >
          <HomeIcon fontSize="small" />
        </div>

        {!collapsed && (
          <div className="sidebar-brand-text">
            <span className="brand-title">Cyber Sentinel</span>
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav-pro">

        <NavLink
          to="/"
          className={({ isActive }) =>
            "sidebar-nav-item-pro" + (isActive ? " active" : "")
          }
        >
          <DashboardCustomizeIcon />
          {!collapsed && "Dashboard"}
        </NavLink>

        <NavLink to="/about" className={({ isActive }) =>
          "sidebar-nav-item-pro" + (isActive ? " active" : "")
        }>
          <InfoIcon /> {!collapsed && "About"}
        </NavLink>

        <NavLink to="/features" className={({ isActive }) =>
          "sidebar-nav-item-pro" + (isActive ? " active" : "")
        }>
          <LightbulbIcon /> {!collapsed && "Features"}
        </NavLink>

        <NavLink to="/faq" className={({ isActive }) =>
          "sidebar-nav-item-pro" + (isActive ? " active" : "")
        }>
          <QuestionAnswerIcon /> {!collapsed && "FAQ"}
        </NavLink>

        <NavLink to="/contact" className={({ isActive }) =>
          "sidebar-nav-item-pro" + (isActive ? " active" : "")
        }>
          <ContactMailIcon /> {!collapsed && "Contact"}
        </NavLink>

        <NavLink to="/analyze" className={({ isActive }) =>
          "sidebar-nav-item-pro" + (isActive ? " active" : "")
        }>
          <PageviewIcon /> {!collapsed && "Analyze Email"}
        </NavLink>

      </nav>

      {/* LOGOUT */}
      <div className="sidebar-logout-wrapper">
        <button className="logout-btn-pro" onClick={handleLogout}>
          <LogoutIcon />
          {!collapsed && <span style={{ marginLeft: "10px" }}>Logout</span>}
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;
