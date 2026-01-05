import os
from datetime import datetime, date
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId
from dotenv import load_dotenv
from passlib.context import CryptContext

# Load environment variables
load_dotenv()

app = FastAPI()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__truncate_error=False)

# Valid types for validation
VALID_TRANSACTION_TYPES = ['Income', 'Expense']

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
def get_db():
    connection_string = os.getenv('MONGODB_URI', '')
    
    if not connection_string:
        raise Exception("MONGODB_URI not found in environment variables!")
    
    try:
        client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        
        db_name = os.getenv('DB_NAME', 'quickbooks_lite')
        db = client[db_name]
        
        return db
    except Exception as e:
        print(f"Database connection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

# AUTHENTICATION ROUTES

@app.post("/api/auth/login")
async def login(request: Request):
    """User login"""
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid JSON data')
    
    if not data or not data.get('email') or not data.get('password'):
        raise HTTPException(status_code=400, detail='Email and password are required')
    
    db = get_db()
    
    try:
        # Find user by email
        user = db.users.find_one({'email': data['email'].lower().strip()})
        
        if not user:
            raise HTTPException(status_code=401, detail='Invalid email or password')
        
        # Verify password
        if not pwd_context.verify(data['password'], user['password_hash']):
            raise HTTPException(status_code=401, detail='Invalid email or password')
        
        # Return user info (without password)
        return {
            'success': True,
            'user': {
                'id': str(user['_id']),
                'email': user['email'],
                'name': user.get('name', '')
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/register")
async def register(request: Request):
    """Register a new user (for testing purposes)"""
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid JSON data')
    
    if not data or not data.get('email') or not data.get('password'):
        raise HTTPException(status_code=400, detail='Email and password are required')
    
    db = get_db()
    
    try:
        email = data['email'].lower().strip()
        
        # Check if user already exists
        existing_user = db.users.find_one({'email': email})
        if existing_user:
            raise HTTPException(status_code=400, detail='User with this email already exists')
        
        # Hash password
        password_hash = pwd_context.hash(data['password'])
        
        # Create user
        user = {
            'email': email,
            'password_hash': password_hash,
            'name': data.get('name', ''),
            'created_at': datetime.now()
        }
        
        result = db.users.insert_one(user)
        
        return {
            'success': True,
            'user': {
                'id': str(result.inserted_id),
                'email': email,
                'name': user.get('name', '')
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ===== TRANSACTION ROUTES =====

@app.get("/api/transactions")
def get_transactions(start_date: str = None, end_date: str = None, transaction_type: str = None):
    """Get all transactions with optional filters"""
    db = get_db()
    
    try:
        query = {}
        
        if transaction_type:
            if transaction_type not in VALID_TRANSACTION_TYPES:
                raise HTTPException(status_code=400, detail='Invalid transaction type')
            query['transaction_type'] = transaction_type
        
        if start_date:
            query['transaction_date'] = {'$gte': start_date}
        
        if end_date:
            if 'transaction_date' in query:
                query['transaction_date']['$lte'] = end_date
            else:
                query['transaction_date'] = {'$lte': end_date}
        
        transactions = list(db.transactions.find(query).sort([('transaction_date', -1), ('_id', -1)]))
        
        result = []
        for transaction in transactions:
            trans_dict = {
                'id': str(transaction['_id']),
                'description': transaction.get('description', ''),
                'amount': float(transaction.get('amount', 0)),
                'transaction_type': transaction.get('transaction_type', ''),
                'transaction_date': transaction.get('transaction_date', '')
            }
            result.append(trans_dict)
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_transactions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/transactions")
async def create_transaction(request: Request):
    """Create a new transaction"""
    try:
        data = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail='Invalid JSON data')
    
    if not data:
        raise HTTPException(status_code=400, detail='No data provided')
    
    required_fields = ['description', 'amount', 'transaction_type']
    for field in required_fields:
        if field not in data:
            raise HTTPException(status_code=400, detail=f'{field} is required')
    
    if data['transaction_type'] not in VALID_TRANSACTION_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f'Invalid transaction_type. Must be one of: {", ".join(VALID_TRANSACTION_TYPES)}'
        )
    
    try:
        amount = float(data['amount'])
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail='Amount must be a valid number')
    
    if amount <= 0:
        raise HTTPException(status_code=400, detail='Amount must be greater than 0')
    
    if amount > 999999999.99:
        raise HTTPException(status_code=400, detail='Amount is too large')
    
    if not data['description'].strip():
        raise HTTPException(status_code=400, detail='Description cannot be empty')
    
    if len(data['description']) > 500:
        raise HTTPException(status_code=400, detail='Description must be less than 500 characters')
    
    db = get_db()
    
    try:
        transaction_date = data.get('transaction_date', date.today().isoformat())
        
        transaction = {
            'description': data['description'].strip(),
            'amount': round(amount, 2),
            'transaction_type': data['transaction_type'],
            'transaction_date': transaction_date,
            'created_at': datetime.now()
        }
        
        result = db.transactions.insert_one(transaction)
        transaction_id = str(result.inserted_id)
        
        return {'id': transaction_id, 'message': 'Transaction created successfully'}
    except Exception as e:
        print(f"Error creating transaction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(transaction_id: str):
    """Delete a transaction"""
    db = get_db()
    
    try:
        if not ObjectId.is_valid(transaction_id):
            raise HTTPException(status_code=400, detail='Invalid transaction ID')
        
        transaction = db.transactions.find_one({'_id': ObjectId(transaction_id)})
        
        if not transaction:
            raise HTTPException(status_code=404, detail='Transaction not found')
        
        result = db.transactions.delete_one({'_id': ObjectId(transaction_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail='Transaction not found')
        
        return {'message': 'Transaction deleted successfully'}
    except HTTPException:
        raise
    except InvalidId:
        raise HTTPException(status_code=400, detail='Invalid transaction ID')
    except Exception as e:
        print(f"Error deleting transaction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ===== REPORTS ROUTES =====

@app.get("/api/reports/income-statement")
def get_income_statement(start_date: str = None, end_date: str = None):
    """Get simple income statement"""
    db = get_db()
    
    try:
        query = {}
        
        if start_date:
            query['transaction_date'] = {'$gte': start_date}
        
        if end_date:
            if 'transaction_date' in query:
                query['transaction_date']['$lte'] = end_date
            else:
                query['transaction_date'] = {'$lte': end_date}
        
        transactions = list(db.transactions.find(query))
        
        income = 0.0
        expenses = 0.0
        
        for transaction in transactions:
            amount = float(transaction.get('amount', 0))
            trans_type = transaction.get('transaction_type', '')
            
            if trans_type == 'Income':
                income += amount
            elif trans_type == 'Expense':
                expenses += amount
        
        net_income = income - expenses
        
        return {
            'income': round(income, 2),
            'expenses': round(expenses, 2),
            'net_income': round(net_income, 2)
        }
    except Exception as e:
        print(f"Error in income statement: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    try:
        db = get_db()
        db.command('ping')
        return {'status': 'ok', 'database': 'connected'}
    except Exception as e:
        return {'status': 'error', 'database': 'disconnected', 'error': str(e)}

if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv('PORT', 5000))
    print(f"Starting server on port {port}...")
    uvicorn.run(app, host='0.0.0.0', port=port)