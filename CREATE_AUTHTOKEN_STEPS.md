# Create ngrok Authtoken - Quick Steps

## ✅ You're on the Right Page!

You're at the Authtokens page. Now you need to **create a new authtoken**.

### Steps:

1. **Click the "+ Add Authtoken" button** (top right of the table)

2. **Fill in the form:**
   - **Description:** (optional) e.g., "AstroCalc Server"
   - **ACL:** Leave default (unless you need restrictions)
   - Click **"Add Authtoken"**

3. **Copy the authtoken:**
   - A new authtoken will be created
   - **Copy the entire token** (it's a long string)
   - ⚠️ **Important:** This is the only time you'll see it!

4. **Configure ngrok:**
   ```bash
   ngrok config add-authtoken YOUR_NEW_AUTHTOKEN_HERE
   ```

5. **Start your tunnel:**
   ```bash
   ./start_ngrok_and_show_url.sh admin calculator2024
   ```

---

## 🔍 What You'll See

After clicking "+ Add Authtoken", you'll get:
- A new authtoken (long string, 40+ characters)
- It does **NOT** start with `cr_`
- It looks like: `2abc123def456ghi789jkl012mno345pq_6r7s8t9u0v1w2x3y4z5`

---

## ⚠️ Important

- The authtoken is shown **only once** when created
- Copy it immediately!
- If you lose it, you'll need to create a new one

---

## 🚀 After Creating

Once you have the authtoken:
1. Run: `ngrok config add-authtoken YOUR_TOKEN`
2. Run: `./start_ngrok_and_show_url.sh admin calculator2024`
3. Get your public URL with custom password!

