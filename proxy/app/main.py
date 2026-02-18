import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import agents, sessions, channels, logs, health, metrics, overview


app = FastAPI(
    title="OpenClaw Proxy",
    description="Lightweight proxy bridging the Mission Control Dashboard to a live OpenClaw Gateway via its CLI.",
    version="0.2.0",
)

allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(agents.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(channels.router, prefix="/api")
app.include_router(logs.router, prefix="/api")
app.include_router(metrics.router, prefix="/api")
app.include_router(overview.router, prefix="/api")
