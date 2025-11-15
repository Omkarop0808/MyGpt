# 🚀 Quick Start Guide - Run Your Application

## ⚡ 30-Second Quick Start

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend (new terminal)
cd frontend
npm run dev
```

Then open: **http://localhost:5173** in your browser

---

## 📋 Step-by-Step Guide

### Prerequisites
- Node.js installed
- MongoDB running
- Two terminal windows

---

### Step 1: Create `.env` Files

**Create `backend/.env`:**
```
MONGO_URL=mongodb://localhost:27017/mygpt
JWT_SECRET=MySecretKey2024ChangeInProduction
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_api_key_here
```

**Create `frontend/.env`:**
```
VITE_API_URL=http://localhost:3000
```

---

### Step 2: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

---

### Step 3: Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**Mac:**
```bash
brew services start mongodb-community
```

**Or verify MongoDB is running:**
```bash
# Should return version info
mongod --version
```

---

### Step 4: Start Backend

```bash
cd backend
npm start
```

**Expected Output:**
```
mongodb is connected successfully
🚀 Server running at 3000
```

✅ Backend is ready!

---

### Step 5: Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
Local: http://localhost:5173
Press q to quit
```

✅ Frontend is ready!

---

### Step 6: Open Application

Open your browser and visit:
```
http://localhost:5173
```

You should see the **Login Page**

---

## 🧪 Test the Application

### Test 1: Create Account
1. Click "Need an account?"
2. Fill in:
   - **Name:** Your Name
   - **Email:** test@example.com
   - **Password:** TestPassword123 (needs uppercase, lowercase, number)
3. Click "Sign up"
4. ✅ Should go to dashboard

### Test 2: Login
1. Click "Already have an account?"
2. Enter:
   - **Email:** test@example.com
   - **Password:** TestPassword123
3. Click "Log in"
4. ✅ Should go to dashboard

### Test 3: Logout
1. Look at sidebar (left side)
2. Scroll to bottom
3. Click red "Log out" button
4. Confirm in dialog
5. ✅ Should go back to login page

### Test 4: Check Persistence
1. Login again
2. Refresh page (F5)
3. ✅ Should still be logged in (session persisted)

---

## 🎯 Features to Explore

Once logged in:

- **New Chat** - Start a new conversation
- **Workspace** - Chat with AI
- **Mock Interview** - Practice interviews
- **Analysis** - View analytics
- **User Info** - See your profile (bottom of sidebar)
- **Logout** - Sign out safely

---

## ⚠️ Common Issues & Fixes

### Issue: "mongodb is not connected"

**Solution:** Start MongoDB
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community
```

### Issue: "Port 3000 already in use"

**Solution:** Use different port
```bash
# Modify backend/.env
PORT=3001
```

### Issue: "Cannot GET /signup"

**Solution:** Make sure frontend is running
```bash
cd frontend
npm run dev
```

### Issue: "CORS error"

**Solution:** Check `CLIENT_ORIGIN` in backend/.env
```
CLIENT_ORIGIN=http://localhost:5173
```

### Issue: "Password doesn't meet requirements"

**Solution:** Use strong password with:
- ✅ At least 8 characters
- ✅ One uppercase letter (A-Z)
- ✅ One lowercase letter (a-z)
- ✅ One number (0-9)

**Example:** `MyPassword123`

---

## 📊 Check Everything Works

### Backend Health Check
Visit: `http://localhost:3000`

Should see: `Cannot GET /` (This is normal - no route on root)

### Frontend Health Check
Visit: `http://localhost:5173`

Should see: Login page with MYGPT logo

### API Health Check
Check browser DevTools:
1. Press F12
2. Go to "Network" tab
3. Try to login
4. Should see POST request to `/api/auth/login`
5. Response should be `200` (success) or `401` (wrong credentials)

---

## 🛑 How to Stop

**Backend:**
```bash
Press Ctrl+C in backend terminal
```

**Frontend:**
```bash
Press Ctrl+C in frontend terminal
# Or press 'q' (if running with Vite)
```

**MongoDB:**
```bash
# Windows
net stop MongoDB

# Mac
brew services stop mongodb-community
```

---

## 📱 Access from Other Devices

If you want to access from another device:

1. Find your computer's IP address:
```bash
# Windows
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.x.x)

# Mac
ifconfig
# Look for "inet" under "en0" or "en1"
```

2. Update `frontend/.env`:
```
VITE_API_URL=http://YOUR_IP:3000
```

3. Access from other device:
```
http://YOUR_IP:5173
```

---

## 🔍 Troubleshooting Commands

### Check Node.js version
```bash
node --version
# Should be 14+
```

### Check npm version
```bash
npm --version
# Should be 6+
```

### Clear npm cache
```bash
npm cache clean --force
```

### Reinstall dependencies
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Check if port is in use
```bash
# Windows
netstat -ano | findstr :3000

# Mac
lsof -i :3000
```

---

## 📚 Need Help?

Check these documentation files:
- `LAUNCH_CHECKLIST.md` - Full status report
- `IMPROVEMENTS_SUMMARY.md` - What was improved
- `TESTING_GUIDE.md` - Complete test cases
- `QUICK_REFERENCE.md` - Quick reference

---

## ✅ Success Checklist

- [ ] MongoDB is running
- [ ] `.env` files created with values
- [ ] Backend npm modules installed
- [ ] Frontend npm modules installed
- [ ] Backend started successfully (Port 3000)
- [ ] Frontend started successfully (Port 5173)
- [ ] Can see login page
- [ ] Can create account
- [ ] Can login
- [ ] Can logout
- [ ] Session persists on refresh

---

## 🎉 You're All Set!

Your MyGPT application is ready to run!

**Enjoy building! 🚀**

---

### Quick Command Reference

```bash
# Start backend
cd backend && npm start

# Start frontend (new terminal)
cd frontend && npm run dev

# Stop everything
Press Ctrl+C in each terminal

# Restart
Repeat start commands

# Check logs
Look at terminal output

# Access app
http://localhost:5173
```

**Happy coding!** 😊
