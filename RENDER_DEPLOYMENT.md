# Deploying MedSight Backend to Render

## Quick Deploy Steps

### 1. Prepare Your Repository

If you haven't already initialized git:

```bash
cd medsight-backend
git init
git add .
git commit -m "Prepare for Render deployment"
```

Push to GitHub:

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/medsight-backend.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Render

#### Option A: Using render.yaml (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account (if not already connected)
4. Select your `medsight-backend` repository
5. Render will automatically detect the `render.yaml` file
6. Click **"Apply"**

#### Option B: Manual Web Service Creation

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `medsight-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
   - **Advanced** → **Health Check Path**: `/health`

### 3. Set Environment Variables

In the Render Dashboard, go to your service → **Environment** tab and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `4000` | Render may override this |
| `DORRA_API_BASE_URL` | `https://hackathon-api.aheadafrica.org` | Required |
| `DORRA_API_TOKEN` | `YOUR_ACTUAL_TOKEN` | **Required - Get from your .env** |
| `OLLAMA_API_URL` | `https://api.ollama.com/v1` | Optional |
| `OLLAMA_API_KEY` | `YOUR_ACTUAL_KEY` | **Optional - Get from your .env** |
| `OLLAMA_MODEL` | `llama3.2:latest` | Optional |

**Important**: Copy the actual values from your local `.env` file for the token and API keys.

### 4. Deploy!

- Click **"Create Web Service"** or **"Apply"**
- Render will automatically:
  1. Clone your repository
  2. Run `npm install`
  3. Start your server with `npm start`
  4. Make it available at `https://your-service-name.onrender.com`

### 5. Verify Deployment

Once deployed, test these endpoints:

1. **Health Check**:
   ```bash
   curl https://your-service-name.onrender.com/health
   ```
   Should return: `{"status":"ok","message":"MedSight AI API running"}`

2. **Demo Pharmacy Token**:
   ```bash
   curl https://your-service-name.onrender.com/api/pharmacy/prescription/DEMO-001
   ```
   Should return prescription data

## Post-Deployment

### Update Frontend Configuration

After deploying the backend, update your frontend `.env` file:

```env
VITE_API_BASE_URL=https://your-service-name.onrender.com
```

### Monitor Your Service

- **Logs**: Render Dashboard → Your Service → Logs
- **Metrics**: Render Dashboard → Your Service → Metrics
- **Health**: Check `/health` endpoint regularly

## Common Issues & Solutions

### Issue: Build Fails

**Solution**: Check that all dependencies are in `package.json` (not just in `devDependencies`)

### Issue: Service Crashes on Startup

**Solution**:
1. Check logs in Render Dashboard
2. Verify all required environment variables are set
3. Ensure PORT is not hardcoded (use `process.env.PORT || 4000`)

### Issue: CORS Errors

**Solution**: The backend already has CORS enabled. Update your frontend to use the correct backend URL.

### Issue: 503 Service Unavailable

**Solution**:
- Check health check endpoint is returning 200 OK
- Verify the server is listening on the correct port
- Check logs for startup errors

## Free Tier Limitations

Render's free tier has:
- ✅ 750 hours/month (enough for one service 24/7)
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ Cold starts take ~30 seconds
- ✅ Automatic HTTPS
- ✅ Continuous deployment from GitHub

**Cold Start Impact**: First request after inactivity will be slow. Consider:
- Using a paid plan for production
- Implementing a ping service to keep it warm
- Adding loading states in your frontend

## Upgrade Options

For better performance:
- **Starter Plan** ($7/month): No spin down, faster builds
- **Standard Plan** ($25/month): More resources, better performance

## Environment Variables Reference

Copy these from your local `.env` file:

```bash
# View your current .env (from medsight-backend directory)
cat .env

# Copy the values to Render Dashboard → Environment
```

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] `.gitignore` excludes `.env` and `node_modules`
- [ ] `render.yaml` configuration file present
- [ ] Environment variables set in Render Dashboard
- [ ] Service deployed successfully
- [ ] Health check endpoint returns 200 OK
- [ ] API endpoints accessible
- [ ] Frontend updated with backend URL
- [ ] Demo tokens working
- [ ] Logs checked for errors

## Next Steps

1. Deploy the frontend to Vercel/Netlify
2. Update frontend environment variables with backend URL
3. Test the full application flow
4. Share the live demo links

## Support

- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com/
- **Community**: https://community.render.com/

---

**Your Backend URL** (after deployment):
```
https://medsight-backend.onrender.com
```

Replace `medsight-backend` with your actual service name.
