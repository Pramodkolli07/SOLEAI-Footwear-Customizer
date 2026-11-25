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

BASE_DIR = Path(__file__).resolve().parent

DATA_PATH = (
    BASE_DIR
    / "UT_Zappos50K"
    / "metadata"
    / "ut-zap50k-data"
    / "meta-data.csv"
)

MODEL_DIR = BASE_DIR.parent / "models" / "ml"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODEL_DIR / "shoe_category_model.joblib"

print("Loading UT Zappos50K metadata...")

df = pd.read_csv(DATA_PATH)

features = [
    "SubCategory",
    "HeelHeight",
    "Insole",
    "Closure",
    "Gender",
    "Material",
    "ToeStyle"
]

target = "Category"

df = df[features + [target]].copy()

X = df[features]
y = df[target]

categorical_features = features

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            Pipeline([
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("encoder", OneHotEncoder(handle_unknown="ignore"))
            ]),
            categorical_features
        )
    ]
)

model = Pipeline([
    ("preprocessor", preprocessor),
    (
        "classifier",
        RandomForestClassifier(
            n_estimators=150,
            random_state=42,
            class_weight="balanced",
            n_jobs=-1
        )
    )
])

print("Splitting dataset into training and testing sets...")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training Random Forest model...")

model.fit(X_train, y_train)

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("\nMODEL EVALUATION")
print("----------------")
print(f"Training records: {len(X_train)}")
print(f"Testing records: {len(X_test)}")
print(f"Accuracy: {accuracy * 100:.2f}%")

print("\nClassification Report:")
print(classification_report(y_test, predictions))

joblib.dump(model, MODEL_PATH)

print("\nModel saved successfully!")
print(MODEL_PATH)

print("\nTesting a sample prediction...")

sample = pd.DataFrame([{
    "SubCategory": "Sneakers and Athletic Shoes",
    "HeelHeight": None,
    "Insole": "Padded",
    "Closure": "Lace up",
    "Gender": "Men",
    "Material": "Mesh;Synthetic",
    "ToeStyle": "Round Toe"
}])

result = model.predict(sample)

print("Predicted shoe category:", result[0])
