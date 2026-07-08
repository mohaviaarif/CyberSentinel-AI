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

          // Step 2: Extract hidden links from the raw email HTML.
          try {
            chrome.tabs.sendMessage(
              tab.id,
              { action: "GET_EMAIL_HTML" },
              async (htmlResponse) => {
                if (
                  chrome.runtime.lastError ||
                  !htmlResponse ||
                  !htmlResponse.emailHTML
                ) {
                  return;
                }

                const emailHTML = htmlResponse.emailHTML;
                if (emailHTML.length < 50) return;

                try {
                  const hiddenRes = await fetch(
                    `${API_BASE}/api/extract-hidden-links`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        html: emailHTML.slice(0, 10000)
                      })
                    }
                  );

                  if (!hiddenRes.ok) return;

                  const hiddenData = await hiddenRes.json();
                  if (
                    hiddenData.hidden_links &&
                    hiddenData.hidden_links.length > 0
                  ) {
                    renderHiddenLinks(hiddenData.hidden_links);
                  }
                } catch (err) {
                  console.log("Hidden link scan failed:", err);
                }
              }
            );
          } catch (err) {
            console.log("HTML extraction failed:", err);
          }

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

function escapeHTML(value) {
  const element = document.createElement("div");
  element.textContent = String(value || "");
  return element.innerHTML;
}

function renderHiddenLinks(hiddenLinks) {
  const existingSection = document.getElementById(
    "hidden-links-section"
  );
  if (existingSection) existingSection.remove();

  if (!hiddenLinks || hiddenLinks.length === 0) {
    return;
  }

  const section = document.createElement("div");
  section.id = "hidden-links-section";
  section.style.cssText = `
    margin-top: 12px;
    padding: 12px;
    background: rgba(255,76,76,0.08);
    border-radius: 8px;
    border: 1px solid rgba(255,76,76,0.4);
  `;

  let html = `
    <div style="font-size:11px; color:#FF4C4C;
                font-weight:bold; margin-bottom:8px;
                text-transform:uppercase;
                letter-spacing:1px;">
      &#9888; ${hiddenLinks.length} Deceptive Link
      ${hiddenLinks.length > 1 ? "s" : ""} Found
    </div>
  `;

  hiddenLinks.forEach((link) => {
    const badgeColor = link.mismatch ? "#FF4C4C" : "#FFC947";
    const badgeText = link.mismatch ? "DECEPTIVE" : "SUSPICIOUS";
    const displayText = escapeHTML(
      String(link.display_text || "").slice(0, 40)
    );
    const realURL = String(link.real_url || "");
    const visibleURL = escapeHTML(realURL.slice(0, 50));
    const reason = escapeHTML(link.reason || "");

    html += `
      <div style="margin-bottom:8px;
                  padding:8px;
                  background:rgba(0,0,0,0.2);
                  border-radius:6px;">
        <div style="display:flex;
                    align-items:center;
                    gap:6px;
                    margin-bottom:4px;">
          <span style="background:${badgeColor};
                       color:#000;
                       font-size:9px;
                       font-weight:bold;
                       padding:2px 5px;
                       border-radius:3px;">
            ${badgeText}
          </span>
          <span style="color:#E0E0E0;
                       font-size:11px;">
            ${displayText}
          </span>
        </div>
        <div style="color:#FF4C4C;
                    font-size:10px;
                    font-family:monospace;
                    margin-left:4px;">
          &rarr; ${visibleURL}${realURL.length > 50 ? "..." : ""}
        </div>
        <div style="color:#6a88b8;
                    font-size:10px;
                    margin-top:2px;
                    margin-left:4px;">
          ${reason}
        </div>
      </div>
    `;
  });

  section.innerHTML = html;
  resultDiv.appendChild(section);
}
