from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import bonds

app = FastAPI(title="可转债回测系统", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bonds.router, prefix="/api", tags=["bonds"])

@app.get("/")
async def root():
    return {"message": "可转债回测系统 API", "docs": "/docs"}
