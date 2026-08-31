CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(255) PRIMARY KEY,
    timestamp BIGINT,
    amount FLOAT,
    features_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS predictions (
    id VARCHAR(255) PRIMARY KEY,
    transaction_id VARCHAR(255) REFERENCES transactions(id),
    predicted_probability FLOAT,
    predicted_label INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_predictions (
    transaction_id VARCHAR(255) PRIMARY KEY,
    timestamp BIGINT,
    actual_label INT,
    predicted_probability FLOAT,
    amount FLOAT
);

-- Load the test predictions data
COPY test_predictions (transaction_id, timestamp, actual_label, predicted_probability, amount)
FROM '/data/test_predictions.csv'
DELIMITER ','
CSV HEADER;
