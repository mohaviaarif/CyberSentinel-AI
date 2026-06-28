import React, { useState, useRef } from "react";
import {
  FaCheck,
  FaBug,
  FaFileDownload,
  FaShieldAlt,
  FaExclamationTriangle,
  FaTimesCircle,
  FaLink,
  FaLightbulb,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL
  || "http://localhost:5000";

// ─── Circular confidence meter (identical to AnalyzePage) ─────────────────────
function ConfidenceRing({ value, color }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
      <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: "1.55em", fontWeight: 800, color: "#F2F6FF", lineHeight: 1 }}>
          {value}%
        </span>
        <span style={{ fontSize: "0.62em", color: "#7a9ab5", marginTop: 2, letterSpacing: 0.5 }}>
          CONFIDENCE
        </span>
      </div>
    </div>
  );
}

// ─── Verdict badge (identical pattern to AnalyzePage) ────────────────────────
function VerdictBadge({ verdict, color }) {
  const icons = {
    Safe:      <FaShieldAlt />,
    Suspicious: <FaExclamationTriangle />,
    Malicious: <FaTimesCircle />,
  };
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      background: color + "18",
      border: `1.5px solid ${color}55`,
      borderRadius: 100,
      padding: "8px 20px",
      fontSize: "1em", fontWeight: 700,
      color: color, letterSpacing: 0.5,
      marginBottom: 4,
    }}>
      <span style={{ fontSize: "1.1em" }}>{icons[verdict]}</span>
      {verdict.toUpperCase()}
    </div>
  );
}

// ─── Threat score pill ────────────────────────────────────────────────────────
function ScorePill({ score, color }) {
  const max = 10;
  const filled = Math.min(score, max);

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: "10px 16px",
    }}>
      <div>
        <div style={{ fontSize: "0.7em", color: "#3a5a75", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>
          Threat Score
        </div>
        <div style={{ fontSize: "1.4em", fontWeight: 800, color: color, lineHeight: 1 }}>
          {score} <span style={{ fontSize: "0.55em", color: "#3a5a75", fontWeight: 400 }}>/ {max}</span>
        </div>
      </div>
      {/* Mini bar */}
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} style={{
            width: 6, height: 18, borderRadius: 3,
            background: i < filled ? color : "rgba(255,255,255,0.06)",
            transition: `background 0.1s ${i * 0.05}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function URLScanPage() {
  const [urlInput, setUrlInput]   = useState("");
  const [result,   setResult]     = useState(null);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState("");
  const [focused,  setFocused]    = useState(false);

  // ── Analyze handler ────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    setError("");

    if (!urlInput.trim()) {
      setError("Please enter a URL to analyze.");
      return;
    }

    // Auto-add http:// if missing so backend normalization handles it
    let urlToSend = urlInput.trim();
    if (!/^https?:\/\//i.test(urlToSend)) {
      urlToSend = "http://" + urlToSend;
    }

    if (loading) return;
    setLoading(true);
    setResult(null);

    try {
      const userEmail = localStorage.getItem("userEmail") || "";
      const response = await axios.post(
        `${API_BASE}/api/url-scan`,
        { url: urlToSend },
        { headers: { "X-User-Email": userEmail } }
      );

      const data = response.data;

      if (!data || !data.success || !data.result) {
        setError(data?.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const res = data.result?.toLowerCase();
      const confidence =
        data.confidence <= 1
          ? Math.round(data.confidence * 100)
          : Math.round(data.confidence);

      let verdict   = "Safe";
      let riskLevel = "Low";
      let color     = "#00E5A0";
      let glowClass = "";

      if (res === "suspicious") {
        verdict = "Suspicious"; riskLevel = "Medium";
        color = "#FFC947"; glowClass = "glow-warning";
      }
      if (res === "malicious") {
        verdict = "Malicious"; riskLevel = "High";
        color = "#FF4C4C"; glowClass = "glow-danger";
      }

      setResult({
        verdict, confidence, riskLevel, color, glowClass,
        score:      data.score || 0,
        threats:    data.threat_indicators || [],
        safetyTips: data.tips || [],
        abuseScore: data.abuseipdb_score || 0,
        abuseChecked: data.abuseipdb_checked || false,
        scannedUrl:   urlToSend,
      });

    } catch (err) {
      if (err.response) {
        setError(err.response.data?.error || "Something went wrong. Please try again.");
      } else if (err.request) {
        setError("Unable to reach server. Make sure the backend is running.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }

    setLoading(false);
  };

  // ── Enter key support ──────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleAnalyze();
  };

  // ── Clear handler ──────────────────────────────────────────────────────────
  const handleClear = () => {
    setUrlInput("");
    setResult(null);
    setError("");
  };

  // ── PDF download ───────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    const { jsPDF }    = await import("jspdf");
    const html2canvas  = (await import("html2canvas")).default;
    const element      = document.getElementById("pdf-report-url");
    if (!element) return;
    const canvas   = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
    const pdf      = new jsPDF("p", "mm", "a4");
    const imgData  = canvas.toDataURL("image/png");
    const width    = pdf.internal.pageSize.getWidth();
    const height   = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("CyberSentinel_URL_Report.pdf");
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .url-result-in { animation: slideUp 0.45s cubic-bezier(.16,1,.32,1); }
        .url-threat-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 14px; border-radius: 10px;
          background: rgba(255,76,76,0.07);
          border: 1px solid rgba(255,76,76,0.15);
          margin-bottom: 8px;
          font-size: 0.93em; color: #d4a0a0; line-height: 1.5;
          transition: border-color 0.2s;
        }
        .url-threat-item:hover { border-color: rgba(255,76,76,0.35); }
        .url-tip-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 14px; border-radius: 10px;
          background: rgba(0,229,160,0.06);
          border: 1px solid rgba(0,229,160,0.15);
          margin-bottom: 8px;
          font-size: 0.93em; color: #90d4b8; line-height: 1.5;
          transition: border-color 0.2s;
        }
        .url-tip-item:hover { border-color: rgba(0,229,160,0.35); }
        .section-label-url {
          font-size: 0.72em; font-weight: 700; letter-spacing: 1.8px;
          text-transform: uppercase; margin-bottom: 10px;
          display: flex; align-items: center; gap: 6px;
        }
        .loading-shimmer-url {
          background: linear-gradient(90deg,
            rgba(41,121,255,0.06) 25%,
            rgba(41,121,255,0.14) 50%,
            rgba(41,121,255,0.06) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 14px;
        }
        .url-input-pro {
          width: 100%;
          height: 56px;
          border-radius: 1em;
          border: 2px solid rgba(41,121,255,0.25);
          background: rgba(15,20,25,0.9);
          color: #F2F6FF;
          font-size: 1em;
          font-family: 'Inter', sans-serif;
          padding: 0 16px;
          outline: none;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }
        .url-input-pro::placeholder { color: #3a5a75; }
      `}</style>

      <div className="analyze-page-pro">

        {/* ── Page header ──────────────────────────────────────── */}
        <div style={{ marginBottom: "2em" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(41,121,255,0.1)",
            border: "1px solid rgba(41,121,255,0.25)",
            borderRadius: 100, padding: "5px 14px",
            fontSize: "0.75em", color: "#7aa8ff",
            fontWeight: 600, letterSpacing: 1.2,
            textTransform: "uppercase", marginBottom: "0.8em",
          }}>
            <FaLink style={{ fontSize: "0.9em" }} />
            Module 2 — URL Threat Analyzer
          </div>

          <h1 style={{
            margin: "0 0 0.3em",
            fontSize: "2.4em",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 800,
            background: "linear-gradient(120deg, #2979FF, #00BFAE)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            URL Threat Scanner
          </h1>

          <p style={{
            margin: 0, color: "#5a7a95",
            fontSize: "0.95em", lineHeight: 1.6,
          }}>
            Enter any URL to detect malicious links using 10-feature rule-based
            scoring combined with AbuseIPDB threat intelligence.
          </p>
        </div>

        {/* ── Error message ─────────────────────────────────────── */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,76,76,0.1)",
            border: "1px solid rgba(255,76,76,0.35)",
            borderRadius: 12, padding: "12px 16px",
            color: "#ff9a9a", fontSize: "0.92em",
            marginBottom: "1.5em",
          }}>
            <FaExclamationTriangle style={{ flexShrink: 0, color: "#FF4C4C" }} />
            {error}
          </div>
        )}

        {/* ── URL input ────────────────────────────────────────── */}
        <div style={{ position: "relative", marginBottom: "1.5em" }}>
          <input
            type="text"
            className="url-input-pro"
            placeholder="Enter URL to scan — e.g. http://suspicious-site.com"
            value={urlInput}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              borderColor: focused
                ? "rgba(41,121,255,0.6)"
                : "rgba(41,121,255,0.2)",
              boxShadow: focused
                ? "0 0 0 3px rgba(41,121,255,0.12), 0 8px 24px rgba(41,121,255,0.08)"
                : "0 8px 24px rgba(41,121,255,0.06)",
            }}
          />
          {urlInput && (
            <FaTimes
              onClick={() => setUrlInput("")}
              style={{
                position: "absolute", right: 16, top: "50%",
                transform: "translateY(-50%)",
                color: "#3a5a75", cursor: "pointer",
                fontSize: "0.85em",
              }}
            />
          )}
        </div>

        {/* ── Helper hint ───────────────────────────────────────── */}
        <p style={{
          margin: "0 0 1.5em", fontSize: "0.78em",
          color: "#2a4a65", letterSpacing: 0.3,
        }}>
          You can enter URLs with or without http:// — we handle it automatically. Press Enter to scan.
        </p>

        {/* ── Action buttons ────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            className="analyze-btn-pro"
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              marginTop: 0,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{
                  display: "inline-block", width: 14, height: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }} />
                Checking URL...
              </>
            ) : (
              <>Analyze URL</>
            )}
          </button>

          {(urlInput || result) && (
            <button
              onClick={handleClear}
              style={{
                marginTop: 0,
                padding: "1.2em 2em",
                background: "rgba(255,255,255,0.04)",
                border: "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: "1.5em",
                color: "#5a7a95",
                fontWeight: 600, fontSize: "1em",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(255,76,76,0.4)";
                e.currentTarget.style.color = "#ff7a7a";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#5a7a95";
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Loading shimmer ───────────────────────────────────── */}
        {loading && (
          <div style={{ marginTop: "2em" }}>
            <div className="loading-shimmer-url" style={{ height: 10, width: "55%", marginBottom: 10 }} />
            <div className="loading-shimmer-url" style={{ height: 8,  width: "80%", marginBottom: 10 }} />
            <div className="loading-shimmer-url" style={{ height: 8,  width: "35%" }} />
          </div>
        )}

        {/* ── Result card ───────────────────────────────────────── */}
        {result && (
          <div id="pdf-report-url" className={`url-result-in ${result.glowClass}`} style={{
            marginTop: "2.5em",
            background: "rgba(15,20,30,0.8)",
            border: `1.5px solid ${result.color}30`,
            borderLeft: `5px solid ${result.color}`,
            borderRadius: "1.6em",
            padding: "2em 2.2em",
            backdropFilter: "blur(8px)",
          }}>

            {/* Scanned URL display */}
            <div style={{
              marginBottom: "1.5em",
              padding: "8px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              fontSize: "0.8em",
              color: "#3a5a75",
              fontFamily: "monospace",
              wordBreak: "break-all",
            }}>
              <span style={{ color: "#2a4a65", marginRight: 6 }}>Scanned:</span>
              {result.scannedUrl}
            </div>

            {/* Top row: verdict + confidence ring */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap", gap: 20,
              marginBottom: "2em",
              paddingBottom: "1.5em",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div>
                <VerdictBadge verdict={result.verdict} color={result.color} />
                <div style={{ marginTop: 10, color: "#5a7a95", fontSize: "0.85em" }}>
                  Risk Level:&nbsp;
                  <span style={{ color: result.color, fontWeight: 700 }}>
                    {result.riskLevel}
                  </span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <ScorePill score={result.score} color={result.color} />
                </div>
              </div>

              <ConfidenceRing value={result.confidence} color={result.color} />
            </div>

            {/* Confidence bar */}
            <div style={{ marginBottom: "2em" }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: "0.78em", color: "#3a5a75",
                marginBottom: 6, letterSpacing: 0.5,
              }}>
                <span>CONFIDENCE LEVEL</span>
                <span style={{ color: result.color }}>{result.confidence}%</span>
              </div>
              <div style={{
                height: 6, background: "rgba(255,255,255,0.06)",
                borderRadius: 100, overflow: "hidden",
              }}>
                <div style={{
                  width: `${result.confidence}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${result.color}88, ${result.color})`,
                  borderRadius: 100,
                  transition: "width 1s cubic-bezier(.4,0,.2,1)",
                }} />
              </div>
            </div>

            {/* AbuseIPDB badge if checked */}
            {result.abuseChecked && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(41,121,255,0.08)",
                border: "1px solid rgba(41,121,255,0.2)",
                borderRadius: 100, padding: "6px 14px",
                fontSize: "0.78em", color: "#7aa8ff",
                marginBottom: "1.5em",
              }}>
                <FaShieldAlt style={{ fontSize: "0.85em" }} />
                AbuseIPDB checked — abuse score: {result.abuseScore}%
              </div>
            )}

            {/* Threat Indicators */}
            {result.threats.length > 0 && (
              <div style={{ marginBottom: "1.8em" }}>
                <div className="section-label-url" style={{ color: "#FF4C4C" }}>
                  <FaBug style={{ fontSize: "0.9em" }} />
                  Detected Threat Indicators
                </div>
                {result.threats.map((t, i) => (
                  <div key={i} className="url-threat-item">
                    <FaTimesCircle style={{
                      color: "#FF4C4C", flexShrink: 0,
                      fontSize: "0.85em", marginTop: 2,
                    }} />
                    {t}
                  </div>
                ))}
              </div>
            )}

            {result.threats.length === 0 && (
              <div style={{
                marginBottom: "1.8em",
                padding: "12px 16px",
                background: "rgba(0,229,160,0.06)",
                border: "1px solid rgba(0,229,160,0.15)",
                borderRadius: 12,
                color: "#4aaa88", fontSize: "0.9em",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <FaCheck />
                No major threat indicators detected in this URL.
              </div>
            )}

            {/* Safety Tips */}
            {result.safetyTips.length > 0 && (
              <div style={{ marginBottom: "2em" }}>
                <div className="section-label-url" style={{ color: "#00E5A0" }}>
                  <FaLightbulb style={{ fontSize: "0.9em" }} />
                  Safety Recommendations
                </div>
                {result.safetyTips.map((t, i) => (
                  <div key={i} className="url-tip-item">
                    <FaCheck style={{
                      color: "#00E5A0", flexShrink: 0,
                      fontSize: "0.85em", marginTop: 2,
                    }} />
                    {t}
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div style={{
              display: "flex", gap: 12, flexWrap: "wrap",
              paddingTop: "1.2em",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              <button
                onClick={downloadPDF}
                className="analyze-btn-pro"
                style={{
                  marginTop: 0, padding: "0.9em 2em",
                  fontSize: "0.9em",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <FaFileDownload />
                Download Report
              </button>

              <button
                className="scan-again-btn"
                onClick={handleClear}
                style={{ marginTop: 0, width: "auto", padding: "0.9em 2em" }}
              >
                Scan Again
              </button>
            </div>

          </div>
        )}

      </div>
    </>
  );
}

export default URLScanPage;
