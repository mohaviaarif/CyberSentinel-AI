import os
import logging
import joblib
import numpy as np
from scipy.sparse import hstack

from utils.cleaner import sanitize_input, clean_text
from services.explanation_service import build_explanation
from utils.url_inspector import extract_urls
from services.url_service import URLAnalyzer

logger = logging.getLogger("cybersentinel")
url_analyzer_instance = URLAnalyzer()


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
def analyze_embedded_links(raw_text, max_links=5):
    """
    Extracts every URL found in email text and runs each
    through URLAnalyzer to get individual risk verdicts.
    Capped at max_links to avoid AbuseIPDB rate limits.
    """
    try:
        found_urls = extract_urls(raw_text)
        unique_urls = list(dict.fromkeys(found_urls))
        urls_to_check = unique_urls[:max_links]
        embedded_links = []
        for url in urls_to_check:
            try:
                result = url_analyzer_instance.analyze(url)
                try:
                    from database import get_connection, execute_query
                    conn, db_type = get_connection()
                    try:
                        execute_query(
                            conn, db_type,
                            """INSERT INTO url_scans
                               (user_email, url_scanned,
                                result, score, confidence)
                               VALUES (?, ?, ?, ?, ?)""",
                            (
                                "embedded-scan",
                                url,
                                result.get("result", "unknown"),
                                result.get("score", 0),
                                result.get("confidence", 0.0)
                            )
                        )
                        conn.commit()
                    finally:
                        conn.close()
                except Exception as db_err:
                    logger.error(
                        f"Failed to save embedded URL: {db_err}"
                    )
                indicators = result.get("threat_indicators", [])
                top_reason = (
                    indicators[0]
                    if indicators
                    else "No issues found"
                )
                embedded_links.append({
                    "url": url,
                    "result": result.get("result", "error"),
                    "score": result.get("score", 0),
                    "confidence": result.get("confidence", 0.0),
                    "top_reason": top_reason
                })
            except Exception as link_error:
                logger.error(
                    f"Link analysis failed for {url}: {link_error}"
                )
                embedded_links.append({
                    "url": url,
                    "result": "error",
                    "score": 0,
                    "confidence": 0.0,
                    "top_reason": "Could not analyze this link"
                })
        return embedded_links
    except Exception as e:
        logger.error(f"Embedded link extraction failed: {e}")
        return []


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

        embedded_links = analyze_embedded_links(raw_text)

        logger.info(
            f"Prediction complete | label={prediction} | "
            f"confidence={final_confidence:.4f} | "
            f"links_found={len(embedded_links)}"
        )

        return {
            "prediction": prediction,
            "confidence": round(final_confidence, 4),
            "threats": threats,
            "tips": tips,
            "embedded_links": embedded_links
        }

    except Exception as e:
        logger.error(f"Prediction pipeline failed: {e}")
        raise e
