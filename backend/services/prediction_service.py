import os
import logging
import joblib
import numpy as np
from scipy.sparse import hstack

from utils.cleaner import sanitize_input, clean_text
from services.explanation_service import build_explanation

logger = logging.getLogger("cybersentinel")


# --------------------------------------------------------
# GET ABSOLUTE BASE PATH (IMPORTANT FIX)
# --------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_DIR = os.path.join(BASE_DIR, "models")


# --------------------------------------------------------
# LOAD MODEL + VECTORIZERS
# --------------------------------------------------------
def load_model():
    try:
        word_vec_path = os.path.join(MODEL_DIR, "tfidf_word_vectorizer.pkl")
        char_vec_path = os.path.join(MODEL_DIR, "tfidf_char_vectorizer.pkl")
        model_path = os.path.join(MODEL_DIR, "best_model.pkl")

        # Check files exist
        if not os.path.exists(word_vec_path):
            raise FileNotFoundError(f"Missing: {word_vec_path}")

        if not os.path.exists(char_vec_path):
            raise FileNotFoundError(f"Missing: {char_vec_path}")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Missing: {model_path}")

        # Load models
        word_vectorizer = joblib.load(word_vec_path)
        char_vectorizer = joblib.load(char_vec_path)
        model = joblib.load(model_path)

        logger.info("Model + TF-IDF vectorizers loaded successfully.")
        return word_vectorizer, char_vectorizer, model

    except Exception as e:
        logger.error(f"Model load error: {e}")
        raise e


# Load once (global)
word_vectorizer, char_vectorizer, model = load_model()


# --------------------------------------------------------
# FULL PREDICTION PIPELINE
# --------------------------------------------------------
def predict_email(raw_text):
    try:
        logger.info("Prediction pipeline started.")

        if not raw_text or not isinstance(raw_text, str):
            raise ValueError("Invalid input text.")

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

        # 5. PROBABILITY
        proba = model.predict_proba(combined_vec)[0]
        spam_index = list(model.classes_).index("spam")
        spam_proba = float(proba[spam_index])

        # ------------------------------------------------
        # CONFIDENCE CALIBRATION (SIGMOID SMOOTHING)
        # ------------------------------------------------
        calibrated_conf = float(
            1 / (1 + np.exp(-(spam_proba - 0.5) * 8))
        )

        final_confidence = (
            calibrated_conf if prediction == "spam"
            else (1 - calibrated_conf)
        )

        # ------------------------------------------------
        # EXPLANATION ENGINE
        # ------------------------------------------------
        threats, tips = build_explanation(
            raw_text=raw_text,
            label=prediction,
            confidence=final_confidence
        )

        logger.info(
            f"Prediction complete | label={prediction} | confidence={final_confidence:.4f}"
        )

        return {
            "prediction": prediction,
            "confidence": round(final_confidence, 4),
            "threats": threats,
            "tips": tips
        }

    except Exception as e:
        logger.error(f"Prediction pipeline failed: {e}")
        raise e