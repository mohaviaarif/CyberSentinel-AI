import joblib
import numpy as np
import re
import os
import logging
import math

# ----------------------------
# Logging setup
# ----------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)

# ----------------------------
# Base directory
# ----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ----------------------------
# Load Vectorizer + Model
# ----------------------------
print("🔧 Loading TF-IDF vectorizer...")
tfidf = joblib.load(os.path.join(BASE_DIR, "..", "models", "tfidf_vectorizer.pkl"))
print("✅ TF-IDF vectorizer loaded.")

print("🤖 Loading trained model...")
model = joblib.load(os.path.join(BASE_DIR, "..", "models", "winner_model.pkl"))
print("✅ Model loaded.")

# ----------------------------
# Clean email text
# ----------------------------
def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"http\S+", "url", text)   # replace URLs
    text = re.sub(r"[^a-zA-Z0-9 ]", " ", text)  # remove special characters
    text = re.sub(r"\s+", " ", text).strip()
    return text

# ----------------------------
# Main prediction function
# ----------------------------
def predict_email(text, threshold=0.4):  # threshold for phishing
    # Handle empty text
    if text is None or text.strip() == "":
        logging.warning("Received empty or None text")
        return {
            "prediction": "invalid",
            "confidence": 0,
            "message": "Email text cannot be empty."
        }

    # Clean text
    cleaned = clean_text(text)
    logging.info(f"Cleaned text: {cleaned[:50]}...")  # first 50 chars

    # Transform to TF-IDF
    vect = tfidf.transform([cleaned])

    # Predict using SVM decision function
    try:
        if hasattr(model, "decision_function"):
            raw_score = float(model.decision_function(vect)[0])
        else:
            raw_score = 0.0
    except Exception as e:
        logging.error(f"Error calculating confidence: {e}")
        raw_score = 0.0

    # Convert raw score to 0–1 confidence using sigmoid
    confidence = 1 / (1 + math.exp(-raw_score))

    # Keyword-based phishing boost
    phishing_keywords = [
        "urgent", "click here", "verify account", "account closed",
        "winner", "prize", "password", "reset", "suspended"
    ]
    if any(word in cleaned for word in phishing_keywords):
        confidence = max(confidence, 0.6)  # boost confidence for keyword hits

    # Determine final prediction
    prediction_label = "phishing" if confidence >= threshold else "ham"

    logging.info(f"Prediction: {prediction_label}, Confidence: {confidence:.3f}")

    return {
        "prediction": prediction_label,
        "confidence": round(confidence, 3)
    }

# ----------------------------
# Testing area
# ----------------------------
if __name__ == "__main__":
    test_emails = [
        "Urgent! Your account will be closed. Click here.",        # phishing
        "Hello team, please find the report attached.",            # ham
        "FREE MONEY!!! Visit http://scamlink.com NOW!!!",          # phishing
        "",                                                        # empty
        None,                                                      # None input
        "Hello <script>alert('hack')</script> visit site.com",     # weird characters
        "   SPAM     SPAM   SPAM  ",                               # lots of extra spaces
    ]

    for idx, email in enumerate(test_emails, 1):
        print(f"\n🧪 Test Email {idx}:")
        result = predict_email(email)
        print(f"Prediction: {result['prediction']}, Confidence: {result['confidence']}")
        if "message" in result:
            print(f"Message: {result['message']}")
