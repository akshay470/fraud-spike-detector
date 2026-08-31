import os
import json
import uuid
import time
import math
from typing import Dict, Any, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import psycopg2
import psycopg2.extras
import pandas as pd
import numpy as np
import linecache

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load XGBoost model
try:
    import xgboost as xgb
    model = xgb.XGBClassifier()
    model_path = os.path.join("..", "model", "model.json")
    if os.path.exists(model_path):
        model.load_model(model_path)
    has_model = True
except Exception as e:
    print(f"Warning: Could not load XGBoost model natively: {e}")
    has_model = False

global_explainer = None
global_df = None

try:
    import shap
    if has_model:
        global_explainer = shap.TreeExplainer(model.get_booster())
        
    print("Caching dataframe for exact index mapping...")
    raw_df = pd.read_csv("../data/creditcard.csv")
    global_df = raw_df.sort_values('Time').reset_index(drop=True)
    print("Dataframe cached.")
except Exception as e:
    print(f"Warning: Could not load SHAP or cache data: {e}")

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise HTTPException(status_code=500, detail="DATABASE_URL environment variable is not set")
    try:
        conn = psycopg2.connect(db_url)
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {e}")

class Transaction(BaseModel):
    features: Dict[str, Any]
    amount: float

@app.post("/predict")
def predict_transaction(txn: Transaction):
    conn = get_db_connection()
    try:
        prob = 0.5  # fallback
        if has_model:
            df = pd.DataFrame([txn.features])
            try:
                prob = float(model.predict_proba(df)[0][1])
            except Exception as e:
                print(f"Prediction error: {e}")
        
        tx_id = str(uuid.uuid4())
        timestamp = int(time.time())
        feat_json = json.dumps(txn.features)
        
        pred_id = str(uuid.uuid4())
        pred_label = 1 if prob >= 0.5 else 0

        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO transactions (id, timestamp, amount, features_json)
                VALUES (%s, %s, %s, %s)
            """, (tx_id, timestamp, txn.amount, feat_json))

            cur.execute("""
                INSERT INTO predictions (id, transaction_id, predicted_probability, predicted_label)
                VALUES (%s, %s, %s, %s)
            """, (pred_id, tx_id, prob, pred_label))
        conn.commit()
        
        return {
            "transaction_id": tx_id,
            "predicted_probability": prob
        }
    finally:
        conn.close()

@app.get("/spikes")
def get_spikes():
    conn = get_db_connection()
    try:
        # Group transactions into 10-minute (600s) buckets and compute rolling stats
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("""
                SELECT 
                    (CAST(timestamp AS BIGINT) / 600) * 600 as window_start,
                    AVG(predicted_probability) as fraud_rate
                FROM test_predictions
                GROUP BY 1
                ORDER BY 1 ASC
            """)
            rows = cur.fetchall()
            
        buckets = []
        for row in rows:
            buckets.append({
                "window_start": int(row["window_start"]),
                "fraud_rate": float(row["fraud_rate"])
            })

        # Calculate trailing 6 buckets mean and std
        for i in range(len(buckets)):
            start = max(0, i - 6)
            if i == 0:
                buckets[i]["rolling_mean"] = buckets[i]["fraud_rate"]
                buckets[i]["rolling_std"] = 0.0
            else:
                window_vals = [b["fraud_rate"] for b in buckets[start:i]]
                mean = sum(window_vals) / len(window_vals)
                if len(window_vals) > 1:
                    var = sum((x - mean) ** 2 for x in window_vals) / (len(window_vals) - 1)
                    std = math.sqrt(var)
                else:
                    std = 0.0
                
                buckets[i]["rolling_mean"] = mean
                buckets[i]["rolling_std"] = std
            
            buckets[i]["spike_threshold"] = buckets[i]["rolling_mean"] + (2 * buckets[i]["rolling_std"])
            buckets[i]["is_spike"] = bool(buckets[i]["rolling_std"] > 0 and buckets[i]["fraud_rate"] > buckets[i]["spike_threshold"])

        return buckets

    finally:
        conn.close()

@app.get("/explain")
def get_explain():
    importance_file = os.path.join("..", "model", "feature_importance.json")
    if os.path.exists(importance_file):
        try:
            with open(importance_file, "r") as f:
                return json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read feature importance: {e}")
    raise HTTPException(status_code=404, detail="Feature importance data not found")

@app.get("/drift")
def get_drift():
    drift_file = os.path.join("..", "model", "drift_report.json")
    if os.path.exists(drift_file):
        try:
            with open(drift_file, "r") as f:
                return json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read drift report: {e}")
    raise HTTPException(status_code=404, detail="Drift data not found")

@app.get("/risk-grade")
def get_risk_grade(threshold: float = 0.5):
    try:
        # 1. Fetch metrics for recall/precision
        metrics_data = get_metrics(threshold)
        recall = metrics_data.get("recall", 0.0) * 100
        precision = metrics_data.get("precision", 0.0) * 100
        
        # 2. Fetch drift
        drift_score = 100
        drift_data = get_drift()
        if drift_data:
            status = drift_data.get("overall_status", "Stable")
            if status == "Significant Drift":
                drift_score = 20
            elif status == "Moderate Drift":
                drift_score = 60
                
        # 3. Fetch spikes
        spikes_data = get_spikes()
        total_windows = len(spikes_data)
        spike_count = sum(1 for b in spikes_data if b.get("is_spike"))
        spike_health = 100
        if total_windows > 0:
            spike_health = (1.0 - (spike_count / total_windows)) * 100

        # Composite computation
        final_score = (recall * 0.35) + (precision * 0.25) + (drift_score * 0.25) + (spike_health * 0.15)
        
        # Grading
        if final_score >= 90: grade = 'A'
        elif final_score >= 75: grade = 'B'
        elif final_score >= 60: grade = 'C'
        else: grade = 'D'
        
        return {
            "overall_score": round(final_score, 1),
            "letter_grade": grade,
            "breakdown": {
                "recall": round(recall, 1),
                "precision": round(precision, 1),
                "drift_score": drift_score,
                "spike_health": round(spike_health, 1),
                "spike_ratio": f"{spike_count}/{total_windows}"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute risk grade: {e}")

@app.get("/transaction/{tx_id}")
def get_transaction_insights(tx_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM test_predictions WHERE transaction_id::text = %s::text", (str(tx_id),))
        row = cur.fetchone()
    finally:
        conn.close()
        
    if not row:
        raise HTTPException(status_code=404, detail="Transaction not found in test predictions")
        
    prob = float(row["predicted_probability"])
    actual_label = int(row.get("actual_label", 0))

    if global_df is None:
        raise HTTPException(status_code=500, detail="Dataframe not loaded in memory")
        
    if tx_id not in global_df.index:
        raise HTTPException(status_code=404, detail="Transaction index out of range")
        
    row_data = global_df.iloc[tx_id]
    feature_cols = [f'V{i}' for i in range(1, 29)] + ['Amount']
    feat_vals = [float(row_data[col]) for col in feature_cols]
    
    top_features = []
    if global_explainer is not None:
        try:
            s_vals = global_explainer.shap_values(np.array([feat_vals]))[0]
            breakdown = []
            for i, col in enumerate(feature_cols):
                breakdown.append({
                    "feature": col,
                    "value": feat_vals[i],
                    "shap_contribution": float(s_vals[i])
                })
            breakdown.sort(key=lambda x: abs(x["shap_contribution"]), reverse=True)
            top_features = breakdown[:5]
        except Exception as e:
            print("SHAP failed:", e)

    return {
        "transaction_id": tx_id,
        "predicted_probability": prob,
        "actual_label": actual_label,
        "predicted_label": 1 if prob >= 0.5 else 0,
        "top_features": top_features
    }

@app.get("/metrics")
def get_metrics(threshold: Optional[float] = Query(None)):
    if threshold is None:
        metrics_file = os.path.join("..", "model", "metrics.json")
        opt_thresh = 0.5
        if os.path.exists(metrics_file):
            try:
                with open(metrics_file, "r") as f:
                    data = json.load(f)
                    opt_thresh = data.get("optimal_threshold", 0.5)
            except:
                pass
        threshold = opt_thresh

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("SELECT actual_label, predicted_probability FROM test_predictions")
            rows = cur.fetchall()

        tp, fp, tn, fn = 0, 0, 0, 0
        for row in rows:
            actual = int(row["actual_label"])
            prob = float(row["predicted_probability"])
            
            predicted = 1 if prob >= threshold else 0
            
            if actual == 1 and predicted == 1:
                tp += 1
            elif actual == 0 and predicted == 1:
                fp += 1
            elif actual == 0 and predicted == 0:
                tn += 1
            elif actual == 1 and predicted == 0:
                fn += 1

        total_cost = (fp * 50) + (fn * 5000)

        precision = 0.0
        if (tp + fp) > 0:
            precision = tp / (tp + fp)

        recall = 0.0
        if (tp + fn) > 0:
            recall = tp / (tp + fn)

        f1 = 0.0
        if (precision + recall) > 0:
            f1 = 2 * (precision * recall) / (precision + recall)

        return {
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "total_cost": total_cost,
            "confusion_matrix": [tp, fp, tn, fn],
            "optimal_threshold": threshold
        }
    finally:
        conn.close()
