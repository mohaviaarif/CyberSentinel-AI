import pandas as pd

path = "datasets/phishing_clean_balanced.csv"

df = pd.read_csv(path)

print("Before:", len(df))

# Remove duplicates based on raw email text
df = df.drop_duplicates(subset=["email_text"], keep="first")

# Remove duplicates based on cleaned email text
df = df.drop_duplicates(subset=["email_text_clean"], keep="first")

print("After:", len(df))
print(df["label"].value_counts())

df.to_csv(path, index=False)
print("✔ Dataset cleaned and saved!")
