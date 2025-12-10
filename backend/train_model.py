import os
import joblib
import pandas as pd
from scipy.sparse import hstack

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# -----------------------
# LOAD DATASET
# -----------------------
df = pd.read_csv("datasets/phishing_clean_balanced.csv")
df["email_text_clean"] = df["email_text_clean"].fillna("")

X = df["email_text_clean"]
y = df["label"]

# -----------------------
# TRAIN TEST SPLIT
# -----------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# -----------------------
# TF-IDF (WORD + CHAR)
# -----------------------

# WORD-LEVEL TF-IDF
word_vectorizer = TfidfVectorizer(
    analyzer="word",
    ngram_range=(1, 3),
    max_features=30000,
    lowercase=True
)

X_train_word = word_vectorizer.fit_transform(X_train)
X_test_word = word_vectorizer.transform(X_test)

# CHAR-LEVEL TF-IDF (critical for URLs / obfuscation)
char_vectorizer = TfidfVectorizer(
    analyzer="char",
    ngram_range=(3, 6),
    max_features=20000
)

X_train_char = char_vectorizer.fit_transform(X_train)
X_test_char = char_vectorizer.transform(X_test)

# COMBINE FEATURES
X_train_vec = hstack([X_train_word, X_train_char])
X_test_vec = hstack([X_test_word, X_test_char])

# -----------------------
# LOGISTIC REGRESSION MODEL (BALANCED)
# -----------------------
model = LogisticRegression(
    max_iter=5000,
    class_weight="balanced",
    n_jobs=-1
)

model.fit(X_train_vec, y_train)

# -----------------------
# EVALUATION
# -----------------------
preds = model.predict(X_test_vec)

print("\nMODEL REPORT:\n")
print(classification_report(y_test, preds))

# -----------------------
# SAVE MODEL + VECTORIZERS
# -----------------------
os.makedirs("backend/models", exist_ok=True)

joblib.dump(word_vectorizer, "backend/models/tfidf_word_vectorizer.pkl")
joblib.dump(char_vectorizer, "backend/models/tfidf_char_vectorizer.pkl")
joblib.dump(model, "backend/models/best_model.pkl")

print("\nModel + vectorizers saved successfully!")
