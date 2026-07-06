import smtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("cybersentinel")

SMTP_EMAIL    = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_HOST     = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))


def send_threat_alert(
    to_email: str,
    threat_type: str,
    threat_summary: str,
    confidence: float,
    threats: list = None
) -> bool:
    """
    Sends a threat alert email to the user.

    Args:
        to_email: User's email address
        threat_type: "Phishing Email", "Malicious URL",
                     or "Malware File"
        threat_summary: Short description of what was found
        confidence: Confidence score (0.0 to 1.0)
        threats: List of threat indicator strings

    Returns:
        True if sent successfully, False otherwise
    """
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        logger.warning(
            "Email notifications not configured. "
            "Set SMTP_EMAIL and SMTP_PASSWORD in .env"
        )
        return False

    if not to_email or to_email == "anonymous":
        logger.info(
            "Skipping notification - no user email"
        )
        return False

    try:
        confidence_pct = round(confidence * 100)
        threats_html = ""
        if threats:
            items = "".join(
                f"<li>{t}</li>" for t in threats[:5]
            )
            threats_html = f"""
            <div style="margin-top:16px;">
              <strong>Threat Indicators:</strong>
              <ul style="margin-top:8px;
                         padding-left:20px;
                         color:#555;">
                {items}
              </ul>
            </div>
            """

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="margin:0; padding:0;
                     font-family:Arial,sans-serif;
                     background:#f5f5f5;">
          <div style="max-width:600px; margin:40px auto;
                      background:#ffffff;
                      border-radius:12px;
                      overflow:hidden;
                      box-shadow:0 2px 8px rgba(0,0,0,0.1);">

            <!-- HEADER -->
            <div style="background:linear-gradient(
                          135deg,#1E3A5F,#2979FF);
                        padding:32px;
                        text-align:center;">
              <h1 style="color:#ffffff; margin:0;
                         font-size:24px;">
                🛡️ CyberSentinel AI
              </h1>
              <p style="color:rgba(255,255,255,0.8);
                        margin:8px 0 0 0;
                        font-size:14px;">
                Threat Alert Notification
              </p>
            </div>

            <!-- ALERT BADGE -->
            <div style="background:#FFF3F3;
                        border-left:4px solid #FF4C4C;
                        padding:20px 32px;
                        margin:0;">
              <h2 style="color:#FF4C4C; margin:0;
                         font-size:18px;">
                ⚠️ {threat_type} Detected
              </h2>
              <p style="color:#666; margin:8px 0 0 0;
                        font-size:14px;">
                Confidence: {confidence_pct}%
              </p>
            </div>

            <!-- BODY -->
            <div style="padding:32px;">
              <p style="color:#333; font-size:15px;
                        margin:0 0 16px 0;">
                Hello,
              </p>
              <p style="color:#333; font-size:15px;
                        line-height:1.6;
                        margin:0 0 16px 0;">
                CyberSentinel AI has detected a
                potential threat during your recent
                scan. Please review the details below.
              </p>

              <div style="background:#f8f9fa;
                          border-radius:8px;
                          padding:20px;
                          margin:16px 0;">
                <strong style="color:#333;">
                  Scan Summary:
                </strong>
                <p style="color:#555; margin:8px 0 0 0;
                          font-size:14px;
                          word-break:break-all;">
                  {threat_summary}
                </p>
              </div>

              {threats_html}

              <div style="margin-top:24px;
                          padding:16px;
                          background:#FFF8E1;
                          border-radius:8px;
                          border-left:4px solid #FFC947;">
                <strong style="color:#E65100;">
                  Recommended Action:
                </strong>
                <p style="color:#555; margin:8px 0 0 0;
                          font-size:14px;">
                  Do not click any links or open
                  attachments from this source.
                  Verify the sender through official
                  channels before taking any action.
                </p>
              </div>
            </div>

            <!-- FOOTER -->
            <div style="background:#f8f9fa;
                        padding:20px 32px;
                        text-align:center;
                        border-top:1px solid #eee;">
              <p style="color:#999; font-size:12px;
                        margin:0;">
                This alert was sent by CyberSentinel AI
                &nbsp;|&nbsp;
                COMSATS University Islamabad,
                Abbottabad Campus
              </p>
              <p style="color:#999; font-size:11px;
                        margin:8px 0 0 0;">
                You received this because you are
                registered on CyberSentinel AI.
              </p>
            </div>

          </div>
        </body>
        </html>
        """

        msg = MIMEMultipart("alternative")
        msg["Subject"] = (
            f"🚨 CyberSentinel AI Alert: "
            f"{threat_type} Detected ({confidence_pct}% confidence)"
        )
        msg["From"]    = SMTP_EMAIL
        msg["To"]      = to_email

        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(
                SMTP_EMAIL, to_email, msg.as_string()
            )

        logger.info(
            f"Threat alert sent to {to_email} | "
            f"type={threat_type} | "
            f"confidence={confidence_pct}%"
        )
        return True

    except smtplib.SMTPAuthenticationError:
        logger.error(
            "SMTP authentication failed. "
            "Check SMTP_EMAIL and SMTP_PASSWORD in .env. "
            "For Gmail, use an App Password not your "
            "regular password."
        )
        return False

    except smtplib.SMTPException as e:
        logger.error(f"SMTP error: {str(e)}")
        return False

    except Exception as e:
        logger.error(
            f"Email notification failed: {str(e)}"
        )
        return False


def send_welcome_email(to_email: str) -> bool:
    """
    Sends a welcome email when a new user registers.
    """
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        return False

    if not to_email:
        return False

    try:
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial,sans-serif;
                     background:#f5f5f5;
                     margin:0; padding:0;">
          <div style="max-width:600px; margin:40px auto;
                      background:#fff;
                      border-radius:12px;
                      overflow:hidden;
                      box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <div style="background:linear-gradient(
                          135deg,#1E3A5F,#2979FF);
                        padding:32px;
                        text-align:center;">
              <h1 style="color:#fff; margin:0;">
                🛡️ Welcome to CyberSentinel AI
              </h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#333; font-size:15px;">
                Hello,
              </p>
              <p style="color:#333; font-size:15px;
                        line-height:1.6;">
                Your account has been successfully
                created. You now have access to
                CyberSentinel AI's three protection
                modules:
              </p>
              <ul style="color:#555; font-size:14px;
                         line-height:2;">
                <li>📧 Phishing Email Detection</li>
                <li>🔗 Malicious URL Analysis</li>
                <li>🦠 Malware File Scanning</li>
              </ul>
              <p style="color:#333; font-size:14px;
                        margin-top:16px;">
                Stay safe online with AI-powered
                threat detection.
              </p>
            </div>
            <div style="background:#f8f9fa;
                        padding:16px 32px;
                        text-align:center;
                        border-top:1px solid #eee;">
              <p style="color:#999; font-size:12px;
                        margin:0;">
                CyberSentinel AI | COMSATS University
                Islamabad, Abbottabad Campus | 2026
              </p>
            </div>
          </div>
        </body>
        </html>
        """

        msg = MIMEMultipart("alternative")
        msg["Subject"] = (
            "Welcome to CyberSentinel AI 🛡️"
        )
        msg["From"] = SMTP_EMAIL
        msg["To"]   = to_email

        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(
                SMTP_EMAIL, to_email, msg.as_string()
            )

        logger.info(f"Welcome email sent to {to_email}")
        return True

    except Exception as e:
        logger.error(
            f"Welcome email failed: {str(e)}"
        )
        return False
