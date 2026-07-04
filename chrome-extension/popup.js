const API_BASE = "https://cybersentinel-ai-backend.onrender.com";

const scanBtn = document.getElementById("scanBtn");
const statusText = document.getElementById("statusText");
const resultDiv = document.getElementById("result");

scanBtn.addEventListener("click", async () => {
  resultDiv.style.display = "none";
  resultDiv.innerHTML = "";
  scanBtn.disabled = true;
  statusText.textContent = "Reading email...";
  statusText.className = "status-text";

  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab.url.includes("mail.google.com")) {
      statusText.textContent = "Please open this on Gmail.";
      statusText.className = "error-text";
      scanBtn.disabled = false;
      return;
    }

    // Ask content script for the email text
    chrome.tabs.sendMessage(
      tab.id,
      { action: "GET_EMAIL_TEXT" },
      async (response) => {
        if (chrome.runtime.lastError || !response || !response.emailText) {
          statusText.textContent = 
            "Could not read email. Open an email first.";
          statusText.className = "error-text";
          scanBtn.disabled = false;
          return;
        }

        const emailText = response.emailText;

        if (emailText.length < 10) {
          statusText.textContent = 
            "Email content too short to analyze.";
          statusText.className = "error-text";
          scanBtn.disabled = false;
          return;
        }

        statusText.textContent = 
          "Analyzing with CyberSentinel AI... (may take a few seconds)";

        try {
          const res = await fetch(`${API_BASE}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: emailText.slice(0, 5000) })
          });

          const data = await res.json();

          if (!res.ok) {
            statusText.textContent = 
              data.error || "Scan failed. Try again.";
            statusText.className = "error-text";
            scanBtn.disabled = false;
            return;
          }

          renderResult(data);
          statusText.textContent = "";
          scanBtn.disabled = false;

        } catch (err) {
          statusText.textContent = 
            "Could not reach CyberSentinel AI server. " +
            "It may be waking up — try again in 30 seconds.";
          statusText.className = "error-text";
          scanBtn.disabled = false;
        }
      }
    );

  } catch (err) {
    statusText.textContent = "Something went wrong: " + err.message;
    statusText.className = "error-text";
    scanBtn.disabled = false;
  }
});

function renderResult(data) {
  const isPhishing = 
    data.prediction === "spam" || data.prediction === "phishing";

  let html = `
    <div class="verdict-badge ${isPhishing ? 'phishing' : 'safe'}">
      ${isPhishing ? '🔴 PHISHING DETECTED' : '🟢 LOOKS SAFE'}
    </div>
    <div class="confidence">
      Confidence: ${(data.confidence * 100).toFixed(0)}%
    </div>
  `;

  if (data.threats && data.threats.length > 0) {
    html += `<div style="font-size:11px; color:#6a88b8; margin-bottom:6px;">THREAT INDICATORS</div>`;
    data.threats.forEach((t) => {
      html += `<div class="threat-item">• ${t}</div>`;
    });
  }

  if (data.embedded_links && data.embedded_links.length > 0) {
    html += `<div class="links-section">`;
    html += `<div style="font-size:11px; color:#6a88b8; margin-bottom:6px;">
      LINKS FOUND (${data.embedded_links.length})
    </div>`;
    data.embedded_links.forEach((link) => {
      const colorMap = {
        safe: "#00E5A0",
        suspicious: "#FFC947",
        malicious: "#FF4C4C",
        error: "#888"
      };
      const color = colorMap[link.result] || "#888";
      html += `
        <div class="link-item" style="background: ${color}22; border: 1px solid ${color}; color: ${color};">
          ${link.result.toUpperCase()}: ${link.url.slice(0, 40)}${link.url.length > 40 ? '...' : ''}
        </div>
      `;
    });
    html += `</div>`;
  }

  resultDiv.innerHTML = html;
  resultDiv.style.display = "block";
}
