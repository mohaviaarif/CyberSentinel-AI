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
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    user_columns = {
        row["name"]
        for row in conn.execute("PRAGMA table_info(users)").fetchall()
    }
    if "created_at" not in user_columns:
        conn.execute("ALTER TABLE users ADD COLUMN created_at DATETIME")
        conn.execute("""
            UPDATE users
            SET created_at = CURRENT_TIMESTAMP
            WHERE created_at IS NULL
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


@app.route("/healthz", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"}), 200


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
            """
            INSERT INTO users (email, password_hash, created_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            """,
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


def is_admin(email):
    """
    Simple admin check - any email in the
    ADMIN_EMAILS environment variable is an admin.
    Falls back to hardcoded list if env not set.
    """
    admin_emails_env = os.getenv(
        "ADMIN_EMAILS",
        "admin@cybersentinel.com,mohavia@cybersentinel.com"
    )
    admin_list = [
        admin_email.strip().lower()
        for admin_email in admin_emails_env.split(",")
    ]
    return email.lower() in admin_list


@app.route("/api/admin/stats", methods=["GET"])
def admin_stats():
    """
    Returns system-wide statistics for admin panel.
    Protected by X-User-Email header check.
    """
    try:
        user_email = request.headers.get(
            "X-User-Email", ""
        )
        if not is_admin(user_email):
            return jsonify({
                "success": False,
                "error": "Unauthorized"
            }), 403

        db_path = os.path.join(
            os.path.dirname(__file__), "users.db"
        )
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row

        total_users = conn.execute(
            "SELECT COUNT(*) as count FROM users"
        ).fetchone()["count"]

        total_email_scans = conn.execute(
            "SELECT COUNT(*) as count FROM email_scans"
        ).fetchone()["count"]

        total_url_scans = conn.execute(
            "SELECT COUNT(*) as count FROM url_scans"
        ).fetchone()["count"]

        total_file_scans = conn.execute(
            "SELECT COUNT(*) as count FROM file_scans"
        ).fetchone()["count"]

        phishing_detected = conn.execute("""
            SELECT COUNT(*) as count FROM email_scans
            WHERE prediction = 'spam'
        """).fetchone()["count"]

        malicious_urls = conn.execute("""
            SELECT COUNT(*) as count FROM url_scans
            WHERE result = 'malicious'
        """).fetchone()["count"]

        malicious_files = conn.execute("""
            SELECT COUNT(*) as count FROM file_scans
            WHERE verdict = 'Malicious'
        """).fetchone()["count"]

        recent_scans = conn.execute("""
            SELECT 'email' as type,
                   prediction as result,
                   scanned_at
            FROM email_scans
            UNION ALL
            SELECT 'url' as type,
                   result,
                   scanned_at
            FROM url_scans
            UNION ALL
            SELECT 'file' as type,
                   verdict as result,
                   scanned_at
            FROM file_scans
            ORDER BY scanned_at DESC
            LIMIT 5
        """).fetchall()

        conn.close()

        return jsonify({
            "success": True,
            "stats": {
                "total_users": total_users,
                "total_email_scans": total_email_scans,
                "total_url_scans": total_url_scans,
                "total_file_scans": total_file_scans,
                "total_scans": (
                    total_email_scans +
                    total_url_scans +
                    total_file_scans
                ),
                "threats_detected": (
                    phishing_detected +
                    malicious_urls +
                    malicious_files
                ),
                "phishing_detected": phishing_detected,
                "malicious_urls": malicious_urls,
                "malicious_files": malicious_files
            },
            "recent_activity": [dict(row) for row in recent_scans]
        }), 200

    except Exception as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


@app.route("/api/admin/users", methods=["GET"])
def admin_users():
    """
    Returns list of all registered users.
    Protected by admin check.
    """
    try:
        user_email = request.headers.get(
            "X-User-Email", ""
        )
        if not is_admin(user_email):
            return jsonify({
                "success": False,
                "error": "Unauthorized"
            }), 403

        db_path = os.path.join(
            os.path.dirname(__file__), "users.db"
        )
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row

        users = conn.execute("""
            SELECT
                u.email,
                u.created_at,
                COUNT(DISTINCT es.scan_id) as email_scans,
                COUNT(DISTINCT us.scan_id) as url_scans,
                COUNT(DISTINCT fs.scan_id) as file_scans
            FROM users u
            LEFT JOIN email_scans es ON es.user_email = u.email
            LEFT JOIN url_scans us ON us.user_email = u.email
            LEFT JOIN file_scans fs ON fs.user_email = u.email
            GROUP BY u.email, u.created_at
            ORDER BY u.created_at DESC
        """).fetchall()

        conn.close()

        return jsonify({
            "success": True,
            "users": [dict(user) for user in users]
        }), 200

    except Exception as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


@app.route("/api/admin/scans", methods=["GET"])
def admin_scans():
    """
    Returns all recent scans across all modules.
    Protected by admin check.
    """
    try:
        user_email = request.headers.get(
            "X-User-Email", ""
        )
        if not is_admin(user_email):
            return jsonify({
                "success": False,
                "error": "Unauthorized"
            }), 403

        db_path = os.path.join(
            os.path.dirname(__file__), "users.db"
        )
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row

        email_rows = conn.execute("""
            SELECT 'email' as scan_type,
                   user_email,
                   input_summary as summary,
                   prediction as result,
                   confidence,
                   scanned_at
            FROM email_scans
            ORDER BY scanned_at DESC LIMIT 50
        """).fetchall()

        url_rows = conn.execute("""
            SELECT 'url' as scan_type,
                   user_email,
                   url_scanned as summary,
                   result,
                   confidence,
                   scanned_at
            FROM url_scans
            ORDER BY scanned_at DESC LIMIT 50
        """).fetchall()

        file_rows = conn.execute("""
            SELECT 'file' as scan_type,
                   user_email,
                   filename as summary,
                   verdict as result,
                   NULL as confidence,
                   scanned_at
            FROM file_scans
            ORDER BY scanned_at DESC LIMIT 50
        """).fetchall()

        conn.close()

        all_scans = (
            [dict(row) for row in email_rows] +
            [dict(row) for row in url_rows] +
            [dict(row) for row in file_rows]
        )

        all_scans.sort(
            key=lambda scan: scan.get("scanned_at") or "",
            reverse=True
        )

        return jsonify({
            "success": True,
            "scans": all_scans[:50]
        }), 200

    except Exception as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


@app.route("/api/admin/check", methods=["GET"])
def admin_check():
    """
    Simple endpoint to check if current user is admin.
    Frontend uses this to show/hide admin link.
    """
    user_email = request.headers.get("X-User-Email", "")
    return jsonify({
        "success": True,
        "is_admin": is_admin(user_email)
    }), 200


# ---------------------------------
# Run App
# ---------------------------------
if __name__ == "__main__":
    app.run(debug=False, port=5000)
