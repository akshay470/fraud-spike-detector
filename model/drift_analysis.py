import os
import json
import logging
import numpy as np
import pandas as pd

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DATA_PATH = '../data/creditcard.csv'
IMPORTANCE_PATH = 'feature_importance.json'
OUT_PATH = 'drift_report.json'

def calculate_psi(expected, actual, buckets=10):
    """
    Calculate the Population Stability Index (PSI) between two arrays.
    expected: train data
    actual: test data
    """
    def scale_range(input, min, max):
        input += -(np.min(input))
        input /= np.max(input) / (max - min)
        input += min
        return input

    breakpoints = np.arange(0, buckets + 1) / (buckets) * 100
    breakpoints = np.unique(np.percentile(expected, breakpoints))
    
    # In case there are not enough unique values to form 10 buckets
    expected_percents = np.histogram(expected, breakpoints)[0] / len(expected)
    actual_percents = np.histogram(actual, breakpoints)[0] / len(actual)
    
    def sub_psi(e_perc, a_perc):
        # To avoid division by zero and log of zero
        if a_perc == 0:
            a_perc = 0.0001
        if e_perc == 0:
            e_perc = 0.0001
        value = (e_perc - a_perc) * np.log(e_perc / a_perc)
        return value

    psi = np.sum([sub_psi(expected_percents[i], actual_percents[i]) for i in range(len(expected_percents))])
    return psi

def run():
    if not os.path.exists(DATA_PATH):
        logger.error(f"Data not found at {DATA_PATH}")
        return
        
    if not os.path.exists(IMPORTANCE_PATH):
        logger.error(f"Importance file not found at {IMPORTANCE_PATH}")
        return

    with open(IMPORTANCE_PATH, 'r') as f:
        importances = json.load(f)
        
    # Get top 5 features
    top_5 = [item['feature'] for item in importances[:5]]
    logger.info(f"Targeting top 5 features: {top_5}")

    logger.info("Loading dataset...")
    df = pd.read_csv(DATA_PATH)
    
    logger.info("Performing time-based train/test split...")
    df = df.sort_values('Time').reset_index(drop=True)
    split_idx = int(len(df) * 0.8)
    train_df = df.iloc[:split_idx]
    test_df = df.iloc[split_idx:]
    
    report = []
    total_psi = 0
    max_psi = 0
    
    for feature in top_5:
        expected = train_df[feature].values
        actual = test_df[feature].values
        psi = calculate_psi(expected, actual, buckets=10)
        report.append({
            "feature": feature,
            "psi": float(psi)
        })
        total_psi += psi
        if psi > max_psi:
            max_psi = psi
            
    # Calculate overall status based on the MAX PSI among top 5 features
    # (If any top feature drifts significantly, the model is drifting)
    overall_status = "Stable"
    if max_psi > 0.25:
        overall_status = "Significant Drift"
    elif max_psi > 0.1:
        overall_status = "Moderate Drift"
        
    final_output = {
        "overall_status": overall_status,
        "max_psi": float(max_psi),
        "features": report
    }
    
    with open(OUT_PATH, 'w') as f:
        json.dump(final_output, f, indent=4)
        
    logger.info(f"Drift report generated: {final_output}")
    logger.info(f"Saved to {OUT_PATH}")

if __name__ == "__main__":
    run()
