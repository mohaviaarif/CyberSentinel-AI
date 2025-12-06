import React from 'react';

function Section({ id, title, children }) {
  return (
    <section className="section-pro" id={id}>
      <h2 className="section-title-pro">{title}</h2>
      <div className="section-body-pro">{children}</div>
    </section>
  );
}

export function LandingPage() {
  return (
    <div className="landing-pro">
      <div className="hero-pro">
        <div className="hero-content-pro">
          <h1 className="hero-title-pro">🛡️ Cyber Sentinell</h1>
          <p className="hero-sub-pro">Enterprise-Grade AI Email Security Platform<br />Detect phishing, spam, and threats in real-time with advanced machine learning</p>
          <a className="hero-cta-pro" href="/analyze">Analyze Your Email Now</a>
        </div>
        <div className="hero-bg-art"></div>
      </div>

      <Section id="about" title="Intelligent Email Protection">
        <p>Cyber Sentinell represents the next generation of email security. We combine cutting-edge machine learning algorithms with traditional security heuristics to provide comprehensive protection against sophisticated cyber threats. Our platform has been engineered to defend against emerging threats while maintaining simplicity and transparency in every interaction.</p>
        <p>Whether you're an individual looking to protect your personal inbox or an enterprise managing thousands of mailboxes, Cyber Sentinell scales to meet your needs without compromising on speed, accuracy, or privacy.</p>
        <ul className="about-list-pro">
          <li>Advanced neural networks trained on millions of real-world emails</li>
          <li>Zero-knowledge architecture – we never store or process your email data</li>
          <li>Instant analysis with confidence scoring and detailed explanations</li>
          <li>Continuously updated threat intelligence feeds</li>
        </ul>
      </Section>

      <Section id="features" title="Comprehensive Features">
        <div className="features-grid-pro">
          <div className="feature-card-pro">
            <span>🧠</span>
            <strong>Deep Learning Detection</strong>
            <p style={{fontSize: '0.85em', marginTop: '0.5em'}}>Multi-layered neural networks analyze email content, metadata, and behavioral patterns</p>
          </div>
          <div className="feature-card-pro">
            <span>⚡</span>
            <strong>Lightning-Fast Analysis</strong>
            <p style={{fontSize: '0.85em', marginTop: '0.5em'}}>Results delivered in milliseconds with optimized processing pipelines</p>
          </div>
          <div className="feature-card-pro">
            <span>🎯</span>
            <strong>Phishing Detection</strong>
            <p style={{fontSize: '0.85em', marginTop: '0.5em'}}>Identifies social engineering tactics, spoofed domains, and credential harvesting attempts</p>
          </div>
          <div className="feature-card-pro">
            <span>📊</span>
            <strong>Confidence Scoring</strong>
            <p style={{fontSize: '0.85em', marginTop: '0.5em'}}>Risk assessment with detailed explanation of detected threats and vulnerabilities</p>
          </div>
          <div className="feature-card-pro">
            <span>🔗</span>
            <strong>URL & Link Analysis</strong>
            <p style={{fontSize: '0.85em', marginTop: '0.5em'}}>Deep inspection of embedded URLs for redirects, malicious domains, and phishing attempts</p>
          </div>
          <div className="feature-card-pro">
            <span>🏢</span>
            <strong>Enterprise Ready</strong>
            <p style={{fontSize: '0.85em', marginTop: '0.5em'}}>Role-based access control, audit trails, and compliance features for large organizations</p>
          </div>
        </div>
      </Section>

      <Section id="how" title="How It Works">
        <p style={{marginBottom: '1.5em'}}>Our intelligent analysis pipeline processes emails through multiple security layers, each designed to detect different categories of threats:</p>
        <ol className="how-steps-pro">
          <li><strong>Content Analysis:</strong> Raw email text is parsed and analyzed for suspicious keywords, phishing language patterns, and social engineering tactics commonly used by attackers.</li>
          <li><strong>Header Inspection:</strong> Email headers are examined for spoofing indicators, authentication failures (SPF, DKIM, DMARC), and suspicious routing patterns.</li>
          <li><strong>Link & Attachment Scanning:</strong> All URLs are checked against threat databases and scanned for redirect chains. Attachment metadata is analyzed for potential malware signatures.</li>
          <li><strong>Machine Learning Classification:</strong> Our trained models evaluate the combination of all signals to determine if the email is legitimate, spam, or phishing.</li>
          <li><strong>Risk Scoring & Explanation:</strong> You receive a clear verdict with a confidence percentage and human-readable explanation of detected threats and recommendations.</li>
        </ol>
      </Section>

      <Section id="benefits" title="Why Choose Cyber Sentinell?">
        <ul className="benefits-list-pro">
          <li><strong>Superior Detection:</strong> Advanced ML models outperform traditional rule-based filters in identifying sophisticated attacks, zero-day threats, and novel phishing campaigns.</li>
          <li><strong>Privacy First:</strong> Your emails are analyzed in-memory and never stored, shared, or retained. Complete control over your data.</li>
          <li><strong>Transparent Results:</strong> Every analysis includes detailed explanations. Understand exactly why an email was flagged or approved.</li>
          <li><strong>User Friendly:</strong> No complex setup or technical knowledge required. Simple interface, powerful protection.</li>
          <li><strong>Instant Insights:</strong> Get results immediately with actionable recommendations on how to handle suspicious emails.</li>
          <li><strong>Continuously Improving:</strong> Our models are updated daily with the latest threat intelligence and attack patterns.</li>
        </ul>
      </Section>

      <Section id="technology" title="Powered by Advanced Technology">
        <p>Cyber Sentinell leverages state-of-the-art technologies in machine learning and cybersecurity:</p>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5em', marginTop: '1.5em'}}>
          <div style={{background: 'rgba(41, 121, 255, 0.08)', padding: '1.5em', borderRadius: '1.2em', border: '1px solid rgba(41, 121, 255, 0.2)'}}>
            <h3 style={{color: '#00BFAE', margin: '0 0 0.8em 0'}}>Deep Neural Networks</h3>
            <p style={{color: '#A4C7EC', fontSize: '0.95em', lineHeight: '1.6'}}>Multi-layer perceptrons and convolutional networks trained on millions of legitimate and malicious emails</p>
          </div>
          <div style={{background: 'rgba(41, 121, 255, 0.08)', padding: '1.5em', borderRadius: '1.2em', border: '1px solid rgba(41, 121, 255, 0.2)'}}>
            <h3 style={{color: '#00BFAE', margin: '0 0 0.8em 0'}}>Feature Engineering</h3>
            <p style={{color: '#A4C7EC', fontSize: '0.95em', lineHeight: '1.6'}}>Proprietary algorithms extract over 500 features from email content, headers, and metadata</p>
          </div>
          <div style={{background: 'rgba(41, 121, 255, 0.08)', padding: '1.5em', borderRadius: '1.2em', border: '1px solid rgba(41, 121, 255, 0.2)'}}>
            <h3 style={{color: '#00BFAE', margin: '0 0 0.8em 0'}}>Real-time Threat Feeds</h3>
            <p style={{color: '#A4C7EC', fontSize: '0.95em', lineHeight: '1.6'}}>Integration with leading threat intelligence providers for up-to-date malware and phishing databases</p>
          </div>
        </div>
      </Section>

      <Section id="faq" title="Frequently Asked Questions">
        <div className="faq-list-pro">
          <details className="faq-item-pro">
            <summary>Is Cyber Sentinell completely free?</summary>
            <div>Yes! Our core threat detection service is free and unlimited. Premium features for enterprise users are available upon request.</div>
          </details>
          <details className="faq-item-pro">
            <summary>Do you store or analyze my email data?</summary>
            <div>No. Email content is processed in-memory for analysis and immediately discarded. We never store, log, or retain any email data. Your privacy is paramount.</div>
          </details>
          <details className="faq-item-pro">
            <summary>What accuracy does Cyber Sentinell achieve?</summary>
            <div>Our models achieve 94%+ accuracy in identifying phishing and spam emails. Accuracy continues to improve as our algorithms learn from new threat patterns.</div>
          </details>
          <details className="faq-item-pro">
            <summary>Can I use it for forwarded or complex emails?</summary>
            <div>Absolutely. Our parser extracts relevant content from forwarded emails, reply chains, and multi-part messages to provide accurate threat analysis.</div>
          </details>
          <details className="faq-item-pro">
            <summary>Is this suitable for enterprise deployment?</summary>
            <div>Yes. We offer enterprise features including role-based access control, API integration, audit trails, compliance reports, and dedicated support.</div>
          </details>
          <details className="faq-item-pro">
            <summary>How is Cyber Sentinell developed and maintained?</summary>
            <div>Our team consists of security researchers, ML engineers, and cybersecurity veterans with decades of combined experience. We continuously update our models with new threat intelligence.</div>
          </details>
        </div>
      </Section>

      <Section id="cta" title="Get Started Today">
        <p style={{textAlign: 'center', fontSize: '1.15em', marginBottom: '1.5em'}}>Experience enterprise-grade email security. No credit card required.</p>
        <div style={{textAlign: 'center'}}>
          <a className="hero-cta-pro" href="/analyze" style={{display: 'inline-block'}}>Start Analyzing Emails</a>
        </div>
      </Section>

      <footer className="landing-footer-pro">
        <p style={{margin: 0}}>&copy; {new Date().getFullYear()} Cyber Sentinell – Enterprise Email Security Powered by AI</p>
        <p style={{margin: '0.5em 0 0 0', fontSize: '0.85em', opacity: 0.8}}>Built by security experts. Trusted by organizations worldwide.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
