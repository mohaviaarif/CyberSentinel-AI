import React from 'react';

export function FeaturesPage() {
  return (
    <div className="features-page-pro">
      <h1 className="main-title-pro">Core Features</h1>
      
      <p style={{fontSize: '1.1em', color: '#A4C7EC', marginBottom: '2.5em', lineHeight: 1.8}}>
        Cyber Sentinell combines multiple advanced security technologies to provide comprehensive email threat detection. Each feature is designed to catch different categories of attacks and social engineering tactics.
      </p>

      <ul className="features-list-pro">
        <li>
          <strong>🧠 Deep Neural Network Analysis</strong><br/>
          Multi-layered machine learning models analyze email content, sender behavior, and metadata patterns. Our models have been trained on millions of legitimate and malicious emails to recognize subtle indicators of phishing and spam attacks.
        </li>
        
        <li>
          <strong>⚡ Real-Time Processing</strong><br/>
          Results delivered in milliseconds using optimized processing pipelines and distributed computing infrastructure. No waiting – get instant verdicts while you're reading your email.
        </li>
        
        <li>
          <strong>🎯 Phishing Detection</strong><br/>
          Advanced heuristics detect social engineering tactics, credential harvesting attempts, and spoofed sender addresses. Identifies common phishing templates and new attack patterns automatically.
        </li>
        
        <li>
          <strong>📧 Email Header Analysis</strong><br/>
          Deep inspection of email headers to detect spoofing attempts, check authentication status (SPF, DKIM, DMARC), and identify suspicious routing patterns that indicate compromised mail servers.
        </li>
        
        <li>
          <strong>🔗 URL & Link Analysis</strong><br/>
          Every URL in an email is scanned for redirect chains, malicious domains, and phishing landing pages. Links are checked against threat intelligence databases in real-time.
        </li>
        
        <li>
          <strong>📎 Attachment Safety Check</strong><br/>
          Analyzes attachment metadata for malware signatures, suspicious extensions, and known attack vectors. Detects potentially dangerous file types even when disguised with false extensions.
        </li>
        
        <li>
          <strong>📊 Confidence Scoring</strong><br/>
          Every detection includes a confidence score and detailed explanation of what indicators triggered the verdict. Understand exactly why an email was flagged as suspicious.
        </li>
        
        <li>
          <strong>🌐 Multi-Language Support</strong><br/>
          Natural language processing pipelines support multiple languages to detect phishing and social engineering attacks regardless of language or encoding tricks.
        </li>
        
        <li>
          <strong>🏢 Enterprise Integration</strong><br/>
          RESTful API for seamless integration with existing email systems. Role-based access control, audit trails, and compliance reporting for large organizations and managed service providers.
        </li>
        
        <li>
          <strong>🔄 Continuous Learning</strong><br/>
          Our models are updated daily with new threat intelligence. Machine learning algorithms learn from detection patterns to improve accuracy over time while maintaining explainability.
        </li>
        
        <li>
          <strong>📈 Advanced Reporting</strong><br/>
          Comprehensive dashboards show threat trends, detection statistics, and security insights. Exportable reports help track phishing campaigns and security posture improvements.
        </li>
      </ul>

      <section style={{marginTop: '3em', padding: '2.5em', background: 'rgba(41, 121, 255, 0.08)', border: '1px solid rgba(41, 121, 255, 0.2)', borderRadius: '1.8em'}}>
        <h2 style={{color: '#2979FF', fontSize: '1.8em', marginTop: 0}}>Feature Comparison</h2>
        <div style={{overflowX: 'auto', marginTop: '1.5em'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', color: '#B6D4FF'}}>
            <thead>
              <tr style={{borderBottom: '2px solid rgba(41, 121, 255, 0.3)'}}>
                <th style={{textAlign: 'left', padding: '1em', color: '#00BFAE', fontWeight: 700}}>Feature</th>
                <th style={{textAlign: 'center', padding: '1em', color: '#00BFAE', fontWeight: 700}}>Free Tier</th>
                <th style={{textAlign: 'center', padding: '1em', color: '#00BFAE', fontWeight: 700}}>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{borderBottom: '1px solid rgba(41, 121, 255, 0.15)'}}>
                <td style={{padding: '1em'}}>Email Analysis</td>
                <td style={{textAlign: 'center', padding: '1em'}}>✓</td>
                <td style={{textAlign: 'center', padding: '1em'}}>✓</td>
              </tr>
              <tr style={{borderBottom: '1px solid rgba(41, 121, 255, 0.15)'}}>
                <td style={{padding: '1em'}}>Phishing Detection</td>
                <td style={{textAlign: 'center', padding: '1em'}}>✓</td>
                <td style={{textAlign: 'center', padding: '1em'}}>✓</td>
              </tr>
              <tr style={{borderBottom: '1px solid rgba(41, 121, 255, 0.15)'}}>
                <td style={{padding: '1em'}}>Detailed Explanations</td>
                <td style={{textAlign: 'center', padding: '1em'}}>✓</td>
                <td style={{textAlign: 'center', padding: '1em'}}>✓</td>
              </tr>
              <tr style={{borderBottom: '1px solid rgba(41, 121, 255, 0.15)'}}>
                <td style={{padding: '1em'}}>API Access</td>
                <td style={{textAlign: 'center', padding: '1em'}}>—</td>
                <td style={{textAlign: 'center', padding: '1em'}}>✓</td>
              </tr>
              <tr style={{borderBottom: '1px solid rgba(41, 121, 255, 0.15)'}}>
                <td style={{padding: '1em'}}>Advanced Reporting</td>
                <td style={{textAlign: 'center', padding: '1em'}}>—</td>
                <td style={{textAlign: 'center', padding: '1em'}}>✓</td>
              </tr>
              <tr style={{borderBottom: '1px solid rgba(41, 121, 255, 0.15)'}}>
                <td style={{padding: '1em'}}>Dedicated Support</td>
                <td style={{textAlign: 'center', padding: '1em'}}>—</td>
                <td style={{textAlign: 'center', padding: '1em'}}>✓</td>
              </tr>
              <tr>
                <td style={{padding: '1em'}}>Custom Threat Rules</td>
                <td style={{textAlign: 'center', padding: '1em'}}>—</td>
                <td style={{textAlign: 'center', padding: '1em'}}>✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default FeaturesPage;
