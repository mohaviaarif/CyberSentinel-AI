import React, { useState } from "react";
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaCheck,
  FaBug,
  FaFileDownload
} from "react-icons/fa";

function AnalyzePage() {
  const [emailContent, setEmailContent] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------
  // 🔥 BACKEND REQUEST
  // -------------------------------------------------
  const handleAnalyze = async () => {
    if (!emailContent.trim()) {
      alert("Please paste an email to analyze");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_text: emailContent })
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.error || "Error analyzing email.");
        setLoading(false);
        return;
      }

      const backend = data.result;
      const confidence = Math.round(backend.confidence * 100);

      let verdict = "Safe";
      let riskLevel = "Low";
      let color = "#00BFAE";

      if (backend.label === "suspicious") {
        verdict = "Suspicious";
        riskLevel = "Medium";
        color = "#FFC947";
      }

      if (backend.label === "spam") {
        verdict = "Phishing";
        riskLevel = "High";
        color = "#FF4C4C";
      }

      // -------------------------------------------------
      // ✅ UPDATE EMAIL COUNTER FOR DASHBOARD
      // -------------------------------------------------
      try {
        const prev = parseInt(
          localStorage.getItem("emailAnalyzedCount") || "0",
          10
        );
        localStorage.setItem("emailAnalyzedCount", String(prev + 1));
      } catch (e) {
        console.warn("Could not update emailAnalyzedCount in localStorage", e);
      }

      setResult({
        verdict,
        confidence,
        riskLevel,
        color,
        threats: backend.threats || [],
        reasoning: backend.reasoning || "No harmful indicators detected.",
        safetyTips: backend.tips || []
      });
    } catch (err) {
      console.error(err);
      alert("Backend connection error.");
    }

    setLoading(false);
  };

  const handleClear = () => {
    setEmailContent("");
    setResult(null);
  };

  // -------------------------------------------------
  // 📄 PROFESSIONAL PDF EXPORT SYSTEM
  // -------------------------------------------------
  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    const pdfBlock = document.getElementById("pdf-report");
    if (!pdfBlock) return;

    pdfBlock.style.display = "block";

    const canvas = await html2canvas(pdfBlock, {
      scale: 2,
      backgroundColor: "#FFFFFF"
    });

    pdfBlock.style.display = "none";

    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");

    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("CyberSentinel_Report.pdf");
  };

  // -------------------------------------------------
  // ⚡ Glow Effect Class
  // -------------------------------------------------
  const getGlowClass = () => {
    if (!result) return "";
    if (result.riskLevel === "High") return "glow-danger";
    if (result.riskLevel === "Medium") return "glow-warning";
    return "";
  };

  const timestamp = new Date().toLocaleString();

  return (
    <div className="analyze-page-pro">
      <h1>Email Threat Analyzer</h1>

      {/* ------------------------- INPUT BOX ------------------------- */}
      <textarea
        className="analyze-input-pro"
        placeholder="Paste the complete email here..."
        rows="15"
        value={emailContent}
        onChange={(e) => setEmailContent(e.target.value)}
      />

      {/* BUTTONS */}
      <div style={{ display: "flex", gap: "1em", marginTop: "1.5em" }}>
        <button
          className="analyze-btn-pro"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "⟳ Analyzing..." : "🔍 Analyze Email"}
        </button>

        <button
          onClick={handleClear}
          style={{
            padding: "1.2em 2.5em",
            background: "rgba(41,121,255,0.2)",
            color: "#2979FF",
            border: "2px solid rgba(41,121,255,0.4)",
            borderRadius: "1.5em",
            fontWeight: 700,
            fontSize: "1.1em",
            cursor: "pointer"
          }}
        >
          Clear
        </button>
      </div>

      {/* ------------------------- RESULT CARD ------------------------- */}
      {result && (
        <>
          <div
            className={`analyze-result-pro ${getGlowClass()}`}
            style={{
              marginTop: "2.5em",
              borderLeft: `6px solid ${result.color}`
            }}
          >
            {/* HEADER */}
            <h2
              style={{
                fontSize: "2.2em",
                color: result.color,
                display: "flex",
                alignItems: "center",
                gap: "0.5em",
                fontWeight: 800
              }}
            >
              {result.verdict === "Phishing" && (
                <FaExclamationTriangle size={30} color={result.color} />
              )}
              {result.verdict === "Suspicious" && (
                <FaInfoCircle size={30} color={result.color} />
              )}
              {result.verdict === "Safe" && (
                <FaCheckCircle size={30} color={result.color} />
              )}

              {result.verdict}

              <span
                style={{
                  background: result.color + "22",
                  color: result.color,
                  padding: "0.3em 0.8em",
                  borderRadius: "1em",
                  fontSize: "0.6em",
                  fontWeight: 700
                }}
              >
                {result.riskLevel} Risk
              </span>
            </h2>

            {/* CONFIDENCE METER */}
            <div
              style={{
                marginTop: "1.8em",
                display: "flex",
                alignItems: "center",
                gap: "2em"
              }}
            >
              <div className="confidence-ring">
                <svg width="130" height="130">
                  <circle
                    cx="65"
                    cy="65"
                    r="55"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="65"
                    cy="65"
                    r="55"
                    stroke={result.color}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 55}
                    strokeDashoffset={
                      2 * Math.PI * 55 * (1 - result.confidence / 100)
                    }
                    style={{
                      transition: "stroke-dashoffset 1s ease",
                      filter: `drop-shadow(0px 0px 6px ${result.color})`
                    }}
                  />
                </svg>

                <div className="confidence-text">{result.confidence}%</div>
              </div>

              <div>
                <h3 style={{ color: "#2979FF" }}>AI Reasoning</h3>
                <p style={{ color: "#A4C7EC" }}>{result.reasoning}</p>
              </div>
            </div>

            {/* THREATS */}
            <h3 style={{ marginTop: "1.5em", color: "#2979FF" }}>
              Detected Threat Indicators
            </h3>

            {result.threats.length === 0 ? (
              <p
                style={{
                  background: "#ff4c4c22",
                  padding: "0.7em 1.2em",
                  borderRadius: "0.8em",
                  width: "fit-content",
                  color: "#FF4C4C",
                  fontWeight: 700
                }}
              >
                No major phishing patterns detected
              </p>
            ) : (
              <ul>
                {result.threats.map((t, i) => (
                  <li
                    key={i}
                    style={{
                      marginBottom: "0.6em",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5em"
                    }}
                  >
                    <FaBug color="#FF4C4C" /> {t}
                  </li>
                ))}
              </ul>
            )}

            {/* SAFETY TIPS */}
            <h3 style={{ marginTop: "1.5em", color: "#00BFAE" }}>
              Safety Recommendations
            </h3>

            <ul>
              {result.safetyTips.map((t, i) => (
                <li
                  key={i}
                  style={{
                    marginBottom: "0.6em",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5em"
                  }}
                >
                  <FaCheck color="#00BFAE" /> {t}
                </li>
              ))}
            </ul>

            {/* PDF BUTTON */}
            <button
              onClick={downloadPDF}
              style={{
                marginTop: "2em",
                padding: "1em 2.5em",
                background: "linear-gradient(90deg, #2979FF, #00BFAE)",
                borderRadius: "1em",
                border: "none",
                color: "white",
                fontWeight: 700,
                fontSize: "1em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.7em",
                boxShadow: "0px 8px 20px rgba(41,121,255,0.3)"
              }}
            >
              <FaFileDownload /> Download PDF Report
            </button>
          </div>

          {/* ====== HIDDEN PDF TEMPLATE ====== */}
          <div
            id="pdf-report"
            style={{
              background: "#FFFFFF",
              color: "#000000",
              padding: "30px",
              width: "800px",
              display: "none",
              fontFamily: "Arial"
            }}
          >
            <h1 style={{ color: result.color, marginBottom: "0" }}>
              CyberSentinel AI — Threat Report
            </h1>

            <p style={{ fontSize: "0.9em", opacity: 0.7 }}>
              Generated on: {timestamp}
            </p>

            <hr style={{ margin: "15px 0" }} />

            <h2 style={{ color: result.color }}>
              Verdict: {result.verdict} ({result.riskLevel} Risk)
            </h2>

            <h3>Confidence Score</h3>
            <p>{result.confidence}%</p>

            <h3>AI Reasoning</h3>
            <p>{result.reasoning}</p>

            <h3>Detected Threat Indicators</h3>
            {result.threats.length === 0 ? (
              <p>No major phishing patterns detected.</p>
            ) : (
              <ul>
                {result.threats.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            )}

            <h3>Safety Recommendations</h3>
            <ul>
              {result.safetyTips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>

            <hr style={{ margin: "20px 0" }} />

            <p style={{ opacity: 0.6, fontSize: "0.85em" }}>
              Report generated by CyberSentinel AI — Smart Email Threat
              Detection
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default AnalyzePage;
