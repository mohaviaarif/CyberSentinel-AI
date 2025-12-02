# Step 1: Import pandas
import pandas as pd

# Step 2: Load the dataset
df = pd.read_csv("datasets/spam.csv",encoding='latin1')
# Quick check
print("Columns:", df.columns)
print("First 5 rows:")
print(df.head())

# Only keep the useful columns
df = df[['v1', 'v2']].rename(columns={'v1': 'label', 'v2': 'email_text'})

# Shape & missing values
print("Shape:", df.shape)
print("Missing values per column:")
print(df.isnull().sum())

# Label distribution
print("Label counts:")
print(df['label'].value_counts())

# Check for duplicate emails
duplicate_count = df.duplicated(subset='email_text').sum()
print("Number of duplicate emails:", duplicate_count)

# Optional: see the top 5 most repeated emails
top_duplicates = df['email_text'].value_counts().head(5)
print("Top 5 most repeated emails:\n", top_duplicates)

