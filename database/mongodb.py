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
accounts_collection = db.accounts
transactions_collection = db.transactions

# Create indexes
accounts_collection.create_index('account_type')
accounts_collection.create_index('name')
transactions_collection.create_index('account_id')
transactions_collection.create_index('transaction_date')

# Default accounts 
accounts = [
    {'name': 'Sales', 'account_type': 'Income', 'balance': 0.00, 'created_at': datetime.now()},
    {'name': 'Ingredients', 'account_type': 'Expense', 'balance': 0.00, 'created_at': datetime.now()},
    {'name': 'Supplies', 'account_type': 'Expense', 'balance': 0.00, 'created_at': datetime.now()},
    {'name': 'Accounts Receivable', 'account_type': 'Asset', 'balance': 0.00, 'created_at': datetime.now()},
    {'name': 'Accounts Payable', 'account_type': 'Liability', 'balance': 0.00, 'created_at': datetime.now()}
]

# Inserts default accounts
existing_accounts = accounts_collection.find({}, {'name': 1})
existing_names = [acc['name'] for acc in existing_accounts]

for account in accounts:
    if account['name'] not in existing_names:
        accounts_collection.insert_one(account)
        print(f"Inserted account: {account['name']}")
    else:
        print(f"Account already exists: {account['name']}")

print("MongoDB initialization complete!")
client.close()

