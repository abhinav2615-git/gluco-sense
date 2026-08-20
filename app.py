import streamlit as st
import pandas as pd
import numpy as np
import joblib
import plotly.graph_objects as go
import plotly.express as px

from world_data import GLOBAL_STATS, REGION_DATA, TOP_COUNTRIES, HISTORICAL_TREND, SOURCE_NOTE
from sample_profiles import SAMPLE_PROFILES

# ---------------------------------------------------------
# Page config
# ---------------------------------------------------------
st.set_page_config(
    page_title="GlucoSense | Diabetes Risk Predictor",
    page_icon="🩺",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ---------------------------------------------------------
# Custom styling
# ---------------------------------------------------------
PRIMARY = "#0F5C55"      # deep teal
ACCENT = "#F2994A"       # warm amber (risk/alert accent)
GOOD = "#2FA97A"         # calm green (low risk)
BAD = "#E0574C"          # coral red (high risk)
BG_SOFT = "#F4FBF9"      # soft mint background
CARD_BG = "#FFFFFF"
TEXT_DARK = "#0E2B27"

st.markdown(f"""
<style>
    .stApp {{
        background-color: {BG_SOFT};
    }}
    #MainMenu, footer {{visibility: hidden;}}

    .hero {{
        background: linear-gradient(120deg, {PRIMARY} 0%, #12857A 100%);
        padding: 2.2rem 2rem;
        border-radius: 18px;
        color: white;
        margin-bottom: 1.5rem;
    }}
    .hero h1 {{
        font-size: 2.1rem;
        margin-bottom: 0.3rem;
        font-weight: 800;
    }}
    .hero p {{
        font-size: 1.02rem;
        opacity: 0.92;
        max-width: 640px;
    }}

    .metric-card {{
        background: {CARD_BG};
        border-radius: 14px;
        padding: 1.1rem 1.2rem;
        border: 1px solid #E3EFEC;
        box-shadow: 0 2px 10px rgba(15, 92, 85, 0.05);
        text-align: left;
    }}
    .metric-card .value {{
        font-size: 1.7rem;
        font-weight: 800;
        color: {PRIMARY};
    }}
    .metric-card .label {{
        font-size: 0.85rem;
        color: #5B7B76;
        margin-top: 2px;
    }}

    .section-title {{
        font-size: 1.3rem;
        font-weight: 700;
        color: {TEXT_DARK};
        margin-top: 0.5rem;
        margin-bottom: 0.6rem;
        border-left: 4px solid {ACCENT};
        padding-left: 10px;
    }}

    .result-card-high {{
        background: #FDEDEB;
        border: 1px solid {BAD};
        border-radius: 14px;
        padding: 1.4rem;
        color: #7A2119;
    }}
    .result-card-low {{
        background: #EAF8F1;
        border: 1px solid {GOOD};
        border-radius: 14px;
        padding: 1.4rem;
        color: #1F5C40;
    }}
    .result-card-high h2, .result-card-low h2 {{
        margin-top: 0;
    }}

    .stButton>button {{
        background-color: {PRIMARY};
        color: white;
        border-radius: 10px;
        font-weight: 600;
        border: none;
        padding: 0.6rem 1.2rem;
    }}
    .stButton>button:hover {{
        background-color: #0C4A44;
        color: white;
    }}

    .source-note {{
        font-size: 0.78rem;
        color: #7B958F;
        font-style: italic;
    }}
</style>
""", unsafe_allow_html=True)

# ---------------------------------------------------------
# Load model artifacts
# ---------------------------------------------------------
@st.cache_resource
def load_artifacts():
    model = joblib.load("diabetes_model.pkl")
    scaler = joblib.load("scaler.pkl")
    feature_names = joblib.load("feature_names.pkl")
    return model, scaler, feature_names

model, scaler, feature_names = load_artifacts()

# ---------------------------------------------------------
# Hero
# ---------------------------------------------------------
st.markdown(f"""
<div class="hero">
    <h1>🩺 GlucoSense — Diabetes Risk Predictor</h1>
    <p>A machine learning system trained on real clinical data that estimates diabetes
    risk from routine health measurements — built to demonstrate how AI can support
    early screening and preventive care.</p>
</div>
""", unsafe_allow_html=True)

# ---------------------------------------------------------
# Tabs
# ---------------------------------------------------------
tab1, tab2, tab3 = st.tabs(["🌍 Global Picture", "🔍 Predict Risk", "📊 How the Model Works"])

# ===========================================================
# TAB 1 — World data dashboard
# ===========================================================
with tab1:
    st.markdown('<div class="section-title">Diabetes, at a global scale</div>', unsafe_allow_html=True)

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(f"""<div class="metric-card"><div class="value">589M</div>
        <div class="label">Adults living with diabetes worldwide (2024)</div></div>""", unsafe_allow_html=True)
    with c2:
        st.markdown(f"""<div class="metric-card"><div class="value">1 in 9</div>
        <div class="label">Adults aged 20–79 affected globally</div></div>""", unsafe_allow_html=True)
    with c3:
        st.markdown(f"""<div class="metric-card"><div class="value">252M</div>
        <div class="label">Living with diabetes but undiagnosed</div></div>""", unsafe_allow_html=True)
    with c4:
        st.markdown(f"""<div class="metric-card"><div class="value">853M</div>
        <div class="label">Projected cases worldwide by 2050</div></div>""", unsafe_allow_html=True)

    st.write("")
    colA, colB = st.columns([1.3, 1])

    with colA:
        st.markdown('<div class="section-title">Cases by world region (millions)</div>', unsafe_allow_html=True)
        df_region = pd.DataFrame(REGION_DATA)
        fig = go.Figure()
        fig.add_trace(go.Bar(
            y=df_region["region"], x=df_region["adults_2024"],
            name="2024", orientation="h", marker_color=PRIMARY
        ))
        fig.add_trace(go.Bar(
            y=df_region["region"], x=df_region["adults_2050"],
            name="2050 (projected)", orientation="h", marker_color=ACCENT
        ))
        fig.update_layout(
            barmode="group", height=380, margin=dict(l=10, r=10, t=10, b=10),
            plot_bgcolor="white", paper_bgcolor="white",
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            xaxis_title="Adults with diabetes (millions)",
        )
        st.plotly_chart(fig, use_container_width=True)

    with colB:
        st.markdown('<div class="section-title">Global trend over time</div>', unsafe_allow_html=True)
        df_trend = pd.DataFrame(HISTORICAL_TREND)
        fig2 = px.area(df_trend, x="year", y="millions", markers=True)
        fig2.update_traces(line_color=PRIMARY, fillcolor="rgba(15,92,85,0.15)")
        fig2.update_layout(
            height=380, margin=dict(l=10, r=10, t=10, b=10),
            plot_bgcolor="white", paper_bgcolor="white",
            yaxis_title="People with diabetes (millions)", xaxis_title="Year",
        )
        st.plotly_chart(fig2, use_container_width=True)

    st.write("")
    colC, colD = st.columns([1, 1.3])

    with colC:
        st.markdown('<div class="section-title">Top countries by cases</div>', unsafe_allow_html=True)
        df_countries = pd.DataFrame(TOP_COUNTRIES).sort_values("adults_millions")
        fig3 = px.bar(df_countries, x="adults_millions", y="country", orientation="h",
                       color="adults_millions", color_continuous_scale=["#BFE3DB", PRIMARY])
        fig3.update_layout(
            height=320, margin=dict(l=10, r=10, t=10, b=10), showlegend=False,
            plot_bgcolor="white", paper_bgcolor="white", coloraxis_showscale=False,
            xaxis_title="Adults with diabetes (millions)", yaxis_title="",
        )
        st.plotly_chart(fig3, use_container_width=True)

    with colD:
        st.markdown('<div class="section-title">Why this matters</div>', unsafe_allow_html=True)
        st.markdown(f"""
- Diabetes caused an estimated **3.4 million deaths in 2024** — about one every 9 seconds.
- Global diabetes-related health spending topped **US $1.015 trillion** in 2024, up 338% in 17 years.
- **43% of adults with diabetes don't know they have it** — early screening tools like this one
  can help flag risk before complications develop.
- The **Western Pacific region** carries the largest share of cases (215M), while **Africa** is
  projected to see the steepest rise — 142% growth by 2050.
        """)
        st.markdown(f'<p class="source-note">{SOURCE_NOTE}</p>', unsafe_allow_html=True)

# ===========================================================
# TAB 2 — Prediction tool
# ===========================================================
with tab2:
    st.markdown('<div class="section-title">Try a sample profile, or enter your own values</div>', unsafe_allow_html=True)

    profile_choice = st.selectbox("Quick-load a demo profile", list(SAMPLE_PROFILES.keys()))
    preset = SAMPLE_PROFILES[profile_choice]

    def val(key, default):
        return preset[key] if preset else default

    st.write("")
    col1, col2 = st.columns(2)

    with col1:
        pregnancies = st.number_input("Pregnancies", min_value=0, max_value=20, value=val("Pregnancies", 1))
        glucose = st.number_input("Glucose Level (mg/dL)", min_value=0, max_value=300, value=val("Glucose", 110))
        blood_pressure = st.number_input("Blood Pressure (mm Hg)", min_value=0, max_value=200, value=val("BloodPressure", 70))
        skin_thickness = st.number_input("Skin Thickness (mm)", min_value=0, max_value=100, value=val("SkinThickness", 20))

    with col2:
        insulin = st.number_input("Insulin Level (mu U/ml)", min_value=0, max_value=900, value=val("Insulin", 80))
        bmi = st.number_input("BMI", min_value=0.0, max_value=70.0, value=float(val("BMI", 25.0)), step=0.1)
        dpf = st.number_input("Diabetes Pedigree Function", min_value=0.0, max_value=3.0, value=float(val("DiabetesPedigreeFunction", 0.5)), step=0.01)
        age = st.number_input("Age", min_value=1, max_value=120, value=val("Age", 30))

    st.write("")
    predict_clicked = st.button("🔍 Predict Diabetes Risk", use_container_width=True, type="primary")

    if predict_clicked:
        input_data = pd.DataFrame(
            [[pregnancies, glucose, blood_pressure, skin_thickness,
              insulin, bmi, dpf, age]],
            columns=feature_names
        )
        input_scaled = scaler.transform(input_data)
        prediction = model.predict(input_scaled)[0]
        probability = model.predict_proba(input_scaled)[0][1]

        st.write("")
        result_col, gauge_col = st.columns([1.1, 1])

        with result_col:
            if prediction == 1:
                st.markdown(f"""
                <div class="result-card-high">
                    <h2>⚠️ High Risk</h2>
                    <p>Estimated probability of diabetes: <b>{probability*100:.1f}%</b></p>
                    <p>This profile shows patterns similar to diagnosed cases in the training data.
                    In a real setting, this would be a prompt to consult a healthcare provider
                    for proper testing (e.g. fasting glucose or HbA1c).</p>
                </div>""", unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div class="result-card-low">
                    <h2>✅ Low Risk</h2>
                    <p>Estimated probability of diabetes: <b>{probability*100:.1f}%</b></p>
                    <p>This profile shows patterns similar to non-diabetic cases in the training data.
                    Maintaining a balanced diet, regular activity, and routine checkups helps keep it that way.</p>
                </div>""", unsafe_allow_html=True)

        with gauge_col:
            fig_gauge = go.Figure(go.Indicator(
                mode="gauge+number",
                value=probability * 100,
                number={'suffix': "%"},
                gauge={
                    'axis': {'range': [0, 100]},
                    'bar': {'color': BAD if prediction == 1 else GOOD},
                    'steps': [
                        {'range': [0, 33], 'color': "#EAF8F1"},
                        {'range': [33, 66], 'color': "#FDF3E3"},
                        {'range': [66, 100], 'color': "#FDEDEB"},
                    ],
                },
                title={'text': "Risk Probability"}
            ))
            fig_gauge.update_layout(height=260, margin=dict(l=20, r=20, t=40, b=10))
            st.plotly_chart(fig_gauge, use_container_width=True)

        st.markdown('<div class="section-title">What influenced this prediction?</div>', unsafe_allow_html=True)
        importances = model.feature_importances_
        imp_df = pd.DataFrame({"Feature": feature_names, "Importance": importances}).sort_values("Importance")
        fig_imp = px.bar(imp_df, x="Importance", y="Feature", orientation="h", color="Importance",
                          color_continuous_scale=["#BFE3DB", PRIMARY])
        fig_imp.update_layout(height=320, margin=dict(l=10, r=10, t=10, b=10), showlegend=False,
                               coloraxis_showscale=False, plot_bgcolor="white", paper_bgcolor="white")
        st.plotly_chart(fig_imp, use_container_width=True)
        st.caption("Feature importance reflects what the model relies on most heavily across all "
                   "predictions, not just this one.")

    st.info("⚠️ Educational/demo project only — not a certified medical diagnostic tool.")

# ===========================================================
# TAB 3 — Model details
# ===========================================================
with tab3:
    st.markdown('<div class="section-title">Model performance</div>', unsafe_allow_html=True)
    m1, m2, m3, m4 = st.columns(4)
    for col, label, value in zip(
        [m1, m2, m3, m4],
        ["Accuracy", "Precision", "Recall", "ROC-AUC"],
        ["73.4%", "65.1%", "51.9%", "0.81"]
    ):
        with col:
            st.markdown(f"""<div class="metric-card"><div class="value">{value}</div>
            <div class="label">{label}</div></div>""", unsafe_allow_html=True)

    st.write("")
    st.markdown('<div class="section-title">Pipeline overview</div>', unsafe_allow_html=True)
    st.markdown("""
1. **Dataset** — Pima Indians Diabetes Dataset (768 patient records, 8 clinical features).
2. **Cleaning** — biologically impossible zero values (e.g. BMI = 0) replaced with median imputation.
3. **Scaling** — all features standardized with `StandardScaler`.
4. **Model comparison** — Logistic Regression vs Random Forest, evaluated on a held-out 20% test set.
5. **Selection** — Random Forest chosen for best F1-score and ability to capture non-linear patterns.
6. **Explainability** — feature importances surfaced for every prediction, so results aren't a black box.
    """)

    st.markdown('<div class="section-title">Features used</div>', unsafe_allow_html=True)
    feat_desc = pd.DataFrame({
        "Feature": feature_names,
        "Description": [
            "Number of times pregnant",
            "Plasma glucose concentration (2-hr oral glucose tolerance test)",
            "Diastolic blood pressure (mm Hg)",
            "Triceps skin fold thickness (mm)",
            "2-Hour serum insulin (mu U/ml)",
            "Body Mass Index (weight in kg / height in m²)",
            "A function scoring diabetes likelihood based on family history",
            "Age in years",
        ]
    })
    st.dataframe(feat_desc, use_container_width=True, hide_index=True)

st.write("")
st.markdown('<p class="source-note">Built with scikit-learn + Streamlit | Model: Random Forest | '
            'Dataset: Pima Indians Diabetes Dataset (UCI)</p>', unsafe_allow_html=True)
