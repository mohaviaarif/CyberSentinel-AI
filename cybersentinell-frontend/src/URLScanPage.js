import React, { useState } from "react";
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaCheck,
  FaBug,
  FaFileDownload
} from "react-icons/fa";
import axios from "axios";

function URLScanPage() {
  const [urlInput, setUrlInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!urlInput.trim()) {
      alert("Please enter a URL to scan");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/url-scan",
        { url: urlInput }
      );

      const data = response.data;

      if (!data || !data.success || !data.result) {
        alert(data?.error || "Invalid response from server.");
        setLoading(false);
        return;
      }

      const backend = data;
      const res = backend.result?.toLowerCase();

      let confidenceRaw = backend.confidence || 0;
      const confidence =
        confidenceRaw <= 1
          ? Math.round(confidenceRaw * 100)
          : Math.round(confidenceRaw);

      let verdict = "Safe";
      let riskLevel = "Low";
      let color = "#00BFAE";

      if (res === "suspicious") {
        verdict = "Suspicious";
        riskLevel = "Medium";
        color = "#FFC947";
      }

      if (res === "malicious") {
        verdict = "Malicious";
        riskLevel = "High";
        color = "#FF4C4C";
      }

      try {
        const prev = parseInt(
          localStorage.getItem("urlScannedCount") || "0",
          10
        );
        localStorage.setItem("urlScannedCount", String(prev + 1));
      } catch (e) {
        console.warn("LocalStorage error", e);
      }

      setResult({
        verdict,
        confidence,
        riskLevel,
        color,
        score: backend.score || 0,
        threats: backend.threat_indicators || [],
        safetyTips: backend.tips || []
      });
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.error ||
        err.message ||
        "Backend connection error.";

      alert(message);
    }

    setLoading(false);
  };

  const handleClear = () => {
    setUrlInput("");
    setResult(null);
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    const original = document.getElementById("pdf-report-url");
    if (!original) return;

    const clone = original.cloneNode(true);

    clone.style.display = "block";
    clone.style.position = "absolute";
    clone.style.top = "-9999px";
    clone.style.left = "0";
    clone.style.background = "#ffffff";
    clone.style.color = "#000000";
    clone.style.width = "800px";
    clone.style.padding = "30px";
    clone.style.fontFamily = "Arial";
    clone.style.boxShadow = "none";

    document.body.appendChild(clone);

    const canvas = await html2canvas(clone, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true
    });

    document.body.removeChild(clone);

    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");

    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("CyberSentinel_URL_Report.pdf");
  };

  const getGlowClass = () => {
    if (!result) return "";
    if (result.riskLevel === "High") return "glow-danger";
    if (result.riskLevel === "Medium") return "glow-warning";
    return "";
  };

  const timestamp = new Date().toLocaleString();

  return (
    <div className="analyze-page-pro">
      <h1>URL Threat Scanner</h1>

      <input
        type="text"
        className="analyze-input-pro"
        placeholder="Enter URL to scan e.g. http://example.com"
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
      />

      <div style={{ display: "flex", gap: "1em", marginTop: "1.5em" }}>
        <button
          className="analyze-btn-pro"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "⟳ Analyzing..." : "🔍 Analyze URL"}
        </button>

        {/* ✅ FIXED CLEAR BUTTON */}
        <button
          className="analyze-btn-pro"
          onClick={handleClear}
          style={{
            background: "rgba(41,121,255,0.2)",
            color: "#2979FF",
            border: "2px solid rgba(41,121,255,0.4)"
          }}
        >
          Clear
        </button>
      </div>

      {result && (
        <>
          <div
            className={`analyze-result-pro ${getGlowClass()}`}
            style={{
              marginTop: "2.5em",
              borderLeft: `6px solid ${result.color}`
            }}
          >
            <h2 style={{ color: result.color }}>
              {result.verdict} ({result.riskLevel})
            </h2>

            <p style={{ color: result.color, fontWeight: 700 }}>
              Threat Score: {result.score}
            </p>

            <p>Confidence: {result.confidence}%</p>

            <h3>Threat Indicators</h3>
            <ul>
              {result.threats.map((t, i) => (
                <li key={i}>
                  <FaBug color="#FF4C4C" /> {t}
                </li>
              ))}
            </ul>

            <h3>Safety Tips</h3>
            <ul>
              {result.safetyTips.map((t, i) => (
                <li key={i}>
                  <FaCheck color="#00BFAE" /> {t}
                </li>
              ))}
            </ul>

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
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.7em"
              }}
            >
              <FaFileDownload /> Download PDF Report
            </button>
          </div>

          <div
            id="pdf-report-url"
            style={{
              background: "#ffffff",
              color: "#000000",
              padding: "30px",
              width: "800px",
              display: "none",
              fontFamily: "Arial"
            }}
          >
            <h1>CyberSentinel AI — URL Scan Report</h1>
            <p>Generated on: {timestamp}</p>

            <h2>
              Verdict: {result.verdict} ({result.riskLevel})
            </h2>

            <h3>Threat Score</h3>
            <p>{result.score}</p>

            <h3>Confidence</h3>
            <p>{result.confidence}%</p>

            <h3>Threat Indicators</h3>
            <ul>
              {result.threats.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>

            <h3>Safety Tips</h3>
            <ul>
              {result.safetyTips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default URLScanPage;