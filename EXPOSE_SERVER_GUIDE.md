# Exposing Your Local Server to the Internet

This guide shows you how to give a third party access to your local server running on port 8000.

## Quick Start

1. **Start your local server:**
   ```bash
   ./start_server.sh
   ```

2. **Expose it using one of these methods:**
   ```bash
   ./expose_server.sh ngrok
   # OR
   ./expose_server.sh localtunnel
   # OR
   ./expose_server.sh cloudflared
   ```

3. **Share the public URL** that appears in the terminal with the third party.

---

## Method 1: ngrok (Recommended - Most Popular)

### Pros:
- ✅ Most reliable and stable
- ✅ HTTPS by default
- ✅ Web interface for monitoring
- ✅ Can set custom domains (paid)

### Cons:
- ❌ Requires free signup
- ❌ Free tier has session limits

### Setup:

1. **Install ngrok:**
   ```bash
   # macOS
   brew install ngrok/ngrok/ngrok
   
   # Or download from: https://ngrok.com/download
   ```

2. **Sign up and get auth token:**
   - Go to https://dashboard.ngrok.com
   - Sign up for free account
   - Copy your authtoken

3. **Configure ngrok:**
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

4. **Expose your server:**
   ```bash
   ./expose_server.sh ngrok
   ```

5. **Share the URL** (looks like: `https://abc123.ngrok.io`)

---

## Method 2: localtunnel (Easiest - No Signup)

### Pros:
- ✅ No signup required
- ✅ Free and open source
- ✅ Quick setup

### Cons:
- ❌ URLs can be unpredictable
- ❌ Less stable than ngrok
- ❌ HTTP only (no HTTPS)

### Setup:

1. **Install localtunnel:**
   ```bash
   npm install -g localtunnel
   ```

2. **Expose your server:**
   ```bash
   ./expose_server.sh localtunnel
   ```

3. **Share the URL** (looks like: `https://random-name.loca.lt`)

---

## Method 3: Cloudflare Tunnel (Free & Secure)

### Pros:
- ✅ Free from Cloudflare
- ✅ HTTPS by default
- ✅ Very reliable
- ✅ No signup for basic use

### Cons:
- ❌ URLs are random
- ❌ Slightly more complex setup

### Setup:

1. **Install cloudflared:**
   ```bash
   # macOS
   brew install cloudflare/cloudflare/cloudflared
   
   # Or download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   ```

2. **Expose your server:**
   ```bash
   ./expose_server.sh cloudflared
   ```

3. **Share the URL** (looks like: `https://random-name.trycloudflare.com`)

---

## Security Considerations

⚠️ **Important:** When exposing your local server:

1. **Only share with trusted parties** - Anyone with the URL can access your server
2. **Don't expose sensitive data** - Your calculator is fine, but be careful with other apps
3. **Stop the tunnel when done** - Press `Ctrl+C` to close the tunnel
4. **Use HTTPS when possible** - ngrok and cloudflared provide HTTPS by default

---

## Troubleshooting

### "Port already in use"
- Make sure your server is running: `./start_server.sh`
- Check if something else is using port 8000: `lsof -i :8000`

### "Command not found"
- Install the tunneling tool using the instructions above
- Make sure it's in your PATH

### "Connection refused"
- Ensure your local server is running on port 8000
- Check firewall settings

### "Tunnel keeps disconnecting"
- Try a different method (ngrok is usually most stable)
- Check your internet connection

---

## Manual Commands (if script doesn't work)

### ngrok:
```bash
ngrok http 8000
```

### localtunnel:
```bash
lt --port 8000
```

### cloudflared:
```bash
cloudflared tunnel --url http://localhost:8000
```

---

## Which Method Should I Use?

- **For quick testing:** Use `localtunnel` (no signup needed)
- **For reliable sharing:** Use `ngrok` (most stable)
- **For security-focused:** Use `cloudflared` (Cloudflare's infrastructure)

All three work great for sharing your calculator with a third party!

