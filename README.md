# CyberSentinel AI
### Intelligent Cybersecurity Toolkit for Phishing, Malware, and Threat Detection
**COMSATS University Islamabad, Abbottabad Campus | Final Year Project 2026**

## Team
- Mohavia Arif (CIIT/FA22-BCS-084/ATD) — Lead AI/Backend Developer
- Anas Bashir (CIIT/FA22-BCS-081/ATD) — Frontend Developer  
- Abdul Samad Paracha (CIIT/FA22-BCS-056/ATD) — Documentation and Testing

**Supervisor:** Dr. Mazhar Ali  
**Project No:** 60

---

## Live Demo
- **Frontend:** https://cybersentinell-frontend.vercel.app
- **Backend API:** https://cybersentinel-ai-backend.onrender.com

---

## What It Does
CyberSentinel AI is a free web-based cybersecurity 
platform that detects three types of threats:
1. Phishing emails using ML (98.73% accuracy)
2. Malicious URLs using 10-feature rule-based scoring
3. Malware files using VirusTotal API (70+ engines)

---

## Tech Stack
- **Backend:** Python 3.11, Flask, scikit-learn, 
  PostgreSQL, gunicorn
- **Frontend:** React 18, React Router v6, Axios
- **ML:** Logistic Regression with Hybrid TF-IDF
- **APIs:** VirusTotal API v3, AbuseIPDB API
- **Deployment:** Render (backend), Vercel (frontend)

---

## Project Structure

CyberSentinal-AI/
backend/
app.py # Flask application
database.py # PostgreSQL/SQLite abstraction
routes/ # API endpoints
services/ # ML and detection logic
utils/ # Helper functions
models/ # Trained ML model files
requirements.txt # Python dependencies
cybersentinell-frontend/
src/ # React components
public/ # Static assets
chrome-extension/ # Gmail Chrome extension


---

## Setup and Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/mohaviaarif/CyberSentinel-AI.git
cd CyberSentinel-AI/backend

# Create virtual environment
python -m venv cyberenv

# Activate virtual environment
# Windows:
cyberenv\Scripts\activate
# Mac/Linux:
source cyberenv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Variables
Create a `.env` file in the backend folder:

VIRUSTOTAL_API_KEY=your_virustotal_api_key
ABUSEIPDB_API_KEY=your_abuseipdb_api_key
SMTP_EMAIL=your_gmail_address
SMTP_PASSWORD=your_gmail_app_password
ADMIN_EMAILS=your_admin_email
DATABASE_URL=your_postgresql_connection_string


### Run Backend
```bash
cd backend
python app.py
# Backend runs on http://localhost:5000
```

### Frontend Setup
```bash
cd cybersentinell-frontend
npm install
npm start
# Frontend runs on http://localhost:3000
```

### Chrome Extension
1. Open Chrome and go to chrome://extensions
2. Enable Developer Mode
3. Click Load Unpacked
4. Select the chrome-extension/ folder

---

## API Endpoints
| Endpoint | Method | Description |
|---|---|---|
| /predict | POST | Phishing email detection |
| /api/phish-file | POST | Email file upload scan |
| /api/url-scan | POST | URL threat analysis |
| /api/file-scan | POST | Malware file scanning |
| /api/scan-document | POST | PDF/Word document scan |
| /api/scan-history | GET | User scan history |
| /api/stats | GET | System statistics |
| /api/admin/stats | GET | Admin overview |
| /healthz | GET | Health check |

---

## ML Model Performance
| Metric | Value |
|---|---|
| Accuracy | 98.73% |
| Precision | 95% |
| Recall | 95% |
| F1-Score | 95% |
| Test Set | 1024 emails |

---

## Security Features
1. Input sanitization against XSS attacks
2. Rate limiting (10 requests per minute)
3. Payload size limit (32MB)
4. CORS restriction
5. SHA-256 password hashing
6. API key protection (.env)
7. Audit logging

---

## License
This project was developed as a Final Year Project 
at COMSATS University Islamabad, Abbottabad Campus.
