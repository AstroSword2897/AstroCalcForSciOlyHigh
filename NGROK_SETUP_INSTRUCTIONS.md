# Quick Setup: ngrok with Custom Password

## 🚀 Get Your Server Link with Custom Password

### Step 1: Configure ngrok (One-time setup)

1. **Sign up for free ngrok account:**
   - Go to: https://dashboard.ngrok.com
   - Sign up (it's free)
   - Log in to your dashboard

2. **Get your authtoken:**
   - In the dashboard, go to "Your Authtoken" section
   - Copy the token (looks like: `2abc123def456ghi789jkl012mno345pq_6r7s8t9u0v1w2x3y4z5`)

3. **Configure ngrok:**
   ```bash
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

   Or run the quick setup script:
   ```bash
   ./setup_ngrok_quick.sh
   ```

### Step 2: Start tunnel with custom password

```bash
./start_ngrok_with_password.sh [username] [password]
```

**Examples:**
```bash
# Default (username: admin, password: calculator2024)
./start_ngrok_with_password.sh

# Custom username and password
./start_ngrok_with_password.sh myuser mypassword123

# Just custom password (username: admin)
./start_ngrok_with_password.sh admin mysecurepass
```

### Step 3: Get your public URL

After starting, ngrok will display:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:8000
```

**That's your public URL!** Share it with users along with:
- **Username:** (what you set)
- **Password:** (what you set)

---

## 📋 Quick Reference

**Current setup script:** `./start_ngrok_with_password.sh`  
**Default username:** `admin`  
**Default password:** `calculator2024`

**To change:** Run with custom values:
```bash
./start_ngrok_with_password.sh yourusername yourpassword
```

---

## ✅ Benefits of ngrok vs localtunnel

- ✅ **Custom password** (not your IP address)
- ✅ **More reliable** connection
- ✅ **HTTPS by default**
- ✅ **Web dashboard** to monitor traffic
- ✅ **Stable URLs** (can reserve custom domains)

---

## 🛑 To Stop

Press `Ctrl+C` in the terminal where ngrok is running.

