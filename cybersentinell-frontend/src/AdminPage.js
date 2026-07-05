import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL
  || "http://localhost:5000";

const statCard = (label, value, color) => (
  <div style={{
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${color}44`,
    borderRadius: "12px",
    padding: "20px 24px",
    minWidth: "160px",
    flex: "1"
  }}>
    <div style={{
      fontSize: "28px",
      fontWeight: "800",
      color: color
    }}>
      {value}
    </div>
    <div style={{
      fontSize: "12px",
      color: "#6a88b8",
      marginTop: "4px",
      textTransform: "uppercase",
      letterSpacing: "1px"
    }}>
      {label}
    </div>
  </div>
);

const typeColors = {
  email: "#2979FF",
  url: "#00BFAE",
  file: "#9C27B0"
};

const resultColors = {
  spam: "#FF4C4C",
  malicious: "#FF4C4C",
  Malicious: "#FF4C4C",
  suspicious: "#FFC947",
  Suspicious: "#FFC947",
  ham: "#00E5A0",
  safe: "#00E5A0",
  Clean: "#00E5A0",
  Unknown: "#888888",
  Pending: "#2979FF"
};

export default function AdminPage() {
  const [stats, setStats]         = useState(null);
  const [users, setUsers]         = useState([]);
  const [scans, setScans]         = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  const userEmail = localStorage.getItem("userEmail") || "";

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    const headers = { "X-User-Email": userEmail };
    try {
      const [statsRes, usersRes, scansRes] = await Promise.all([
        axios.get(`${API}/api/admin/stats`,  { headers }),
        axios.get(`${API}/api/admin/users`,  { headers }),
        axios.get(`${API}/api/admin/scans`,  { headers })
      ]);
      if (statsRes.data.success)  setStats(statsRes.data);
      if (usersRes.data.success)  setUsers(usersRes.data.users);
      if (scansRes.data.success)  setScans(scansRes.data.scans);
    } catch (err) {
      setError("Access denied or server error.");
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (d) => d ? new Date(d).toLocaleString() : "—";
  const truncate   = (s, n) => s && s.length > n
    ? s.substring(0, n) + "..." : (s || "—");

  const containerStyle = {
    padding: "32px",
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f1419 0%,#1a1f2e 100%)",
    color: "#F2F6FF",
    fontFamily: "Inter, Arial, sans-serif"
  };

  const tabStyle = (active) => ({
    padding: "8px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    background: active
      ? "rgba(41,121,255,0.2)" : "transparent",
    color: active ? "#2979FF" : "#6a88b8",
    borderBottom: active
      ? "2px solid #2979FF" : "2px solid transparent"
  });

  const thStyle = {
    padding: "12px 16px",
    color: "#6a88b8",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    textAlign: "left",
    borderBottom: "1px solid rgba(255,255,255,0.08)"
  };

  const tdStyle = {
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    fontSize: "13px"
  };

  if (loading) return (
    <div style={containerStyle}>
      <p style={{ color: "#6a88b8" }}>
        Loading admin panel...
      </p>
    </div>
  );

  if (error) return (
    <div style={containerStyle}>
      <div style={{
        background: "rgba(255,76,76,0.1)",
        border: "1px solid #FF4C4C",
        borderRadius: "8px",
        padding: "20px",
        color: "#FF4C4C"
      }}>
        {error} — Make sure you are logged in as admin.
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px"
      }}>
        <h2 style={{
          fontSize: "26px",
          fontWeight: "800",
          margin: 0
        }}>
          Admin Control Panel
        </h2>
        <button onClick={loadData} style={{
          padding: "8px 16px",
          background: "rgba(41,121,255,0.15)",
          border: "1px solid #2979FF",
          borderRadius: "8px",
          color: "#2979FF",
          cursor: "pointer",
          fontSize: "13px"
        }}>
          Refresh
        </button>
      </div>
      <p style={{
        color: "#6a88b8",
        marginBottom: "24px",
        fontSize: "13px"
      }}>
        Logged in as: {userEmail}
      </p>

      {/* TABS */}
      <div style={{
        display: "flex",
        gap: "4px",
        marginBottom: "28px",
        borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}>
        {["overview","users","scans"].map(tab => (
          <button
            key={tab}
            style={tabStyle(activeTab === tab)}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && stats && (
        <div>
          <div style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "32px"
          }}>
            {statCard(
              "Total Users",
              stats.stats.total_users,
              "#2979FF"
            )}
            {statCard(
              "Total Scans",
              stats.stats.total_scans,
              "#00BFAE"
            )}
            {statCard(
              "Threats Found",
              stats.stats.threats_detected,
              "#FF4C4C"
            )}
            {statCard(
              "Email Scans",
              stats.stats.total_email_scans,
              "#9C27B0"
            )}
            {statCard(
              "URL Scans",
              stats.stats.total_url_scans,
              "#FF9800"
            )}
            {statCard(
              "File Scans",
              stats.stats.total_file_scans,
              "#00BCD4"
            )}
          </div>

          <h3 style={{
            fontSize: "14px",
            color: "#6a88b8",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "16px"
          }}>
            Recent Activity
          </h3>
          <table style={{
            width: "100%",
            borderCollapse: "collapse"
          }}>
            <thead>
              <tr>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Result</th>
                <th style={thStyle}>Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_activity.map((item, i) => (
                <tr key={i}>
                  <td style={tdStyle}>
                    <span style={{
                      color: typeColors[item.type] || "#888",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      fontSize: "11px"
                    }}>
                      {item.type}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      color: resultColors[item.result] || "#888"
                    }}>
                      {item.result}
                    </span>
                  </td>
                  <td style={{
                    ...tdStyle,
                    color: "#6a88b8",
                    fontSize: "12px"
                  }}>
                    {formatDate(item.scanned_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div>
          <p style={{
            color: "#6a88b8",
            marginBottom: "16px",
            fontSize: "13px"
          }}>
            {users.length} registered users
          </p>
          <table style={{
            width: "100%",
            borderCollapse: "collapse"
          }}>
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Email Scans</th>
                <th style={thStyle}>URL Scans</th>
                <th style={thStyle}>File Scans</th>
                <th style={thStyle}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i} style={{
                  background: i % 2 === 0
                    ? "rgba(255,255,255,0.02)"
                    : "transparent"
                }}>
                  <td style={{
                    ...tdStyle,
                    color: "#A4C7EC"
                  }}>
                    {user.email}
                  </td>
                  <td style={{
                    ...tdStyle,
                    color: "#2979FF",
                    textAlign: "center"
                  }}>
                    {user.email_scans}
                  </td>
                  <td style={{
                    ...tdStyle,
                    color: "#00BFAE",
                    textAlign: "center"
                  }}>
                    {user.url_scans}
                  </td>
                  <td style={{
                    ...tdStyle,
                    color: "#9C27B0",
                    textAlign: "center"
                  }}>
                    {user.file_scans}
                  </td>
                  <td style={{
                    ...tdStyle,
                    color: "#6a88b8",
                    fontSize: "12px"
                  }}>
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SCANS TAB */}
      {activeTab === "scans" && (
        <div>
          <p style={{
            color: "#6a88b8",
            marginBottom: "16px",
            fontSize: "13px"
          }}>
            Last 50 scans across all modules
          </p>
          <table style={{
            width: "100%",
            borderCollapse: "collapse"
          }}>
            <thead>
              <tr>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Summary</th>
                <th style={thStyle}>Result</th>
                <th style={thStyle}>Time</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan, i) => (
                <tr key={i} style={{
                  background: i % 2 === 0
                    ? "rgba(255,255,255,0.02)"
                    : "transparent"
                }}>
                  <td style={tdStyle}>
                    <span style={{
                      background: (
                        typeColors[scan.scan_type] || "#888"
                      ) + "22",
                      color: typeColors[scan.scan_type] || "#888",
                      border: `1px solid ${
                        typeColors[scan.scan_type] || "#888"
                      }`,
                      borderRadius: "4px",
                      padding: "2px 8px",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}>
                      {(scan.scan_type || "").toUpperCase()}
                    </span>
                  </td>
                  <td style={{
                    ...tdStyle,
                    color: "#6a88b8",
                    fontSize: "12px"
                  }}>
                    {truncate(scan.user_email, 25)}
                  </td>
                  <td style={{
                    ...tdStyle,
                    color: "#A4C7EC",
                    fontFamily: "Courier New, monospace",
                    fontSize: "12px"
                  }}>
                    {truncate(scan.summary, 40)}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      color: resultColors[scan.result] || "#888",
                      fontWeight: "600",
                      fontSize: "12px"
                    }}>
                      {scan.result}
                    </span>
                  </td>
                  <td style={{
                    ...tdStyle,
                    color: "#6a88b8",
                    fontSize: "11px"
                  }}>
                    {formatDate(scan.scanned_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
