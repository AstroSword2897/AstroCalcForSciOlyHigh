# ngrok Setup Steps - Quick Guide

## ✅ Current Step: Account Setup

You're in the ngrok dashboard setting up your account. Here's what to do:

### MFA (Multi-factor Authentication) - Optional

**You can skip MFA for now** - it's not required for basic tunneling. You can:
- Click "Skip" or "Maybe Later" if available
- Or enable it later in User Settings if you want extra security

### Next Steps:

1. **Get Your Authtoken:**
   - Look for "Your Authtoken" or "Get Started" section in the dashboard
   - Copy the authtoken (long string of characters)
   - It looks like: `2abc123def456ghi789jkl012mno345pq_6r7s8t9u0v1w2x3y4z5`

2. **Configure ngrok on your computer:**
   ```bash
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

3. **Start your tunnel with custom password:**
   ```bash
   ./start_ngrok_with_password.sh admin yourpassword
   ```

---

## 🎯 Quick Path Forward

1. **Skip MFA** (optional, can add later)
2. **Find "Your Authtoken"** in the dashboard
3. **Run:** `./setup_ngrok_quick.sh` (it will ask for your token)
4. **Start tunnel:** `./start_ngrok_with_password.sh admin yourpassword`

---

## 📋 What You'll Get

After setup, you'll have:
- ✅ Public URL (like `https://abc123.ngrok.io`)
- ✅ Custom username/password (not your IP address)
- ✅ Secure HTTPS connection
- ✅ Full calculator access for users

---

**Need help finding the authtoken?** Look for:
- "Your Authtoken" section
- "Get Started" button
- "Setup" or "Configuration" tab
- Usually on the main dashboard page

