import os
import re
import socket
import requests
from dotenv import load_dotenv
from utils.url_inspector import analyze_single_url

load_dotenv()

ABUSEIPDB_KEY = os.getenv("ABUSEIPDB_API_KEY")


class URLAnalyzer:
    """
    Module 2: Malicious URL Analyzer
    Stage 1: Rule-based scoring + AbuseIPDB API
    Stage 2 (future): ML model
    """

    def analyze(self, url: str) -> dict:
        """
        Main analysis method.
        Takes a URL string, returns full threat assessment.
        """

        # ── STEP 1: Input validation ──────────────────
        if not url or not isinstance(url, str):
            return self._error_response("No URL provided")

        url = url.strip()

        # ✅ Track if scheme was auto-added
        scheme_added = False

        # Add scheme if missing so urlparse works correctly
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "http://" + url
            scheme_added = True

        # Basic format check
        if "." not in url:
            return self._error_response("Invalid URL format — must contain a domain")

        # ── STEP 2: Rule-based scoring ────────────────
        local_result = analyze_single_url(url)

        score = local_result["score"]
        threat_indicators = local_result["threat_indicators"].copy()
        features = local_result["features"]

        # ✅ FINAL FIX (corrected properly)
        if scheme_added and features.get("is_http_not_https"):
            features["is_http_not_https"] = False
            score = max(0, score - 1)

            threat_indicators = [
                t for t in threat_indicators
                if "HTTP not HTTPS" not in t
            ]

        # ── STEP 3: AbuseIPDB check ───────────────────
        abuseipdb_checked = False
        abuseipdb_score = 0

        try:
            domain = self._extract_domain(url)
            if domain:
                ip = self._resolve_domain(domain)
                if ip:
                    abuse_result = self._check_abuseipdb(ip)
                    if abuse_result is not None:
                        abuseipdb_checked = True
                        abuseipdb_score = abuse_result

                        if abuseipdb_score > 50:
                            score += 3
                            threat_indicators.append(
                                f"Domain IP has {abuseipdb_score}% abuse confidence score on AbuseIPDB — flagged by security community"
                            )
                        elif abuseipdb_score > 20:
                            score += 1
                            threat_indicators.append(
                                f"Domain IP has {abuseipdb_score}% abuse confidence score — some suspicious activity reported"
                            )

        except Exception:
            threat_indicators.append(
                "External IP reputation check unavailable — result based on URL analysis only"
            )

        # ── STEP 4: Final classification ──────────────
        if score >= 4:
            risk_level = "malicious"
            confidence = min(0.97, 0.65 + (score * 0.04))
        elif score >= 2:
            risk_level = "suspicious"
            confidence = min(0.80, 0.45 + (score * 0.05))
        elif score == 1:
            risk_level = "suspicious"
            confidence = 0.55
        else:
            risk_level = "safe"
            confidence = 0.85

        # ── STEP 5: Generate tips ─────────────────────
        tips = self._generate_tips(risk_level, features)

        if risk_level == "safe" and len(threat_indicators) == 1:
            threat_indicators = ["No major threat indicators detected in this URL"]

        return {
            "result": risk_level,
            "confidence": round(confidence, 4),
            "score": score,
            "threat_indicators": threat_indicators,
            "tips": tips,
            "abuseipdb_checked": abuseipdb_checked,
            "abuseipdb_score": abuseipdb_score,
            "features": features
        }

    def _extract_domain(self, url: str) -> str:
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            host = parsed.netloc.lower()
            host = host.split(":")[0]
            host = host.replace("www.", "")
            return host
        except Exception:
            return ""

    def _resolve_domain(self, domain: str) -> str:
        try:
            if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain):
                return domain
            ip = socket.gethostbyname(domain)
            return ip
        except Exception:
            return ""

    def _check_abuseipdb(self, ip: str) -> int:
        if not ABUSEIPDB_KEY or ABUSEIPDB_KEY == "not_available":
            return None

        try:
            response = requests.get(
                "https://api.abuseipdb.com/api/v2/check",
                params={"ipAddress": ip, "days": "90"},
                headers={
                    "Key": ABUSEIPDB_KEY,
                    "Accept": "application/json"
                },
                timeout=8
            )

            if response.status_code == 200:
                data = response.json()
                return data["data"]["abuseConfidenceScore"]
            else:
                return None

        except Exception:
            return None

    def _generate_tips(self, risk_level: str, features: dict) -> list:
        tips = []

        if risk_level == "safe":
            tips.append("This URL appears safe based on our analysis")
            tips.append("Always verify the sender before clicking any link")
            return tips

        if features.get("is_http_not_https"):
            tips.append("Never enter passwords or personal information on HTTP websites")

        if features.get("has_ip_address"):
            tips.append("Do not visit websites that use IP addresses instead of domain names")

        if features.get("has_suspicious_keywords"):
            tips.append("Be cautious of URLs containing words like 'verify', 'login', or 'account'")

        if features.get("is_url_shortener"):
            tips.append("Use a URL expander tool to see the real destination before clicking")

        if features.get("has_hyphens_in_domain"):
            tips.append("Check the domain carefully — attackers use hyphens to mimic legitimate sites")

        tips.append("Do not enter any personal information, passwords, or banking details")
        tips.append("Report this URL to your IT department or cybersecurity team")

        return tips

    def _error_response(self, message: str) -> dict:
        return {
            "result": "error",
            "confidence": 0.0,
            "score": 0,
            "threat_indicators": [message],
            "tips": ["Please enter a valid URL starting with http:// or https://"],
            "abuseipdb_checked": False,
            "abuseipdb_score": 0,
            "features": {}
        }