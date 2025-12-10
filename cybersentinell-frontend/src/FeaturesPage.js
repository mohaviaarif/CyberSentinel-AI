import React from "react";
import {
  FaBrain,
  FaBolt,
  FaShieldAlt,
  FaEnvelopeOpen,
  FaLink,
  FaPaperclip,
  FaChartLine,
  FaGlobe,
  FaBuilding,
  FaSyncAlt,
  FaChartPie,
} from "react-icons/fa";

function FeaturesPage() {
  return (
    <div className="features-page-pro">
      <h1 className="main-title-pro">Core Features</h1>

      <p
        style={{
          fontSize: "1.08em",
          color: "#A4C7EC",
          marginBottom: "2.5em",
          lineHeight: 1.8,
        }}
      >
        Cyber Sentinel uses advanced AI + real-time threat intelligence to detect
        phishing, malware, social engineering, and dangerous links — all within
        seconds. Built for accuracy. Designed for simplicity.
      </p>

      {/* ------------------ FEATURE GRID --------------------- */}
      <ul className="features-list-pro">

        <li>
          <span style={{ fontSize: "1.8em" }}><FaBrain /></span><br />
          <strong>Deep Neural Network Analysis</strong>
          <br />
          Our multi-layer AI models detect hidden phishing patterns, spoofing behavior,
          and deceptive writing styles beyond human recognition.
        </li>

        <li>
          <span style={{ fontSize: "1.8em" }}><FaBolt /></span><br />
          <strong>Real-Time Processing</strong>
          <br />
          Get instant results — most analyses complete in under 500ms thanks to
          highly optimized inference pipelines.
        </li>

        <li>
          <span style={{ fontSize: "1.8em" }}><FaShieldAlt /></span><br />
          <strong>Phishing Detection Engine</strong>
          <br />
          Detects credential harvesting, scam patterns, fake branding, and
          social-engineering attempts using dynamic heuristics.
        </li>

        <li>
          <span style={{ fontSize: "1.8em" }}><FaEnvelopeOpen /></span><br />
          <strong>Email Header Inspection</strong>
          <br />
          Validates SPF, DKIM, DMARC, routing paths, and spoofing indicators to catch
          impersonation attacks.
        </li>

        <li>
          <span style={{ fontSize: "1.8em" }}><FaLink /></span><br />
          <strong>URL & Link Analysis</strong>
          <br />
          Every link is checked for redirects, malicious domains, phishing landing
          pages, QR code traps, and open-redirect behavior.
        </li>

        <li>
          <span style={{ fontSize: "1.8em" }}><FaPaperclip /></span><br />
          <strong>Attachment Safety Check</strong>
          <br />
          Detects dangerous extensions, macro-enabled documents, encrypted payloads, and
          fake disguised file types.
        </li>

        <li>
          <span style={{ fontSize: "1.8em" }}><FaChartLine /></span><br />
          <strong>Confidence Scoring</strong>
          <br />
          Get a clear numeric score + explanation so you know *exactly* what triggered
          the detection.
        </li>

        <li>
          <span style={{ fontSize: "1.8em" }}><FaGlobe /></span><br />
          <strong>Multi-Language Support</strong>
          <br />
          AI can detect phishing patterns in English, Urdu, Arabic, French, and more —
          even when attackers mix languages.
        </li>

        <li>
          <span style={{ fontSize: "1.8em" }}><FaBuilding /></span><br />
          <strong>Enterprise Integration</strong>
          <br />
          With REST API endpoints, audit logs, RBAC, and email pipeline hooks, Cyber
          Sentinel integrates easily into enterprise environments.
        </li>

        <li>
          <span style={{ fontSize: "1.8em" }}><FaSyncAlt /></span><br />
          <strong>Continuous Model Updates</strong>
          <br />
          Machine learning models are updated daily from global threat intelligence
          feeds to catch the newest attack campaigns.
        </li>

        <li>
          <span style={{ fontSize: "1.8em" }}><FaChartPie /></span><br />
          <strong>Advanced Reporting</strong>
          <br />
          Visual dashboards show detection trends, phishing campaigns, employee risk
          exposure, and historical security insights.
        </li>
      </ul>

      {/* ------------------ COMPARISON TABLE ----------------------- */}
      <section
        style={{
          marginTop: "3em",
          padding: "2.5em",
          background: "rgba(41, 121, 255, 0.08)",
          border: "1px solid rgba(41, 121, 255, 0.2)",
          borderRadius: "1.8em",
        }}
      >
        <h2 style={{ color: "#2979FF", fontSize: "1.8em", marginTop: 0 }}>
          Feature Comparison
        </h2>

        <div style={{ overflowX: "auto", marginTop: "1.5em" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: "#B6D4FF",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(41, 121, 255, 0.3)" }}>
                <th
                  style={{
                    padding: "1em",
                    textAlign: "left",
                    color: "#00BFAE",
                    fontWeight: 700,
                  }}
                >
                  Feature
                </th>
                <th
                  style={{
                    padding: "1em",
                    textAlign: "center",
                    color: "#00BFAE",
                    fontWeight: 700,
                  }}
                >
                  Free Tier
                </th>
                <th
                  style={{
                    padding: "1em",
                    textAlign: "center",
                    color: "#00BFAE",
                    fontWeight: 700,
                  }}
                >
                  Enterprise
                </th>
              </tr>
            </thead>

            <tbody>
              <tr style={{ borderBottom: "1px solid rgba(41, 121, 255, 0.15)" }}>
                <td style={{ padding: "1em" }}>Email Analysis</td>
                <td style={{ textAlign: "center" }}>✓</td>
                <td style={{ textAlign: "center" }}>✓</td>
              </tr>

              <tr style={{ borderBottom: "1px solid rgba(41, 121, 255, 0.15)" }}>
                <td style={{ padding: "1em" }}>Phishing Detection</td>
                <td style={{ textAlign: "center" }}>✓</td>
                <td style={{ textAlign: "center" }}>✓</td>
              </tr>

              <tr style={{ borderBottom: "1px solid rgba(41, 121, 255, 0.15)" }}>
                <td style={{ padding: "1em" }}>Detailed Explanations</td>
                <td style={{ textAlign: "center" }}>✓</td>
                <td style={{ textAlign: "center" }}>✓</td>
              </tr>

              <tr style={{ borderBottom: "1px solid rgba(41, 121, 255, 0.15)" }}>
                <td style={{ padding: "1em" }}>API Access</td>
                <td style={{ textAlign: "center" }}>—</td>
                <td style={{ textAlign: "center" }}>✓</td>
              </tr>

              <tr style={{ borderBottom: "1px solid rgba(41, 121, 255, 0.15)" }}>
                <td style={{ padding: "1em" }}>Advanced Reporting</td>
                <td style={{ textAlign: "center" }}>—</td>
                <td style={{ textAlign: "center" }}>✓</td>
              </tr>

              <tr style={{ borderBottom: "1px solid rgba(41, 121, 255, 0.15)" }}>
                <td style={{ padding: "1em" }}>Dedicated Support</td>
                <td style={{ textAlign: "center" }}>—</td>
                <td style={{ textAlign: "center" }}>✓</td>
              </tr>

              <tr>
                <td style={{ padding: "1em" }}>Custom Threat Rules</td>
                <td style={{ textAlign: "center" }}>—</td>
                <td style={{ textAlign: "center" }}>✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default FeaturesPage;
