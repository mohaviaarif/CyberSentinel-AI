import React, { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const typeColors = {
  email: { color: "#2979FF", label: "EMAIL" },
  url:   { color: "#00BFAE", label: "URL" },
  file:  { color: "#9C27B0", label: "FILE" },
};

const resultColors = {
  spam:       "#FF4C4C",
  phishing:   "#FF4C4C",
  malicious:  "#FF4C4C",
  Malicious:  "#FF4C4C",
  suspicious: "#FFC947",
  Suspicious: "#FFC947",
  ham:        "#00E5A0",
  safe:       "#00E5A0",
  Safe:       "#00E5A0",
  Clean:      "#00E5A0",
  Unknown:    "#888888",
};

export default function HistoryPage() {
  const [scans, setScans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail") || "";
        const response  = await axios.get(
          `${API}/api/scan-history`,
          {
            headers: userEmail
              ? { "X-User-Email": userEmail }
              : {},
          }
        );
        if (response.data.success) {
          setScans(response.data.scans);
        } else {
          setError("Could not load scan history.");
        }
      } catch (err) {
        setError("Server error. Make sure backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  const formatSummary = (summary) => {
    if (!summary) return "-";
    return summary.length > 50
      ? summary.substring(0, 50) + "..."
      : summary;
  };

  return (
    <div style={{
      padding: "32px",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)",
      color: "#F2F6FF",
      fontFamily: "Inter, Arial, sans-serif",
    }}>
      <h2 style={{
        fontSize: "26px",
        fontWeight: "700",
        color: "#F2F6FF",
        marginBottom: "8px",
      }}>
        Scan History
      </h2>
      <p style={{ color: "#6a88b8", marginBottom: "32px" }}>
        Your last 20 scans across all modules
      </p>

      {loading && (
        <p style={{ color: "#6a88b8" }}>Loading history...</p>
      )}

      {error && (
        <div style={{
          background: "rgba(255,76,76,0.1)",
          border: "1px solid #FF4C4C",
          borderRadius: "8px",
          padding: "16px",
          color: "#FF4C4C",
        }}>
          {error}
        </div>
      )}

      {!loading && !error && scans.length === 0 && (
        <p style={{ color: "#6a88b8" }}>
          No scans yet. Run a scan to see history here.
        </p>
      )}

      {!loading && scans.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}>
            <thead>
              <tr style={{
                borderBottom: "2px solid rgba(255,255,255,0.1)",
                color: "#6a88b8",
                textAlign: "left",
              }}>
                <th style={{ padding: "12px 16px" }}>Type</th>
                <th style={{ padding: "12px 16px" }}>Summary</th>
                <th style={{ padding: "12px 16px" }}>Result</th>
                <th style={{ padding: "12px 16px" }}>Confidence</th>
                <th style={{ padding: "12px 16px" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan, index) => {
                const typeInfo = typeColors[scan.scan_type] ||
                  { color: "#888", label: scan.scan_type.toUpperCase() };
                const resultColor = resultColors[scan.result] || "#888";
                return (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      background: index % 2 === 0
                        ? "rgba(255,255,255,0.02)"
                        : "transparent",
                    }}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        background: typeInfo.color + "22",
                        color: typeInfo.color,
                        border: `1px solid ${typeInfo.color}`,
                        borderRadius: "4px",
                        padding: "3px 8px",
                        fontSize: "11px",
                        fontWeight: "700",
                      }}>
                        {typeInfo.label}
                      </span>
                    </td>
                    <td style={{
                      padding: "14px 16px",
                      color: "#A4C7EC",
                      fontFamily: "Courier New, monospace",
                      fontSize: "13px",
                    }}>
                      {formatSummary(scan.summary)}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        color: resultColor,
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}>
                        {scan.result}
                      </span>
                    </td>
                    <td style={{
                      padding: "14px 16px",
                      color: "#A4C7EC",
                    }}>
                      {scan.confidence
                        ? (scan.confidence * 100).toFixed(0) + "%"
                        : "-"}
                    </td>
                    <td style={{
                      padding: "14px 16px",
                      color: "#6a88b8",
                      fontSize: "12px",
                    }}>
                      {formatDate(scan.scanned_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
