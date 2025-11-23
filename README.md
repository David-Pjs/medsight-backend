# MedSight AI Backend

Backend API for MedSight AI - AI-Powered Prescription System for Nigerian Hospitals

## Features

- RESTful API built with Express.js
- DORRA EMR Integration
- AI-powered prescription recommendations (Ollama)
- Token-based pharmacy access
- Auto-seeded demo data
- CORS enabled for frontend integration

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:4000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (mock auth for hackathon)

### Patients
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient details

### Encounters
- `GET /api/encounters` - List encounters
- `POST /api/encounters` - Create encounter
- `GET /api/encounters/:id` - Get encounter details

### Medications
- `GET /api/medications` - List medications
- `POST /api/medications` - Add medication

### Pharmacy (Token-based)
- `POST /api/pharmacy/generate-token` - Generate pharmacy access token (auth required)
- `GET /api/pharmacy/prescription/:token` - Get prescription by token (public)
- `DELETE /api/pharmacy/revoke-token/:token` - Revoke token (auth required)

### AI
- `POST /api/ai/recommend` - Get AI prescription recommendations
- `POST /api/ai/parse-patient` - Parse natural language patient data

### Safety
- `POST /api/safety/check` - Check medication safety

### Health Check
- `GET /health` - API health check

## Deployment on Render

### Quick Deploy

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. **Deploy on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` configuration

3. **Set Environment Variables** (in Render Dashboard):
   - `DORRA_API_BASE_URL`: https://hackathon-api.aheadafrica.org
   - `DORRA_API_TOKEN`: Your DORRA API token
   - `OLLAMA_API_URL`: https://api.ollama.com/v1
   - `OLLAMA_API_KEY`: Your Ollama API key
   - `OLLAMA_MODEL`: llama3.2:latest

4. **Deploy**: Render will automatically build and deploy

### Manual Configuration (if not using render.yaml)

**Build Command**: `npm install`

**Start Command**: `npm start`

**Environment**: `Node`

**Plan**: Free

**Health Check Path**: `/health`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port (default: 4000) | No |
| NODE_ENV | Environment (development/production) | No |
| DORRA_API_BASE_URL | DORRA EMR API base URL | Yes |
| DORRA_API_TOKEN | DORRA API authentication token | Yes |
| OLLAMA_API_URL | Ollama AI API URL | Yes |
| OLLAMA_API_KEY | Ollama API key | Yes |
| OLLAMA_MODEL | AI model to use | No |

## Auto-Seeded Demo Data

On startup, the backend automatically seeds:
- 6 realistic Nigerian patient encounters
- 3 demo pharmacy tokens (DEMO-001, DEMO-002, DEMO-003)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5
- **HTTP Client**: Axios
- **Environment**: dotenv
- **CORS**: cors middleware

## Production Considerations

- [ ] Replace mock authentication with proper JWT
- [ ] Add rate limiting
- [ ] Implement proper database (currently in-memory)
- [ ] Add request logging (Morgan, Winston)
- [ ] Add API documentation (Swagger)
- [ ] Implement token expiration cleanup
- [ ] Add database migrations
- [ ] Set up monitoring and alerts

## License

MIT
