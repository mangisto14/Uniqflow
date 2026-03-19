from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import auth, models, processes, teams, chat

settings = get_settings()

app = FastAPI(
    title="Process Manager API",
    description="Dynamic process management with interactive models and AI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(models.router)
app.include_router(processes.router)
app.include_router(teams.router)
app.include_router(chat.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
