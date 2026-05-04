import React, { useState, useRef } from "react";
import { FaBug, FaCheck, FaFileDownload } from "react-icons/fa";
import axios from "axios";

function FileScanPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef();

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileChange = (e) => {
    setError("");

    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/x-msdownload",
      "application/zip",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Unsupported file type. Please upload a PDF, EXE, ZIP, or TXT file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Please upload under 10MB.");
      return;
    }

    setSelectedFile(file);
    setFileInfo(`${file.name} (${formatFileSize(file.size)})`);
    setResult(null);
  };

  const handleScan = async () => {
    setError("");

    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(
        "http://localhost:5000/api/file-scan",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const data = response.data;

      if (!data) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const verdictRaw = data.verdict || "Unknown";
      const verdictLower = verdictRaw.toLowerCase();

      let color = "#9E9E9E";

      if (verdictLower === "clean") color = "#00E5A0";
      if (verdictLower === "suspicious") color = "#FFC947";
      if (verdictLower === "malicious") color = "#FF4C4C";

      setResult({
        verdict: verdictRaw,
        color,
        malicious: data.malicious_count ?? 0,
        total: data.total_engines ?? 0,
        hash: data.sha256_hash ?? "",
        message: data.message ?? "",
        flaggedBy: data.flagged_by ?? []
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
    setSelectedFile(null);
    setFileInfo("");
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    const element = document.getElementById("pdf-report-file");
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
    pdf.save("CyberSentinel_File_Report.pdf");
  };

  return (
    <div className="analyze-page-pro">

      <h1 style={{ marginBottom: "1em" }}>
        File Malware Scanner
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
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept=".pdf,.exe,.zip,.doc,.docx,.txt"
      />

      <button
        className="analyze-btn-pro"
        onClick={() => fileInputRef.current.click()}
      >
        📁 Choose File
      </button>

      {fileInfo && (
        <p style={{ marginTop: "1em", color: "#ccc" }}>
          Selected: {fileInfo}
        </p>
      )}

      <div style={{ display: "flex", gap: "1em", marginTop: "1.5em" }}>
        <button
          className="analyze-btn-pro"
          onClick={handleScan}
          disabled={loading}
        >
          {loading
            ? "⟳ Scanning with VirusTotal across 70+ engines..."
            : "🛡 Scan File"}
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
        <div id="pdf-report-file">
          <div className="analyze-result-pro" style={{
            marginTop: "2.5em",
            borderLeft: `6px solid ${result.color}`,
            boxShadow: `0 0 25px ${result.color}55`,
            padding: "22px",
            borderRadius: "14px"
          }}>

            <h2 style={{ color: result.color }}>
              {result.verdict}
            </h2>

            <p>
              {result.malicious} / {result.total} engines detected threat
            </p>

            <div style={{
              marginTop: "10px",
              height: "8px",
              background: "#1e2a38"
            }}>
              <div style={{
                width: `${(result.malicious / result.total) * 100 || 0}%`,
                height: "100%",
                background: result.color
              }} />
            </div>

            <p>{result.message}</p>

            {result.flaggedBy.length > 0 && (
              <>
                <h3>Detected Indicators</h3>
                <ul>
                  {result.flaggedBy.map((engine, i) => (
                    <li key={i}><FaBug /> {engine}</li>
                  ))}
                </ul>
              </>
            )}

            <h3>Safety Tips</h3>
            <ul>
              <li><FaCheck /> Do not open unknown files</li>
              <li><FaCheck /> Scan files before execution</li>
              <li><FaCheck /> Use antivirus protection</li>
            </ul>

            <p style={{ fontFamily: "monospace", fontSize: "11px" }}>
              SHA-256: {result.hash}
            </p>

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

export default FileScanPage;