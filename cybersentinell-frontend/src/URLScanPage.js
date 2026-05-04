import React, { useState } from "react";
import {
  FaCheck,
  FaBug,
  FaFileDownload
} from "react-icons/fa";
import axios from "axios";

function URLScanPage() {
  const [urlInput, setUrlInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setError("");

    if (!urlInput.trim()) {
      setError("Please enter a URL to analyze");
      return;
    }

    if (!/^https?:\/\//i.test(urlInput)) {
      setError("Please enter a valid URL starting with http or https");
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
        setError(data?.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const res = data.result?.toLowerCase();

      const confidence =
        data.confidence <= 1
          ? Math.round(data.confidence * 100)
          : Math.round(data.confidence);

      let verdict = "Safe";
      let riskLevel = "Low";
      let color = "#00E5A0";

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

      setResult({
        verdict,
        confidence,
        riskLevel,
        color,
        score: data.score || 0,
        threats: data.threat_indicators || [],
        safetyTips: data.tips || []
      });

    } catch (error) {
      if (error.response) {
        const msg =
          error.response.data?.error ||
          "Something went wrong. Please try again.";
        setError(msg);
      } else if (error.request) {
        setError("Unable to reach server. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }

      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const handleClear = () => {
    setUrlInput("");
    setResult(null);
    setError("");
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    const element = document.getElementById("pdf-report-url");
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff"
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");

    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("CyberSentinel_URL_Report.pdf");
  };

  return (
    <div className="analyze-page-pro">

      <h1 style={{ marginBottom: "1em" }}>
        URL Threat Scanner
      </h1>

      {error && (
        <p style={{
          color: "#FF4C4C",
          marginBottom: "10px",
          fontWeight: "500"
        }}>
          {error}
        </p>
      )}

      <input
        type="text"
        className="analyze-input-pro"
        placeholder="Enter URL to scan"
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
      />

      <div style={{ display: "flex", gap: "1em", marginTop: "1.5em" }}>
        <button
          className="analyze-btn-pro"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "⟳ Checking URL..." : "🔍 Analyze URL"}
        </button>

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
        <div id="pdf-report-url">
          <div
            className="analyze-result-pro"
            style={{
              marginTop: "2.5em",
              borderLeft: `6px solid ${result.color}`,
              boxShadow: `0 0 25px ${result.color}55`,
              padding: "22px",
              borderRadius: "14px"
            }}
          >

            <h2 style={{ color: result.color }}>
              {result.verdict} ({result.riskLevel} Risk)
            </h2>

            <p><b>Confidence:</b> {result.confidence}%</p>

            <p style={{ fontWeight: "bold", color: result.color }}>
              Threat Score: {result.score}
            </p>

            <div style={{
              marginTop: "10px",
              height: "8px",
              background: "#1e2a38"
            }}>
              <div style={{
                width: `${result.confidence}%`,
                height: "100%",
                background: result.color
              }} />
            </div>

            <h3 style={{ marginTop: "1.5em", color: "#2979FF" }}>
              Threat Indicators
            </h3>

            <ul>
              {result.threats.map((t, i) => (
                <li key={i}><FaBug /> {t}</li>
              ))}
            </ul>

            <h3 style={{ marginTop: "1.5em", color: "#00E5A0" }}>
              Safety Tips
            </h3>

            <ul>
              {result.safetyTips.map((t, i) => (
                <li key={i}><FaCheck /> {t}</li>
              ))}
            </ul>

            {/* 🔥 FIXED BUTTON SECTION */}
            <div style={{
              marginTop: "2em",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}>

              <button
                onClick={downloadPDF}
                className="analyze-btn-pro"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.7em"
                }}
              >
                <FaFileDownload /> Download PDF Report
              </button>

              <button
                className="scan-again-btn"
                onClick={handleClear}
              >
                Scan Again
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default URLScanPage;