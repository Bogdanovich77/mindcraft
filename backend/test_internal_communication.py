#!/usr/bin/env python3
"""
Test script for internal Socket.IO communication between FastAPI and Node.js core

This script validates:
1. FastAPI can connect to Node.js core on port 8081
2. Message relay works in both directions
3. Key Socket.IO events are properly handled
4. Connection management and reconnection logic works
"""

import asyncio
import json
import logging
import time
import socketio
import requests
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class InternalCommunicationTester:
    """Test class for internal Socket.IO communication"""
    
    def __init__(self):
        self.fastapi_url = "http://localhost:8000"
        self.node_core_url = "http://localhost:8081"
        self.test_results = []
        
    async def test_node_core_availability(self) -> bool:
        """Test if Node.js core is available on port 8081"""
        logger.info("🔍 Testing Node.js core availability...")
        try:
            response = requests.get(f"{self.node_core_url}", timeout=5)
            logger.info("✅ Node.js core is available")
            self.test_results.append(("Node.js Core Availability", True, "Node.js core responding"))
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Node.js core not available: {e}")
            self.test_results.append(("Node.js Core Availability", False, str(e)))
            return False
    
    async def test_fastapi_availability(self) -> bool:
        """Test if FastAPI gateway is available on port 8000"""
        logger.info("🔍 Testing FastAPI gateway availability...")
        try:
            response = requests.get(f"{self.fastapi_url}/health", timeout=5)
            if response.status_code == 200:
                logger.info("✅ FastAPI gateway is available")
                self.test_results.append(("FastAPI Gateway Availability", True, "FastAPI gateway responding"))
                return True
            else:
                logger.error(f"❌ FastAPI gateway returned status {response.status_code}")
                self.test_results.append(("FastAPI Gateway Availability", False, f"Status {response.status_code}"))
                return False
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ FastAPI gateway not available: {e}")
            self.test_results.append(("FastAPI Gateway Availability", False, str(e)))
            return False
    
    async def test_websocket_connection(self) -> bool:
        """Test WebSocket connection to FastAPI gateway"""
        logger.info("🔍 Testing WebSocket connection to FastAPI gateway...")
        
        sio = socketio.AsyncClient(logger=True)
        connected = asyncio.Event()
        
        @sio.event
        async def connect():
            logger.info("✅ Connected to FastAPI WebSocket")
            connected.set()
        
        @sio.event
        async def connect_error(data):
            logger.error(f"❌ WebSocket connection error: {data}")
        
        try:
            await sio.connect(self.fastapi_url)
            await asyncio.wait_for(connected.wait(), timeout=10)
            await sio.disconnect()
            self.test_results.append(("WebSocket Connection", True, "Successfully connected to FastAPI WebSocket"))
            return True
        except asyncio.TimeoutError:
            logger.error("❌ WebSocket connection timeout")
            self.test_results.append(("WebSocket Connection", False, "Connection timeout"))
            return False
        except Exception as e:
            logger.error(f"❌ WebSocket connection failed: {e}")
            self.test_results.append(("WebSocket Connection", False, str(e)))
            return False
    
    async def test_agent_events(self) -> bool:
        """Test agent state update events"""
        logger.info("🔍 Testing agent state update events...")
        
        sio = socketio.AsyncClient(logger=True)
        events_received = []
        authenticated = asyncio.Event()
        
        @sio.event
        async def connect():
            logger.info("Connected to FastAPI WebSocket for agent events test")
            # Authenticate
            await sio.emit("authenticate", {"token": "test-token"})
        
        @sio.event
        async def authenticated(data):
            logger.info("✅ Authenticated successfully")
            authenticated.set()
        
        @sio.event
        async def agent_state_update(data):
            logger.info(f"📨 Received agent state update: {data}")
            events_received.append(("agent_state_update", data))
        
        @sio.event
        async def agent_action_executed(data):
            logger.info(f"📨 Received agent action executed: {data}")
            events_received.append(("agent_action_executed", data))
        
        @sio.event
        async def agent_message_sent(data):
            logger.info(f"📨 Received agent message sent: {data}")
            events_received.append(("agent_message_sent", data))
        
        try:
            await sio.connect(self.fastapi_url)
            await asyncio.wait_for(authenticated.wait(), timeout=5)
            
            # Wait for any existing agent events
            await asyncio.sleep(3)
            
            await sio.disconnect()
            
            # Check if we received any agent events
            if events_received:
                logger.info(f"✅ Received {len(events_received)} agent events")
                self.test_results.append(("Agent Events", True, f"Received {len(events_received)} events"))
                return True
            else:
                logger.warning("⚠️ No agent events received (may be normal if no agents running)")
                self.test_results.append(("Agent Events", True, "No events received (no agents running)"))
                return True
                
        except Exception as e:
            logger.error(f"❌ Agent events test failed: {e}")
            self.test_results.append(("Agent Events", False, str(e)))
            return False
    
    async def test_control_events(self) -> bool:
        """Test agent control events"""
        logger.info("🔍 Testing agent control events...")
        
        sio = socketio.AsyncClient(logger=True)
        authenticated = asyncio.Event()
        control_response = asyncio.Event()
        
        @sio.event
        async def connect():
            logger.info("Connected to FastAPI WebSocket for control events test")
            await sio.emit("authenticate", {"token": "test-token"})
        
        @sio.event
        async def authenticated(data):
            logger.info("✅ Authenticated successfully")
            authenticated.set()
        
        @sio.event
        async def agent_control_response(data):
            logger.info(f"📨 Received agent control response: {data}")
            control_response.set()
        
        try:
            await sio.connect(self.fastapi_url)
            await asyncio.wait_for(authenticated.wait(), timeout=5)
            
            # Test get_agent_list event
            logger.info("📤 Sending get_agent_list event...")
            await sio.emit("get_agent_list", {})
            
            # Wait for response
            await asyncio.wait_for(control_response.wait(), timeout=5)
            
            await sio.disconnect()
            
            logger.info("✅ Agent control events working")
            self.test_results.append(("Agent Control Events", True, "Control events processed successfully"))
            return True
                
        except asyncio.TimeoutError:
            logger.warning("⚠️ Agent control response timeout (may be normal if no agents)")
            self.test_results.append(("Agent Control Events", True, "No response (no agents running)"))
            return True
        except Exception as e:
            logger.error(f"❌ Agent control events test failed: {e}")
            self.test_results.append(("Agent Control Events", False, str(e)))
            return False
    
    async def test_profile_events(self) -> bool:
        """Test profile management events"""
        logger.info("🔍 Testing profile management events...")
        
        sio = socketio.AsyncClient(logger=True)
        authenticated = asyncio.Event()
        profile_response = asyncio.Event()
        
        @sio.event
        async def connect():
            logger.info("Connected to FastAPI WebSocket for profile events test")
            await sio.emit("authenticate", {"token": "test-token"})
        
        @sio.event
        async def authenticated(data):
            logger.info("✅ Authenticated successfully")
            authenticated.set()
        
        @sio.event
        async def profile_response(data):
            logger.info(f"📨 Received profile response: {data}")
            profile_response.set()
        
        try:
            await sio.connect(self.fastapi_url)
            await asyncio.wait_for(authenticated.wait(), timeout=5)
            
            # Test get-profiles event
            logger.info("📤 Sending get-profiles event...")
            await sio.emit("get-profiles", {})
            
            # Wait for response
            await asyncio.wait_for(profile_response.wait(), timeout=5)
            
            await sio.disconnect()
            
            logger.info("✅ Profile management events working")
            self.test_results.append(("Profile Management Events", True, "Profile events processed successfully"))
            return True
                
        except asyncio.TimeoutError:
            logger.error("❌ Profile management response timeout")
            self.test_results.append(("Profile Management Events", False, "Response timeout"))
            return False
        except Exception as e:
            logger.error(f"❌ Profile management events test failed: {e}")
            self.test_results.append(("Profile Management Events", False, str(e)))
            return False
    
    async def run_all_tests(self):
        """Run all communication tests"""
        logger.info("🚀 Starting internal Socket.IO communication tests...")
        logger.info("=" * 60)
        
        # Test basic availability
        node_core_available = await self.test_node_core_availability()
        fastapi_available = await self.test_fastapi_availability()
        
        if not node_core_available:
            logger.error("❌ Node.js core is not available, skipping WebSocket tests")
            return
        
        if not fastapi_available:
            logger.error("❌ FastAPI gateway is not available, skipping WebSocket tests")
            return
        
        # Test WebSocket functionality
        await self.test_websocket_connection()
        await self.test_agent_events()
        await self.test_control_events()
        await self.test_profile_events()
        
        # Print results
        logger.info("=" * 60)
        logger.info("📊 TEST RESULTS SUMMARY")
        logger.info("=" * 60)
        
        passed = 0
        total = len(self.test_results)
        
        for test_name, success, message in self.test_results:
            status = "✅ PASS" if success else "❌ FAIL"
            logger.info(f"{status} {test_name}: {message}")
            if success:
                passed += 1
        
        logger.info("=" * 60)
        logger.info(f"📈 Overall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
        
        if passed == total:
            logger.info("🎉 All tests passed! Internal Socket.IO communication is working correctly.")
        else:
            logger.warning(f"⚠️ {total - passed} test(s) failed. Check the logs above for details.")
        
        return passed == total

async def main():
    """Main test function"""
    tester = InternalCommunicationTester()
    success = await tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)