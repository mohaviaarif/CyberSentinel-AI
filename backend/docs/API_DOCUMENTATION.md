# CyberSentinel AI -- API Documentation

## Base URL

http://127.0.0.1:5000

---

## GET /

Health check
Response:
{"message": "CyberSentinel-AI API is running securely!"}

---

## POST /predict

Phishing email detection (text input)

Body:
{"text": "email content here"}

Response:
{
"prediction": "spam/ham",
"confidence": 0.98,
"threats": [...],
"tips": [...]
}

---

## POST /api/phish-file

Phishing detection from uploaded file

Body: form-data → file (.txt or .eml)

Response:
{
"prediction": "spam/ham",
"confidence": 0.98,
"source": "file_upload"
}

---

## POST /api/url-scan

URL threat analysis

Body:
{"url": "https://example.com"}

Response:
{
"result": "safe/suspicious/malicious",
"confidence": 0.85,
"threat_indicators": [...]
}

---

## POST /api/file-scan

Malware file scanning

Body: form-data → file

Response:
{
"verdict": "Clean/Suspicious/Malicious/Error",
"sha256_hash": "...",
"file_deleted": true
}

---

## POST /auth/signup

User registration

Body:
{"email": "[user@example.com](mailto:user@example.com)", "password": "password"}

---

## POST /auth/login

User login

Body:
{"email": "[user@example.com](mailto:user@example.com)", "password": "password"}

Response:
{
"success": true,
"token": "...",
"email": "[user@example.com](mailto:user@example.com)"
}

---

## Error Codes

400 → Bad request
401 → Unauthorized
413 → File too large
415 → Unsupported file type
429 → Rate limit exceeded
500 → Server error
