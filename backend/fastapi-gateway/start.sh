#!/bin/bash

# FastAPI Gateway Startup Script
# This script starts the FastAPI gateway service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting FastAPI Gateway for Mindcraft...${NC}"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed or not in PATH${NC}"
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "main.py" ] || [ ! -f "start.py" ]; then
    echo -e "${RED}Error: Please run this script from the backend/fastapi-gateway directory${NC}"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
pip install -r ../requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found. Please create it from the template.${NC}"
    exit 1
fi

# Start the FastAPI gateway
echo -e "${GREEN}Starting FastAPI Gateway...${NC}"
echo -e "${BLUE}API Documentation will be available at: http://localhost:8000/docs${NC}"
echo -e "${BLUE}WebSocket endpoint: ws://localhost:8000/socket.io${NC}"
echo -e "${BLUE}Health check: http://localhost:8000/health${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

python start.py