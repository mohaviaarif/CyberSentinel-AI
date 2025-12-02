from flask import Flask, request, jsonify
from flask_cors import CORS
from model_loader import predict_email  # only import THIS

app = Flask(__name__)
CORS(app)

# ----------------------------
# Test Route
# ----------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "⚡ CyberSentinel-AI API is running!"})

# ----------------------------
# Prediction Route
# ----------------------------
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if data is None:
        return jsonify({"error": "Invalid JSON"}), 400

    if "email" not in data:
        return jsonify({"error": "Missing 'email' field in JSON payload."}), 400

    email_text = data["email"]

    # Run prediction (model is already loaded inside model_loader.py)
    result = predict_email(email_text)

    return jsonify(result), 200

# ----------------------------
# Run the Flask app
# ----------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
