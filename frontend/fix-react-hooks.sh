#!/bin/bash

# React Hook Errors Fix Script
# This script resolves "Invalid hook call" errors by cleaning dependencies and ensuring single React instance

echo "🔧 React Hook Errors Fix Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the frontend directory."
    exit 1
fi

print_info "Starting React hook errors fix process..."

# Step 1: Stop any running processes
print_info "Stopping any running development servers..."
pkill -f "vite\|npm.*dev\|yarn.*dev" 2>/dev/null || true

# Step 2: Clean dependencies
print_info "Cleaning dependencies..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
print_status "Removed node_modules and lock files"

# Step 3: Clear npm cache
print_info "Clearing npm cache..."
npm cache clean --force
print_status "Cleared npm cache"

# Step 4: Check package.json configuration
print_info "Checking package.json configuration..."

# Check if overrides exist
if grep -q "overrides" package.json; then
    print_status "Found npm overrides configuration"
else
    print_warning "No overrides found in package.json"
fi

# Check for resolutions (Yarn-only)
if grep -q "resolutions" package.json; then
    print_warning "Found resolutions in package.json (Yarn-only feature)"
    print_info "Consider switching to Yarn or using overrides instead"
fi

# Step 5: Install dependencies
print_info "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 6: Verify React installation
print_info "Verifying React installation..."

if [ -d "node_modules/react" ] && [ -d "node_modules/react-dom" ]; then
    REACT_VERSION=$(node -e "console.log(require('./node_modules/react/package.json').version)")
    REACT_DOM_VERSION=$(node -e "console.log(require('./node_modules/react-dom/package.json').version)")
    
    print_status "React version: $REACT_VERSION"
    print_status "React DOM version: $REACT_DOM_VERSION"
    
    if [ "$REACT_VERSION" = "$REACT_DOM_VERSION" ]; then
        print_status "React versions match"
    else
        print_warning "React versions don't match - this may cause issues"
    fi
else
    print_error "React not properly installed"
    exit 1
fi

# Step 7: Check for duplicate React instances
print_info "Checking for duplicate React instances..."
DUPLICATE_COUNT=$(find node_modules -name "react" -type d | wc -l)

if [ "$DUPLICATE_COUNT" -gt 1 ]; then
    print_warning "Found $DUPLICATE_COUNT React instances"
    print_info "This may indicate dependency conflicts"
else
    print_status "Single React instance found"
fi

# Step 8: Check Emotion installation
print_info "Checking Emotion installation..."
if [ -d "node_modules/@emotion/react" ] && [ -d "node_modules/@emotion/styled" ]; then
    EMOTION_VERSION=$(node -e "console.log(require('./node_modules/@emotion/react/package.json').version)")
    EMOTION_STYLED_VERSION=$(node -e "console.log(require('./node_modules/@emotion/styled/package.json').version)")
    
    print_status "Emotion React version: $EMOTION_VERSION"
    print_status "Emotion Styled version: $EMOTION_STYLED_VERSION"
else
    print_error "Emotion not properly installed"
fi

# Step 9: Run diagnostic script
print_info "Running React instance diagnostic..."
if [ -f "check-react-instances.js" ]; then
    node check-react-instances.js
else
    print_warning "Diagnostic script not found"
fi

# Step 10: Test build
print_info "Testing build process..."
npm run build

if [ $? -eq 0 ]; then
    print_status "Build successful"
else
    print_warning "Build failed - check the error messages above"
fi

echo ""
print_status "React hook errors fix process completed!"
echo ""
print_info "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Check the browser console for any remaining errors"
echo "3. If issues persist, check the following:"
echo "   - Component imports (ensure they're not mixing import styles)"
echo "   - Custom hooks usage (ensure they follow React rules)"
echo "   - Conditional component rendering"
echo ""
print_info "If you still experience issues, please share the error messages from the browser console."