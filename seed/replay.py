import requests
import json
import time
import random

API_URL = "http://localhost:8888/predict"

def get_dummy_features():
    feats = {}
    for i in range(1, 29):
        feats[f'V{i}'] = random.uniform(-2, 2)
    return feats

def run():
    print("Starting replay script against new FastAPI backend...")
    
    for i in range(150):
        payload = {
            "features": get_dummy_features(),
            "amount": random.uniform(1, 1000)
        }
        try:
            resp = requests.post(API_URL, json=payload)
            if resp.status_code == 200:
                print(f"[{i}] Sent successfully: {resp.json()}")
            else:
                print(f"[{i}] Failed: {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"[{i}] Failed connecting to API: {e}")
            break
        
        # throttle
        time.sleep(0.1)
    
    print("Replay finished.")

if __name__ == '__main__':
    run()
