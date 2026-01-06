# Financial Management System

A modern financial tracking application for small businesses. Track income, expenses, and generate reports with a clean, dark-themed interface.

---

## Features

- User authentication with secure password hashing
- Track income and expenses
- Generate income statements with date filtering
- Print-friendly financial reports
- Modern dark UI with glassmorphism effects

---

## Tech Stack

**Backend:** FastAPI, MongoDB, Python 3.11  
**Frontend:** React, TypeScript, Tailwind CSS, Vite

---

## Quick Start

### 1. Setup Backend

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
DB_NAME=financial_db
PORT=5000
```

Start backend:
```bash
python main.py
```

### 2. Setup Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Create First User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password",
    "name": "Admin"
  }'
```

---

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI app
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment config
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.tsx          # Main app
│   │   └── index.css        # Tailwind styles
│   ├── .env.local           # Frontend config
│   └── package.json         # Node dependencies
└── README.md
```

---

## API Endpoints

**Auth:**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

**Transactions:**
- `GET /api/transactions` - List (with date filters)
- `POST /api/transactions` - Create
- `DELETE /api/transactions/{id}` - Delete

**Reports:**
- `GET /api/reports/income-statement` - Income statement (with date filters)

---

## Troubleshooting

**Backend won't start:**
- Check MongoDB connection string in `.env`
- Verify virtual environment is activated
- Ensure port 5000 is available

**Frontend connection errors:**
- Verify backend is running on port 5000
- Check `VITE_API_URL` in `.env.local`
- Hard refresh browser: `Ctrl+Shift+R`

**MongoDB connection fails:**
- Whitelist your IP in MongoDB Atlas
- Verify connection string format
- Check database user permissions

---

## License

MIT License

---

Made for small businesses