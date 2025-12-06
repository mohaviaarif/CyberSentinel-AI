import os
import random
import pandas as pd

from utils.cleaner import sanitize_input, clean_text

# --------- CONFIG ----------
INPUT_PATH = "datasets/phishing_clean_balanced.csv"
BACKUP_PATH = "datasets/phishing_clean_balanced_backup.csv"
OUTPUT_PATH = "datasets/phishing_clean_balanced.csv"  # we overwrite with improved version
NUM_DELIVERY_SPAM = 200
# ---------------------------


def generate_delivery_phishing(carrier: str, link_domain: str):
    """Generate synthetic delivery-scam phishing email."""
    templates = [
        f"""
Dear Customer,

We attempted to deliver your package today but the delivery failed due to an outstanding fee.
Your parcel is currently on hold at the {carrier} sorting facility.

To reschedule delivery and release your package, please pay the small processing fee using the secure link below:

https://{link_domain}/reschedule-delivery

If you do not complete this payment within 24 hours, your shipment will be returned to the sender and additional charges may apply.

Thank you,
{carrier} Delivery Support
""",
        f"""
Important: Action Required For Your {carrier} Shipment

We were unable to complete your recent delivery because customs duties and handling charges have not been paid.

Your package will be destroyed if you do not confirm payment:

https://{link_domain}/confirm-fee

This is your final notice. Failure to act today will result in permanent loss of your parcel.

Sincerely,
{carrier} Billing Department
""",
        f"""
Package On Hold

Your recent {carrier} shipment could not be delivered because the address appears incomplete or invalid.

To avoid return-to-sender fees, please verify your delivery information and pay the address correction fee here:

https://{link_domain}/update-address

If you do not respond within 12 hours, your package will be returned and you may incur additional charges.

Regards,
{carrier} Customer Service
""",
        f"""
Delivery Attempt Failed

Our driver attempted to deliver your package but no one was available to receive it.

To schedule a new delivery date and pay the re-delivery fee, please use the secure portal below:

https://{link_domain}/schedule-new-delivery

Your parcel will be stored only for a limited time before being returned.

{carrier} Delivery Team
""",
        f"""
Customs Clearance Required

Your international package handled by {carrier} is being held by customs due to unpaid import fees.

To release your shipment and avoid penalties, complete the payment via the secure link:

https://{link_domain}/customs-clearance

If you ignore this notice, additional storage and legal fees may be applied to your account.

Thank you,
{carrier} Customs Processing Center
"""
    ]

    body = random.choice(templates)
    return body.strip()


def main():
    if not os.path.exists(INPUT_PATH):
        raise FileNotFoundError(f"Input dataset not found at: {INPUT_PATH}")

    print(f"Loading existing balanced dataset from: {INPUT_PATH}")
    df = pd.read_csv(INPUT_PATH)

    print("\nCurrent label counts:")
    print(df["label"].value_counts())

    # Backup original file
    if not os.path.exists(BACKUP_PATH):
        print(f"\nCreating backup at: {BACKUP_PATH}")
        df.to_csv(BACKUP_PATH, index=False, encoding="utf-8")
    else:
        print(f"\nBackup already exists at: {BACKUP_PATH}")

    carriers = [
        "DHL", "FedEx", "UPS", "TCS", "Leopards Courier",
        "USPS", "Royal Mail", "DPD", "Hermes", "Canada Post"
    ]

    link_domains = [
        "dhl-delivery-update.com",
        "dhl-pay-fee-delivery.com",
        "fedex-reschedule-center.com",
        "ups-parcel-clearance.com",
        "courier-fee-payment.com",
        "secure-shipment-update.com",
        "global-delivery-confirm.com",
        "track-your-parcel-today.com"
    ]

    synthetic_rows = []

    print(f"\nGenerating {NUM_DELIVERY_SPAM} delivery phishing emails...")

    for i in range(NUM_DELIVERY_SPAM):
        carrier = random.choice(carriers)
        link_domain = random.choice(link_domains)

        raw_email = generate_delivery_phishing(carrier, link_domain)

        # Use your existing security + cleaning pipeline
        sanitized = sanitize_input(raw_email)
        cleaned = clean_text(sanitized)

        synthetic_rows.append({
            "label": "spam",
            "email_text": raw_email,
            "email_text_clean": cleaned
        })

    synthetic_df = pd.DataFrame(synthetic_rows)

    print("\nNew synthetic phishing label counts:")
    print(synthetic_df["label"].value_counts())

    # Merge with existing dataset
    combined_df = pd.concat([df, synthetic_df], ignore_index=True)

    print("\nUpdated combined label counts:")
    print(combined_df["label"].value_counts())

    # Shuffle rows for randomness
    combined_df = combined_df.sample(frac=1, random_state=42).reset_index(drop=True)

    # Ensure directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    # Overwrite main balanced dataset
    combined_df.to_csv(OUTPUT_PATH, index=False, encoding="utf-8")
    print(f"\n✅ Updated balanced dataset (with delivery scams) saved to: {OUTPUT_PATH}")
    print(f"   Original dataset backup kept at: {BACKUP_PATH}")


if __name__ == "__main__":
    main()

