from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.predict_routes import predict_bp
from routes.url_routes import url_bp
from routes.malware_routes import malware_bp
from dotenv import load_dotenv
import logging
import os
import hashlib

load_dotenv()

from database import (
    get_connection,
    execute_query,
    fetchall_as_dicts,
    fetchone_as_dict,
    init_db as db_init,
)

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

def init_db():
    db_init()

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

    password_hash = hash_password(password)

    try:
        conn, db_type = get_connection()
        try:
            cursor = execute_query(
                conn, db_type,
                "SELECT id FROM users WHERE email = ?",
                (email,)
            )
            existing = fetchone_as_dict(cursor, db_type)
            if existing:
                return jsonify({
                    "success": False,
                    "error": "Email already registered."
                }), 409

            execute_query(
                conn, db_type,
                """INSERT INTO users
                   (email, password_hash)
                   VALUES (?, ?)""",
                (email, password_hash)
            )
            conn.commit()
        finally:
            conn.close()

        try:
            from services.notification_service \
                import send_welcome_email
            send_welcome_email(email)
        except Exception as welcome_err:
            app.logger.error(
                f"Welcome email failed: {welcome_err}"
            )

        return jsonify({"success": True, "message": "Signup successful!"})

    except Exception:
        return jsonify({"success": False, "error": "User already exists."}), 400


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    password_hash = hash_password(password)

    conn, db_type = get_connection()
    try:
        cursor = execute_query(
            conn, db_type,
            """SELECT * FROM users
               WHERE email = ?
               AND password_hash = ?""",
            (email, password_hash)
        )
        user = fetchone_as_dict(cursor, db_type)
    finally:
        conn.close()

    if not user:
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
        conn, db_type = get_connection()
        try:
            email_cursor = execute_query(
                conn, db_type,
                """SELECT 'email' as scan_type,
                          scan_id,
                          input_summary as summary,
                          prediction as result,
                          confidence,
                          scanned_at
                   FROM email_scans
                   ORDER BY scanned_at DESC
                   LIMIT 20"""
            )
            email_rows = fetchall_as_dicts(
                email_cursor, db_type
            )

            url_cursor = execute_query(
                conn, db_type,
                """SELECT 'url' as scan_type,
                          scan_id,
                          url_scanned as summary,
                          result,
                          confidence,
                          scanned_at
                   FROM url_scans
                   ORDER BY scanned_at DESC
                   LIMIT 20"""
            )
            url_rows = fetchall_as_dicts(
                url_cursor, db_type
            )

            file_cursor = execute_query(
                conn, db_type,
                """SELECT 'file' as scan_type,
                          scan_id,
                          filename as summary,
                          verdict as result,
                          NULL as confidence,
                          scanned_at
                   FROM file_scans
                   ORDER BY scanned_at DESC
                   LIMIT 20"""
            )
            file_rows = fetchall_as_dicts(
                file_cursor, db_type
            )
        finally:
            conn.close()

        all_scans = (
            email_rows +
            url_rows +
            file_rows
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

        conn, db_type = get_connection()
        try:
            cursor = execute_query(
                conn, db_type,
                "SELECT COUNT(*) as count FROM users"
            )
            total_users = fetchone_as_dict(
                cursor, db_type
            )["count"]

            cursor = execute_query(
                conn, db_type,
                "SELECT COUNT(*) as count FROM email_scans"
            )
            total_email_scans = fetchone_as_dict(
                cursor, db_type
            )["count"]

            cursor = execute_query(
                conn, db_type,
                "SELECT COUNT(*) as count FROM url_scans"
            )
            total_url_scans = fetchone_as_dict(
                cursor, db_type
            )["count"]

            cursor = execute_query(
                conn, db_type,
                "SELECT COUNT(*) as count FROM file_scans"
            )
            total_file_scans = fetchone_as_dict(
                cursor, db_type
            )["count"]

            cursor = execute_query(
                conn, db_type,
                """SELECT COUNT(*) as count FROM email_scans
                   WHERE prediction = 'spam'"""
            )
            phishing_detected = fetchone_as_dict(
                cursor, db_type
            )["count"]

            cursor = execute_query(
                conn, db_type,
                """SELECT COUNT(*) as count FROM url_scans
                   WHERE result = 'malicious'"""
            )
            malicious_urls = fetchone_as_dict(
                cursor, db_type
            )["count"]

            cursor = execute_query(
                conn, db_type,
                """SELECT COUNT(*) as count FROM file_scans
                   WHERE verdict = 'Malicious'"""
            )
            malicious_files = fetchone_as_dict(
                cursor, db_type
            )["count"]

            cursor = execute_query(
                conn, db_type,
                """SELECT 'email' as type,
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
                   LIMIT 5"""
            )
            recent_scans = fetchall_as_dicts(
                cursor, db_type
            )
        finally:
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
            "recent_activity": recent_scans
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

        conn, db_type = get_connection()
        try:
            cursor = execute_query(
                conn, db_type,
                """SELECT
                          u.email,
                          u.created_at,
                          COUNT(DISTINCT es.scan_id) as email_scans,
                          COUNT(DISTINCT us.scan_id) as url_scans,
                          COUNT(DISTINCT fs.scan_id) as file_scans
                   FROM users u
                   LEFT JOIN email_scans es
                       ON es.user_email = u.email
                   LEFT JOIN url_scans us
                       ON us.user_email = u.email
                   LEFT JOIN file_scans fs
                       ON fs.user_email = u.email
                   GROUP BY u.email, u.created_at
                   ORDER BY u.created_at DESC"""
            )
            users = fetchall_as_dicts(cursor, db_type)
        finally:
            conn.close()

        return jsonify({
            "success": True,
            "users": users
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

        conn, db_type = get_connection()
        try:
            cursor = execute_query(
                conn, db_type,
                """SELECT 'email' as scan_type,
                          user_email,
                          input_summary as summary,
                          prediction as result,
                          confidence,
                          scanned_at
                   FROM email_scans
                   ORDER BY scanned_at DESC LIMIT 50"""
            )
            email_rows = fetchall_as_dicts(cursor, db_type)

            cursor = execute_query(
                conn, db_type,
                """SELECT 'url' as scan_type,
                          user_email,
                          url_scanned as summary,
                          result,
                          confidence,
                          scanned_at
                   FROM url_scans
                   ORDER BY scanned_at DESC LIMIT 50"""
            )
            url_rows = fetchall_as_dicts(cursor, db_type)

            cursor = execute_query(
                conn, db_type,
                """SELECT 'file' as scan_type,
                          user_email,
                          filename as summary,
                          verdict as result,
                          NULL as confidence,
                          scanned_at
                   FROM file_scans
                   ORDER BY scanned_at DESC LIMIT 50"""
            )
            file_rows = fetchall_as_dicts(cursor, db_type)
        finally:
            conn.close()

        all_scans = (
            email_rows +
            url_rows +
            file_rows
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


@app.route("/api/stats", methods=["GET"])
def public_stats():
    """
    Returns real-time system statistics for
    the public dashboard. No auth required.
    """
    try:
        conn, db_type = get_connection()
        try:
            cursor = execute_query(
                conn, db_type,
                "SELECT COUNT(*) as c FROM email_scans"
            )
            total_email_scans = fetchone_as_dict(
                cursor, db_type
            )["c"]

            cursor = execute_query(
                conn, db_type,
                "SELECT COUNT(*) as c FROM url_scans"
            )
            total_url_scans = fetchone_as_dict(
                cursor, db_type
            )["c"]

            cursor = execute_query(
                conn, db_type,
                "SELECT COUNT(*) as c FROM file_scans"
            )
            total_file_scans = fetchone_as_dict(
                cursor, db_type
            )["c"]

            cursor = execute_query(
                conn, db_type,
                """SELECT COUNT(*) as c FROM email_scans
                   WHERE prediction = 'spam'"""
            )
            phishing_detected = fetchone_as_dict(
                cursor, db_type
            )["c"]

            cursor = execute_query(
                conn, db_type,
                """SELECT COUNT(*) as c FROM url_scans
                   WHERE result = 'malicious'"""
            )
            malicious_urls = fetchone_as_dict(
                cursor, db_type
            )["c"]

            cursor = execute_query(
                conn, db_type,
                """SELECT COUNT(*) as c FROM file_scans
                   WHERE verdict = 'Malicious'"""
            )
            malicious_files = fetchone_as_dict(
                cursor, db_type
            )["c"]

            cursor = execute_query(
                conn, db_type,
                "SELECT COUNT(*) as c FROM users"
            )
            total_users = fetchone_as_dict(
                cursor, db_type
            )["c"]
        finally:
            conn.close()

        total_scans = (
            total_email_scans +
            total_url_scans +
            total_file_scans
        )

        threats_detected = (
            phishing_detected +
            malicious_urls +
            malicious_files
        )

        return jsonify({
            "success": True,
            "total_scans": total_scans,
            "threats_detected": threats_detected,
            "total_email_scans": total_email_scans,
            "total_url_scans": total_url_scans,
            "total_file_scans": total_file_scans,
            "total_users": total_users,
            "phishing_detected": phishing_detected,
            "malicious_urls": malicious_urls,
            "malicious_files": malicious_files
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "total_scans": 0,
            "threats_detected": 0,
            "total_email_scans": 0,
            "total_url_scans": 0,
            "total_file_scans": 0,
            "total_users": 0
        }), 200


# ---------------------------------
# Run App
# ---------------------------------
if __name__ == "__main__":
    app.run(debug=False, port=5000)
