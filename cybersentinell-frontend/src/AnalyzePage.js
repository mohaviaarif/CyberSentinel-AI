import React, { useState } from 'react';

export function AnalyzePage() {
  const [emailContent, setEmailContent] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // -------------------------------
  // 🔥 Real Backend API Integration
  // -------------------------------
  const handleAnalyze = async () => {
    if (!emailContent.trim()) {
      alert('Please paste an email to analyze');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email_text: emailContent
        })
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      // Backend returns:
      // success: true
      // result: { label: "spam"/"ham", confidence: float }

      const label = data.result.label;
      const confidence = Math.round(data.result.confidence * 100);

      // Convert backend → frontend UI styling
      const isPhishing = label === "spam";

      setResult({
        verdict: isPhishing ? "Phishing" : "Safe",
        confidence: confidence,
        riskLevel: isPhishing ? "High" : "Low",
        threats: isPhishing
          ? [
              "AI model detected phishing patterns",
              "Suspicious phrasing or malicious intent",
              "Possible credential-stealing attempt"
            ]
          : ["No major threats detected"],

        safetyTips: isPhishing
          ? [
              "Do not click suspicious links",
              "Never share personal credentials",
              "Verify sender identity before responding"
            ]
          : ["Email appears safe"]
      });

    } catch (error) {
      console.error("API error:", error);
      alert("Could not connect to backend.");
    }

    setLoading(false);
  };

  const handleClear = () => {
    setEmailContent('');
    setResult(null);
  };

  return (
    <div className="analyze-page-pro">
      <h1>Email Threat Analyzer</h1>

      <p style={{fontSize: '1.08em', color: '#A4C7EC', marginBottom: '1.5em', lineHeight: 1.7}}>
        Paste the full content of any email below (including headers) to analyze it for phishing, spam, and other security threats.
      </p>

      <div style={{background: 'rgba(41, 121, 255, 0.08)', padding: '1.5em', borderRadius: '1.3em', border: '1px solid rgba(41, 121, 255, 0.2)', marginBottom: '2em'}}>
        <h3 style={{color: '#00BFAE', marginTop: 0}}>📋 How to Get Your Email:</h3>
        <ul style={{color: '#A4C7EC', lineHeight: 1.8, paddingLeft: '1.5em'}}>
          <li><strong>Gmail:</strong> Show original → Copy everything</li>
          <li><strong>Outlook:</strong> View message details → Copy content</li>
        </ul>
      </div>

      <label style={{display: 'block', marginBottom: '0.8em', fontSize: '1.08em', fontWeight: 700, color: '#A4C7EC'}}>
        Email Content:
      </label>

      <textarea
        className="analyze-input-pro"
        placeholder="Paste the complete email here..."
        rows="15"
        value={emailContent}
        onChange={(e) => setEmailContent(e.target.value)}
      />

      <div style={{display: 'flex', gap: '1em', marginTop: '1.5em'}}>
        <button className="analyze-btn-pro" onClick={handleAnalyze} disabled={loading}>
          {loading ? '⟳ Analyzing...' : '🔍 Analyze Email'}
        </button>

        <button 
          style={{
            padding: '1.2em 2.5em',
            background: 'rgba(41, 121, 255, 0.2)',
            color: '#2979FF',
            border: '2px solid rgba(41, 121, 255, 0.4)',
            borderRadius: '1.5em',
            fontWeight: 700,
            fontSize: '1.1em',
            cursor: 'pointer'
          }}
          onClick={handleClear}
        >
          Clear
        </button>
      </div>

      {result && (
        <div className="analyze-result-pro" style={{marginTop: '2.5em'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5em'}}>
            <div>
              <h2 style={{margin: '0 0 0.5em 0', color: '#F2F6FF', fontSize: '2em'}}>
                {result.verdict === 'Phishing' ? '🚨' : result.verdict === 'Spam' ? '⚠️' : '✅'} {result.verdict}
              </h2>

              <div style={{display: 'flex', gap: '1.5em', flexWrap: 'wrap'}}>
                <div>
                  <p style={{margin: '0 0 0.3em 0', fontSize: '0.9em', opacity: 0.8}}>Confidence</p>
                  <p style={{margin: 0, fontSize: '1.3em', fontWeight: 700, color: '#00BFAE'}}>
                    {result.confidence}%
                  </p>
                </div>

                <div>
                  <p style={{margin: '0 0 0.3em 0', fontSize: '0.9em', opacity: 0.8}}>Risk Level</p>
                  <p style={{margin: 0, fontSize: '1.3em', fontWeight: 700, color: result.riskLevel === 'High' ? '#ff6b6b' : '#ffa500'}}>
                    {result.riskLevel}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{borderTop: '1px solid rgba(41, 121, 255, 0.3)', paddingTop: '1.5em'}}>
            <h3 style={{color: '#2979FF', marginTop: 0}}>🔍 Detected Threats:</h3>
            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
              {result.threats.map((threat, idx) => (
                <li key={idx} style={{
                  padding: '0.8em 0 0.8em 2em',
                  borderBottom: idx < result.threats.length - 1 ? '1px solid rgba(41, 121, 255, 0.1)' : 'none',
                  position: 'relative'
                }}>
                  <span style={{position: 'absolute', left: 0, color: '#ff6b6b'}}>●</span>
                  {threat}
                </li>
              ))}
            </ul>
          </div>

          <div style={{marginTop: '1.5em', borderTop: '1px solid rgba(41, 121, 255, 0.3)', paddingTop: '1.5em'}}>
            <h3 style={{color: '#2979FF', marginTop: 0}}>💡 Safety Recommendations:</h3>
            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
              {result.safetyTips.map((tip, idx) => (
                <li key={idx} style={{
                  padding: '0.8em 0 0.8em 2em',
                  borderBottom: idx < result.safetyTips.length - 1 ? '1px solid rgba(41, 121, 255, 0.1)' : 'none',
                  position: 'relative'
                }}>
                  <span style={{position: 'absolute', left: 0, color: '#00BFAE'}}>✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyzePage;

