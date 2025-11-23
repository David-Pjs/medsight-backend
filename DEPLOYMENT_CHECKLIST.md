# Backend Deployment Checklist for Render

## ✅ Pre-Deployment Setup (COMPLETED)

### Files Created/Updated:
- ✅ `.gitignore` - Prevents sensitive files from being committed
- ✅ `.env.example` - Template for environment variables
- ✅ `render.yaml` - Render deployment configuration
- ✅ `package.json` - Updated with proper metadata and Node version
- ✅ `README.md` - Backend documentation
- ✅ `RENDER_DEPLOYMENT.md` - Detailed deployment guide

### Configuration Verified:
- ✅ Server uses `process.env.PORT` (Render compatible)
- ✅ CORS enabled for frontend integration
- ✅ Health check endpoint at `/health`
- ✅ Auto-seeding on startup
- ✅ All dependencies in package.json

## 📋 Deployment Steps

### Step 1: Commit Changes to Git

```bash
cd medsight-backend
git add .
git commit -m "feat: prepare backend for Render deployment"
git push origin main
```

### Step 2: Deploy on Render

**Option A - Using Blueprint (Recommended):**
1. Go to https://dashboard.render.com/
2. Click "New +" → "Blueprint"
3. Connect GitHub repository
4. Render auto-detects `render.yaml`
5. Click "Apply"

**Option B - Manual Setup:**
1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect repository: `medsight-backend`
4. Settings:
   - Name: `medsight-backend`
   - Environment: `Node`
   - Build: `npm install`
   - Start: `npm start`
   - Health Check: `/health`

### Step 3: Configure Environment Variables

Add these in Render Dashboard → Environment:

**Required:**
```
NODE_ENV=production
DORRA_API_BASE_URL=https://hackathon-api.aheadafrica.org
DORRA_API_TOKEN=SZDEP55BKX:1b7U9tlS0HQT-bMiao9gJnLrQNEi3f-oAyjYIx2Hn9M
```

**Optional (AI Features):**
```
OLLAMA_API_URL=https://api.ollama.com/v1
OLLAMA_API_KEY=eef075af88114bd6bb92f0902bea0632.RfhwfgCMoK8IaChuzPoM_wxL
OLLAMA_MODEL=llama3.2:latest
```

**Note:** These values are from your `.env` file. Copy them exactly.

### Step 4: Deploy & Verify

1. Click "Create Web Service" or wait for auto-deploy
2. Wait for build to complete (~2-3 minutes)
3. Note your service URL: `https://YOUR-SERVICE-NAME.onrender.com`

### Step 5: Test Endpoints

```bash
# Health check
curl https://YOUR-SERVICE-NAME.onrender.com/health

# Demo prescription token
curl https://YOUR-SERVICE-NAME.onrender.com/api/pharmacy/prescription/DEMO-001

# API base endpoint
curl https://YOUR-SERVICE-NAME.onrender.com/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"password"}'
```

## 🔍 Post-Deployment Verification

### Backend Health:
- [ ] `/health` returns `{"status":"ok","message":"MedSight AI API running"}`
- [ ] Service shows "Live" status in Render dashboard
- [ ] No errors in deployment logs
- [ ] Demo tokens work (DEMO-001, DEMO-002, DEMO-003)

### API Endpoints:
- [ ] `/api/pharmacy/prescription/DEMO-001` returns prescription data
- [ ] `/api/auth/login` responds (even if with error for invalid creds)
- [ ] CORS headers present in responses

### Monitoring:
- [ ] Check logs for startup messages
- [ ] Verify auto-seeding completed
- [ ] No environment variable errors

## 📝 Update Frontend Configuration

After successful backend deployment, update your frontend:

**File:** `med-sight-ai/.env` (or `.env.production`)

```env
VITE_API_BASE_URL=https://YOUR-SERVICE-NAME.onrender.com
```

Then rebuild and redeploy frontend.

## 🚨 Common Issues

### Build Fails
- Check Node version in package.json (>=18.0.0)
- Verify all dependencies are listed
- Check build logs for specific errors

### Service Won't Start
- Verify environment variables are set
- Check that PORT is not hardcoded
- Review startup logs in Render dashboard

### CORS Errors
- Backend CORS is already configured
- Ensure frontend uses correct backend URL
- Check browser console for specific CORS issues

### 503 Errors
- Wait for service to spin up (30 seconds on free tier)
- Check health endpoint status
- Verify server is listening on correct port

## 💡 Render Free Tier Notes

- ✅ 750 free hours/month
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold starts take ~30 seconds
- ✅ Auto HTTPS
- ✅ GitHub auto-deploy

**Production Tip:** Upgrade to Starter plan ($7/mo) to prevent spin-down.

## 🎯 Your Deployment Info

After deployment, fill in:

**Service Name:** `_______________________`

**Backend URL:** `https://________________________.onrender.com`

**Deployment Date:** `_______________________`

**Environment Variables Set:**
- [ ] NODE_ENV
- [ ] DORRA_API_BASE_URL
- [ ] DORRA_API_TOKEN
- [ ] OLLAMA_API_URL (optional)
- [ ] OLLAMA_API_KEY (optional)
- [ ] OLLAMA_MODEL (optional)

## 📚 Additional Resources

- **Full Guide:** See `RENDER_DEPLOYMENT.md`
- **Backend API Docs:** See `README.md`
- **Render Docs:** https://render.com/docs/web-services
- **Support:** https://community.render.com/

---

## ✅ Final Checklist

Before marking deployment complete:

- [ ] Code committed and pushed to GitHub
- [ ] Service deployed on Render
- [ ] All environment variables configured
- [ ] Health check passing
- [ ] Demo tokens tested
- [ ] Backend URL noted for frontend
- [ ] No errors in logs
- [ ] CORS working

**Status:** Ready to Deploy! 🚀
