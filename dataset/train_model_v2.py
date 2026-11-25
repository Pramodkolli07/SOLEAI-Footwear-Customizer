import pandas as pd
import joblib
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

BASE = Path(__file__).resolve().parent

DATA = BASE / "UT_Zappos50K" / "metadata" / "ut-zap50k-data" / "meta-data.csv"

MODEL_DIR = BASE.parent / "models" / "ml"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODEL_DIR / "shoe_category_model_v2.joblib"

print("Loading dataset...")

df = pd.read_csv(DATA)

features = [
    "HeelHeight",
    "Insole",
    "Closure",
    "Gender",
    "Material",
    "ToeStyle"
]

X = df[features]
y = df["Category"]

preprocessor = ColumnTransformer([
    ("categorical", Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore"))
    ]), features)
])

model = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", RandomForestClassifier(
        n_estimators=150,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    ))
])

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training improved model...")

model.fit(X_train, y_train)

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("\nMODEL EVALUATION")
print("----------------")
print("Accuracy:", round(accuracy * 100, 2), "%")
print(classification_report(y_test, predictions))

print("Saving trained model...")

joblib.dump(model, MODEL_PATH)

print("\nMODEL SAVED SUCCESSFULLY!")
print(MODEL_PATH)
