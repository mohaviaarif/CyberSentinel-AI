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
        return jsonify(result), 200

    except Exception as e:
        current_app.logger.error(f"URL scan error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Something went wrong. Please try again."
        }), 500