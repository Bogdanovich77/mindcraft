#!/usr/bin/env python3
"""
FastAPI Gateway Startup Script

This script starts the FastAPI gateway service with proper configuration
and integrates both the REST API and WebSocket proxy functionality.
"""

import asyncio
import logging
import os
import sys
from pathlib import Path

# Add the current directory to Python path for imports
sys.path.insert(0, str(Path(__file__).parent))

import uvicorn
from fastapi import FastAPI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our application components
from main import app
from websocket import websocket_proxy

# Configure logging
log_level = os.getenv("LOG_LEVEL", "INFO").lower()
logging.basicConfig(
    level=getattr(logging, log_level.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class FastAPIGateway:
    """Main FastAPI Gateway application class"""
    
    def __init__(self):
        self.host = os.getenv("FASTAPI_HOST", "0.0.0.0")
        self.port = int(os.getenv("FASTAPI_PORT", 8000))
        self.debug = os.getenv("DEBUG", "false").lower() == "true"
        self.node_core_host = os.getenv("NODE_CORE_HOST", "localhost")
        self.node_core_port = int(os.getenv("NODE_CORE_PORT", 8081))
        
        logger.info(f"FastAPI Gateway Configuration:")
        logger.info(f"  - Host: {self.host}")
        logger.info(f"  - Port: {self.port}")
        logger.info(f"  - Debug: {self.debug}")
        logger.info(f"  - Node.js Core: {self.node_core_host}:{self.node_core_port}")
    
    async def start_websocket_proxy(self):
        """Start the WebSocket proxy service"""
        try:
            await websocket_proxy.start()
            logger.info("WebSocket proxy started successfully")
        except Exception as e:
            logger.error(f"Failed to start WebSocket proxy: {e}")
            raise
    
    def create_combined_app(self):
        """Create a combined FastAPI app with WebSocket support"""
        # Get the WebSocket ASGI app
        websocket_app = websocket_proxy.get_app()
        
        # Mount the WebSocket app under /socket.io path
        app.mount("/socket.io", websocket_app)
        
        # Add WebSocket info to main app
        @app.get("/websocket/info")
        async def websocket_info():
            return {
                "websocket_url": f"ws://{self.host}:{self.port}/socket.io",
                "node_core": f"{self.node_core_host}:{self.node_core_port}",
                "status": "active" if websocket_proxy.internal_sio.connected else "disconnected"
            }
        
        return app
    
    async def startup(self):
        """Startup sequence for the FastAPI gateway"""
        logger.info("Starting FastAPI Gateway...")
        
        # Start WebSocket proxy
        await self.start_websocket_proxy()
        
        # Create combined application
        combined_app = self.create_combined_app()
        
        logger.info("FastAPI Gateway startup complete")
        return combined_app
    
    async def shutdown(self):
        """Shutdown sequence for the FastAPI gateway"""
        logger.info("Shutting down FastAPI Gateway...")
        
        # Stop WebSocket proxy
        await websocket_proxy.stop()
        
        logger.info("FastAPI Gateway shutdown complete")

async def main():
    """Main entry point for the FastAPI gateway"""
    gateway = FastAPIGateway()
    
    try:
        # Start the gateway
        app = await gateway.startup()
        
        # Configure uvicorn
        config = uvicorn.Config(
            app=app,
            host=gateway.host,
            port=gateway.port,
            reload=gateway.debug,
            log_level=log_level,
            access_log=True
        )
        
        # Start the server
        server = uvicorn.Server(config)
        
        logger.info(f"Starting FastAPI Gateway on {gateway.host}:{gateway.port}")
        logger.info(f"API Documentation: http://{gateway.host}:{gateway.port}/docs")
        logger.info(f"WebSocket Endpoint: ws://{gateway.host}:{gateway.port}/socket.io")
        logger.info(f"Health Check: http://{gateway.host}:{gateway.port}/health")
        
        await server.serve()
        
    except KeyboardInterrupt:
        logger.info("Received shutdown signal")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)
    finally:
        await gateway.shutdown()

def run():
    """Run the FastAPI gateway"""
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nShutdown requested by user")
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run()