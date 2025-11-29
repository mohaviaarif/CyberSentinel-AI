import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib

# Load cleaned dataset
df = pd.read_csv("datasets/phishing_clean.csv")
print("Dataset loaded, shape:", df.shape)
print(df.head())
# Features and labels
X = df['email_text_clean']  # input text
y = df['label']             # target label

# Split: 80% train, 20% test, keeping label distribution
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("X_train shape:", X_train.shape)
print("X_test shape:", X_test.shape)
print("y_train distribution:\n", y_train.value_counts())
# Drop any rows where email_text_clean is NaN
X_train = X_train.dropna()
y_train = y_train[X_train.index]  # keep labels aligned

X_test = X_test.dropna()
y_test = y_test[X_test.index]  # keep labels aligned

# Initialize TF-IDF vectorizer
tfidf = TfidfVectorizer(
    max_features=5000,      # limit vocab size
    ngram_range=(1, 2),     # unigrams + bigrams
    stop_words='english'    # remove common English words
)

# Fit TF-IDF on training data
X_train_tfidf = tfidf.fit_transform(X_train)
X_test_tfidf = tfidf.transform(X_test)

print("TF-IDF transformation done.")
print("Vocabulary size:", len(tfidf.vocabulary_))

# Save the TF-IDF vectorizer for later use
joblib.dump(tfidf, "models/tfidf_vectorizer.pkl")
print("TF-IDF vectorizer saved to models/tfidf_vectorizer.pkl")
# Quick verification
print("Sample TF-IDF feature shape:", X_train_tfidf.shape)
print("Sample first feature vector:\n", X_train_tfidf[0])

