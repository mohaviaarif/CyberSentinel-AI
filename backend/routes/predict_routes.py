from flask import Blueprint, request, jsonify, current_app
from services.prediction_service import predict_email
from security.limiter import limiter

predict_bp = Blueprint("predict", __name__)


@predict_bp.route("/predict", methods=["POST"])
@limiter.limit("10 per minute")
def predict():

    # ------------------------
    # REQUEST RECEIVED LOG
    # ------------------------
    current_app.logger.info("📩 Incoming /predict request")

    # ------------------------
    # VALIDATION CHECKS
    # ------------------------

    if not request.is_json:
        current_app.logger.warning("❌ Validation failed: Request is not JSON")
        return jsonify({"success": False, "error": "JSON body is required."}), 400

    data = request.get_json(silent=True)

    if data is None:
        current_app.logger.warning("❌ Validation failed: Malformed JSON received")
        return jsonify({"success": False, "error": "Invalid JSON format."}), 400

    if "email_text" not in data:
        current_app.logger.warning("❌ Validation failed: Missing 'email_text' field")
        return jsonify({"success": False, "error": "'email_text' field is missing."}), 400

    text = data["email_text"]

    if not isinstance(text, str):
        current_app.logger.warning("❌ Validation failed: 'email_text' is not a string")
        return jsonify({"success": False, "error": "Email text must be a string."}), 400

    if not text.strip():
        current_app.logger.warning("❌ Validation failed: email_text is empty")
        return jsonify({"success": False, "error": "Email text cannot be empty."}), 400

    if len(text) > 5000:
        current_app.logger.warning("❌ Validation failed: email_text too long (>5000 chars)")
        return jsonify({"success": False, "error": "Email text is too long (max 5000 chars)."}), 400

    current_app.logger.info("✅ Validation passed. Forwarding to prediction_service...")

    # ------------------------
    # SAFE PREDICTION
    # ------------------------
    try:
        raw_result = predict_email(text)

        # Expected from predict_email:
        # raw_result = { "prediction": "spam"/"ham", "confidence": float }
        label = raw_result.get("prediction")
        confidence = raw_result.get("confidence")

        # If confidence missing, backend still sends valid response
        if confidence is None:
            confidence = 0.0

        current_app.logger.info(f"✨ Prediction completed: label={label}, confidence={confidence}")

        return jsonify({
            "success": True,
            "result": {
                "label": label,
                "confidence": float(confidence)
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"💥 Prediction service failed: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Internal server error during prediction."
        }), 500
