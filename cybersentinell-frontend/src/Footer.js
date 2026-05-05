import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import ShieldIcon from "@mui/icons-material/Shield";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

// ─── Social icon button ───────────────────────────────────────────────────────
function SocialBtn({ href, icon, label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 34, height: 34, borderRadius: 8,
        background: hovered ? "rgba(41,121,255,0.15)" : "rgba(255,255,255,0.04)",
        border: hovered
          ? "1px solid rgba(41,121,255,0.4)"
          : "1px solid rgba(255,255,255,0.07)",
        color: hovered ? "#7aa8ff" : "#3a5a75",
        textDecoration: "none",
        transition: "all 0.2s ease",
        fontSize: "0.95em",
      }}
    >
      {icon}
    </a>
  );
}

// ─── Footer nav link ──────────────────────────────────────────────────────────
function FooterLink({ to, label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <NavLink
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        color: isActive ? "#00BFAE" : hovered ? "#a0c4ff" : "#3a5a75",
        textDecoration: "none",
        fontSize: "0.85em",
        fontWeight: 500,
        letterSpacing: 0.3,
        transition: "color 0.18s",
        borderBottom: isActive ? "1px solid rgba(0,191,174,0.4)" : "1px solid transparent",
        paddingBottom: 1,
      })}
    >
      {label}
    </NavLink>
  );
}

// ─── Status dot ──────────────────────────────────────────────────────────────
function StatusDot() {
  return (
    <span style={{
      display: "inline-block",
      width: 7, height: 7, borderRadius: "50%",
      background: "#00E5A0",
      marginRight: 6,
      boxShadow: "0 0 0 0 rgba(0,229,160,0.7)",
      animation: "footerPulse 2s ease-out infinite",
      verticalAlign: "middle",
    }} />
  );
}

// ─── Main Footer ─────────────────────────────────────────────────────────────
function Footer() {
  return (
    <>
      <style>{`
        @keyframes footerPulse {
          0%   { box-shadow: 0 0 0 0 rgba(0,229,160,0.6); }
          70%  { box-shadow: 0 0 0 6px rgba(0,229,160,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,229,160,0); }
        }
      `}</style>

      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(6,10,18,0.95)",
        backdropFilter: "blur(12px)",
        padding: "0",
        marginTop: "auto",
        position: "relative",
        zIndex: 1,
      }}>

        {/* ── Top accent line ───────────────────────────────────── */}
        <div style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(41,121,255,0.4), rgba(0,191,174,0.4), transparent)",
        }} />

        {/* ── Main content ──────────────────────────────────────── */}
        <div style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "28px 28px 20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}>

          {/* ── Brand column ────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 180 }}>

            {/* Logo + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: "linear-gradient(135deg, #2979FF, #00BFAE)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 3px 10px rgba(41,121,255,0.3)",
                flexShrink: 0,
              }}>
                <ShieldIcon style={{ color: "#fff", fontSize: "0.9em" }} />
              </div>
              <div>
                <div style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 800, fontSize: "0.92em",
                  color: "#e8f4ff", letterSpacing: 0.3, lineHeight: 1,
                }}>
                  Cyber Sentinel
                </div>
                <div style={{
                  fontSize: "0.58em", color: "#2a4a65",
                  letterSpacing: 1.5, textTransform: "uppercase",
                  marginTop: 2,
                }}>
                  AI Security Platform
                </div>
              </div>
            </div>

            {/* Tagline */}
            <p style={{
              margin: 0, fontSize: "0.78em",
              color: "#2a4a65", lineHeight: 1.6,
              maxWidth: 200,
            }}>
              AI-powered cybersecurity for phishing, URLs, and malware detection.
            </p>

            {/* Status */}
            <div style={{
              display: "inline-flex", alignItems: "center",
              background: "rgba(0,229,160,0.06)",
              border: "1px solid rgba(0,229,160,0.15)",
              borderRadius: 100, padding: "4px 10px",
              fontSize: "0.72em", color: "#4aaa88",
              fontWeight: 600, width: "fit-content",
            }}>
              <StatusDot />
              All Systems Operational
            </div>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
              <SocialBtn href="#" icon={<FaGithub />} label="GitHub" />
              <SocialBtn href="#" icon={<FaTwitter />} label="Twitter" />
              <SocialBtn href="#" icon={<FaLinkedin />} label="LinkedIn" />
            </div>
          </div>

          {/* ── Navigation columns ──────────────────────────────── */}
          <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>

            {/* Modules */}
            <div>
              <div style={{
                fontSize: "0.65em", color: "#1a3a55",
                letterSpacing: 1.8, textTransform: "uppercase",
                fontWeight: 700, marginBottom: 12,
              }}>
                Modules
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <FooterLink to="/analyze"   label="Analyze Email" />
                <FooterLink to="/url-scan"  label="Scan URL" />
                <FooterLink to="/file-scan" label="Scan File" />
              </div>
            </div>

            {/* Info */}
            <div>
              <div style={{
                fontSize: "0.65em", color: "#1a3a55",
                letterSpacing: 1.8, textTransform: "uppercase",
                fontWeight: 700, marginBottom: 12,
              }}>
                Info
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <FooterLink to="/"         label="Dashboard" />
                <FooterLink to="/about"    label="About" />
                <FooterLink to="/features" label="Features" />
                <FooterLink to="/faq"      label="FAQ" />
                <FooterLink to="/contact"  label="Contact" />
              </div>
            </div>

            {/* Project info */}
            <div style={{ maxWidth: 200 }}>
              <div style={{
                fontSize: "0.65em", color: "#1a3a55",
                letterSpacing: 1.8, textTransform: "uppercase",
                fontWeight: 700, marginBottom: 12,
              }}>
                Project
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["Institution", "COMSATS University"],
                  ["Campus",      "Abbottabad"],
                  ["Team",   "Mohavia Arif (084)"],
                  ["",       "Anas Bashir (081)"],
                  ["",       "A. Samad Paracha (056)"],
                  ["Supervisor",  "Mr. Mazhar Ali"],
                  ["Year",        "2026"],
                ].map(([key, val]) => (
                  <div key={key} style={{ display: "flex", gap: 6, fontSize: "0.78em" }}>
                    <span style={{ color: "#1a3a55", fontWeight: 600, minWidth: 70 }}>{key}</span>
                    <span style={{ color: "#2a4a65" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────── */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          padding: "12px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          maxWidth: 1000,
          margin: "0 auto",
        }}>
          <span style={{ fontSize: "0.75em", color: "#1a3a55" }}>
            © {new Date().getFullYear()} CyberSentinel AI — Final Year Project, COMSATS Abbottabad
          </span>

          <div style={{ display: "flex", gap: 16 }}>
            {[
              "Phishing Detection",
              "URL Analysis",
              "Malware Scanning",
            ].map(tag => (
              <span key={tag} style={{
                fontSize: "0.68em", color: "#1a3a55",
                padding: "2px 8px",
                background: "rgba(41,121,255,0.06)",
                border: "1px solid rgba(41,121,255,0.1)",
                borderRadius: 100,
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

      </footer>
    </>
  );
}

export default Footer;