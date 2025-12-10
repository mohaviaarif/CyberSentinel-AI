import re

# -----------------------------------------
# STEP 1 - SECURITY SANITIZATION
# -----------------------------------------
def sanitize_input(text):
    """
    Remove HTML tags and dangerous script content.
    DO NOT remove URLs or domain names.
    """

    if not isinstance(text, str):
        text = str(text)

    # Remove HTML tags
    text = re.sub(r"<.*?>", "", text)

    # Remove the word 'script' (XSS protection)
    text = re.sub(r"(?i)script", "", text)

    # Keep everything else (URLs, punctuation, numbers)
    text = ''.join(ch for ch in text if ch.isprintable())

    return text


# -----------------------------------------
# STEP 2 - ML CLEANING (Light-touch)
# -----------------------------------------
def clean_text(text):
    """
    Much lighter cleaning:
    - lowercase
    - keep URLs (VERY important for phishing)
    - keep punctuation inside URLs
    - remove only useless punctuation around words
    - keep numbers (important for phishing)
    """

    if not isinstance(text, str):
        text = str(text)

    text = text.lower()

    # KEEP URLs — turn them into URLTOKEN instead
    text = re.sub(r"http\S+", " urltoken ", text)
    text = re.sub(r"www\.\S+", " urltoken ", text)

    # Remove punctuation EXCEPT inside URLs (already tokenized)
    text = re.sub(r"[^\w\s]", " ", text)

    # Remove extra spaces
    text = " ".join(text.split())

    return text
