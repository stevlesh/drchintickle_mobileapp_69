#!/bin/bash

echo "🏗️  Starting EAS Build Process"
echo "==============================="

# Build Android first (generates keystore automatically)
echo "📱 Building Android preview..."
eas build --profile preview --platform android --auto-submit-with-profile preview

# Build iOS
echo "🍎 Building iOS preview..."
eas build --profile preview --platform ios --auto-submit-with-profile preview

echo "✅ Build process initiated!"
echo "You can monitor builds at: https://expo.dev/accounts/stevlesh/projects/dr-chintickle-poc/builds"