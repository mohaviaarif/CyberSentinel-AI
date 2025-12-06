import pandas as pd
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# ------------------------
# Load dataset
# ------------------------
df = pd.read_csv("datasets/phishing_clean_balanced.csv")

# Fix NaN values (important)
df["email_text_clean"] = df["email_text_clean"].fillna("")

# Features + labels
X = df["email_text_clean"]
y = df["label"]

# ------------------------
# Train/test split
# ------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ------------------------
# TF-IDF Vectorizer (improved for phishing)
# ------------------------
vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=20000,      # more vocabulary → better signal detection
    ngram_range=(1, 3)       # captures "account limited", "verify your account"
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# ------------------------
# Logistic Regression (balanced to fix low spam recall)
# ------------------------
model = LogisticRegression(
    max_iter=4000,
    class_weight="balanced"   # FIXES the ham bias
)

model.fit(X_train_vec, y_train)

# ------------------------
# Evaluation
# ------------------------
preds = model.predict(X_test_vec)

print("\nMODEL REPORT:\n")
print(classification_report(y_test, preds))

# ------------------------
# Save model + vectorizer
# ------------------------
os.makedirs("backend/models", exist_ok=True)

joblib.dump(vectorizer, "backend/models/tfidf_vectorizer.pkl")
joblib.dump(model, "backend/models/best_model.pkl")

print("\nModel + vectorizer saved successfully!")
