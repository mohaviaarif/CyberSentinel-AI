import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib

# 1. Load cleaned dataset
df = pd.read_csv("datasets/phishing_clean.csv")
print("Dataset loaded:", df.shape)

X = df["email_text_clean"]
y = df["label"]

# 2. Split (only need training part)
X_train, _, _, _ = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Remove NaN values
X_train = X_train.dropna()

# 3. Build TF-IDF vectorizer
tfidf = TfidfVectorizer(
    max_features=5000,
    ngram_range=(1, 2),
    stop_words="english"
)

# 4. Fit TF-IDF on training data
tfidf.fit(X_train)

# 5. Save vectorizer to correct folder
save_path = "backend/models/tfidf_vectorizer.pkl"
joblib.dump(tfidf, save_path)

print(f"TF-IDF vectorizer SAVED to {save_path}")
print("Vocabulary size:", len(tfidf.vocabulary_))


