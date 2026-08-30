import os
import json
import xgboost as xgb

def export_feature_importance():
    model_path = "model.json"
    out_path = "feature_importance.json"
    
    if not os.path.exists(model_path):
        print(f"Error: {model_path} not found.")
        return
        
    print(f"Loading {model_path}...")
    model = xgb.XGBClassifier()
    model.load_model(model_path)
    
    booster = model.get_booster()
    # 'gain' usually provides the most intuitive importance for business (average gain of splits)
    scores = booster.get_score(importance_type='gain')
    
    if not scores:
        print("Error: No feature importance scores found.")
        return
        
    # Sort by importance descending
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    
    # Take top 10
    top_features = [{"feature": k, "importance": float(v)} for k, v in sorted_scores[:10]]
    
    with open(out_path, "w") as f:
        json.dump(top_features, f, indent=4)
        
    print(f"Exported top {len(top_features)} features to {out_path}.")

if __name__ == "__main__":
    export_feature_importance()
