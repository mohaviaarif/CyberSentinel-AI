import React from "react";
import { FaShieldAlt, FaBrain, FaLock, FaSearch, FaSync, FaUsers } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="about-page-pro">

      <h1 className="main-title-pro">About Cyber Sentinel</h1>

      {/* Mission */}
      <section className="about-section-pro">
        <h2>Our Mission</h2>
        <p>
          Cyber Sentinel exists to make modern digital security accessible for everyone.
          We combine cutting-edge AI with real-time threat intelligence to protect users 
          from phishing, social engineering, and evolving cyber threats.
        </p>
      </section>

      {/* Who We Are */}
      <section className="about-section-pro">
        <h2>Who We Are</h2>
        <p>
          We are a team of cybersecurity researchers, ethical hackers, and ML engineers 
          passionate about building the next generation of email threat detection.
        </p>
        <p>
          Our team has contributed to real-world vulnerability research, published 
          academic work, and collaborated with the global security community to track 
          emerging attack patterns.
        </p>

        {/* Small Card Section */}
        <div className="team-grid-pro">
          <div className="team-member-pro">
            <FaUsers size={38} color="#2979FF" />
            <h3>Expert Team</h3>
            <p className="role">Researchers • Engineers • Analysts</p>
            <p>Bringing combined decades of cybersecurity experience.</p>
          </div>

          <div className="team-member-pro">
            <FaBrain size={38} color="#00BFAE" />
            <h3>AI-Driven Vision</h3>
            <p className="role">Machine Learning Powered</p>
            <p>Using deep learning to adapt to new threats instantly.</p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="about-section-pro">
        <h2>Core Values</h2>
        <ul>
          <li><strong>Security First:</strong> Every architecture choice prioritizes user safety.</li>
          <li><strong>Privacy by Default:</strong> We don’t store or share email content. Ever.</li>
          <li><strong>Transparency:</strong> Every detection includes clear reasoning.</li>
          <li><strong>Continuous Innovation:</strong> Our AI evolves with attackers.</li>
          <li><strong>Accessibility:</strong> Enterprise-grade protection for everyone.</li>
        </ul>
      </section>

      {/* Technology */}
      <section className="about-section-pro">
        <h2>Our Technology</h2>
        <ul>
          <li><strong>Deep Neural Networks:</strong> Trained on real-world phishing datasets.</li>
          <li><strong>500+ Feature Extraction:</strong> Content, headers, metadata — fully analyzed.</li>
          <li><strong>Threat Intelligence:</strong> Updated with global malicious indicators.</li>
          <li><strong>Explainable AI:</strong> Human-friendly insights for every result.</li>
          <li><strong>Cloud-Native Scaling:</strong> Fast, stable, and built for real usage.</li>
        </ul>
      </section>

      {/* Impact */}
      <section className="about-section-pro">
        <h2>Our Impact</h2>
        <p>
          Cyber Sentinel has already prevented thousands of phishing attempts, stopped 
          malware distribution campaigns, and protected users from credential theft.
        </p>
      </section>

      {/* Future */}
      <section className="about-section-pro">
        <h2>Looking Forward</h2>
        <p>
          We’re expanding with integrations, multi-language support, enterprise dashboards, 
          and advanced BEC (Business Email Compromise) detection.
        </p>
        <p>
          Cyber threats evolve constantly — we're committed to staying ahead of them.
        </p>
      </section>

    </div>
  );
}