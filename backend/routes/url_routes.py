from flask import Blueprint, request, jsonify, current_app
from services.url_service import URLAnalyzer
from security.limiter import limiter

url_bp = Blueprint("url_bp", __name__)
analyzer = URLAnalyzer()


@url_bp.route("/api/url-scan", methods=["POST"])
@limiter.limit("10 per minute")
def scan_url():
    """
    POST /api/url-scan
    Body: {"url": "https://example.com"}
    Returns: threat assessment JSON
    """

    try:
        # ── Get request data ──────────────────────────
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "Request body must be JSON"
            }), 400

        url = data.get("url", "").strip()

        # ── Validate input ────────────────────────────
        if not url:
            return jsonify({
                "success": False,
                "error": "URL is required. Please enter a URL to scan."
            }), 400

        if len(url) > 2000:
            return jsonify({
                "success": False,
                "error": "URL is too long."
            }), 400

        # ── Log the request ───────────────────────────
        current_app.logger.info(f"URL scan requested: {url[:100]}")

        # ── Run analysis ──────────────────────────────
        result = analyzer.analyze(url)

        # ✅ FIX: correct logging (INSIDE try + flat structure)
        current_app.logger.info(
            f"URL scan complete: {result.get('result')} | "
            f"score={result.get('score')} | "
            f"confidence={result.get('confidence')}"
        )

        # ✅ FIX: directly return result (NO inner, NO remapping)
        try:
            from database import (
                get_connection, execute_query
            )
            user_email = request.headers.get(
                "X-User-Email", "anonymous"
            )
            conn, db_type = get_connection()
            try:
                execute_query(
                    conn, db_type,
                    """INSERT INTO url_scans
                       (user_email, url_scanned,
                        result, score, confidence)
                       VALUES (?, ?, ?, ?, ?)""",
                    (
                        user_email,
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
            current_app.logger.error(
                f"Failed to save URL scan: {db_err}"
            )

        # Send threat alert if malicious URL detected
        try:
            scan_result_val = result.get("result", "")
            scan_confidence = result.get("confidence", 0.0)
            if (scan_result_val == "malicious"
                    and scan_confidence > 0.6):
                from services.notification_service \
                    import send_threat_alert
                send_threat_alert(
                    to_email=user_email,
                    threat_type="Malicious URL",
                    threat_summary=url,
                    confidence=scan_confidence,
                    threats=result.get(
                        "threat_indicators", []
                    )[:3]
                )
        except Exception as notif_err:
            current_app.logger.error(
                f"URL notification failed: {notif_err}"
            )

        return jsonify(result), 200

    except Exception as e:
        current_app.logger.error(f"URL scan error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Something went wrong. Please try again."
        }), 500
