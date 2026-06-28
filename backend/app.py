from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.predict_routes import predict_bp
from routes.url_routes import url_bp
from routes.malware_routes import malware_bp
from dotenv import load_dotenv
import logging
import os
import sqlite3
import hashlib

load_dotenv()

# Security
from security.limiter import limiter


# ---------------------------------
# Create Flask App
# ---------------------------------
app = Flask(__name__)
# ---------------------------------
# STEP 2: Max Payload Limit (UPDATED TO 32MB)
# ---------------------------------
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024 * 1024  # 32 MB


# ---------------------------------
# STEP 4: CORS — Only allow React frontend
# ---------------------------------
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGIN", "http://localhost:3000"
).split(",")
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}})


# ---------------------------------
# Ensure logs folder exists
# ---------------------------------
os.makedirs("logs", exist_ok=True)

# ---------------------------------
# Custom Logger
# ---------------------------------
logger = logging.getLogger("cybersentinel")
logger.setLevel(logging.INFO)

log_path = os.path.join(os.getcwd(), "logs", "app.log")
file_handler = logging.FileHandler(log_path)
file_handler.setLevel(logging.INFO)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

logger.addHandler(file_handler)
logger.addHandler(console_handler)

app.logger = logger


# ---------------------------------
# STEP 1: Global Rate Limiter
# ---------------------------------
limiter.init_app(app)


# ============================================================
# 🔐 AUTHENTICATION SYSTEM (Signup + Login)
# ============================================================

def get_db():
    conn = sqlite3.connect("users.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS email_scans (
            scan_id    INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            input_summary TEXT,
            prediction TEXT,
            confidence REAL,
            threats    TEXT,
            links_found INTEGER DEFAULT 0,
            scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS url_scans (
            scan_id    INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            url_scanned TEXT,
            result     TEXT,
            score      INTEGER,
            confidence REAL,
            scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS file_scans (
            scan_id        INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email     TEXT,
            filename       TEXT,
            sha256_hash    TEXT,
            verdict        TEXT,
            malicious_count INTEGER DEFAULT 0,
            total_engines  INTEGER DEFAULT 0,
            file_deleted   BOOLEAN DEFAULT 1,
            scanned_at     DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

vt_key = os.getenv("VIRUSTOTAL_API_KEY")
pt_key = os.getenv("PHISHTANK_API_KEY")
ai_key = os.getenv("ABUSEIPDB_API_KEY")

logger.info(f"API Keys loaded: VT={'YES' if vt_key else 'NO'}, PT={'YES' if pt_key else 'NO'}, AI={'YES' if ai_key else 'NO'}")

def hash_password(pw):
    return hashlib.sha256(pw.encode("utf-8")).hexdigest()


@app.route("/auth/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password required."}), 400

    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            (email, hash_password(password)),
        )
        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "Signup successful!"})

    except Exception:
        return jsonify({"success": False, "error": "User already exists."}), 400


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    conn = get_db()
    cur = conn.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cur.fetchone()
    conn.close()

    if not user or user["password_hash"] != hash_password(password):
        return jsonify({"success": False, "error": "Invalid email or password."}), 401

    return jsonify({
        "success": True,
        "message": "Login successful!",
        "token": "dummy-token-123",
        "email": email
    })


# ---------------------------------
# Register Blueprints
# ---------------------------------
app.register_blueprint(predict_bp)
app.register_blueprint(url_bp)
app.register_blueprint(malware_bp)


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
    return jsonify({"success": False, "error": "Route not found."}), 404


@app.errorhandler(405)
def method_not_allowed(error):
    app.logger.warning("405 - Method not allowed")
    return jsonify({"success": False, "error": "Method not allowed."}), 405


@app.errorhandler(413)
def too_large(error):
    app.logger.warning("413 - Payload too large")
    return jsonify({"success": False, "error": "Payload too large (max 32MB)."}), 413


@app.errorhandler(429)
def rate_limit_handler(error):
    app.logger.warning("429 - Rate limit exceeded")
    return jsonify({"success": False, "error": "Rate limit exceeded. Try again later."}), 429


@app.errorhandler(500)
def internal_error(error):
    app.logger.error("500 - Internal server error")
    return jsonify({"success": False, "error": "Something went wrong on the server."}), 500


@app.route("/api/scan-history", methods=["GET"])
def get_scan_history():
    try:
        db_path = os.path.join(
            os.path.dirname(__file__), "users.db"
        )
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row

        email_rows = conn.execute("""
            SELECT 'email' as scan_type,
                   scan_id,
                   input_summary as summary,
                   prediction as result,
                   confidence,
                   scanned_at
            FROM email_scans
            ORDER BY scanned_at DESC LIMIT 20
        """).fetchall()

        url_rows = conn.execute("""
            SELECT 'url' as scan_type,
                   scan_id,
                   url_scanned as summary,
                   result,
                   confidence,
                   scanned_at
            FROM url_scans
            ORDER BY scanned_at DESC LIMIT 20
        """).fetchall()

        file_rows = conn.execute("""
            SELECT 'file' as scan_type,
                   scan_id,
                   filename as summary,
                   verdict as result,
                   NULL as confidence,
                   scanned_at
            FROM file_scans
            ORDER BY scanned_at DESC LIMIT 20
        """).fetchall()

        conn.close()

        all_scans = (
            [dict(r) for r in email_rows] +
            [dict(r) for r in url_rows] +
            [dict(r) for r in file_rows]
        )

        all_scans.sort(
            key=lambda x: x.get("scanned_at") or "",
            reverse=True
        )

        return jsonify({
            "success": True,
            "scans": all_scans[:20]
        }), 200

    except Exception as e:
        app.logger.error(f"Scan history error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------------------------
# Run App
# ---------------------------------
if __name__ == "__main__":
    app.run(debug=False, port=5000)
