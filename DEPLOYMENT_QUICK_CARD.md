# 🚀 VERCEL DEPLOYMENT - QUICK REFERENCE CARD

## 1️⃣ PRE-DEPLOYMENT (Local)
```bash
cd Hidescorev3.1
git add .
git commit -m "Fix deployment configuration"
git push
```

## 2️⃣ PREPARE DATABASE
Go to https://neon.tech
- Create account & project
- Click Connection (top right)
- Copy the URI string
- **Keep it ready for Step 3**

## 3️⃣ VERCEL SETUP
### 3a. Deploy
- Go to https://vercel.com
- "Add New Project" → Import Git repo
- Click **Deploy**
- Wait 1-3 minutes

### 3b. Configure ENV Variables ⭐ CRITICAL
- Project → Settings → Environment Variables
- Click "Add New"
  - **Key**: `DATABASE_URL`
  - **Value**: Paste your Neon URI
  - **Check boxes**: Production ☑ Preview ☑ Development ☑
  - Click Save

### 3c. REDEPLOY ⭐ MOST IMPORTANT
- Deployments → Latest → **3 dots** ⋯
- Click "Redeploy"
- Wait until done

## 4️⃣ TEST
Visit these URLs:
- `https://your-app.vercel.app` → Should show homepage
- `https://your-app.vercel.app/api/movies` → Should return JSON

✅ **If both work, you're deployed!**

## ⚠️ IF SOMETHING GOES WRONG

### Page loads but API fails:
```
Check logs:
Deployments → Latest → View Function Logs
Look for: [DB] DATABASE_URL exists: false
Fix: Make sure DATABASE_URL is set and Redeploy
```

### Build failed:
```bash
npm run build   # Test locally
npm run check   # Check for TypeScript errors
# Fix errors, then git push
# Then Redeploy in Vercel
```

### Routes show 404:
- Check `vercel.json` has:
  ```json
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
  ```

## 📝 REFERENCE FILES

- **Full guide**: `VERCEL_DEPLOY.md`
- **What was fixed**: `DEPLOYMENT_FIXES.md`
- **Environment template**: `.env.example`
- **Configuration**: `vercel.json`

## 🔑 KEY POINTS

1. ✅ Build now outputs to `dist/` (not `dist/public/`)
2. ✅ API rewrites to `/api` (not `/api/index.ts`)
3. ✅ Database must have `?sslmode=require` in connection string
4. ✅ **ALWAYS Redeploy after changing Environment Variables**
5. ✅ Seed does NOT run automatically (add data via admin panel)

## 💬 SUPPORT

All questions answered in `VERCEL_DEPLOY.md`:
- Troubleshooting section
- Error solutions
- Setup instructions
- Monitoring guide
