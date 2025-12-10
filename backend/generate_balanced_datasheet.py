import os
import random
import pandas as pd

from utils.cleaner import sanitize_input, clean_text

INPUT_PATH = "datasets/phishing_clean_balanced.csv"
BACKUP_PATH = "datasets/phishing_clean_balanced_backup.csv"
OUTPUT_PATH = "datasets/phishing_clean_balanced.csv"

NUM_NEW_SPAM = 500  # you can change this


def sanitize_row(text: str) -> str:
    return clean_text(sanitize_input(text))


# ---------- PHISHING TEMPLATES ----------

def gen_bank_scam():
    templates = [
        "Your bank account has been temporarily locked due to suspicious activity. Log in to verify your identity: https://secure-bank-verify.com",
        "We were unable to process your recent transaction. Please confirm your card details to avoid account suspension.",
        "Unusual debit alert: Your card was used for a purchase. If this wasn't you, verify immediately: https://card-security-check.com"
    ]
    return random.choice(templates)


def gen_hr_job_scam():
    templates = [
        "Congratulations! You have been shortlisted for a remote job with a salary of $5,000. Fill in your details and pay the processing fee to confirm.",
        "Your resume has been selected for an urgent overseas position. Complete the attached form and pay registration charges.",
    ]
    return random.choice(templates)


def gen_marketplace_scam():
    templates = [
        "OLX: Buyer has sent you the payment. Click here to receive funds in your account: http://olx-secure-payments.com",
        "Your Daraz order requires additional verification. Pay the remaining clearance fee to avoid cancellation: http://daraz-clearance-update.com"
    ]
    return random.choice(templates)


def gen_security_alert_scam():
    templates = [
        "Your two-factor authentication has been disabled. Re-enable security now: https://account-security-reset.com",
        "We detected a login from a new device. If this was not you, secure your account immediately: https://unusual-login-protect.com"
    ]
    return random.choice(templates)


def gen_govt_scam():
    templates = [
        "PTA: Your SIM card will be blocked in 24 hours. Re-verify ownership here: http://pta-sim-verify.com",
        "NADRA: Your biometric verification failed. Update details to avoid CNIC suspension: http://nadra-update-portal.com",
        "FBR: Your tax refund is ready. Confirm CNIC and bank details here: http://fbr-tax-refund-check.com"
    ]
    return random.choice(templates)


def gen_crypto_scam():
    templates = [
        "Limited time offer! Double your Bitcoin in 24 hours. Send BTC to the address below and watch your balance grow.",
        "Your Binance account will be disabled due to inactivity. Log in and confirm your wallet phrase to restore access."
    ]
    return random.choice(templates)


ALL_GENERATORS = [
    gen_bank_scam,
    gen_hr_job_scam,
    gen_marketplace_scam,
    gen_security_alert_scam,
    gen_govt_scam,
    gen_crypto_scam
]


def main():
    if not os.path.exists(INPUT_PATH):
        raise FileNotFoundError("Dataset not found.")

    df = pd.read_csv(INPUT_PATH)

    if not os.path.exists(BACKUP_PATH):
        df.to_csv(BACKUP_PATH, index=False, encoding="utf-8")
        print("Backup created at:", BACKUP_PATH)
    else:
        print("Backup already exists at:", BACKUP_PATH)

    synthetic_rows = []

    for _ in range(NUM_NEW_SPAM):
        gen = random.choice(ALL_GENERATORS)
        raw = gen()
        synthetic_rows.append({
            "label": "spam",
            "email_text": raw,
            "email_text_clean": sanitize_row(raw)
        })

    synthetic_df = pd.DataFrame(synthetic_rows)

    combined = pd.concat([df, synthetic_df], ignore_index=True)
    combined = combined.sample(frac=1, random_state=42).reset_index(drop=True)

    combined.to_csv(OUTPUT_PATH, index=False, encoding="utf-8")

    print(f"\n✅ Added {NUM_NEW_SPAM} advanced phishing samples.")
    print(combined["label"].value_counts())


if __name__ == "__main__":
    main()
