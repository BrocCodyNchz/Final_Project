import os
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Connect to MongoDB Atlas
connection_string = os.getenv('MONGODB_URI', '')

if not connection_string:
    print("ERROR: MONGODB_URI not found check your .env file.")
    exit(1)

# Use MongoDB Atlas connection string
client = MongoClient(connection_string)
db_name = os.getenv('DB_NAME', 'quickbooks_lite')
db = client[db_name]
print(f"Connected to MongoDB Atlas database: {db_name}")

# Create collections
transactions_collection = db.transactions

# Create indexes
transactions_collection.create_index('amount')
transactions_collection.create_index('transaction_date')
transactions_collection.create_index('transaction_type')


print("MongoDB initialization complete!")
client.close()

