import re
from urllib.parse import urlparse

SUSPICIOUS_TLDS = {
    "zip", "xyz", "top", "click", "link", "rest", "win", "ru", "cn",
    "tk", "ml", "ga", "cf"
}

SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "rb.gy", "goo.gl",
    "ow.ly", "is.gd", "buff.ly"
}


def extract_urls(text: str):
    if not isinstance(text, str):
        return []

    pattern = r"(https?://\S+)"
    return re.findall(pattern, text)


def analyze_urls(text: str):
    urls = extract_urls(text)

    if not urls:
        return {
            "urls": [],
            "has_url": False,
            "shortener": False,
            "suspicious_tld": False,
            "ip_based": False,
            "long_url": False
        }

    has_shortener = False
    has_suspicious_tld = False
    has_ip = False
    has_long = False

    for url in urls:
        try:
            parsed = urlparse(url)
            host = parsed.netloc.lower()

            if host in SHORTENERS:
                has_shortener = True

            if "." in host:
                tld = host.split(".")[-1]
                if tld in SUSPICIOUS_TLDS:
                    has_suspicious_tld = True

            if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", host):
                has_ip = True

            if len(url) > 80:
                has_long = True

        except Exception:
            continue

    return {
        "urls": urls,
        "has_url": True,
        "shortener": has_shortener,
        "suspicious_tld": has_suspicious_tld,
        "ip_based": has_ip,
        "long_url": has_long
    }


def analyze_single_url(url: str) -> dict:
    if not url or not isinstance(url, str):
        return {
            "score": 0,
            "risk_level": "error",
            "confidence": 0.0,
            "threat_indicators": ["No URL provided"],
            "features": {},
            "reasoning": "No URL provided."
        }

    url = url.strip()

    if not url.startswith(("http://", "https://")):
        url = "http://" + url

    threat_indicators = []
    features = {}
    score = 0

    try:
        parsed = urlparse(url)

        host = parsed.netloc.lower()
        path = parsed.path.lower()
        scheme = parsed.scheme.lower()

        if not host:
            return {
                "score": 0,
                "risk_level": "error",
                "confidence": 0.0,
                "threat_indicators": ["Invalid URL format"],
                "features": {},
                "reasoning": "Invalid URL format."
            }

        domain = host.replace("www.", "")

        features["url_length_over_75"] = len(url) > 75
        if features["url_length_over_75"]:
            score += 1
            threat_indicators.append(f"URL is unusually long ({len(url)} characters)")

        is_ip = bool(re.match(r"^\d{1,3}(\.\d{1,3}){3}$", host))
        features["has_ip_address"] = is_ip
        if is_ip:
            score += 2
            threat_indicators.append("Domain is an IP address")

        features["has_at_symbol"] = "@" in url
        if features["has_at_symbol"]:
            score += 2
            threat_indicators.append("URL contains @ symbol")

        features["is_http_not_https"] = scheme == "http"
        if features["is_http_not_https"]:
            score += 1
            threat_indicators.append("URL uses HTTP not HTTPS")

        SUSPICIOUS_KEYWORDS = [
            "login", "verify", "account", "update", "secure",
            "free", "bank", "paypal", "confirm", "password",
            "suspended", "click", "signin", "validate", "authorize",
            "winner", "prize", "claim", "urgent", "expire",
            "jazzcash", "easypaisa", "hbl", "ubl", "meezan",
            "nadra", "pta", "fbr", "bisp", "ehsaas"
        ]

        url_lower = url.lower()
        found_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url_lower]

        features["has_suspicious_keywords"] = len(found_keywords) > 0
        if features["has_suspicious_keywords"]:
            score += 2
            threat_indicators.append(f"Suspicious keywords: {', '.join(found_keywords)}")

        features["has_hyphens_in_domain"] = "-" in domain
        if features["has_hyphens_in_domain"]:
            score += 1
            threat_indicators.append("Hyphens in domain")

        features["is_url_shortener"] = host in SHORTENERS
        if features["is_url_shortener"]:
            score += 1
            threat_indicators.append("URL shortener detected")

        subdomain_count = max(0, len(domain.split(".")) - 2)
        features["num_subdomains_over_3"] = subdomain_count > 3
        if features["num_subdomains_over_3"]:
            score += 1
            threat_indicators.append(f"Too many subdomains ({subdomain_count})")

        tld = domain.split(".")[-1] if "." in domain else ""
        features["has_suspicious_tld"] = tld in SUSPICIOUS_TLDS
        if features["has_suspicious_tld"]:
            score += 1
            threat_indicators.append(f"Suspicious TLD: .{tld}")

        features["has_long_path"] = len(path) > 20
        if features["has_long_path"]:
            score += 1
            threat_indicators.append("Long URL path")

    except Exception as e:
        return {
            "score": 0,
            "risk_level": "error",
            "confidence": 0.0,
            "threat_indicators": [f"Error analyzing URL: {str(e)}"],
            "features": {},
            "reasoning": "Error analyzing URL."
        }

    # 🔥 AI REASONING (ONLY ADDED PART)
    if threat_indicators:
        reasoning = "This URL is flagged because: " + "; ".join(threat_indicators) + "."
    else:
        reasoning = "No harmful indicators detected."

    # RISK CALCULATION
    if score >= 4:
        risk_level = "malicious"
        confidence = min(0.95, 0.6 + (score * 0.05))
    elif score >= 2:
        risk_level = "suspicious"
        confidence = min(0.75, 0.4 + (score * 0.05))
    elif score == 1:
        risk_level = "suspicious"
        confidence = 0.5
    else:
        risk_level = "safe"
        confidence = 0.95

    if not threat_indicators:
        threat_indicators.append("No major threat indicators detected")

    return {
        "score": score,
        "risk_level": risk_level,
        "confidence": round(confidence, 4),
        "threat_indicators": threat_indicators,
        "features": features,
        "reasoning": reasoning  # ✅ ADDED
    }