import re


# -----------------------------------------
# STEP 5 - SECURITY SANITIZATION
# -----------------------------------------
def sanitize_input(text):
    """
    First security layer before ML cleaning:
    - Strip HTML tags (<b>, <div>, <script>, etc.)
    - Remove the word 'script' (any casing)
    - Remove non-printable / control characters
    """

    if not isinstance(text, str):
        text = str(text)

    # Remove HTML tags
    text = re.sub(r"<.*?>", "", text)

    # Remove "script" in ANY casing (script, SCRIPT, ScRiPt)
    text = re.sub(r"(?i)script", "", text)

    # Remove stray invisible characters
    text = ''.join(ch for ch in text if ch.isprintable())

    return text


# -----------------------------------------
# NORMAL CLEANING (ML PREPROCESSING)
# -----------------------------------------
def clean_text(text):
    """
    Main cleaning pipeline used by the ML model:
    - Lowercase
    - Remove URLs
    - Remove leftover HTML tags
    - Remove numbers
    - Remove punctuation
    - Remove extra spaces
    """

    if not isinstance(text, str):
        text = str(text)

    # Lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(r"http\S+|www\S+", "", text)

    # Remove any HTML (fallback — sanitization handles most)
    text = re.sub(r"<.*?>", "", text)

    # Remove numbers
    text = re.sub(r"\d+", "", text)

    # Remove punctuation
    text = re.sub(r"[^\w\s]", "", text)

    # Remove extra spaces
    text = " ".join(text.split())

    return text
