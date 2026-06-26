# CyberSentinel AI — Project Briefing for Codex

## What This Project Is
CyberSentinel AI is a cybersecurity web application built as
a Final Year Project at COMSATS University Islamabad, Abbottabad
Campus. It detects three types of threats:
1. Phishing emails using Machine Learning
2. Malicious URLs using rule-based scoring
3. Malware files using VirusTotal API

## Tech Stack
- Backend: Python Flask running on port 5000
- Frontend: React.js 18 running on port 3000
- Database: SQLite (users.db)
- ML: Logistic Regression with hybrid TF-IDF
- Virtual environment name: cyberenv

## Exact Folder Structure
CyberSentinal-AI/

backend/

app.py                    ← Flask app, CORS, auth, logger

routes/

predict_routes.py       ← /predict and /api/phish-file

url_routes.py           ← /api/url-scan

malware_routes.py       ← /api/file-scan

services/

prediction_service.py   ← ML pipeline, predict_email()

explanation_service.py  ← build_explanation()

url_service.py          ← URLAnalyzer class

malware_service.py      ← MalwareScanner class

utils/

cleaner.py              ← sanitize_input(), clean_text()

url_inspector.py        ← extract_urls(), analyze_single_url()

security/

limiter.py              ← Flask-Limiter setup

models/

best_model.pkl

tfidf_word_vectorizer.pkl

tfidf_char_vectorizer.pkl

cybersentinell-frontend/

src/

App.js

App.css

LandingPage.js

AnalyzePage.js          ← Email scan page

URLScanPage.js          ← URL scan page

FileScanPage.js         ← File scan page

Sidebar.js

Footer.js

loginpage.jsx

signuppage.jsx

## How To Run This Project
Backend:
  cd backend
  cyberenv\Scripts\activate
  python app.py

Frontend:
  cd cybersentinell-frontend
  npm start

## API Endpoints
- POST /predict
  Body: {"text": "email content here"}
  Returns: {prediction, confidence, threats, tips}

- POST /api/phish-file
  Body: multipart form with file (.txt or .eml)
  Returns: {prediction, confidence, threats, tips, filename}

- POST /api/url-scan
  Body: {"url": "https://example.com"}
  Returns: {result, confidence, score, threat_indicators, tips}

- POST /api/file-scan
  Body: multipart form with any file
  Returns: {verdict, malicious_count, total_engines, sha256_hash}

- POST /auth/signup
  Body: {"email": "...", "password": "..."}

- POST /auth/login
  Body: {"email": "...", "password": "..."}

## Critical Rules — Never Break These
- NEVER modify anything inside backend/models/ folder
- NEVER put API keys in code — they live in .env only
- NEVER remove file deletion in malware_service.py
  (file must be deleted BEFORE VirusTotal API call)
- NEVER remove the scheme_added flag in url_service.py
  (it prevents false positives on URLs without http://)
- ALL responses must be JSON

## Key Technical Details

### ML Pipeline (prediction_service.py)
- load_model() loads 3 pkl files from models/ folder
- predict_email(raw_text) runs full pipeline:
  1. sanitize_input() — removes HTML/scripts
  2. clean_text() — lowercase, URL→token, remove punctuation
  3. word_vectorizer.transform() — word TF-IDF
  4. char_vectorizer.transform() — character TF-IDF
  5. scipy hstack — combines both matrices
  6. model.predict() — Logistic Regression prediction
  7. build_explanation() — generates threats and tips
  8. Returns: {prediction, confidence, threats, tips}

### URL Analyzer (url_service.py)
- URLAnalyzer class with analyze(url) method
- Rule-based only — NOT machine learning
- scheme_added flag prevents HTTP penalty for auto-added schemes
- Checks AbuseIPDB for IP reputation
- Returns: {result, score, confidence, threat_indicators, tips}

### URL Inspector (url_inspector.py)
- extract_urls(text) — finds all http/https URLs in any text
- analyze_single_url(url) — scores one URL with 10 features
- analyze_urls(text) — bulk analysis returning summary dict

### Malware Scanner (malware_service.py)
- MalwareScanner class with scan(file_path) method
- Reads file in 8KB chunks for SHA-256 hash
- Deletes file with os.remove() BEFORE API call
- Queries VirusTotal GET /api/v3/files/{hash}
- 0 detections=Clean, 1-5=Suspicious, 6+=Malicious, 404=Unknown

### Frontend (AnalyzePage.js)
- Uses useState for: emailContent, result, loading, error
- Axios POST to localhost:5000/predict
- Displays: ConfidenceRing SVG, VerdictBadge, threat cards
- Supports file upload via FileReader API

## Environment Variables (stored in .env, never in code)
- VIRUSTOTAL_API_KEY
- ABUSEIPDB_API_KEY

## What Is Already Built and Working
- Phishing email detection ✅
- URL threat analysis ✅
- Malware file scanning ✅
- User login and signup ✅
- React dashboard with all scan pages ✅
- 7 security layers ✅
- Audit logging ✅

## What Needs To Be Built (in this exact priority order)
1. Embedded link scanning — extract URLs hidden inside email
   text and run each through URLAnalyzer, show per-link verdict
2. Database tables — EmailScans, URLScans, FileScans tables
3. Scan history page — save and display past scans
4. VirusTotal live upload — upload new files when hash not found
5. Live deployment — Render for backend, Vercel for frontend
6. Gmail Chrome extension — manual trigger scans open email
