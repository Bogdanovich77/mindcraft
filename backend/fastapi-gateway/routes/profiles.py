"""
Profile Management Routes for FastAPI Gateway

This module provides REST API endpoints for agent profile management:
- List all agent profiles
- Create new agent profile
- Update existing agent profile
- Delete agent profile

All endpoints communicate with the internal Node.js Agent Core service via Socket.IO.
"""

from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
import logging
import os
import asyncio
import json
import uuid
from datetime import datetime
from dotenv import load_dotenv
import socketio

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Configuration
NODE_CORE_HOST = os.getenv("NODE_CORE_HOST", "localhost")
NODE_CORE_PORT = int(os.getenv("NODE_CORE_PORT", 8081))
REQUEST_TIMEOUT = int(os.getenv("PROFILE_REQUEST_TIMEOUT", "30"))

# Enhanced Pydantic models matching actual profile structure
class WorldContext(BaseModel):
    """World context for agent state"""
    position: Dict[str, float] = Field(default={"x": 0, "y": 64, "z": 0})
    health: int = Field(default=20)
    food: int = Field(default=20)
    experience: int = Field(default=0)
    inventory: Dict[str, Any] = Field(default_factory=lambda: {
        "items": [], "slots": 36, "usedSlots": 0, "length": 0
    })
    equipment: Dict[str, Any] = Field(default_factory=dict)
    nearbyEntities: List[Dict[str, Any]] = Field(default_factory=list)
    timeOfDay: int = Field(default=0)
    weather: str = Field(default="clear")
    dimension: str = Field(default="overworld")
    biome: str = Field(default="plains")
    lightLevel: int = Field(default=15)

class ConversationState(BaseModel):
    """Conversation state for agent"""
    message: str = Field(default="")
    sender: str = Field(default="")
    isRequestForHelp: bool = Field(default=False)
    isOfferOfAssistance: bool = Field(default=False)
    targetBot: str = Field(default="")
    timestamp: int = Field(default=0)

class AgentState(BaseModel):
    """Simplified agent state structure"""
    worldContext: WorldContext = Field(default_factory=WorldContext)
    personality: str = Field(..., description="Personality description for the agent")
    goals: str = Field(..., description="Autonomous goals for the agent")
    mandate: str = Field(default="", description="Mandate/orders for the agent")
    conversation: ConversationState = Field(default_factory=ConversationState)
    lastAction: str = Field(default="")
    response: str = Field(default="")

class ProfileCreate(BaseModel):
    """Model for creating a new agent profile"""
    name: str = Field(..., description="Unique name for the agent profile", min_length=1, max_length=50)
    model: str = Field(default="ollama/hf.co/unsloth/Qwen3-30B-A3B-Instruct-2507-20000-GGUF:Q4_K_XL", description="AI model to use for this agent")
    embedding: str = Field(default="ollama/nomic-embed-text:latest", description="Embedding model")
    agentType: str = Field(default="langgraph_simplified", description="Agent type")
    personality: str = Field(..., description="Personality description for the agent", min_length=1)
    goals: str = Field(..., description="Autonomous goals for the agent", min_length=1)
    mandate: Optional[str] = Field("", description="Initial mandate/orders for the agent")
    
    @validator('name')
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Profile name cannot be empty')
        if '/' in v or '\\' in v:
            raise ValueError('Profile name cannot contain path separators')
        return v.strip()

class ProfileUpdate(BaseModel):
    """Model for updating an existing agent profile"""
    model: Optional[str] = Field(None, description="AI model to use for this agent")
    embedding: Optional[str] = Field(None, description="Embedding model")
    personality: Optional[str] = Field(None, description="Personality description for the agent")
    goals: Optional[str] = Field(None, description="Autonomous goals for the agent")
    mandate: Optional[str] = Field(None, description="Mandate/orders for the agent")

class ProfileResponse(BaseModel):
    """Complete profile response model"""
    name: str
    model: str
    embedding: str
    agentType: str
    profileVersion: str = "3.0.0"
    compatibilityMode: str = "simplified_only"
    migratedAt: Optional[str] = None
    originalFile: Optional[str] = None
    agentState: AgentState
    legacyPrompts: Optional[Dict[str, str]] = None
    migrationMetadata: Optional[Dict[str, Any]] = None

class ApiResponse(BaseModel):
    """Standard API response format"""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None

# Socket.IO client for communicating with Node.js core
class NodeCoreSocketClient:
    """Socket.IO client for communicating with Node.js Agent Core service"""
    
    def __init__(self):
        self.sio = socketio.AsyncClient(
            logger=False,
            engineio_logger=False
        )
        self.node_core_url = f"http://{NODE_CORE_HOST}:{NODE_CORE_PORT}"
        self.connected = False
        self.pending_requests: Dict[str, asyncio.Future] = {}
        
        # Setup event handlers
        self._setup_event_handlers()
    
    def _setup_event_handlers(self):
        """Setup Socket.IO event handlers"""
        
        @self.sio.event
        async def connect():
            """Handle connection to Node.js core"""
            logger.info("Connected to Node.js core via Socket.IO")
            self.connected = True
        
        @self.sio.event
        async def disconnect():
            """Handle disconnection from Node.js core"""
            logger.warning("Disconnected from Node.js core")
            self.connected = False
        
        @self.sio.event
        async def connect_error(data):
            """Handle connection error"""
            logger.error(f"Socket.IO connection error: {data}")
            self.connected = False
        
        @self.sio.event
        async def profile_response(data):
            """Handle profile management responses"""
            request_id = data.get("request_id")
            if request_id and request_id in self.pending_requests:
                future = self.pending_requests.pop(request_id)
                if not future.cancelled():
                    future.set_result(data)
        
        @self.sio.event
        async def error(data):
            """Handle error responses"""
            request_id = data.get("request_id")
            if request_id and request_id in self.pending_requests:
                future = self.pending_requests.pop(request_id)
                if not future.cancelled():
                    future.set_exception(Exception(data.get("message", "Unknown error")))
    
    async def ensure_connected(self):
        """Ensure connection to Node.js core"""
        if not self.connected:
            try:
                await self.sio.connect(self.node_core_url)
                # Wait a moment for connection to establish
                await asyncio.sleep(0.1)
                if not self.connected:
                    raise Exception("Failed to establish connection")
            except Exception as e:
                logger.error(f"Failed to connect to Node.js core: {e}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Node.js core service unavailable"
                )
    
    async def _send_request(self, event: str, data: Dict[str, Any], timeout: float = REQUEST_TIMEOUT) -> Dict[str, Any]:
        """Send request to Node.js core and wait for response"""
        await self.ensure_connected()
        
        request_id = str(uuid.uuid4())
        data["request_id"] = request_id
        
        # Create future for response
        future = asyncio.Future()
        self.pending_requests[request_id] = future
        
        try:
            # Send request
            await self.sio.emit(event, data)
            logger.info(f"Sent {event} request to Node.js core: {request_id}")
            
            # Wait for response with timeout
            response = await asyncio.wait_for(future, timeout=timeout)
            
            if response.get("success"):
                return response.get("data", {})
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=response.get("error", "Request failed")
                )
                
        except asyncio.TimeoutError:
            self.pending_requests.pop(request_id, None)
            logger.error(f"Request {request_id} timed out after {timeout}s")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Request to Node.js core timed out"
            )
        except Exception as e:
            self.pending_requests.pop(request_id, None)
            if isinstance(e, HTTPException):
                raise
            logger.error(f"Request {request_id} failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Communication with Node.js core failed"
            )
    
    async def get_profiles(self) -> List[Dict[str, Any]]:
        """Get all agent profiles from Node.js core"""
        try:
            response = await self._send_request("get-profiles", {})
            return response.get("profiles", [])
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to get profiles from Node.js core: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Node.js core service unavailable"
            )
    
    async def get_profile(self, name: str) -> Dict[str, Any]:
        """Get a specific agent profile from Node.js core"""
        try:
            response = await self._send_request("get-profile", {"profileName": name})
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to get profile '{name}' from Node.js core: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Node.js core service unavailable"
            )
    
    async def create_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new agent profile in Node.js core"""
        try:
            response = await self._send_request("save-profile", {
                "profileName": profile_data["name"],
                "profileData": profile_data
            })
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to create profile in Node.js core: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Node.js core service unavailable"
            )
    
    async def update_profile(self, name: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing agent profile in Node.js core"""
        try:
            # First get existing profile
            existing_profile = await self.get_profile(name)
            
            # Update with new data
            updated_profile = {**existing_profile, **profile_data}
            updated_profile["name"] = name  # Ensure name is preserved
            
            response = await self._send_request("save-profile", {
                "profileName": name,
                "profileData": updated_profile
            })
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to update profile '{name}' in Node.js core: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Node.js core service unavailable"
            )
    
    async def delete_profile(self, name: str) -> Dict[str, Any]:
        """Delete an agent profile from Node.js core"""
        try:
            response = await self._send_request("delete-profile", {"profileName": name})
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to delete profile '{name}' from Node.js core: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Node.js core service unavailable"
            )

def _create_full_profile_data(profile_create: ProfileCreate) -> Dict[str, Any]:
    """Create complete profile data structure from create request"""
    current_time = datetime.utcnow().isoformat() + "Z"
    
    # Create agent state from profile data
    agent_state = AgentState(
        personality=profile_create.personality,
        goals=profile_create.goals,
        mandate=profile_create.mandate or ""
    )
    
    # Create complete profile structure
    profile_data = {
        "name": profile_create.name,
        "model": profile_create.model,
        "embedding": profile_create.embedding,
        "agentType": profile_create.agentType,
        "profileVersion": "3.0.0",
        "compatibilityMode": "simplified_only",
        "migratedAt": current_time,
        "originalFile": f"{profile_create.name}.json",
        "agentState": agent_state.dict(),
        "legacyPrompts": {
            "conversing": f"You are {profile_create.name}, an AI agent in Minecraft with the following personality: {profile_create.personality}. Your goals are: {profile_create.goals}.",
            "coding": f"You are {profile_create.name}, writing code to accomplish tasks in Minecraft.",
            "saving_memory": f"You are {profile_create.name}, saving important memories.",
            "bot_responder": f"You are {profile_create.name}, deciding whether to respond to messages."
        },
        "migrationMetadata": {
            "originalComplexity": "langgraph_v2",
            "simplifiedComplexity": "langgraph_simplified",
            "migrationVersion": "1.0.0",
            "qualityScore": 0
        }
    }
    
    return profile_data

# Initialize Node.js core Socket.IO client
node_core_client = NodeCoreSocketClient()

# API endpoints
@router.get("/profiles", response_model=ApiResponse, tags=["Profile Management"])
async def list_profiles():
    """
    List all agent profiles
    
    Returns a list of all available agent profiles from the Node.js core service.
    
    **Response:**
    - **success**: Boolean indicating if the request was successful
    - **data**: Array of profile objects containing name, model, agentType, and agentState
    - **meta**: Object containing count of profiles
    
    **Example Response:**
    ```json
    {
        "success": true,
        "data": [
            {
                "name": "AlphaSurvivor",
                "model": "ollama/hf.co/unsloth/Qwen3-30B-A3B-Instruct-2507-20000-GGUF:Q4_K_XL",
                "agentType": "langgraph_simplified",
                "personality": "creative and disciplined personality",
                "goals": "strong survival instinct, also enjoys building",
                "mandate": ""
            }
        ],
        "meta": {"count": 1}
    }
    ```
    """
    try:
        profiles = await node_core_client.get_profiles()
        # Return simplified profile list for API consumers
        simplified_profiles = []
        for profile in profiles:
            simplified = {
                "name": profile.get("name"),
                "model": profile.get("model"),
                "agentType": profile.get("agentType"),
                "compatibilityMode": profile.get("compatibilityMode"),
                "personality": profile.get("agentState", {}).get("personality"),
                "goals": profile.get("agentState", {}).get("goals"),
                "mandate": profile.get("agentState", {}).get("mandate"),
                "createdAt": profile.get("migratedAt")
            }
            simplified_profiles.append(simplified)
        
        return ApiResponse(
            success=True,
            data=simplified_profiles,
            meta={"count": len(simplified_profiles)}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error listing profiles: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/profiles/{name}", response_model=ApiResponse, tags=["Profile Management"])
async def get_profile(name: str):
    """
    Get a specific agent profile
    
    Args:
        name: The name of the profile to retrieve
    
    **Response:**
    - **success**: Boolean indicating if the request was successful
    - **data**: Complete profile object with all fields including agentState
    
    **Example Response:**
    ```json
    {
        "success": true,
        "data": {
            "name": "AlphaSurvivor",
            "model": "ollama/hf.co/unsloth/Qwen3-30B-A3B-Instruct-2507-20000-GGUF:Q4_K_XL",
            "agentState": {
                "personality": "creative and disciplined personality",
                "goals": "strong survival instinct",
                "mandate": ""
            }
        }
    }
    ```
    
    **Error Responses:**
    - **404**: Profile not found
    - **503**: Node.js core service unavailable
    """
    try:
        profile = await node_core_client.get_profile(name)
        return ApiResponse(
            success=True,
            data=profile
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error getting profile '{name}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/profiles", response_model=ApiResponse, status_code=status.HTTP_201_CREATED, tags=["Profile Management"])
async def create_profile(profile: ProfileCreate):
    """
    Create a new agent profile
    
    Args:
        profile: The profile data to create
    
    **Request Body:**
    - **name**: Unique profile name (1-50 characters, no path separators)
    - **personality**: Personality description for the agent (required)
    - **goals**: Autonomous goals for the agent (required)
    - **mandate**: Initial mandate/orders for the agent (optional)
    - **model**: AI model to use (defaults to Qwen3-30B)
    - **embedding**: Embedding model (defaults to nomic-embed-text)
    
    **Example Request:**
    ```json
    {
        "name": "BuilderBot",
        "personality": "creative, meticulous, enjoys construction",
        "goals": "build impressive structures, gather resources",
        "mandate": "construct a medieval castle"
    }
    ```
    
    **Response:**
    - **success**: Boolean indicating if the request was successful
    - **data**: Complete created profile object
    - **meta**: Success message
    
    **Error Responses:**
    - **400**: Invalid profile data or validation error
    - **409**: Profile already exists
    - **503**: Node.js core service unavailable
    """
    try:
        # Validate profile doesn't already exist
        try:
            await node_core_client.get_profile(profile.name)
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Profile '{profile.name}' already exists"
            )
        except HTTPException as e:
            if e.status_code == 404:
                # Profile doesn't exist, proceed with creation
                pass
            else:
                # Some other error occurred
                raise
        
        # Create complete profile data
        profile_data = _create_full_profile_data(profile)
        created_profile = await node_core_client.create_profile(profile_data)
        
        return ApiResponse(
            success=True,
            data=created_profile,
            meta={"message": f"Profile '{profile.name}' created successfully"}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/profiles/{name}", response_model=ApiResponse, tags=["Profile Management"])
async def update_profile(name: str, profile: ProfileUpdate):
    """
    Update an existing agent profile
    
    Args:
        name: The name of the profile to update
        profile: The profile data to update
    
    **Request Body:**
    - **personality**: New personality description (optional)
    - **goals**: New autonomous goals (optional)
    - **mandate**: New mandate/orders (optional)
    - **model**: New AI model (optional)
    - **embedding**: New embedding model (optional)
    
    **Example Request:**
    ```json
    {
        "personality": "updated personality description",
        "goals": "new goals for the agent"
    }
    ```
    
    **Response:**
    - **success**: Boolean indicating if the request was successful
    - **data**: Updated complete profile object
    - **meta**: Success message
    
    **Error Responses:**
    - **400**: No valid fields to update
    - **404**: Profile not found
    - **503**: Node.js core service unavailable
    """
    try:
        # Only include non-None fields in the update
        update_data = {k: v for k, v in profile.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )
        
        # Check if profile exists
        try:
            existing_profile = await node_core_client.get_profile(name)
        except HTTPException as e:
            if e.status_code == 404:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Profile '{name}' not found"
                )
            else:
                raise
        
        # Update agentState fields if they are being updated
        if "personality" in update_data or "goals" in update_data or "mandate" in update_data:
            agent_state = existing_profile.get("agentState", {})
            if "personality" in update_data:
                agent_state["personality"] = update_data.pop("personality")
            if "goals" in update_data:
                agent_state["goals"] = update_data.pop("goals")
            if "mandate" in update_data:
                agent_state["mandate"] = update_data.pop("mandate")
            update_data["agentState"] = agent_state
        
        # Add updated timestamp
        update_data["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        
        updated_profile = await node_core_client.update_profile(name, update_data)
        return ApiResponse(
            success=True,
            data=updated_profile,
            meta={"message": f"Profile '{name}' updated successfully"}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error updating profile '{name}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/profiles/{name}", response_model=ApiResponse, tags=["Profile Management"])
async def delete_profile(name: str):
    """
    Delete an agent profile
    
    Args:
        name: The name of the profile to delete
    
    **Response:**
    - **success**: Boolean indicating if the request was successful
    - **data**: Deletion confirmation
    - **meta**: Success message
    
    **Example Response:**
    ```json
    {
        "success": true,
        "data": {"deleted": true, "profile": "AlphaSurvivor"},
        "meta": {"message": "Profile 'AlphaSurvivor' deleted successfully"}
    }
    ```
    
    **Error Responses:**
    - **404**: Profile not found
    - **503**: Node.js core service unavailable
    """
    try:
        result = await node_core_client.delete_profile(name)
        return ApiResponse(
            success=True,
            data=result,
            meta={"message": f"Profile '{name}' deleted successfully"}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error deleting profile '{name}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )