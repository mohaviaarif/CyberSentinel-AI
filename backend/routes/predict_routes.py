from flask import Blueprint, request, jsonify, current_app
from services.prediction_service import predict_email
from security.limiter import limiter
import time

predict_bp = Blueprint("predict", __name__)


@predict_bp.route("/predict", methods=["POST"])
@limiter.limit("10 per minute")
def predict():

    # File debug (no emojis)
    current_app.logger.info(f"Running predict_routes from: {__file__}")

    # Request received
    current_app.logger.info("Incoming /predict request")

    # ------------------------
    # VALIDATION
    # ------------------------

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

    # ------------------------
    # PREDICTION PIPELINE + SPEED LOGGING
    # ------------------------

    try:
        start_time = time.time()

        result = predict_email(text)

        end_time = time.time()
        prediction_time = round(end_time - start_time, 4)

        current_app.logger.info(f"Prediction time: {prediction_time} seconds")

        # Extract fields
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
