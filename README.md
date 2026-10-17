# CyberSentinel AI: Final Year Project Summary

**Student:** Mohavia Arif (FA22-BCS-084) | **Supervisor:** Dr. Mazhar Ali | **FYP grade:** 4.0 GPA
COMSATS University Islamabad, Abbottabad Campus

## 1. What It Is

CyberSentinel AI is a free, web-based cybersecurity platform that helps non-technical internet users in Pakistan check emails, links and files for online threats. It uses machine learning and threat-intelligence APIs, is deployed live so nothing needs to be installed, and includes a Gmail Chrome extension. Its email model is trained to recognise scams that imitate Pakistani brands such as JazzCash, Easypaisa, HBL and NADRA.

## 2. My Contribution

- I wrote all of the project code. A teammate prepared the documentation.
- Backend: Flask API, PostgreSQL schema (Supabase), and deployment on Render and Vercel.
- Detection: trained and validated the phishing email model, and integrated VirusTotal and AbuseIPDB.
- Features: Gmail Chrome extension, embedded link scanning, live file upload to VirusTotal, Admin Control Panel, email notifications, and PDF/Word scanning.
- **QA after the FYP presentation (done independently):** ran an automated endpoint test suite (`test_all_endpoints.py`), documented 10 URL test cases and performed 9 end-to-end user journeys. Fixed three problems this found:
  - a false positive in the URL analyzer, where the automatically added `http://` triggered the "no HTTPS" penalty;
  - the VirusTotal 404 gap for new files;
  - a Google Terms of Service email wrongly flagged as phishing, fixed with a trusted-sender whitelist in the extension.

## 3. The Three Detection Modules

| Module | How it works |
|---|---|
| **Phishing email** | Logistic Regression with hybrid TF-IDF: word-level (1–3 n-grams, 30,000 features) plus character-level (3–6 n-grams, catches tricks like `payp4l`). Trained on a Kaggle dataset plus 200 Pakistani synthetic samples. |
| **Malicious URL** | Rule-based, not machine learning. Scores 10 structural features (IP as domain, `@` symbol, suspicious keywords, no HTTPS and others); a score of 4 or more is flagged malicious. AbuseIPDB adds a live IP reputation check. |
| **Malware scan** | Computes a SHA-256 hash of the file, checks it against VirusTotal (70+ antivirus engines), and uploads new files for live analysis. The file is deleted right after hashing. |

## 4. Results

The accuracy figures are for the **phishing email model only**, tested on 1,024 emails (80/20 train-test split).

| Metric | Result |
|---|---|
| Accuracy | 98.73% |
| Precision / Recall / F1 (phishing class) | 95% each |
| Errors | 6 false negatives, 7 false positives |
| Prediction speed | 8 ms per email |

Also delivered: 9 of 9 SRS modules, and 7 security layers (input sanitization, rate limiting, CORS, payload-size limits, hashing, `.env` configuration, logging).

## 5. What I Learned

- QA is not a final step. The URL false positive and the VirusTotal 404 gap only appeared under real test conditions, not in the design.
- Deployment was harder than writing the detection modules: moving from SQLite to PostgreSQL, configuring Render and Vercel, and fixing CORS for the production domain.
- A system that works on localhost is not finished. Keeping it running and recoverable is where much of the real work is.

## 6. Links

- Live website: https://cybersentinell-frontend.vercel.app
- GitHub: https://github.com/mohaviaarif/CyberSentinel-AI
- Backend API: https://cybersentinel-ai-backend.onrender.com
