from flask import Flask, jsonify
from flask_cors import CORS
from routes.predict_routes import predict_bp
import logging
import os

# Security
from security.limiter import limiter   # <-- correct limiter import


# ---------------------------------
# Create Flask App
# ---------------------------------
app = Flask(__name__)

# ---------------------------------
# STEP 2: Max Payload Limit (1MB)
# ---------------------------------
app.config["MAX_CONTENT_LENGTH"] = 1 * 1024 * 1024  # 1 MB


# ---------------------------------
# STEP 4: CORS — Only allow React frontend
# ---------------------------------
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


# ---------------------------------
# Ensure logs folder exists
# ---------------------------------
os.makedirs("backend/logs", exist_ok=True)


# ---------------------------------
# Custom Logger
# ---------------------------------
logger = logging.getLogger("cybersentinel")
logger.setLevel(logging.INFO)

file_handler = logging.FileHandler("backend/logs/app.log")
file_handler.setLevel(logging.INFO)

formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
file_handler.setFormatter(formatter)

logger.addHandler(file_handler)
app.logger = logger


# ---------------------------------
# STEP 1: Global Rate Limiter
# ---------------------------------
limiter.init_app(app)


# ---------------------------------
# Register Blueprints
# ---------------------------------
app.register_blueprint(predict_bp)


# ---------------------------------
# Routes
# ---------------------------------
@app.route("/", methods=["GET"])
def home():
    app.logger.info("Home route accessed")
    return {"message": "⚡ CyberSentinel-AI API is running securely!"}


# ---------------------------------
# GLOBAL ERROR HANDLERS
# ---------------------------------

@app.errorhandler(404)
def not_found(error):
    app.logger.warning("404 - Route not found")
    return jsonify({
        "success": False,
        "error": "Route not found."
    }), 404


@app.errorhandler(405)
def method_not_allowed(error):
    app.logger.warning("405 - Method not allowed")
    return jsonify({
        "success": False,
        "error": "Method not allowed."
    }), 405


@app.errorhandler(413)
def too_large(error):
    app.logger.warning("413 - Payload too large")
    return jsonify({
        "success": False,
        "error": "Payload too large (max 1MB)."
    }), 413


@app.errorhandler(429)
def rate_limit_handler(error):
    app.logger.warning("429 - Rate limit exceeded")
    return jsonify({
        "success": False,
        "error": "Rate limit exceeded. Try again later."
    }), 429


@app.errorhandler(500)
def internal_error(error):
    app.logger.error("500 - Internal server error")
    return jsonify({
        "success": False,
        "error": "Something went wrong on the server."
    }), 500


# ---------------------------------
# STEP 3: Run App (Debug OFF)
# ---------------------------------
if __name__ == "__main__":
    app.run(debug=False, port=5000)
