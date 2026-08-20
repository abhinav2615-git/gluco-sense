# 🩺 Diabetes Risk Prediction System (Machine Learning)

A fully working end-to-end ML project: trains a classifier on the **Pima Indians
Diabetes Dataset**, and serves live predictions through a **Streamlit web app**.

---

## 📁 Project Files
| File | Purpose |
|---|---|
| `diabetes.csv` | Dataset (768 patient records, 8 features + outcome) |
| `train_model.py` | Cleans data, trains & compares models, saves best one |
| `diabetes_model.pkl` | Trained Random Forest model (already generated) |
| `scaler.pkl` | Feature scaler used before prediction |
| `feature_names.pkl` | Ordered list of input feature names |
| `app.py` | Streamlit web app — 3 tabs: Global Picture, Predict Risk, How the Model Works |
| `world_data.py` | Real global diabetes statistics (IDF Diabetes Atlas 2025) used in the dashboard |
| `sample_profiles.py` | Pre-filled demo patient profiles for quick, no-typing demos |
| `requirements.txt` | Python dependencies |

### What's new in the UI
- **🌍 Global Picture tab** — world diabetes stats (589M cases, regional breakdown chart,
  historical trend, top countries) sourced from the IDF Diabetes Atlas 2025, styled as a dashboard.
- **🔍 Predict Risk tab** — dropdown of 5 ready-made sample profiles (healthy, borderline,
  high-risk, athlete, senior with family history) so you can demo instantly without typing values,
  plus a risk gauge chart and feature-importance chart per prediction.
- **📊 How the Model Works tab** — performance metrics, pipeline steps, and feature descriptions
  for anyone (like a judge or professor) who wants the technical details.
- Custom teal/amber color theme, card-based layout, and a gradient hero header.

Model performance (already trained, ready to use):
- **Accuracy:** ~73%
- **ROC-AUC:** ~0.81
- **Model used:** Random Forest (beat Logistic Regression on F1-score)

---

## 🚀 Run It Locally RIGHT NOW (for tonight's prep / rehearsal)

1. Install Python 3.9+ if you don't have it.
2. Open a terminal in this folder and run:
   ```bash
   pip install -r requirements.txt
   streamlit run app.py
   ```
3. It will open automatically at `http://localhost:8501` in your browser.
4. Enter patient details on the form and click **Predict Diabetes Risk**.

That's it — you now have a fully working local demo you can show tomorrow even without internet.

---

## 🌐 Deploy It for FREE (so you have a live link too)

### Option A: Streamlit Community Cloud (recommended, easiest, free forever)

1. Create a free GitHub account if you don't have one: https://github.com
2. Create a **new public repository** (e.g. `diabetes-predictor`).
3. Upload these files to the repo:
   - `app.py`
   - `requirements.txt`
   - `diabetes_model.pkl`
   - `scaler.pkl`
   - `feature_names.pkl`
   - `diabetes.csv` (optional, only needed if you want to retrain)
4. Go to https://streamlit.io/cloud and sign in with GitHub.
5. Click **"New app"** → select your repo → set main file path to `app.py` → **Deploy**.
6. Wait 1–2 minutes. You'll get a public link like:
   `https://your-app-name.streamlit.app`
7. Share this link — it works from any device, no install needed.

This is completely free with no credit card required, and perfect for a mini-project demo.

### Option B: Hugging Face Spaces (also free, alternative if Streamlit Cloud is slow)

1. Create a free account at https://huggingface.co
2. Click **New Space** → choose **Streamlit** as the SDK → name it → Create.
3. Upload the same files (`app.py`, `requirements.txt`, `.pkl` files).
4. It auto-builds and gives you a public URL like `https://huggingface.co/spaces/username/space-name`.

### Option C: Just run it locally during your presentation
If you're presenting in person/on your own laptop, Option A (`streamlit run app.py`) is
enough — no deployment needed at all, and it looks exactly the same.

---

## 🎤 What to Say in Your Presentation (quick script)

1. **Problem**: Diabetes is a growing health issue; early risk prediction can help
   with preventive care.
2. **Data**: Pima Indians Diabetes Dataset — 768 patients, 8 clinical features
   (glucose, BMI, blood pressure, age, etc.)
3. **Approach**:
   - Cleaned data (handled invalid zero values via median imputation)
   - Scaled features with StandardScaler
   - Trained & compared Logistic Regression vs Random Forest
   - Selected Random Forest (better F1-score, handles non-linear patterns)
4. **Results**: ~73% accuracy, 0.81 ROC-AUC on held-out test data
5. **Demo**: Show the live Streamlit app — enter values, get prediction + probability
   + a feature importance chart explaining *why*.
6. **Future scope**: More data, deep learning models, integration with real EHR
   systems, mobile app, doctor-facing dashboard.

---

## 🔁 To Retrain the Model (optional, not needed to demo)
```bash
python train_model.py
```
This regenerates `diabetes_model.pkl`, `scaler.pkl`, and `feature_names.pkl`.
