# 🧪 Testing Guide for Authentication System

## Prerequisites
- Backend running: `npm start` (from `/backend`)
- Frontend running: `npm run dev` (from `/frontend`)
- MongoDB connected and running
- Environment variables configured

---

## 📝 Test Cases

### 1. SIGNUP VALIDATION TESTS

#### Test 1.1: Weak Password (No Uppercase)
**Input:**
- Name: John Doe
- Email: john@example.com
- Password: password123

**Expected:** ❌ Error message: "Password must contain at least one uppercase letter"

#### Test 1.2: Weak Password (No Number)
**Input:**
- Name: John Doe
- Email: john@example.com
- Password: PasswordTest

**Expected:** ❌ Error message: "Password must contain at least one number"

#### Test 1.3: Short Password
**Input:**
- Name: John Doe
- Email: john@example.com
- Password: Pass1

**Expected:** ❌ Error message: "Password must be at least 8 characters"

#### Test 1.4: Short Name
**Input:**
- Name: J
- Email: john@example.com
- Password: Password123

**Expected:** ❌ Error message: "Name must be at least 2 characters"

#### Test 1.5: Invalid Email
**Input:**
- Name: John Doe
- Email: invalid.email
- Password: Password123

**Expected:** ❌ Error message: "Please enter a valid email address"

#### Test 1.6: Valid Signup
**Input:**
- Name: John Doe
- Email: john.doe@example.com
- Password: Password123

**Expected:** ✅ Success! Redirect to dashboard, user logged in

#### Test 1.7: Duplicate Email
**Steps:**
1. Sign up with test@example.com successfully
2. Try to sign up again with the same email

**Expected:** ❌ Error message: "Email is already registered. Please log in instead."

---

### 2. LOGIN TESTS

#### Test 2.1: Wrong Password
**Input:**
- Email: (from successful signup)
- Password: WrongPassword123

**Expected:** ❌ Error message: "Invalid email or password"

#### Test 2.2: Non-existent Email
**Input:**
- Email: nonexistent@example.com
- Password: Password123

**Expected:** ❌ Error message: "Invalid email or password"

#### Test 2.3: Valid Login
**Input:**
- Email: (from successful signup)
- Password: (correct password from signup)

**Expected:** ✅ Success! Redirect to dashboard

#### Test 2.4: Empty Email
**Input:**
- Email: (empty)
- Password: Password123

**Expected:** ❌ Error message: "Email is required"

#### Test 2.5: Empty Password
**Input:**
- Email: test@example.com
- Password: (empty)

**Expected:** ❌ Error message: "Password is required"

---

### 3. LOGOUT TESTS

#### Test 3.1: Logout Button Visible
**Steps:**
1. Log in successfully
2. Look at sidebar footer

**Expected:** ✅ User info (name & email) displayed
✅ Red "Log out" button visible

#### Test 3.2: Logout Confirmation
**Steps:**
1. Log in successfully
2. Click logout button
3. Look for confirmation dialog

**Expected:** ✅ Confirmation dialog appears
- Message: "Are you sure you want to log out?"
- Two buttons: Cancel and OK

#### Test 3.3: Logout Cancellation
**Steps:**
1. Log in successfully
2. Click logout button
3. Click "Cancel" in dialog

**Expected:** ✅ Dialog closes
✅ Still logged in (user info still visible)

#### Test 3.4: Complete Logout
**Steps:**
1. Log in successfully
2. Click logout button
3. Click "OK" in confirmation dialog

**Expected:** ✅ Redirected to login page
✅ No user data in localStorage

#### Test 3.5: Logout State Persistence
**Steps:**
1. Log in and log out
2. Refresh page

**Expected:** ✅ Still on login page
✅ Cannot access dashboard

---

### 4. SESSION PERSISTENCE TESTS

#### Test 4.1: Page Refresh After Login
**Steps:**
1. Log in successfully
2. Refresh page (F5 or Ctrl+R)

**Expected:** ✅ Still logged in
✅ Dashboard visible
✅ User info shows in sidebar

#### Test 4.2: Clear localStorage and Refresh
**Steps:**
1. Log in successfully
2. Open DevTools → Application → Local Storage
3. Delete `mygpt:user` and `mygpt:token`
4. Refresh page

**Expected:** ❌ Redirected to login page
❌ Cannot access dashboard

#### Test 4.3: Multiple Tabs
**Steps:**
1. Log in in Tab 1
2. Open Tab 2, visit dashboard
3. Logout in Tab 1
4. Go to Tab 2

**Expected:** Tab 2 still shows dashboard (localStorage is shared)
**Note:** Token validation happens when API calls are made

---

### 5. ROUTING & REDIRECT TESTS

#### Test 5.1: Access Protected Route Without Login
**Steps:**
1. Clear localStorage
2. Visit http://localhost:5173/

**Expected:** ❌ Redirected to http://localhost:5173/login

#### Test 5.2: Direct Login Page Access
**Steps:**
1. Log in and go to dashboard
2. Visit http://localhost:5173/login

**Expected:** ✅ Redirected back to dashboard

#### Test 5.3: Switch Between Auth Pages
**Steps:**
1. On login page, click "Need an account?" link

**Expected:** ✅ Redirected to signup page

**Steps:**
1. On signup page, click "Already have an account?" link

**Expected:** ✅ Redirected to login page

---

### 6. ERROR HANDLING TESTS

#### Test 6.1: Network Error
**Steps:**
1. Stop backend server
2. Try to log in

**Expected:** ❌ Error message appears (network error)

#### Test 6.2: Token Expiration
**Note:** Tokens expire in 7 days, so this test requires:

**Steps:**
1. Manually set token expiration to 1 second in `backend/routes/auth.js`
2. Log in
3. Wait more than 1 second
4. Try to access protected API (e.g., fetch threads)

**Expected:** ❌ Error message: "Your session has expired. Please log in again."

---

### 7. FIELD ERROR DISPLAY TESTS

#### Test 7.1: Error on Invalid Input
**Steps:**
1. On signup, enter invalid name (1 character)
2. Press Tab to move to next field

**Expected:** ❌ Red error message appears below name field
❌ Input field has red border

#### Test 7.2: Error Clears on Input
**Steps:**
1. See error from Test 7.1
2. Start typing in the name field

**Expected:** ✅ Red error disappears immediately
✅ Border returns to normal color

#### Test 7.3: Multiple Field Errors
**Steps:**
1. Click submit without filling any fields

**Expected:** ❌ All three fields show error messages:
- Name: "Name is required"
- Email: "Email is required"
- Password: "Password is required"

---

### 8. BROWSER COMPATIBILITY TESTS

#### Test 8.1: Chrome/Edge
- [ ] Signup form works
- [ ] Login form works
- [ ] Logout works
- [ ] Validation messages appear

#### Test 8.2: Firefox
- [ ] All above tests pass
- [ ] CSS styling is correct

#### Test 8.3: Safari
- [ ] All above tests pass
- [ ] Touch targets are large enough

---

## 🎯 Acceptance Criteria

- ✅ All passwords must be hashed with bcryptjs
- ✅ All errors must have user-friendly messages
- ✅ UI must be responsive (mobile, tablet, desktop)
- ✅ Logout must clear all user data
- ✅ Protected routes must require authentication
- ✅ Session must persist across page refreshes
- ✅ Token expiration must be handled gracefully
- ✅ All forms must validate in real-time

---

## 📊 Test Results Template

```
Date: [DATE]
Tester: [NAME]

Test 1.1: [PASS/FAIL] Notes: ___________
Test 1.2: [PASS/FAIL] Notes: ___________
Test 1.3: [PASS/FAIL] Notes: ___________
...

Overall Status: [ALL PASS / SOME FAILED]
Issues Found: [NONE / LIST ISSUES]
```

---

## 🐛 Troubleshooting

### Issue: "Cannot GET /login"
**Solution:** Make sure frontend is running and you're accessing the correct URL

### Issue: "401 Authentication required"
**Solution:** 
- Check if token is being stored in localStorage
- Verify JWT_SECRET matches between frontend and backend
- Check if token is expired

### Issue: "Email already registered" but email is new
**Solution:**
- Check MongoDB for duplicate entries
- Clear database and try again

### Issue: "Password doesn't meet requirements"
**Solution:**
Requirements:
- At least 8 characters
- At least one UPPERCASE letter
- At least one lowercase letter
- At least one number

Example valid: `MyPassword123`

---

**All tests should pass before considering authentication complete! ✅**
