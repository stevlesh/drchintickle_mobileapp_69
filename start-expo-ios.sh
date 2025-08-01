#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20.18.2
cd /Users/stevenleshinger/Documents/drchintickle_mobileapp_69
echo "Using Node version: $(node --version)"
echo "Starting Expo for iOS..."
npx expo start --ios --clear