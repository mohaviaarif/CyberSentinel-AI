# backend/evaluate_models.py

import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# Step 3 — Load Dataset & TF-IDF

# Load cleaned dataset
df = pd.read_csv("datasets/phishing_clean.csv")

# Fill any empty texts with empty string
X = df["email_text_clean"].fillna("")
y = df["label"]

# Load TF-IDF vectorizer
tfidf = joblib.load("models/tfidf_vectorizer.pkl")
X_tfidf = tfidf.transform(X)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X_tfidf, y, test_size=0.2, random_state=42
)

print("✅ Dataset loaded and split. Ready for training!")
# Step 4 — Define all models
models = {
    "Logistic Regression": LogisticRegression(max_iter=2000),
    "Naive Bayes": MultinomialNB(),
    "Linear SVM": LinearSVC()
}

# Dictionary to store results
results = {}

print("✅ Models are defined and ready for training!")
# Step 5 — Train and evaluate each model
for name, model in models.items():
    print(f"\n➡ Training and evaluating: {name}")
    
    # Train the model
    model.fit(X_train, y_train)
    
    # Make predictions
    y_pred = model.predict(X_test)
    
    # Calculate accuracy
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc*100:.2f}%")
    
    # Print classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Print confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    print("Confusion Matrix:\n", cm)
    
    # Store results
    results[name] = {
        "model": model,
        "accuracy": acc,
        "classification_report": classification_report(y_test, y_pred, output_dict=True),
        "confusion_matrix": cm
    }
# Step 6 — Plot Confusion Matrix for Winner
winner_name = max(results, key=lambda x: results[x]["accuracy"])
winner_cm = results[winner_name]["confusion_matrix"]

plt.figure(figsize=(6,5))
sns.heatmap(winner_cm, annot=True, fmt="d", cmap="Blues")
plt.title(f"Confusion Matrix - {winner_name}")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.show()

print(f"\n🏆 Best Model: {winner_name} with Accuracy: {results[winner_name]['accuracy']*100:.2f}%")
# Save the winner model
joblib.dump(results[winner_name]["model"], "models/winner_model.pkl")
print(f"🏆 Winner model saved as 'models/winner_model.pkl'")
# Save the winner model
joblib.dump(results[winner_name]["model"], "models/winner_model.pkl")
print(f"🏆 Winner model saved as 'models/winner_model.pkl'")

# Save the winner model
joblib.dump(results[winner_name]["model"], "models/winner_model.pkl")
print(f"🏆 Winner model saved as 'models/winner_model.pkl'")
