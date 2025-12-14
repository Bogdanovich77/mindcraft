#!/usr/bin/env python3
"""
Startup script for testing the FastAPI + Node.js internal communication

This script helps set up the test environment by:
1. Installing required Python dependencies
2. Providing instructions for starting the services
3. Running the communication test
"""

import subprocess
import sys
import os
import time

def install_dependencies():
    """Install required Python dependencies"""
    print("📦 Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def check_node_core():
    """Check if Node.js core is running"""
    print("🔍 Checking if Node.js core is running on port 8081...")
    try:
        import requests
        response = requests.get("http://localhost:8081", timeout=2)
        if response.status_code == 200:
            print("✅ Node.js core is running")
            return True
        else:
            print(f"❌ Node.js core returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException:
        print("❌ Node.js core is not running")
        return False

def start_fastapi():
    """Start the FastAPI gateway"""
    print("🚀 Starting FastAPI gateway...")
    try:
        # Change to fastapi-gateway directory
        os.chdir("fastapi-gateway")
        
        # Start FastAPI in background
        process = subprocess.Popen([
            sys.executable, "main.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait a moment for startup
        time.sleep(3)
        
        # Check if it's running
        try:
            import requests
            response = requests.get("http://localhost:8000/health", timeout=2)
            if response.status_code == 200:
                print("✅ FastAPI gateway started successfully")
                return process
            else:
                print(f"❌ FastAPI gateway returned status {response.status_code}")
                process.terminate()
                return None
        except requests.exceptions.RequestException:
            print("❌ FastAPI gateway failed to start")
            process.terminate()
            return None
            
    except Exception as e:
        print(f"❌ Failed to start FastAPI gateway: {e}")
        return None

def run_communication_test():
    """Run the communication test"""
    print("🧪 Running internal communication test...")
    try:
        # Change back to backend directory
        os.chdir("..")
        
        result = subprocess.run([
            sys.executable, "test_internal_communication.py"
        ], capture_output=True, text=True)
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Failed to run communication test: {e}")
        return False

def main():
    """Main function"""
    print("🔧 FastAPI + Node.js Internal Communication Test Setup")
    print("=" * 60)
    
    # Install dependencies
    if not install_dependencies():
        return 1
    
    # Check Node.js core
    if not check_node_core():
        print("\n📋 Please start the Node.js core first:")
        print("   cd backend/node-core")
        print("   node src/mindcraft/mindserver.js")
        print("\nThen run this script again.")
        return 1
    
    # Start FastAPI
    fastapi_process = start_fastapi()
    if not fastapi_process:
        return 1
    
    try:
        # Run communication test
        success = run_communication_test()
        
        if success:
            print("\n🎉 All tests passed! Internal communication is working correctly.")
            return 0
        else:
            print("\n❌ Some tests failed. Check the output above for details.")
            return 1
    finally:
        # Clean up FastAPI process
        if fastapi_process:
            print("\n🛑 Stopping FastAPI gateway...")
            fastapi_process.terminate()
            fastapi_process.wait()

if __name__ == "__main__":
    exit_code = main()
    exit(exit_code)