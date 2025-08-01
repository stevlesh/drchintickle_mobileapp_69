#!/bin/bash
cd /Users/stevenleshinger/Documents/drchintickle_mobileapp_69

# Load nvm and use correct Node version
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use

echo "✅ Using Node $(node --version)"
echo "📱 Starting Expo for iOS..."

# Start Expo with iOS flag
npx expo start --ios --clear