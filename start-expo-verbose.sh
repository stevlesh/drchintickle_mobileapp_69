#!/bin/bash
# Set Node version
export PATH=/Users/stevenleshinger/.nvm/versions/node/v20.18.2/bin:$PATH

# Clear any existing Metro cache
rm -rf .expo
rm -rf node_modules/.cache

echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Starting Expo..."

# Run Expo with verbose output
export DEBUG=expo:*
npm start -- --ios 2>&1 | tee expo-full-output.log