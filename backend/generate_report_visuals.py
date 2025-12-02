# save as backend/generate_report_visuals.py
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import numpy as np
from sklearn.metrics import confusion_matrix

# ----------------------------
# Load models and dataset
# ----------------------------
tfidf = joblib.load("models/tfidf_vectorizer.pkl")
model = joblib.load("models/winner_model.pkl")

# Example labels & predictions (replace with your actual test set)
# For demonstration, using dummy data. Replace with your evaluate_models.py outputs
y_true = np.array([0]*893 + [1]*131)  # 0=ham, 1=spam
y_pred = np.array([0]*889 + [1]*4 + [0]*14 + [1]*117)  # Linear SVM confusion matrix example

# ----------------------------
# Confusion Matrix
# ----------------------------
cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(6,5))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=["ham","phishing"], yticklabels=["ham","phishing"])
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix - Linear SVM")
plt.tight_layout()
plt.savefig("docs/confusion_matrix.png")
plt.close()

# ----------------------------
# Accuracy Comparison Bar Chart
# ----------------------------
models = ["Logistic Regression", "Naive Bayes", "Linear SVM"]
accuracy = [95.41, 97.17, 98.24]

plt.figure(figsize=(6,4))
sns.barplot(x=models, y=accuracy, palette="viridis")
plt.ylim(0,100)
plt.ylabel("Accuracy (%)")
plt.title("Model Accuracy Comparison")
plt.tight_layout()
plt.savefig("docs/accuracy_comparison.png")
plt.close()

print("✅ Visuals generated and saved in /docs folder")
