# 🎯 Quick Reference Card - Authentication System

## 📋 Password Requirements
```
Minimum 8 characters
✓ At least one UPPERCASE letter (A-Z)
✓ At least one lowercase letter (a-z)  
✓ At least one number (0-9)

✅ Valid:   MyPassword123
❌ Invalid: mypassword123 (no uppercase)
❌ Invalid: MyPassword (no number)
❌ Invalid: pass (too short)
```

## 📧 Email & Name Requirements
```
Email:  Must be valid format (user@domain.com)
Name:   2-60 characters
        Must not be empty
        Will be trimmed of whitespace
```

## 🔗 API Endpoints

### Authentication
```
POST /api/auth/signup
  Body: { name, email, password }
  Response: { user, token }

POST /api/auth/login
  Body: { email, password }
  Response: { user, token }

GET /api/auth/me
  Headers: Authorization: Bearer {token}
  Response: { user }
```

## 🏠 Application Routes
```
/login          → Login page
/signup         → Sign up page
/               → Dashboard (protected)
/mockinterview  → Mock interview (protected)
/analysis       → Analysis page (protected)
```

## 💾 LocalStorage Keys
```
mygpt:user      → Stores user object { name, email, _id }
mygpt:token     → Stores JWT token (7-day expiration)
```

## 🔐 Error Messages Guide

### Signup/Login Errors
| Error | Meaning | Action |
|-------|---------|--------|
| "Email is required" | Email field empty | Enter valid email |
| "Password is required" | Password field empty | Enter password |
| "Name must be at least 2 characters" | Name too short | Enter name 2-60 chars |
| "Password must contain uppercase letter" | Weak password | Add uppercase letter |
| "Email already registered" | Email exists | Use different email |
| "Invalid email or password" | Wrong credentials | Check email/password |

### Session Errors
| Error | Meaning | Action |
|-------|---------|--------|
| "Authentication required" | No token provided | Log in again |
| "Invalid token" | Token corrupted | Log in again |
| "Session expired" | Token exceeded 7 days | Log in again |

## 🔄 State Flow Diagram

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ Check localStorage   │
└──────┬───────────────┘
       │
   ┌───┴─────────────────────────┐
   │                             │
   ▼                             ▼
┌─────────┐                  ┌──────────┐
│ NO DATA │                  │ HAS DATA │
└──┬──────┘                  └────┬─────┘
   │                             │
   ▼                             ▼
┌──────────────┐         ┌──────────────┐
│ /login page  │         │  Dashboard   │
└──┬───────────┘         └────┬─────────┘
   │                          │
   │ (login/signup)           │ (logout)
   │                          │
   ▼                          ▼
┌──────────────┐         ┌──────────────┐
│ Save token   │         │ Clear storage│
│ Save user    │         │ Clear state  │
└──────┬───────┘         └────┬─────────┘
       │                      │
       └──────────┬───────────┘
                  │
                  ▼
            ┌──────────────┐
            │   LOGIN PAGE │
            └──────────────┘
```

## 🛠️ Troubleshooting Quick Fixes

```bash
# Issue: Login not working
Solution 1: Check backend is running on port 3000
Solution 2: Verify MongoDB connection
Solution 3: Check MONGO_URL in .env

# Issue: Password validation not working
Solution: Ensure password has uppercase, lowercase, and number

# Issue: Token not persisting
Solution: Check localStorage is enabled in browser

# Issue: Logout button not showing
Solution: Verify latest SideBar.jsx and SideBar.css are used

# Issue: CORS errors
Solution: Ensure CLIENT_ORIGIN in backend .env matches frontend URL
```

## 📱 UI Components

### Login/Signup Form
- Name field (signup only)
- Email field with validation
- Password field with requirements
- Error messages per field
- Submit button with loading state

### Sidebar
- User info card (name & email)
- Red logout button with confirmation
- New chat button
- Navigation links
- Recent threads list

## 🧪 Test Credentials

### For Testing
```
Email: test@example.com
Password: TestPassword123

Name: Test User
```

### Valid Password Examples
```
ValidPass123
MyApp2024Pass
Secure123Pass
```

## 📊 Token Information
```
Type:       JWT (JSON Web Token)
Expiration: 7 days (604,800 seconds)
Format:     Bearer {token}
Header:     Authorization: Bearer {token}
Payload:    { id: userId, iat, exp }
```

## 🔄 Common Workflows

### First Time User
1. Visit http://localhost:5173
2. Redirected to /login
3. Click "Need an account?"
4. Enter name, email, password
5. Click Sign up
6. Redirected to dashboard

### Returning User
1. Visit http://localhost:5173
2. Check localStorage
3. Restore session
4. Show dashboard directly
5. No re-login needed

### Logout and Re-login
1. Click logout button
2. Confirm dialog
3. Redirected to login
4. Enter credentials again
5. New token generated

## 📈 Performance Tips

- ✅ Token cached in localStorage (no extra API calls)
- ✅ User info cached in localStorage (no extra API calls)
- ✅ Email indexed in database (fast user lookups)
- ✅ Password hashed only on signup/change (not on every login)
- ✅ Context memoized to prevent unnecessary re-renders

## 🚀 Ready to Deploy?

Pre-deployment checklist:
- [ ] Change JWT_SECRET to strong random value
- [ ] Test all auth flows
- [ ] Verify CORS settings
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Test on mobile browsers
- [ ] Test on slow networks
- [ ] Verify error messages are user-friendly

---

**Keep this card handy for quick reference! 📍**
