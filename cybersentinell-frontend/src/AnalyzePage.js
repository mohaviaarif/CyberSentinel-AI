import React, { useState, useRef } from "react";
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

  const fileInputRef = useRef();
  const [loadedFileName, setLoadedFileName] = useState("");

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
        body: JSON.stringify({ text: emailContent })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error analyzing email.");
        setLoading(false);
        return;
      }

      const backend = data;
      const confidence = Math.round(backend.confidence * 100);

      let verdict = "Safe";
      let riskLevel = "Low";
      let color = "#00E5A0";

      if (backend.prediction === "suspicious") {
        verdict = "Suspicious";
        riskLevel = "Medium";
        color = "#FFC947";
      }

      if (backend.prediction === "spam") {
        verdict = "Phishing";
        riskLevel = "High";
        color = "#FF4C4C";
      }

      setResult({
        verdict,
        confidence,
        riskLevel,
        color,
        threats: backend.threats || [],
        reasoning:
          backend.threats?.length > 0
            ? backend.threats.join(" • ")
            : "No major phishing patterns detected",
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
    setLoadedFileName("");

    // FIX: allow same file upload again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      setEmailContent(event.target.result);
      setLoadedFileName(file.name);
      setResult(null);
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

  const getGlow = () => {
    if (!result) return "none";
    return `0 0 25px ${result.color}55`;
  };

  return (
    <div className="analyze-page-pro">
      <h1 style={{ marginBottom: "1em" }}>Email Threat Analyzer</h1>

      <textarea
        className="analyze-textarea-pro"
        placeholder="Paste the complete email here..."
        rows="15"
        value={emailContent}
        onChange={(e) => setEmailContent(e.target.value)}
      />

      <div style={{ marginTop: "0.8em" }}>
        <button
          onClick={() => fileInputRef.current.click()}
          style={{
            background: "none",
            border: "none",
            color: "#7FB3FF",
            fontSize: "0.9em",
            cursor: "pointer",
            textDecoration: "underline"
          }}
        >
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
          <p style={{ color: "#00E5A0", fontSize: "0.85em", marginTop: "0.3em" }}>
            Loaded: {loadedFileName}
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "1em", marginTop: "1.5em" }}>
        <button
          className="analyze-btn-pro"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "⟳ Analyzing..." : "🔍 Analyze Email"}
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
        <div id="pdf-report">
          <div
            className="analyze-result-pro"
            style={{
              marginTop: "2.5em",
              borderLeft: `6px solid ${result.color}`,
              boxShadow: getGlow(),
              transition: "0.3s ease"
            }}
          >
            <h2 style={{ color: result.color }}>
              {result.verdict} ({result.riskLevel} Risk)
            </h2>

            <p style={{ marginTop: "1em", fontSize: "1.2em" }}>
              <b>Confidence:</b> {result.confidence}%
            </p>

            <div style={{ marginTop: "1.5em" }}>
              <h3 style={{ color: "#2979FF" }}>AI Reasoning</h3>
              <p style={{ color: "#A4C7EC" }}>{result.reasoning}</p>
            </div>

            <h3 style={{ marginTop: "1.5em", color: "#2979FF" }}>
              Threat Indicators
            </h3>

            <ul>
              {result.threats.map((t, i) => (
                <li key={i} style={{ display: "flex", gap: "0.5em" }}>
                  <FaBug color="#FF4C4C" /> {t}
                </li>
              ))}
            </ul>

            <h3 style={{ marginTop: "1.5em", color: "#00E5A0" }}>
              Safety Tips
            </h3>

            <ul>
              {result.safetyTips.map((t, i) => (
                <li key={i} style={{ display: "flex", gap: "0.5em" }}>
                  <FaCheck color="#00E5A0" /> {t}
                </li>
              ))}
            </ul>

            <button
              onClick={downloadPDF}
              className="analyze-btn-pro"
              style={{
                marginTop: "2em",
                display: "flex",
                alignItems: "center",
                gap: "0.7em"
              }}
            >
              <FaFileDownload /> Download PDF Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyzePage;