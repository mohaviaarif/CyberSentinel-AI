import pandas as pd
import re
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')

# Load CSV with proper headers
df = pd.read_csv("datasets/spam.csv", encoding='latin1')

# Keep only the first two columns and rename them
df = df[['v1', 'v2']]
df.columns = ['label', 'email_text']

print("Dataset shape:", df.shape)
print(df.head())
 
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+", "URL", text)
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    stop_words = set(stopwords.words('english'))
    words = [word for word in text.split() if word not in stop_words]
    if len(words) == 0:
        return text
    return ' '.join(words)

df['email_text_clean'] = df['email_text'].apply(clean_text)

df = df.drop_duplicates(subset='email_text_clean')
df = df.dropna(subset=['email_text_clean', 'label'])
print("Cleaned dataset shape:", df.shape)

# Save the cleaned dataset
df.to_csv("datasets/phishing_clean.csv", index=False)
print("Cleaned dataset saved to datasets/phishing_clean.csv")

# Quick label check
print("\nLabel distribution:")
print(df['label'].value_counts())
