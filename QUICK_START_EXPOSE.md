# Quick Start: Expose Calculator to Third Party

## ✅ Full Functionality Confirmed

Your calculator will work **100%** when exposed via tunnel:
- ✅ All calculations
- ✅ Unit conversions  
- ✅ Graph visualizations
- ✅ Classification tools
- ✅ Search functionality
- ✅ Offline support (service worker)

---

## 🚀 3-Step Setup (Choose One Method)

### Method 1: localtunnel (Easiest - No Signup)

```bash
# 1. Install (one time)
npm install -g localtunnel

# 2. Start your server
./start_server.sh

# 3. Expose it
./expose_server.sh localtunnel
```

**Share the URL** that appears (looks like: `https://random-name.loca.lt`)

---

### Method 2: ngrok (Most Reliable)

```bash
# 1. Install (one time)
brew install ngrok/ngrok/ngrok

# 2. Sign up and get token from https://dashboard.ngrok.com
ngrok config add-authtoken YOUR_TOKEN

# 3. Start your server
./start_server.sh

# 4. Expose it
./expose_server.sh ngrok
```

**Share the URL** that appears (looks like: `https://abc123.ngrok.io`)

---

### Method 3: Cloudflare Tunnel (Free & Secure)

```bash
# 1. Install (one time)
brew install cloudflare/cloudflare/cloudflared

# 2. Start your server
./start_server.sh

# 3. Expose it
./expose_server.sh cloudflared
```

**Share the URL** that appears (looks like: `https://random-name.trycloudflare.com`)

---

## 📋 What the Third Party Will See

When they visit the URL, they'll get:
- ✅ **Full calculator** - All 200+ formulas
- ✅ **All features** - Calculations, graphs, classification, search
- ✅ **Same experience** - Identical to localhost:8000
- ✅ **Works offline** - Service worker caches everything

---

## 🔒 Security Notes

- ⚠️ **Anyone with the URL can access** - Only share with trusted parties
- ⚠️ **Stop tunnel when done** - Press `Ctrl+C` to close
- ✅ **HTTPS provided** - ngrok and cloudflared use HTTPS automatically

---

## 🛑 To Stop

1. Press `Ctrl+C` in the tunnel terminal
2. The public URL will stop working
3. Your local server (port 8000) keeps running

---

## ❓ Troubleshooting

**"Port 8000 already in use"**
```bash
./start_server.sh  # This will kill and restart
```

**"Command not found"**
- Install the tunneling tool first (see Method 1, 2, or 3 above)

**"Connection refused"**
- Make sure `./start_server.sh` is running first
- Check: `lsof -i :8000` should show Python

---

## 💡 Recommendation

**For quick sharing:** Use `localtunnel` (no signup needed)  
**For reliable sharing:** Use `ngrok` (most stable)

Both work perfectly for your calculator!

