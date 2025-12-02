# backend/retrain_model.py

import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.svm import LinearSVC
from sklearn.metrics import classification_report, confusion_matrix
import joblib

# ---------------------------------------------------
# Step 1 — Load dataset
# ---------------------------------------------------
df = pd.read_csv("datasets/phishing_clean.csv")

# Check columns
print("Columns in dataset:", df.columns)
print("Label distribution before cleaning:", df['label'].value_counts())

# ---------------------------------------------------
# Step 2 — Clean text
# ---------------------------------------------------
def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"http\S+", "url", text)  # replace URLs
    text = re.sub(r"[^a-zA-Z0-9 ]", " ", text)  # remove punctuation
    text = re.sub(r"\s+", " ", text).strip()    # remove extra spaces
    return text
df['cleaned_text'] = df['email_text'].apply(clean_text)
 # replace 'text' with your actual text column

# ---------------------------------------------------
# Step 3 — Fix labels
# ---------------------------------------------------
# Ensure labels are 0 for ham, 1 for phishing
df['label'] = df['label'].apply(lambda x: 1 if str(x).lower() in ['1', 'phishing', 'spam'] else 0)
print("Label distribution after cleaning:", df['label'].value_counts())

# ---------------------------------------------------
# Step 4 — Split dataset
# ---------------------------------------------------
X = df['cleaned_text']
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ---------------------------------------------------
# Step 5 — Fit TF-IDF vectorizer
# ---------------------------------------------------
tfidf = TfidfVectorizer(max_features=5000)
X_train_vect = tfidf.fit_transform(X_train)
X_test_vect = tfidf.transform(X_test)

# ---------------------------------------------------
# Step 6 — Train Linear SVM (balanced)
# ---------------------------------------------------
model = LinearSVC(class_weight="balanced", max_iter=10000)
model.fit(X_train_vect, y_train)

# ---------------------------------------------------
# Step 7 — Evaluate model
# ---------------------------------------------------
y_pred = model.predict(X_test_vect)
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# ---------------------------------------------------
# Step 8 — Save vectorizer & model
# ---------------------------------------------------
joblib.dump(tfidf, "models/tfidf_vectorizer.pkl")
joblib.dump(model, "models/winner_model.pkl")
print("\n✅ TF-IDF vectorizer and SVM model saved successfully!")
