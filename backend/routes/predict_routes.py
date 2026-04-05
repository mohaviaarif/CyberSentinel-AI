from flask import Blueprint, request, jsonify, current_app
from services.prediction_service import predict_email
from security.limiter import limiter
import time
import os

predict_bp = Blueprint("predict", __name__)


@predict_bp.route("/predict", methods=["POST"])
@limiter.limit("10 per minute")
def predict():

    current_app.logger.info(f"Running predict_routes from: {__file__}")
    current_app.logger.info("Incoming /predict request")

    if not request.is_json:
        current_app.logger.warning("Request failed: body is not JSON")
        return jsonify({"success": False, "error": "JSON body is required."}), 400

    data = request.get_json(silent=True)

    if data is None:
        current_app.logger.warning("Request failed: malformed JSON")
        return jsonify({"success": False, "error": "Invalid JSON format."}), 400

    if "email_text" not in data:
        current_app.logger.warning("Request failed: missing 'email_text'")
        return jsonify({"success": False, "error": "'email_text' field is missing."}), 400

    text = data["email_text"]

    if not isinstance(text, str):
        current_app.logger.warning("Request failed: 'email_text' is not string")
        return jsonify({"success": False, "error": "Email text must be a string."}), 400

    if not text.strip():
        current_app.logger.warning("Request failed: 'email_text' is empty")
        return jsonify({"success": False, "error": "Email text cannot be empty."}), 400

    if len(text) > 5000:
        current_app.logger.warning("Request failed: 'email_text' too long")
        return jsonify({"success": False, "error": "Email text is too long (max 5000 chars)."}), 400

    current_app.logger.info("Validation passed. Sending to prediction_service...")

    try:
        start_time = time.time()

        result = predict_email(text)

        end_time = time.time()
        prediction_time = round(end_time - start_time, 4)

        current_app.logger.info(f"Prediction time: {prediction_time} seconds")

        label = result.get("prediction")
        confidence = float(result.get("confidence", 0.0))
        threats = result.get("threats", [])
        tips = result.get("tips", [])

        current_app.logger.info(
            f"Prediction complete -> label={label}, confidence={confidence}"
        )

        return jsonify({
            "success": True,
            "result": {
                "label": label,
                "confidence": confidence,
                "threats": threats,
                "tips": tips,
                "response_time": prediction_time
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Prediction Service Failed: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Internal server error during prediction."
        }), 500


# ✅ CORRECT POSITION (OUTSIDE predict function)
@predict_bp.route("/api/phish-file", methods=["POST"])
@limiter.limit("10 per minute")
def scan_email_file():
    """
    POST /api/phish-file
    Accepts .txt or .eml file upload.
    Reads text content and runs through phishing detection.
    """

    try:
        if "file" not in request.files:
            return jsonify({
                "success": False,
                "error": "No file provided. Please upload a .txt or .eml file."
            }), 400

        uploaded_file = request.files["file"]

        if uploaded_file.filename == "" or uploaded_file.filename is None:
            return jsonify({
                "success": False,
                "error": "No file selected."
            }), 400

        filename = uploaded_file.filename
        file_ext = os.path.splitext(filename)[1].lower()

        if file_ext not in [".txt", ".eml"]:
            return jsonify({
                "success": False,
                "error": "Only .txt and .eml files are supported for email analysis."
            }), 415

        file_content = uploaded_file.read()

        try:
            email_text = file_content.decode("utf-8")
        except UnicodeDecodeError:
            email_text = file_content.decode("latin-1", errors="ignore")

        email_text = email_text.strip()

        if not email_text:
            return jsonify({
                "success": False,
                "error": "The uploaded file is empty. Please provide a file with email content."
            }), 400

        if len(email_text) < 10:
            return jsonify({
                "success": False,
                "error": "File content is too short to analyze."
            }), 400

        current_app.logger.info(
            f"Email file scan: {filename} | content_length={len(email_text)} chars"
        )

        result = predict_email(email_text)

        current_app.logger.info(
            f"Email file scan complete: {filename} | "
            f"prediction={result['prediction']} | "
            f"confidence={result['confidence']}"
        )

        return jsonify({
            "success": True,
            "source": "file_upload",
            "filename": filename,
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "threats": result.get("threats", []),
            "tips": result.get("tips", [])
        }), 200

    except Exception as e:
        current_app.logger.error(f"Email file scan error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Analysis failed. Please try again."
        }), 500