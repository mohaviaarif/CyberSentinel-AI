import re
from urllib.parse import urlparse

SUSPICIOUS_TLDS = {
    "zip", "xyz", "top", "click", "link", "rest", "win", "ru", "cn"
}

SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "rb.gy", "goo.gl"
}


def extract_urls(text: str):
    if not isinstance(text, str):
        return []

    pattern = r"(https?://\S+)"
    urls = re.findall(pattern, text)
    return urls


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

            # shortener
            if any(short in host for short in SHORTENERS):
                has_shortener = True

            # suspicious tld
            if "." in host:
                tld = host.split(".")[-1]
                if tld in SUSPICIOUS_TLDS:
                    has_suspicious_tld = True

            # IP-based domain
            if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", host):
                has_ip = True

            # long url
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
