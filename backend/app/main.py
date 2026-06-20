"""FastAPI application entry point for Assignment Roaster."""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.exceptions import register_exception_handlers
from app.rate_limit import limiter
from app.routers import assignments, auth, dashboard, roasts

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(assignments.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(roasts.router, prefix="/api/v1")

# Additional routers are registered here as they are implemented by
# BACKEND-AGENT in later phases, e.g.:
# from app.routers import users
# app.include_router(users.router, prefix="/api/v1")


@app.get("/health")
async def health() -> dict[str, str]:
    """Liveness/readiness probe."""
    return {"status": "ok"}


@app.on_event("startup")
async def on_startup() -> None:
    logger.info("%s starting up", settings.APP_NAME)
