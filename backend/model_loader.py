import joblib
import re
import math

# ---------------------------------------------------
# Load vectorizer + model at import for fast access
# ---------------------------------------------------
print("🔧 Loading TF-IDF vectorizer...")
tfidf = joblib.load("models/tfidf_vectorizer.pkl")
print("✅ TF-IDF vectorizer loaded.")

print("🤖 Loading trained model...")
model = joblib.load("models/winner_model.pkl")  # your production SVM
print("✅ Model loaded.")

# ---------------------------------------------------
# Clean email text function
# ---------------------------------------------------
def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"http\S+", "url", text)  # replace URLs with "url"
    text = re.sub(r"[^a-zA-Z0-9 ]", " ", text)  # remove special characters
    text = re.sub(r"\s+", " ", text).strip()    # remove extra spaces
    return text

# ---------------------------------------------------
# Prediction function
# ---------------------------------------------------
def predict_email(text):
    # Handle empty or None emails
    if text is None or text.strip() == "":
        return {
            "prediction": "invalid",
            "confidence": 0,
            "message": "Email text cannot be empty."
        }

    # Clean the text
    cleaned = clean_text(text)

    # Transform text using TF-IDF
    vect = tfidf.transform([cleaned])

    # Get raw SVM score
    try:
        if hasattr(model, "decision_function"):
            score = float(model.decision_function(vect)[0])
        else:
            score = 0.0
    except:
        score = 0.0

    # Convert to 0–1 confidence using sigmoid
    conf = 1 / (1 + math.exp(-score))

    # Threshold for final prediction
    threshold = 0.4
    final_pred = "phishing" if conf >= threshold else "ham"

    # Keyword-based phishing boost
    phishing_keywords = [
        "urgent", "click here", "verify account", "account closed",
        "winner", "prize", "password", "reset", "suspended"
    ]
    if any(word in cleaned for word in phishing_keywords):
        final_pred = "phishing"
        conf = max(conf, 0.6)  # boost confidence for keyword hits

    return {
        "prediction": final_pred,
        "confidence": round(conf, 2)
    }

# ---------------------------------------------------
# Testing area
# ---------------------------------------------------
if __name__ == "__main__":
    test_emails = [
        "Urgent! Your account will be closed. Click here.",        # obvious phishing
        "Hello team, please find the report attached.",            # normal ham
        "FREE MONEY!!! Visit http://scamlink.com NOW!!!",          # phishing with URL & caps
        "",                                                        # empty string
        None,                                                      # None input
        "Hello <script>alert('hack')</script> visit site.com",     # weird characters & JS injection
        "   SPAM     SPAM   SPAM  ",                               # lots of extra spaces
    ]

    for i, email in enumerate(test_emails, 1):
        result = predict_email(email)
        print(f"\nTest {i}: {email}")
        print(f"Prediction: {result['prediction']}, Confidence: {result['confidence']}")

