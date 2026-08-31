import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

unpooled_url = os.environ.get("DATABASE_URL_UNPOOLED", os.environ.get("DATABASE_URL"))

try:
    conn = psycopg2.connect(unpooled_url)
    conn.autocommit = True
    cursor = conn.cursor()
    
    cursor.execute("TRUNCATE TABLE test_predictions")
    print("Truncated test_predictions")
    
    try:
        with open('../model/test_predictions.csv', 'r') as f:
            next(f)
            cursor.copy_from(f, 'test_predictions', sep=',', null="")
            print("Successfully inserted new 57,000 rows into test_predictions!")
    except Exception as e:
        print(f"File err: {e}")
        
except Exception as e:
    print(f"DB err: {e}")
finally:
    if 'conn' in locals():
        conn.close()
