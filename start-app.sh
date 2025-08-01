#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20.18.2

echo "Node version: $(node --version)"
echo "Current directory: $(pwd)"

# Try with the legacy expo-cli first
/Users/stevenleshinger/.nvm/versions/node/v20.18.2/bin/expo start --ios