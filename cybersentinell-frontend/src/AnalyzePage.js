import React, { useState, useRef } from "react";
import {
  FaCheck,
  FaBug,
  FaFileDownload
} from "react-icons/fa";

function AnalyzePage() {
  const [emailContent, setEmailContent] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef();
  const [loadedFileName, setLoadedFileName] = useState("");

  const handleAnalyze = async () => {
    setError("");

    if (!emailContent.trim()) {
      setError("Please enter email text to analyze");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: emailContent })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      const confidence = Math.round(data.confidence * 100);

      let verdict = "Safe";
      let riskLevel = "Low";
      let color = "#00E5A0";

      if (data.prediction === "suspicious") {
        verdict = "Suspicious";
        riskLevel = "Medium";
        color = "#FFC947";
      }

      if (data.prediction === "spam") {
        verdict = "Phishing";
        riskLevel = "High";
        color = "#FF4C4C";
      }

      setResult({
        verdict,
        confidence,
        riskLevel,
        color,
        threats: data.threats || [],
        reasoning:
          data.threats?.length > 0
            ? data.threats.join(" • ")
            : "No major phishing patterns detected",
        safetyTips: data.tips || []
      });

    } catch (err) {
      setError("Unable to reach server. Please try again.");
    }

    setLoading(false);
  };

  const handleClear = () => {
    setEmailContent("");
    setResult(null);
    setLoadedFileName("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      setEmailContent(event.target.result);
      setLoadedFileName(file.name);
      setResult(null);
      setError("");
    };

    reader.readAsText(file);
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    const pdfBlock = document.getElementById("pdf-report");
    if (!pdfBlock) return;

    const canvas = await html2canvas(pdfBlock, {
      scale: 2,
      backgroundColor: "#FFFFFF"
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");

    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("CyberSentinel_Report.pdf");
  };

  return (
    <div className="analyze-page-pro">

      <h1 style={{ marginBottom: "1em" }}>
        Email Threat Analyzer
      </h1>

      {error && (
        <p style={{ color: "#FF4C4C", marginBottom: "10px", fontWeight: "500" }}>
          {error}
        </p>
      )}

      <textarea
        className="analyze-textarea-pro"
        placeholder="Paste the complete email here..."
        rows="15"
        value={emailContent}
        onChange={(e) => setEmailContent(e.target.value)}
      />

      <div style={{ marginTop: "0.8em" }}>
        <button onClick={() => fileInputRef.current.click()} style={{
          background: "none",
          border: "none",
          color: "#7FB3FF",
          cursor: "pointer",
          textDecoration: "underline"
        }}>
          Or upload a .txt or .eml file
        </button>

        <input
          type="file"
          ref={fileInputRef}
          accept=".txt,.eml"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        {loadedFileName && (
          <p style={{ color: "#00E5A0", marginTop: "5px" }}>
            Loaded: {loadedFileName}
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "1em", marginTop: "1.5em" }}>
        <button className="analyze-btn-pro" onClick={handleAnalyze} disabled={loading}>
          {loading ? "⟳ Analyzing email..." : "🔍 Analyze Email"}
        </button>

        <button className="analyze-btn-pro" onClick={handleClear} style={{
          background: "rgba(41,121,255,0.2)",
          color: "#2979FF",
          border: "2px solid rgba(41,121,255,0.4)"
        }}>
          Clear
        </button>
      </div>

      {result && (
        <div id="pdf-report">
          <div className="analyze-result-pro" style={{
            marginTop: "2.5em",
            borderLeft: `6px solid ${result.color}`,
            boxShadow: `0 0 25px ${result.color}55`,
            padding: "22px",
            borderRadius: "14px"
          }}>

            <h2 style={{ color: result.color }}>
              {result.verdict} ({result.riskLevel} Risk)
            </h2>

            <p><b>Confidence:</b> {result.confidence}%</p>

            <div style={{ marginTop: "10px", height: "8px", background: "#1e2a38" }}>
              <div style={{
                width: `${result.confidence}%`,
                height: "100%",
                background: result.color
              }} />
            </div>

            <h3 style={{ marginTop: "1.5em", color: "#2979FF" }}>AI Reasoning</h3>
            <p>{result.reasoning}</p>

            <h3 style={{ marginTop: "1.5em", color: "#2979FF" }}>Threat Indicators</h3>
            <ul>
              {result.threats.map((t, i) => (
                <li key={i}><FaBug /> {t}</li>
              ))}
            </ul>

            <h3 style={{ marginTop: "1.5em", color: "#00E5A0" }}>Safety Tips</h3>
            <ul>
              {result.safetyTips.map((t, i) => (
                <li key={i}><FaCheck /> {t}</li>
              ))}
            </ul>

            {/* 🔥 FIXED BUTTON LAYOUT */}
            <div style={{ marginTop: "2em", display: "flex", flexDirection: "column", gap: "10px" }}>

              <button onClick={downloadPDF} className="analyze-btn-pro">
                <FaFileDownload /> Download PDF Report
              </button>

              <button className="scan-again-btn" onClick={handleClear}>
                Scan Again
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default AnalyzePage;