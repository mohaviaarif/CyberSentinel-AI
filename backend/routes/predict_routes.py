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

    # ✅ FIXED INPUT FIELD
    if "text" not in data:
        current_app.logger.warning("Request failed: missing 'text'")
        return jsonify({"success": False, "error": "'text' field is missing."}), 400

    text = data["text"]

    if not isinstance(text, str):
        current_app.logger.warning("Request failed: 'text' is not string")
        return jsonify({"success": False, "error": "Email text must be a string."}), 400

    if not text.strip():
        current_app.logger.warning("Request failed: 'text' is empty")
        return jsonify({"success": False, "error": "Email text cannot be empty."}), 400

    if len(text) > 5000:
        current_app.logger.warning("Request failed: 'text' too long")
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
        embedded_links = result.get("embedded_links", [])

        current_app.logger.info(
            f"Prediction complete -> label={label}, confidence={confidence}"
        )

        # ✅ FIXED RESPONSE FORMAT (MATCHES TEST SCRIPT)
        try:
            from database import (
                get_connection, execute_query
            )
            user_email = request.headers.get(
                "X-User-Email", "anonymous"
            )
            input_summary = (
                text[:100] + "..."
                if len(text) > 100
                else text
            )
            conn, db_type = get_connection()
            try:
                execute_query(
                    conn, db_type,
                    """INSERT INTO email_scans
                       (user_email, input_summary,
                        prediction, confidence,
                        threats, links_found)
                       VALUES (?, ?, ?, ?, ?, ?)""",
                    (
                        user_email,
                        input_summary,
                        label,
                        confidence,
                        str(threats),
                        len(embedded_links)
                    )
                )
                conn.commit()
            finally:
                conn.close()
        except Exception as db_err:
            current_app.logger.error(
                f"Failed to save email scan: {db_err}"
            )

        # Send threat alert if phishing detected
        try:
            if label == "spam" and confidence > 0.7:
                from services.notification_service \
                    import send_threat_alert
                send_threat_alert(
                    to_email=user_email,
                    threat_type="Phishing Email",
                    threat_summary=(
                        text[:150] + "..."
                        if len(text) > 150
                        else text
                    ),
                    confidence=confidence,
                    threats=threats[:3]
                )
        except Exception as notif_err:
            current_app.logger.error(
                f"Notification failed: {notif_err}"
            )

        return jsonify({
            "prediction": label,
            "confidence": confidence,
            "threats": threats,
            "tips": tips,
            "embedded_links": embedded_links
        }), 200

    except Exception as e:
        current_app.logger.error(f"Prediction Service Failed: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Internal server error during prediction."
        }), 500


# ✅ KEEP THIS PART (NO CHANGES)
@predict_bp.route("/api/phish-file", methods=["POST"])
@limiter.limit("10 per minute")
def scan_email_file():

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

        try:
            from database import (
                get_connection, execute_query
            )
            user_email = request.headers.get(
                "X-User-Email", "anonymous"
            )
            input_summary = (
                f"[Email File] {filename}: " +
                email_text[:80] + "..."
            )
            conn, db_type = get_connection()
            try:
                execute_query(
                    conn, db_type,
                    """INSERT INTO email_scans
                       (user_email, input_summary,
                        prediction, confidence,
                        threats, links_found)
                       VALUES (?, ?, ?, ?, ?, ?)""",
                    (
                        user_email,
                        input_summary,
                        result["prediction"],
                        result["confidence"],
                        str(result.get("threats", [])),
                        len(result.get("embedded_links", []))
                    )
                )
                conn.commit()
            finally:
                conn.close()
        except Exception as db_err:
            current_app.logger.error(
                f"Failed to save email file scan: {db_err}"
            )

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
            "tips": result.get("tips", []),
            "embedded_links": result.get("embedded_links", [])
        }), 200

    except Exception as e:
        current_app.logger.error(f"Email file scan error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Analysis failed. Please try again."
        }), 500


@predict_bp.route("/api/scan-document", methods=["POST"])
@limiter.limit("10 per minute")
def scan_document():
    """
    Accepts PDF and Word documents.
    Extracts text from them and runs through
    the phishing detection pipeline.
    Supports: .pdf, .docx, .doc
    """
    try:
        if "file" not in request.files:
            return jsonify({
                "success": False,
                "error": "No file provided."
            }), 400

        uploaded_file = request.files["file"]

        if not uploaded_file.filename:
            return jsonify({
                "success": False,
                "error": "No file selected."
            }), 400

        filename = uploaded_file.filename
        file_ext = os.path.splitext(filename)[1].lower()

        allowed_extensions = [".pdf", ".docx", ".doc"]
        if file_ext not in allowed_extensions:
            return jsonify({
                "success": False,
                "error": (
                    "Only PDF and Word documents are "
                    "supported. Use .pdf or .docx files."
                )
            }), 415

        file_bytes = uploaded_file.read()

        if len(file_bytes) == 0:
            return jsonify({
                "success": False,
                "error": "The uploaded file is empty."
            }), 400

        if len(file_bytes) > 10 * 1024 * 1024:
            return jsonify({
                "success": False,
                "error": "File too large. Maximum 10MB."
            }), 413

        # Extract text based on file type
        extracted_text = ""
        extraction_method = ""

        if file_ext == ".pdf":
            try:
                import pypdf2 as PyPDF2
                import io
                pdf_reader = PyPDF2.PdfReader(
                    io.BytesIO(file_bytes)
                )
                pages_text = []
                for page in pdf_reader.pages:
                    text = page.extract_text()
                    if text:
                        pages_text.append(text)
                extracted_text = "\n".join(pages_text)
                extraction_method = "PDF"
            except ImportError:
                try:
                    import PyPDF2
                    import io
                    pdf_reader = PyPDF2.PdfReader(
                        io.BytesIO(file_bytes)
                    )
                    pages_text = []
                    for page in pdf_reader.pages:
                        text = page.extract_text()
                        if text:
                            pages_text.append(text)
                    extracted_text = "\n".join(pages_text)
                    extraction_method = "PDF"
                except Exception as pdf_err:
                    return jsonify({
                        "success": False,
                        "error": (
                            f"Could not read PDF: {str(pdf_err)}"
                        )
                    }), 500

        elif file_ext in [".docx", ".doc"]:
            try:
                import docx
                import io
                doc = docx.Document(io.BytesIO(file_bytes))
                paragraphs = [
                    paragraph.text for paragraph in doc.paragraphs
                    if paragraph.text.strip()
                ]
                extracted_text = "\n".join(paragraphs)
                extraction_method = "Word"
            except Exception as docx_err:
                return jsonify({
                    "success": False,
                    "error": (
                        f"Could not read Word document: "
                        f"{str(docx_err)}"
                    )
                }), 500

        extracted_text = extracted_text.strip()

        if not extracted_text or len(extracted_text) < 10:
            return jsonify({
                "success": False,
                "error": (
                    f"Could not extract readable text from "
                    f"this {extraction_method} file. "
                    f"The file may be image-based or empty."
                )
            }), 400

        current_app.logger.info(
            f"Document scan: {filename} | "
            f"type={extraction_method} | "
            f"chars={len(extracted_text)}"
        )

        # Run through existing phishing detection pipeline
        result = predict_email(extracted_text[:5000])

        user_email = request.headers.get(
            "X-User-Email", "anonymous"
        )

        # Save to database
        try:
            from database import (
                get_connection, execute_query
            )
            input_summary = (
                f"[{extraction_method}] {filename}: " +
                extracted_text[:80] + "..."
            )
            conn, db_type = get_connection()
            try:
                execute_query(
                    conn, db_type,
                    """INSERT INTO email_scans
                       (user_email, input_summary,
                        prediction, confidence,
                        threats, links_found)
                       VALUES (?, ?, ?, ?, ?, ?)""",
                    (
                        user_email,
                        input_summary,
                        result["prediction"],
                        result["confidence"],
                        str(result.get("threats", [])),
                        len(result.get("embedded_links", []))
                    )
                )
                conn.commit()
            finally:
                conn.close()
        except Exception as db_err:
            current_app.logger.error(
                f"DB save failed: {db_err}"
            )

        current_app.logger.info(
            f"Document scan complete: {filename} | "
            f"prediction={result['prediction']} | "
            f"confidence={result['confidence']}"
        )

        return jsonify({
            "success": True,
            "source": "document_upload",
            "filename": filename,
            "extraction_method": extraction_method,
            "extracted_chars": len(extracted_text),
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "threats": result.get("threats", []),
            "tips": result.get("tips", []),
            "embedded_links": result.get(
                "embedded_links", []
            )
        }), 200

    except Exception as e:
        current_app.logger.error(
            f"Document scan error: {str(e)}"
        )
        return jsonify({
            "success": False,
            "error": "Scan failed. Please try again."
        }), 500
