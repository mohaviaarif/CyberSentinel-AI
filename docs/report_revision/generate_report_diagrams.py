from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Ellipse, FancyArrowPatch, FancyBboxPatch


OUT = Path(__file__).with_name("diagram_assets")
OUT.mkdir(parents=True, exist_ok=True)

BLUE = "#1f5fae"
LIGHT = "#eaf2fb"
DARK = "#17324d"
GRAY = "#5f6b76"
GREEN = "#dff4e8"
ORANGE = "#fff1d6"


def canvas(width, height):
    fig, ax = plt.subplots(figsize=(width / 180, height / 180), dpi=180)
    ax.set_xlim(0, width)
    ax.set_ylim(height, 0)
    ax.axis("off")
    return fig, ax


def box(ax, x, y, w, h, text, fc=LIGHT, ec=BLUE, size=13, radius=12, weight="normal"):
    patch = FancyBboxPatch(
        (x, y), w, h,
        boxstyle=f"round,pad=0.012,rounding_size={radius}",
        facecolor=fc, edgecolor=ec, linewidth=1.8,
    )
    ax.add_patch(patch)
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center",
            fontsize=size, color=DARK, weight=weight, wrap=True)
    return patch


def arrow(ax, x1, y1, x2, y2, text=None, size=10, color=GRAY, style="-|>"):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style,
                                 mutation_scale=13, linewidth=1.4, color=color))
    if text:
        ax.text((x1 + x2) / 2, (y1 + y2) / 2 - 8, text,
                ha="center", va="bottom", fontsize=size, color=DARK,
                bbox=dict(facecolor="white", edgecolor="none", pad=1.5))


def actor(ax, x, y, label):
    ax.add_patch(Circle((x, y), 18, fill=False, edgecolor=DARK, linewidth=2))
    ax.plot([x, x], [y + 18, y + 70], color=DARK, linewidth=2)
    ax.plot([x - 30, x + 30], [y + 38, y + 38], color=DARK, linewidth=2)
    ax.plot([x, x - 28], [y + 70, y + 110], color=DARK, linewidth=2)
    ax.plot([x, x + 28], [y + 70, y + 110], color=DARK, linewidth=2)
    ax.text(x, y + 138, label, ha="center", fontsize=15, weight="bold", color=DARK)


def save(fig, name):
    fig.savefig(OUT / name, bbox_inches=None, pad_inches=0, facecolor="white")
    plt.close(fig)


def use_case():
    fig, ax = canvas(1432, 955)
    ax.text(716, 42, "CyberSentinel AI - Implemented Use Cases",
            ha="center", fontsize=18, weight="bold", color=DARK)
    ax.add_patch(FancyBboxPatch((160, 78), 1112, 790,
                               boxstyle="round,pad=0.02,rounding_size=18",
                               facecolor="white", edgecolor=DARK, linewidth=2))
    actor(ax, 82, 370, "User")
    actor(ax, 1350, 370, "Administrator")

    user_cases = [
        "Register and log in",
        "Scan email text",
        "Upload TXT/EML/PDF/DOCX",
        "Analyze embedded URLs",
        "Scan a URL",
        "Scan a file with VirusTotal",
        "View latest scan history",
        "Download result as PDF",
        "Scan Gmail message",
        "Log out",
    ]
    ys = [112, 184, 256, 328, 400, 472, 544, 616, 688, 760]
    for text, y in zip(user_cases, ys):
        ax.add_patch(Ellipse((485, y + 28), 410, 52, facecolor=LIGHT,
                             edgecolor=BLUE, linewidth=1.5))
        ax.text(485, y + 28, text, ha="center", va="center", fontsize=10.5, color=DARK)
        arrow(ax, 112, 425, 278, y + 28, color="#7d8b99")

    admin_cases = ["View system statistics", "View registered users", "View recent scans"]
    for text, y in zip(admin_cases, [260, 390, 520]):
        ax.add_patch(Ellipse((965, y), 390, 58, facecolor=GREEN,
                             edgecolor="#2c8b57", linewidth=1.5))
        ax.text(965, y, text, ha="center", va="center", fontsize=10.5, color=DARK)
        arrow(ax, 1318, 425, 1162, y, color="#7d8b99")

    ax.text(965, 650,
            "Prototype admin check:\nconfigured email list +\nX-User-Email header",
            ha="center", va="center", fontsize=8.2, color=GRAY,
            bbox=dict(boxstyle="round,pad=0.5", facecolor=ORANGE, edgecolor="#d49a2a"))
    save(fig, "image3.png")


def architecture():
    fig, ax = canvas(1438, 466)
    ax.text(719, 28, "CyberSentinel AI - Implemented System Architecture",
            ha="center", fontsize=15, weight="bold", color=DARK)
    cols = [
        (24, 72, 230, 330, "CLIENTS", ["React web app", "Gmail extension"]),
        (300, 72, 250, 330, "FLASK API", ["Authentication", "Scan routes", "Validation + limits", "JSON responses"]),
        (596, 72, 270, 330, "SERVICES", ["Phishing ML", "Rule-based URL scan", "Malware scan", "Email alerts"]),
        (912, 72, 230, 330, "DATA", ["PostgreSQL: live", "SQLite: local", "Model files"]),
        (1188, 72, 226, 330, "EXTERNAL", ["VirusTotal", "AbuseIPDB", "SMTP"]),
    ]
    for x, y, w, h, title, items in cols:
        ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=12",
                                   facecolor="white", edgecolor=BLUE, linewidth=1.8))
        ax.add_patch(FancyBboxPatch((x, y), w, 48, boxstyle="round,pad=0.02,rounding_size=12",
                                   facecolor=BLUE, edgecolor=BLUE, linewidth=1.8))
        ax.text(x + w / 2, y + 29, title, ha="center", va="center",
                fontsize=10, weight="bold", color="white")
        for i, item in enumerate(items):
            yy = y + 70 + i * 58
            box(ax, x + 15, yy, w - 30, 42, item, fc=LIGHT, ec="#8aaed5", size=8.2, radius=7)
    for a, b in [(254, 300), (550, 596), (866, 912), (866, 1188)]:
        arrow(ax, a + 5, 238, b - 5, 238, color=BLUE)
    ax.text(430, 430, "HTTPS/JSON", ha="center", fontsize=7.5, color=GRAY)
    ax.text(1040, 430, "Persistent records", ha="center", fontsize=7.5, color=GRAY)
    ax.text(1298, 430, "Threat intelligence", ha="center", fontsize=7.5, color=GRAY)
    save(fig, "image4.png")


def table_entity(ax, x, y, w, title, rows, color=BLUE):
    rh = 38
    h = 48 + len(rows) * rh
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.01,rounding_size=8",
                               facecolor="white", edgecolor=color, linewidth=1.8))
    ax.add_patch(FancyBboxPatch((x, y), w, 48, boxstyle="round,pad=0.01,rounding_size=8",
                               facecolor=color, edgecolor=color, linewidth=1.8))
    ax.text(x + w / 2, y + 29, title, ha="center", va="center",
            color="white", fontsize=11, weight="bold")
    for i, row in enumerate(rows):
        yy = y + 48 + i * rh
        ax.plot([x, x + w], [yy, yy], color="#cad5df", linewidth=0.8)
        ax.text(x + 14, yy + 24, row, va="center", fontsize=8.7, color=DARK)
    return h


def erd():
    fig, ax = canvas(1432, 955)
    ax.text(716, 42, "CyberSentinel AI - Database Entity Relationship Diagram",
            ha="center", fontsize=17, weight="bold", color=DARK)
    table_entity(ax, 495, 100, 440, "users", [
        "PK  id", "UQ  email", "password_hash", "created_at"
    ])
    table_entity(ax, 55, 500, 390, "email_scans", [
        "PK  scan_id", "user_email (logical link)", "input_summary", "prediction",
        "confidence", "threats", "links_found", "scanned_at"
    ], "#4b72b8")
    table_entity(ax, 520, 500, 390, "url_scans", [
        "PK  scan_id", "user_email (logical link)", "url_scanned", "result",
        "score", "confidence", "scanned_at"
    ], "#2f8a73")
    table_entity(ax, 985, 500, 390, "file_scans", [
        "PK  scan_id", "user_email (logical link)", "filename", "sha256_hash",
        "verdict", "malicious_count", "total_engines", "file_deleted", "scanned_at"
    ], "#8b5aa8")
    arrow(ax, 595, 300, 250, 485, "1 : many", color="#4b72b8")
    arrow(ax, 715, 300, 715, 485, "1 : many", color="#2f8a73")
    arrow(ax, 835, 300, 1180, 485, "1 : many", color="#8b5aa8")
    ax.text(716, 935,
            "The current schema stores user_email values but does not enforce database foreign-key constraints.",
            ha="center", fontsize=7.8, color=GRAY,
            bbox=dict(boxstyle="round,pad=0.45", facecolor=ORANGE, edgecolor="#d49a2a"))
    save(fig, "image5.png")


def process_flow():
    fig, ax = canvas(1024, 1536)
    ax.text(512, 45, "CyberSentinel AI - Implemented Process Flow",
            ha="center", fontsize=15, weight="bold", color=DARK)
    box(ax, 340, 85, 344, 60, "Open application", fc=GREEN, ec="#2c8b57", size=15, weight="bold")
    arrow(ax, 512, 145, 512, 185, color=BLUE)
    box(ax, 340, 185, 344, 60, "Register or log in", size=15)
    arrow(ax, 512, 245, 512, 285, color=BLUE)
    box(ax, 340, 285, 344, 60, "Select a scan module", size=15, weight="bold")

    branches = [
        (65, "EMAIL / DOCUMENT", ["Validate input", "Extract text", "Sanitize text", "Word + char TF-IDF", "Logistic Regression", "Analyze up to 5 URLs"]),
        (365, "URL", ["Normalize URL", "Extract 10 rules", "Resolve domain/IP", "Check AbuseIPDB", "Calculate score", "Return risk level"]),
        (665, "FILE", ["Validate file", "Create temp file", "Compute SHA-256", "VirusTotal lookup", "Upload if unknown", "Delete temp file"]),
    ]
    for x, title, steps in branches:
        arrow(ax, 512, 345, x + 145, 410, color=BLUE)
        box(ax, x, 410, 290, 55, title, fc=BLUE, ec=BLUE, size=10.5, weight="bold")
        for i, step in enumerate(steps):
            yy = 490 + i * 82
            box(ax, x, yy, 290, 52, step, fc="white", ec="#8aaed5", size=8.8, radius=7)
            if i:
                arrow(ax, x + 145, yy - 30, x + 145, yy - 2, color="#7d8b99")
        arrow(ax, x + 145, 490 + len(steps) * 82 - 30, 512, 1050, color=BLUE)

    box(ax, 300, 1050, 424, 62, "Save scan summary to database", fc=GREEN, ec="#2c8b57", size=10.5)
    arrow(ax, 512, 1112, 512, 1152, color=BLUE)
    box(ax, 250, 1152, 524, 62, "Display verdict, confidence, indicators and tips", size=10.5)
    arrow(ax, 512, 1214, 512, 1254, color=BLUE)
    box(ax, 270, 1254, 484, 62, "Optional: download client-generated PDF", fc=ORANGE, ec="#d49a2a", size=10.5)
    arrow(ax, 512, 1316, 512, 1356, color=BLUE)
    box(ax, 270, 1356, 484, 62, "View latest history or start another scan", fc=GREEN, ec="#2c8b57", size=10.5)
    save(fig, "image6.png")


def modules():
    fig, ax = canvas(1823, 1357)
    ax.text(912, 48, "CyberSentinel AI - Class and Module Diagram",
            ha="center", fontsize=19, weight="bold", color=DARK)
    nodes = {
        "Flask application": (650, 115, 520, 155, ["register_blueprint()", "authentication routes", "history/stats/admin routes"]),
        "Prediction service (module)": (90, 410, 470, 220, ["load_model()", "predict_email(raw_text)", "word + character TF-IDF", "LogisticRegression"]),
        "URLAnalyzer (class)": (676, 410, 470, 220, ["analyze(url)", "_resolve_domain()", "_check_abuseipdb()", "_generate_tips()"]),
        "MalwareScanner (class)": (1260, 410, 470, 220, ["scan(file_path)", "_compute_hash()", "_query_virustotal()", "_upload_unknown_file()"]),
        "Database utilities (module)": (90, 850, 470, 200, ["get_connection()", "execute_query()", "fetchone/fetchall_as_dict()", "init_db()"]),
        "Notification service (module)": (676, 850, 470, 200, ["send_welcome_email()", "send_threat_alert()", "SMTP configuration"]),
        "URL inspector (module)": (1260, 850, 470, 200, ["extract_urls()", "analyze_single_url()", "analyze_urls()", "maximum 5 embedded URLs"]),
    }
    for title, (x, y, w, h, items) in nodes.items():
        ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=12",
                                   facecolor="white", edgecolor=BLUE, linewidth=2))
        ax.add_patch(FancyBboxPatch((x, y), w, 55, boxstyle="round,pad=0.02,rounding_size=12",
                                   facecolor=BLUE, edgecolor=BLUE, linewidth=2))
        ax.text(x + w / 2, y + 32, title, ha="center", va="center",
                color="white", fontsize=10.5, weight="bold")
        for i, item in enumerate(items):
            ax.text(x + 25, y + 88 + i * 30, "• " + item, fontsize=8.8, color=DARK)

    arrow(ax, 780, 270, 325, 400, "routes /predict and /api/phish-file", color=BLUE)
    arrow(ax, 910, 270, 910, 400, "route /api/url-scan", color=BLUE)
    arrow(ax, 1040, 270, 1495, 400, "route /api/file-scan", color=BLUE)
    arrow(ax, 725, 270, 325, 840, color="#7d8b99")
    arrow(ax, 970, 270, 910, 840, color="#7d8b99")
    arrow(ax, 325, 630, 1495, 840, color="#7d8b99")
    ax.text(912, 750,
            "Routes use shared database utilities; alerts are optional; email scans use the URL inspector.",
            ha="center", fontsize=9.5, color=GRAY,
            bbox=dict(facecolor="white", edgecolor="none", pad=2))
    ax.text(912, 1190,
            "The implementation is organized around Flask blueprints, service classes, and utility modules;\n"
            "it does not define separate User, Admin, ScanSession, or Report classes.",
            ha="center", fontsize=10.5, color=GRAY,
            bbox=dict(boxstyle="round,pad=0.55", facecolor=ORANGE, edgecolor="#d49a2a"))
    save(fig, "image7.png")


def sequence():
    fig, ax = canvas(1432, 955)
    ax.text(716, 36, "CyberSentinel AI - Scan Sequence Diagram",
            ha="center", fontsize=17, weight="bold", color=DARK)
    actors = [
        (85, "User"), (280, "React /\nExtension"), (500, "Flask API"),
        (725, "Detection\nService"), (955, "External API"), (1190, "Database")
    ]
    for x, label in actors:
        box(ax, x - 70, 72, 140, 58, label, fc=LIGHT, ec=BLUE, size=8.5, radius=8, weight="bold")
        ax.plot([x, x], [130, 875], linestyle="--", color="#9aa7b3", linewidth=1.2)

    def msg(y, a, b, text, dashed=False):
        x1=actors[a][0];x2=actors[b][0]
        arrow(ax, x1, y, x2, y, text, size=7.4, color=BLUE if not dashed else GRAY,
              style="-|>" if not dashed else "->")

    msg(175,0,1,"Choose scan and submit input")
    msg(225,1,2,"POST JSON or multipart request")
    msg(275,2,3,"Validate and invoke service")
    ax.text(500, 325, "alt", fontsize=11, weight="bold", color=DARK,
            bbox=dict(facecolor="white", edgecolor=DARK, pad=2))
    ax.add_patch(FancyBboxPatch((470, 310), 630, 290, boxstyle="round,pad=0.01,rounding_size=6",
                               facecolor="#fbfdff", edgecolor="#7d8b99", linewidth=1.1))
    msg(360,3,3,"Email: preprocess + TF-IDF + model")
    msg(410,3,4,"URL: AbuseIPDB reputation check")
    msg(460,4,3,"Reputation response",dashed=True)
    msg(510,3,4,"File: VirusTotal lookup / upload")
    msg(560,4,3,"Analysis response",dashed=True)
    msg(650,3,2,"Verdict, confidence, indicators",dashed=True)
    msg(700,2,5,"Insert scan summary")
    msg(750,5,2,"Commit successful",dashed=True)
    msg(800,2,1,"JSON response",dashed=True)
    msg(850,1,0,"Display result / download PDF",dashed=True)
    ax.text(716, 910,
            "Threat notifications are attempted only for configured high-risk results; failures are logged without failing the scan.",
            ha="center", fontsize=8.2, color=GRAY)
    save(fig, "image8.png")


if __name__ == "__main__":
    use_case()
    architecture()
    erd()
    process_flow()
    modules()
    sequence()
    print(f"Generated diagrams in {OUT}")
