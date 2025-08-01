#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Dr. ChinTickle Expo Launcher${NC}"
echo "================================"

# Ensure we're using the correct Node version
export PATH=/Users/stevenleshinger/.nvm/versions/node/v20.18.2/bin:$PATH

echo -e "${GREEN}✅ Node version: $(node --version)${NC}"
echo -e "${GREEN}✅ NPM version: $(npm --version)${NC}"
echo -e "${GREEN}✅ Expo version: $(npx expo --version)${NC}"

echo ""
echo "Starting Expo development server..."
echo "This will open the iOS Simulator automatically."
echo ""

# Start Expo
exec npx expo start --ios --clear