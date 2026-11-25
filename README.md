# SOLEAI – AI-Powered 3D Footwear Customization Platform

SOLEAI is an interactive footwear customization web application combining 3D visualization and machine learning.

## Features
- Seven-stage footwear customization.
- 12 realistic 3D footwear models.
- Material and colour customization.
- Sole grip and lace customization.
- Interactive 3D rotation.
- Cinematic final reveal.
- Machine-learning footwear category prediction.
- Premium black and crimson-red interface.

## Technology Stack
- Python 3.13
- Flask
- HTML, CSS, JavaScript
- Three.js
- Scikit-learn
- NumPy, Pandas, SciPy
- Joblib
- Git and Git LFS

## Installation

1. Clone the repository.
2. Create a virtual environment using: python -m venv venv
3. Activate it using: .\venv\Scripts\Activate.ps1
4. Install dependencies using: pip install -r requirements.txt
5. Download Git LFS files using: git lfs pull
6. Start the application using: python app.py

Open http://127.0.0.1:5000 in your browser.

## Application Routes
- / : Homepage
- /customize : Footwear customization
- /3d-test : 3D testing page
- /api/predict-category : Machine-learning prediction API

## Dataset
The project uses the UT Zappos50K dataset for machine-learning experimentation. The original dataset is not included in this repository.

## 3D Model Credits
Footwear models provided by vinish.dev under Creative Commons Attribution 4.0 International (CC BY 4.0).

Credit: Shoes by vinish.dev
https://vinish.dev/free-3d-models/shoes/

License: https://creativecommons.org/licenses/by/4.0/

Additional credits are available in static/models/shoes/.

## Future Improvements
- Online deployment.
- User accounts and saved designs.
- Backend order management.
- Improved machine-learning predictions.

**SOLEAI – Your Vision. Your Design. Your Masterpiece.**
