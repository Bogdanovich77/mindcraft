"""
WebSocket Proxy for Mindcraft FastAPI Gateway

This module provides WebSocket proxy functionality that:
- Accepts external WebSocket connections from frontend clients
- Acts as a client to the internal Node.js Agent Core Socket.IO server
- Relays messages between frontend and Node.js core
- Handles authentication and message routing
- Provides real-time agent state updates and control capabilities
"""

import asyncio
import json
import logging
import os
import time
import jwt
from typing import Dict, Any, Optional, Set, List
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import socketio
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging with structured format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class ClientConnection:
    """Track external client connection state"""
    sid: str
    connected_at: float
    authenticated: bool
    auth_token: Optional[str]
    user_id: Optional[str] = None
    subscriptions: Set[str] = None
    last_activity: float = None
    
    def __post_init__(self):
        if self.subscriptions is None:
            self.subscriptions = set()
        if self.last_activity is None:
            self.last_activity = time.time()

@dataclass
class ProxyMetrics:
    """Track WebSocket proxy performance metrics"""
    total_connections: int = 0
    active_connections: int = 0
    authenticated_connections: int = 0
    messages_relayed: int = 0
    connection_errors: int = 0
    last_activity: float = None
    
    def __post_init__(self):
        if self.last_activity is None:
            self.last_activity = time.time()

class WebSocketProxy:
    """Enhanced WebSocket proxy for handling external connections and internal communication"""
    
    def __init__(self):
        # Enhanced CORS configuration with environment-based origins
        cors_origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8000",
            "http://127.0.0.1:8000"
        ]
        
        # Add additional origins from environment if specified
        env_origins = os.getenv("CORS_ORIGINS", "").split(",")
        cors_origins.extend([origin.strip() for origin in env_origins if origin.strip()])
        
        # External Socket.IO server for frontend connections with enhanced configuration
        self.external_sio = socketio.AsyncServer(
            async_mode='asgi',
            cors_allowed_origins=cors_origins,
            logger=False,  # Disable verbose Socket.IO logging
            engineio_logger=False,
            ping_timeout=int(os.getenv("WEBSOCKET_PING_TIMEOUT", "60")),
            ping_interval=int(os.getenv("WEBSOCKET_PING_INTERVAL", "25")),
            max_http_buffer_size=int(os.getenv("WEBSOCKET_MAX_BUFFER_SIZE", "1000000")),
            transports=['websocket', 'polling']  # Support both transports
        )
        
        # Internal Socket.IO client for Node.js core communication
        self.internal_sio = socketio.AsyncClient(
            logger=False,
            engineio_logger=False
        )
        
        # Configuration with enhanced defaults
        self.node_core_host = os.getenv("NODE_CORE_HOST", "localhost")
        self.node_core_port = int(os.getenv("NODE_CORE_PORT", 8081))
        self.node_core_url = f"http://{self.node_core_host}:{self.node_core_port}"
        self.reconnect_attempts = int(os.getenv("SOCKET_RECONNECT_ATTEMPTS", "5"))
        self.reconnect_delay = int(os.getenv("SOCKET_RECONNECT_DELAY", "2000"))
        self.jwt_secret = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.max_connections = int(os.getenv("WEBSOCKET_MAX_CONNECTIONS", "100"))
        
        # Enhanced connected clients tracking with structured data
        self.external_clients: Dict[str, ClientConnection] = {}
        self.internal_connected = False
        self.reconnect_task = None
        
        # Performance metrics tracking
        self.metrics = ProxyMetrics()
        
        # Valid events for filtering with comprehensive sets
        self.valid_agent_events = {
            "agent:state:update", "agent:action:executed", "agent:message:sent",
            "agent:connected", "agent:disconnected", "agent:status",
            "agent:boot", "agent:stop", "agent:restart"
        }
        self.valid_control_events = {
            "create-agent", "stop-agent", "start-agent", "destroy-agent",
            "restart-agent", "get-settings", "set-agent-settings",
            "get_agent_list", "get-profiles", "get-profile", "save-profile",
            "delete-profile", "create-agent-from-profile"
        }
        self.valid_subscription_events = {
            "agent:state:subscribe", "agent:state:unsubscribe"
        }
        
        # Setup event handlers
        self._setup_external_handlers()
        self._setup_internal_handlers()
        
        logger.info("WebSocket proxy initialized with enhanced configuration")
        logger.info(f"CORS origins: {cors_origins}")
        logger.info(f"Node.js core URL: {self.node_core_url}")
    
    def _setup_external_handlers(self):
        """Setup enhanced event handlers for external client connections"""
        
        @self.external_sio.event
        async def connect(sid, environ, auth):
            """Handle external client connection with enhanced validation"""
            client_ip = environ.get('HTTP_X_FORWARDED_FOR', environ.get('REMOTE_ADDR', 'unknown'))
            user_agent = environ.get('HTTP_USER_AGENT', 'unknown')
            
            logger.info(f"External client connecting: {sid} from {client_ip}")
            logger.info(f"User-Agent: {user_agent}")
            
            # Check connection limits
            if len(self.external_clients) >= self.max_connections:
                logger.warning(f"Connection limit reached ({self.max_connections}), rejecting client {sid}")
                await self.external_sio.emit("connection_rejected", {
                    "error": "Server at maximum connection capacity",
                    "code": "CONNECTION_LIMIT_EXCEEDED"
                }, room=sid)
                return False
            
            # Store enhanced client information
            client_connection = ClientConnection(
                sid=sid,
                connected_at=time.time(),
                authenticated=False,
                auth_token=auth.get("token") if auth else None
            )
            
            self.external_clients[sid] = client_connection
            self.metrics.total_connections += 1
            self.metrics.active_connections += 1
            self.metrics.last_activity = time.time()
            
            logger.info(f"Client {sid} connected successfully. Total connections: {len(self.external_clients)}")
            
            # Connect to internal Node.js core if not already connected
            if not self.internal_sio.connected:
                try:
                    await self._connect_internal()
                except Exception as e:
                    logger.error(f"Failed to connect to Node.js core: {e}")
                    # Don't reject external client, we'll try to reconnect internally
                    await self.external_sio.emit("connection_warning", {
                        "message": "Internal Node.js core temporarily unavailable",
                        "retrying": True,
                        "timestamp": time.time()
                    }, room=sid)
            
            # Send welcome message with server info
            await self.external_sio.emit("connected", {
                "message": "Connected to Mindcraft WebSocket proxy",
                "server_version": "1.0.0",
                "timestamp": time.time(),
                "client_id": sid
            }, room=sid)
            
            return True
        
        @self.external_sio.event
        async def disconnect(sid):
            """Handle external client disconnection with enhanced cleanup"""
            logger.info(f"External client disconnecting: {sid}")
            
            if sid in self.external_clients:
                client = self.external_clients[sid]
                connection_duration = time.time() - client.connected_at
                
                logger.info(f"Client {sid} disconnected after {connection_duration:.2f}s")
                logger.info(f"Client was authenticated: {client.authenticated}")
                logger.info(f"Client subscriptions: {len(client.subscriptions)}")
                
                # Clean up subscriptions from Node.js core
                for subscription in client.subscriptions:
                    try:
                        await self.internal_sio.emit("unsubscribe", {"agent_id": subscription})
                        logger.debug(f"Unsubscribed from agent {subscription} for client {sid}")
                    except Exception as e:
                        logger.warning(f"Failed to unsubscribe from {subscription}: {e}")
                
                del self.external_clients[sid]
                self.metrics.active_connections -= 1
                if client.authenticated:
                    self.metrics.authenticated_connections -= 1
                
                logger.info(f"Remaining connections: {len(self.external_clients)}")
            
            # If no more external clients, consider disconnecting from internal after a delay
            if len(self.external_clients) == 0:
                logger.info("No more external clients, keeping internal connection for quick reconnection")
        
        @self.external_sio.event
        async def authenticate(sid, data):
            """Handle enhanced JWT authentication from external clients"""
            if sid not in self.external_clients:
                logger.warning(f"Authentication attempt from unknown client: {sid}")
                await self.external_sio.emit("authentication_error", {
                    "error": "Client not found",
                    "code": "CLIENT_NOT_FOUND"
                }, room=sid)
                return
            
            token = data.get("token")
            if not token:
                await self.external_sio.emit("authentication_error", {
                    "error": "No authentication token provided",
                    "code": "MISSING_TOKEN"
                }, room=sid)
                return
            
            # Validate JWT token
            try:
                # Decode JWT token
                payload = jwt.decode(
                    token,
                    self.jwt_secret,
                    algorithms=[self.jwt_algorithm],
                    options={"verify_exp": True}
                )
                
                # Extract user information
                user_id = payload.get("sub") or payload.get("user_id")
                if not user_id:
                    raise jwt.InvalidTokenError("No user ID in token")
                
                # Update client authentication status
                client = self.external_clients[sid]
                client.authenticated = True
                client.user_id = user_id
                client.last_activity = time.time()
                
                self.metrics.authenticated_connections += 1
                
                await self.external_sio.emit("authenticated", {
                    "success": True,
                    "user_id": user_id,
                    "timestamp": time.time(),
                    "permissions": payload.get("permissions", ["read", "write"])
                }, room=sid)
                
                logger.info(f"Client {sid} authenticated successfully for user {user_id}")
                
            except jwt.ExpiredSignatureError:
                logger.warning(f"Expired token provided by client {sid}")
                await self.external_sio.emit("authentication_error", {
                    "error": "Token has expired",
                    "code": "TOKEN_EXPIRED"
                }, room=sid)
                
            except jwt.InvalidTokenError as e:
                logger.warning(f"Invalid token provided by client {sid}: {e}")
                await self.external_sio.emit("authentication_error", {
                    "error": "Invalid authentication token",
                    "code": "INVALID_TOKEN",
                    "details": str(e) if os.getenv("DEBUG", "false").lower() == "true" else None
                }, room=sid)
                
            except Exception as e:
                logger.error(f"Authentication error for client {sid}: {e}")
                await self.external_sio.emit("authentication_error", {
                    "error": "Authentication failed",
                    "code": "AUTH_ERROR"
                }, room=sid)
        
        # Agent control events - forward to Node.js core
        @self.external_sio.event
        async def create_agent(sid, data):
            """Forward create-agent event to Node.js core"""
            if not await self._validate_and_forward(sid, "create-agent", data):
                return
        
        @self.external_sio.event
        async def stop_agent(sid, data):
            """Forward stop-agent event to Node.js core"""
            if not await self._validate_and_forward(sid, "stop-agent", data):
                return
        
        @self.external_sio.event
        async def start_agent(sid, data):
            """Forward start-agent event to Node.js core"""
            if not await self._validate_and_forward(sid, "start-agent", data):
                return
        
        @self.external_sio.event
        async def destroy_agent(sid, data):
            """Forward destroy-agent event to Node.js core"""
            if not await self._validate_and_forward(sid, "destroy-agent", data):
                return
        
        @self.external_sio.event
        async def restart_agent(sid, data):
            """Forward restart-agent event to Node.js core"""
            if not await self._validate_and_forward(sid, "restart-agent", data):
                return
        
        @self.external_sio.event
        async def get_settings(sid, data):
            """Forward get-settings event to Node.js core"""
            if not await self._validate_and_forward(sid, "get-settings", data):
                return
        
        @self.external_sio.event
        async def set_agent_settings(sid, data):
            """Forward set-agent-settings event to Node.js core"""
            if not await self._validate_and_forward(sid, "set-agent-settings", data):
                return
        
        @self.external_sio.event
        async def get_agent_list(sid, data):
            """Forward get_agent_list event to Node.js core"""
            if not await self._validate_and_forward(sid, "get_agent_list", data):
                return
        
        @self.external_sio.event
        async def get_profiles(sid, data):
            """Forward get-profiles event to Node.js core"""
            if not await self._validate_and_forward(sid, "get-profiles", data):
                return
        
        @self.external_sio.event
        async def get_profile(sid, data):
            """Forward get-profile event to Node.js core"""
            if not await self._validate_and_forward(sid, "get-profile", data):
                return
        
        @self.external_sio.event
        async def save_profile(sid, data):
            """Forward save-profile event to Node.js core"""
            if not await self._validate_and_forward(sid, "save-profile", data):
                return
        
        @self.external_sio.event
        async def delete_profile(sid, data):
            """Forward delete-profile event to Node.js core"""
            if not await self._validate_and_forward(sid, "delete-profile", data):
                return
        
        @self.external_sio.event
        async def create_agent_from_profile(sid, data):
            """Forward create-agent-from-profile event to Node.js core"""
            if not await self._validate_and_forward(sid, "create-agent-from-profile", data):
                return
        
        # Legacy events for compatibility
        @self.external_sio.event
        async def agent_state_subscribe(sid, data):
            """Handle subscription to agent state updates"""
            if not self._is_authenticated(sid):
                await self.external_sio.emit("error", {"message": "Not authenticated"}, room=sid)
                return
            
            agent_id = data.get("agent_id")
            if agent_id:
                # Subscribe to specific agent updates
                await self.internal_sio.emit("agent:state:subscribe", {"agent_id": agent_id})
                logger.info(f"Subscribed external client {sid} to agent {agent_id}")
        
        @self.external_sio.event
        async def agent_command(sid, data):
            """Handle agent commands from external clients"""
            if not self._is_authenticated(sid):
                await self.external_sio.emit("error", {"message": "Not authenticated"}, room=sid)
                return
            
            # Forward command to Node.js core
            await self.internal_sio.emit("agent:command", data)
            logger.info(f"Forwarded command from {sid} to Node.js core: {data}")
    
    def _setup_internal_handlers(self):
        """Setup event handlers for internal Node.js core communication"""
        
        @self.internal_sio.event
        async def connect():
            """Handle connection to Node.js core"""
            logger.info("Connected to Node.js core")
            self.internal_connected = True
            # Cancel any reconnection task
            if self.reconnect_task:
                self.reconnect_task.cancel()
                self.reconnect_task = None
        
        @self.internal_sio.event
        async def disconnect():
            """Handle disconnection from Node.js core"""
            logger.warning("Disconnected from Node.js core")
            self.internal_connected = False
            # Start reconnection task if we have external clients
            if len(self.external_clients) > 0:
                self.reconnect_task = asyncio.create_task(self._reconnect_internal())
        
        @self.internal_sio.event
        async def connect_error(data):
            """Handle connection error to Node.js core"""
            logger.error(f"Connection error to Node.js core: {data}")
            self.internal_connected = False
        
        # Agent state events - forward to external clients
        @self.internal_sio.event
        async def agent_state_update(data):
            """Handle agent state updates from Node.js core"""
            if not self._validate_agent_event("agent:state:update", data):
                return
            
            # Broadcast to all authenticated external clients
            await self._broadcast_to_authenticated("agent:state:update", data)
        
        @self.internal_sio.event
        async def agent_action_executed(data):
            """Handle agent action execution notifications"""
            if not self._validate_agent_event("agent:action:executed", data):
                return
            
            # Broadcast to all authenticated external clients
            await self._broadcast_to_authenticated("agent:action:executed", data)
        
        @self.internal_sio.event
        async def agent_message_sent(data):
            """Handle agent message notifications"""
            if not self._validate_agent_event("agent:message:sent", data):
                return
            
            # Broadcast to all authenticated external clients
            await self._broadcast_to_authenticated("agent:message:sent", data)
        
        # System events - forward to external clients
        @self.internal_sio.event
        async def system_status(data):
            """Handle system status updates"""
            await self._broadcast_to_authenticated("system:status", data)
        
        @self.internal_sio.event
        async def agents_status(data):
            """Handle agents status updates"""
            await self._broadcast_to_authenticated("agents-status", data)
        
        # Profile management responses - forward to requesting client
        @self.internal_sio.event
        async def profile_response(data):
            """Handle profile management responses"""
            target_sid = data.get("target_sid")
            if target_sid and target_sid in self.external_clients:
                await self.external_sio.emit("profile_response", data, room=target_sid)
        
        # Agent control responses - forward to requesting client
        @self.internal_sio.event
        async def agent_control_response(data):
            """Handle agent control responses"""
            target_sid = data.get("target_sid")
            if target_sid and target_sid in self.external_clients:
                await self.external_sio.emit("agent_control_response", data, room=target_sid)
        
        # Error handling
        @self.internal_sio.event
        async def error(data):
            """Handle error from Node.js core"""
            logger.error(f"Error from Node.js core: {data}")
            await self._broadcast_to_authenticated("error", data)
    
    def _is_authenticated(self, sid: str) -> bool:
        """Check if a client is authenticated with enhanced validation"""
        client = self.external_clients.get(sid)
        if not client:
            return False
        
        # Update last activity timestamp
        client.last_activity = time.time()
        return client.authenticated
    
    async def _validate_and_forward(self, sid: str, event: str, data: Any) -> bool:
        """Enhanced validation and forwarding of events to Node.js core"""
        # Check client authentication
        if not self._is_authenticated(sid):
            await self.external_sio.emit("error", {
                "message": "Authentication required",
                "code": "AUTHENTICATION_REQUIRED",
                "event": event
            }, room=sid)
            return False
        
        # Validate event type
        if not self._validate_control_event(event, data):
            await self.external_sio.emit("error", {
                "message": f"Invalid event data for {event}",
                "code": "INVALID_EVENT_DATA",
                "event": event,
                "details": self._get_validation_error(event, data)
            }, room=sid)
            return False
        
        # Sanitize and validate data
        sanitized_data = self._sanitize_event_data(event, data)
        if sanitized_data is None:
            await self.external_sio.emit("error", {
                "message": "Data sanitization failed",
                "code": "SANITIZATION_ERROR",
                "event": event
            }, room=sid)
            return False
        
        # Add target client ID for response routing
        if isinstance(sanitized_data, dict):
            sanitized_data["target_sid"] = sid
            sanitized_data["timestamp"] = time.time()
        
        try:
            await self.internal_sio.emit(event, sanitized_data)
            self.metrics.messages_relayed += 1
            self.metrics.last_activity = time.time()
            
            logger.info(f"Forwarded {event} from client {sid} to Node.js core")
            logger.debug(f"Event data: {sanitized_data}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to forward {event} to Node.js core: {e}")
            self.metrics.connection_errors += 1
            
            await self.external_sio.emit("error", {
                "message": "Internal server error during message forwarding",
                "code": "INTERNAL_ERROR",
                "event": event,
                "details": str(e) if os.getenv("DEBUG", "false").lower() == "true" else None
            }, room=sid)
            return False
    
    def _validate_agent_event(self, event: str, data: Any) -> bool:
        """Enhanced validation for agent event data"""
        if event not in self.valid_agent_events:
            logger.warning(f"Invalid agent event: {event}")
            return False
        
        if not isinstance(data, dict):
            logger.warning(f"Invalid event data type for {event}: expected dict, got {type(data)}")
            return False
        
        # Enhanced validation for required fields
        if event == "agent:state:update":
            required_fields = ["agentId", "timestamp"]
            if not all(field in data for field in required_fields):
                logger.warning(f"Missing required fields for agent:state:update: {required_fields}")
                return False
            # Validate field types
            if not isinstance(data.get("agentId"), str):
                logger.warning("agentId must be a string")
                return False
            if not isinstance(data.get("timestamp"), (int, float)):
                logger.warning("timestamp must be a number")
                return False
                
        elif event == "agent:action:executed":
            required_fields = ["agentId", "action", "timestamp"]
            if not all(field in data for field in required_fields):
                logger.warning(f"Missing required fields for agent:action:executed: {required_fields}")
                return False
            # Validate field types
            if not isinstance(data.get("agentId"), str):
                logger.warning("agentId must be a string")
                return False
            if not isinstance(data.get("action"), str):
                logger.warning("action must be a string")
                return False
            if not isinstance(data.get("timestamp"), (int, float)):
                logger.warning("timestamp must be a number")
                return False
                
        elif event == "agent:message:sent":
            required_fields = ["agentId", "message", "timestamp"]
            if not all(field in data for field in required_fields):
                logger.warning(f"Missing required fields for agent:message:sent: {required_fields}")
                return False
            # Validate field types and content
            if not isinstance(data.get("agentId"), str):
                logger.warning("agentId must be a string")
                return False
            if not isinstance(data.get("message"), str):
                logger.warning("message must be a string")
                return False
            if len(data.get("message", "")) > 1000:  # Limit message length
                logger.warning("message too long (max 1000 characters)")
                return False
            if not isinstance(data.get("timestamp"), (int, float)):
                logger.warning("timestamp must be a number")
                return False
        
        return True
    
    def _validate_control_event(self, event: str, data: Any) -> bool:
        """Enhanced validation for control event data"""
        if event not in self.valid_control_events:
            logger.warning(f"Invalid control event: {event}")
            return False
        
        # Enhanced validation - control events should have meaningful data
        if data is None:
            logger.warning(f"Control event {event} has no data")
            return False
        
        # Event-specific validation
        if event in ["create-agent", "start-agent", "stop-agent", "destroy-agent", "restart-agent"]:
            if not isinstance(data, dict) or not data.get("agentName"):
                logger.warning(f"Agent control event {event} requires agentName")
                return False
                
        elif event in ["get-profile", "save-profile", "delete-profile"]:
            if not isinstance(data, dict) or not data.get("profileName"):
                logger.warning(f"Profile event {event} requires profileName")
                return False
        
        return True
    
    def _get_validation_error(self, event: str, data: Any) -> str:
        """Get detailed validation error information"""
        if event not in self.valid_control_events:
            return f"Event '{event}' is not allowed"
        
        if data is None:
            return "Event data is required but was null"
        
        if not isinstance(data, dict):
            return f"Event data must be a dictionary, got {type(data).__name__}"
        
        # Event-specific error details
        if event in ["create-agent", "start-agent", "stop-agent", "destroy-agent", "restart-agent"]:
            if not data.get("agentName"):
                return "agentName field is required"
                
        elif event in ["get-profile", "save-profile", "delete-profile"]:
            if not data.get("profileName"):
                return "profileName field is required"
        
        return "Validation failed"
    
    def _sanitize_event_data(self, event: str, data: Any) -> Any:
        """Sanitize event data to prevent security issues"""
        if data is None:
            return None
        
        if not isinstance(data, dict):
            return data
        
        try:
            sanitized = {}
            
            # Define allowed fields for each event type
            allowed_fields = {
                "create-agent": ["agentName", "profileName", "target_sid"],
                "start-agent": ["agentName", "target_sid"],
                "stop-agent": ["agentName", "target_sid"],
                "destroy-agent": ["agentName", "target_sid"],
                "restart-agent": ["agentName", "target_sid"],
                "get-settings": ["target_sid"],
                "set-agent-settings": ["agentName", "settings", "target_sid"],
                "get_agent_list": ["target_sid"],
                "get-profiles": ["target_sid"],
                "get-profile": ["profileName", "target_sid"],
                "save-profile": ["profileName", "profileData", "target_sid"],
                "delete-profile": ["profileName", "target_sid"],
                "create-agent-from-profile": ["agentName", "profileName", "target_sid"]
            }
            
            # Get allowed fields for this event, default to empty set
            allowed = allowed_fields.get(event, [])
            
            # Copy only allowed fields
            for key, value in data.items():
                if key in allowed:
                    # Basic sanitization
                    if isinstance(value, str):
                        # Limit string length and remove potential script content
                        sanitized[key] = value[:1000].replace('<script', '').replace('</script>', '')
                    elif isinstance(value, (int, float, bool)):
                        sanitized[key] = value
                    elif isinstance(value, dict):
                        # Recursively sanitize nested dictionaries
                        sanitized[key] = self._sanitize_nested_dict(value)
                    elif isinstance(value, list):
                        # Sanitize lists
                        sanitized[key] = [self._sanitize_item(item) for item in value[:50]]  # Limit list size
                    else:
                        # Skip unsupported types
                        logger.warning(f"Skipping unsupported data type for field {key}: {type(value)}")
            
            return sanitized
            
        except Exception as e:
            logger.error(f"Error sanitizing event data for {event}: {e}")
            return None
    
    def _sanitize_nested_dict(self, data: dict, max_depth: int = 3) -> dict:
        """Recursively sanitize nested dictionaries"""
        if max_depth <= 0:
            return {}
        
        sanitized = {}
        for key, value in data.items():
            if isinstance(value, str):
                sanitized[key] = value[:500]  # Limit nested string length
            elif isinstance(value, (int, float, bool)):
                sanitized[key] = value
            elif isinstance(value, dict) and max_depth > 1:
                sanitized[key] = self._sanitize_nested_dict(value, max_depth - 1)
            elif isinstance(value, list):
                sanitized[key] = [self._sanitize_item(item) for item in value[:10]]  # Limit nested list size
        
        return sanitized
    
    def _sanitize_item(self, item: Any) -> Any:
        """Sanitize individual items"""
        if isinstance(item, str):
            return item[:200]  # Limit item string length
        elif isinstance(item, (int, float, bool)):
            return item
        elif isinstance(item, dict):
            return self._sanitize_nested_dict(item, 2)
        else:
            return str(item)[:100]  # Convert other types to string with limit
    
    async def _broadcast_to_authenticated(self, event: str, data: Any):
        """Enhanced broadcast event to all authenticated external clients"""
        successful_sends = 0
        failed_sends = 0
        
        # Validate event before broadcasting
        if not self._validate_agent_event(event, data):
            logger.warning(f"Skipping broadcast of invalid event: {event}")
            return
        
        # Sanitize data before broadcasting
        sanitized_data = self._sanitize_event_data(event, data)
        if sanitized_data is None:
            logger.warning(f"Skipping broadcast due to sanitization failure: {event}")
            return
        
        for sid, client in self.external_clients.items():
            if client.authenticated:
                try:
                    await self.external_sio.emit(event, sanitized_data, room=sid)
                    successful_sends += 1
                    
                    # Update client activity
                    client.last_activity = time.time()
                    
                except Exception as e:
                    failed_sends += 1
                    logger.error(f"Failed to emit {event} to client {sid}: {e}")
                    
                    # Mark client as potentially disconnected
                    if "disconnected" in str(e).lower():
                        logger.warning(f"Client {sid} appears to be disconnected")
        
        # Update metrics
        self.metrics.messages_relayed += successful_sends
        self.metrics.last_activity = time.time()
        
        logger.info(f"Broadcast {event} to {successful_sends} clients, {failed_sends} failed")
        
        # If too many failures, consider cleanup
        if failed_sends > 0 and failed_sends >= len(self.external_clients) * 0.5:
            logger.warning("High failure rate detected during broadcast, considering connection cleanup")
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current WebSocket proxy metrics"""
        current_time = time.time()
        
        # Calculate connection duration for active clients
        active_connections_info = []
        for sid, client in self.external_clients.items():
            connection_duration = current_time - client.connected_at
            last_activity_ago = current_time - client.last_activity
            
            active_connections_info.append({
                "sid": sid,
                "connected_at": client.connected_at,
                "connection_duration": round(connection_duration, 2),
                "authenticated": client.authenticated,
                "user_id": client.user_id,
                "last_activity_ago": round(last_activity_ago, 2),
                "subscriptions": list(client.subscriptions)
            })
        
        return {
            "proxy_metrics": asdict(self.metrics),
            "active_connections": len(self.external_clients),
            "authenticated_connections": self.metrics.authenticated_connections,
            "internal_connected": self.internal_connected,
            "node_core_url": self.node_core_url,
            "max_connections": self.max_connections,
            "connection_utilization": round(len(self.external_clients) / self.max_connections * 100, 2),
            "active_connections_detail": active_connections_info,
            "uptime": current_time - (self.external_clients[next(iter(self.external_clients))].connected_at if self.external_clients else current_time),
            "timestamp": current_time
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform comprehensive health check of the WebSocket proxy"""
        health_status = {
            "status": "healthy",
            "timestamp": time.time(),
            "checks": {}
        }
        
        # Check internal connection
        try:
            if self.internal_connected and self.internal_sio.connected:
                health_status["checks"]["internal_connection"] = {
                    "status": "healthy",
                    "message": "Connected to Node.js core"
                }
            else:
                health_status["checks"]["internal_connection"] = {
                    "status": "unhealthy",
                    "message": "Not connected to Node.js core"
                }
                health_status["status"] = "degraded"
        except Exception as e:
            health_status["checks"]["internal_connection"] = {
                "status": "error",
                "message": f"Connection check failed: {e}"
            }
            health_status["status"] = "unhealthy"
        
        # Check external connections
        try:
            total_connections = len(self.external_clients)
            auth_connections = sum(1 for c in self.external_clients.values() if c.authenticated)
            
            if total_connections == 0:
                health_status["checks"]["external_connections"] = {
                    "status": "healthy",
                    "message": "No external connections (idle)"
                }
            elif auth_connections > 0:
                health_status["checks"]["external_connections"] = {
                    "status": "healthy",
                    "message": f"{auth_connections}/{total_connections} authenticated connections"
                }
            else:
                health_status["checks"]["external_connections"] = {
                    "status": "warning",
                    "message": f"{total_connections} unauthenticated connections"
                }
                if health_status["status"] == "healthy":
                    health_status["status"] = "degraded"
        except Exception as e:
            health_status["checks"]["external_connections"] = {
                "status": "error",
                "message": f"Connection check failed: {e}"
            }
            health_status["status"] = "unhealthy"
        
        # Check connection limits
        try:
            utilization = len(self.external_clients) / self.max_connections
            if utilization > 0.9:
                health_status["checks"]["connection_limits"] = {
                    "status": "warning",
                    "message": f"High connection utilization: {utilization:.1%}"
                }
                if health_status["status"] == "healthy":
                    health_status["status"] = "degraded"
            else:
                health_status["checks"]["connection_limits"] = {
                    "status": "healthy",
                    "message": f"Normal connection utilization: {utilization:.1%}"
                }
        except Exception as e:
            health_status["checks"]["connection_limits"] = {
                "status": "error",
                "message": f"Limit check failed: {e}"
            }
            health_status["status"] = "unhealthy"
        
        # Check error rates
        try:
            if self.metrics.messages_relayed > 0:
                error_rate = self.metrics.connection_errors / self.metrics.messages_relayed
                if error_rate > 0.1:  # 10% error rate threshold
                    health_status["checks"]["error_rates"] = {
                        "status": "warning",
                        "message": f"High error rate: {error_rate:.1%}"
                    }
                    if health_status["status"] == "healthy":
                        health_status["status"] = "degraded"
                else:
                    health_status["checks"]["error_rates"] = {
                        "status": "healthy",
                        "message": f"Normal error rate: {error_rate:.1%}"
                    }
            else:
                health_status["checks"]["error_rates"] = {
                    "status": "healthy",
                    "message": "No messages relayed yet"
                }
        except Exception as e:
            health_status["checks"]["error_rates"] = {
                "status": "error",
                "message": f"Error rate check failed: {e}"
            }
            health_status["status"] = "unhealthy"
        
        return health_status
    
    async def _connect_internal(self):
        """Connect to internal Node.js core"""
        try:
            await self.internal_sio.connect(self.node_core_url)
            logger.info(f"Connected to Node.js core at {self.node_core_url}")
            self.internal_connected = True
        except Exception as e:
            logger.error(f"Failed to connect to Node.js core at {self.node_core_url}: {e}")
            self.internal_connected = False
            raise
    
    async def _reconnect_internal(self):
        """Attempt to reconnect to Node.js core"""
        for attempt in range(self.reconnect_attempts):
            try:
                logger.info(f"Attempting to reconnect to Node.js core (attempt {attempt + 1}/{self.reconnect_attempts})")
                await asyncio.sleep(self.reconnect_delay / 1000)  # Convert ms to seconds
                await self._connect_internal()
                logger.info("Successfully reconnected to Node.js core")
                return
            except Exception as e:
                logger.error(f"Reconnection attempt {attempt + 1} failed: {e}")
        
        logger.error(f"Failed to reconnect to Node.js core after {self.reconnect_attempts} attempts")
        await self._broadcast_to_authenticated("connection_lost", {
            "message": "Lost connection to Node.js core and reconnection failed",
            "service": "Node.js Agent Core"
        })
    
    def get_app(self):
        """Get the ASGI application for Socket.IO"""
        return socketio.ASGIApp(self.external_sio)
    
    async def start(self):
        """Start the WebSocket proxy"""
        logger.info("Starting WebSocket proxy...")
        # Connection to Node.js core will be established when first external client connects
        try:
            # Pre-connect to Node.js core if possible
            await self._connect_internal()
        except Exception as e:
            logger.warning(f"Initial connection to Node.js core failed, will connect on demand: {e}")
    
    async def stop(self):
        """Stop the WebSocket proxy"""
        logger.info("Stopping WebSocket proxy...")
        if self.reconnect_task:
            self.reconnect_task.cancel()
            try:
                await self.reconnect_task
            except asyncio.CancelledError:
                pass
        
        if self.internal_sio.connected:
            await self.internal_sio.disconnect()

# Global WebSocket proxy instance - will be initialized on demand
websocket_proxy = None

def get_websocket_proxy():
    """Get or create the global WebSocket proxy instance"""
    global websocket_proxy
    if websocket_proxy is None:
        websocket_proxy = WebSocketProxy()
    return websocket_proxy