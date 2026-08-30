import os
import json
import logging
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import xgboost as xgb
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, average_precision_score, confusion_matrix

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
DATA_PATH = '../data/creditcard.csv'
FP_COST = 50
FN_COST = 5000

def run():
    # 1. Load and EDA
    logger.info(f"Loading data from {DATA_PATH}...")
    if not os.path.exists(DATA_PATH):
        logger.error(f"Dataset not found at {DATA_PATH}. Please make sure it is downloaded.")
        return
        
    df = pd.read_csv(DATA_PATH)
    logger.info(f"Loaded {len(df)} transactions.")
    
    # Class imbalance %
    fraud_pct = df['Class'].mean() * 100
    logger.info(f"Class imbalance: {fraud_pct:.3f}% fraud ({df['Class'].sum()} frauds / {len(df)} total)")
    
    # 2. Time-based split (80/20)
    logger.info("Performing time-based train/test split (80/20) by Time column...")
    df = df.sort_values('Time').reset_index(drop=True)
    
    split_idx = int(len(df) * 0.8)
    train_df = df.iloc[:split_idx]
    test_df = df.iloc[split_idx:]
    
    # Features (all V1-V28, and Amount. Exclude 'Class' and 'Time')
    features = [c for c in df.columns if c not in ['Class', 'Time']]
    
    X_train = train_df[features]
    y_train = train_df['Class']
    X_test = test_df[features]
    y_test = test_df['Class']
    time_test = test_df['Time']
    
    # 3. Train XGBoost classifier with scale_pos_weight
    logger.info("Training XGBoost classifier...")
    # Count negative / positive labels
    scale_pos_weight = (len(y_train) - sum(y_train)) / sum(y_train)
    logger.info(f"Calculated scale_pos_weight for imbalance: {scale_pos_weight:.2f}")
    
    model = xgb.XGBClassifier(
        scale_pos_weight=scale_pos_weight,
        eval_metric='logloss',
        random_state=42
    )
    model.fit(X_train, y_train)
    
    logger.info("Scoring test set...")
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    # 5. Cost-based analysis to find optimal threshold
    logger.info("Performing cost-based analysis...")
    thresholds = np.arange(0.1, 0.95, 0.05)
    cost_results = []
    
    optimal_cost = float('inf')
    optimal_threshold = 0.5
    
    for t in thresholds:
        y_pred = (y_pred_proba >= t).astype(int)
        cm = confusion_matrix(y_test, y_pred)
        if cm.shape == (2, 2):
            tn, fp, fn, tp = cm.ravel()
        else:
            tn, fp, fn, tp = (len(y_test) - sum(y_test)), 0, sum(y_test), 0 # Approx edge cases
        
        total_cost = fp * FP_COST + fn * FN_COST
        cost_results.append({
            'threshold': round(float(t), 2),
            'cost': float(total_cost),
            'fp': int(fp),
            'fn': int(fn)
        })
        
        if total_cost < optimal_cost:
            optimal_cost = total_cost
            optimal_threshold = t
            
    logger.info(f"Optimal threshold: {optimal_threshold:.2f} with lowest cost: Rs.{optimal_cost}")

    # Plot Cost vs Threshold
    plt.figure(figsize=(10, 6))
    plt.plot([c['threshold'] for c in cost_results], [c['cost'] for c in cost_results], marker='o', linestyle='-')
    plt.axvline(x=optimal_threshold, color='r', linestyle='--', label=f'Optimal: {optimal_threshold:.2f}')
    plt.title('Total Business Cost vs Decision Threshold')
    plt.xlabel('Probability Threshold')
    plt.ylabel('Total Cost (Rs.)')
    plt.legend()
    plt.grid(True)
    plt.savefig('cost_vs_threshold.png')
    plt.close()

    # 4. Evaluate Metrics at optimal threshold
    y_pred_opt = (y_pred_proba >= optimal_threshold).astype(int)
    
    precision = precision_score(y_test, y_pred_opt)
    recall = recall_score(y_test, y_pred_opt)
    f1 = f1_score(y_test, y_pred_opt)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    pr_auc = average_precision_score(y_test, y_pred_proba)
    cm_opt = confusion_matrix(y_test, y_pred_opt).tolist()
    
    metrics_dict = {
        'optimal_threshold': round(float(optimal_threshold), 2),
        'precision': float(precision),
        'recall': float(recall),
        'f1': float(f1),
        'roc_auc': float(roc_auc),
        'pr_auc': float(pr_auc),
        'confusion_matrix': cm_opt,
        'cost_vs_threshold': cost_results
    }
    
    logger.info(f"PR-AUC: {pr_auc:.3f}, ROC-AUC: {roc_auc:.3f}")
    logger.info(f"At optimal threshold ({optimal_threshold:.2f}): P={precision:.3f}, R={recall:.3f}, F1={f1:.3f}")
    
    # 6. Windowed Spike Detector
    logger.info("Computing windowed spike detection metrics...")
    # Time is in seconds. 10 minutes = 600 seconds.
    window_sec = 600
    
    spike_df = pd.DataFrame({
        'Time': time_test,
        'y_true': y_test,
        'y_pred_proba': y_pred_proba,
        'y_pred_opt': y_pred_opt
    })
    
    # Bucket into 10-minute windows
    spike_df['Window'] = (spike_df['Time'] // window_sec) * window_sec
    
    # Compute fraud rate (average predicted positive) per window
    window_stats = spike_df.groupby('Window')['y_pred_opt'].mean().reset_index()
    window_stats.rename(columns={'y_pred_opt': 'fraud_rate'}, inplace=True)
    
    # Rolling mean and std (trailing 6 buckets, which is 60 minutes)
    window_stats['rolling_mean'] = window_stats['fraud_rate'].rolling(window=6, min_periods=1, closed='left').mean()
    window_stats['rolling_std'] = window_stats['fraud_rate'].rolling(window=6, min_periods=1, closed='left').std().fillna(0)
    
    # Flag window if fraud rate > mean + 2 * std
    window_stats['spike_threshold'] = window_stats['rolling_mean'] + 2 * window_stats['rolling_std']
    window_stats['is_spike'] = window_stats['fraud_rate'] > window_stats['spike_threshold']
    
    logger.info(f"Found {window_stats['is_spike'].sum()} spike windows out of {len(window_stats)} total windows.")
    
    # Plot spike windows
    plt.figure(figsize=(12, 6))
    plt.plot(window_stats['Window'], window_stats['fraud_rate'], label='Fraud Rate', color='blue')
    plt.plot(window_stats['Window'], window_stats['spike_threshold'], label='Spike Threshold (Mean + 2*Std)', color='orange', linestyle='--')
    
    spike_points = window_stats[window_stats['is_spike']]
    plt.scatter(spike_points['Window'], spike_points['fraud_rate'], color='red', label='Spike Detected')
    
    plt.title('Windowed Fraud Spike Detection (Test Set)')
    plt.xlabel('Time Windows (Seconds)')
    plt.ylabel('Predicted Fraud Rate')
    plt.legend()
    plt.grid(True)
    plt.savefig('spike_detection.png')
    plt.close()
    
    # 7. Export Data
    logger.info("Exporting models and results...")
    model.save_model('model.json')
    
    with open('metrics.json', 'w') as f:
        json.dump(metrics_dict, f, indent=2)
        
    # Export test_predictions.csv
    test_exports = pd.DataFrame({
        'transaction_id': test_df.index,
        'timestamp': test_df['Time'],
        'actual_label': test_df['Class'],
        'predicted_probability': [round(p, 4) for p in y_pred_proba]
    })
    test_exports.to_csv('test_predictions.csv', index=False)
    logger.info("Export complete. Check model.json, metrics.json, test_predictions.csv, and PNG plots.")

if __name__ == '__main__':
    run()
