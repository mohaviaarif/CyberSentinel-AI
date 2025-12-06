import os
import logging
import joblib

from utils.cleaner import sanitize_input, clean_text

logger = logging.getLogger("cybersentinel")

# ----------------------------
# Load Model + Vectorizer
# ----------------------------
def load_model():
    try:
        vectorizer_path = os.path.join("backend", "models", "tfidf_vectorizer.pkl")
        model_path = os.path.join("backend", "models", "best_model.pkl")

        vectorizer = joblib.load(vectorizer_path)
        model = joblib.load(model_path)

        logger.info("Models loaded successfully.")
        return vectorizer, model

    except Exception as e:
        logger.error(f"Model load error: {e}")
        raise e


vectorizer, model = load_model()


# ----------------------------
# Prediction function
# ----------------------------
def predict_email(raw_text):
    try:
        logger.info("Prediction pipeline running...")

        # 1. Sanitize
        safe_text = sanitize_input(raw_text)

        # 2. Clean
        cleaned_text = clean_text(safe_text)

        # 3. Vectorize
        vectorized = vectorizer.transform([cleaned_text])

        # 4. Predict label
        prediction = model.predict(vectorized)[0]

        # 5. Predict confidence
        proba = model.predict_proba(vectorized)[0]
        confidence = float(max(proba))

        return {
            "prediction": prediction,
            "confidence": confidence
        }

    except Exception as e:
        logger.error(f"Prediction pipeline failed: {e}")
        raise e
