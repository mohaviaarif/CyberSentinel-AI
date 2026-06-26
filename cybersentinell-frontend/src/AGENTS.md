# CyberSentinel AI — Agent Configuration

## Project Overview
CyberSentinel AI is a Flask + React.js cybersecurity web application
for phishing email detection, URL threat analysis, and malware file
scanning. Final Year Project at COMSATS University Islamabad,
Abbottabad Campus. Python backend, React frontend.

## Team
- Mohavia Arif (FA22-BCS-084) — Lead AI/Backend
- Anas Bashir (FA22-BCS-081) — Frontend
- Abdul Samad Paracha (FA22-BCS-056) — Documentation

## Folder Structure
CyberSentinal-AI/

backend/

app.py

routes/

predict_routes.py

url_routes.py

malware_routes.py

services/

prediction_service.py

explanation_service.py

url_service.py

malware_service.py

utils/

cleaner.py

url_inspector.py

security/

limiter.py

models/

best_model.pkl

tfidf_word_vectorizer.pkl

tfidf_char_vectorizer.pkl

cybersentinell-frontend/

src/

App.js

App.css

LandingPage.js

AnalyzePage.js

URLScanPage.js

FileScanPage.js

Sidebar.js

Footer.js

loginpage.jsx

signuppage.jsx

## How To Run
Backend:
cd backend

cyberenv\Scripts\activate

python app.py
Frontend:
cd cybersentinell-frontend

npm start

## Ports
- Backend: localhost:5000
- Frontend: localhost:3000

## Key Technical Facts
- ML model: Logistic Regression with hybrid TF-IDF
  (word-level 1-3 grams + character-level 3-6 grams combined
  with scipy hstack). Trained on phishing email dataset.
- URL analysis: rule-based 10-feature scoring engine. NOT machine
  learning. Uses URLAnalyzer class in url_service.py.
- File scanning: SHA-256 hash lookup on VirusTotal API v3.
  File is deleted BEFORE VirusTotal API call (privacy design).
- Authentication: SHA-256 password hashing, SQLite users.db
- Virtual environment name: cyberenv
- CORS configured for localhost:3000 only

## Existing API Endpoints
- POST /predict — email text scan, JSON body: {"text": "..."}
- POST /api/phish-file — email file upload (.txt or .eml)
- POST /api/url-scan — URL scan, JSON body: {"url": "..."}
- POST /api/file-scan — malware file upload
- POST /auth/signup — user registration
- POST /auth/login — user login

## Critical Rules — Never Break These
- NEVER modify files inside backend/models/ folder
- NEVER put API keys in code — they belong in .env only
- NEVER remove the file deletion in malware_service.py
- NEVER remove the scheme_added flag in url_service.py
- ALL scan endpoints must return JSON responses
- The .env file is gitignored — never add it to git
- Virtual environment cyberenv is gitignored — never add it

## What Needs To Be Built (Priority Order)
1. Embedded link scanning — extract URLs from email text and
   run each through URLAnalyzer, show per-link verdict
2. Database tables — EmailScans, URLScans, FileScans,
   AuditLogs, SystemStats tables in SQLite
3. Scan history — save every scan result, show history page
4. VirusTotal live upload — when hash returns 404 (not found),
   upload the actual file for live analysis and poll for result
5. Live deployment — backend on Render, frontend on Vercel
6. Gmail Chrome extension — manual trigger, scans open email

## Dependencies
Backend (pip): flask, flask-cors, flask-limiter, scikit-learn,
scipy, joblib, numpy, requests, python-dotenv, hashlib
Frontend (npm): react, react-router-dom, axios, jspdf,
html2canvas, @mui/icons-material, react-icons