"""
FastAPI Gateway for Mindcraft System
Main application entry point for the hybrid 3-tier architecture

This FastAPI application serves as the external API gateway that:
- Accepts external connections on port 8000
- Provides REST API endpoints for profile management
- Acts as WebSocket proxy for real-time agent state updates
- Communicates internally with Node.js Agent Core on port 8081
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from routes.profiles import router as profiles_router
from websocket import websocket_proxy

# Create FastAPI application
app = FastAPI(
    title="Mindcraft API Gateway",
    description="FastAPI gateway for Mindcraft AI agent system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Frontend development server
        "http://127.0.0.1:5173",
        os.getenv("FRONTEND_URL", "http://localhost:5173")
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(profiles_router, prefix="/api", tags=["profiles"])

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "FastAPI Gateway",
        "version": "1.0.0",
        "port": int(os.getenv("FASTAPI_PORT", 8000)),
        "node_core_host": os.getenv("NODE_CORE_HOST", "localhost"),
        "node_core_port": int(os.getenv("NODE_CORE_PORT", 8081))
    }

@app.get("/api/websocket/metrics", tags=["WebSocket"])
async def get_websocket_metrics():
    """Get WebSocket proxy metrics and connection information"""
    try:
        metrics = websocket_proxy.get_metrics()
        return {
            "success": True,
            "data": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")

@app.get("/api/websocket/health", tags=["WebSocket"])
async def get_websocket_health():
    """Get comprehensive WebSocket proxy health status"""
    try:
        health = await websocket_proxy.health_check()
        return {
            "success": True,
            "data": health
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.get("/api/websocket/status", tags=["WebSocket"])
async def get_websocket_status():
    """Get basic WebSocket proxy status"""
    try:
        metrics = websocket_proxy.get_metrics()
        return {
            "success": True,
            "data": {
                "status": "online" if metrics["internal_connected"] else "degraded",
                "active_connections": metrics["active_connections"],
                "authenticated_connections": metrics["authenticated_connections"],
                "total_messages_relayed": metrics["proxy_metrics"]["messages_relayed"],
                "connection_utilization": f"{metrics['connection_utilization']}%",
                "node_core_connected": metrics["internal_connected"],
                "timestamp": metrics["timestamp"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Mindcraft FastAPI Gateway",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unexpected errors"""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if os.getenv("DEBUG", "false").lower() == "true" else None
        }
    )

# Create startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize WebSocket proxy on startup"""
    try:
        await websocket_proxy.start()
        print("✅ WebSocket proxy initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize WebSocket proxy: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up WebSocket proxy on shutdown"""
    try:
        await websocket_proxy.stop()
        print("✅ WebSocket proxy stopped successfully")
    except Exception as e:
        print(f"❌ Error stopping WebSocket proxy: {e}")

# Mount WebSocket app
app.mount("/socket.io", websocket_proxy.get_app())

if __name__ == "__main__":
    # Run the FastAPI application
    uvicorn.run(
        "main:app",
        host=os.getenv("FASTAPI_HOST", "0.0.0.0"),
        port=int(os.getenv("FASTAPI_PORT", 8000)),
        reload=os.getenv("DEBUG", "false").lower() == "true",
        log_level="info"
    )