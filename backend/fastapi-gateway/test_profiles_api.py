#!/usr/bin/env python3
"""
Test script for FastAPI Profile Management API

This script tests all profile management endpoints to ensure they work correctly
with the Socket.IO communication to Node.js core.
"""

import asyncio
import json
import logging
import sys
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ProfileAPITester:
    """Test class for Profile Management API"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.test_results = []
    
    def log_test_result(self, test_name: str, success: bool, message: str = ""):
        """Log test result"""
        status = "PASS" if success else "FAIL"
        result = {
            "test": test_name,
            "status": status,
            "message": message
        }
        self.test_results.append(result)
        logger.info(f"{status}: {test_name} - {message}")
    
    async def test_health_check(self) -> bool:
        """Test health check endpoint"""
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/health", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    self.log_test_result("Health Check", True, f"Service healthy on port {data.get('port')}")
                    return True
                else:
                    self.log_test_result("Health Check", False, f"Status code: {response.status_code}")
                    return False
        except Exception as e:
            self.log_test_result("Health Check", False, f"Connection error: {e}")
            return False
    
    async def test_list_profiles(self) -> bool:
        """Test GET /api/profiles endpoint"""
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/profiles", timeout=30)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and isinstance(data.get("data"), list):
                        count = data.get("meta", {}).get("count", 0)
                        self.log_test_result("List Profiles", True, f"Found {count} profiles")
                        return True
                    else:
                        self.log_test_result("List Profiles", False, "Invalid response format")
                        return False
                else:
                    self.log_test_result("List Profiles", False, f"Status code: {response.status_code}")
                    return False
        except Exception as e:
            self.log_test_result("List Profiles", False, f"Request error: {e}")
            return False
    
    async def test_create_profile(self) -> bool:
        """Test POST /api/profiles endpoint"""
        test_profile = {
            "name": "TestBot_API",
            "personality": "test personality for API validation",
            "goals": "test goals for API validation",
            "mandate": "test mandate for API validation"
        }
        
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/profiles",
                    json=test_profile,
                    timeout=30
                )
                if response.status_code == 201:
                    data = response.json()
                    if data.get("success") and data.get("data"):
                        self.log_test_result("Create Profile", True, f"Created profile: {test_profile['name']}")
                        return True
                    else:
                        self.log_test_result("Create Profile", False, "Invalid response format")
                        return False
                else:
                    error_detail = response.json().get("detail", "Unknown error") if response.headers.get("content-type", "").startswith("application/json") else response.text
                    self.log_test_result("Create Profile", False, f"Status code: {response.status_code}, Error: {error_detail}")
                    return False
        except Exception as e:
            self.log_test_result("Create Profile", False, f"Request error: {e}")
            return False
    
    async def test_get_profile(self) -> bool:
        """Test GET /api/profiles/{name} endpoint"""
        profile_name = "TestBot_API"
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/profiles/{profile_name}", timeout=30)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and data.get("data"):
                        profile_data = data.get("data")
                        if profile_data.get("name") == profile_name:
                            self.log_test_result("Get Profile", True, f"Retrieved profile: {profile_name}")
                            return True
                        else:
                            self.log_test_result("Get Profile", False, "Profile name mismatch")
                            return False
                    else:
                        self.log_test_result("Get Profile", False, "Invalid response format")
                        return False
                else:
                    self.log_test_result("Get Profile", False, f"Status code: {response.status_code}")
                    return False
        except Exception as e:
            self.log_test_result("Get Profile", False, f"Request error: {e}")
            return False
    
    async def test_update_profile(self) -> bool:
        """Test PUT /api/profiles/{name} endpoint"""
        profile_name = "TestBot_API"
        update_data = {
            "personality": "updated test personality for API validation",
            "goals": "updated test goals for API validation"
        }
        
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.put(
                    f"{self.base_url}/api/profiles/{profile_name}",
                    json=update_data,
                    timeout=30
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and data.get("data"):
                        self.log_test_result("Update Profile", True, f"Updated profile: {profile_name}")
                        return True
                    else:
                        self.log_test_result("Update Profile", False, "Invalid response format")
                        return False
                else:
                    error_detail = response.json().get("detail", "Unknown error") if response.headers.get("content-type", "").startswith("application/json") else response.text
                    self.log_test_result("Update Profile", False, f"Status code: {response.status_code}, Error: {error_detail}")
                    return False
        except Exception as e:
            self.log_test_result("Update Profile", False, f"Request error: {e}")
            return False
    
    async def test_delete_profile(self) -> bool:
        """Test DELETE /api/profiles/{name} endpoint"""
        profile_name = "TestBot_API"
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.delete(f"{self.base_url}/api/profiles/{profile_name}", timeout=30)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        self.log_test_result("Delete Profile", True, f"Deleted profile: {profile_name}")
                        return True
                    else:
                        self.log_test_result("Delete Profile", False, "Invalid response format")
                        return False
                else:
                    error_detail = response.json().get("detail", "Unknown error") if response.headers.get("content-type", "").startswith("application/json") else response.text
                    self.log_test_result("Delete Profile", False, f"Status code: {response.status_code}, Error: {error_detail}")
                    return False
        except Exception as e:
            self.log_test_result("Delete Profile", False, f"Request error: {e}")
            return False
    
    async def test_profile_validation(self) -> bool:
        """Test profile validation with invalid data"""
        invalid_profile = {
            "name": "",  # Empty name should fail validation
            "personality": "test personality",
            "goals": "test goals"
        }
        
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/profiles",
                    json=invalid_profile,
                    timeout=30
                )
                if response.status_code == 422:  # Validation error
                    self.log_test_result("Profile Validation", True, "Correctly rejected invalid profile")
                    return True
                else:
                    self.log_test_result("Profile Validation", False, f"Expected validation error, got: {response.status_code}")
                    return False
        except Exception as e:
            self.log_test_result("Profile Validation", False, f"Request error: {e}")
            return False
    
    async def run_all_tests(self) -> bool:
        """Run all API tests"""
        logger.info("Starting FastAPI Profile Management API Tests")
        logger.info("=" * 60)
        
        tests = [
            self.test_health_check,
            self.test_list_profiles,
            self.test_profile_validation,
            self.test_create_profile,
            self.test_get_profile,
            self.test_update_profile,
            self.test_delete_profile
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if await test():
                    passed += 1
                # Small delay between tests
                await asyncio.sleep(0.5)
            except Exception as e:
                logger.error(f"Test {test.__name__} failed with exception: {e}")
        
        # Print summary
        logger.info("=" * 60)
        logger.info(f"Test Summary: {passed}/{total} tests passed")
        
        for result in self.test_results:
            status_symbol = "✓" if result["status"] == "PASS" else "✗"
            logger.info(f"{status_symbol} {result['test']}: {result['message']}")
        
        success_rate = (passed / total) * 100
        logger.info(f"Success Rate: {success_rate:.1f}%")
        
        return passed == total

async def main():
    """Main test function"""
    # Check if httpx is available
    try:
        import httpx
    except ImportError:
        logger.error("httpx is required for testing. Install with: pip install httpx")
        sys.exit(1)
    
    # Run tests
    tester = ProfileAPITester()
    success = await tester.run_all_tests()
    
    if success:
        logger.info("All tests passed! ✓")
        sys.exit(0)
    else:
        logger.error("Some tests failed! ✗")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())