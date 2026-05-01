import React, { useState, useRef } from "react";
import { FaBug } from "react-icons/fa";
import axios from "axios";

function FileScanPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef();

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Please upload a file under 10 MB.");
      return;
    }

    setSelectedFile(file);
    setFileInfo(`${file.name} (${formatFileSize(file.size)})`);
    setResult(null);
  };

  const handleScan = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
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
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      const data = response.data;

      if (!data) {
        alert("Invalid response from server.");
        setLoading(false);
        return;
      }

      const verdictRaw = data.verdict || "Unknown";

      // ✅ FIX (safe lowercase)
      const verdictLower = verdictRaw?.toLowerCase();

      let color = "#9E9E9E";

      if (verdictLower === "clean") color = "#00BFAE";
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

    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.error ||
        err.message ||
        "File scan failed.";

      alert(message);
    }

    setLoading(false);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setFileInfo("");
    setResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="analyze-page-pro">
      <h1>File Malware Scanner</h1>

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
        <div
          className="analyze-result-pro"
          style={{
            marginTop: "2.5em",
            borderLeft: `6px solid ${result.color}`
          }}
        >
          <h2 style={{ color: result.color }}>
            {result.verdict}
          </h2>

          <p>
            {result.malicious} / {result.total} engines detected threat
          </p>

          <p
            style={{
              fontFamily: "monospace",
              fontSize: "11px",
              wordBreak: "break-all"
            }}
          >
            SHA-256 Hash: {result.hash}
          </p>

          <p>{result.message}</p>

          {result.flaggedBy.length > 0 && (
            <>
              <h3>Flagged By Engines</h3>
              <ul>
                {result.flaggedBy.map((engine, i) => (
                  <li key={i}>
                    <FaBug color="#FF4C4C" /> {engine}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FileScanPage;