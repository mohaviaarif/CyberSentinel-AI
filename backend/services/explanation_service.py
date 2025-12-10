from utils.url_inspector import analyze_urls


def build_explanation(raw_text: str, label: str, confidence: float):
    """
    Returns (threats: list[str], tips: list[str])
    """

    info = analyze_urls(raw_text)
    threats = []
    tips = []

    is_phishing = (label == "spam")

    # --- URL-based signals ---
    if info["has_url"]:
        if info["shortener"]:
            threats.append("Email contains shortened tracking links")
        if info["suspicious_tld"]:
            threats.append("Email links use unusual or risky domain extensions")
        if info["ip_based"]:
            threats.append("Email links point directly to an IP address")
        if info["long_url"]:
            threats.append("Email contains unusually long URLs")

    # --- Keyword / pattern based signals ---
    lower = raw_text.lower()

    urgent_words = ["immediately", "within 24 hours", "last warning", "final notice", "urgent", "action required"]
    if any(w in lower for w in urgent_words):
        threats.append("Uses urgency or pressure tactics")

    credential_words = ["password", "login", "account", "verify your identity", "cnic", "atm pin", "security code"]
    if any(w in lower for w in credential_words):
        threats.append("Asks for credentials or sensitive information")

    payment_words = ["processing fee", "clearance fee", "customs fee", "payment required", "transaction failed"]
    if any(w in lower for w in payment_words):
        threats.append("Mentions unexpected payments or fees")

    prize_words = ["you have won", "reward", "prize", "congratulations", "lucky winner"]
    if any(w in lower for w in prize_words):
        threats.append("Offers rewards or prizes that seem too good to be true")

    govt_words = ["fbr", "nadra", "pta", "tax refund", "biometric verification"]
    if any(w in lower for w in govt_words):
        threats.append("Impersonates government or official authority")

    # remove duplicates
    threats = list(dict.fromkeys(threats))

    # --- Tips ---
    if is_phishing:
        tips.extend([
            "Do not click on any links or buttons in this email",
            "Do not enter passwords, CNIC, or banking details",
            "Verify the request using an official website or app",
        ])

        if info["has_url"]:
            tips.append("Manually type the official website instead of using the email link")

        if info["shortener"]:
            tips.append("Avoid trusting shortened links from unknown senders")

    else:
        tips.append("Email appears safe, but stay cautious with links and attachments")

        if info["has_url"]:
            tips.append("Hover over links to confirm they point to legitimate domains")

    # fallback if no threats but phishing label
    if is_phishing and not threats:
        threats.append("AI model detected phishing patterns based on text and structure")

    # fallback if no threats but ham
    if not is_phishing and not threats:
        threats.append("No major phishing patterns detected")

    return threats, tips
