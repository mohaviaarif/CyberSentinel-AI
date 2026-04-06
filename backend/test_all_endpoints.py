"""
CyberSentinel AI -- Full Backend Integration Test
Run this script to verify all 5 endpoints are working.
All tests must show PASS before moving to frontend development.
"""

import os
import sys
import requests
import tempfile

BASE_URL = "http://127.0.0.1:5000"
PASS = "PASS"
FAIL = "FAIL"

results = []


def test(name, passed, detail=""):
    status = PASS if passed else FAIL
    results.append((name, status, detail))
    symbol = "[OK]" if passed else "[!!]"
    print(f"  {symbol} {name}: {status}")
    if detail and not passed:
        print(f"       Detail: {detail}")


def run_all_tests():
    print("=" * 60)
    print("CYBERSENTINEL AI -- BACKEND INTEGRATION TESTS")
    print("=" * 60)

    # ─── TEST 1: Health Check ──────────────────────────
    print("\nTEST 1: Health Check (GET /)")
    try:
        r = requests.get(f"{BASE_URL}/", timeout=5)
        test("Returns 200", r.status_code == 200)
        test("Has message field", "message" in r.json())
    except Exception as e:
        test("Server reachable", False, str(e))

    # ─── TEST 2: Phishing Detection ───────────────────
    print("\nTEST 2: Phishing Detection (POST /predict)")

    # Test 2a: Phishing email detected
    try:
        payload = {
            "text": "Dear JazzCash customer your account has been suspended. "
                    "Verify immediately at http://jazzcash-pk-verify.net/login "
                    "or your account will be deleted. Enter your CNIC and PIN."
        }
        r = requests.post(f"{BASE_URL}/predict", json=payload, timeout=10)
        data = r.json()
        test("Returns 200", r.status_code == 200, f"Got {r.status_code}")
        test("Has prediction field", "prediction" in data, str(data))
        test("Has confidence field", "confidence" in data)
        test("Detects phishing correctly",
             data.get("prediction", "").lower() in ["spam", "phishing"],
             f"Got: {data.get('prediction')}")
    except Exception as e:
        test("Phishing detection request", False, str(e))

    # Test 2b: Safe email
    try:
        payload = {"text": "Hi team the meeting is on Tuesday at 2pm. Regards."}
        r = requests.post(f"{BASE_URL}/predict", json=payload, timeout=10)
        data = r.json()
        test("Safe email returns 200", r.status_code == 200)
        test("Safe email has prediction",
             data.get("prediction", "").lower() in ["ham", "safe"],
             f"Got: {data.get('prediction')}")
    except Exception as e:
        test("Safe email request", False, str(e))

    # Test 2c: Empty text
    try:
        r = requests.post(f"{BASE_URL}/predict", json={"text": ""}, timeout=5)
        test("Empty text returns 400", r.status_code == 400,
             f"Got {r.status_code}")
    except Exception as e:
        test("Empty text validation", False, str(e))

    # ─── TEST 3: URL Scanner ──────────────────────────
    print("\nTEST 3: URL Analyzer (POST /api/url-scan)")

    # Test 3a: Malicious URL
    try:
        payload = {"url": "http://paypal-verify-login-account.com/update/confirm"}
        r = requests.post(f"{BASE_URL}/api/url-scan", json=payload, timeout=15)
        data = r.json()
        test("Returns 200", r.status_code == 200, f"Got {r.status_code}")
        test("Has result field", "result" in data, str(data))
        test("Has confidence field", "confidence" in data)
        test("Has threat_indicators field", "threat_indicators" in data)
        test("Detects malicious URL",
             data.get("result", "").lower() in ["malicious", "suspicious"],
             f"Got: {data.get('result')}")
    except Exception as e:
        test("Malicious URL scan", False, str(e))

    # Test 3b: Safe URL
    try:
        payload = {"url": "https://www.google.com"}
        r = requests.post(f"{BASE_URL}/api/url-scan", json=payload, timeout=15)
        data = r.json()
        test("Safe URL returns 200", r.status_code == 200)
        test("Safe URL classified correctly",
             data.get("result", "").lower() == "safe",
             f"Got: {data.get('result')}")
    except Exception as e:
        test("Safe URL scan", False, str(e))

    # Test 3c: Empty URL
    try:
        r = requests.post(
            f"{BASE_URL}/api/url-scan", json={"url": ""}, timeout=5)
        test("Empty URL returns 400", r.status_code == 400,
             f"Got {r.status_code}")
    except Exception as e:
        test("Empty URL validation", False, str(e))

    # ─── TEST 4: File Malware Scanner ────────────────
    print("\nTEST 4: Malware File Scanner (POST /api/file-scan)")

    # Create a temp test file
    test_file_path = None
    try:
        with tempfile.NamedTemporaryFile(
                mode="w", suffix=".txt", delete=False) as f:
            f.write("This is a safe test file for CyberSentinel AI integration test.")
            test_file_path = f.name

        with open(test_file_path, "rb") as f:
            files = {"file": ("integration_test.txt", f, "text/plain")}
            r = requests.post(
                f"{BASE_URL}/api/file-scan", files=files, timeout=30)

        data = r.json()
        test("Returns 200", r.status_code == 200, f"Got {r.status_code}")
        test("Has verdict field", "verdict" in data, str(data))
        test("Has sha256_hash field", "sha256_hash" in data)
        test("Has file_deleted field", "file_deleted" in data)
        test("File deleted confirmed", data.get("file_deleted") is True,
             f"file_deleted = {data.get('file_deleted')}")
        test("SHA-256 is 64 chars",
             len(data.get("sha256_hash", "")) == 64,
             f"Hash length: {len(data.get('sha256_hash', ''))}")

    except Exception as e:
        test("File scan request", False, str(e))
    finally:
        # Cleanup test file if still exists
        if test_file_path and os.path.exists(test_file_path):
            os.remove(test_file_path)

    # Test 4b: No file sent
    try:
        r = requests.post(f"{BASE_URL}/api/file-scan", timeout=5)
        test("No file returns 400", r.status_code == 400,
             f"Got {r.status_code}")
    except Exception as e:
        test("No file validation", False, str(e))

    # Test 4c: Wrong file type
    try:
        fake_mp3 = b"fake audio content"
        files = {"file": ("test.mp3", fake_mp3, "audio/mpeg")}
        r = requests.post(
            f"{BASE_URL}/api/file-scan", files=files, timeout=5)
        test("Wrong file type returns 415", r.status_code == 415,
             f"Got {r.status_code}")
    except Exception as e:
        test("Wrong file type validation", False, str(e))

    # ─── TEST 5: Email File Upload ────────────────────
    print("\nTEST 5: Email File Upload (POST /api/phish-file)")

    # Test 5a: Phishing email file
    try:
        phishing_text = (
            "Dear JazzCash customer your account has been suspended. "
            "Verify at http://jazzcash-pk-verify.net/login immediately. "
            "Enter your CNIC and PIN or account will be deleted."
        )
        files = {
            "file": ("phishing_email.txt",
                     phishing_text.encode("utf-8"), "text/plain")
        }
        r = requests.post(
            f"{BASE_URL}/api/phish-file", files=files, timeout=10)
        data = r.json()
        test("Returns 200", r.status_code == 200, f"Got {r.status_code}")
        test("Has prediction field", "prediction" in data, str(data))
        test("Has source field", data.get("source") == "file_upload")
        test("Detects phishing in file",
             data.get("prediction", "").lower() in ["spam", "phishing"],
             f"Got: {data.get('prediction')}")
    except Exception as e:
        test("Phishing email file scan", False, str(e))

    # Test 5b: Safe email file
    try:
        safe_text = "Hi team meeting is Tuesday 2pm room 204. Regards Sir Mazhar."
        files = {
            "file": ("safe_email.txt",
                     safe_text.encode("utf-8"), "text/plain")
        }
        r = requests.post(
            f"{BASE_URL}/api/phish-file", files=files, timeout=10)
        data = r.json()
        test("Safe email file returns 200", r.status_code == 200)
        test("Safe email file classified correctly",
             data.get("prediction", "").lower() in ["ham", "safe"],
             f"Got: {data.get('prediction')}")
    except Exception as e:
        test("Safe email file scan", False, str(e))

    # Test 5c: Wrong extension
    try:
        files = {"file": ("document.pdf", b"fake pdf", "application/pdf")}
        r = requests.post(
            f"{BASE_URL}/api/phish-file", files=files, timeout=5)
        test("Wrong extension returns 415", r.status_code == 415,
             f"Got {r.status_code}")
    except Exception as e:
        test("Wrong extension validation", False, str(e))

    # Test 5d: Empty file
    try:
        files = {"file": ("empty.txt", b"", "text/plain")}
        r = requests.post(
            f"{BASE_URL}/api/phish-file", files=files, timeout=5)
        test("Empty file returns 400", r.status_code == 400,
             f"Got {r.status_code}")
    except Exception as e:
        test("Empty file validation", False, str(e))

    # ─── AUTH TESTS ───────────────────────────────────
    print("\nTEST 6: Authentication (POST /auth/signup and /auth/login)")

    test_email = "integration_test_9999@cybersentinel.test"

    # Test 6a: Signup
    try:
        payload = {"email": test_email, "password": "TestPass123"}
        r = requests.post(f"{BASE_URL}/auth/signup", json=payload, timeout=5)
        data = r.json()
        signed_up = r.status_code == 200 and data.get("success") is True
        # Also accept 400 if user already exists from previous test run
        if r.status_code == 400 and "already exists" in data.get("error", ""):
            signed_up = True
        test("Signup works", signed_up,
             f"Status: {r.status_code}, Response: {data}")
    except Exception as e:
        test("Signup request", False, str(e))

    # Test 6b: Login with correct password
    try:
        payload = {"email": test_email, "password": "TestPass123"}
        r = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=5)
        data = r.json()
        test("Login with correct password", r.status_code == 200,
             f"Response: {data}")
        test("Login returns token", "token" in data, str(data))
    except Exception as e:
        test("Login request", False, str(e))

    # Test 6c: Login with wrong password
    try:
        payload = {"email": test_email, "password": "WrongPassword"}
        r = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=5)
        test("Wrong password returns 401", r.status_code == 401,
             f"Got {r.status_code}")
    except Exception as e:
        test("Wrong password validation", False, str(e))

    # ─── FINAL SUMMARY ────────────────────────────────
    print("\n" + "=" * 60)
    print("FINAL RESULTS")
    print("=" * 60)

    total = len(results)
    passed = sum(1 for _, s, _ in results if s == PASS)
    failed = total - passed

    for name, status, detail in results:
        symbol = "[OK]" if status == PASS else "[!!]"
        print(f"  {symbol} {name}")

    print(f"\nTotal: {total} tests")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")

    if failed == 0:
        print("\nALL TESTS PASSED -- Backend is ready for frontend development")
    else:
        print(f"\n{failed} TESTS FAILED -- Fix these before moving to frontend")
        print("Paste failing test output to Claude for immediate fix")

    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)