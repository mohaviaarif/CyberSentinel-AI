import joblib
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, classification_report, accuracy_score
from sklearn.model_selection import train_test_split
from scipy.sparse import hstack

# Load model and vectorizers
model = joblib.load("models/best_model.pkl")
tfidf_word = joblib.load("models/tfidf_word_vectorizer.pkl")
tfidf_char = joblib.load("models/tfidf_char_vectorizer.pkl")

# Load dataset
df = pd.read_csv("../datasets/phishing_clean.csv")

# Drop nulls
df = df.dropna()

# Features and labels
X = df["email_text"]
y = df["label"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Transform test data
X_test_word = tfidf_word.transform(X_test)
X_test_char = tfidf_char.transform(X_test)

# Combine features
X_test_combined = hstack([X_test_word, X_test_char])

# Predictions
y_pred = model.predict(X_test_combined)

# Accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy * 100:.2f}%")

# Confusion matrix
cm = confusion_matrix(y_test, y_pred)

# Class labels (VERY IMPORTANT)
labels = ["Ham", "Spam"]

plt.figure(figsize=(8, 6))

sns.heatmap(
    cm,
    annot=True,
    fmt='d',
    cmap='Blues',
    xticklabels=labels,
    yticklabels=labels,
    cbar=True,
    linewidths=0.5,
    linecolor='gray',
    annot_kws={"size": 14}
)

plt.title("CyberSentinel AI Phishing Detection", fontsize=16, fontweight='bold')
plt.xlabel("Predicted Label", fontsize=12)
plt.ylabel("Actual Label", fontsize=12)

plt.xticks(fontsize=11)
plt.yticks(fontsize=11)

plt.tight_layout()

plt.savefig("../docs/testing/confusion_matrix.png", dpi=300)
plt.close()

# Classification report
report = classification_report(y_test, y_pred)

print("\nClassification Report:\n")
print(report)

with open("../docs/testing/classification_report.txt", "w") as f:
    f.write(report)