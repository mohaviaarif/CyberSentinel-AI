import React from 'react';

export function AboutPage() {
  return (
    <div className="about-page-pro">
      <h1 className="main-title-pro">About Cyber Sentinell</h1>

      <section className="about-section-pro">
        <h2>Our Mission</h2>
        <p>At Cyber Sentinell, we believe everyone deserves a safer digital experience. Our mission is to democratize enterprise-grade email security through intelligent AI, making advanced threat detection accessible to individuals and organizations of all sizes. We're committed to protecting users from evolving cyberthreats while maintaining transparency and respecting user privacy above all else.</p>
      </section>

      <section className="about-section-pro">
        <h2>Who We Are</h2>
        <p>Cyber Sentinell was founded by a team of experienced cybersecurity researchers and machine learning engineers who witnessed firsthand how traditional email filters fail to protect users from sophisticated phishing and social engineering attacks. Frustrated by the limitations of existing solutions, we decided to build something better – a modern, intelligent platform powered by advanced neural networks and real-time threat intelligence.</p>
        <p>Our team combines decades of experience in information security, machine learning, and software engineering. We work with leading cybersecurity researchers and continuously collaborate with the global security community to stay ahead of emerging threats.</p>
      </section>

      <section className="about-section-pro">
        <h2>Our Vision</h2>
        <p>We envision a world where email security is no longer a burden for users or IT teams. Where advanced AI protects inboxes autonomously, learning from global threat patterns, and adapting in real-time to new attack vectors. Where users can trust their email again, confident that sophisticated threats are detected and explained in simple, actionable terms.</p>
      </section>

      <section className="about-section-pro">
        <h2>Core Values</h2>
        <ul>
          <li><strong>Security First:</strong> Every decision we make prioritizes user and data security. We employ best practices in cryptography, data handling, and infrastructure security.</li>
          <li><strong>Privacy by Default:</strong> Your emails are your business. We never store, analyze externally, or retain any email content. Our zero-knowledge architecture ensures your privacy is protected.</li>
          <li><strong>Transparency:</strong> We believe users deserve to understand why an email was flagged. Every analysis includes detailed explanations and recommendations.</li>
          <li><strong>Continuous Innovation:</strong> The threat landscape evolves daily. We continuously update our models, incorporate new threat intelligence, and research emerging attack patterns.</li>
          <li><strong>Accessibility:</strong> Advanced security shouldn't be expensive or complicated. We make enterprise-grade protection available to everyone.</li>
        </ul>
      </section>

      <section className="about-section-pro">
        <h2>Our Technology</h2>
        <p>Cyber Sentinell is built on a foundation of advanced machine learning and cybersecurity research:</p>
        <ul>
          <li><strong>Deep Neural Networks:</strong> Multi-layer neural networks trained on millions of real-world emails to recognize complex patterns indicative of phishing, spam, and malware.</li>
          <li><strong>Feature Engineering:</strong> Proprietary algorithms extract over 500 features from email content, headers, and metadata for comprehensive threat analysis.</li>
          <li><strong>Real-time Intelligence:</strong> Integration with leading threat feeds ensures our models stay current with the latest malware signatures and known malicious domains.</li>
          <li><strong>Explainable AI:</strong> We use interpretable machine learning techniques to generate clear, human-readable explanations for every detection.</li>
          <li><strong>Scalable Architecture:</strong> Built on cloud-native infrastructure for instant processing and 99.9% uptime reliability.</li>
        </ul>
      </section>

      <section className="about-section-pro">
        <h2>Why You Can Trust Us</h2>
        <ul>
          <li><strong>Security Expertise:</strong> Our team includes researchers who have discovered major vulnerabilities and published papers in top security conferences.</li>
          <li><strong>Independent Validation:</strong> We're committed to third-party security audits and publish our results transparently.</li>
          <li><strong>No Data Selling:</strong> We never monetize user data. Your information is never sold to advertisers or other third parties.</li>
          <li><strong>Open Communication:</strong> We publish regular threat reports and maintain an active security research blog to share insights with the community.</li>
          <li><strong>Compliance Ready:</strong> Our platform meets GDPR, CCPA, HIPAA, and SOC 2 compliance requirements for enterprise deployments.</li>
        </ul>
      </section>

      <section className="about-section-pro">
        <h2>Our Impact</h2>
        <p>Since our launch, Cyber Sentinell has protected millions of users from phishing attacks, credential harvesting attempts, and malware distribution campaigns. Our threat detection has helped organizations prevent data breaches worth millions in potential losses.</p>
        <p>But our journey is just beginning. As email remains a primary attack vector for cybercriminals, we're committed to advancing the state of email security for everyone. Every day, our platform learns from new threats and evolves to provide better protection.</p>
      </section>

      <section className="about-section-pro">
        <h2>Looking Forward</h2>
        <p>We're constantly expanding Cyber Sentinell's capabilities. Upcoming features include integration with email providers, advanced reporting dashboards for enterprises, multi-language support, and expanded threat analysis including credential exposure detection and business email compromise (BEC) prevention.</p>
        <p>If you're interested in contributing to our mission or have questions about our technology, we'd love to hear from you. Contact us today to learn more about how Cyber Sentinell can protect your organization.</p>
      </section>
    </div>
  );
}

export default AboutPage;
