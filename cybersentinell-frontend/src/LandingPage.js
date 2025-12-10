import React, { useEffect, useState } from "react";
import PageTransition from "./animations/PageTransition";
import {
  FadeIn,
  ScaleIn,
  StaggerList,
  StaggerItem,
} from "./animations/MotionWrappers";
import { FaShieldAlt, FaBolt, FaBug, FaBrain, FaInbox } from "react-icons/fa";

function Section({ id, title, children }) {
  return (
    <FadeIn delay={0.1}>
      <section className="section-pro" id={id}>
        <FadeIn delay={0.15}>
          <h2 className="section-title-pro dashboard-title">{title}</h2>
        </FadeIn>
        <div className="section-body-pro">{children}</div>
      </section>
    </FadeIn>
  );
}

export function LandingPage() {
  /* ---------------------------------------------
      EMAIL ANALYSIS COUNT
  ----------------------------------------------*/
  const [emailCount, setEmailCount] = useState(0);
  const [animateStats, setAnimateStats] = useState(false);

  const animateNumber = (target, setter, speed = 20) => {
    let current = 0;
    const increment = target / 40;

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setter(Math.floor(current));
    }, speed);
  };

  // Initial load + keep syncing with localStorage
  useEffect(() => {
    const readFromStorage = (withAnimation = false) => {
      const saved = parseInt(
        localStorage.getItem("emailAnalyzedCount") || "0",
        10
      );

      if (withAnimation) {
        animateNumber(saved, setEmailCount);
        setAnimateStats(true);
      } else {
        setEmailCount(saved);
      }
    };

    // First time: animate
    readFromStorage(true);

    // Then poll every 2s to catch new analyses
    const interval = setInterval(() => {
      readFromStorage(false);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  /* ---------------------------------------------
      OTHER DASHBOARD STATS
  ----------------------------------------------*/
  const [threats, setThreats] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    if (animateStats) {
      animateNumber(847, setThreats);
      animateNumber(98.4, setAccuracy, 15);
    }
  }, [animateStats]);

  /* ---------------------------------------------
      LIVE FEED SIMULATION
  ----------------------------------------------*/
  const [feedIndex, setFeedIndex] = useState(0);

  const events = [
    "⚠️ Phishing attempt detected from jp-secure-login.net",
    "🔗 Malicious URL flagged: outlook-verify-security.com",
    "🐟 Credential harvesting pattern detected in email metadata",
    "📩 Spoofed sender detected: support@paypal.com → attacker server",
    "🚨 High-risk language detected: urgent password reset required",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFeedIndex((i) => (i + 1) % events.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  /* ---------------------------------------------
      OPEN ANALYZER
  ----------------------------------------------*/
  const goToAnalyzer = () => {
    window.location.href = "/analyze";
  };

  return (
    <PageTransition>
      <div className="landing-pro dashboard-mode">
        {/* ---------------- HERO ---------------- */}
        <div className="hero-pro dashboard-hero">
          <div className="hero-content-pro">
            <FadeIn delay={0.2}>
              <h1 className="hero-title-pro dashboard-logo">
                <FaShieldAlt
                  style={{
                    marginRight: "8px",
                    filter: "drop-shadow(0 0 4px #00eaff)",
                  }}
                />
                Dashboard
              </h1>
            </FadeIn>

            <FadeIn delay={0.35}>
              <p className="hero-sub-pro dashboard-sub">
                Real-time AI Threat Detection • Autonomous Defense • Live
                Security Console
              </p>
            </FadeIn>

            <FadeIn delay={0.5}>
              <a className="hero-cta-pro dashboard-cta" href="/analyze">
                Launch Email Analyzer
              </a>
            </FadeIn>

            {/* ---------------- STATS ---------------- */}
            <StaggerList delay={0.6}>
              <div className="dash-stats-grid">
                {[
                  ["Total Emails Analyzed", emailCount, <FaInbox />],
                  ["Detected Threats (24h)", threats, <FaBug />],
                  ["Model Accuracy", accuracy.toFixed(1) + "%", <FaBrain />],
                  ["Avg Analysis Speed", "0.42 sec", <FaBolt />],
                ].map(([label, value, icon], i) => (
                  <StaggerItem key={i}>
                    <div
                      className="dash-stat-card enhanced-card clickable-card"
                      onClick={goToAnalyzer}
                    >
                      <div className="dash-stat-icon">{icon}</div>
                      <div className="dash-stat-value">{value}</div>
                      <div className="dash-stat-label">{label}</div>
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerList>
          </div>

          <ScaleIn delay={0.4}>
            <div className="hero-bg-art glowing-orb"></div>
          </ScaleIn>
        </div>

        {/* ---------------- LIVE FEED ---------------- */}
        <Section id="live-feed" title="Real-Time Threat Feed">
          <FadeIn delay={0.2}>
            <div className="live-feed-box enhanced-feed">
              <p key={feedIndex} className="live-feed-item typewriter">
                {events[feedIndex]}
              </p>
            </div>
          </FadeIn>
        </Section>

        {/* ---------------- FEATURES ---------------- */}
        <Section id="features" title="Platform Capabilities">
          <StaggerList delay={0.25}>
            <div className="features-grid-pro dashboard-features">
              {[
                [
                  "Advanced AI Engine",
                  "Neural threat modeling with real-time learning.",
                ],
                [
                  "Email Header Forensics",
                  "Detect spoofing, DMARC failures, routing anomalies.",
                ],
                [
                  "URL Intelligence",
                  "Predict & block malicious redirections instantly.",
                ],
                [
                  "Phishing Pattern Recognition",
                  "Behavioral signals + content fingerprinting.",
                ],
                [
                  "Risk Scoring Engine",
                  "Adaptive scoring based on threat severity.",
                ],
                [
                  "Enterprise SOC Tools",
                  "Bulk scanning, audit logs, API access, RBAC.",
                ],
              ].map(([title, desc], i) => (
                <StaggerItem key={i}>
                  <div
                    className="feature-card-pro dashboard-card enhanced-feature clickable-card"
                    onClick={goToAnalyzer}
                  >
                    <strong>{title}</strong>
                    <p>{desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerList>
        </Section>

        {/* ---------------- CTA ---------------- */}
        <FadeIn delay={0.2}>
          <Section id="cta" title="Start Securing Your Inbox">
            <p
              style={{
                textAlign: "center",
                fontSize: "1.15em",
                marginBottom: "1.5em",
              }}
            >
              Access powerful AI scanning. No installation required.
            </p>
            <div style={{ textAlign: "center" }}>
              <a className="hero-cta-pro dashboard-cta" href="/analyze">
                Launch Email Analyzer
              </a>
            </div>
          </Section>
        </FadeIn>

        <footer className="landing-footer-pro">
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} Cyber Sentinel — Threat Intelligence
            Dashboard
          </p>
        </footer>
      </div>
    </PageTransition>
  );
}

export default LandingPage;
