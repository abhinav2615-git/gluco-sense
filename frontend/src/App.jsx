
import React, { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const FEATURES = [
  { key: "Pregnancies", label: "Pregnancies", min: 0, max: 20, step: 1, unit: "count" },
  { key: "Glucose", label: "Glucose", min: 1, max: 300, step: 1, unit: "mg/dL" },
  { key: "BloodPressure", label: "Blood Pressure", min: 1, max: 200, step: 1, unit: "mmHg" },
  { key: "SkinThickness", label: "Skin Thickness", min: 0, max: 100, step: 1, unit: "mm" },
  { key: "Insulin", label: "Insulin", min: 0, max: 1000, step: 1, unit: "mu U/ml" },
  { key: "BMI", label: "BMI", min: 0.1, max: 100, step: 0.1, unit: "kg/m²" },
  { key: "DiabetesPedigreeFunction", label: "Diabetes Pedigree Function", min: 0, max: 3, step: 0.01, unit: "score" },
  { key: "Age", label: "Age", min: 18, max: 120, step: 1, unit: "years" },
];

const INITIAL_PATIENT = {
  Pregnancies: "2",
  Glucose: "130",
  BloodPressure: "70",
  SkinThickness: "25",
  Insulin: "100",
  BMI: "28.5",
  DiabetesPedigreeFunction: "0.5",
  Age: "35",
};

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function percent(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `${(value <= 1 ? value * 100 : value).toFixed(2)}%`;
}

function metricValue(data, names) {
  for (const name of names) {
    const value = data?.[name];
    if (typeof value === "number") return value;
  }
  return null;
}

function normalizeMetrics(data) {
  const root = data?.metrics || data?.performance || data || {};
  const test = root?.held_out_test_performance || root?.test_metrics || root?.test || root;

  return {
    accuracy: metricValue(test, ["accuracy", "Accuracy"]),
    precision: metricValue(test, ["precision", "Precision"]),
    recall: metricValue(test, ["recall", "Recall"]),
    f1: metricValue(test, ["f1", "f1_score", "f1-score"]),
    rocAuc: metricValue(test, ["roc_auc", "rocAuc", "auc", "ROC-AUC"]),
    model: firstDefined(data?.selected_model, data?.model_name, data?.model, root?.selected_model),
    matrix: firstDefined(
      data?.confusion_matrix,
      test?.confusion_matrix,
      root?.confusion_matrix
    ),
  };
}

function Icon({ children }) {
  return <span className="icon">{children}</span>;
}

function MetricCard({ label, value, description, icon }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <Icon>{icon}</Icon>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-description">{description}</div>
    </div>
  );
}

function Sidebar({ page, setPage, connected }) {
  const items = [
    ["overview", "Overview", "▦"],
    ["assessment", "Patient Assessment", "▤"],
    ["risk", "Risk Analysis", "⌁"],
    ["intelligence", "Model Intelligence", "♧"],
    ["about", "About GlucoSense", "ⓘ"],
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">∿</div>
        <div>
          <div className="brand-name">GlucoSense</div>
          <div className="brand-subtitle">INTELLIGENT HEALTH AI</div>
        </div>
      </div>

      <div className="sidebar-label">WORKSPACE</div>

      <nav>
        {items.map(([id, label, symbol]) => (
          <button
            key={id}
            className={`nav-item ${page === id ? "active" : ""}`}
            onClick={() => setPage(id)}
          >
            <span className="nav-symbol">{symbol}</span>
            {label}
            {page === id && <span className="nav-arrow">›</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="connection">
          <span className={`status-dot ${connected ? "online" : ""}`} />
          <div>
            <strong>API connection</strong>
            <small>{connected ? "Connected" : "Disconnected"}</small>
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="footer-icon">♡</div>
          <div>
            <strong>GlucoSense 2.0</strong>
            <small>Academic ML Project</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Overview({ metrics, modelInfo, loading, onRefresh, setPage }) {
  const models = firstDefined(
    modelInfo?.cross_validation,
    modelInfo?.model_comparison,
    modelInfo?.models,
    modelInfo?.comparison,
    []
  );

  const matrix = metrics.matrix;

  const matrixRows = Array.isArray(matrix) && matrix.length === 2
    ? matrix
    : null;

  return (
    <>
      <div className="hero">
        <div>
          <div className="eyebrow">✧ INTELLIGENT HEALTH ANALYTICS</div>
          <h1>Welcome to GlucoSense</h1>
          <p>
            Explore diabetes-related data, assess patient profiles and
            understand machine learning predictions through explainable AI.
          </p>
          <button className="hero-button" onClick={() => setPage("assessment")}>
            Start Patient Assessment <span>↗</span>
          </button>
        </div>
        <div className="hero-art">
          <div className="hero-circle">
            <span>♡</span>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>Model Performance Overview</h2>
          <p>Metrics from the held-out test dataset</p>
        </div>
        <button className="refresh-button" onClick={onRefresh}>
          ↻ Refresh
        </button>
      </div>

      {loading && <p className="muted">Loading model information...</p>}

      <div className="metrics-grid">
        <MetricCard label="Accuracy" value={percent(metrics.accuracy)} description="Held-out test set" icon="∿" />
        <MetricCard label="Precision" value={percent(metrics.precision)} description="Positive prediction precision" icon="♢" />
        <MetricCard label="Recall" value={percent(metrics.recall)} description="Positive cases identified" icon="♡" />
        <MetricCard label="ROC-AUC" value={metrics.rocAuc == null ? "—" : metrics.rocAuc.toFixed(3)} description="Discrimination metric" icon="♧" />
      </div>

      <div className="two-columns">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Model comparison</h3>
              <p>Cross-validation performance</p>
            </div>
            <Icon>♧</Icon>
          </div>

          {Array.isArray(models) && models.length > 0 ? (
            <div className="model-list">
              {models.map((item, index) => (
                <div className="model-row" key={index}>
                  <strong>{item.name || item.model || item.model_name || `Model ${index + 1}`}</strong>
                  <span>{percent(item.f1)}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.min(100, (item.f1 || 0) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>ⓘ</span>
              <p>Model comparison data unavailable.</p>
              <small>Check the model-info API response.</small>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Confusion matrix</h3>
              <p>Held-out test predictions</p>
            </div>
            <Icon>∿</Icon>
          </div>

          {matrixRows ? (
            <div className="matrix">
              <div className="matrix-label">Actual ↓ / Predicted →</div>
              <div className="matrix-grid">
                {matrixRows.flat().map((value, index) => (
                  <div className="matrix-cell" key={index}>
                    <strong>{value}</strong>
                    <small>{["True Negative", "False Positive", "False Negative", "True Positive"][index]}</small>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <span>ⓘ</span>
              <p>No confusion matrix available.</p>
              <small>Waiting for backend data.</small>
            </div>
          )}
        </div>
      </div>

      <div className="model-summary">
        <span className="summary-icon">✧</span>
        <div>
          <strong>Selected model: {metrics.model || "Model information unavailable"}</strong>
          <p>Performance values are retrieved from the backend, not estimated by the frontend.</p>
        </div>
      </div>
    </>
  );
}

function Assessment({ patient, setPatient, threshold, setThreshold, onSubmit, submitting, error }) {
  const update = (key, value) => {
    setPatient((previous) => ({ ...previous, [key]: value }));
  };

  return (
    <div className="page-content">
      <div className="page-intro">
        <div className="eyebrow">PATIENT WORKSPACE</div>
        <h1>Patient Assessment</h1>
        <p>Enter clinical measurements to generate a machine learning risk assessment.</p>
      </div>

      <form className="assessment-panel" onSubmit={onSubmit}>
        <div className="form-heading">
          <div>
            <h2>Patient health measurements</h2>
            <p>All eight input features are required by the trained model.</p>
          </div>
          <span className="form-badge">8 FEATURES</span>
        </div>

        <div className="form-grid">
          {FEATURES.map((field) => (
            <label className="field" key={field.key}>
              <span>{field.label}</span>
              <div className="input-wrap">
                <input
                  type="number"
                  required
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={patient[field.key]}
                  onChange={(event) => update(field.key, event.target.value)}
                />
                <small>{field.unit}</small>
              </div>
            </label>
          ))}
        </div>

        <div className="threshold-section">
          <label htmlFor="threshold">Classification threshold</label>
          <div className="threshold-control">
            <input
              id="threshold"
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
            />
            <strong>{threshold.toFixed(2)}</strong>
          </div>
          <small>Adjusts the probability threshold used for classification.</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => setPatient(INITIAL_PATIENT)}
          >
            Reset values
          </button>
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? "Generating assessment..." : "Generate Assessment →"}
          </button>
        </div>
      </form>

      <div className="disclaimer">
        <strong>Important:</strong> GlucoSense is an academic screening
        demonstration and must not be used as a substitute for professional
        medical diagnosis.
      </div>
    </div>
  );
}

function RiskAnalysis({ result, setPage }) {
  if (!result) {
    return (
      <div className="page-content">
        <div className="page-intro">
          <div className="eyebrow">PATIENT WORKSPACE</div>
          <h1>Risk Analysis</h1>
          <p>No prediction has been generated yet.</p>
        </div>
        <div className="panel empty-state">
          <span>ⓘ</span>
          <p>Complete a Patient Assessment to view results.</p>
          <button className="primary-button" onClick={() => setPage("assessment")}>
            Start assessment
          </button>
        </div>
      </div>
    );
  }

  // The backend returns model_score as the positive-class probability.
  const probability = firstDefined(
    result.model_score,
    result.probability,
    result.risk_probability,
    result.diabetes_probability,
    result.positive_probability,
    result.prediction_probability
  );

  const prediction = firstDefined(
    result.prediction,
    result.predicted_class,
    result.diabetes_prediction,
    result.classification
  );

  const positive =
    prediction === 1 ||
    prediction === "1" ||
    prediction === true ||
    prediction === "positive" ||
    prediction === "Diabetic";

  // The API response nests SHAP values inside explanation.contributions.
  const explanation = result.explanation || {};
  const contributions = Array.isArray(explanation.contributions)
    ? explanation.contributions
    : Array.isArray(result.shap_values)
      ? result.shap_values
      : Array.isArray(result.feature_contributions)
        ? result.feature_contributions
        : Array.isArray(result.contributions)
          ? result.contributions
          : [];

  // Keep a deterministic order (backend feature order) so each waterfall step
  // starts where the previous step ended. Sorting by magnitude would break that story.
  const waterfallItems = contributions.map((item, index) => ({
    name: item.feature || item.name || `Feature ${index + 1}`,
    value: Number(item.value ?? item.contribution ?? 0),
  })).filter((item) => Number.isFinite(item.value));
  const baseValue = typeof explanation.base_value === "number" ? explanation.base_value : null;
  const waterfallSteps = waterfallItems.reduce((steps, item) => {
    const start = steps.length ? steps[steps.length - 1].end : baseValue;
    const end = start === null ? null : start + item.value;
    return [...steps, { ...item, start, end }];
  }, []);
  const contributionTotal = waterfallItems.reduce((sum, item) => sum + item.value, 0);
  const reconstructedOutput = baseValue === null ? null : baseValue + contributionTotal;
  const outputLabel = String(explanation.explained_output || "").toLowerCase();
  const probabilityScale = baseValue !== null && baseValue >= 0 && baseValue <= 1 &&
    (outputLabel.includes("probab") || outputLabel.includes("positive") || outputLabel.includes("class"));
  const reconciliationDiff = typeof probability === "number" && probabilityScale && reconstructedOutput !== null
    ? Math.abs(reconstructedOutput - probability)
    : null;
  const reconciliationMatches = reconciliationDiff !== null && reconciliationDiff <= 0.02;
  const chartValues = [baseValue, ...waterfallSteps.map((step) => step.end)].filter((v) => typeof v === "number" && Number.isFinite(v));
  const chartMin = chartValues.length ? Math.min(0, ...chartValues) : 0;
  const chartMax = chartValues.length ? Math.max(1, ...chartValues) : 1;
  const chartSpan = Math.max(chartMax - chartMin, 0.0001);
  const chartPosition = (value) => `${((value - chartMin) / chartSpan) * 100}%`;
  const explanationMethod = explanation.explanation_method || "Not available";
  const explainedOutput = explanation.explained_output || "Not available";
  const modelName = result.model_name || result.model || "Unknown model";
  const threshold = result.threshold ?? 0.5;

  return (
    <div className="page-content">
      <div className="page-intro">
        <div className="eyebrow">ASSESSMENT RESULTS</div>
        <h1>Risk Analysis</h1>
        <p>Prediction generated by the connected machine learning model.</p>
      </div>

      <div className={`result-banner ${positive ? "high-risk" : "low-risk"}`}>
        <div>
          <span className="result-label">MODEL CLASSIFICATION</span>
          <h2>{positive ? "Higher predicted risk" : "Lower predicted risk"}</h2>
          <p>This is a model classification, not a medical diagnosis.</p>
        </div>
        <div className="result-symbol">{positive ? "!" : "✓"}</div>
      </div>

      <div className="metrics-grid result-grid">
        <MetricCard
          label="Predicted class"
          value={String(prediction ?? "—")}
          description="Model output"
          icon="∿"
        />
        <MetricCard
          label="Probability"
          value={typeof probability === "number" ? percent(probability) : "—"}
          description="Positive class probability"
          icon="%"
        />
        <MetricCard
          label="Threshold"
          value={threshold}
          description="Classification cutoff"
          icon="⌁"
        />
        <MetricCard
          label="Model"
          value={modelName}
          description="Prediction model"
          icon="♧"
        />
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h3>SHAP Feature Contributions</h3>
            <p>Individual feature contributions returned by the backend</p>
          </div>
          <Icon>♧</Icon>
        </div>

        <div className="shap-summary">
          <div className="shap-meta">
            <span>BASE VALUE</span>
            <strong>
              {typeof baseValue === "number" ? baseValue.toFixed(4) : "—"}
            </strong>
          </div>
          <div className="shap-meta">
            <span>MODEL SCORE</span>
            <strong>
              {typeof probability === "number" ? probability.toFixed(4) : "—"}
            </strong>
          </div>
          <div className="shap-meta">
            <span>EXPLANATION METHOD</span>
            <strong>{explanationMethod}</strong>
          </div>
        </div>

        <div className="shap-legend">
          <span><i className="legend-positive" />Pushes model output higher</span>
          <span><i className="legend-negative" />Pushes model output lower</span>
        </div>

        {waterfallSteps.length > 0 && baseValue !== null ? (
          <div className="waterfall-chart">
            <div className="waterfall-axis-labels"><span>Baseline → cumulative model output</span><span>{explainedOutput}</span></div>
            <div className="waterfall-start-row">
              <strong>Baseline</strong>
              <div className="waterfall-track"><span className="waterfall-marker" style={{ left: chartPosition(baseValue) }} /></div>
              <b>{baseValue.toFixed(4)}</b>
            </div>
            {waterfallSteps.map((step, index) => {
              const leftValue = Math.min(step.start, step.end);
              const widthValue = Math.max(Math.abs(step.end - step.start), chartSpan * 0.003);
              return (
                <div className="waterfall-row" key={`${step.name}-${index}`}>
                  <strong title={step.name}>{step.name}</strong>
                  <div className="waterfall-track">
                    <span className={`waterfall-bar ${step.value >= 0 ? "positive" : "negative"}`}
                      style={{ left: chartPosition(leftValue), width: `${(widthValue / chartSpan) * 100}%` }} />
                    <span className="waterfall-marker" style={{ left: chartPosition(step.end) }} />
                  </div>
                  <b className={step.value >= 0 ? "shap-positive-text" : "shap-negative-text"}>
                    {step.value >= 0 ? "+" : ""}{step.value.toFixed(4)}
                  </b>
                </div>
              );
            })}
            <div className="waterfall-end-row">
              <strong>Reconstructed output</strong>
              <div className="waterfall-track"><span className="waterfall-marker final" style={{ left: chartPosition(reconstructedOutput) }} /></div>
              <b>{reconstructedOutput.toFixed(4)}</b>
            </div>
            {typeof probability === "number" && probabilityScale && (
              <div className={`reconciliation-note ${reconciliationMatches ? "match" : "mismatch"}`}>
                {reconciliationMatches
                  ? `Reconciles with predicted probability (${probability.toFixed(4)}).`
                  : `Reconstructed output differs from predicted probability (${probability.toFixed(4)}). Difference: ${reconciliationDiff.toFixed(4)}. Check that the backend base value and SHAP values use probability output.`}
              </div>
            )}
            <p className="waterfall-note">Each step adds one feature's SHAP value to the running total. The final value is reconstructed from the baseline and contributions.</p>
          </div>
        ) : (
          <div className="empty-state">
            <span>ⓘ</span>
            <p>{waterfallSteps.length ? "A numeric SHAP base value is required to build the waterfall." : "No SHAP contribution data was returned."}</p>
            <small>Check the backend explanation response.</small>
          </div>
        )}

        <div className="shap-footer">
          <strong>Explanation details</strong>
          <p>Method: {explanationMethod}</p>
          <p>Output: {explainedOutput}</p>
          <p>
            Positive SHAP values move the explained model output upward; negative values move it downward. This chart explains the model output and is not a clinical diagnosis.
          </p>
        </div>
      </div>

      <div className="form-actions">
        <button className="secondary-button" onClick={() => setPage("assessment")}>
          New assessment
        </button>
        <button className="primary-button" onClick={() => setPage("intelligence")}>
          Explore model intelligence →
        </button>
      </div>
    </div>
  );
}

function Intelligence({ modelInfo, metrics }) {
  const test = modelInfo?.test_metrics || {};
  const models = Array.isArray(modelInfo?.cross_validation) ? modelInfo.cross_validation : [];
  const features = Array.isArray(modelInfo?.features) ? modelInfo.features : [];
  const matrix = Array.isArray(test?.confusion_matrix) ? test.confusion_matrix : metrics.matrix;
  const matrixCells = Array.isArray(matrix) && matrix.length === 2 && matrix.every((row) => Array.isArray(row) && row.length === 2)
    ? matrix.flat()
    : null;
  const selectedModel = modelInfo?.model_name || metrics.model || "Not available";
  const testSamples = test?.test_samples;
  const positiveSamples = test?.positive_samples;
  const negativeSamples = test?.negative_samples;

  return (
    <div className="page-content">
      <div className="page-intro">
        <div className="eyebrow">EXPLAINABLE ARTIFICIAL INTELLIGENCE</div>
        <h1>Model Intelligence</h1>
        <p>Understand how GlucoSense uses machine learning to analyze health measurements.</p>
      </div>

      <div className="metrics-grid">
        <MetricCard label="Accuracy" value={percent(metrics.accuracy)} description="Held-out test performance" icon="∿" />
        <MetricCard label="Precision" value={percent(metrics.precision)} description="Positive prediction precision" icon="♢" />
        <MetricCard label="Recall" value={percent(metrics.recall)} description="Positive cases identified" icon="♡" />
        <MetricCard label="F1 Score" value={percent(metrics.f1)} description="Harmonic mean of precision and recall" icon="♧" />
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h3>Cross-validation model comparison</h3>
            <p>Mean F1 score across the training-set folds</p>
          </div>
          <Icon>♧</Icon>
        </div>
        {models.length ? (
          <div className="intel-model-list">
            {models.map((item, index) => {
              const score = typeof item.f1 === "number" ? item.f1 : null;
              const isSelected = (item.model || item.name) === selectedModel;
              return (
                <div className="intel-model-row" key={item.model || item.name || index}>
                  <div className="intel-model-heading">
                    <strong>{item.model || item.name || `Model ${index + 1}`}</strong>
                    <span>{score == null ? "—" : percent(score)}</span>
                  </div>
                  <div className="intel-bar-track">
                    <div className="intel-bar-fill" style={{ width: `${score == null ? 0 : Math.max(0, Math.min(100, score * 100))}%` }} />
                  </div>
                  <div className="intel-model-foot">
                    <span>{isSelected ? "Selected model" : "Cross-validation result"}</span>
                    {typeof item.roc_auc === "number" && <span>ROC-AUC {item.roc_auc.toFixed(3)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state"><span>ⓘ</span><p>Cross-validation results are not available.</p></div>
        )}
      </div>

      <div className="two-columns">
        <div className="panel">
          <div className="panel-heading">
            <div><h3>Held-out test confusion matrix</h3><p>Actual vs. predicted class counts</p></div>
            <Icon>∿</Icon>
          </div>
          {matrixCells ? (
            <div className="matrix">
              <div className="matrix-label">Actual ↓ / Predicted →</div>
              <div className="matrix-grid">
                {matrixCells.map((value, index) => (
                  <div className="matrix-cell" key={index}>
                    <strong>{value}</strong>
                    <small>{["True Negative", "False Positive", "False Negative", "True Positive"][index]}</small>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="empty-state"><span>ⓘ</span><p>Confusion matrix is not available.</p></div>}
        </div>

        <div className="panel">
          <h3>Evaluation dataset</h3>
          <p className="intel-panel-subtitle">Held-out test split used for final evaluation</p>
          <div className="intel-stat-grid">
            <div className="intel-stat"><span>Selected model</span><strong>{selectedModel}</strong></div>
            <div className="intel-stat"><span>Test samples</span><strong>{Number.isFinite(testSamples) ? testSamples : "—"}</strong></div>
            <div className="intel-stat"><span>Positive samples</span><strong>{Number.isFinite(positiveSamples) ? positiveSamples : "—"}</strong></div>
            <div className="intel-stat"><span>Negative samples</span><strong>{Number.isFinite(negativeSamples) ? negativeSamples : "—"}</strong></div>
            <div className="intel-stat"><span>ROC-AUC</span><strong>{typeof test.roc_auc === "number" ? test.roc_auc.toFixed(3) : "—"}</strong></div>
            <div className="intel-stat"><span>Input features</span><strong>{features.length || "—"}</strong></div>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Model input features</h3>
        <p className="intel-panel-subtitle">The eight measurements expected by the trained model</p>
        {features.length ? (
          <div className="intel-feature-list">
            {features.map((feature, index) => <span className="intel-feature-chip" key={feature}>{String(index + 1).padStart(2, "0")} · {feature}</span>)}
          </div>
        ) : <div className="empty-state"><p>Feature information is not available.</p></div>}
      </div>

      <div className="panel">
        <h3>Machine learning methodology</h3>
        <div className="method-grid">
          {[
            ["01", "Data preprocessing", "Prepare patient measurements and align feature names."],
            ["02", "Model training", "Train and evaluate classification algorithms."],
            ["03", "Model selection", "Select the model based on cross-validation F1 score."],
            ["04", "Prediction", "Generate a classification using patient measurements."],
            ["05", "SHAP explainability", "Analyze feature contributions to model output."],
          ].map(([number, title, description]) => (
            <div className="method-card" key={number}>
              <span>{number}</span><strong>{title}</strong><p>{description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="intelligence-note">
        <strong>How to interpret these results</strong>
        <p>Cross-validation scores compare candidate models during training. Held-out test metrics and the confusion matrix evaluate the selected model on data kept separate from training. These results describe this dataset and do not establish clinical validity.</p>
      </div>
    </div>
  );
}

function About() {
  const technologies = [
    ["React", "Builds the interactive patient assessment and dashboard interface."],
    ["Python", "Powers the backend and machine-learning workflow."],
    ["FastAPI", "Exposes API endpoints used by the frontend."],
    ["Scikit-learn", "Provides the classification models and evaluation workflow."],
    ["SHAP", "Explains how input features contribute to an individual model output."],
  ];

  const features = [
    "Pregnancies", "Glucose", "Blood pressure", "Skin thickness",
    "Insulin", "BMI", "Diabetes pedigree function", "Age",
  ];

  const architecture = [
    ["01", "React frontend", "Collects measurements and presents assessment results."],
    ["02", "FastAPI backend", "Receives the assessment request and connects the interface to the model."],
    ["03", "ML classifier", "Returns a predicted class and positive-class probability."],
    ["04", "SHAP explanation", "Provides feature contributions to help interpret the prediction."],
  ];

  const workflow = [
    ["Input", "The user enters eight patient measurements."],
    ["Request", "The frontend sends the values to the prediction API."],
    ["Prediction", "The trained classifier produces a class and probability."],
    ["Explanation", "SHAP feature contributions describe the model output."],
    ["Review", "The interface displays the result with a screening disclaimer."],
  ];

  return (
    <div className="page-content">
      <div className="page-intro">
        <div className="eyebrow">ABOUT THE PROJECT</div>
        <h1>About GlucoSense</h1>
        <p>An academic machine-learning application for diabetes-related risk screening and model explainability.</p>
      </div>

      <div className="hero about-hero">
        <div>
          <div className="eyebrow">INTELLIGENT HEALTH ANALYTICS</div>
          <h1>Machine Learning for Preventive Screening</h1>
          <p>
            GlucoSense brings together a structured patient assessment interface,
            a machine-learning classification backend and SHAP-based explanations.
            It demonstrates how model predictions can be presented in an
            understandable way for an academic screening use case.
          </p>
        </div>
        <div className="hero-art">
          <div className="hero-circle"><span>♡</span></div>
        </div>
      </div>

      <div className="about-section-grid">
        <section className="panel about-info-card">
          <div className="about-section-kicker">01 / THE CHALLENGE</div>
          <h3>Problem statement</h3>
          <p>
            Interpreting multiple health measurements together can be difficult
            without a structured way to assess them. This project explores how
            a machine-learning classifier can use a defined set of measurements
            to produce a consistent screening output.
          </p>
        </section>
        <section className="panel about-info-card">
          <div className="about-section-kicker">02 / THE APPROACH</div>
          <h3>Proposed solution</h3>
          <p>
            GlucoSense accepts patient measurements through a web form, sends
            them to a Python API and displays the model's predicted class,
            probability and feature-level explanation in a single interface.
          </p>
        </section>
      </div>

      <section className="panel about-wide-panel">
        <div className="about-section-kicker">03 / SYSTEM DESIGN</div>
        <h3>System architecture</h3>
        <p className="about-section-description">
          The application is organized as a frontend-to-backend prediction flow.
        </p>
        <div className="architecture-flow">
          {architecture.map(([number, title, description], index) => (
            <React.Fragment key={number}>
              <div className="architecture-step">
                <span>{number}</span>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
              {index < architecture.length - 1 && <div className="architecture-arrow">→</div>}
            </React.Fragment>
          ))}
        </div>
        <p className="about-footnote">
          The frontend communicates with the backend through API requests. This
          architecture description does not imply a database or cloud deployment.
        </p>
      </section>

      <div className="two-columns about-detail-columns">
        <section className="panel">
          <div className="about-section-kicker">04 / IMPLEMENTATION</div>
          <h3>Technology stack</h3>
          <div className="about-tech-list">
            {technologies.map(([name, role]) => (
              <div className="about-tech-item" key={name}>
                <span className="about-check">✓</span>
                <div><strong>{name}</strong><p>{role}</p></div>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="about-section-kicker">05 / MODEL INPUTS</div>
          <h3>Eight patient features</h3>
          <p className="about-section-description">
            These are the eight measurements currently requested by the assessment form.
          </p>
          <div className="feature-chip-grid">
            {features.map((feature) => <span className="feature-chip" key={feature}>{feature}</span>)}
          </div>
        </section>
      </div>

      <section className="panel about-wide-panel">
        <div className="about-section-kicker">06 / HOW IT WORKS</div>
        <h3>Prediction workflow</h3>
        <div className="about-workflow-grid">
          {workflow.map(([title, description], index) => (
            <div className="about-workflow-step" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="two-columns about-detail-columns">
        <section className="panel">
          <div className="about-section-kicker">PROJECT GOALS</div>
          <h3>Project objectives</h3>
          <ul className="objective-list">
            <li>Demonstrate a machine-learning classification workflow.</li>
            <li>Provide a structured interface for eight input features.</li>
            <li>Present prediction probabilities and classification results.</li>
            <li>Use SHAP feature contributions to improve model interpretability.</li>
            <li>Show frontend and backend integration.</li>
          </ul>
        </section>
        <section className="panel">
          <div className="about-section-kicker">SCOPE & NEXT STEPS</div>
          <h3>Limitations and future scope</h3>
          <p>
            The current application is an academic demonstration. Its output
            depends on the trained model and the data used to develop and
            evaluate it; it is not a clinical diagnosis or treatment recommendation.
          </p>
          <ul className="objective-list">
            <li>Evaluate the model on broader and independently sourced datasets.</li>
            <li>Strengthen validation, calibration and fairness analysis.</li>
            <li>Consider secure, consent-based assessment history if persistence is added.</li>
            <li>Conduct clinical validation before any real-world healthcare use.</li>
          </ul>
        </section>
      </div>

      <div className="disclaimer">
        <strong>Academic-use notice:</strong> GlucoSense is a student project
        demonstrating machine-learning screening concepts. It is not clinically
        validated and must not be used to diagnose, treat or make healthcare decisions.
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("overview");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modelInfo, setModelInfo] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [patient, setPatient] = useState(INITIAL_PATIENT);
  const [threshold, setThreshold] = useState(0.5);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchModelInfo = async () => {
    try {
      const response = await fetch(`${API}/api/model-info`);
      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();
      setModelInfo(data);
      setMetrics(normalizeMetrics(data));
      setConnected(true);
    } catch (err) {
      console.error("Model information error:", err);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchModelInfo());
  }, []);

  const submitAssessment = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setResult(null);

    const patientData = {};

    for (const field of FEATURES) {
      const value = Number(patient[field.key]);

      if (patient[field.key] === "" || !Number.isFinite(value)) {
        setError(`Please enter a valid value for ${field.label}.`);
        return;
      }

      if (value < field.min || value > field.max) {
        setError(`${field.label} must be between ${field.min} and ${field.max}.`);
        return;
      }

      patientData[field.key] = value;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient: patientData,
          threshold,
          include_explanation: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Prediction request failed.");
      }

      setResult(data);
      setPage("risk");
    } catch (err) {
      console.error("Prediction error:", err);

      const message = String(err?.message || "");
      const isConnectionError =
        err instanceof TypeError ||
        /failed to fetch|networkerror|load failed|fetch failed/i.test(message);

      setError(
        isConnectionError
          ? "Unable to connect to the GlucoSense server. Please make sure the backend is running, then try again."
          : message || "Unable to generate the assessment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const pageTitles = {
    overview: "Overview",
    assessment: "Patient Assessment",
    risk: "Risk Analysis",
    intelligence: "Model Intelligence",
    about: "About GlucoSense",
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #183244; background: #f3f7f8; }
        button, input { font: inherit; }
        button { cursor: pointer; }
        .app-shell { min-height: 100vh; }
        .sidebar { position: fixed; inset: 0 auto 0 0; width: 268px; background: #142f42; color: #dce8ed; display: flex; flex-direction: column; padding: 28px 18px; z-index: 5; }
        .brand { display: flex; align-items: center; gap: 13px; padding: 4px 8px 38px; }
        .brand-icon { width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center; background: #08796c; color: #9af1db; font-size: 30px; }
        .brand-name { font-size: 19px; font-weight: 800; color: white; }
        .brand-subtitle { font-size: 9px; letter-spacing: 2px; margin-top: 6px; color: #9bb1bb; }
        .sidebar-label { font-size: 10px; letter-spacing: 2px; color: #819ba7; font-weight: 800; padding: 0 12px 15px; }
        .sidebar nav { display: grid; gap: 7px; }
        .nav-item { border: 0; color: #bdccd3; background: transparent; padding: 14px 12px; border-radius: 10px; display: flex; align-items: center; gap: 13px; text-align: left; font-size: 13px; font-weight: 600; }
        .nav-item:hover, .nav-item.active { background: #214b58; color: white; }
        .nav-item.active { border-left: 3px solid #55d7b4; }
        .nav-symbol { font-size: 20px; width: 20px; text-align: center; }
        .nav-arrow { margin-left: auto; font-size: 22px; }
        .sidebar-bottom { margin-top: auto; }
        .connection { background: #203f51; padding: 16px 12px; border-radius: 11px; display: flex; align-items: center; gap: 12px; margin-bottom: 20px; font-size: 12px; }
        .connection strong, .connection small, .sidebar-footer strong, .sidebar-footer small { display: block; }
        .connection small, .sidebar-footer small { color: #9db2bc; margin-top: 5px; }
        .status-dot { width: 9px; height: 9px; background: #e9a04f; border-radius: 50%; flex-shrink: 0; }
        .status-dot.online { background: #36d5a2; box-shadow: 0 0 8px #36d5a2; }
        .sidebar-footer { border-top: 1px solid #315063; padding: 18px 5px 0; display: flex; gap: 12px; align-items: center; font-size: 12px; }
        .footer-icon { width: 37px; height: 37px; border-radius: 10px; background: #08796c; color: #a6f0d9; display: grid; place-items: center; font-size: 24px; }
        .main-area { margin-left: 268px; min-height: 100vh; }
        .topbar { height: 86px; background: white; border-bottom: 1px solid #e4ebed; display: flex; justify-content: space-between; align-items: center; padding: 0 38px; }
        .breadcrumb { font-size: 11px; color: #8095a2; margin-bottom: 7px; }
        .topbar h2 { margin: 0; font-size: 19px; }
        .top-profile { display: flex; align-items: center; gap: 12px; font-size: 12px; }
        .profile-circle { width: 40px; height: 40px; border-radius: 50%; background: #e1f3ee; color: #078474; display: grid; place-items: center; font-weight: 800; }
        .top-profile small { display: block; color: #8397a3; margin-top: 4px; }
        .content { max-width: 1500px; margin: auto; padding: 32px 38px 60px; }
        .hero { background: linear-gradient(110deg, #12464a, #087d70); color: white; padding: 38px 40px; min-height: 266px; border-radius: 17px; display: flex; justify-content: space-between; align-items: center; overflow: hidden; }
        .eyebrow { color: #91ead3; font-size: 10px; letter-spacing: 2px; font-weight: 800; margin-bottom: 23px; }
        .hero h1 { font-size: 29px; letter-spacing: -1px; margin: 0 0 13px; }
        .hero p { max-width: 620px; line-height: 1.8; font-size: 13px; color: #d2e9e5; }
        .hero-button { background: white; color: #08675f; border: 0; border-radius: 9px; padding: 14px 19px; font-weight: 750; font-size: 12px; margin-top: 10px; }
        .hero-button span { margin-left: 12px; }
        .hero-art { width: 230px; display: grid; place-items: center; flex-shrink: 0; }
        .hero-circle { width: 150px; height: 150px; border: 1px solid #62c5ae; border-radius: 50%; display: grid; place-items: center; box-shadow: 0 0 0 25px #ffffff08; }
        .hero-circle span { width: 105px; height: 105px; background: #ffffff1c; border: 1px solid #83d7c3; border-radius: 50%; display: grid; place-items: center; font-size: 63px; color: #9bf2d9; }
        .section-heading { display: flex; align-items: center; justify-content: space-between; margin: 36px 0 17px; }
        h2, h3, p { }
        .section-heading h2 { font-size: 16px; margin: 0 0 7px; font-weight: 650; }
        .section-heading p, .panel-heading p { margin: 0; font-size: 11px; color: #8095a2; }
        .refresh-button { background: white; border: 1px solid #e0e9eb; padding: 10px 14px; border-radius: 8px; color: #426273; font-size: 12px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 15px; margin-bottom: 22px; }
        .metric-card, .panel, .assessment-panel { background: white; border: 1px solid #e4ebed; border-radius: 13px; padding: 20px; box-shadow: 0 3px 12px #18324406; }
        .metric-top { display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 700; color: #738995; }
        .icon { display: grid; place-items: center; width: 37px; height: 37px; background: #e6f5f1; color: #078878; border-radius: 10px; font-size: 20px; }
        .metric-value { font-size: 29px; font-weight: 800; margin: 19px 0 9px; color: #1d3745; }
        .metric-description { font-size: 10px; color: #8196a1; }
        .two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .panel { padding: 22px; margin-bottom: 18px; }
        .panel-heading { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .panel-heading h3, .panel h3 { font-size: 15px; margin: 0 0 7px; }
        .empty-state { min-height: 180px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: #7b929f; }
        .empty-state > span { font-size: 26px; color: #078d7d; }
        .empty-state p { font-size: 12px; margin: 12px 0 5px; }
        .empty-state small { font-size: 10px; }
        .model-row { margin: 20px 0; display: grid; grid-template-columns: 1fr 65px; gap: 8px; font-size: 11px; }
        .model-row span { text-align: right; }
        .bar-track, .contribution-track { height: 8px; border-radius: 10px; background: #edf2f3; overflow: hidden; grid-column: 1 / -1; }
        .bar-fill { height: 100%; background: #078c7c; border-radius: 10px; }
        .matrix-label { font-size: 10px; color: #8095a2; text-align: center; margin: 20px; }
        .matrix-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 380px; margin: auto; }
        .matrix-cell { background: #e9f5f1; padding: 20px; border-radius: 8px; text-align: center; }
        .matrix-cell strong { font-size: 25px; display: block; color: #08796b; }
        .matrix-cell small { font-size: 9px; color: #718d95; }
        .model-summary { background: #e8f5f1; border-radius: 10px; padding: 18px; display: flex; gap: 14px; align-items: center; margin-top: 20px; font-size: 12px; }
        .summary-icon { font-size: 25px; color: #078878; }
        .model-summary p { color: #6d8990; font-size: 11px; margin: 6px 0 0; }
        .page-content { max-width: 1150px; }
        .page-intro { margin: 5px 0 28px; }
        .page-intro .eyebrow { color: #078878; margin-bottom: 10px; }
        .page-intro h1 { font-size: 28px; margin: 0 0 9px; }
        .page-intro p { font-size: 13px; color: #8095a2; }
        .form-heading { display: flex; justify-content: space-between; margin-bottom: 25px; align-items: center; }
        .form-heading h2 { font-size: 17px; margin: 0 0 7px; }
        .form-heading p { color: #8095a2; font-size: 11px; margin: 0; }
        .form-badge { background: #e5f5ef; color: #078878; border-radius: 6px; padding: 7px 10px; font-size: 10px; font-weight: 800; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
        .field { display: grid; gap: 9px; font-size: 12px; font-weight: 650; color: #4d6876; }
        .input-wrap { border: 1px solid #dfe8ea; border-radius: 8px; display: flex; align-items: center; padding: 0 12px; }
        .input-wrap:focus-within { border-color: #078878; box-shadow: 0 0 0 3px #07887815; }
        .input-wrap input { border: 0; outline: none; width: 100%; padding: 13px 0; color: #1d3745; background: transparent; }
        .input-wrap small { color: #91a1a9; font-size: 10px; white-space: nowrap; }
        .threshold-section { background: #f4f8f8; border-radius: 9px; padding: 17px; margin-top: 27px; }
        .threshold-section label { font-size: 12px; font-weight: 700; }
        .threshold-control { display: flex; gap: 15px; align-items: center; margin: 13px 0; }
        .threshold-control input { flex: 1; accent-color: #078878; }
        .threshold-control strong { color: #078878; }
        .threshold-section > small { color: #8095a2; font-size: 10px; }
        .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 25px; }
        .primary-button, .secondary-button { padding: 13px 19px; border-radius: 8px; font-size: 12px; font-weight: 750; }
        .primary-button { border: 0; background: #087b6e; color: white; }
        .primary-button:hover { background: #05675d; }
        .primary-button:disabled { opacity: .6; cursor: wait; }
        .secondary-button { background: white; color: #526d79; border: 1px solid #dce6e8; }
        .error-message { background: #fff0ef; border: 1px solid #ffd3cf; color: #b83c32; padding: 12px; border-radius: 8px; font-size: 12px; margin-top: 18px; }
        .disclaimer { background: #fff8e9; color: #806d43; padding: 16px; border-radius: 9px; font-size: 11px; line-height: 1.7; margin-top: 20px; }
        .result-banner { display: flex; justify-content: space-between; align-items: center; border-radius: 12px; padding: 25px; margin-bottom: 20px; }
        .result-banner.high-risk { background: #fff0eb; color: #a94730; }
        .result-banner.low-risk { background: #e8f5ef; color: #08795e; }
        .result-label { font-size: 10px; letter-spacing: 1.5px; font-weight: 800; }
        .result-banner h2 { margin: 10px 0; font-size: 23px; }
        .result-banner p { font-size: 11px; }
        .result-symbol { font-size: 37px; width: 65px; height: 65px; display: grid; place-items: center; border-radius: 50%; background: #ffffff80; }
        .result-grid .metric-value { font-size: 23px; }
        .contribution-row { display: grid; grid-template-columns: 170px 1fr 80px; align-items: center; gap: 15px; margin: 19px 0; font-size: 11px; }
        .contribution-row > span { text-align: right; }
        .contribution-bar { height: 100%; border-radius: 8px; }
        .contribution-bar.positive { background: #e18a63; }
        .contribution-bar.negative { background: #078878; }
        .method-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px; }
        .method-card { background: #f4f8f8; border-radius: 10px; padding: 17px; }
        .method-card > span { color: #078878; font-weight: 800; font-size: 11px; }
        .method-card strong { display: block; margin: 12px 0 8px; font-size: 13px; }
        .method-card p { color: #7e939d; font-size: 11px; line-height: 1.6; }
        .intel-model-list { display: grid; gap: 22px; margin-top: 22px; }
        .intel-model-row { display: grid; gap: 8px; }
        .intel-model-heading, .intel-model-foot { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .intel-model-heading { color: #254454; font-size: 12px; }
        .intel-model-heading span { font-variant-numeric: tabular-nums; }
        .intel-bar-track { height: 9px; border-radius: 20px; background: #edf2f3; overflow: hidden; }
        .intel-bar-fill { height: 100%; border-radius: inherit; background: #078c7c; }
        .intel-model-foot { color: #8196a1; font-size: 10px; }
        .intel-panel-subtitle { color: #8095a2; font-size: 11px; margin: 0 0 17px; }
        .intel-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .intel-stat { background: #f4f8f8; border-radius: 8px; padding: 13px; min-width: 0; }
        .intel-stat span { display: block; color: #8095a2; font-size: 10px; margin-bottom: 7px; }
        .intel-stat strong { display: block; color: #254454; font-size: 15px; overflow-wrap: anywhere; }
        .intel-feature-list { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 15px; }
        .intel-feature-chip { background: #f0f7f5; color: #28665f; border: 1px solid #dceee9; border-radius: 7px; padding: 9px 11px; font-size: 11px; }
        .intelligence-note { background: #f0f7f5; border-left: 3px solid #078c7c; border-radius: 8px; padding: 17px 19px; color: #315b60; font-size: 12px; line-height: 1.7; margin-bottom: 18px; }
        .intelligence-note p { margin: 6px 0 0; color: #718b91; }
        .tech-item { padding: 12px 0; border-bottom: 1px solid #edf1f2; color: #078878; font-size: 13px; }
        .tech-item span { color: #526d79; margin-left: 8px; }
        .objective-list { color: #607986; font-size: 12px; line-height: 2.2; padding-left: 18px; }
        .shap-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 20px 0; }
        .shap-meta { background: #f4f8f8; border-radius: 9px; padding: 15px; min-width: 0; }
        .shap-meta span { display: block; font-size: 9px; letter-spacing: 1px; font-weight: 800; color: #8095a2; margin-bottom: 9px; }
        .shap-meta strong { font-size: 13px; overflow-wrap: anywhere; }
        .shap-legend { display: flex; gap: 22px; flex-wrap: wrap; margin: 20px 0; font-size: 11px; color: #738995; }
        .shap-legend span { display: flex; align-items: center; gap: 7px; }
        .shap-legend i { width: 9px; height: 9px; border-radius: 50%; }
        .legend-positive { background: #e18a63; }
        .legend-negative { background: #078878; }
        .shap-positive-text { color: #d9784e; font-weight: 750; }
        .shap-negative-text { color: #078878; font-weight: 750; }
        .waterfall-chart { margin: 22px 0 8px; }
        .waterfall-axis-labels { display: flex; justify-content: space-between; gap: 12px; color: #8095a2; font-size: 9px; font-weight: 750; text-transform: uppercase; letter-spacing: .7px; margin-bottom: 13px; }
        .waterfall-start-row, .waterfall-row, .waterfall-end-row { display: grid; grid-template-columns: minmax(125px, 190px) minmax(100px, 1fr) 76px; gap: 12px; align-items: center; min-height: 39px; border-bottom: 1px solid #edf1f2; font-size: 11px; }
        .waterfall-start-row strong, .waterfall-row strong, .waterfall-end-row strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #526d79; }
        .waterfall-start-row b, .waterfall-row b, .waterfall-end-row b { text-align: right; font-variant-numeric: tabular-nums; }
        .waterfall-track { position: relative; height: 20px; background: linear-gradient(to right, transparent calc(50% - .5px), #d9e3e5 calc(50% - .5px), #d9e3e5 calc(50% + .5px), transparent calc(50% + .5px)); border-radius: 4px; }
        .waterfall-bar { position: absolute; top: 4px; height: 12px; min-width: 2px; border-radius: 3px; }
        .waterfall-bar.positive { background: #e18a63; }
        .waterfall-bar.negative { background: #078878; }
        .waterfall-marker { position: absolute; top: 1px; width: 2px; height: 18px; background: #344e59; transform: translateX(-1px); }
        .waterfall-marker.final { background: #087b6e; width: 3px; }
        .waterfall-end-row { border-bottom: 0; border-top: 1px solid #dce6e8; margin-top: 5px; padding-top: 7px; }
        .reconciliation-note { padding: 11px 13px; border-radius: 7px; margin-top: 15px; font-size: 10px; line-height: 1.6; }
        .reconciliation-note.match { background: #e8f5ef; color: #08795e; }
        .reconciliation-note.mismatch { background: #fff4e8; color: #98612c; }
        .waterfall-note { color: #8095a2; font-size: 10px; line-height: 1.6; margin-top: 12px; }
        .shap-footer { background: #f4f8f8; border-radius: 9px; padding: 17px; margin-top: 25px; font-size: 11px; line-height: 1.7; }
        .shap-footer p { color: #718995; margin: 7px 0; }
        .about-hero { margin-bottom: 20px; }
        .about-section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .about-info-card { min-height: 175px; }
        .about-info-card h3, .about-wide-panel h3 { font-size: 17px; margin: 8px 0 11px; }
        .about-info-card p, .about-wide-panel > p, .about-detail-columns .panel > p { color: #6e8793; font-size: 12px; line-height: 1.8; margin: 0; }
        .about-section-kicker { color: #078878; font-size: 9px; font-weight: 850; letter-spacing: 1.4px; }
        .about-wide-panel { margin-top: 0; }
        .about-section-description { color: #8095a2; font-size: 11px; margin: 0 0 18px; line-height: 1.7; }
        .architecture-flow { display: grid; grid-template-columns: minmax(0,1fr) 24px minmax(0,1fr) 24px minmax(0,1fr) 24px minmax(0,1fr); gap: 8px; align-items: stretch; margin-top: 20px; }
        .architecture-step { background: #f4f8f8; border: 1px solid #e8eeee; border-radius: 10px; padding: 15px; min-width: 0; }
        .architecture-step > span, .about-workflow-step > span { color: #078878; font-size: 10px; font-weight: 850; }
        .architecture-step strong { display: block; font-size: 12px; margin: 10px 0 7px; color: #1d3745; }
        .architecture-step p, .about-workflow-step p { color: #7b929d; font-size: 10px; line-height: 1.6; margin: 0; }
        .architecture-arrow { display: grid; place-items: center; color: #078878; font-size: 19px; }
        .about-footnote { color: #8095a2; font-size: 10px; margin-top: 15px !important; }
        .about-detail-columns { align-items: stretch; }
        .about-tech-item { display: flex; gap: 11px; padding: 12px 0; border-bottom: 1px solid #edf1f2; }
        .about-tech-item:last-child { border-bottom: 0; }
        .about-check { color: #078878; font-weight: 800; }
        .about-tech-item strong { display: block; color: #405f6e; font-size: 12px; margin-bottom: 4px; }
        .about-tech-item p { color: #8095a2; font-size: 10px; line-height: 1.5; margin: 0; }
        .feature-chip-grid { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 16px; }
        .feature-chip { background: #edf6f3; border: 1px solid #dceee8; color: #286b62; padding: 9px 11px; border-radius: 7px; font-size: 10px; font-weight: 650; }
        .about-workflow-grid { display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 12px; margin-top: 20px; }
        .about-workflow-step { background: #f4f8f8; border: 1px solid #e8eeee; border-radius: 9px; padding: 14px; min-width: 0; }
        .about-workflow-step strong { display: block; color: #284757; font-size: 12px; margin: 9px 0 7px; }
        .about-detail-columns .objective-list { margin-bottom: 0; }

        .muted { color: #8095a2; font-size: 12px; }
        @media(max-width: 1100px) { .sidebar { width: 220px; } .main-area { margin-left: 220px; } .content { padding: 25px; } .metrics-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width: 720px) { .shap-summary { grid-template-columns: 1fr; } .sidebar { position: relative; width: 100%; min-height: auto; padding: 15px; } .brand { padding-bottom: 15px; } .sidebar-label, .sidebar-bottom { display: none; } .sidebar nav { display: flex; overflow-x: auto; } .nav-item { white-space: nowrap; padding: 11px; } .main-area { margin-left: 0; } .topbar { height: 70px; padding: 0 18px; } .content { padding: 18px; } .hero { padding: 25px; } .hero-art { display: none; } .two-columns, .form-grid, .method-grid, .about-section-grid { grid-template-columns: 1fr; } .architecture-flow { grid-template-columns: 1fr; } .architecture-arrow { transform: rotate(90deg); min-height: 15px; } .about-workflow-grid { grid-template-columns: 1fr 1fr; } .metrics-grid { grid-template-columns: repeat(2,1fr); gap: 10px; } .metric-card { padding: 14px; } .contribution-row { grid-template-columns: 105px 1fr 65px; gap: 8px; } .waterfall-start-row, .waterfall-row, .waterfall-end-row { grid-template-columns: 95px minmax(70px, 1fr) 62px; gap: 7px; font-size: 9px; } }

        /* Stage 3 UI refinement: interaction, hierarchy and responsive polish */
        html { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; }
        button { transition: background-color .18s ease, border-color .18s ease, color .18s ease, transform .18s ease, box-shadow .18s ease; }
        button:focus-visible, input:focus-visible {
          outline: 3px solid #42bfa5;
          outline-offset: 3px;
        }
        .nav-item { width: 100%; transition: background-color .18s ease, color .18s ease; }
        .nav-item:hover { transform: translateX(2px); }
        .hero-button:hover, .primary-button:hover, .refresh-button:hover, .secondary-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 14px #18324414;
        }
        .metric-card { min-width: 0; transition: transform .18s ease, box-shadow .18s ease; }
        .metric-card:hover, .panel:hover, .assessment-panel:hover {
          box-shadow: 0 8px 24px #1832440b;
        }
        .metric-value { overflow-wrap: anywhere; }
        .page-intro p { line-height: 1.65; }
        .panel, .assessment-panel { min-width: 0; }
        .field input { min-width: 0; }
        .input-wrap input:focus-visible { outline: none; }
        .input-wrap:focus-within { border-color: #078878; box-shadow: 0 0 0 3px #07887818; }
        .topbar { position: sticky; top: 0; z-index: 4; }
        .content { width: 100%; }
        .page-content { width: 100%; }
        .waterfall-chart { min-width: 0; }
        .waterfall-row strong { min-width: 0; }
        .disclaimer { line-height: 1.75; }
        .error-message { line-height: 1.6; }
        .primary-button:disabled { box-shadow: none; transform: none; }
        @media (max-width: 900px) {
          .intel-stat-grid { grid-template-columns: 1fr 1fr; }
          .sidebar { width: 210px; padding-left: 14px; padding-right: 14px; }
          .main-area { margin-left: 210px; }
          .topbar { padding-left: 24px; padding-right: 24px; }
          .content { padding-left: 24px; padding-right: 24px; }
          .metrics-grid { gap: 12px; }
          .architecture-flow { grid-template-columns: minmax(0,1fr) 18px minmax(0,1fr); }
          .architecture-step:nth-of-type(3) { grid-column: 1; }
          .about-workflow-grid { grid-template-columns: repeat(3, minmax(0,1fr)); }
        }
        @media (max-width: 720px) {
          .sidebar { position: relative; inset: auto; }
          .sidebar nav { gap: 6px; padding-bottom: 3px; }
          .nav-item { flex: 0 0 auto; width: auto; }
          .nav-item:hover { transform: none; }
          .topbar { position: relative; padding: 0 18px; }
          .top-profile { gap: 8px; }
          .top-profile > div:last-child { display: none; }
          .content { padding: 20px 16px 40px; }
          .hero { min-height: 0; }
          .hero h1 { font-size: clamp(23px, 6vw, 29px); line-height: 1.2; }
          .section-heading { align-items: flex-start; gap: 12px; }
          .waterfall-start-row, .waterfall-row, .waterfall-end-row {
            grid-template-columns: minmax(82px, 1fr) minmax(70px, 1.3fr) 58px;
          }
          .about-workflow-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
        }
        @media (max-width: 480px) {
          .topbar { height: 64px; }
          .topbar h2 { font-size: 16px; }
          .breadcrumb { font-size: 10px; }
          .content { padding-left: 12px; padding-right: 12px; }
          .metrics-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
          .metric-card { padding: 12px; }
          .metric-value { font-size: 23px; margin: 14px 0 7px; }
          .metric-description { line-height: 1.4; }
          .hero { padding: 22px 18px; border-radius: 13px; }
          .hero p { font-size: 12px; }
          .eyebrow { letter-spacing: 1.4px; }
          .form-heading { align-items: flex-start; gap: 10px; }
          .form-badge { white-space: nowrap; }
          .form-actions { flex-direction: column-reverse; }
          .form-actions button { width: 100%; }
          .about-workflow-grid { grid-template-columns: 1fr; }
          .waterfall-axis-labels { font-size: 8px; }
          .waterfall-start-row, .waterfall-row, .waterfall-end-row {
            grid-template-columns: 78px minmax(54px, 1fr) 52px;
            gap: 5px;
            font-size: 8px;
          }
          .waterfall-start-row strong, .waterfall-row strong, .waterfall-end-row strong {
            white-space: normal;
            overflow-wrap: anywhere;
          }
          .waterfall-start-row b, .waterfall-row b, .waterfall-end-row b { font-size: 8px; }
          .shap-legend { gap: 10px; font-size: 10px; }
          .matrix-cell { padding: 14px 8px; }
        }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          *, *::before, *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; }
        }

      `}</style>

      <div className="app-shell">
        <Sidebar page={page} setPage={setPage} connected={connected} />

        <main className="main-area">
          <header className="topbar">
            <div>
              <div className="breadcrumb">Workspace / {pageTitles[page]}</div>
              <h2>{pageTitles[page]}</h2>
            </div>
            <div className="top-profile">
              <div className="profile-circle">GS</div>
              <div><strong>GlucoSense</strong><small>Administrator</small></div>
            </div>
          </header>

          <div className="content">
            {page === "overview" && (
              <Overview
                metrics={metrics}
                modelInfo={modelInfo}
                loading={loading}
                onRefresh={() => {
                  setLoading(true);
                  fetchModelInfo();
                }}
                setPage={setPage}
              />
            )}

            {page === "assessment" && (
              <Assessment
                patient={patient}
                setPatient={setPatient}
                threshold={threshold}
                setThreshold={setThreshold}
                onSubmit={submitAssessment}
                submitting={submitting}
                error={error}
              />
            )}

            {page === "risk" && <RiskAnalysis result={result} setPage={setPage} />}

            {page === "intelligence" && (
              <Intelligence modelInfo={modelInfo} metrics={metrics} />
            )}

            {page === "about" && <About />}
          </div>
        </main>
      </div>
    </>
  );
}
