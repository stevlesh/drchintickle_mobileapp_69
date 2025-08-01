#!/bin/bash
cd /Users/stevenleshinger/Documents/drchintickle_mobileapp_69

# Set up Node environment
export PATH=/Users/stevenleshinger/.nvm/versions/node/v20.18.2/bin:$PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use

echo "🚀 Starting Dr. ChinTickle Expo Development Server"
echo "================================================"
echo "Node: $(node --version)"
echo "Expo: $(npx expo --version)"
echo ""

# Start Expo in interactive mode
npx expo start --localhost