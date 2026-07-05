import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

/* Icons */
import HomeIcon from "@mui/icons-material/Home";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import InfoIcon from "@mui/icons-material/Info";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PageviewIcon from "@mui/icons-material/Pageview";
import LinkIcon from "@mui/icons-material/Link";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ShieldIcon from "@mui/icons-material/Shield";

// ─── Nav item with tooltip when collapsed ─────────────────────────────────────
function NavItem({ to, icon, label, collapsed, exact }) {
  const [hovered, setHovered] = useState(false);
  const location = useLocation();
  const isActive = exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <div style={{ position: "relative" }}>
      <NavLink
        to={to}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : 12,
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "10px 0" : "10px 16px",
          borderRadius: 12,
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "0.92em",
          letterSpacing: 0.2,
          color: isActive ? "#ffffff" : "#6a88b8",
          background: isActive
            ? "linear-gradient(135deg, rgba(41,121,255,0.25), rgba(0,191,174,0.12))"
            : hovered
              ? "rgba(41,121,255,0.08)"
              : "transparent",
          borderLeft: isActive
            ? "3px solid #2979FF"
            : "3px solid transparent",
          transition: "all 0.18s ease",
          position: "relative",
          overflow: "hidden",
          margin: "1px 8px",
        }}
      >
        {/* Active glow */}
        {isActive && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, rgba(41,121,255,0.1), transparent)",
            pointerEvents: "none",
          }} />
        )}

        <span style={{
          display: "flex", alignItems: "center",
          color: isActive ? "#00d4ff" : hovered ? "#a0c4ff" : "#5a7a95",
          fontSize: "1.15em",
          flexShrink: 0,
          transition: "color 0.18s",
          zIndex: 1,
        }}>
          {icon}
        </span>

        {!collapsed && (
          <span style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            transition: "opacity 0.2s",
            zIndex: 1,
          }}>
            {label}
          </span>
        )}
      </NavLink>

      {/* Tooltip when collapsed */}
      {collapsed && hovered && (
        <div style={{
          position: "absolute",
          left: "calc(100% + 12px)",
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(15,20,35,0.97)",
          border: "1px solid rgba(41,121,255,0.3)",
          borderRadius: 8,
          padding: "6px 12px",
          fontSize: "0.82em",
          fontWeight: 600,
          color: "#e8f4ff",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 9999,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>
          {label}
          {/* Arrow */}
          <div style={{
            position: "absolute",
            left: -5, top: "50%",
            transform: "translateY(-50%)",
            width: 0, height: 0,
            borderTop: "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderRight: "5px solid rgba(41,121,255,0.3)",
          }} />
        </div>
      )}
    </div>
  );
}

// ─── Section divider ──────────────────────────────────────────────────────────
function SectionDivider({ label, collapsed }) {
  if (collapsed) {
    return (
      <div style={{
        height: 1,
        background: "rgba(255,255,255,0.05)",
        margin: "8px 12px",
      }} />
    );
  }
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      margin: "10px 16px 4px",
    }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
      <span style={{
        fontSize: "0.62em", color: "#2a4a65",
        letterSpacing: 1.5, textTransform: "uppercase",
        fontWeight: 700, whiteSpace: "nowrap",
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export function Sidebar({ collapsed, setCollapsed }) {
  const userEmail = localStorage.getItem("userEmail") || "";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    window.dispatchEvent(new Event("storage"));
    window.location.href = "/login";
  };

  return (
    <>
      <style>{`
        @keyframes sidebarFadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .sidebar-pro {
          animation: sidebarFadeIn 0.3s ease;
        }
      `}</style>

      <aside
        className={`sidebar-pro sidebar-ent-pro ${collapsed ? "collapsed" : ""}`}
        style={{
          display: "flex",
          flexDirection: "column",
          background: "rgba(8,12,22,0.97)",
          borderRight: "1px solid rgba(41,121,255,0.1)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
          backdropFilter: "blur(20px)",
          transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
          overflowX: "hidden",
        }}
      >

        {/* ── HEADER ────────────────────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "16px 0" : "16px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          minHeight: 64,
        }}>
          {/* Brand */}
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: "linear-gradient(135deg, #2979FF, #00BFAE)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(41,121,255,0.35)",
              }}>
                <ShieldIcon style={{ color: "#fff", fontSize: "1.1em" }} />
              </div>
              <div>
                <div style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 800, fontSize: "0.95em",
                  color: "#e8f4ff", letterSpacing: 0.3, lineHeight: 1,
                }}>
                  Cyber Sentinel
                </div>
                <div style={{
                  fontSize: "0.6em", color: "#2a4a65",
                  letterSpacing: 1.5, textTransform: "uppercase",
                  marginTop: 2,
                }}>
                  AI Security
                </div>
              </div>
            </div>
          )}

          {/* Collapsed: just the shield */}
          {collapsed && (
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, #2979FF, #00BFAE)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(41,121,255,0.35)",
            }}>
              <ShieldIcon style={{ color: "#fff", fontSize: "1em" }} />
            </div>
          )}

          {/* Toggle button */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 8, color: "#3a5a75",
                cursor: "pointer", padding: "4px 6px",
                display: "flex", alignItems: "center",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(41,121,255,0.12)";
                e.currentTarget.style.color = "#7aa8ff";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = "#3a5a75";
              }}
            >
              <ChevronLeftIcon style={{ fontSize: "1.1em" }} />
            </button>
          )}
        </div>

        {/* ── NAVIGATION ────────────────────────────────────────── */}
        <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto", overflowX: "hidden" }}>

          {/* Main */}
          <SectionDivider label="Main" collapsed={collapsed} />

          <NavItem
            to="/" exact
            icon={<DashboardCustomizeIcon fontSize="small" />}
            label="Dashboard"
            collapsed={collapsed}
          />

          {/* Detection Modules */}
          <SectionDivider label="Detection" collapsed={collapsed} />

          <NavItem
            to="/analyze"
            icon={<PageviewIcon fontSize="small" />}
            label="Analyze Email"
            collapsed={collapsed}
          />
          <NavItem
            to="/url-scan"
            icon={<LinkIcon fontSize="small" />}
            label="Scan URL"
            collapsed={collapsed}
          />
          <NavItem
            to="/file-scan"
            icon={<InsertDriveFileIcon fontSize="small" />}
            label="Scan File"
            collapsed={collapsed}
          />
          <NavItem
            to="/history"
            icon={<PageviewIcon fontSize="small" />}
            label="Scan History"
            collapsed={collapsed}
          />
          {userEmail && (
            <NavItem
              to="/admin"
              icon={<ShieldIcon fontSize="small" />}
              label="Admin Panel"
              collapsed={collapsed}
            />
          )}

          {/* Info */}
          <SectionDivider label="Info" collapsed={collapsed} />

          <NavItem
            to="/about"
            icon={<InfoIcon fontSize="small" />}
            label="About"
            collapsed={collapsed}
          />
          <NavItem
            to="/features"
            icon={<LightbulbIcon fontSize="small" />}
            label="Features"
            collapsed={collapsed}
          />
          <NavItem
            to="/faq"
            icon={<QuestionAnswerIcon fontSize="small" />}
            label="FAQ"
            collapsed={collapsed}
          />
          <NavItem
            to="/contact"
            icon={<ContactMailIcon fontSize="small" />}
            label="Contact"
            collapsed={collapsed}
          />

        </nav>

        {/* ── COLLAPSE BUTTON (when collapsed) ──────────────────── */}
        {collapsed && (
          <div style={{ padding: "8px 0", display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              style={{
                background: "rgba(41,121,255,0.08)",
                border: "1px solid rgba(41,121,255,0.2)",
                borderRadius: 8, color: "#3a5a75",
                cursor: "pointer", padding: "6px 8px",
                display: "flex", alignItems: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(41,121,255,0.16)";
                e.currentTarget.style.color = "#7aa8ff";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(41,121,255,0.08)";
                e.currentTarget.style.color = "#3a5a75";
              }}
            >
              <ChevronRightIcon style={{ fontSize: "1.1em" }} />
            </button>
          </div>
        )}

        {/* ── LOGOUT ────────────────────────────────────────────── */}
        <div style={{
          padding: collapsed ? "12px 0" : "12px 10px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          justifyContent: collapsed ? "center" : "stretch",
        }}>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: 10,
              width: collapsed ? 40 : "100%",
              height: collapsed ? 40 : "auto",
              padding: collapsed ? 0 : "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,76,76,0.15)",
              background: "rgba(255,76,76,0.06)",
              color: "#7a4a4a",
              fontWeight: 600,
              fontSize: "0.88em",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255,76,76,0.14)";
              e.currentTarget.style.borderColor = "rgba(255,76,76,0.35)";
              e.currentTarget.style.color = "#ff7a7a";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,76,76,0.06)";
              e.currentTarget.style.borderColor = "rgba(255,76,76,0.15)";
              e.currentTarget.style.color = "#7a4a4a";
            }}
          >
            <LogoutIcon style={{ fontSize: "1em", flexShrink: 0 }} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

      </aside>
    </>
  );
}

export default Sidebar;
