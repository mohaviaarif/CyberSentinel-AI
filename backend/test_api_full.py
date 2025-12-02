import requests

url = "http://127.0.0.1:5000/predict"

# Test cases
test_emails = {
    "normal_email": "Hello team, please check the report attached.",
    "phishing_email": "URGENT! Your account will be closed. Click here now!",
    "empty_email": "",
    "missing_field": None,
    "weird_characters": "Hello <script>alert('hack')</script> visit site.com",
    "spam_caps": "FREE MONEY!!! Visit http://scamlink.com NOW!!!"
}

print("\n===== CYBERSENTINEL-AI API TESTS =====\n")

for name, email in test_emails.items():
    print(f"--- Test: {name} ---")
    
    if name == "missing_field":
        payload = {}  # simulate missing "email" key
    else:
        payload = {"email": email}
    
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print(response.json())
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print("Request failed:", e)
    
    print("\n")
