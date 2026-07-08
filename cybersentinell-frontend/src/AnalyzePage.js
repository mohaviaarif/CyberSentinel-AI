import React, { useState, useRef } from "react";
import axios from "axios";
import {
  FaCheck,
  FaBug,
  FaFileDownload,
  FaShieldAlt,
  FaExclamationTriangle,
  FaTimesCircle,
  FaEnvelope,
  FaPaperclip,
  FaTimes,
  FaLightbulb,
} from "react-icons/fa";

const API_BASE = process.env.REACT_APP_API_URL
  || "http://localhost:5000";

// ─── Circular confidence meter ────────────────────────────────────────────────
function ConfidenceRing({ value, color }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
      <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
        {/* Background track */}
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />
        {/* Progress arc */}
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
      {/* Center text */}
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

// ─── Verdict badge ────────────────────────────────────────────────────────────
function VerdictBadge({ verdict, color }) {
  const icons = {
    Safe:     <FaShieldAlt />,
    Suspicious: <FaExclamationTriangle />,
    Phishing: <FaTimesCircle />,
  };
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      background: color + "18",
      border: `1.5px solid ${color}55`,
      borderRadius: 100,
      padding: "8px 20px",
      fontSize: "1em",
      fontWeight: 700,
      color: color,
      letterSpacing: 0.5,
      marginBottom: 4,
    }}>
      <span style={{ fontSize: "1.1em" }}>{icons[verdict]}</span>
      {verdict.toUpperCase()}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function AnalyzePage() {
  const [emailContent, setEmailContent] = useState("");
  const [result, setResult]             = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [loadedFileName, setLoadedFileName] = useState("");
  const [docFileName, setDocFileName]   = useState("");
  const [charCount, setCharCount]       = useState(0);
  const [focused, setFocused]           = useState(false);

  const fileInputRef = useRef();
  const docInputRef = useRef();

  // ── Analyze handler ────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    setError("");
    if (!emailContent.trim()) {
      setError("Please enter or upload email text before analyzing.");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const userEmail = localStorage.getItem("userEmail") || "";
      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": userEmail,
        },
        body: JSON.stringify({ text: emailContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const confidence = Math.round((data.confidence || 0) * 100);
      let verdict  = "Safe";
      let riskLevel = "Low";
      let color    = "#00E5A0";
      let glowClass = "";

      if (data.prediction === "suspicious") {
        verdict   = "Suspicious";
        riskLevel = "Medium";
        color     = "#FFC947";
        glowClass = "glow-warning";
      }
      if (data.prediction === "spam") {
        verdict   = "Phishing";
        riskLevel = "High";
        color     = "#FF4C4C";
        glowClass = "glow-danger";
      }

      // Increment email counter in localStorage
      const prev = parseInt(localStorage.getItem("emailAnalyzedCount") || "0", 10);
      localStorage.setItem("emailAnalyzedCount", prev + 1);
      if (data.prediction === "spam" || data.prediction === "suspicious") {
        const prevT = parseInt(localStorage.getItem("threatsDetected") || "0", 10);
        localStorage.setItem("threatsDetected", prevT + 1);
      }

      setResult({ verdict, confidence, riskLevel, color, glowClass,
        threats: data.threats || [],
        safetyTips: data.tips || [],
        embedded_links: data.embedded_links || [],
        hidden_links: data.hidden_links || [],
      });

    } catch {
      setError("Unable to reach server. Make sure the backend is running.");
    }
    setLoading(false);
  };

  // ── Clear handler ──────────────────────────────────────────────────────────
  const handleClear = () => {
    setEmailContent("");
    setResult(null);
    setLoadedFileName("");
    setDocFileName("");
    setError("");
    setCharCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (docInputRef.current) docInputRef.current.value = "";
  };

  // ── File upload handler ────────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadedFileName(file.name);
    setResult(null);
    setError("");
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setEmailContent(ev.target.result);
      setCharCount(ev.target.result.length);
    };
    reader.readAsText(file);

    try {
      const userEmail = localStorage.getItem("userEmail") || "";
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_BASE}/api/phish-file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-User-Email": userEmail
          }
        }
      );

      const data = response.data;
      const confidence = Math.round((data.confidence || 0) * 100);
      let verdict = "Safe";
      let riskLevel = "Low";
      let color = "#00E5A0";
      let glowClass = "glow-safe";

      if (data.prediction === "suspicious") {
        verdict = "Suspicious";
        riskLevel = "Medium";
        color = "#FFC947";
        glowClass = "glow-warning";
      } else if (data.prediction === "spam") {
        verdict = "Phishing";
        riskLevel = "High";
        color = "#FF4C4C";
        glowClass = "glow-danger";
      }

      setResult({
        verdict,
        confidence,
        riskLevel,
        color,
        glowClass,
        threats: data.threats || [],
        safetyTips: data.tips || [],
        embedded_links: data.embedded_links || [],
        hidden_links: data.hidden_links || [],
        source: "Email File",
        filename: data.filename || file.name
      });
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data?.error || "Email file scan failed."
        );
      } else {
        setError(
          "Cannot reach server. Make sure backend is running."
        );
      }
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDocFileName(file.name);
    setResult(null);
    setError("");
    setLoading(true);

    try {
      const userEmail = localStorage.getItem(
        "userEmail"
      ) || "";
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_BASE}/api/scan-document`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-User-Email": userEmail
          }
        }
      );

      const data = response.data;
      const isPhishing = data.prediction === "spam";

      setResult({
        verdict: isPhishing ? "Phishing" : "Safe",
        confidence: Math.round((data.confidence || 0) * 100),
        riskLevel: isPhishing ? "High" : "Low",
        color: isPhishing ? "#FF4C4C" : "#00E5A0",
        glowClass: isPhishing ? "glow-danger" : "glow-safe",
        threats: data.threats || [],
        safetyTips: data.tips || [],
        embedded_links: data.embedded_links || [],
        hidden_links: data.hidden_links || [],
        source: `${data.extraction_method} Document`,
        filename: data.filename,
        extractedChars: data.extracted_chars
      });

    } catch (err) {
      if (err.response) {
        setError(
          err.response.data?.error ||
          "Document scan failed."
        );
      } else {
        setError(
          "Cannot reach server. " +
          "Make sure backend is running."
        );
      }
    } finally {
      setLoading(false);
      setDocFileName("");
      if (docInputRef.current) {
        docInputRef.current.value = "";
      }
    }
  };

  // ── PDF download ───────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;
    const pdfBlock = document.getElementById("pdf-report");
    if (!pdfBlock) return;
    const canvas = await html2canvas(pdfBlock, { scale: 2, backgroundColor: "#FFFFFF" });
    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("CyberSentinel_Phishing_Report.pdf");
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
          100% { background-position: 400px 0; }
        }
        .result-slide-in { animation: slideUp 0.45s cubic-bezier(.16,1,.32,1); }
        .threat-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 14px; border-radius: 10px;
          background: rgba(255,76,76,0.07);
          border: 1px solid rgba(255,76,76,0.15);
          margin-bottom: 8px;
          font-size: 0.93em; color: #d4a0a0; line-height: 1.5;
          transition: border-color 0.2s;
        }
        .threat-item:hover { border-color: rgba(255,76,76,0.35); }
        .tip-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 14px; border-radius: 10px;
          background: rgba(0,229,160,0.06);
          border: 1px solid rgba(0,229,160,0.15);
          margin-bottom: 8px;
          font-size: 0.93em; color: #90d4b8; line-height: 1.5;
          transition: border-color 0.2s;
        }
        .tip-item:hover { border-color: rgba(0,229,160,0.35); }
        .section-label {
          font-size: 0.72em; font-weight: 700; letter-spacing: 1.8px;
          text-transform: uppercase; margin-bottom: 10px;
          display: flex; align-items: center; gap: 6px;
        }
        .textarea-wrap {
          position: relative;
        }
        .char-counter {
          position: absolute; bottom: 14px; right: 18px;
          font-size: 0.75em; color: #3a5a75;
          pointer-events: none; font-family: monospace;
        }
        .loading-shimmer {
          background: linear-gradient(90deg, rgba(41,121,255,0.06) 25%, rgba(41,121,255,0.14) 50%, rgba(41,121,255,0.06) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 14px;
          height: 6px; margin: 8px 0;
        }
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
            <FaEnvelope style={{ fontSize: "0.9em" }} />
            Module 1 — Phishing Email Detection
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
            Email Threat Analyzer
          </h1>

          <p style={{
            margin: 0, color: "#5a7a95", fontSize: "0.95em", lineHeight: 1.6,
          }}>
            Paste or upload an email to detect phishing attempts using NLP-based
            machine learning. ~97% accuracy on real-world phishing patterns.
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

        {/* ── Textarea with char counter ────────────────────────── */}
        <div className="textarea-wrap" style={{ marginBottom: "1em" }}>
          <textarea
            className="analyze-textarea-pro"
            placeholder="Paste the complete email content here — headers, body, links, everything..."
            rows={13}
            value={emailContent}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => {
              setEmailContent(e.target.value);
              setCharCount(e.target.value.length);
            }}
            style={{
              borderColor: focused
                ? "rgba(41,121,255,0.6)"
                : "rgba(41,121,255,0.2)",
              boxShadow: focused
                ? "0 0 0 3px rgba(41,121,255,0.12), 0 8px 24px rgba(41,121,255,0.08)"
                : "0 8px 24px rgba(41,121,255,0.06)",
              transition: "all 0.25s ease",
              paddingBottom: "2.5em",
            }}
          />
          <span className="char-counter">
            {charCount > 0 ? `${charCount.toLocaleString()} chars` : ""}
          </span>
        </div>

        {/* ── File upload row ───────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: "1.8em",
        }}>
          <button
            onClick={() => fileInputRef.current.click()}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "rgba(41,121,255,0.08)",
              border: "1px solid rgba(41,121,255,0.25)",
              borderRadius: 100, padding: "8px 18px",
              color: "#7aa8ff", cursor: "pointer",
              fontSize: "0.85em", fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(41,121,255,0.16)";
              e.currentTarget.style.borderColor = "rgba(41,121,255,0.5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(41,121,255,0.08)";
              e.currentTarget.style.borderColor = "rgba(41,121,255,0.25)";
            }}
          >
            <FaPaperclip style={{ fontSize: "0.9em" }} />
            Upload .txt or .eml file
          </button>

          <button
            onClick={() => docInputRef.current.click()}
            title={docFileName || "Scan PDF or Word document"}
            style={{
              background: "rgba(156,39,176,0.15)",
              border: "1px solid #9C27B0",
              color: "#9C27B0",
              borderRadius: "20px",
              padding: "6px 14px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            📄 Scan PDF or Word Doc
          </button>

          {loadedFileName && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(0,229,160,0.08)",
              border: "1px solid rgba(0,229,160,0.25)",
              borderRadius: 100, padding: "6px 14px",
              fontSize: "0.82em", color: "#00E5A0",
            }}>
              <FaCheck style={{ fontSize: "0.85em" }} />
              {loadedFileName}
              <FaTimes
                style={{ cursor: "pointer", opacity: 0.6, fontSize: "0.85em" }}
                onClick={() => {
                  setLoadedFileName("");
                  setEmailContent("");
                  setCharCount(0);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept=".txt,.eml"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <input
            type="file"
            ref={docInputRef}
            style={{ display: "none" }}
            accept=".pdf,.docx,.doc"
            onChange={handleDocumentUpload}
          />
        </div>

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
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }} />
                Analyzing email...
              </>
            ) : (
              <> Analyze Email </>
            )}
          </button>

          {(emailContent || result) && (
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
            <div className="loading-shimmer" style={{ width: "60%", height: 10 }} />
            <div className="loading-shimmer" style={{ width: "85%", height: 8, marginTop: 10 }} />
            <div className="loading-shimmer" style={{ width: "40%", height: 8, marginTop: 10 }} />
          </div>
        )}

        {/* ── Result card ───────────────────────────────────────── */}
        {result && (
          <div id="pdf-report" className={`result-slide-in ${result.glowClass}`} style={{
            marginTop: "2.5em",
            background: "rgba(15,20,30,0.8)",
            border: `1.5px solid ${result.color}30`,
            borderLeft: `5px solid ${result.color}`,
            borderRadius: "1.6em",
            padding: "2em 2.2em",
            backdropFilter: "blur(8px)",
          }}>

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
                {result.source && result.source.includes("Document") && (
                  <div style={{
                    marginBottom: 10,
                    color: "#6a88b8",
                    fontSize: "0.8em"
                  }}>
                    Extracted from: {result.filename} ({result.extractedChars} characters)
                  </div>
                )}
                <VerdictBadge verdict={result.verdict} color={result.color} />
                <div style={{ marginTop: 10, color: "#5a7a95", fontSize: "0.85em" }}>
                  Risk Level:&nbsp;
                  <span style={{ color: result.color, fontWeight: 700 }}>
                    {result.riskLevel}
                  </span>
                </div>
                <div style={{ marginTop: 4, color: "#3a5a75", fontSize: "0.8em" }}>
                  Analyzed with Logistic Regression + Hybrid TF-IDF
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

            {/* Threat Indicators */}
            {result.threats.length > 0 && (
              <div style={{ marginBottom: "1.8em" }}>
                <div className="section-label" style={{ color: "#FF4C4C" }}>
                  <FaBug style={{ fontSize: "0.9em" }} />
                  Detected Threat Indicators
                </div>
                {result.threats.map((t, i) => (
                  <div key={i} className="threat-item">
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
                No major phishing indicators detected in this email.
              </div>
            )}

            {/* Safety Tips */}
            {result.safetyTips.length > 0 && (
              <div style={{ marginBottom: "2em" }}>
                <div className="section-label" style={{ color: "#00E5A0" }}>
                  <FaLightbulb style={{ fontSize: "0.9em" }} />
                  Safety Recommendations
                </div>
                {result.safetyTips.map((t, i) => (
                  <div key={i} className="tip-item">
                    <FaCheck style={{
                      color: "#00E5A0", flexShrink: 0,
                      fontSize: "0.85em", marginTop: 2,
                    }} />
                    {t}
                  </div>
                ))}
              </div>
            )}

            {result.embedded_links && result.embedded_links.length > 0 && (
              <div className="embedded-links-section" style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h4 style={{
                  color: '#A4C7EC',
                  marginBottom: '12px',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Links Found Inside This Email ({result.embedded_links.length})
                </h4>
                {result.embedded_links.map((link, index) => {
                  const colors = {
                    safe: { bg: 'rgba(0,229,160,0.1)', border: '#00E5A0', badge: '#00E5A0', text: 'SAFE' },
                    suspicious: { bg: 'rgba(255,201,71,0.1)', border: '#FFC947', badge: '#FFC947', text: 'SUSPICIOUS' },
                    malicious: { bg: 'rgba(255,76,76,0.1)', border: '#FF4C4C', badge: '#FF4C4C', text: 'MALICIOUS' },
                    error: { bg: 'rgba(150,150,150,0.1)', border: '#666', badge: '#666', text: 'ERROR' }
                  };
                  const scheme = colors[link.result] || colors.error;
                  return (
                    <div key={index} style={{
                      padding: '10px 14px',
                      marginBottom: '8px',
                      background: scheme.bg,
                      borderRadius: '8px',
                      border: `1px solid ${scheme.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          background: scheme.badge,
                          color: '#000',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          minWidth: '70px',
                          textAlign: 'center'
                        }}>
                          {scheme.text}
                        </span>
                        <span style={{
                          color: '#E0E0E0',
                          fontSize: '13px',
                          fontFamily: 'Courier New, monospace',
                          wordBreak: 'break-all'
                        }}>
                          {link.url.length > 60
                            ? link.url.substring(0, 60) + '...'
                            : link.url}
                        </span>
                      </div>
                      <span style={{
                        color: '#6a88b8',
                        fontSize: '12px',
                        paddingLeft: '78px'
                      }}>
                        {link.top_reason}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {result.hidden_links && result.hidden_links.length > 0 && (
              <div style={{
                marginTop: "16px",
                padding: "16px",
                background: "rgba(255,76,76,0.05)",
                borderRadius: "10px",
                border: "1px solid rgba(255,76,76,0.3)"
              }}>
                <h4 style={{
                  color: "#FF4C4C",
                  marginBottom: "12px",
                  fontSize: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}>
                  ⚠ Hidden Link Threats Detected ({result.hidden_links.length})
                </h4>
                <p style={{
                  color: "#6a88b8",
                  fontSize: "11px",
                  marginBottom: "12px"
                }}>
                  These links have misleading display text that hides their
                  real destination.
                </p>
                {result.hidden_links.map((link, index) => {
                  const realUrl = link.real_url || "";
                  return (
                    <div key={index} style={{
                      padding: "10px 14px",
                      marginBottom: "8px",
                      background: "rgba(255,76,76,0.08)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,76,76,0.4)"
                    }}>
                      <div style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "flex-start",
                        marginBottom: "6px"
                      }}>
                        <span style={{
                          background: link.mismatch ? "#FF4C4C" : "#FFC947",
                          color: "#000",
                          fontSize: "10px",
                          fontWeight: "bold",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          minWidth: "80px",
                          textAlign: "center",
                          flexShrink: 0
                        }}>
                          {link.mismatch ? "DECEPTIVE" : "SUSPICIOUS"}
                        </span>
                        <span style={{
                          color: "#E0E0E0",
                          fontSize: "12px"
                        }}>
                          {link.display_text || "(no text)"}
                        </span>
                      </div>
                      <div style={{
                        paddingLeft: "88px",
                        fontSize: "11px"
                      }}>
                        <div style={{ color: "#FF4C4C" }}>
                          Real URL: {realUrl.length > 50
                            ? realUrl.substring(0, 50) + "..."
                            : realUrl}
                        </div>
                        <div style={{
                          color: "#6a88b8",
                          marginTop: "4px"
                        }}>
                          {link.reason}
                        </div>
                      </div>
                    </div>
                  );
                })}
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

        {/* ── Spin keyframe ─────────────────────────────────────── */}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      </div>
    </>
  );
}

export default AnalyzePage;
