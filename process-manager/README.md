# Process Manager

Dynamic process management platform with interactive model inspection and AI assistance.

## Features

- **Interactive Model Viewer** — SVG models with clickable inspection points
- **Point Modal** — Fill fields per inspection point with validation
- **AI Assistance** — Get GPT/Claude suggestions for each point (OpenAI or Anthropic)
- **Branching Flow** — Points can define next_points for guided inspection paths
- **Admin Template Editor** — Create model templates, define points, fields, and branching
- **Dashboard** — Process instance management and progress tracking
- **Model Gallery** — Browse vehicle, equipment, and human body models
- **Supabase Auth** — Register/login with JWT

---

## Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.12 + FastAPI |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | OpenAI GPT-4o-mini or Claude Haiku |
| Frontend | React 18 + Vite + TypeScript |
| Styling | TailwindCSS |
| State | Zustand |

---

## Project Structure

```
process-manager/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── config.py              # Settings (Pydantic)
│       ├── database.py            # Supabase client
│       ├── schemas/               # Pydantic models
│       │   ├── model_template.py
│       │   ├── process.py
│       │   └── team.py
│       ├── routers/               # FastAPI routers
│       │   ├── auth.py
│       │   ├── models.py
│       │   ├── processes.py
│       │   ├── teams.py
│       │   └── chat.py
│       └── services/
│           └── ai_service.py      # OpenAI / Anthropic integration
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── types/index.ts
│   │   ├── api/                   # API clients
│   │   ├── stores/                # Zustand stores
│   │   ├── components/
│   │   │   ├── ModelViewer/
│   │   │   │   ├── InteractiveSVG.tsx   # SVG + clickable points
│   │   │   │   └── ModelViewer.tsx
│   │   │   └── PointModal/
│   │   │       ├── PointModal.tsx       # Fields + AI chat
│   │   │       └── FieldRenderer.tsx
│   │   ├── features/
│   │   │   ├── dashboard/
│   │   │   ├── gallery/
│   │   │   ├── process/
│   │   │   │   ├── ProcessPage.tsx      # Full inspection view
│   │   │   │   └── BreadcrumbFlow.tsx   # Flow visualization
│   │   │   └── admin/
│   │   │       ├── AdminPage.tsx
│   │   │       ├── TemplateEditor.tsx   # Model + point editor
│   │   │       └── PointEditor.tsx
│   │   └── pages/
│   │       └── LoginPage.tsx
│   └── public/
│       └── models/                # Sample SVG files
│           ├── forklift.svg
│           ├── human.svg
│           └── fire-extinguisher.svg
│
└── supabase/
    ├── 001_initial.sql            # Schema
    └── 002_seed.sql               # Sample data
```

---

## Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/001_initial.sql`
3. Then run `supabase/002_seed.sql` for sample data
4. Copy your project URL and keys from **Settings → API**

### 2. Backend

```bash
cd process-manager/backend

# Create virtualenv
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install deps
pip install -r requirements.txt

# Configure env
cp .env.example .env
# Edit .env with your Supabase URL, keys, and AI key

# Run
uvicorn main:app --reload --port 8000
```

API docs at: http://localhost:8000/docs

### 3. Frontend

```bash
cd process-manager/frontend

npm install

# Configure env
cp .env.example .env
# Edit VITE_API_URL if needed (default: http://localhost:8000)

npm run dev
```

App at: http://localhost:5173

---

## Environment Variables

### Backend (`backend/.env`)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AI_PROVIDER=openai            # openai | anthropic
OPENAI_API_KEY=sk-...         # if using OpenAI
ANTHROPIC_API_KEY=sk-ant-...  # if using Anthropic
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000
```

---

## API Endpoints

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout

GET    /models                          # List model templates
POST   /models                          # Create model template
GET    /models/{id}                     # Get model with points
PUT    /models/{id}                     # Update model
DELETE /models/{id}

GET    /process-templates
POST   /process-templates
GET    /process-templates/{id}
PUT    /process-templates/{id}
DELETE /process-templates/{id}

GET    /processes                       # List instances (?team_id=)
POST   /processes                       # Create instance
GET    /processes/{id}
PATCH  /processes/{id}
DELETE /processes/{id}
GET    /processes/{id}/points/{pid}/fields     # Get fields + saved values
POST   /processes/{id}/points/{pid}/fields     # Save field values

GET    /teams
POST   /teams
PUT    /teams/{id}
DELETE /teams/{id}

POST   /chat                            # AI suggestion for a point
```

---

## Database Schema

```
model_templates    — SVG/3D models with clickable points (JSONB)
process_templates  — templates that reference a model
process_instances  — active inspections (field_values JSONB)
teams              — organizational teams
```

---

## Data Model: Inspection Point

```json
{
  "point_id": "engine",
  "label": "Engine",
  "coordinates": { "x": 55, "y": 35, "z": 0 },
  "description": "Check oil, coolant and belts",
  "fields": [
    {
      "name": "oil_level",
      "label": "Oil Level",
      "field_type": "select",
      "required": true,
      "options": ["OK", "Low", "Critical"]
    }
  ],
  "next_points": ["battery", "forks"]
}
```

---

## AI Integration

Each inspection point has an "Ask AI" button that calls `POST /chat`:

```json
{
  "process_id": "...",
  "point_id": "engine",
  "point_label": "Engine",
  "fields": [...],
  "field_values": { "oil_level": "Low" },
  "process_context": { "process_name": "Forklift #FL-001" }
}
```

Response:
```json
{
  "suggestion": "Low oil level detected — do not operate until topped up",
  "field_hints": { "notes": "Document the exact reading before topping up" },
  "warnings": ["Do not start engine with low oil"],
  "recommended_next_points": ["battery"]
}
```
