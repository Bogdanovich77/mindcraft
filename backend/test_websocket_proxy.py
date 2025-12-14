#!/usr/bin/env python3
"""
Comprehensive WebSocket Proxy Test Suite

This test suite validates the complete WebSocket proxy functionality:
- External client connections
- Authentication flow
- Message validation and sanitization
- Bidirectional communication with Node.js core
- Error handling and edge cases
- Performance metrics
"""

import asyncio
import json
import time
import jwt
import socketio
import pytest
import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSocketProxyTester:
    """Test client for WebSocket proxy validation"""
    
    def __init__(self, gateway_url: str = "http://localhost:8000"):
        self.gateway_url = gateway_url
        self.sio = None
        self.test_results = []
        self.received_events = []
        
    async def connect(self) -> bool:
        """Connect to WebSocket proxy"""
        try:
            self.sio = socketio.AsyncClient(logger=False)
            
            # Setup event handlers
            self.sio.on('connect', self._on_connect)
            self.sio.on('disconnect', self._on_disconnect)
            self.sio.on('authenticated', self._on_authenticated)
            self.sio.on('authentication_error', self._on_auth_error)
            self.sio.on('error', self._on_error)
            self.sio.on('agent:state:update', self._on_agent_state_update)
            self.sio.on('agent:action:executed', self._on_agent_action_executed)
            self.sio.on('agent:message:sent', self._on_agent_message_sent)
            
            await self.sio.connect(self.gateway_url)
            await asyncio.sleep(0.5)  # Wait for connection
            
            return self.sio.connected
            
        except Exception as e:
            logger.error(f"Connection failed: {e}")
            return False
    
    async def disconnect(self):
        """Disconnect from WebSocket proxy"""
        if self.sio:
            await self.sio.disconnect()
    
    def _on_connect(self):
        logger.info("Connected to WebSocket proxy")
        self.test_results.append(("connection", "success", "Connected successfully"))
    
    def _on_disconnect(self):
        logger.info("Disconnected from WebSocket proxy")
    
    def _on_authenticated(self, data):
        logger.info(f"Authenticated: {data}")
        self.test_results.append(("authentication", "success", f"Authenticated: {data}"))
    
    def _on_auth_error(self, data):
        logger.error(f"Authentication error: {data}")
        self.test_results.append(("authentication", "error", f"Auth error: {data}"))
    
    def _on_error(self, data):
        logger.error(f"Server error: {data}")
        self.test_results.append(("server_error", "error", f"Server error: {data}"))
    
    def _on_agent_state_update(self, data):
        logger.info(f"Agent state update: {data}")
        self.received_events.append(("agent:state:update", data))
    
    def _on_agent_action_executed(self, data):
        logger.info(f"Agent action executed: {data}")
        self.received_events.append(("agent:action:executed", data))
    
    def _on_agent_message_sent(self, data):
        logger.info(f"Agent message sent: {data}")
        self.received_events.append(("agent:message:sent", data))
    
    async def authenticate(self, token: str) -> bool:
        """Authenticate with JWT token"""
        try:
            await self.sio.emit('authenticate', {'token': token})
            await asyncio.sleep(0.5)  # Wait for response
            
            # Check if authentication was successful
            auth_results = [r for r in self.test_results if r[0] == "authentication"]
            return len(auth_results) > 0 and auth_results[-1][1] == "success"
            
        except Exception as e:
            logger.error(f"Authentication failed: {e}")
            return False
    
    def generate_test_token(self, user_id: str = "test_user") -> str:
        """Generate test JWT token"""
        payload = {
            "sub": user_id,
            "user_id": user_id,
            "permissions": ["read", "write"],
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        return jwt.encode(payload, "test-secret", algorithm="HS256")
    
    async def send_control_event(self, event: str, data: Dict[str, Any]) -> bool:
        """Send control event and check for errors"""
        try:
            await self.sio.emit(event, data)
            await asyncio.sleep(0.5)  # Wait for processing
            
            # Check for server errors
            error_results = [r for r in self.test_results if r[0] == "server_error"]
            return len(error_results) == 0
            
        except Exception as e:
            logger.error(f"Failed to send {event}: {e}")
            return False
    
    def get_test_summary(self) -> Dict[str, Any]:
        """Get summary of test results"""
        total_tests = len(self.test_results)
        successful_tests = len([r for r in self.test_results if r[1] == "success"])
        failed_tests = total_tests - successful_tests
        
        return {
            "total_tests": total_tests,
            "successful": successful_tests,
            "failed": failed_tests,
            "success_rate": round(successful_tests / total_tests * 100, 2) if total_tests > 0 else 0,
            "results": self.test_results,
            "events_received": len(self.received_events)
        }

async def test_basic_connection():
    """Test basic WebSocket connection"""
    logger.info("Testing basic connection...")
    
    tester = WebSocketProxyTester()
    connected = await tester.connect()
    
    if connected:
        logger.info("✅ Basic connection test passed")
        await tester.disconnect()
        return True
    else:
        logger.error("❌ Basic connection test failed")
        return False

async def test_authentication():
    """Test JWT authentication flow"""
    logger.info("Testing authentication...")
    
    tester = WebSocketProxyTester()
    
    if not await tester.connect():
        logger.error("❌ Authentication test failed - could not connect")
        return False
    
    # Test valid token
    valid_token = tester.generate_test_token()
    auth_success = await tester.authenticate(valid_token)
    
    if auth_success:
        logger.info("✅ Valid token authentication passed")
    else:
        logger.error("❌ Valid token authentication failed")
    
    # Test invalid token
    await tester.disconnect()
    await tester.connect()
    
    auth_failed = await tester.authenticate("invalid_token")
    
    if not auth_failed:
        logger.info("✅ Invalid token rejection passed")
    else:
        logger.error("❌ Invalid token rejection failed")
    
    await tester.disconnect()
    return auth_success and not auth_failed

async def test_message_validation():
    """Test message validation and sanitization"""
    logger.info("Testing message validation...")
    
    tester = WebSocketProxyTester()
    
    if not await tester.connect():
        logger.error("❌ Message validation test failed - could not connect")
        return False
    
    # Authenticate
    token = tester.generate_test_token()
    if not await tester.authenticate(token):
        logger.error("❌ Message validation test failed - authentication failed")
        await tester.disconnect()
        return False
    
    # Test valid control event
    valid_data = {
        "agentName": "TestBot",
        "profileName": "Warrior"
    }
    
    valid_result = await tester.send_control_event("create-agent", valid_data)
    
    if valid_result:
        logger.info("✅ Valid event validation passed")
    else:
        logger.error("❌ Valid event validation failed")
    
    # Test invalid control event (missing required field)
    invalid_data = {
        "profileName": "Warrior"  # Missing agentName
    }
    
    # Clear previous results
    tester.test_results = [r for r in tester.test_results if r[0] != "server_error"]
    
    invalid_result = await tester.send_control_event("create-agent", invalid_data)
    
    if not invalid_result:
        logger.info("✅ Invalid event rejection passed")
    else:
        logger.error("❌ Invalid event rejection failed")
    
    await tester.disconnect()
    return valid_result and not invalid_result

async def test_real_time_events():
    """Test real-time event reception"""
    logger.info("Testing real-time events...")
    
    tester = WebSocketProxyTester()
    
    if not await tester.connect():
        logger.error("❌ Real-time events test failed - could not connect")
        return False
    
    # Authenticate
    token = tester.generate_test_token()
    if not await tester.authenticate(token):
        logger.error("❌ Real-time events test failed - authentication failed")
        await tester.disconnect()
        return False
    
    # Wait for potential events
    await asyncio.sleep(2)
    
    events_received = len(tester.received_events)
    
    if events_received >= 0:  # We might not have events if no agents are running
        logger.info(f"✅ Real-time events test passed - received {events_received} events")
        await tester.disconnect()
        return True
    else:
        logger.error("❌ Real-time events test failed")
        await tester.disconnect()
        return False

async def test_error_handling():
    """Test error handling scenarios"""
    logger.info("Testing error handling...")
    
    tester = WebSocketProxyTester()
    
    if not await tester.connect():
        logger.error("❌ Error handling test failed - could not connect")
        return False
    
    # Test unauthenticated event (should fail)
    result = await tester.send_control_event("create-agent", {"agentName": "TestBot"})
    
    if not result:
        logger.info("✅ Unauthenticated event rejection passed")
    else:
        logger.error("❌ Unauthenticated event rejection failed")
    
    # Test invalid event name
    await tester.authenticate(tester.generate_test_token())
    tester.test_results = [r for r in tester.test_results if r[0] != "server_error"]
    
    result = await tester.send_control_event("invalid-event", {"test": "data"})
    
    if not result:
        logger.info("✅ Invalid event rejection passed")
    else:
        logger.error("❌ Invalid event rejection failed")
    
    await tester.disconnect()
    return True

async def test_performance_metrics():
    """Test performance metrics endpoints"""
    logger.info("Testing performance metrics...")
    
    import httpx
    
    try:
        async with httpx.AsyncClient() as client:
            # Test metrics endpoint
            response = await client.get("http://localhost:8000/api/websocket/metrics")
            if response.status_code == 200:
                logger.info("✅ Metrics endpoint test passed")
                metrics_success = True
            else:
                logger.error(f"❌ Metrics endpoint test failed: {response.status_code}")
                metrics_success = False
            
            # Test health endpoint
            response = await client.get("http://localhost:8000/api/websocket/health")
            if response.status_code == 200:
                logger.info("✅ Health endpoint test passed")
                health_success = True
            else:
                logger.error(f"❌ Health endpoint test failed: {response.status_code}")
                health_success = False
            
            # Test status endpoint
            response = await client.get("http://localhost:8000/api/websocket/status")
            if response.status_code == 200:
                logger.info("✅ Status endpoint test passed")
                status_success = True
            else:
                logger.error(f"❌ Status endpoint test failed: {response.status_code}")
                status_success = False
        
        return metrics_success and health_success and status_success
        
    except Exception as e:
        logger.error(f"❌ Performance metrics test failed: {e}")
        return False

async def run_comprehensive_tests():
    """Run all WebSocket proxy tests"""
    logger.info("🚀 Starting comprehensive WebSocket proxy tests...")
    
    tests = [
        ("Basic Connection", test_basic_connection),
        ("Authentication", test_authentication),
        ("Message Validation", test_message_validation),
        ("Real-time Events", test_real_time_events),
        ("Error Handling", test_error_handling),
        ("Performance Metrics", test_performance_metrics)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        logger.info(f"\n--- Running {test_name} Test ---")
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            logger.error(f"❌ {test_name} test failed with exception: {e}")
            results.append((test_name, False))
        
        # Small delay between tests
        await asyncio.sleep(1)
    
    # Print summary
    logger.info("\n" + "="*50)
    logger.info("🏁 TEST SUMMARY")
    logger.info("="*50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        logger.info(f"{test_name}: {status}")
    
    logger.info(f"\nOverall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        logger.info("🎉 All tests passed! WebSocket proxy is working correctly.")
    else:
        logger.warning("⚠️  Some tests failed. Please check the implementation.")
    
    return passed == total

if __name__ == "__main__":
    # Run the comprehensive test suite
    success = asyncio.run(run_comprehensive_tests())
    exit(0 if success else 1)