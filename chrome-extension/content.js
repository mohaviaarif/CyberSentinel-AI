// This script runs inside Gmail and extracts the
// currently open email's text content when asked.

function extractOpenEmailText() {
  // Gmail wraps open email body in elements with
  // role="listitem" inside the message view, and
  // the readable text is inside div[dir="ltr"] or
  // div.a3s (Gmail's message body class)
  
  const emailBodyElements = document.querySelectorAll(
    'div.a3s.aiL, div[dir="ltr"]'
  );

  if (emailBodyElements.length === 0) {
    return null;
  }

  // Take the largest text block (usually the actual
  // email body, not UI chrome)
  let longestText = "";
  emailBodyElements.forEach((el) => {
    const text = el.innerText || "";
    if (text.length > longestText.length) {
      longestText = text;
    }
  });

  return longestText.trim();
}

function extractOpenEmailHTML() {
  // Get the raw HTML of the email body, including
  // anchor tags and their real href destinations.
  const emailBodyElements = document.querySelectorAll(
    'div.a3s.aiL, div[dir="ltr"]'
  );

  if (emailBodyElements.length === 0) {
    return null;
  }

  // Take the largest HTML block (normally the open
  // message body rather than Gmail interface chrome).
  let longestHTML = "";
  emailBodyElements.forEach((el) => {
    const html = el.innerHTML || "";
    if (html.length > longestHTML.length) {
      longestHTML = html;
    }
  });

  return longestHTML.trim();
}

// Listen for messages from the popup asking for
// the current email's text
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === "GET_EMAIL_TEXT") {
      const emailText = extractOpenEmailText();
      sendResponse({ emailText: emailText });
    }
    if (request.action === "GET_EMAIL_HTML") {
      const emailHTML = extractOpenEmailHTML();
      sendResponse({ emailHTML: emailHTML });
    }
    return true;
  }
);
