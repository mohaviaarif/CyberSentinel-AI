import React, { useState, useRef } from "react";
import {
  FaBug,
  FaCheck,
  FaFileDownload,
  FaShieldAlt,
  FaExclamationTriangle,
  FaTimesCircle,
  FaFileAlt,
  FaLightbulb,
  FaUpload,
  FaTimes,
  FaLock,
} from "react-icons/fa";
import axios from "axios";

// ─── Engine detection bar ─────────────────────────────────────────────────────
function EngineBar({ malicious, total, color }) {
  const pct = total > 0 ? Math.round((malicious / total) * 100) : 0;
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: "14px 18px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 10,
      }}>
        <span style={{ fontSize: "0.78em", color: "#3a5a75", letterSpacing: 1, textTransform: "uppercase" }}>
          Engine Detection
        </span>
        <span style={{ fontSize: "1.1em", fontWeight: 800, color }}>
          {malicious}
          <span style={{ fontSize: "0.6em", color: "#3a5a75", fontWeight: 400 }}>
            &nbsp;/ {total} engines
          </span>
        </span>
      </div>
      <div style={{
        height: 8, background: "rgba(255,255,255,0.06)",
        borderRadius: 100, overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 100,
          transition: "width 1s cubic-bezier(.4,0,.2,1)",
          minWidth: pct > 0 ? 4 : 0,
        }} />
      </div>
      <div style={{
        marginTop: 6, fontSize: "0.75em", color: "#2a4a65", textAlign: "right",
      }}>
        {pct}% detection rate
      </div>
    </div>
  );
}

// ─── Verdict badge ────────────────────────────────────────────────────────────
function VerdictBadge({ verdict, color }) {
  const icons = {
    Clean:      <FaShieldAlt />,
    Suspicious: <FaExclamationTriangle />,
    Malicious:  <FaTimesCircle />,
    Unknown:    <FaFileAlt />,
    Pending:    <FaUpload />,
    "Upload Failed": <FaExclamationTriangle />,
    Error:      <FaExclamationTriangle />,
  };
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      background: color + "18",
      border: `1.5px solid ${color}55`,
      borderRadius: 100, padding: "8px 20px",
      fontSize: "1em", fontWeight: 700,
      color, letterSpacing: 0.5, marginBottom: 4,
    }}>
      <span style={{ fontSize: "1.1em" }}>{icons[verdict] || <FaFileAlt />}</span>
      {verdict.toUpperCase()}
    </div>
  );
}

// ─── File drop zone ───────────────────────────────────────────────────────────
function FileDropZone({ onFileSelect, selectedFile, fileInfo, onClear }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onClick={() => !selectedFile && inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging
          ? "rgba(41,121,255,0.7)"
          : selectedFile
            ? "rgba(0,229,160,0.4)"
            : "rgba(41,121,255,0.2)"}`,
        borderRadius: "1.4em",
        padding: selectedFile ? "20px 24px" : "40px 24px",
        textAlign: "center",
        cursor: selectedFile ? "default" : "pointer",
        background: dragging
          ? "rgba(41,121,255,0.06)"
          : selectedFile
            ? "rgba(0,229,160,0.04)"
            : "rgba(255,255,255,0.02)",
        transition: "all 0.25s ease",
        marginBottom: "1.5em",
      }}
    >
      <input
        type="file"
        ref={inputRef}
        style={{ display: "none" }}
        accept=".pdf,.exe,.zip,.doc,.docx,.txt,.js,.py,.xls,.xlsx,.csv,.json,.dll,.bat,.ps1"
        onChange={(e) => {
          if (e.target.files[0]) onFileSelect(e.target.files[0]);
          e.target.value = "";
        }}
      />

      {selectedFile ? (
        /* File selected state */
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: "rgba(0,229,160,0.12)",
              border: "1px solid rgba(0,229,160,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#00E5A0", fontSize: "1.1em", flexShrink: 0,
            }}>
              <FaFileAlt />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, color: "#F2F6FF", fontSize: "0.95em" }}>
                {selectedFile.name}
              </div>
              <div style={{ color: "#3a5a75", fontSize: "0.78em", marginTop: 2 }}>
                {fileInfo}
              </div>
            </div>
          </div>
          <FaTimes
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            style={{ color: "#3a5a75", cursor: "pointer", fontSize: "0.9em", flexShrink: 0 }}
          />
        </div>
      ) : (
        /* Empty state */
        <>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "rgba(41,121,255,0.1)",
            border: "1px solid rgba(41,121,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#4a88ff", fontSize: "1.3em",
            margin: "0 auto 14px",
          }}>
            <FaUpload />
          </div>
          <div style={{ color: "#F2F6FF", fontWeight: 600, marginBottom: 6 }}>
            {dragging ? "Drop file here" : "Click or drag file here"}
          </div>
          <div style={{ color: "#3a5a75", fontSize: "0.8em" }}>
            Supported: PDF, EXE, ZIP, DOCX, TXT, JS, PY, XLS and more • Max 32MB
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function FileScanPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo,     setFileInfo]     = useState("");
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  const formatFileSize = (bytes) => {
    if (bytes < 1024)           return bytes + " B";
    if (bytes < 1024 * 1024)   return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // ── File selection ──────────────────────────────────────────────────────────
  const handleFileSelect = (file) => {
    setError("");
    setResult(null);

    const ext = file.name.split(".").pop().toLowerCase();
    const allowed = ["pdf","exe","zip","doc","docx","txt","js","py","xls","xlsx","csv","json","dll","bat","ps1"];

    if (!allowed.includes(ext)) {
      setError(`Unsupported file type (.${ext}). Allowed: PDF, EXE, ZIP, DOCX, TXT, JS, PY, XLS...`);
      return;
    }
    if (file.size > 32 * 1024 * 1024) {
      setError(`File too large (${formatFileSize(file.size)}). Maximum allowed size is 32MB.`);
      return;
    }

    setSelectedFile(file);
    setFileInfo(`${formatFileSize(file.size)} • .${ext.toUpperCase()}`);
  };

  // ── Scan handler ────────────────────────────────────────────────────────────
  const handleScan = async () => {
    setError("");
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }
    if (loading) return;
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const userEmail = localStorage.getItem("userEmail") || "";
      const response = await axios.post(
        "http://localhost:5000/api/file-scan",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-User-Email": userEmail,
          },
        }
      );

      const data = response.data;
      if (!data) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const verdictRaw   = data.verdict || "Unknown";
      const verdictLower = verdictRaw.toLowerCase();

      let color     = "#9E9E9E"; // Unknown / grey
      let glowClass = "";

      if (verdictLower === "clean")     { color = "#00E5A0"; }
      if (verdictLower === "suspicious"){ color = "#FFC947"; glowClass = "glow-warning"; }
      if (verdictLower === "malicious") { color = "#FF4C4C"; glowClass = "glow-danger"; }
      if (verdictLower === "pending")   { color = "#2979FF"; }
      if (verdictLower === "upload failed") { color = "#FF9800"; }

      const message = verdictLower === "pending"
        ? "File submitted for live analysis"
        : (data.message ?? "");

      setResult({
        verdict:   verdictRaw,
        color,
        glowClass,
        malicious: data.malicious_count  ?? 0,
        suspicious: data.suspicious_count ?? 0,
        total:     data.total_engines    ?? 0,
        hash:      data.sha256_hash      ?? "",
        message,
        flaggedBy: data.flagged_by       ?? [],
        fileDeleted: data.file_deleted   ?? false,
        filename:  selectedFile.name,
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

  // ── Clear ───────────────────────────────────────────────────────────────────
  const handleClear = () => {
    setSelectedFile(null);
    setFileInfo("");
    setResult(null);
    setError("");
  };

  // ── PDF download ────────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    const { jsPDF }   = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;
    const element     = document.getElementById("pdf-report-file");
    if (!element) return;
    const canvas  = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
    const pdf     = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");
    const width   = pdf.internal.pageSize.getWidth();
    const height  = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("CyberSentinel_File_Report.pdf");
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
        @keyframes scanPulse {
          0%,100% { opacity: 0.5; transform: scaleX(0.95); }
          50%     { opacity: 1;   transform: scaleX(1); }
        }
        .file-result-in { animation: slideUp 0.45s cubic-bezier(.16,1,.32,1); }
        .file-engine-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 12px; border-radius: 8px;
          background: rgba(255,76,76,0.07);
          border: 1px solid rgba(255,76,76,0.15);
          margin-bottom: 6px;
          font-size: 0.88em; color: #d4a0a0;
          font-family: monospace;
          transition: border-color 0.2s;
        }
        .file-engine-item:hover { border-color: rgba(255,76,76,0.35); }
        .file-tip-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 14px; border-radius: 10px;
          background: rgba(0,229,160,0.06);
          border: 1px solid rgba(0,229,160,0.15);
          margin-bottom: 8px;
          font-size: 0.93em; color: #90d4b8; line-height: 1.5;
        }
        .section-label-file {
          font-size: 0.72em; font-weight: 700; letter-spacing: 1.8px;
          text-transform: uppercase; margin-bottom: 10px;
          display: flex; align-items: center; gap: 6px;
        }
        .loading-shimmer-file {
          background: linear-gradient(90deg,
            rgba(41,121,255,0.06) 25%,
            rgba(41,121,255,0.14) 50%,
            rgba(41,121,255,0.06) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 14px;
        }
        .scan-progress-bar {
          height: 3px;
          background: linear-gradient(90deg, #2979FF, #00BFAE, #2979FF);
          background-size: 200% 100%;
          animation: scanPulse 1.5s ease-in-out infinite;
          border-radius: 100%;
          margin-bottom: 12px;
        }
      `}</style>

      <div className="analyze-page-pro">

        {/* ── Page header ───────────────────────────────────────── */}
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
            <FaFileAlt style={{ fontSize: "0.9em" }} />
            Module 3 — Malware File Scanner
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
            File Malware Scanner
          </h1>

          <p style={{ margin: 0, color: "#5a7a95", fontSize: "0.95em", lineHeight: 1.6 }}>
            Upload any file to scan it against 70+ antivirus engines via VirusTotal.
            Files are hashed and deleted immediately — never stored on our server.
          </p>
        </div>

        {/* ── Privacy notice ────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(0,229,160,0.05)",
          border: "1px solid rgba(0,229,160,0.15)",
          borderRadius: 10, padding: "10px 16px",
          marginBottom: "1.5em",
          fontSize: "0.82em", color: "#4aaa88",
        }}>
          <FaLock style={{ flexShrink: 0, fontSize: "0.9em" }} />
          Privacy protected — files are SHA-256 hashed and deleted immediately.
          Only the hash is sent to VirusTotal. Your file content never leaves your device.
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

        {/* ── Drop zone ─────────────────────────────────────────── */}
        <FileDropZone
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          fileInfo={fileInfo}
          onClear={handleClear}
        />

        {/* ── Action buttons ────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            className="analyze-btn-pro"
            onClick={handleScan}
            disabled={loading || !selectedFile}
            style={{
              marginTop: 0,
              opacity: (loading || !selectedFile) ? 0.65 : 1,
              cursor: (loading || !selectedFile) ? "not-allowed" : "pointer",
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
                Scanning...
              </>
            ) : (
              <>Scan File</>
            )}
          </button>

          {(selectedFile || result) && (
            <button
              onClick={handleClear}
              style={{
                marginTop: 0, padding: "1.2em 2em",
                background: "rgba(255,255,255,0.04)",
                border: "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: "1.5em", color: "#5a7a95",
                fontWeight: 600, fontSize: "1em",
                cursor: "pointer", transition: "all 0.2s",
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

        {/* ── Loading state ─────────────────────────────────────── */}
        {loading && (
          <div style={{ marginTop: "2em" }}>
            <div className="scan-progress-bar" />
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 12,
            }}>
              <span style={{ fontSize: "0.85em", color: "#4a88ff", fontWeight: 600 }}>
                Querying VirusTotal across 70+ antivirus engines...
              </span>
            </div>
            <div className="loading-shimmer-file" style={{ height: 10, width: "60%", marginBottom: 8 }} />
            <div className="loading-shimmer-file" style={{ height: 8,  width: "80%", marginBottom: 8 }} />
            <div className="loading-shimmer-file" style={{ height: 8,  width: "40%" }} />
          </div>
        )}

        {/* ── Result card ───────────────────────────────────────── */}
        {result && (
          <div id="pdf-report-file" className={`file-result-in ${result.glowClass}`} style={{
            marginTop: "2.5em",
            background: "rgba(15,20,30,0.8)",
            border: `1.5px solid ${result.color}30`,
            borderLeft: `5px solid ${result.color}`,
            borderRadius: "1.6em",
            padding: "2em 2.2em",
            backdropFilter: "blur(8px)",
          }}>

            {/* Filename display */}
            <div style={{
              marginBottom: "1.5em", padding: "8px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10, fontSize: "0.8em",
              color: "#3a5a75", fontFamily: "monospace",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <FaFileAlt style={{ color: "#2a4a65" }} />
              <span style={{ color: "#2a4a65", marginRight: 4 }}>Scanned:</span>
              {result.filename}
            </div>

            {/* Verdict row */}
            <div style={{
              display: "flex", alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap", gap: 20,
              marginBottom: "2em",
              paddingBottom: "1.5em",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div>
                <VerdictBadge verdict={result.verdict} color={result.color} />
                <div style={{ marginTop: 12 }}>
                  <EngineBar
                    malicious={result.malicious}
                    total={result.total}
                    color={result.color}
                  />
                </div>
              </div>

              {/* File deleted confirmation */}
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 6, padding: "16px 20px",
                background: "rgba(0,229,160,0.06)",
                border: "1px solid rgba(0,229,160,0.15)",
                borderRadius: 14, minWidth: 110,
              }}>
                <FaLock style={{ color: "#00E5A0", fontSize: "1.3em" }} />
                <span style={{ fontSize: "0.72em", color: "#4aaa88", textAlign: "center", letterSpacing: 0.5 }}>
                  FILE DELETED
                </span>
                <span style={{ fontSize: "0.68em", color: "#2a5a45", textAlign: "center" }}>
                  Privacy protected
                </span>
              </div>
            </div>

            {/* Result message */}
            {result.message && (
              <div style={{
                marginBottom: "1.8em",
                padding: "12px 16px",
                background: `${result.color}0a`,
                border: `1px solid ${result.color}25`,
                borderRadius: 12,
                color: "#A4C7EC", fontSize: "0.9em", lineHeight: 1.6,
              }}>
                {result.message}
              </div>
            )}

            {/* SHA-256 hash */}
            <div style={{ marginBottom: "1.8em" }}>
              <div className="section-label-file" style={{ color: "#5a7a95" }}>
                SHA-256 Hash
              </div>
              <div style={{
                fontFamily: "monospace", fontSize: "0.78em",
                color: "#3a5a75", wordBreak: "break-all",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, letterSpacing: 0.5,
              }}>
                {result.hash || "—"}
              </div>
            </div>

            {/* Flagged by engines */}
            {result.flaggedBy.length > 0 && (
              <div style={{ marginBottom: "1.8em" }}>
                <div className="section-label-file" style={{ color: "#FF4C4C" }}>
                  <FaBug style={{ fontSize: "0.9em" }} />
                  Flagged By ({result.flaggedBy.length} engines)
                </div>
                <div style={{ maxHeight: 200, overflowY: "auto" }}>
                  {result.flaggedBy.map((engine, i) => (
                    <div key={i} className="file-engine-item">
                      <FaTimesCircle style={{ color: "#FF4C4C", flexShrink: 0, fontSize: "0.8em" }} />
                      {engine}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clean message */}
            {result.flaggedBy.length === 0 && result.verdict !== "Unknown" && (
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
                No antivirus engines detected malicious content in this file.
              </div>
            )}

            {/* Safety tips */}
            <div style={{ marginBottom: "2em" }}>
              <div className="section-label-file" style={{ color: "#00E5A0" }}>
                <FaLightbulb style={{ fontSize: "0.9em" }} />
                Safety Recommendations
              </div>
              {[
                "Never open executable files (.exe, .bat, .ps1) from unknown sources",
                "Even a Clean result does not guarantee absolute safety — exercise caution",
                "Keep your antivirus software updated for the latest threat definitions",
                "If in doubt, do not open the file — contact your IT department",
              ].map((tip, i) => (
                <div key={i} className="file-tip-item">
                  <FaCheck style={{
                    color: "#00E5A0", flexShrink: 0,
                    fontSize: "0.85em", marginTop: 2,
                  }} />
                  {tip}
                </div>
              ))}
            </div>

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

export default FileScanPage;
