import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score


# ---------------------------------------------------------
# 1. Load Cleaned Dataset
# ---------------------------------------------------------
print("📂 Loading cleaned dataset...")
df = pd.read_csv("datasets/phishing_clean.csv")

print(f"Dataset loaded. Shape: {df.shape}")

X = df["email_text_clean"]
y = df["label"]
X = X.fillna("")


# ---------------------------------------------------------
# 2. Load TF-IDF Vectorizer
# ---------------------------------------------------------
print("🔧 Loading TF-IDF vectorizer...")
tfidf = joblib.load("models/tfidf_vectorizer.pkl")


# ---------------------------------------------------------
# 3. Transform Text → Numeric Features
# ---------------------------------------------------------
print("🔄 Transforming text into TF-IDF features...")
X_tfidf = tfidf.transform(X)


# ---------------------------------------------------------
# 4. Train-Test Split
# ---------------------------------------------------------
print("✂ Splitting dataset...")
X_train, X_test, y_train, y_test = train_test_split(
    X_tfidf, y, test_size=0.2, random_state=42
)


# ---------------------------------------------------------
# 5. Define Models
# ---------------------------------------------------------
models = {
    "Logistic Regression": LogisticRegression(max_iter=2000),
    "Naive Bayes": MultinomialNB(),
    "Linear SVM": LinearSVC()
}

accuracies = {}

print("\n🚀 Training models...\n")

# ---------------------------------------------------------
# 6. Train & Evaluate Each Model
# ---------------------------------------------------------
for model_name, model in models.items():
    print(f"➡ Training {model_name}...")
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)

    accuracies[model_name] = acc
    print(f"{model_name} Accuracy: {acc:.4f}\n")


# ---------------------------------------------------------
# 7. Print Summary Table
# ---------------------------------------------------------
print("\n==============================")
print("📊 MODEL ACCURACY SUMMARY")
print("==============================")

for m, a in accuracies.items():
    print(f"{m}: {a*100:.2f}%")

print("\n🔥 Day 1 complete! Run this script to see which model wins.")
