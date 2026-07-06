import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageTransition from "./animations/PageTransition";
import {
  FadeIn,
  ScaleIn,
  StaggerList,
  StaggerItem,
} from "./animations/MotionWrappers";
import {
  FaShieldAlt,
  FaBolt,
  FaBug,
  FaBrain,
  FaInbox,
  FaLink,
  FaFileAlt,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";

const API_BASE = process.env.REACT_APP_API_URL
  || "http://localhost:5000";

// ─── Pulsing live indicator dot ──────────────────────────────────────────────
function LiveDot() {
  return (
    <span style={{
      display: "inline-block",
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "#00ff88",
      marginRight: 8,
      boxShadow: "0 0 0 0 rgba(0,255,136,0.7)",
      animation: "livePulse 1.8s ease-out infinite",
      verticalAlign: "middle",
    }} />
  );
}

// ─── Threat feed item ─────────────────────────────────────────────────────────
const FEED_EVENTS = [
  { icon: <FaExclamationTriangle />, color: "#ff4444", label: "PHISHING", text: "Credential harvesting attempt detected — JazzCash impersonation" },
  { icon: <FaTimesCircle />,         color: "#ff4444", label: "MALICIOUS", text: "URL flagged: paypal-secure-verify-account.com — 6 engines detected" },
  { icon: <FaExclamationTriangle />, color: "#ffaa00", label: "SUSPICIOUS", text: "Shortened URL with high-risk domain redirect detected" },
  { icon: <FaTimesCircle />,         color: "#ff4444", label: "MALICIOUS", text: "File scan: SHA-256 match found — 12/70 AV engines flagged" },
  { icon: <FaExclamationTriangle />, color: "#ff4444", label: "PHISHING", text: "Easypaisa account suspension scam — urgency keywords detected" },
  { icon: <FaCheckCircle />,         color: "#00ff88", label: "SAFE",     text: "Email analyzed — no phishing indicators found" },
  { icon: <FaTimesCircle />,         color: "#ff4444", label: "MALICIOUS", text: "IP-based URL flagged: 103.216.x.x — AbuseIPDB score 87%" },
  { icon: <FaExclamationTriangle />, color: "#ffaa00", label: "SUSPICIOUS", text: "Domain uses .xyz TLD with suspicious keyword 'verify'" },
];

// ─── Module card ─────────────────────────────────────────────────────────────
function ModuleCard({ icon, title, desc, path, badge, navigate }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => navigate(path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,255,136,0.06))"
          : "rgba(255,255,255,0.03)",
        border: hovered ? "1px solid rgba(0,212,255,0.4)" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "28px 24px",
        cursor: "pointer",
        transition: "all 0.25s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 16px 40px rgba(0,212,255,0.12)" : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {badge && (
        <span style={{
          position: "absolute", top: 14, right: 14,
          background: "rgba(0,255,136,0.15)", color: "#00ff88",
          fontSize: 10, fontWeight: 700, letterSpacing: 1,
          padding: "3px 8px", borderRadius: 20,
          border: "1px solid rgba(0,255,136,0.3)",
          textTransform: "uppercase",
        }}>{badge}</span>
      )}
      <div style={{ fontSize: 28, color: "#00d4ff", marginBottom: 14 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: "#e8f4ff", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: "#7a9ab5", lineHeight: 1.6 }}>{desc}</div>
      <div style={{
        marginTop: 18, fontSize: 12, color: "#00d4ff",
        fontWeight: 600, letterSpacing: 0.5,
        opacity: hovered ? 1 : 0, transition: "opacity 0.2s",
      }}>
        Open Module →
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14,
      padding: "22px 18px",
      textAlign: "center",
      transition: "border-color 0.2s",
    }}>
      <div style={{ fontSize: 22, color: color || "#00d4ff", marginBottom: 10 }}>{icon}</div>
      <div style={{
        fontSize: 26, fontWeight: 800, color: "#e8f4ff",
        letterSpacing: -0.5, marginBottom: 6,
        fontVariantNumeric: "tabular-nums",
      }}>{value}</div>
      <div style={{ fontSize: 12, color: "#5a7a95", letterSpacing: 0.3, textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate();

  // Stats
  const [emailCount,  setEmailCount]  = useState(0);
  const [threatCount, setThreatCount] = useState(0);
  const [urlCount,    setUrlCount]    = useState(0);
  const [fileCount,   setFileCount]   = useState(0);
  const [userCount,   setUserCount]   = useState(0);
  const [accuracy]                     = useState("~97%");
  const [speed]                        = useState("0.008s");

  // Live feed
  const [feedIndex, setFeedIndex] = useState(0);
  const [feedVisible, setFeedVisible] = useState(true);

  // Load real system statistics and refresh every 30 seconds
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/stats`
        );
        if (res.data.success) {
          setEmailCount(res.data.total_email_scans);
          setThreatCount(res.data.threats_detected);
          setUrlCount(res.data.total_url_scans);
          setFileCount(res.data.total_file_scans);
          setUserCount(res.data.total_users);
        }
      } catch (err) {
        console.log("Stats fetch failed:", err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cycle through feed events with fade
  useEffect(() => {
    const interval = setInterval(() => {
      setFeedVisible(false);
      setTimeout(() => {
        setFeedIndex(i => (i + 1) % FEED_EVENTS.length);
        setFeedVisible(true);
      }, 350);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const currentEvent = FEED_EVENTS[feedIndex];

  return (
    <PageTransition>
      {/* ── Keyframe injection ──────────────────────────────────── */}
      <style>{`
        @keyframes livePulse {
          0%   { box-shadow: 0 0 0 0 rgba(0,255,136,0.7); }
          70%  { box-shadow: 0 0 0 8px rgba(0,255,136,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,255,136,0); }
        }
        @keyframes gridMove {
          0%   { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes scanLine {
          0%   { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes feedFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(0,212,255,0.2); }
          50%       { border-color: rgba(0,212,255,0.5); }
        }
        .feed-item-animate { animation: feedFade 0.35s ease forwards; }
        .module-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#060d1a",
        color: "#e8f4ff",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* ── Animated grid background ──────────────────────────── */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          animation: "gridMove 8s linear infinite",
        }} />

        {/* ── Scan line effect ──────────────────────────────────── */}
        <div style={{
          position: "fixed", left: 0, right: 0, height: 2, zIndex: 0,
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)",
          animation: "scanLine 6s ease-in-out infinite",
          animationDelay: "2s",
          pointerEvents: "none",
        }} />

        {/* ── Ambient orb ───────────────────────────────────────── */}
        <div style={{
          position: "fixed", top: "10%", right: "-10%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
          animation: "orbFloat 8s ease-in-out infinite",
          pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{
          position: "fixed", bottom: "5%", left: "-8%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)",
          animation: "orbFloat 10s ease-in-out infinite",
          animationDelay: "3s",
          pointerEvents: "none", zIndex: 0,
        }} />

        {/* ── Content wrapper ───────────────────────────────────── */}
        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: 960, margin: "0 auto",
          padding: "60px 24px 80px",
        }}>

          {/* ── HERO ────────────────────────────────────────────── */}
          <FadeIn delay={0.1}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>

              {/* Status badge */}
              <div style={{
                display: "inline-flex", alignItems: "center",
                background: "rgba(0,255,136,0.08)",
                border: "1px solid rgba(0,255,136,0.2)",
                borderRadius: 100, padding: "6px 16px",
                fontSize: 12, color: "#00ff88", fontWeight: 600,
                letterSpacing: 0.8, marginBottom: 32,
                textTransform: "uppercase",
              }}>
                <LiveDot />
                System Active — All Modules Operational
              </div>

              {/* Title */}
              <FadeIn delay={0.2}>
                <h1 style={{
                  fontSize: "clamp(36px, 6vw, 64px)",
                  fontWeight: 900,
                  margin: "0 0 16px",
                  letterSpacing: -1.5,
                  lineHeight: 1.1,
                  background: "linear-gradient(135deg, #e8f4ff 0%, #00d4ff 50%, #00ff88 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  CyberSentinel AI
                </h1>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8,
                  color: "#5a7a95", fontSize: 14,
                  letterSpacing: 2, textTransform: "uppercase",
                  marginBottom: 40, fontWeight: 500,
                }}>
                  <span>Phishing Detection</span>
                  <span style={{ color: "#1a3a55" }}>•</span>
                  <span>URL Analysis</span>
                  <span style={{ color: "#1a3a55" }}>•</span>
                  <span>Malware Scanning</span>
                </div>
              </FadeIn>

              {/* CTA buttons */}
              <FadeIn delay={0.4}>
                <div style={{
                  display: "flex", justifyContent: "center",
                  gap: 12, flexWrap: "wrap",
                }}>
                  {[
                    { label: "Analyze Email", path: "/analyze", primary: true },
                    { label: "Scan URL",      path: "/url-scan", primary: false },
                    { label: "Scan File",     path: "/file-scan", primary: false },
                  ].map(({ label, path, primary }) => (
                    <button
                      key={path}
                      onClick={() => navigate(path)}
                      style={{
                        padding: "12px 28px",
                        borderRadius: 100,
                        border: primary
                          ? "none"
                          : "1px solid rgba(0,212,255,0.3)",
                        background: primary
                          ? "linear-gradient(135deg, #00d4ff, #00a8cc)"
                          : "rgba(0,212,255,0.06)",
                        color: primary ? "#060d1a" : "#00d4ff",
                        fontWeight: 700, fontSize: 14,
                        cursor: "pointer",
                        letterSpacing: 0.3,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = primary
                          ? "0 8px 24px rgba(0,212,255,0.35)"
                          : "0 8px 24px rgba(0,212,255,0.15)";
                      }}
                      onMouseLeave={e => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </FadeIn>
            </div>
          </FadeIn>

          {/* ── STATS ───────────────────────────────────────────── */}
          <FadeIn delay={0.5}>
            <div
              className="stat-grid"
              aria-label={`System statistics: ${emailCount} email scans, ${urlCount} URL scans, ${fileCount} file scans, ${userCount} users`}
              style={{ marginBottom: 48 }}
            >
              <StatCard icon={<FaInbox />}  value={emailCount}  label="Emails Analyzed"  color="#00d4ff" />
              <StatCard icon={<FaBug />}    value={threatCount} label="Threats Detected" color="#ff4444" />
              <StatCard icon={<FaBrain />}  value={accuracy}          label="Model Accuracy"   color="#00ff88" />
              <StatCard icon={<FaBolt />}   value={speed}             label="Avg Scan Speed"   color="#ffaa00" />
            </div>
          </FadeIn>

          {/* ── LIVE FEED ────────────────────────────────────────── */}
          <FadeIn delay={0.6}>
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(0,212,255,0.15)",
              borderRadius: 14,
              padding: "18px 24px",
              marginBottom: 48,
              animation: "borderGlow 4s ease-in-out infinite",
            }}>
              <div style={{
                display: "flex", alignItems: "center",
                gap: 8, marginBottom: 14,
                fontSize: 11, color: "#5a7a95",
                textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600,
              }}>
                <LiveDot />
                Live Threat Feed — Sample Scenarios
              </div>

              <div
                key={feedIndex}
                className={feedVisible ? "feed-item-animate" : ""}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  opacity: feedVisible ? 1 : 0,
                  transition: "opacity 0.3s",
                }}
              >
                <span style={{
                  fontSize: 14, color: currentEvent.color,
                  flexShrink: 0,
                }}>
                  {currentEvent.icon}
                </span>
                <span style={{
                  background: currentEvent.color + "18",
                  color: currentEvent.color,
                  border: `1px solid ${currentEvent.color}30`,
                  fontSize: 10, fontWeight: 700,
                  padding: "2px 8px", borderRadius: 100,
                  letterSpacing: 1, textTransform: "uppercase",
                  flexShrink: 0,
                }}>
                  {currentEvent.label}
                </span>
                <span style={{
                  fontSize: 13, color: "#8ab0cc", lineHeight: 1.5,
                }}>
                  {currentEvent.text}
                </span>
              </div>
            </div>
          </FadeIn>

          {/* ── MODULES ──────────────────────────────────────────── */}
          <FadeIn delay={0.7}>
            <div style={{
              fontSize: 11, color: "#3a5a75",
              textTransform: "uppercase", letterSpacing: 2,
              fontWeight: 700, marginBottom: 16,
            }}>
              Detection Modules
            </div>
            <div className="module-grid" style={{ marginBottom: 48 }}>
              <ModuleCard
                icon={<FaEnvelope />}
                title="Phishing Email Detection"
                desc="NLP-based classification using hybrid TF-IDF and Logistic Regression. ~97% accuracy on Pakistani phishing patterns."
                path="/analyze"
                badge="Active"
                navigate={navigate}
              />
              <ModuleCard
                icon={<FaLink />}
                title="URL Threat Analyzer"
                desc="10-feature rule-based scoring combined with AbuseIPDB threat intelligence. Detects malicious, suspicious, and safe URLs."
                path="/url-scan"
                badge="Active"
                navigate={navigate}
              />
              <ModuleCard
                icon={<FaFileAlt />}
                title="Malware File Scanner"
                desc="SHA-256 hash-based detection via VirusTotal API querying 70+ antivirus engines. Files deleted immediately after hashing."
                path="/file-scan"
                badge="Active"
                navigate={navigate}
              />
            </div>
          </FadeIn>

          {/* ── SYSTEM SECURITY STRIP ────────────────────────────── */}
          <FadeIn delay={0.8}>
            <div style={{
              background: "rgba(0,255,136,0.03)",
              border: "1px solid rgba(0,255,136,0.1)",
              borderRadius: 12,
              padding: "16px 24px",
              marginBottom: 48,
            }}>
              <div style={{
                fontSize: 11, color: "#00ff88",
                textTransform: "uppercase", letterSpacing: 1.5,
                fontWeight: 700, marginBottom: 12,
              }}>
                <FaShieldAlt style={{ marginRight: 6, verticalAlign: "middle" }} />
                Security Architecture
              </div>
              <div style={{
                display: "flex", flexWrap: "wrap", gap: "8px 20px",
              }}>
                {[
                  "Input Sanitization (XSS)",
                  "Rate Limiting",
                  "CORS Protection",
                  "File Privacy (SHA-256 only)",
                  "API Key Protection",
                  "Audit Logging",
                  "Payload Validation",
                ].map((feature, index) => (
  <span key={index} style={{
                    fontSize: 12, color: "#4a8a6a",
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <FaCheckCircle style={{ color: "#00ff88", fontSize: 10 }} />
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* ── FOOTER ───────────────────────────────────────────── */}
          <div style={{
            textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: 32,
            color: "#2a4a65",
            fontSize: 12,
            letterSpacing: 0.3,
          }}>
            <div style={{ marginBottom: 6 }}>
              CyberSentinel AI — COMSATS University Islamabad, Abbottabad Campus
            </div>
            <div>
              Final Year Project 2026 •{" "}
              <span style={{ color: "#3a6a85" }}>Supervised by Mr. Mazhar Ali</span>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}

export default LandingPage;
