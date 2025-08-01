#!/bin/bash

echo "🚀 Starting Dr. ChinTickle Dev Client Setup"
echo ""

# Check if logged into EAS
if ! eas whoami >/dev/null 2>&1; then
    echo "❌ You need to log in to EAS first"
    echo "Run: eas login"
    exit 1
fi

# Check if simulator is running
if ! pgrep -x "Simulator" > /dev/null; then
    echo "📱 Opening iOS Simulator..."
    open -a Simulator
    sleep 3
fi

# Boot iPhone 16 Pro if not already booted
if ! xcrun simctl list devices | grep -q "iPhone 16 Pro.*Booted"; then
    echo "🔄 Booting iPhone 16 Pro..."
    xcrun simctl boot "iPhone 16 Pro" 2>/dev/null || true
    sleep 2
fi

# Check if dev client is already installed
if xcrun simctl get_app_container booted com.drchintickle.app >/dev/null 2>&1; then
    echo "✅ Dev client already installed!"
else
    echo "🔨 Building dev client for simulator..."
    echo "This will take a few minutes on first run..."
    
    # Build with EAS
    eas build --platform ios --profile development-simulator --local
    
    # Find the built app
    BUILD_APP=$(find . -name "*.app" -path "*/build/*" -type d | head -1)
    
    if [ -z "$BUILD_APP" ]; then
        echo "❌ Build failed or app not found"
        exit 1
    fi
    
    echo "📲 Installing dev client to simulator..."
    xcrun simctl install booted "$BUILD_APP"
fi

# Launch the app
echo "🚀 Launching Dr. ChinTickle..."
xcrun simctl launch booted com.drchintickle.app

# Start expo
echo ""
echo "🔄 Starting Expo dev server..."
echo "The app should connect automatically!"
echo ""
npx expo start --dev-client