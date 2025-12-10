import os
import logging
import joblib
import numpy as np
from scipy.sparse import hstack

from utils.cleaner import sanitize_input, clean_text
from services.explanation_service import build_explanation

logger = logging.getLogger("cybersentinel")


# --------------------------------------------------------
# LOAD MODEL + BOTH VECTORIZERS (WORD + CHAR)
# --------------------------------------------------------
def load_model():
    try:
        base_path = os.path.join("backend", "models")

        word_vec_path = os.path.join(base_path, "tfidf_word_vectorizer.pkl")
        char_vec_path = os.path.join(base_path, "tfidf_char_vectorizer.pkl")
        model_path = os.path.join(base_path, "best_model.pkl")  # Logistic Regression model

        word_vectorizer = joblib.load(word_vec_path)
        char_vectorizer = joblib.load(char_vec_path)
        model = joblib.load(model_path)

        logger.info("Model + TF-IDF vectorizers loaded successfully.")
        return word_vectorizer, char_vectorizer, model

    except Exception as e:
        logger.error(f"Model load error: {e}")
        raise e


word_vectorizer, char_vectorizer, model = load_model()


# --------------------------------------------------------
# FULL PREDICTION PIPELINE
# --------------------------------------------------------
def predict_email(raw_text):
    try:
        logger.info("Prediction pipeline started.")

        # 1. SANITIZE INPUT
        safe_text = sanitize_input(raw_text)

        # 2. CLEAN TEXT FOR MODEL
        cleaned_text = clean_text(safe_text)

        # 3. VECTORIZE (WORD + CHAR)
        word_vec = word_vectorizer.transform([cleaned_text])
        char_vec = char_vectorizer.transform([cleaned_text])
        combined_vec = hstack([word_vec, char_vec])

        # 4. PREDICT LABEL
        prediction = model.predict(combined_vec)[0]

        # 5. RAW LR PROBABILITIES
        proba = model.predict_proba(combined_vec)[0]
        spam_index = list(model.classes_).index("spam")
        spam_proba = float(proba[spam_index])

        # ------------------------------------------------
        # CONFIDENCE CALIBRATION
        # ------------------------------------------------
        calibrated_conf = float(
            1 / (1 + np.exp(-(spam_proba - 0.5) * 8))
        )

        final_confidence = calibrated_conf if prediction == "spam" else (1 - calibrated_conf)

        # ------------------------------------------------
        # EXPLANATION ENGINE (threats + safety tips)
        # ------------------------------------------------
        threats, tips = build_explanation(
            raw_text=raw_text,
            label=prediction,
            confidence=final_confidence
        )

        logger.info(f"Prediction complete: label={prediction}, confidence={final_confidence}")

        return {
            "prediction": prediction,
            "confidence": final_confidence,
            "threats": threats,
            "tips": tips
        }

    except Exception as e:
        logger.error(f"Prediction pipeline failed: {e}")
        raise e
