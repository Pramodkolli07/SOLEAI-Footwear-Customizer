from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd
from pathlib import Path

app = Flask(__name__)

MODEL_PATH = (
    Path(__file__).resolve().parent
    / "models"
    / "ml"
    / "shoe_category_model_v2.joblib"
)

shoe_model = joblib.load(MODEL_PATH)

print("SOLEAI ML model loaded successfully!")


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/customize')
def customize():
    return render_template('customize.html')


@app.route('/3d-test')
def three_test():
    return render_template('three_test.html')


@app.route('/api/predict-category', methods=['POST'])
def predict_category():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "error": "Please provide shoe attributes."
        }), 400

    features = [
        "HeelHeight",
        "Insole",
        "Closure",
        "Gender",
        "Material",
        "ToeStyle"
    ]

    missing = [feature for feature in features if feature not in data]

    if missing:
        return jsonify({
            "success": False,
            "error": "Missing attributes",
            "missing_fields": missing
        }), 400

    try:
        input_data = pd.DataFrame([{
            feature: data[feature] for feature in features
        }])

        prediction = shoe_model.predict(input_data)[0]

        return jsonify({
            "success": True,
            "predicted_category": prediction,
            "message": "Shoe category predicted successfully!"
        })

    except Exception as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


if __name__ == '__main__':
    app.run(debug=True)
