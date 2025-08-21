#!/bin/bash

# Dr. ChinTickle App - Quick Recovery Script
# Run this script to restore the app to its stable working state

echo "🔧 Dr. ChinTickle App Recovery Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    echo "❌ Error: Not in the Dr. ChinTickle project directory"
    echo "Please navigate to: /Users/stevenleshinger/Developer/drchintickle_mobileapp_69_fresh"
    exit 1
fi

echo "✅ Found Dr. ChinTickle project"

# Function to run command with status
run_command() {
    echo "⏳ $1..."
    eval $2
    if [ $? -eq 0 ]; then
        echo "✅ $1 completed"
    else
        echo "❌ $1 failed"
        exit 1
    fi
}

# Main recovery process
echo ""
echo "Starting recovery process..."
echo ""

# 1. Clean everything
run_command "Cleaning node_modules" "rm -rf node_modules"
run_command "Cleaning Expo cache" "rm -rf .expo"
run_command "Cleaning iOS Pods" "rm -rf ios/Pods"
run_command "Cleaning Metro cache" "rm -rf $TMPDIR/metro-*"

# 2. Restore package-lock if backup exists
if [ -f "package-lock.json.stable-backup" ]; then
    run_command "Restoring package-lock.json" "cp package-lock.json.stable-backup package-lock.json"
fi

# 3. Install dependencies
run_command "Installing npm dependencies" "npm ci"

# 4. Install iOS pods
run_command "Installing iOS Pods" "cd ios && pod install && cd .."

# 5. Verify environment
echo ""
echo "Environment Check:"
echo "=================="
node --version
npm --version
npx expo --version

# 6. Check for .env file
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  Warning: .env file not found!"
    echo "Please create .env with:"
    echo "EXPO_PUBLIC_SUPABASE_URL=your_url"
    echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key"
    echo "EXPO_PUBLIC_ASYNC_STORAGE_NAMESPACE=@drchintickle"
else
    echo "✅ .env file found"
fi

echo ""
echo "Recovery complete! 🎉"
echo ""
echo "You can now run:"
echo "  • npx expo start           (for Expo Go)"
echo "  • npx expo start --dev-client  (for dev build)"
echo "  • npx expo run:ios         (to rebuild iOS)"
echo ""
echo "Test login credentials are in your Supabase dashboard"