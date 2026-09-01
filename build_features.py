import pandas as pd
import os

print("Loading massive creditcard.csv...")
raw_df = pd.read_csv("data/creditcard.csv")
sorted_df = raw_df.sort_values('Time').reset_index(drop=True)
sorted_df['OriginalIndex'] = sorted_df.index

print("Loading test_predictions.csv...")
test_preds = pd.read_csv("model/test_predictions.csv")
test_tx_ids = set(test_preds['transaction_id'])

print("Filtering only required feature vectors...")
test_features_df = sorted_df[sorted_df['OriginalIndex'].isin(test_tx_ids)]

print(f"Extracted subset: {len(test_features_df)} rows.")

out_path = "model/test_features.csv"
test_features_df.to_csv(out_path, index=False)

mb_size = os.path.getsize(out_path) / (1024 * 1024)
print(f"Saved {out_path} at size: {mb_size:.2f} MB")
