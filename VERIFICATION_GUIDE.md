# Blood Donation Management System - Verification Guide

## Step 1: Start Backend Server ✅

```powershell
cd d:\FYYP\FYP\backend
npm start
```

**Expected Output:**
```
✅ Connected to SQLite database
✅ Users table created/verified
✅ Default admin account added to users table
✅ Server is listening on port 3000
```

**What it does:**
- Initializes SQLite database with all tables
- Creates default admin account (admin@bdms.com / admin123)
- Starts Express server on http://localhost:3000
- Ready to accept API requests

---

## Step 2: Start Frontend App ✅

**In a NEW terminal:**

```powershell
cd d:\FYYP\FYP
npm start
```

**Expected Output:**
```
Starting Metro Bundler
Starting project at D:\FYYP\FYP
✓ Expo Go ready at exp://192.168.x.x:8081
Web is waiting on http://localhost:8081
```

**What it does:**
- Compiles React Native app
- Metro bundler starts
- App is ready on web or mobile

---

## Step 3: Verify Backend API (Optional but Recommended)

Test API endpoints directly using Postman or PowerShell:

```powershell
# Test backend is running
curl http://localhost:3000/api/health

# Or try this for admin login
$body = @{
    email = "admin@bdms.com"
    password = "admin123"
} | ConvertTo-Json

curl -X POST http://localhost:3000/api/login `
  -H "Content-Type: application/json" `
  -Body $body
```

---

## Step 4: Test Registration Flow

### In the App:

1. **Open App** → Tap "Register"
2. **Select Role** → Choose "Donor" or "Recipient"
3. **Enter Details:**
   - Name: `Test User`
   - Email: `testuser@gmail.com` (must be unique)
   - Password: `Test@123`
   - Confirm Password: `Test@123`
4. **Send Verification Code** → Check console for code (format: 6 digits)
5. **Enter Code** → Paste the verification code from server logs
6. **Complete Registration**

**Expected Result:**
✅ Account created successfully
✅ User logged in automatically
✅ Profile form appears

---

## Step 5: Test Complete Profile Setup

### For Donor:
- Blood Group: Select from dropdown
- Age, Weight: Enter values
- Medical History: Fill form
- **Submit** → Profile sent for admin approval

### For Recipient:
- Blood Group: Select
- Medical Condition: Enter details
- **Submit** → Profile sent for admin approval

**Expected Result:**
✅ Profile data saved to database
✅ Status shows "PENDING" (waiting for admin approval)

---

## Step 6: Test Admin Dashboard

1. **Logout** from current account
2. **Login as Admin:**
   - Email: `admin@bdms.com`
   - Password: `admin123`
3. **Navigate to:** Admin Dashboard
4. **See Pending Profiles:** Should show submitted donor/recipient profiles
5. **Approve/Reject:** Click approve button for submitted profiles

**Expected Result:**
✅ Admin can see all pending profiles
✅ Can approve/reject profiles
✅ Users get updated status

---

## Step 7: Test Password Reset

1. **Go to Login Screen**
2. **Tap "Forgot Password"**
3. **Enter Email:** testuser@gmail.com
4. **Send Code** → Check server logs for verification code
5. **Enter Code & New Password**
6. **Confirm Password Reset**

**Expected Result:**
✅ Password changed successfully
✅ Can login with new password

---

## Step 8: Test Blood Request (After Approval)

**As Recipient:**
1. Go to Home Screen
2. **Create Blood Request:**
   - Blood Type: O+
   - Urgency: High
   - Units: 2
   - Hospital: City Hospital
3. **Submit**

**As Donor:**
1. Go to Home Screen
2. **See Available Requests**
3. **Accept Request** → View recipient details
4. **Navigate to Hospital**
5. **Complete Donation**

**Expected Result:**
✅ Request visible to all donors
✅ Donors can accept
✅ Completion tracking works

---

## Troubleshooting Guide

### Backend Won't Start
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F

# Try again
npm start
```

### Email Not Sending
- Check `.env` file has correct Gmail credentials
- Verify Gmail account has "Less secure apps" enabled
- Or use App Password (recommended)

### Frontend Connection Error
- Ensure backend is running on localhost:3000
- Check API_BASE_URL in `src/services/api/apiClient.ts`
- Verify network connectivity

### Database Locked
```powershell
# Delete old database and restart
rm backend/bdms.db
npm start
```

---

## Key Test Accounts

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin | admin@bdms.com | admin123 | Admin |
| Test Donor | testdonor@gmail.com | Test@123 | Donor |
| Test Recipient | testrecipient@gmail.com | Test@123 | Recipient |

---

## Expected Verification Codes

When you request a verification code, check the **backend console** output. Example:
```
Verification code for testuser@gmail.com: 654321
```

Copy this 6-digit code into the app.

---

## Success Checklist ✅

- [ ] Backend server starts without errors
- [ ] Frontend app compiles without errors
- [ ] Can register as donor/recipient
- [ ] Email verification code appears in console
- [ ] Can complete profile setup
- [ ] Admin can approve profiles
- [ ] Can create blood requests
- [ ] Can search and accept requests
- [ ] Password reset works
- [ ] Admin dashboard displays all data

---

## Next Steps

If all tests pass:
1. **Deploy backend** to cloud (Heroku, Azure, AWS)
2. **Update API_BASE_URL** to production URL
3. **Build APK/IPA** for mobile
4. **Submit to App Store**

Questions? Check server logs and frontend console for errors!
